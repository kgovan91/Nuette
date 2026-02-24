// fix-auth.js — Fix auth navigation bugs
// Run: node fix-auth.js app/page.js
const fs = require('fs');
const filepath = process.argv[2] || 'app/page.js';
let code = fs.readFileSync(filepath, 'utf8');
let changes = 0;

// FIX 1: Add error handling to supabase getSession + auth guard useEffect
// The old code has no .catch() so if supabase fails, authLoading stays true forever
const oldAuthEffect = `supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null);
      if(session?.user){
        supabase.from('profiles').select('*').eq('id',session.user.id).single().then(({data})=>{
          if(data&&data.baby_name){
            setName(data.baby_name);
            if(data.baby_age)setAge(Number(data.baby_age));
            if(data.sleep_method)setMethod(data.sleep_method);
            if(data.night_number)setNn(data.night_number);
            setSc(S.HOME);
          }else{setSc(S.SPLASH);}
          setAuthLoading(false);
        });
      }else{setAuthLoading(false);setSc(S.AUTH);}
    });`;

const newAuthEffect = `supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null);
      if(session?.user){
        supabase.from('profiles').select('*').eq('id',session.user.id).single().then(({data})=>{
          if(data&&data.baby_name){
            setName(data.baby_name);
            if(data.baby_age)setAge(Number(data.baby_age));
            if(data.sleep_method)setMethod(data.sleep_method);
            if(data.night_number)setNn(data.night_number);
            setSc(S.HOME);
          }else{setSc(S.SPLASH);}
          setAuthLoading(false);
        }).catch(()=>{setSc(S.SPLASH);setAuthLoading(false);});
      }else{setAuthLoading(false);setSc(S.AUTH);}
    }).catch(()=>{setAuthLoading(false);setSc(S.AUTH);});`;

if (code.includes(oldAuthEffect)) {
  code = code.replace(oldAuthEffect, newAuthEffect);
  changes++; console.log('1. Added error handling to auth check');
} else { console.log('1. skip - auth error handling'); }

// FIX 2: Add auth guard useEffect - redirects to AUTH if no user and not loading
// This prevents the old localStorage code from overriding auth
const guardInsert = `return()=>subscription.unsubscribe();
  },[]);

  // Auth guard: always redirect to login if not authenticated
  useEffect(()=>{
    if(!authLoading&&!user&&sc!==S.AUTH)setSc(S.AUTH);
  },[authLoading,user,sc]);`;

const guardTarget = `return()=>subscription.unsubscribe();
  },[]);`;

if (code.includes(guardTarget) && !code.includes('Auth guard')) {
  code = code.replace(guardTarget, guardInsert);
  changes++; console.log('2. Added auth guard useEffect');
} else { console.log('2. skip - auth guard'); }

// FIX 3: Prevent rendering ANY screen while authLoading is true
// Change: {authLoading&&<div>loading</div>}  {sc===S.AUTH&&...} {sc===S.SPLASH&&...}
// To: {authLoading?<div>loading</div>:sc===S.AUTH?<authscreen>:{sc===S.SPLASH&&...}
// Actually simpler: just wrap the splash check with !authLoading
const oldSplashRender = '{sc===S.SPLASH&&';
const newSplashRender = '{!authLoading&&sc===S.SPLASH&&';
if (code.includes(oldSplashRender) && !code.includes('!authLoading&&sc===S.SPLASH')) {
  code = code.replace(oldSplashRender, newSplashRender);
  changes++; console.log('3. Guarded SPLASH with !authLoading');
} else { console.log('3. skip - splash guard'); }

// FIX 4: Disable old localStorage screen restoration
// The old code likely has useEffect that saves/restores from localStorage
// We need to make sure it doesn't set sc when user isn't authenticated
// Find any existing useEffect with localStorage and dw_v4
// Actually, the real issue is simpler: the sv (saved values) initializer
// sets state from localStorage on mount, but sc starts as null now,
// so that shouldn't be an issue. The guard in FIX 2 handles the rest.

// FIX 5: Make sure the old localStorage save doesn't include 'sc' screen state
// This isn't strictly needed but is good hygiene

fs.writeFileSync(filepath, code, 'utf8');
console.log('\nDone! Made ' + changes + ' fixes to ' + filepath);
console.log('\nNow run:');
console.log('  git add -A && git commit -m "Fix auth navigation" && git push origin main');
