import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createPrivateBackup, verifyLatestPrivateBackup } from './backups.js';

class MemoryBlobContainer {
  blobs = new Map();

  getBlockBlobClient(name) {
    return {
      uploadData: async (buffer, options = {}) => {
        if (options.conditions?.ifNoneMatch === '*' && this.blobs.has(name)) {
          const error = new Error('Already exists'); error.statusCode = 412; throw error;
        }
        this.blobs.set(name, Buffer.from(buffer));
      },
      uploadFile: async (file) => this.blobs.set(name, fs.readFileSync(file)),
      exists: async () => this.blobs.has(name),
      downloadToFile: async (file) => fs.writeFileSync(file, this.blobs.get(name)),
      downloadToBuffer: async () => Buffer.from(this.blobs.get(name)),
      deleteIfExists: async () => this.blobs.delete(name),
    };
  }

  async *listBlobsFlat({ prefix = '' } = {}) {
    for (const name of this.blobs.keys()) if (name.startsWith(prefix)) yield { name };
  }
}

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'steady-backup-test-'));
  const uploadsDirectory = path.join(root, 'uploads'); fs.mkdirSync(uploadsDirectory);
  const database = new DatabaseSync(path.join(root, 'fitness.sqlite'));
  for (const table of ['users', 'profiles', 'sessions', 'checkins', 'plans', 'workouts', 'measurements', 'foods', 'food_logs', 'sleep_logs', 'activity_logs', 'day_reviews']) database.exec(`CREATE TABLE ${table}(id INTEGER PRIMARY KEY, data TEXT)`);
  database.exec('CREATE TABLE uploads(id INTEGER PRIMARY KEY, filename TEXT, mime TEXT, bytes INTEGER, caption TEXT, created_at TEXT)');
  const image = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const filename = `${'a'.repeat(48)}.png`;
  fs.writeFileSync(path.join(uploadsDirectory, filename), image);
  database.prepare('INSERT INTO users(data) VALUES(?)').run('private record');
  database.prepare('INSERT INTO uploads(filename,mime,bytes,caption,created_at) VALUES(?,?,?,?,?)').run(filename, 'image/png', image.length, 'caption', '2026-09-24T12:00:00.000Z');
  return { root, database, uploadsDirectory, filename, image };
}

test('private backup stores a consistent SQLite copy and deduplicated private images, then verifies restore integrity', async () => {
  const fixture = makeFixture(); const container = new MemoryBlobContainer();
  try {
    const created = await createPrivateBackup({ database: fixture.database, uploadsDirectory: fixture.uploadsDirectory, container, now: new Date('2026-09-24T12:00:00.000Z') });
    const verified = await verifyLatestPrivateBackup({ container });
    assert.equal(created.uploadCount, 1);
    assert.equal(verified.databaseIntegrity, true);
    assert.equal(verified.uploadCount, 1);
    assert.equal(crypto.createHash('sha256').update(fixture.image).digest('hex'), [...container.blobs.keys()].find((name) => name.startsWith('objects/')).slice('objects/'.length));
    assert.equal([...container.blobs.keys()].filter((name) => name.startsWith('objects/')).length, 1);
  } finally {
    fixture.database.close(); fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('restore verification rejects a corrupted remote database snapshot', async () => {
  const fixture = makeFixture(); const container = new MemoryBlobContainer();
  try {
    await createPrivateBackup({ database: fixture.database, uploadsDirectory: fixture.uploadsDirectory, container, now: new Date('2026-09-24T12:00:00.000Z') });
    const databaseBlob = [...container.blobs.keys()].find((name) => name.endsWith('/fitness.sqlite'));
    container.blobs.set(databaseBlob, Buffer.from('corrupt'));
    await assert.rejects(verifyLatestPrivateBackup({ container }), /checksum does not match/);
  } finally {
    fixture.database.close(); fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('backup refuses a missing upload instead of producing an incomplete manifest', async () => {
  const fixture = makeFixture(); const container = new MemoryBlobContainer();
  try {
    fs.rmSync(path.join(fixture.uploadsDirectory, fixture.filename));
    await assert.rejects(createPrivateBackup({ database: fixture.database, uploadsDirectory: fixture.uploadsDirectory, container }), /uploaded image is missing/);
    assert.equal([...container.blobs.keys()].some((name) => name.endsWith('/manifest.json')), false);
  } finally {
    fixture.database.close(); fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('retention removes expired snapshots but preserves image blobs referenced by a retained snapshot', async () => {
  const fixture = makeFixture(); const container = new MemoryBlobContainer();
  try {
    const first = await createPrivateBackup({ database: fixture.database, uploadsDirectory: fixture.uploadsDirectory, container, retentionDays: 30, now: new Date('2026-01-01T12:00:00.000Z') });
    const second = await createPrivateBackup({ database: fixture.database, uploadsDirectory: fixture.uploadsDirectory, container, retentionDays: 30, now: new Date('2026-02-02T12:00:00.000Z') });
    assert.equal(container.blobs.has(`snapshots/${first.snapshotId}/manifest.json`), false);
    assert.equal(container.blobs.has(`snapshots/${first.snapshotId}/fitness.sqlite`), false);
    assert.equal(container.blobs.has(`snapshots/${second.snapshotId}/manifest.json`), true);
    assert.equal([...container.blobs.keys()].filter((name) => name.startsWith('objects/')).length, 1);
    assert.equal((await verifyLatestPrivateBackup({ container })).snapshotId, second.snapshotId);
  } finally {
    fixture.database.close(); fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});
