import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const api = 'https://exercise-api.com/v1';
const approved = {
  goblet_squat: { pattern: 'squat' },
  leg_press: { pattern: 'squat' },
  hack_squat: { pattern: 'squat' },
  cable_pull_through: { pattern: 'hip_hinge' },
  dumbbell_rdl: { pattern: 'hip_hinge' },
  band_rdl: { pattern: 'hip_hinge' },
  chest_press_machine: { pattern: 'horizontal_press' },
  dumbbell_bench_press: { pattern: 'horizontal_press' },
  incline_pushup: { pattern: 'horizontal_press' },
  chest_supported_dumbbell_row: { pattern: 'horizontal_pull' },
  single_arm_dumbbell_row: { pattern: 'horizontal_pull' },
  band_seated_row: { pattern: 'horizontal_pull' },
  seated_cable_row: { pattern: 'horizontal_pull' }
};

async function getJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Catalog request failed with HTTP ${response.status}`);
  return response.json();
}

const [meta, page] = await Promise.all([
  getJson(`${api}/meta`),
  getJson(`${api}/exercises?limit=200`)
]);
if (meta.license?.data !== 'CC-BY-4.0' || !meta.license?.attribution_required) throw new Error('The API license changed; review it before importing.');
if (!Array.isArray(page.data) || page.data.length < Object.keys(approved).length) throw new Error('The exercise catalog response was incomplete.');

const exercises = Object.entries(approved).map(([id, mapping]) => {
  const item = page.data.find(candidate => candidate.id === id);
  if (!item || item.pattern !== mapping.pattern || !Array.isArray(item.equipment)) throw new Error(`Approved exercise ${id} is missing or its movement pattern changed; review before importing.`);
  return {
    id: item.id,
    name: item.name,
    externalPattern: item.pattern,
    primaryMuscle: item.primary_muscle,
    secondaryMuscles: item.secondary_muscles,
    equipment: item.equipment,
    cue: item.cues,
    license: meta.license.data,
    attribution: meta.license.attribution
  };
});

const catalog = {
  source: 'ExerciseAPI',
  sourceUrl: 'https://exercise-api.com',
  apiVersion: meta.api_version,
  datasetVersion: meta.dataset_version,
  license: meta.license.data,
  attribution: meta.license.attribution,
  retrievedAt: new Date().toISOString().slice(0, 10),
  note: 'Exercise catalog metadata only. Local programming, movement mappings, equipment filtering, and safety rules remain authoritative.',
  exercises
};
await fs.writeFile(path.join(root, 'exercise-catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Saved ${exercises.length} reviewed exercise records from ${catalog.source} dataset ${catalog.datasetVersion}.`);
