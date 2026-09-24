import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync, backup as sqliteBackup } from 'node:sqlite';

const TABLES = ['users', 'profiles', 'sessions', 'checkins', 'plans', 'workouts', 'measurements', 'foods', 'food_logs', 'sleep_logs', 'activity_logs', 'uploads', 'day_reviews'];
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const validFilename = (value) => /^[a-f0-9]{48}\.(png|jpg)$/.test(value);
const snapshotId = (date) => date.toISOString().replace(/[-:.TZ]/g, '').slice(0, 17) + '-' + crypto.randomBytes(5).toString('hex');
const manifestName = (id) => `snapshots/${id}/manifest.json`;
const databaseName = (id) => `snapshots/${id}/fitness.sqlite`;
const imageName = (sha256) => `objects/${sha256}`;

async function putIfMissing(container, name, data, contentType) {
  const blob = container.getBlockBlobClient(name);
  try {
    await blob.uploadData(data, { conditions: { ifNoneMatch: '*' }, blobHTTPHeaders: { blobContentType: contentType } });
  } catch (error) {
    if (![409, 412].includes(error.statusCode) || !(await blob.exists())) throw error;
  }
}

async function download(container, name, destination) {
  const blob = container.getBlockBlobClient(name);
  if (!(await blob.exists())) throw new Error('Backup file is missing');
  await blob.downloadToFile(destination);
  return fs.readFileSync(destination);
}

function parseManifest(text) {
  const manifest = JSON.parse(text);
  if (manifest?.version !== 1 || !/^\d{17}-[a-f0-9]{10}$/.test(manifest.snapshotId) || manifest.createdAt == null || !Array.isArray(manifest.uploads)) throw new Error('Backup manifest is invalid');
  if (manifest.database?.blobName !== databaseName(manifest.snapshotId) || !/^[a-f0-9]{64}$/.test(manifest.database.sha256)) throw new Error('Backup manifest is invalid');
  for (const image of manifest.uploads) {
    if (!validFilename(image.filename) || image.blobName !== imageName(image.sha256) || !/^[a-f0-9]{64}$/.test(image.sha256) || !['image/png', 'image/jpeg'].includes(image.mime)) throw new Error('Backup manifest is invalid');
  }
  return manifest;
}

async function manifests(container) {
  const found = [];
  for await (const item of container.listBlobsFlat({ prefix: 'snapshots/' })) {
    if (!item.name.endsWith('/manifest.json')) continue;
    const buffer = await container.getBlockBlobClient(item.name).downloadToBuffer();
    found.push(parseManifest(buffer.toString('utf8')));
  }
  return found.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createPrivateBackup({ database, uploadsDirectory, container, retentionDays = 30, now = new Date() }) {
  const id = snapshotId(now);
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'steady-backup-'));
  const databasePath = path.join(tempDirectory, 'fitness.sqlite');
  try {
    await sqliteBackup(database, databasePath);
    const snapshot = new DatabaseSync(databasePath, { readOnly: true });
    let counts;
    let uploadRows;
    try {
      const integrity = snapshot.prepare('PRAGMA integrity_check').get().integrity_check;
      if (integrity !== 'ok') throw new Error('SQLite backup integrity check failed');
      counts = Object.fromEntries(TABLES.map((table) => [table, snapshot.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count]));
      uploadRows = snapshot.prepare('SELECT filename,mime,bytes FROM uploads ORDER BY filename').all();
    } finally {
      snapshot.close();
    }

    const uploadManifest = [];
    for (const row of uploadRows) {
      if (!validFilename(row.filename)) throw new Error('An uploaded image has an invalid stored filename');
      const sourcePath = path.join(uploadsDirectory, row.filename);
      const resolved = path.resolve(sourcePath);
      if (!resolved.startsWith(path.resolve(uploadsDirectory) + path.sep) || !fs.existsSync(resolved)) throw new Error('An uploaded image is missing from the source data');
      const bytes = fs.readFileSync(resolved);
      const sha256 = digest(bytes);
      if (bytes.length !== row.bytes) throw new Error('An uploaded image size does not match its database record');
      await putIfMissing(container, imageName(sha256), bytes, row.mime);
      uploadManifest.push({ filename: row.filename, mime: row.mime, bytes: bytes.length, sha256, blobName: imageName(sha256) });
    }

    const databaseBytes = fs.readFileSync(databasePath);
    const manifest = {
      version: 1,
      snapshotId: id,
      createdAt: now.toISOString(),
      database: { blobName: databaseName(id), bytes: databaseBytes.length, sha256: digest(databaseBytes), integrity: 'ok', tables: counts },
      uploads: uploadManifest,
    };
    await container.getBlockBlobClient(manifest.database.blobName).uploadFile(databasePath, { blobHTTPHeaders: { blobContentType: 'application/vnd.sqlite3' } });
    await container.getBlockBlobClient(manifestName(id)).uploadData(Buffer.from(JSON.stringify(manifest)), { blobHTTPHeaders: { blobContentType: 'application/json' } });
    await pruneBackups(container, retentionDays, now);
    return { snapshotId: id, createdAt: manifest.createdAt, databaseBytes: databaseBytes.length, uploadCount: uploadManifest.length };
  } finally {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
}

