import {test,expect} from '@playwright/test';import fs from 'node:fs';import path from 'node:path';
test('recent snack fills editable form without automatically logging',async({page})=>{
 const root=process.env.FITNESS_PUBLIC_ROOT||path.resolve(import.meta.dirname,'../../public');
 const state={day:'2026-10-05',profile:{onboardingComplete:true,timezone:'America/Toronto',units:'lb',preferredDays:[],schedule:3},foods:[],measures:[],foodLogs:[],activities:[],exerciseProfiles:[],workoutHistory:[]};let writes=0;
 await page.setViewportSize({width:390,height:844});
 await page.route('**/tracker-food',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(root,'index.html'),'utf8')}));
 await page.route('**/static/**',r=>{const name=new URL(r.request().url()).pathname.split('/').pop()!,file=path.join(root,name);return fs.existsSync(file)?r.fulfill({contentType:name.endsWith('.css')?'text/css':name.endsWith('.svg')?'image/svg+xml':'text/javascript',body:fs.readFileSync(file)}):r.abort()});
 await page.route('**/api/**',r=>{
  const url=new URL(r.request().url());
  if(url.pathname==='/api/recent-foods')return r.fulfill({json:[{meal:'snack',item:'Yogurt and banana with oats',portion:'one bowl'}]});
  if(r.request().method()==='POST'){expect(url.pathname).toBe('/api/food-log');expect(r.request().postDataJSON()).toMatchObject({day:'2026-10-05',meal:'snack',item:'Yogurt and banana with oats',portion:'half bowl'});writes++}
  return r.fulfill({json:url.pathname==='/api/me'?state:{}});
 });
 await page.goto('/tracker-food');const recent=page.locator('.recent-foods');await expect(recent.getByRole('button')).toHaveCount(1);expect(writes).toBe(0);
 await recent.getByRole('button').click();const form=page.locator('#foodLog');await expect(form.getByLabel('Portion or preparation')).toHaveValue('one bowl');expect(writes).toBe(0);
 await form.getByLabel('Portion or preparation').fill('half bowl');await form.getByRole('button',{name:'Log food',exact:true}).click();await expect.poll(()=>writes).toBe(1);
 for(const width of [390,320]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
});
