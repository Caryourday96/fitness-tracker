import fs from 'node:fs';

const catalog = JSON.parse(fs.readFileSync(new URL('./exercise-catalog.json', import.meta.url), 'utf8'));
const localPattern = Object.freeze({ squat: 'squat', hip_hinge: 'hinge', horizontal_press: 'push', horizontal_pull: 'pull' });
const equipmentLabels = Object.freeze({
  dumbbells: 'dumbbells', cable_stack: 'cable stack', chest_press_machine: 'chest press machine',
  adjustable_bench: 'adjustable bench', flat_bench: 'flat bench', bench_or_box: 'stable bench or box',
  resistance_bands: 'resistance bands', seated_row_machine: 'seated row machine'
});

export const exerciseCatalogAttribution = catalog.attribution;
export const exerciseCatalogSourceUrl = catalog.sourceUrl;

export function catalogAlternatives(pattern, { home = false } = {}) {
  if (home || catalog.license !== 'CC-BY-4.0') return [];
  return catalog.exercises.filter(exercise => localPattern[exercise.externalPattern] === pattern)
    .map(exercise => ({
      name: exercise.name,
      pattern,
      muscles: [exercise.primaryMuscle, ...exercise.secondaryMuscles].filter(Boolean).map(name => name.replaceAll('_', ' ')).join('/'),
      equipment: exercise.equipment.map(item => equipmentLabels[item] || item.replaceAll('_', ' ')).join(' + '),
      cue: exercise.cue,
      source: catalog.source,
      sourceId: exercise.id,
      license: exercise.license
    }));
}