export async function verifyLatestPrivateBackup({ container }) {
  const all = await manifests(container);
  const manifest = all[0];
  if (!manifest) throw new Error('No backup is available to verify');
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'steady-restore-check-'));
  try {
    const databasePath = path.join(tempDirectory, 'fitness.sqlite');
    const databaseBytes = await download(container, manifest.database.blobName, databasePath);
    if (databaseBytes.length !== manifest.database.bytes || digest(databaseBytes) !== manifest.database.sha256) throw new Error('Backup database checksum does not match');
    const restored = new DatabaseSync(databasePath, { readOnly: true });
    try {
      if (restored.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw new Error('Restored database integrity check failed');
      for (const table of TABLES) {
        const count = restored.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count;
        if (count !== manifest.database.tables[table]) throw new Error('Restored database record counts do not match');
      }
      const storedFiles = new Set(restored.prepare('SELECT filename FROM uploads').all().map((row) => row.filename));
      if (storedFiles.size !== manifest.uploads.length || manifest.uploads.some((file) => !storedFiles.has(file.filename))) throw new Error('Restored upload records do not match the manifest');
    } finally {
      restored.close();
    }
    for (const file of manifest.uploads) {
      const filePath = path.join(tempDirectory, file.filename);
      const bytes = await download(container, file.blobName, filePath);
      if (bytes.length !== file.bytes || digest(bytes) !== file.sha256) throw new Error('A restored image checksum does not match');
      if (file.mime === 'image/png' && !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error('A restored PNG signature is invalid');
      if (file.mime === 'image/jpeg' && !(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9)) throw new Error('A restored JPEG signature is invalid');
    }
    return { snapshotId: manifest.snapshotId, createdAt: manifest.createdAt, databaseIntegrity: true, uploadCount: manifest.uploads.length };
  } finally {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
}

async function pruneBackups(container, retentionDays, now) {
  const cutoff = now.getTime() - retentionDays * 24 * 60 * 60 * 1000;
  const all = await manifests(container);
  for (const manifest of all) {
    if (Date.parse(manifest.createdAt) >= cutoff) continue;
    await container.getBlockBlobClient(manifestName(manifest.snapshotId)).deleteIfExists();
    await container.getBlockBlobClient(manifest.database.blobName).deleteIfExists();
  }
  const retained = await manifests(container);
  const referenced = new Set(retained.flatMap((manifest) => manifest.uploads.map((file) => file.blobName)));
  for await (const blob of container.listBlobsFlat({ prefix: 'objects/' })) {
    if (!referenced.has(blob.name)) await container.getBlockBlobClient(blob.name).deleteIfExists();
  }
}
