// Patch Dreamwell page.js to add Supabase authentication
const fs = require('fs');
const filepath = process.argv[2] || 'app/page.js';
let code = fs.readFileSync(filepath, 'utf8');
let changes = 0;

// 1. Add supabase import
const oldImport = 'import { useState, useEffect, useRef } from "react";';
const newImport = 'import { useState, useEffect, useRef } from "react";\nimport { supabase } from \'../lib/supabase\';';
if (code.includes(oldImport) && !code.includes('supabase')) {
  code = code.replace(oldImport, newImport);
  changes++; console.log('1. Added supabase import');
} else { console.log('1. skip - supabase import'); }

// 2. Add AUTH screen
const oldScreens = 'LOG:"log" };';
const newScreens = 'LOG:"log", AUTH:"auth" };';
if (code.includes(oldScreens) && !code.includes('AUTH')) {
  code = code.replace(oldScreens, newScreens);
  changes++; console.log('2. Added AUTH screen');
} else { console.log('2. skip - AUTH screen'); }

// 3. Add auth state variables
const oldState = 'const[rating,setRating]=useState(null);';
const newState = `const[rating,setRating]=useState(null);
  const[user,setUser]=useState(null);
  const[authLoading,setAuthLoading]=useState(true);
  const[authMode,setAuthMode]=useState("login");
  const[authEmail,setAuthEmail]=useState("");
  const[authPw,setAuthPw]=useState("");
  const[authError,setAuthError]=useState("");
  const[authSubmitting,setAuthSubmitting]=useState(false);`;
if (code.includes(oldState) && !code.includes('authLoading')) {
  code = code.replace(oldState, newState);
  changes++; console.log('3. Added auth state variables');
} else { console.log('3. skip - auth state'); }

// 4. Add auth useEffect and functions
const oldWw = '  const ww=WW[Math.min(Math.max(age,4),12)];';
const authEffect = `  // Auth: check session on mount
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
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
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user||null);
    });
    return()=>subscription.unsubscribe();
  },[]);

  const handleAuth=async()=>{
    setAuthError("");setAuthSubmitting(true);
    try{
      if(authMode==="signup"){
        const{error}=await supabase.auth.signUp({email:authEmail,password:authPw});
        if(error)throw error;
        const{data:{session}}=await supabase.auth.getSession();
        if(session){setUser(session.user);setSc(S.SPLASH);}
        else{setAuthError("Check your email to confirm your account!");setAuthSubmitting(false);return;}
      }else{
        const{data,error}=await supabase.auth.signInWithPassword({email:authEmail,password:authPw});
        if(error)throw error;
        setUser(data.user);
        const{data:profile}=await supabase.from('profiles').select('*').eq('id',data.user.id).single();
        if(profile&&profile.baby_name){
          setName(profile.baby_name);setAge(Number(profile.baby_age));
          setMethod(profile.sleep_method);setNn(profile.night_number||1);
          setSc(S.HOME);
        }else{setSc(S.SPLASH);}
      }
    }catch(e){setAuthError(e.message);}
    setAuthSubmitting(false);
  };

  const handleSignOut=async()=>{
    await supabase.auth.signOut();
    setUser(null);setSc(S.AUTH);
    setName("");setAge(6);setMethod(null);setNn(1);
    setDmsgs([]);setNmsgs([]);setNapmsg([]);
  };

  const saveProfile=async()=>{
    if(!user)return;
    await supabase.from('profiles').upsert({
      id:user.id,baby_name:name,baby_age:String(age),
      sleep_method:method,night_number:nn
    });
  };

  const ww=WW[Math.min(Math.max(age,4),12)];`;
if (code.includes(oldWw) && !code.includes('handleAuth')) {
  code = code.replace(oldWw, authEffect);
  changes++; console.log('4. Added auth useEffect and functions');
} else { console.log('4. skip - auth effect'); }

// 5. Change initial screen from SPLASH to null
const oldInit = 'const[sc,setSc]=useState(S.SPLASH);';
const newInit = 'const[sc,setSc]=useState(null);';
if (code.includes(oldInit)) {
  code = code.replace(oldInit, newInit);
  changes++; console.log('5. Changed initial screen to null');
} else { console.log('5. skip - initial screen'); }

// 6. Add saveProfile call on activation
const oldActivate = '()=>setSc(S.ACTIVATING)';
const newActivate = '()=>{saveProfile();setSc(S.ACTIVATING)}';
if (code.includes(oldActivate) && !code.includes('saveProfile()')) {
  code = code.replace(oldActivate, newActivate);
  changes++; console.log('6. Added saveProfile on activation');
} else { console.log('6. skip - saveProfile'); }

