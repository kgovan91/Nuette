#!/usr/bin/env python3
"""Patch Dreamwell page.js to add Supabase authentication"""
import sys

filepath = sys.argv[1] if len(sys.argv) > 1 else 'app/page.js'
with open(filepath, 'r') as f:
    code = f.read()

changes = 0

# 1. Add supabase import after React import
old_import = "import { useState, useEffect, useRef } from \"react\";"
new_import = """import { useState, useEffect, useRef } from "react";
import { supabase } from '../lib/supabase';"""
if old_import in code and 'supabase' not in code:
    code = code.replace(old_import, new_import)
    changes += 1
    print("✅ 1. Added supabase import")
else:
    print("⏭️  1. Supabase import already exists or not found")

# 2. Add AUTH screen to constants
old_screens = 'LOG:"log" };'
new_screens = 'LOG:"log", AUTH:"auth" };'
if old_screens in code and 'AUTH' not in code:
    code = code.replace(old_screens, new_screens)
    changes += 1
    print("✅ 2. Added AUTH screen")
else:
    print("⏭️  2. AUTH screen already exists or not found")

# 3. Add auth state variables after existing useState declarations
# Find the last useState line to insert after
old_state_marker = 'const[rating,setRating]=useState(null);'
new_state = """const[rating,setRating]=useState(null);
  const[user,setUser]=useState(null);
  const[authLoading,setAuthLoading]=useState(true);
  const[authMode,setAuthMode]=useState("login");
  const[authEmail,setAuthEmail]=useState("");
  const[authPw,setAuthPw]=useState("");
  const[authError,setAuthError]=useState("");
  const[authSubmitting,setAuthSubmitting]=useState(false);"""
if old_state_marker in code and 'authLoading' not in code:
    code = code.replace(old_state_marker, new_state)
    changes += 1
    print("✅ 3. Added auth state variables")
else:
    print("⏭️  3. Auth state already exists or not found")

# 4. Add auth useEffect - insert after the existing useEffect that handles localStorage
# We'll add it before the first "const ww=" line
old_ww = '  const ww=WW[Math.min(Math.max(age,4),12)];'
auth_effect = """  // Auth: check session on mount
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null);
      if(session?.user){
        supabase.from('profiles').select('*').eq('id',session.user.id).single().then(({data})=>{
          if(data){
            if(data.baby_name)setName(data.baby_name);
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

  const ww=WW[Math.min(Math.max(age,4),12)];"""
if old_ww in code and 'handleAuth' not in code:
    code = code.replace(old_ww, auth_effect)
    changes += 1
    print("✅ 4. Added auth useEffect and functions")
else:
    print("⏭️  4. Auth effect already exists or not found")

# 5. Change initial screen from SPLASH to null (let auth check decide)
old_init = 'const[sc,setSc]=useState(S.SPLASH);'
new_init = 'const[sc,setSc]=useState(null);'
if old_init in code:
    code = code.replace(old_init, new_init)
    changes += 1
    print("✅ 5. Changed initial screen to null (auth decides)")
else:
    print("⏭️  5. Initial screen already changed or not found")

# 6. Add saveProfile call when onboarding completes (when transitioning to HOME/NIGHT)
# Look for where setSc(S.HOME) or setSc(S.NIGHT) is called after method selection
old_activate = 'setSc(S.ACTIVATING)'
new_activate = 'saveProfile();setSc(S.ACTIVATING)'
if old_activate in code and 'saveProfile();setSc(S.ACTIVATING)' not in code:
    code = code.replace(old_activate, new_activate, 1)
    changes += 1
    print("✅ 6. Added saveProfile on activation")
else:
    print("⏭️  6. saveProfile already added or not found")

# 7. Add the AUTH screen render - insert before the SPLASH screen render
# Find "sc===S.SPLASH" to insert before it
old_splash_check = '{sc===S.SPLASH&&'
auth_screen = """{authLoading&&<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0D1117"}}><CrescentMoon size={64} glow animate/></div>}
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
    {sc===S.SPLASH&&"""
if old_splash_check in code and "sc===S.AUTH" not in code:
    code = code.replace(old_splash_check, auth_screen)
    changes += 1
    print("✅ 7. Added AUTH screen UI")
else:
    print("⏭️  7. AUTH screen already exists or not found")

# 8. Add sign-out button to Nav (small profile icon)
old_nav_div = '<div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,'
new_nav_div = '<div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,'
# Instead of modifying Nav, let's add a small logout option to the Home screen
# We'll add a small icon at the top of the app that shows when logged in
# Actually let's add it as a floating button. Let me find a good place...
# Let's add a small user icon in the top-right that opens a mini menu

# 9. Add floating profile button at the top of main screens
# Find the Nav component end to add a floating button
old_nav_end = 'const CSS=`'
profile_button = """const ProfileBtn=()=>user?(
    <button onClick={handleSignOut} style={{position:"fixed",top:12,right:12,zIndex:200,width:36,height:36,borderRadius:"50%",background:"rgba(201,169,110,0.15)",border:"1px solid rgba(201,169,110,0.2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#C9A96E",fontSize:14,fontFamily:"'DM Sans',sans-serif"}} title="Sign out">{authEmail?authEmail[0].toUpperCase():"U"}</button>
  ):null;

  const CSS=`"""
if old_nav_end in code and 'ProfileBtn' not in code:
    code = code.replace(old_nav_end, profile_button, 1)
    changes += 1
    print("✅ 8. Added profile/logout button")
else:
    print("⏭️  8. Profile button already exists or not found")

# 10. Render ProfileBtn in main screens - add after <style>{CSS}</style>
old_style = '{CSS}</style>'
new_style = '{CSS}</style><ProfileBtn/>'
if old_style in code and '<ProfileBtn/>' not in code:
    code = code.replace(old_style, new_style, 1)
    changes += 1
    print("✅ 9. Rendering ProfileBtn")
else:
    print("⏭️  9. ProfileBtn render already exists or not found")

# Write the file
with open(filepath, 'w') as f:
    f.write(code)

print(f"\n🎉 Done! Made {changes} changes to {filepath}")
if changes == 0:
    print("⚠️  No changes were made — the file may already be patched or the structure differs.")
    print("   You may need to apply changes manually.")
