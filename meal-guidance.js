const defaults={breakfast:'08:00',lunch:'12:30',snack:'15:30',dinner:'18:30'};
const timeKey={breakfast:'mealTimeBreakfast',lunch:'mealTimeLunch',snack:'mealTimeSnack',dinner:'mealTimeDinner'};
const patterns={
  breakfast:[['Protein','protein'],['Carbohydrates','carbohydrate'],['Fruit','fruit']],
  lunch:[['Protein','protein'],['Vegetables','vegetable'],['Carbohydrates','carbohydrate']],
  snack:[['Fruit','fruit'],['Protein','protein']],
  dinner:[['Protein','protein'],['Vegetables','vegetable'],['Carbohydrates','carbohydrate']]
};
export function mealTimes(profile){return Object.fromEntries(Object.entries(timeKey).map(([meal,key])=>[meal,profile[key]||defaults[meal]]));}
export function validMealSettings(profile){return Object.entries(timeKey).every(([,key])=>profile[key]==null||/^([01]\d|2[0-3]):[0-5]\d$/.test(profile[key]))&&String(profile.allergies||'').length<=1000&&String(profile.dietaryRestrictions||'').length<=1000&&String(profile.workoutTime||'').length<=80;}
export function suggestMeals(profile,foods){
  const times=mealTimes(profile),reviewNeeded=!!(String(profile.allergies||'').trim()||String(profile.dietaryRestrictions||'').trim());
  const eligible=foods.filter(f=>f.available!==0&&f.preference!=='avoid'&&f.preference!=='limited');
  const pick=(category,used)=>eligible.find(f=>f.category===category&&!used.has(f.id));
  const missing=new Set();
  const meals=Object.entries(patterns).map(([meal,parts])=>{
    const used=new Set(),items=[];
    for(const [category] of parts){const food=pick(category,used);if(food){items.push(food.name);used.add(food.id)}else missing.add(category)}
    const workoutTime=/^([01]\d|2[0-3]):[0-5]\d$/.test(profile.workoutTime||'')?profile.workoutTime:null;
    const workoutPlacement=workoutTime?(times[meal]<workoutTime?'Before your usual workout':'After your usual workout'):'';
    return {meal,time:times[meal],items,workoutPlacement,portionNote:meal==='snack'?'Choose a comfortable snack portion.':'Build a comfortable plate; adjust portions to your appetite and any clinician guidance.'};
  });
  return {meals:reviewNeeded?[]:meals,missing:[...missing],reviewNeeded,note:reviewNeeded?'Review your allergies and dietary restrictions before using automatic suggestions. Your saved food inventory does not yet identify allergens.':'Suggestions use foods marked available in your inventory. They are a plan, not food you have eaten; log meals only after eating.'};
}
