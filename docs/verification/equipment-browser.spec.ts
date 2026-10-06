import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
test('create equipment during a workout preserves typed and completed sets',async({page})=>{
 const root=process.env.FITNESS_PUBLIC_ROOT||path.resolve(import.meta.dirname,'../../public');
 const state:any={day:'2026-10-05',profile:{onboardingComplete:true,timezone:'America/Toronto',units:'lb',preferredDays:[1,3,5],schedule:3},check:{energy:'high'},foods:[],measures:[],workoutHistory:[],exerciseProfiles:[],foodLogs:[],activities:[],plan:{kind:'strength',title:'Saved plan',reason:'Saved plan',safety:'Comfortable effort',status:'active',exercises:[{name:'Seated row',pattern:'pull',sets:3,reps:'8–12',rest:'90 sec',muscles:'back'}]},workout:{status:'active',version:'v1',exercises:[{name:'Seated row',pattern:'pull',slot:0,sets:[{id:'existing',weight:10,reps:10,unit:'lb',done:true}]}]}};
 let attempts=0,workoutWrites=0;
 await page.setViewportSize({width:390,height:844});
 await page.route('**/tracker-equipment',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(root,'index.html'),'utf8')}));
 await page.route('**/static/**',r=>{const name=new URL(r.request().url()).pathname.split('/').pop()!,file=path.join(root,name);return fs.existsSync(file)?r.fulfill({contentType:name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':'text/javascript',body:fs.readFileSync(file)}):r.abort()});
 await page.route('**/api/**',r=>{
  const url=new URL(r.request().url());
  if(url.pathname==='/api/exercise-profiles'){
   attempts++;expect(r.request().postDataJSON().exerciseName).toBe('Seated row');
   if(attempts===1)return r.fulfill({status:409,json:{error:'Equipment already exists'}});
   return r.fulfill({status:201,json:{id:42}});
  }
  if(url.pathname==='/api/workout'){
   workoutWrites++;const body=r.request().postDataJSON();
   expect(body.data.exercises[0].sets[0]).toEqual(state.workout.exercises[0].sets[0]);
   expect(body.data.exercises[0].sets[1]).toMatchObject({equipmentProfileId:42,weight:'25',reps:'8'});
   state.workout={...body.data,status:body.status,version:'v2'};
  }
  return r.fulfill({json:url.pathname==='/api/me'?state:{}});
 });
 await page.goto('/tracker-equipment');
 const exercise=page.locator('#view-today .exercise[data-exercise-slot]').first();
 await exercise.locator('[data-field="weight"]').fill('25');await exercise.locator('[data-field="reps"]').fill('8');
 await exercise.getByText('Add equipment for this exercise',{exact:true}).click();
 await exercise.getByLabel('Equipment name',{exact:true}).fill('Cable row');
 await exercise.getByRole('button',{name:'Save and select equipment'}).click();
 await expect(exercise.getByRole('status')).toContainText('Equipment already exists');
 await expect(exercise.getByLabel('Equipment name',{exact:true})).toHaveValue('Cable row');
 await exercise.getByRole('button',{name:'Save and select equipment'}).click();
 await expect(exercise.getByLabel('Equipment for Seated row',{exact:true})).toHaveValue('42');
 await expect(exercise.locator('[data-field="weight"]')).toHaveValue('25');expect(workoutWrites).toBe(0);
 await exercise.locator('[data-save]').click();await expect.poll(()=>workoutWrites).toBe(1);
 for(const width of [390,320]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
});