// 7. Add AUTH screen UI before SPLASH screen
const oldSplash = '{sc===S.SPLASH&&';
const authScreen = `{authLoading&&<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0D1117"}}><CrescentMoon size={64} glow animate/></div>}
    {sc===S.AUTH&&<div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0D1117,#1a1f2e)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:360,textAlign:"center"}}>
        <CrescentMoon size={80} glow animate/>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:42,color:"#EDE8DF",fontWeight:300,margin:"24px 0 4px",letterSpacing:1}}>Dreamwell</h1>
        <p style={{color:"#C9A96E",fontSize:14,marginBottom:40,letterSpacing:0.5}}>Your 24/7 Baby Sleep Coach</p>
        <div style={{display:"flex",background:"rgba(255,255,255,0.06)",borderRadius:12,padding:3,marginBottom:28}}>
          <button onClick={()=>{setAuthMode("login");setAuthError("");}} style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,background:authMode==="login"?"rgba(201,169,110,0.2)":"transparent",color:authMode==="login"?"#C9A96E":"#8a8070",transition:"all .2s"}}>Sign In</button>
          <button onClick={()=>{setAuthMode("signup");setAuthError("");}} style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,background:authMode==="signup"?"rgba(201,169,110,0.2)":"transparent",color:authMode==="signup"?"#C9A96E":"#8a8070",transition:"all .2s"}}>Create Account</button>
        </div>
        <input type="email" placeholder="Email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} style={{width:"100%",padding:"14px 16px",marginBottom:12,borderRadius:12,border:"1px solid rgba(201,169,110,0.2)",background:"rgba(255,255,255,0.04)",color:"#EDE8DF",fontSize:15,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"}}/>
        <input type="password" placeholder="Password" value={authPw} onChange={e=>setAuthPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAuth()} style={{width:"100%",padding:"14px 16px",marginBottom:8,borderRadius:12,border:"1px solid rgba(201,169,110,0.2)",background:"rgba(255,255,255,0.04)",color:"#EDE8DF",fontSize:15,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"}}/>
        {authError&&<p style={{color:authError.includes("Check your email")?"#C9A96E":"#e87c7c",fontSize:13,margin:"8px 0",lineHeight:1.4}}>{authError}</p>}
        <button onClick={handleAuth} disabled={authSubmitting||!authEmail||!authPw} style={{width:"100%",padding:"15px 0",marginTop:16,borderRadius:12,border:"none",cursor:authSubmitting?"not-allowed":"pointer",background:authSubmitting?"rgba(201,169,110,0.3)":"linear-gradient(135deg,#C9A96E,#E8C98A)",color:"#0D1117",fontSize:16,fontWeight:600,fontFamily:"'DM Sans',sans-serif",letterSpacing:0.5,transition:"all .2s"}}>{authSubmitting?"...":(authMode==="signup"?"Create Account":"Sign In")}</button>
        {authMode==="signup"&&<p style={{color:"#8a8070",fontSize:12,marginTop:16,lineHeight:1.5}}>Password must be at least 6 characters</p>}
      </div>
    </div>}
    {sc===S.SPLASH&&`;
if (code.includes(oldSplash) && !code.includes('sc===S.AUTH')) {
  code = code.replace(oldSplash, authScreen);
  changes++; console.log('7. Added AUTH screen UI');
} else { console.log('7. skip - AUTH screen UI'); }

// 8. Add profile button component
const oldCSS = 'const CSS=`';
const profileBtn = `const ProfileBtn=()=>user?(
    <button onClick={handleSignOut} style={{position:"fixed",top:12,right:12,zIndex:200,width:36,height:36,borderRadius:"50%",background:"rgba(201,169,110,0.15)",border:"1px solid rgba(201,169,110,0.2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#C9A96E",fontSize:14,fontFamily:"'DM Sans',sans-serif"}} title="Sign out">{authEmail?authEmail[0].toUpperCase():"U"}</button>
  ):null;

  const CSS=\``;
if (code.includes(oldCSS) && !code.includes('ProfileBtn')) {
  code = code.replace(oldCSS, profileBtn);
  changes++; console.log('8. Added profile/logout button');
} else { console.log('8. skip - ProfileBtn'); }

// 9. Render ProfileBtn
const oldStyle = '{CSS}</style>';
const newStyle = '{CSS}</style><ProfileBtn/>';
if (code.includes(oldStyle) && !code.includes('<ProfileBtn/>')) {
  code = code.replace(oldStyle, newStyle);
  changes++; console.log('9. Rendering ProfileBtn');
} else { console.log('9. skip - ProfileBtn render'); }

fs.writeFileSync(filepath, code, 'utf8');
console.log('\nDone! Made ' + changes + ' changes to ' + filepath);
