import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import catalog from './exercise-catalog.json' with { type: 'json' };
import { catalogAlternatives, exerciseCatalogAttribution, exerciseCatalogSourceUrl } from './exercise-catalog.js';

test('exercise catalog snapshot has source, version, and CC BY attribution',()=>{
  assert.equal(catalog.source,'ExerciseAPI');
  assert.match(catalog.datasetVersion,/^\d+\.\d+\.\d+$/);
  assert.equal(catalog.license,'CC-BY-4.0');
  assert.match(catalog.attribution,/CC BY 4\.0/);
  assert.equal(exerciseCatalogAttribution,catalog.attribution);
  assert.equal(exerciseCatalogSourceUrl,'https://exercise-api.com');
});

test('catalog options retain exact supported movement mappings and equipment',()=>{
  const expected={squat:'goblet_squat',hinge:'cable_pull_through',push:'chest_press_machine',pull:'chest_supported_dumbbell_row'};
  for(const [pattern,id] of Object.entries(expected)){
    const options=catalogAlternatives(pattern);
    assert.ok(options.some(option=>option.sourceId===id));
    assert.ok(options.every(option=>option.pattern===pattern&&option.source==='ExerciseAPI'&&option.license==='CC-BY-4.0'&&option.equipment&&option.cue));
  }
  assert.deepEqual(catalogAlternatives('vertical_press'),[]);
  assert.deepEqual(catalogAlternatives('pull',{home:true}),[]);
});

test('catalog refresh is a fixed public-data import and contains no account identifiers',()=>{
  const script=fs.readFileSync(new URL('./scripts/sync-exercise-catalog.js',import.meta.url),'utf8');
  assert.match(script,/exercise-api\.com\/v1/);
  assert.match(script,/const approved =/);
  assert.doesNotMatch(script,/profile|workoutHistory|screenshot|sessionToken/i);
});
