import test from 'node:test';
import assert from 'node:assert/strict';
import { suggestMeals } from './meal-guidance.js';
const foods=[{id:1,name:'Chicken',category:'Protein',available:1},{id:2,name:'Egg whites',category:'Protein',available:1},{id:3,name:'Yogurt',category:'Protein',available:1},{id:4,name:'Oats',category:'Carbohydrates',available:1},{id:5,name:'Sweet potato',category:'Carbohydrates',available:1},{id:6,name:'Banana',category:'Fruit',available:1},{id:7,name:'Vegetables',category:'Vegetables',available:1}];
test('meal rotation is deterministic by local calendar day and varies the available proteins',()=>{
 const week=Array.from({length:7},(_,i)=>suggestMeals({},foods,'2026-10-0'+(i+1)));
 assert.ok(new Set(week.map(d=>d.meals[0].items[0])).size>1);
 assert.deepEqual(week[0],suggestMeals({},[...foods].reverse(),'2026-10-01'));
 assert.notDeepEqual(week[0].meals[0].items,week[0].meals[1].items);
 assert.equal(foods.length,7);
});
test('rotation never uses avoided, limited or unavailable foods and pauses for disclosures',()=>{
 const blocked=foods.map(f=>({...f,preference:'avoid'}));assert.equal(suggestMeals({},blocked,'2026-10-01').meals[0].items.length,0);
 assert.equal(suggestMeals({},foods.map(f=>({...f,available:0})),'2026-10-01').meals[0].items.length,0);
 assert.equal(suggestMeals({allergies:'Review required'},foods,'2026-10-01').meals.length,0);
 assert.equal(suggestMeals({dietaryRestrictions:'Review required'},foods,'2026-10-01').reviewNeeded,true);
});
