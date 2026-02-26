'use client';

import { useState, useEffect, useRef } from "react";
import { supabase } from '../lib/supabase';

function CrescentMoon({ size = 48, glow = true, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={animate ? { animation: "breathe 4s ease-in-out infinite" } : {}}>
      <defs>
        <radialGradient id="mg" cx="30%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#FDF0D5" />
          <stop offset="100%" stopColor="#C9A96E" />
        </radialGradient>
        {glow && (
          <filter id="mgf">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
        <clipPath id="mc"><circle cx="58" cy="62" r="44" /></clipPath>
      </defs>
      <circle cx="58" cy="62" r="44" fill="url(#mg)" filter={glow ? "url(#mgf)" : ""} />
      <circle cx="80" cy="50" r="38" fill="#0D1117" clipPath="url(#mc)" />
      <circle cx="78" cy="74" r="2.5" fill="#F5E6C8" opacity="0.9" />
      <circle cx="90" cy="60" r="1.5" fill="#F5E6C8" opacity="0.7" />
      <circle cx="85" cy="84" r="1.5" fill="#F5E6C8" opacity="0.55" />
      <g transform="translate(82,20) scale(0.62)">
        <polygon points="8,0 10,6 16,6 11,9 13,15 8,11 3,15 5,9 0,6 6,6" fill="#F5E6C8" opacity="0.95" />
      </g>
    </svg>
  );
}

const S = { LANDING:"landing", SPLASH:"splash", ON1:"on1", ON2:"on2", ON3:"on3", BABY:"baby", PED:"ped", INTAKE:"intake", DIAG:"diag", METHOD:"method", BRIEF:"brief", PRELAUNCH:"prelaunch", ACTIVATING:"activating", NIGHT:"night", NIGHTSUMMARY:"nightsummary", HOME:"home", NAP:"nap", CHAT:"chat", PLAN:"plan", LOG:"log", AUTH:"auth" };

const WW = {
  4:{naps:4,window:"1h–1h15m",night:"10–11h"}, 5:{naps:3,window:"1h15m–1h45m",night:"10–11h"},
  6:{naps:3,window:"2h–2h15m",night:"11h"}, 7:{naps:3,window:"2h15m–2h30m",night:"11h"},
  8:{naps:2,window:"2h30m–3h",night:"11–12h"}, 9:{naps:2,window:"2h45m–3h15m",night:"11–12h"},
  10:{naps:2,window:"3h–3h30m",night:"11–12h"}, 11:{naps:2,window:"3h–3h30m",night:"11–12h"},
  12:{naps:1,window:"3h30m–4h",night:"11–12h"},
};

const METHODS = [
  {id:"ferber",name:"Ferber Method",sub:"Graduated Extinction",desc:"Timed check-ins with gradually increasing intervals. Effective, structured, and trusted by millions of parents.",time:"3–7 days",cry:"Moderate",color:"#C9A96E"},
  {id:"cio",name:"Cry It Out",sub:"Full Extinction",desc:"Place baby down awake and allow self-soothing without intervention. Fastest results for determined parents.",time:"2–5 days",cry:"More",color:"#A78BFA"},
  {id:"chair",name:"Chair Method",sub:"Sleep Lady Shuffle",desc:"Gradual physical withdrawal over two weeks. You stay present but slowly reduce involvement.",time:"2–3 weeks",cry:"Less",color:"#6EE7B7"},
  {id:"fading",name:"Fading Method",sub:"Gradual Extinction",desc:"Slowly reduce parental presence and support over time. Gentle and flexible.",time:"1–3 weeks",cry:"Minimal",color:"#FCA5A5"},
  {id:"nocry",name:"No-Cry Method",sub:"Pantley Method",desc:"Fully attachment-friendly. Gentle associations and slow transitions. No crying involved.",time:"4–8 weeks",cry:"None",color:"#93C5FD"},
];

const IQ = [
  {id:"sleepMethod",multi:true,freeText:false,q:"How do you currently put {n} to sleep?",sub:"Select all that apply",opts:[{id:"rocking",label:"Rocking or bouncing",icon:"🤱"},{id:"feeding",label:"Feeding to sleep",icon:"🍼"},{id:"holding",label:"Holding until asleep",icon:"🫂"},{id:"paci",label:"Pacifier dependent",icon:"🧸"},{id:"cosleeping",label:"Co-sleeping",icon:"🛏️"},{id:"selfsettle",label:"Falls asleep independently",icon:"✨"}]},
  {id:"wakeups",multi:false,freeText:false,q:"How many times does {n} wake at night?",sub:"On a typical night",opts:[{id:"0",label:"Rarely or never",icon:"😴"},{id:"1-2",label:"1–2 times",icon:"🌙"},{id:"3-4",label:"3–4 times",icon:"😔"},{id:"5+",label:"5+ times",icon:"😩"}]},
  {id:"wakeupPattern",multi:false,freeText:false,q:"Are the wake-ups at consistent times?",sub:"This helps identify hunger vs. habit",opts:[{id:"consistent",label:"Yes, roughly the same time",icon:"🕐"},{id:"random",label:"Random throughout the night",icon:"🎲"},{id:"unsure",label:"Not sure",icon:"🤔"}]},
  {id:"backToSleep",multi:true,freeText:false,q:"How do you get {n} back to sleep after waking?",sub:"Select all that apply",opts:[{id:"feed",label:"Feeding (breast or bottle)",icon:"🍼"},{id:"rock",label:"Rocking or bouncing",icon:"🤱"},{id:"paci",label:"Giving pacifier",icon:"🧸"},{id:"presence",label:"Just being there",icon:"🫂"},{id:"self",label:"Settles on their own",icon:"✨"}]},
  {id:"feedingType",multi:false,freeText:false,q:"How is {n} currently fed?",sub:"Feeding type can affect sleep patterns",opts:[{id:"breastfed",label:"Breastfed",icon:"🤱"},{id:"formula",label:"Formula fed",icon:"🍼"},{id:"both",label:"Both breast & formula",icon:"💛"},{id:"solids",label:"Solids + milk",icon:"🥣"}]},
  {id:"parentComfort",multi:false,freeText:false,q:"How do you feel about some crying during training?",sub:"There's no wrong answer — this shapes your method",opts:[{id:"okay",label:"Okay with it if it works fast",icon:"💪"},{id:"moderate",label:"Some crying is okay",icon:"😐"},{id:"minimal",label:"Prefer minimal crying",icon:"🥺"},{id:"none",label:"No crying — gentle only",icon:"💛"}]},
  {id:"additionalNotes",multi:false,freeText:true,q:"Is there anything else I should know about {n}?",sub:"Optional — the more you share, the better I can help",placeholder:"e.g. reflux, teething, recent move, twins, medical condition, anything at all...",opts:[]},
];

const MSTEPS = {
  ferber:[{t:"Minute 0",a:"Place baby in crib awake. Say 'I love you, goodnight.' Leave the room."},{t:"Minute 3",a:"If still crying: go in. Lights off. Pat chest, say 'You're safe, I love you.' Leave within 60 seconds. Do not pick up."},{t:"Minute 8",a:"If still crying: go in again. Same routine — pat, reassure, leave. Do not stay."},{t:"Minute 13+",a:"Each check-in adds 5 minutes. Most babies settle within 30–45 minutes on Night 1."},{t:"Night 2+",a:"Start intervals at 5, 10, 15 minutes. By Night 3–5 most babies fall asleep independently."}],
  cio:[{t:"Minute 0",a:"Place baby in crib awake. Say 'I love you, goodnight.' Leave and do not return until morning."},{t:"What to expect",a:"Crying peaks in the first 30–45 minutes. This is normal. This is the hardest part."},{t:"If escalating",a:"Only return for a cry that sounds sharp, sudden, different — pain-like. Protest crying is safe to leave."},{t:"Night 2",a:"Most families see dramatic reduction in crying. Night 3 is often near-silent. Trust the process."}],
  chair:[{t:"Night 1–3",a:"Place a chair next to the crib. Sit until baby falls asleep. You may pat and shush but do not pick up."},{t:"Night 4–6",a:"Move the chair halfway to the door. Present but not actively soothing."},{t:"Night 7–9",a:"Move the chair to the doorway. Baby can see you but you are further away."},{t:"Night 10+",a:"Sit just outside the door. Most babies are fully independent by Night 14."}],
  fading:[{t:"Week 1",a:"Reduce your current sleep association by 25%. Rocking 10 min? Reduce to 7. Feeding to sleep? Unlatch just before fully asleep."},{t:"Week 2",a:"Reduce by another 25%. Baby is starting to do more of the settling work themselves."},{t:"Week 3",a:"Reduce to minimal support. A hand on chest only, then just presence in the room."},{t:"Week 4",a:"Place baby down awake with no active support. The transition is complete."}],
  nocry:[{t:"Step 1",a:"At each feed or rock to sleep, gently unlatch or stop motion just before baby is fully asleep."},{t:"Step 2",a:"When baby wakes at night, wait 2–3 minutes before responding. Give them a chance to resettle."},{t:"Step 3",a:"Gradually reduce the length and intensity of night feeds if baby is over 6 months."},{t:"Ongoing",a:"This method takes 4–8 weeks. Progress is slow but there is no crying. Consistency is everything."}],
};

const CRY = [
  {sound:"Eh eh, whimpering",meaning:"Self-settling. Baby is working through it. Stay out — this is progress.",color:"#4CAF50",icon:"🌿"},
  {sound:"Rhythmic, steady crying",meaning:"Protest crying. Baby is frustrated but safe. The hardest sound to hear — and the most important to wait through.",color:"#C9A96E",icon:"💛"},
  {sound:"Rocking on all fours",meaning:"Classic self-settling. Baby is burning off energy to calm down. Sleep is very close.",color:"#4CAF50",icon:"🌿"},
  {sound:"Calming then escalating",meaning:"Extinction burst. One final protest before sleep. The hardest moment — do not go in.",color:"#FCA5A5",icon:"💪"},
  {sound:"Sharp, sudden, different",meaning:"Check on baby. This sounds different from protest — may signal discomfort or a nappy issue.",color:"#93C5FD",icon:"👀"},
];

const NR = [
  (n) => `Take a breath. What you're hearing is protest crying — it typically peaks around 8–12 minutes before dropping. ${n} is safe, loved, and learning. Stay the course. I'm right here. 💛`,
  (n) => `That's ${n} self-settling — that sound means they're working through it, not escalating. Give 5–8 more minutes. You'll likely hear it slow down. Don't go in yet.`,
  (n) => `What you're seeing is completely normal. Rocking on all fours is ${n}'s way of burning off energy before sleep takes over. It looks alarming. It isn't. Sleep is very close.`,
  (n) => `That's an extinction burst — ${n} calmed down, then gave one final protest before settling. This is the hardest moment of the whole night. Do not go in. Sleep is minutes away. 💛`,
  (n) => `You're doing so well. Most families report that Night 1 is the hardest by far — and that tomorrow morning feels like a different world. You're almost through it.`,
];

const DR = [
  "Based on what I know about babies at this age, the wake windows we've set should help a lot. Consistency is the key — even on hard days. 💛",
  "That's completely normal. What you're describing is very common at this stage. Would you like me to adjust tomorrow's nap schedule?",
  "You're doing better than you think. Sleep training is hard and you're showing up every night. That consistency is exactly what makes it work.",
  "Based on what you've shared, I'd suggest capping the afternoon nap a little earlier today — overtiredness actually makes it harder to settle at night.",
  "Every night gets better. Most families see the biggest shift between nights 3 and 5. You're right in the thick of it — closer to the other side than you think. 🌙",
];

const NAR = [
  (n) => `That's completely normal for a nap. ${n} is learning the same skill as at night — just in a new context. Give it a few more minutes. 🌤️`,
  () => "Nap crying is usually shorter than night crying — most babies settle within 10–15 minutes. Stay the course.",
  () => "Don't go in yet. If they haven't settled in 5 more minutes, message me again and we'll reassess. 💛",
  () => "The same method you're using at night applies here. Consistency between day and night is exactly what makes this work faster.",
];

function t2m(t) { if(!t)return 0; const[h,m]=t.split(":").map(Number); return h*60+m; }
function m2t(m) { const n=((Math.round(m)%1440)+1440)%1440; return `${Math.floor(n/60)}:${(n%60).toString().padStart(2,"0")}`; }
function fmt(t) { if(!t)return""; const[h,m]=t.split(":").map(Number); const ap=h>=12?"pm":"am"; const h12=h===0?12:h>12?h-12:h; return `${h12}:${m.toString().padStart(2,"0")}${ap}`; }
function parseWW(s) { const ms=s.match(/(\d+)h(?:(\d+)m)?/g); if(!ms)return 120; const vs=ms.map(x=>{const r=x.match(/(\d+)h(?:(\d+)m)?/);return parseInt(r[1])*60+(parseInt(r[2])||0);}); return Math.round(vs.reduce((a,b)=>a+b,0)/vs.length); }

function calcSched(wakeTime, age, naps, goalBedtime) {
  const ww=WW[Math.min(Math.max(age,4),12)], wwm=parseWW(ww.window), wkm=t2m(wakeTime), avg=age<=6?45:age<=9?60:75, nc=ww.naps, sched=[];
  if(nc>=1){
    const n1s=naps[0]?.actualStart?t2m(naps[0].actualStart):wkm+wwm, n1e=naps[0]?.actualEnd?t2m(naps[0].actualEnd):n1s+avg, n1d=n1e-n1s, n1sh=n1d<40&&!!naps[0]?.actualEnd;
    sched.push({id:"nap1",label:"Nap 1",windowOpen:m2t(n1s),windowClose:m2t(n1s+30),actualStart:naps[0]?.actualStart||null,actualEnd:naps[0]?.actualEnd||null,duration:naps[0]?.actualEnd?n1d:null,isShort:n1sh,status:naps[0]?.actualEnd?"done":naps[0]?.actualStart?"active":"upcoming"});
    if(nc>=2){
      const n2s=naps[1]?.actualStart?t2m(naps[1].actualStart):n1e+wwm+(n1sh?-15:0), n2e=naps[1]?.actualEnd?t2m(naps[1].actualEnd):n2s+avg, n2d=n2e-n2s, n2sh=n2d<40&&!!naps[1]?.actualEnd;
      sched.push({id:"nap2",label:"Nap 2",windowOpen:m2t(n2s),windowClose:m2t(n2s+30),actualStart:naps[1]?.actualStart||null,actualEnd:naps[1]?.actualEnd||null,duration:naps[1]?.actualEnd?n2d:null,isShort:n2sh,status:naps[1]?.actualEnd?"done":naps[1]?.actualStart?"active":"upcoming"});
      if(nc>=3){
        const n3s=naps[2]?.actualStart?t2m(naps[2].actualStart):n2e+wwm*0.8, n3e=naps[2]?.actualEnd?t2m(naps[2].actualEnd):n3s+40;
        sched.push({id:"nap3",label:"Nap 3",windowOpen:m2t(n3s),windowClose:m2t(n3s+20),actualStart:naps[2]?.actualStart||null,actualEnd:naps[2]?.actualEnd||null,duration:naps[2]?.actualEnd?n3e-n3s:null,isShort:false,status:naps[2]?.actualEnd?"done":naps[2]?.actualStart?"active":"upcoming"});
      }
    }
  }
  const last=[...sched].reverse().find(n=>n.status==="done");
  const lastEndMins=last?t2m(last.actualEnd):wkm;
  const goalMins=goalBedtime?t2m(goalBedtime):lastEndMins+wwm+15;
  const allDone=sched.length>0&&sched.every(n=>n.status==="done");
  const totalNapMins=sched.filter(n=>n.duration).reduce((a,n)=>a+n.duration,0);
  const needsCatnap=allDone&&totalNapMins<60&&(goalMins-lastEndMins)>150;
  if(needsCatnap){
    const cs=lastEndMins+Math.round(wwm*0.75);
    sched.push({id:"catnap",label:"Catnap",isCatnap:true,windowOpen:m2t(cs),windowClose:m2t(cs+20),actualStart:null,actualEnd:null,duration:null,isShort:false,status:"upcoming"});
  }
  const idealBedtime=needsCatnap?m2t(lastEndMins+Math.round(wwm*0.75)+30+wwm):m2t(goalMins);
  return{schedule:sched,idealBedtime,needsCatnap:needsCatnap||false};
}

function genDiag(name, age, answers) {
  const sm=answers.sleepMethod||[], bts=answers.backToSleep||[], c=answers.parentComfort||"moderate";
  const fts=sm.includes("feeding")||bts.includes("feed"), rocks=sm.includes("rocking")||bts.includes("rock");
  let diag="";
  if(fts) diag=`Based on what you've shared, ${name} has developed a feed-to-sleep association — one of the most common sleep challenges at this age.\n\nHere's what's happening: ${name} has learned that feeding is the signal to fall asleep. When they naturally wake between sleep cycles, they look for that same signal. Without it, they cry out for you.\n\nThis isn't a hunger issue. It's a learned association. The good news? It's completely fixable, and many families see dramatic improvement within just a few nights.`;
  else if(rocks) diag=`Based on what you've shared, ${name} has developed a rocking-to-sleep association — the root cause of most night wakings at this age.\n\nHere's exactly what's happening: ${name} falls asleep in your arms, but when they naturally wake between sleep cycles, they're in a completely different environment. They go from warm arms to an empty crib and understandably panic.\n\n${name} isn't sick, hungry, or in pain — they just need to learn to connect sleep cycles independently.`;
  else diag=`Based on what you've shared, ${name} has developed some sleep associations that make it difficult to connect sleep cycles independently.\n\nAt ${age} months, this is completely normal — and completely fixable. Once ${name} learns to fall asleep independently at bedtime, those night wakings typically resolve on their own within days.`;
  let rec="ferber";
  if(c==="none")rec="nocry"; else if(c==="minimal")rec="fading"; else if(c==="moderate")rec=fts?"chair":"ferber"; else if(c==="okay")rec=rocks?"cio":"ferber";
  return{diag,rec};
}

let ni=0,di=0,napi=0;

export default function Home() {
  // Load saved data from localStorage
  const saved=()=>{try{return JSON.parse(localStorage.getItem("dw_v4")||"null");}catch{return null;}};
  const sv=saved();

  const[sc,setSc]=useState(null);
  const[name,setName]=useState(sv?.name||"");
  const[age,setAge]=useState(sv?.age||6);
  const[ped,setPed]=useState(null);
  const[ans,setAns]=useState({});
  const[notes,setNotes]=useState(sv?.notes||"");
  const[qi,setQi]=useState(0);
  const[diag,setDiag]=useState(null);
  const[method,setMethod]=useState(sv?.method||null);
  const[bs,setBs]=useState(0);
  const[nn,setNn]=useState(sv?.nn||1);
  const[as2,setAs2]=useState(0);
  const[dmsgs,setDmsgs]=useState([]);
  const[nmsgs,setNmsgs]=useState([]);
  const[napmsg,setNapmsg]=useState([]);
  const[inp,setInp]=useState("");
  const[typing,setTyping]=useState(false);
  const[log,setLog]=useState(sv?.log||[]);
  const[mDone,setMDone]=useState(sv?.mDone||false);
  const[showM,setShowM]=useState(false);
  const[wt,setWt]=useState(sv?.wt||"07:00");
  const[rating,setRating]=useState(null);
  const[user,setUser]=useState(null);
  const[authLoading,setAuthLoading]=useState(true);
  const[authMode,setAuthMode]=useState("login");
  const[authEmail,setAuthEmail]=useState("");
  const[authPw,setAuthPw]=useState("");
  const[authError,setAuthError]=useState("");
  const[authSubmitting,setAuthSubmitting]=useState(false);
  const[wups,setWups]=useState(null);
  const[gbed,setGbed]=useState(sv?.gbed||"19:30");
  const[editBed,setEditBed]=useState(false);
  const[naps,setNaps]=useState([{},{},{}]);
  const[aNap,setANap]=useState(null);
  const[notif,setNotif]=useState(null);
  const[modal,setModal]=useState(null);
  const[resetConfirm,setResetConfirm]=useState(false);
  const[changingMethod,setChangingMethod]=useState(false);
  const[showSignOut,setShowSignOut]=useState(false);
  const[showMenu,setShowMenu]=useState(false);
  const[logModal,setLogModal]=useState(null);
  const[lmRating,setLmRating]=useState(null);
  const[lmWups,setLmWups]=useState(null);
  const[lmNight,setLmNight]=useState("");
  const[lmDate,setLmDate]=useState("");
  const[napLogs,setNapLogs]=useState([]);
  const[napEditModal,setNapEditModal]=useState(null);
  const[neStart,setNeStart]=useState("");
  const[neEnd,setNeEnd]=useState("");
  const[saveStatus,setSaveStatus]=useState(null);
  const dref=useRef(),nref=useRef(),napref=useRef();

  useEffect(()=>{
    if(sc!==S.SPLASH)return;
    const t=setTimeout(()=>{
      setSc(S.ON1);
    },2400);
    return()=>clearTimeout(t);
  },[sc]);

  // Save to localStorage whenever key data changes
  useEffect(()=>{
    if(!name&&!method)return;
    try{localStorage.setItem("dw_v4",JSON.stringify({name,age,notes,method,nn,mDone,wt,log,gbed}));}catch{}
  },[name,age,notes,method,nn,mDone,wt,log,gbed]);
  useEffect(()=>{dref.current?.scrollIntoView({behavior:"smooth"});},[dmsgs,typing]);
  useEffect(()=>{nref.current?.scrollIntoView({behavior:"smooth"});},[nmsgs,typing]);
  useEffect(()=>{napref.current?.scrollIntoView({behavior:"smooth"});},[napmsg,typing]);

  useEffect(()=>{
    if(sc!==S.ACTIVATING)return;
    if(nmsgs.length>0){setSc(S.NIGHT);return;}
    setAs2(0);
    const ts=[600,1400,2400,3400].map((t,i)=>setTimeout(()=>setAs2(i+1),t));
    const done=setTimeout(()=>{
      const nightGreeting=`I'm here. Night ${nn} with ${name}. 🌙\n\nYou've prepared for this — you know the routine, you know your method, and you know what every sound means.\n\nTake a breath. Whenever you're ready, tell me — is ${name} in the crib?`;
      setNmsgs([{role:"a",text:nightGreeting}]);
      if(user){supabase.from('chat_messages').insert({user_id:user.id,chat_type:"night",night_number:nn,role:"a",content:nightGreeting}).then(r=>console.log("Night greeting saved"));}
      setSc(S.NIGHT);
    },4800);
    return()=>{ts.forEach(clearTimeout);clearTimeout(done);};
  },[sc]);

  // Auth: check session on mount
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
            supabase.from('sleep_logs').select('*').eq('user_id',session.user.id).order('night',{ascending:true}).then(({data:logs})=>{if(logs&&logs.length)setLog(logs.map(l=>({night:l.night,date:l.date,rating:l.rating,wakeups:l.wakeups})));});
            supabase.from('nap_logs').select('*').eq('user_id',session.user.id).order('created_at',{ascending:true}).then(({data:nl,error:ne})=>{if(!ne&&nl&&nl.length)setNapLogs(nl.map(n=>({date:n.date,nap_number:n.nap_number,start_time:n.start_time,end_time:n.end_time,duration:n.duration})));});
            supabase.from('chat_messages').select('*').eq('user_id',session.user.id).eq('chat_type','day').order('created_at',{ascending:true}).then(({data:msgs})=>{if(msgs&&msgs.length)setDmsgs(msgs.map(m=>({role:m.role,text:m.content})));});
            const nightNum=data.night_number||1;
            supabase.from('chat_messages').select('*').eq('user_id',session.user.id).eq('chat_type','night').eq('night_number',nightNum).order('created_at',{ascending:true}).then(({data:msgs})=>{if(msgs&&msgs.length)setNmsgs(msgs.map(m=>({role:m.role,text:m.content})));});
            setSc(S.HOME);
          }else{setSc(S.SPLASH);}
          setAuthLoading(false);
        }).catch(()=>{setSc(S.SPLASH);setAuthLoading(false);});
      }else{setAuthLoading(false);setSc(S.LANDING);}
    }).catch(()=>{setAuthLoading(false);setSc(S.LANDING);});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user||null);
    });
    return()=>subscription.unsubscribe();
  },[]);

  // Auto-save profile when onboarding completes
  useEffect(()=>{
    if(user&&name&&method&&(sc===S.ACTIVATING||sc===S.HOME||sc===S.NIGHT)){
      supabase.from("profiles").upsert({id:user.id,baby_name:name,baby_age:String(age),sleep_method:method,night_number:nn}).then(r=>console.log("Profile saved",r));
    }
  },[sc]);

  // Auth guard: always redirect to login if not authenticated
  useEffect(()=>{
    if(!authLoading&&!user&&sc!==S.AUTH&&sc!==S.LANDING)setSc(S.LANDING);
  },[authLoading,user,sc]);

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
          const{data:logs}=await supabase.from('sleep_logs').select('*').eq('user_id',data.user.id).order('night',{ascending:true});
          if(logs&&logs.length)setLog(logs.map(l=>({night:l.night,date:l.date,rating:l.rating,wakeups:l.wakeups})));
          try{const{data:nl}=await supabase.from('nap_logs').select('*').eq('user_id',data.user.id).order('created_at',{ascending:true});if(nl&&nl.length)setNapLogs(nl.map(n=>({date:n.date,nap_number:n.nap_number,start_time:n.start_time,end_time:n.end_time,duration:n.duration})));}catch(e){}
          const nightNum=profile.night_number||1;
          try{const{data:dayMsgs}=await supabase.from('chat_messages').select('*').eq('user_id',data.user.id).eq('chat_type','day').order('created_at',{ascending:true});if(dayMsgs&&dayMsgs.length)setDmsgs(dayMsgs.map(m=>({role:m.role,text:m.content})));}catch(e){}
          try{const{data:nightMsgs}=await supabase.from('chat_messages').select('*').eq('user_id',data.user.id).eq('chat_type','night').eq('night_number',nightNum).order('created_at',{ascending:true});if(nightMsgs&&nightMsgs.length)setNmsgs(nightMsgs.map(m=>({role:m.role,text:m.content})));}catch(e){}
          setSc(S.HOME);
        }else{setSc(S.SPLASH);}
      }
    }catch(e){setAuthError(e.message);}
    setAuthSubmitting(false);
  };

  const handleSignOut=async()=>{
    await supabase.auth.signOut();
    setUser(null);setSc(S.LANDING);
    setName("");setAge(6);setMethod(null);setNn(1);
    setDmsgs([]);setNmsgs([]);setNapmsg([]);setLog([]);setNapLogs([]);
  };

  const handleReset=async()=>{
    try{
      if(user){
        await supabase.from('chat_messages').delete().eq('user_id',user.id);
        await supabase.from('nap_logs').delete().eq('user_id',user.id);
        await supabase.from('sleep_logs').delete().eq('user_id',user.id);
        await supabase.from('profiles').delete().eq('id',user.id);
      }
    }catch(e){console.log("Reset cleanup error:",e);}
    localStorage.removeItem("dw_v4");
    setName("");setAge(6);setMethod(null);setNn(1);setLog([]);setNapLogs([]);
    setDmsgs([]);setNmsgs([]);setNapmsg([]);setMDone(false);setResetConfirm(false);
    setSc(S.ON1);
  };

  const saveProfile=async()=>{
    if(!user)return;
    await supabase.from('profiles').upsert({
      id:user.id,baby_name:name,baby_age:String(age),
      sleep_method:method,night_number:nn
    });
  };

  const ww=WW[Math.min(Math.max(age,4),12)];
  const mo=METHODS.find(m=>m.id===method);
  const ms=MSTEPS[method]||[];
  const cq=IQ[qi];
  const ca=ans[cq?.id];
  const canAdv=cq?.freeText?true:cq?.multi?(ca?.length>0):!!ca;
  const ds=mDone?calcSched(wt,age,naps,gbed):null;

  const handleAns=(qid,oid,multi)=>{setAns(prev=>{if(multi){const c=prev[qid]||[];return{...prev,[qid]:c.includes(oid)?c.filter(x=>x!==oid):[...c,oid]};}return{...prev,[qid]:oid};});};
  const advQ=()=>{if(qi<IQ.length-1){setQi(p=>p+1);}else{const d=genDiag(name,age,ans);setDiag(d);setMethod(d.rec);setSc(S.DIAG);}};

  const submitM=()=>{
    if(rating&&wups!==null){
      const logNight=nn-1;
      setSleepLog(prev=>{if(prev.find(e=>e.night===logNight))return prev;return[...prev,{night:logNight,date:new Date().toLocaleDateString(),rating,wakeups:wups}];});
      if(user){supabase.from('sleep_logs').insert({user_id:user.id,night:logNight,date:new Date().toLocaleDateString(),rating,wakeups:String(wups)}).then(r=>console.log("Sleep log saved",r));}
    }
    setMDone(true);setShowM(false);
  };

  const openAddLog=()=>{setLmNight(String(nn>1?nn-1:1));setLmDate(new Date().toLocaleDateString());setLmRating(null);setLmWups(null);setLogModal({mode:"add"});};
  const openEditLog=(entry,i)=>{setLmNight(String(entry.night));setLmDate(entry.date);setLmRating(entry.rating);setLmWups(typeof entry.wakeups==="string"?(/\d/.test(entry.wakeups)?parseInt(entry.wakeups):entry.wakeups):entry.wakeups);setLogModal({mode:"edit",index:i,entry});};
  const saveLogEntry=()=>{
    if(!lmRating||lmWups===null||!logModal)return;
    const nightNum=parseInt(lmNight);
    const isAdd=logModal.mode==="add";
    const idx=logModal.index;
    if(isAdd){
      setLog(prev=>{if(prev.find(e=>e.night===nightNum))return prev;return[...prev,{night:nightNum,date:lmDate,rating:lmRating,wakeups:lmWups}].sort((a,b)=>a.night-b.night);});
      if(user){
        supabase.from('sleep_logs').insert({user_id:user.id,night:nightNum,date:lmDate,rating:lmRating,wakeups:String(lmWups)}).then(r=>{console.log("Manual sleep log saved",r);setSaveStatus("Night saved ✓");setTimeout(()=>setSaveStatus(null),2000);});
      }
      if(nightNum>=nn){
        const newNn=nightNum+1;
        setNn(newNn);
        if(user){supabase.from('profiles').upsert({id:user.id,baby_name:name,baby_age:String(age),sleep_method:method,night_number:newNn}).then(r=>console.log("Profile nn updated",r));}
      }
    }else{
      setLog(prev=>prev.map((e,i)=>i===idx?{night:nightNum,date:lmDate,rating:lmRating,wakeups:lmWups}:e).sort((a,b)=>a.night-b.night));
      if(user){
        supabase.from('sleep_logs').update({rating:lmRating,wakeups:String(lmWups)}).eq('user_id',user.id).eq('night',nightNum).then(r=>{console.log("Sleep log updated",r);setSaveStatus("Updated ✓");setTimeout(()=>setSaveStatus(null),2000);});
      }
    }
    setLogModal(null);
  };

  const saveNapLog=(napNum,startTime,endTime,dur)=>{
    const d=new Date().toLocaleDateString();
    setNapLogs(prev=>[...prev,{date:d,nap_number:napNum,start_time:startTime,end_time:endTime,duration:dur}]);
    if(user){
      supabase.from('nap_logs').insert({user_id:user.id,date:d,nap_number:napNum,start_time:startTime,end_time:endTime,duration:dur}).then(r=>{console.log("Auto nap saved",r);setSaveStatus("Nap saved ✓");setTimeout(()=>setSaveStatus(null),2000);});
    }
  };

  const openEditNap=(nap,i)=>{setNeStart(nap.start_time);setNeEnd(nap.end_time);setNapEditModal({mode:"edit",index:i,nap});};
  const saveNapEdit=()=>{
    if(!neStart||!neEnd||!napEditModal)return;
    const dur=Math.max(t2m(neEnd)-t2m(neStart),0);
    const isAdd=napEditModal.mode==="add";
    const napNum=napEditModal.nap.nap_number;
    const napDate=napEditModal.nap.date;
    const idx=napEditModal.index;
    if(isAdd){
      setNapLogs(prev=>[...prev,{date:napDate,nap_number:napNum,start_time:neStart,end_time:neEnd,duration:dur}]);
      if(user){
        supabase.from('nap_logs').insert({user_id:user.id,date:napDate,nap_number:napNum,start_time:neStart,end_time:neEnd,duration:dur}).then(r=>{console.log("Manual nap saved",r);setSaveStatus("Nap saved ✓");setTimeout(()=>setSaveStatus(null),2000);});
      }
    }else{
      setNapLogs(prev=>prev.map((n,i)=>i===idx?{...n,start_time:neStart,end_time:neEnd,duration:dur}:n));
      if(user){
        supabase.from('nap_logs').update({start_time:neStart,end_time:neEnd,duration:dur}).eq('user_id',user.id).eq('date',napDate).eq('nap_number',napNum).then(r=>{console.log("Nap updated",r);setSaveStatus("Nap updated ✓");setTimeout(()=>setSaveStatus(null),2000);});
      }
    }
    setNapEditModal(null);
  };

  const startNap=(i)=>{
    const now=new Date(),t=`${now.getHours()}:${now.getMinutes().toString().padStart(2,"0")}`;
    const u=[...naps];u[i]={actualStart:t};setNaps(u);setANap(i);
    const napGreeting=`${name} is down for Nap ${i+1}. 🌤️\n\nI'm here. Tell me what's happening — same as night, just softer. What do you hear?`;
    setNapmsg([{role:"a",text:napGreeting}]);
    if(user){supabase.from('chat_messages').insert({user_id:user.id,chat_type:"nap",night_number:nn,role:"a",content:napGreeting}).then(r=>console.log("Nap greeting saved"));}
    setSc(S.NAP);
  };

  const endNap=(i)=>{
    const now=new Date(),t=`${now.getHours()}:${now.getMinutes().toString().padStart(2,"0")}`;
    const cur=naps[i];if(!cur?.actualStart){setANap(null);setSc(S.HOME);return;}
    const dur=Math.max(t2m(t)-t2m(cur.actualStart),0);
    saveNapLog(i+1,cur.actualStart,t,dur);
    if(dur<40){setModal({index:i,duration:dur,label:`Nap ${i+1}`,endTime:t});setANap(null);setSc(S.HOME);}
    else{const u=[...naps];u[i]={...cur,actualEnd:t,duration:dur};setNaps(u);setNotif(`Great Nap ${i+1}! ${dur} minutes — right on track. 💛`);setTimeout(()=>setNotif(null),10000);setANap(null);setSc(S.HOME);}
  };

  const confirmEnd=(i,et,dur)=>{
    const u=[...naps];u[i]={...naps[i],actualEnd:et,duration:dur};setNaps(u);
    const ns2=calcSched(wt,age,u,gbed);
    const notifMsg=ns2.needsCatnap
      ?`${name} only slept ${dur} min — Luna has added a catnap window to protect tonight's sleep. 💛`
      :ns2.schedule[i+1]
      ?`${name} only slept ${dur} min — schedule adjusted. Next nap: ${fmt(ns2.schedule[i+1].windowOpen)}. 💛`
      :`${name} only slept ${dur} min — earlier bedtime: ${fmt(ns2.idealBedtime)}. 💛`;
    setNotif(notifMsg);
    setTimeout(()=>setNotif(null),12000);setModal(null);
  };

  const setSleepLog=(fn)=>setLog(fn);

  const lunaReply=(ctx)=>{
    const u=inp.trim().toLowerCase();
    const n=name||"your baby";
    const mn=mo?mo.name:"your method";
    if(ctx==="night"){
      if(/cry|scream|loud|wail/.test(u))return "What you're hearing is protest crying — it typically peaks around 8–12 minutes before dropping. "+n+" is safe, loved, and learning.\n\nDon't go in yet. Stay the course. I'm right here. 💛";
      if(/nervous|scared|anxious|worried|hard|can't/.test(u))return "That nervousness means you care deeply — and that's exactly the kind of parent "+n+" needs.\n\nYou've prepared for this. You know the routine, you know "+mn+", and "+n+" is safe. Take a slow breath. I'm not going anywhere tonight. 💛";
      if(/go in|check|should i/.test(u))return "Not yet. What you're feeling is the hardest part of the whole night — the urge to go in is completely natural.\n\nBut "+n+" is learning to self-settle, and every minute you hold on, that skill gets stronger. Give it 5 more minutes. 💛";
      if(/quiet|settled|asleep|stopped/.test(u))return n+" settled. 🌙\n\nThat's the sound of them learning. That quiet right now? That's the whole point.\n\nGo rest. You earned tonight.";
      if(/how long|when will|how many/.test(u))return "Most families using "+mn+" see the biggest shift between nights 3 and 5. Night 1 is almost always the hardest.\n\nYou're closer to the other side than you think. Keep going. 💛";
      if(/rocking|all four|moving|weird/.test(u))return "Rocking on all fours is "+n+"'s way of burning off energy before sleep takes over. It looks alarming — it isn't.\n\nThis is a self-soothing behaviour. Sleep is close. Stay where you are. 🌙";
      return "I'm here. Night "+nn+" with "+n+". 🌙\n\nTell me what you're hearing and I'll help you through it. You're not alone in this tonight.";
    }
    if(ctx==="nap"){
      if(/cry|fuss|upset/.test(u))return "Nap crying is almost always shorter than night crying — most babies settle within 10–15 minutes.\n\n"+n+" is learning the same skill as at night, just in a new context. A few more minutes. 🌤️";
      if(/short|woke|45|30|early/.test(u))return "Short naps are really common at this stage — "+n+" is still learning to connect sleep cycles during the day.\n\nThe consistency you're building right now is exactly what makes this work faster. 💛";
      if(/go in|should i|how long/.test(u))return "Give it 5 more minutes. If "+n+" hasn't settled by then, message me and we'll decide together.\n\nThe same "+mn+" principles apply here — consistency day and night is the key. 🌤️";
      return "I'm here. "+n+" is learning — same skill as night, just in daylight. 🌤️\n\nTell me what you're hearing.";
    }
    if(/schedule|nap|when|window/.test(u))return "The schedule we've built is based on "+n+"'s age and wake time — trust it even on days when the naps feel off.\n\nConsistency with the wake windows is what regulates their circadian rhythm. You're doing it right. 💛";
    if(/last night|progress|better|worse/.test(u))return "Every night you complete is progress — even the rough ones. "+n+"'s brain is literally rewiring how it handles sleep.\n\nMost families see a real shift by night 3–5 with "+mn+". You're building something that lasts. 🌙";
    if(/tired|exhausted|hard|struggling/.test(u))return "You're doing one of the hardest things a parent can do — changing a pattern that exists because "+n+" loves and depends on you.\n\nThat exhaustion is real. Rest when you can today. Tonight will be a little easier. 💛";
    return "I'm here all day. 💛\n\nSchedule questions, last night's wins, or just needing someone to say you're doing great — ask me anything.";
  };

  const send=async(setMsgs,ctx)=>{
    if(!inp.trim())return;
    const userMsg=inp.trim();
    const currentMsgs=ctx==="night"?nmsgs:ctx==="nap"?napmsg:dmsgs;
    const history=[...currentMsgs,{role:"u",text:userMsg}].slice(-6);
    setMsgs(p=>[...p,{role:"u",text:userMsg}]);setInp("");setTyping(true);
    if(user){supabase.from('chat_messages').insert({user_id:user.id,chat_type:ctx,night_number:nn,role:"u",content:userMsg}).then(r=>console.log("User msg saved"));}
    try{const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:history,context:ctx,babyName:name,age:age,method:mo?.name||"gentle sleep training",nightNumber:nn})});const data=await res.json();setTyping(false);setMsgs(p=>[...p,{role:"a",text:data.reply}]);
      if(user){supabase.from('chat_messages').insert({user_id:user.id,chat_type:ctx,night_number:nn,role:"a",content:data.reply}).then(r=>console.log("Luna msg saved"));}
    }catch(e){setTyping(false);setMsgs(p=>[...p,{role:"a",text:"I'm having a moment -- try again in a sec. I'm not going anywhere."}]);}
  };

  const sendDay=()=>send(setDmsgs,"day");
  const sendNight=()=>send(setNmsgs,"night");
  const sendNap=()=>send(setNapmsg,"nap");

  const initDay=()=>{if(dmsgs.length===0){const greeting="Hi, I'm Luna — your personal sleep expert, available 24/7. I'm here for every question, every 2am moment, and every win. How can I help today?";setDmsgs([{role:"a",text:greeting}]);if(user){supabase.from('chat_messages').insert({user_id:user.id,chat_type:"day",night_number:nn,role:"a",content:greeting}).then(r=>console.log("Day greeting saved"));}}};

  const Nav=()=>(
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,background:isDayMode?"rgba(240,233,220,0.97)":"rgba(13,17,23,0.96)",backdropFilter:"blur(20px)",borderTop:isDayMode?"1px solid rgba(212,197,168,0.6)":"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-around",padding:"8px 0 20px",zIndex:100}}>
      {[{l:"Home",i:"home_svg",s:S.HOME},{l:"Luna",i:"🌙",s:S.CHAT},{l:"Plan",i:"📋",s:S.PLAN},{l:"Log",i:"📝",s:S.LOG}].map(tab=>(
        <button key={tab.s} onClick={()=>{if(tab.s===S.CHAT)initDay();setSc(tab.s);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"8px 16px",cursor:"pointer",opacity:sc===tab.s?1:0.4,transition:"opacity .2s",background:"none",border:"none",color:isDayMode?"#2C2010":"#EDE8DF",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:500,letterSpacing:0.5,textTransform:"uppercase"}}>
          {tab.i==="home_svg"
            ? <svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" fill="#C9A96E" opacity="0.3"/><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 21V13h6v8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <span style={{fontSize:20}}>{tab.i}</span>
          }{tab.s===S.HOME?<span style={{marginTop:5}}>{tab.l}</span>:tab.l}
        </button>
      ))}
    </div>
  );

  const ProfileBtn=()=>user&&(sc===S.HOME||sc===S.CHAT||sc===S.NAP||sc===S.PLAN||sc===S.LOG||sc===S.NIGHT)?(
    <>
      <button onClick={()=>setShowMenu(!showMenu)} style={{position:"fixed",top:12,right:12,zIndex:200,width:36,height:36,borderRadius:"50%",background:"rgba(201,169,110,0.15)",border:"1px solid rgba(201,169,110,0.2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#C9A96E",fontSize:14,fontFamily:"'DM Sans',sans-serif"}} title="Menu">{user.email?user.email[0].toUpperCase():"U"}</button>
      {showMenu&&(
        <div onClick={()=>setShowMenu(false)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:250}}>
          <div onClick={e=>e.stopPropagation()} style={{position:"fixed",top:54,right:12,zIndex:260,background:isDayMode?"#F5EFE4":"#161B22",border:isDayMode?"1px solid rgba(201,169,110,0.3)":"1px solid rgba(201,169,110,0.15)",borderRadius:14,padding:"6px",minWidth:180,boxShadow:"0 8px 32px rgba(0,0,0,0.25)"}}>
            <a href={`mailto:support@nuette.app?subject=Nuette Support — ${name||"User"}, Night ${nn||1}`} onClick={()=>setShowMenu(false)} style={{display:"block",padding:"12px 16px",borderRadius:10,fontSize:14,color:isDayMode?"#2C2010":"#EDE8DF",textDecoration:"none",fontFamily:"'DM Sans',sans-serif",transition:"background .2s"}}>Support</a>
            <a href="mailto:hello@nuette.app" onClick={()=>setShowMenu(false)} style={{display:"block",padding:"12px 16px",borderRadius:10,fontSize:14,color:isDayMode?"#2C2010":"#EDE8DF",textDecoration:"none",fontFamily:"'DM Sans',sans-serif",transition:"background .2s"}}>Contact Us</a>
            <div style={{height:1,margin:"4px 8px",background:isDayMode?"rgba(201,169,110,0.15)":"rgba(255,255,255,0.08)"}}/>
            <button onClick={()=>{setShowMenu(false);setShowSignOut(true);}} style={{display:"block",width:"100%",padding:"12px 16px",borderRadius:10,fontSize:14,color:"#C9A96E",background:"none",border:"none",textAlign:"left",fontFamily:"'DM Sans',sans-serif",cursor:"pointer",transition:"background .2s"}}>Sign Out</button>
          </div>
        </div>
      )}
      {showSignOut&&(
        <div onClick={()=>setShowSignOut(false)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:isDayMode?"#F5EFE4":"#161B22",border:isDayMode?"1px solid rgba(201,169,110,0.3)":"1px solid rgba(201,169,110,0.15)",borderRadius:20,padding:"28px 24px",width:"85%",maxWidth:320,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:12}}>🌙</div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:300,color:isDayMode?"#2C2010":"#EDE8DF",marginBottom:8}}>Sign out?</h3>
            <p style={{fontSize:13,color:isDayMode?"#6B6560":"#6B6560",lineHeight:1.6,marginBottom:24}}>Are you sure you want to sign out of Nuette?</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowSignOut(false)} style={{flex:1,padding:"12px 0",borderRadius:12,background:"none",border:isDayMode?"1px solid rgba(201,169,110,0.3)":"1px solid rgba(255,255,255,0.1)",color:isDayMode?"#2C2010":"#EDE8DF",fontSize:14,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",fontWeight:500}}>Cancel</button>
              <button onClick={()=>{setShowSignOut(false);handleSignOut();}} style={{flex:1,padding:"12px 0",borderRadius:12,background:"rgba(201,169,110,0.15)",border:"1px solid rgba(201,169,110,0.3)",color:"#C9A96E",fontSize:14,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",fontWeight:500}}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  ):null;

  const CSS=`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}body{background:#0a0d12}::-webkit-scrollbar{width:0}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes breathe{0%,100%{transform:scale(1);filter:drop-shadow(0 0 10px rgba(201,169,110,0.3))}50%{transform:scale(1.07);filter:drop-shadow(0 0 22px rgba(201,169,110,0.55))}}
    @keyframes breatheI{0%,100%{transform:scale(1);filter:drop-shadow(0 0 20px rgba(201,169,110,0.4))}50%{transform:scale(1.15);filter:drop-shadow(0 0 60px rgba(201,169,110,0.9))}}
    @keyframes starFloat{0%,100%{opacity:.35;transform:translateY(0)}50%{opacity:.75;transform:translateY(-6px)}}
    @keyframes dots{0%,20%{opacity:0}50%{opacity:1}80%,100%{opacity:0}}
    @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes checkPop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
    @keyframes pulseGold{0%,100%{box-shadow:0 0 0 0 rgba(201,169,110,0)}50%{box-shadow:0 0 40px 10px rgba(201,169,110,0.25)}}
    @keyframes nightFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .f1{animation:fadeUp .55s .05s both}.f2{animation:fadeUp .55s .15s both}.f3{animation:fadeUp .55s .25s both}
    .f4{animation:fadeUp .55s .35s both}.f5{animation:fadeUp .55s .45s both}.f6{animation:fadeUp .55s .55s both}
    .bp{background:linear-gradient(135deg,#C9A96E,#E8C98A);color:#0D1117;border:none;border-radius:16px;padding:16px 32px;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;cursor:pointer;width:100%;transition:all .2s;letter-spacing:.3px}
    .bp:disabled{opacity:.35;cursor:not-allowed}
    .ba{background:transparent;border:1px solid rgba(201,169,110,0.5);border-radius:20px;padding:20px 32px;font-family:'DM Sans',sans-serif;font-size:16px;font-weight:500;cursor:pointer;width:100%;transition:all .3s;letter-spacing:.5px;color:#C9A96E;animation:pulseGold 3s ease-in-out infinite}
    .bg{background:transparent;color:#8B8680;border:none;padding:12px 0;font-family:'DM Sans',sans-serif;font-size:14px;cursor:pointer;transition:color .2s}
    .bg:hover{color:#EDE8DF}
    .if{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px;color:#EDE8DF;font-family:'DM Sans',sans-serif;font-size:16px;width:100%;outline:none;transition:all .2s}
    .if:focus{border-color:rgba(201,169,110,0.4)}.if::placeholder{color:#4A4640}
    .in{background:rgba(201,169,110,0.07);border:none;border-radius:14px;padding:14px;color:#EDE8DF;font-family:'DM Sans',sans-serif;font-size:15px;width:100%;outline:none;transition:all .2s}
    .in:focus{background:rgba(201,169,110,0.11)}.in::placeholder{color:#4A4035}
    .day-mode .if{background:rgba(201,169,110,0.08)!important;border-color:rgba(201,169,110,0.25)!important;color:#2C2010!important}
    .day-mode .if::placeholder{color:#C0A870!important}
    .day-mode .in{background:rgba(201,169,110,0.08)!important;border-color:rgba(201,169,110,0.25)!important;color:#2C2010!important}
    .day-mode .in::placeholder{color:#C0A870!important}
    .oc{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:14px 16px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:12px;margin-bottom:10px}
    .oc:hover{background:rgba(255,255,255,0.07)}.oc.sl{background:rgba(201,169,110,0.1);border-color:rgba(201,169,110,0.45)}
    .mc{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:20px;cursor:pointer;transition:all .25s;margin-bottom:12px;position:relative}
    .mc:hover{background:rgba(255,255,255,0.07);transform:translateX(4px)}.mc.sl{border-color:rgba(201,169,110,0.5);background:rgba(201,169,110,0.08)}
    .bub{max-width:82%;padding:14px 16px;border-radius:20px;font-size:14px;line-height:1.65;animation:fadeUp .4s ease;white-space:pre-wrap}
    .bu{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-bottom-left-radius:6px;color:#D4CFC8}
    .buu{background:linear-gradient(135deg,rgba(201,169,110,0.18),rgba(201,169,110,0.28));border:1px solid rgba(201,169,110,0.2);border-bottom-right-radius:6px;margin-left:auto;color:#EDE8DF}
    .day-mode .buu{background:rgba(201,169,110,0.2)!important;border-color:rgba(201,169,110,0.35)!important;color:#2C2010!important}
    .bna{background:rgba(201,169,110,0.07);border:1px solid rgba(201,169,110,0.15);border-bottom-left-radius:6px;color:#E8D5A8;animation:nightFade .5s ease}
    .bnu{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-bottom-right-radius:6px;margin-left:auto;color:#C8C0B8}
    .sc2{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:20px;flex:1}
    .dot{width:6px;height:6px;border-radius:50%;display:inline-block;margin:0 2px}
    .dot:nth-child(1){animation:dots 1.4s 0s infinite}.dot:nth-child(2){animation:dots 1.4s .2s infinite}.dot:nth-child(3){animation:dots 1.4s .4s infinite}
    .pb{height:3px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden}
    .pf{height:100%;background:linear-gradient(90deg,#C9A96E,#E8C98A);border-radius:2px;transition:width .4s}
    .lb{background:rgba(201,169,110,0.07);border:1px solid rgba(201,169,110,0.15);border-radius:20px;border-top-left-radius:4px;padding:18px 20px}
    .ci{display:flex;align-items:flex-start;gap:14px;padding:14px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;margin-bottom:10px}
    .ci.ck{background:rgba(201,169,110,0.06);border-color:rgba(201,169,110,0.2)}
    .str{position:absolute;border-radius:50%;background:#EDE8DF}
    .nstr{position:absolute;border-radius:50%;background:#C9A96E}
    .slw input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:rgba(255,255,255,0.1);outline:none}
    .slw input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#C9A96E,#E8C98A);cursor:pointer;box-shadow:0 2px 8px rgba(201,169,110,0.4)}
  `;

  const isDayMode=mDone&&![S.NIGHT,S.NAP,S.ACTIVATING,S.NIGHTSUMMARY,S.SPLASH,S.ON1,S.ON2,S.ON3,S.BABY,S.PED,S.INTAKE,S.DIAG,S.METHOD,S.BRIEF,S.PRELAUNCH].includes(sc);
  const D={bg:isDayMode?"#F0E6D3":"#0D1117",card:isDayMode?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.03)",border:isDayMode?"#C8B898":"rgba(255,255,255,0.07)",textPrimary:isDayMode?"#1A0E00":"#EDE8DF",textSec:isDayMode?"#2E1A08":"#8B8680",textDim:isDayMode?"#4A3018":"#4A4640",divider:isDayMode?"rgba(180,155,110,0.6)":"rgba(255,255,255,0.05)"};
  const WRAP={width:"100%",maxWidth:390,minHeight:"100vh",margin:"0 auto",background:D.bg,fontFamily:"'DM Sans',sans-serif",color:D.textPrimary,position:"relative",overflow:"hidden"};

  return (
    <div style={WRAP}>
      <style>{CSS}</style><ProfileBtn/>

      {sc!==S.ACTIVATING&&sc!==S.NIGHT&&sc!==S.NAP&&[...Array(20)].map((_,i)=>(
        <div key={i} className="str" style={{width:Math.random()>.7?3:2,height:Math.random()>.7?3:2,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,opacity:Math.random()*.4+.2,animation:`starFloat ${3+Math.random()*4}s ${Math.random()*4}s ease-in-out infinite`}} />
      ))}

      {/* SPLASH */}
      {authLoading&&<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0D1117"}}><CrescentMoon size={64} glow animate/></div>}
    {sc===S.LANDING&&<div style={{background:"#FAFAF8",color:"#2C2010",fontFamily:"'DM Sans',sans-serif",overflowX:"hidden"}}>
      {/* HERO */}
      <div style={{minHeight:"75vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"40px 24px",position:"relative",background:"radial-gradient(ellipse at 30% 30%, rgba(201,169,110,0.06) 0%, transparent 50%), #0D1117"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"70%",backgroundImage:"radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.35), transparent),radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.2), transparent),radial-gradient(1.5px 1.5px at 45% 8%, rgba(255,255,255,0.4), transparent),radial-gradient(1px 1px at 65% 25%, rgba(255,255,255,0.15), transparent),radial-gradient(1px 1px at 80% 45%, rgba(255,255,255,0.25), transparent),radial-gradient(1px 1px at 35% 55%, rgba(255,255,255,0.15), transparent),radial-gradient(1.5px 1.5px at 90% 12%, rgba(201,169,110,0.5), transparent),radial-gradient(1px 1px at 55% 42%, rgba(255,255,255,0.2), transparent)"}}/>
        <div style={{position:"relative",zIndex:1,maxWidth:560}}>
          <div style={{width:90,height:90,margin:"0 auto 28px",animation:"float 6s ease-in-out infinite"}}>
            <svg width="90" height="90" viewBox="0 0 120 120">
              <defs>
                <radialGradient id="lmg" cx="30%" cy="28%" r="70%"><stop offset="0%" stopColor="#FDF0D5"/><stop offset="100%" stopColor="#C9A96E"/></radialGradient>
                <filter id="lglow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <circle cx="58" cy="62" r="38" fill="url(#lmg)" filter="url(#lglow)"/>
              <circle cx="78" cy="48" r="32" fill="#0D1117"/>
              <circle cx="88" cy="28" r="2" fill="#F5E6C8" opacity="0.7"/>
              <circle cx="98" cy="38" r="1.2" fill="#F5E6C8" opacity="0.5"/>
              <circle cx="92" cy="52" r="1" fill="#F5E6C8" opacity="0.4"/>
            </svg>
          </div>
          <h1 className="landing-hero-title" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:68,fontWeight:300,letterSpacing:4,marginBottom:6,color:"#EDE8DF"}}>Nuette</h1>
          <p style={{fontSize:12,color:"rgba(237,232,223,0.3)",letterSpacing:2,marginBottom:14}}>( noo-ett )</p>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontWeight:300,fontSize:22,color:"#E8C98A",letterSpacing:1,marginBottom:20}}>Your calm at 3am.</p>
          <p style={{fontSize:15,color:"rgba(237,232,223,0.6)",lineHeight:1.7,marginBottom:40,maxWidth:400,marginLeft:"auto",marginRight:"auto"}}>Luna knows your baby, your method, and exactly what night you're on. She stays with you in real time — because no parent should sit alone on the hallway floor at 3am.</p>
          <button onClick={()=>{setAuthMode("signup");setSc(S.AUTH);}} style={{display:"inline-block",padding:"16px 48px",background:"linear-gradient(135deg,#C9A96E,#E8C98A)",color:"#0D1117",border:"none",borderRadius:14,fontSize:16,fontWeight:600,fontFamily:"'DM Sans',sans-serif",letterSpacing:0.5,cursor:"pointer",boxShadow:"0 4px 24px rgba(201,169,110,0.3)",transition:"all 0.3s ease"}}>Meet Luna</button>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{padding:"100px 24px",background:"#FAFAF8",textAlign:"center"}}>
        <p style={{fontSize:11,letterSpacing:5,textTransform:"uppercase",color:"#C9A96E",marginBottom:16}}>How it works</p>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,fontWeight:300,color:"#2C2010",marginBottom:60,letterSpacing:1}}>Three steps to peaceful nights</h2>
        <div style={{display:"flex",gap:28,maxWidth:900,margin:"0 auto",flexWrap:"wrap",justifyContent:"center"}}>
          {[
            {icon:"👶",title:"Tell us about your baby",desc:"Name, age, and what sleep looks like now. Luna learns your family's unique situation."},
            {icon:"🌙",title:"Choose your method",desc:"Ferber, Chair Method, Gentle — pick what feels right. Luna adapts her coaching to your approach."},
            {icon:"💛",title:"Luna takes it from here",desc:"Bedtime. Naps. 3am wake-ups. Luna coaches you through all of it in real time — and tracks your baby's progress night after night."}
          ].map((step,i)=>(
            <div key={i} style={{flex:1,minWidth:240,maxWidth:280,padding:"40px 28px",background:"#fff",border:"1px solid rgba(201,169,110,0.15)",borderRadius:20,boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:32,marginBottom:16}}>{step.icon}</div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,color:"#2C2010",marginBottom:10}}>{step.title}</h3>
              <p style={{fontSize:14,color:"#8a8070",lineHeight:1.6}}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SCREENSHOTS */}
      <div style={{padding:"100px 24px",background:"linear-gradient(180deg, #FAFAF8, #F0EBE0)",textAlign:"center",overflow:"hidden"}}>
        <p style={{fontSize:11,letterSpacing:5,textTransform:"uppercase",color:"#C9A96E",marginBottom:16}}>The experience</p>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,fontWeight:300,color:"#2C2010",marginBottom:60,letterSpacing:1}}>Built for the hardest moments</h2>
        <div style={{display:"flex",gap:28,justifyContent:"center",alignItems:"center",flexWrap:"wrap"}}>
          {/* Day mode phone */}
          <div style={{width:220,height:440,background:"#0D1117",borderRadius:28,border:"3px solid #2a2520",overflow:"hidden",position:"relative",boxShadow:"0 24px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(201,169,110,0.1)"}}>
            <div style={{width:100,height:22,background:"#000",borderRadius:"0 0 14px 14px",margin:"0 auto",position:"relative",zIndex:2}}/>
            <div style={{padding:16,height:"calc(100% - 22px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#F5EFE4"}}>
              <p style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#8a8070",opacity:0.6,marginBottom:8}}>Day Mode</p>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:300,color:"#2C2010",marginBottom:16}}>Today's Schedule</p>
              {[["7:00 AM","Wake up"],["9:30 AM","Nap 1"],["1:00 PM","Nap 2"],["4:00 PM","Nap 3"],["7:30 PM","Bedtime"]].map(([time,label],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",width:"100%",padding:"8px 0",borderBottom:i<4?"1px solid rgba(44,32,16,0.08)":"none",fontSize:11,color:"#6B6560"}}><span style={{fontWeight:500,color:"#2C2010"}}>{time}</span><span>{label}</span></div>
              ))}
            </div>
          </div>
          {/* Night mode phone (center, larger) */}
          <div style={{width:220,height:440,background:"#0D1117",borderRadius:28,border:"3px solid #2a2520",overflow:"hidden",position:"relative",transform:"scale(1.08)",boxShadow:"0 28px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(201,169,110,0.15)"}}>
            <div style={{width:100,height:22,background:"#000",borderRadius:"0 0 14px 14px",margin:"0 auto",position:"relative",zIndex:2}}/>
            <div style={{padding:16,height:"calc(100% - 22px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at center, #1a1a2e, #0D1117)"}}>
              <div style={{fontSize:32,marginBottom:8}}>🌙</div>
              <p style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#C9A96E",opacity:0.6,marginBottom:8}}>Night 3</p>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:300,color:"#EDE8DF",marginBottom:16}}>Luna is with you</p>
              <div style={{background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.15)",borderRadius:12,padding:"10px 14px",fontSize:11,color:"#C9A96E",lineHeight:1.5,textAlign:"left",width:"100%",marginBottom:8}}>She's doing great. At this stage, 8 minutes of fussing is completely normal. Stay the course.</div>
              <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 14px",fontSize:11,color:"#8a8070",lineHeight:1.5,textAlign:"left",width:"100%",marginBottom:8,marginLeft:"20%"}}>She's been crying for 6 min. Should I go in?</div>
              <div style={{background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.15)",borderRadius:12,padding:"10px 14px",fontSize:11,color:"#C9A96E",lineHeight:1.5,textAlign:"left",width:"100%"}}>Not yet. Your next check-in is at 10 minutes. You've got this. 💛</div>
            </div>
          </div>
          {/* Nap phone */}
          <div style={{width:220,height:440,background:"#0D1117",borderRadius:28,border:"3px solid #2a2520",overflow:"hidden",position:"relative",boxShadow:"0 24px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(201,169,110,0.1)"}}>
            <div style={{width:100,height:22,background:"#000",borderRadius:"0 0 14px 14px",margin:"0 auto",position:"relative",zIndex:2}}/>
            <div style={{padding:16,height:"calc(100% - 22px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at center, #1a1a2e, #0D1117)"}}>
              <p style={{fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"#C9A96E",opacity:0.6,marginBottom:8}}>Nap Coaching</p>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:300,color:"#EDE8DF",marginBottom:16}}>Ask Luna anything</p>
              <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 14px",fontSize:11,color:"#8a8070",lineHeight:1.5,textAlign:"left",width:"100%",marginBottom:8,marginLeft:"20%"}}>His nap was only 32 min. Is that okay?</div>
              <div style={{background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.15)",borderRadius:12,padding:"10px 14px",fontSize:11,color:"#C9A96E",lineHeight:1.5,textAlign:"left",width:"100%"}}>Short naps are really common during training. Anything over 30 min still counts. Night sleep improving is the first win — naps usually follow within a week.</div>
            </div>
          </div>
        </div>
      </div>

      {/* MEET LUNA QUOTE */}
      <div style={{padding:"80px 24px",background:"#FAFAF8",textAlign:"center"}}>
        <p style={{fontSize:11,letterSpacing:5,textTransform:"uppercase",color:"#C9A96E",marginBottom:16}}>Why Luna?</p>
        <div style={{maxWidth:500,margin:"0 auto",padding:"40px 32px",background:"linear-gradient(135deg, #1a1f2e, #0D1117)",borderRadius:24,border:"1px solid rgba(201,169,110,0.1)"}}>
          <div style={{fontSize:28,marginBottom:12}}>🌙</div>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:18,color:"#C9A96E",lineHeight:1.7,marginBottom:16}}>"It's 3am. Your baby's been crying for twelve minutes. You're sitting on the hallway floor wondering if you're doing this wrong. That's exactly the moment I was built for."</p>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontStyle:"normal",fontSize:12,color:"#6B6560",letterSpacing:3,textTransform:"uppercase"}}>— Luna</span>
        </div>
        <p style={{maxWidth:400,margin:"28px auto 0",fontSize:14,color:"#8a8070",lineHeight:1.7,textAlign:"center"}}>Not a search engine. Not a sleep article. Luna is a coach who knows your baby by name, what night you're on, and your chosen method — and she's right there with you through every nap, every bedtime, and every 3am wake-up.</p>
      </div>

      {/* FOOTER CTA */}
      <div style={{padding:"100px 24px",textAlign:"center",background:"linear-gradient(180deg, #FAFAF8, #F0EBE0)"}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:42,fontWeight:300,color:"#2C2010",marginBottom:12}}>Rest begins here.</h2>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:18,color:"#C9A96E",marginBottom:36}}>You don't have to figure this out alone.</p>
        <button onClick={()=>{setAuthMode("signup");setSc(S.AUTH);}} style={{display:"inline-block",padding:"16px 48px",background:"#1a1f2e",color:"#E8C98A",border:"none",borderRadius:14,fontSize:16,fontWeight:600,fontFamily:"'DM Sans',sans-serif",letterSpacing:0.5,cursor:"pointer",boxShadow:"0 4px 24px rgba(0,0,0,0.15)",transition:"all 0.3s ease"}}>Try Nuette</button>
        <div style={{marginTop:60,display:"flex",gap:24,justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/terms" style={{color:"#8a8070",textDecoration:"none",fontSize:13}}>Terms of Service</a>
          <a href="/privacy" style={{color:"#8a8070",textDecoration:"none",fontSize:13}}>Privacy Policy</a>
          <a href="mailto:hello@nuette.app" style={{color:"#8a8070",textDecoration:"none",fontSize:13}}>Contact</a>
        </div>
        <p style={{marginTop:24,fontSize:12,color:"#c4beb5"}}>© 2026 Nuette. All rights reserved.</p>
      </div>

      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:0.8}}@media(max-width:600px){.landing-hero-title{font-size:48px!important}}`}</style>
    </div>}

    {sc===S.AUTH&&<div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0D1117,#1a1f2e)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{width:"100%",maxWidth:360,textAlign:"center"}}>
        <CrescentMoon size={80} glow animate/>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:42,color:"#EDE8DF",fontWeight:300,margin:"24px 0 4px",letterSpacing:1}}>Nuette</h1>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#C9A96E",fontSize:18,marginBottom:40,letterSpacing:0.5}}>Your calm at 3am.</p>
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
    {!authLoading&&sc===S.SPLASH&&(
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at center,#1a1a2e 0%,#0D1117 70%)",animation:"fadeIn .8s ease"}}>
          <CrescentMoon size={110} glow animate />
          <div style={{textAlign:"center",marginTop:24}}>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:42,fontWeight:300,letterSpacing:6,color:"#EDE8DF",textTransform:"uppercase"}}>Nuette</h1>
            <p style={{fontSize:13,color:"#6B6560",letterSpacing:3,textTransform:"uppercase",marginTop:8}}>your calm at 3am</p>
          </div>
        </div>
      )}

      {/* ONBOARDING 1 */}
      {sc===S.ON1&&(
        <div style={{minHeight:"100vh",padding:"80px 32px 48px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div>
            <div className="f1" style={{marginBottom:44}}><CrescentMoon size={72} glow animate /></div>
            <h1 className="f2" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:44,fontWeight:300,lineHeight:1.15,marginBottom:20}}>Peaceful nights<br /><em style={{color:"#C9A96E"}}>are possible.</em></h1>
            <p className="f3" style={{fontSize:15,color:"#8B8680",lineHeight:1.7,maxWidth:300}}>Science-backed sleep training with an expert available to guide you through every moment — especially the hard ones at 2am.</p>
          </div>
          <div className="f4">
            <div style={{display:"flex",gap:8,marginBottom:16}}>{[0,1,2].map(i=><div key={i} style={{height:2,flex:1,borderRadius:1,background:i===0?"#C9A96E":"rgba(255,255,255,0.1)"}} />)}</div>
            <button className="bp" onClick={()=>setSc(S.ON2)}>Get Started</button>
          </div>
        </div>
      )}

      {/* ONBOARDING 2 */}
      {sc===S.ON2&&(
        <div style={{minHeight:"100vh",padding:"80px 32px 48px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div>
            <div className="f1" style={{fontSize:56,marginBottom:44}}>🌙</div>
            <h1 className="f2" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:44,fontWeight:300,lineHeight:1.15,marginBottom:20}}>Meet Luna,<br /><em style={{color:"#C9A96E"}}>your sleep expert.</em></h1>
            <p className="f3" style={{fontSize:15,color:"#8B8680",lineHeight:1.7,marginBottom:24}}>Luna is your personal AI sleep consultant — calm, warm, and available every hour of the day and night.</p>
            <div className="f4 lb">
              <p style={{fontSize:14,color:"#C9A96E",fontStyle:"italic",lineHeight:1.65}}>"It's 3am. Take a breath. I'm here. Tell me what's happening with your baby right now."</p>
              <p style={{fontSize:12,color:"#6B6560",marginTop:8}}>— Luna</p>
            </div>
          </div>
          <div className="f5">
            <div style={{display:"flex",gap:8,marginBottom:16}}>{[0,1,2].map(i=><div key={i} style={{height:2,flex:1,borderRadius:1,background:i===1?"#C9A96E":"rgba(255,255,255,0.1)"}} />)}</div>
            <button className="bp" onClick={()=>setSc(S.ON3)}>Continue</button>
          </div>
        </div>
      )}

      {/* ONBOARDING 3 */}
      {sc===S.ON3&&(
        <div style={{minHeight:"100vh",padding:"80px 32px 48px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div>
            <div className="f1" style={{fontSize:56,marginBottom:44}}>✨</div>
            <h1 className="f2" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:44,fontWeight:300,lineHeight:1.15,marginBottom:20}}>A plan built<br /><em style={{color:"#C9A96E"}}>for your baby.</em></h1>
            <p className="f3" style={{fontSize:15,color:"#8B8680",lineHeight:1.7,marginBottom:24}}>Luna learns about your baby, explains what's happening, and guides you through every moment of the night.</p>
            <div className="f4" style={{display:"flex",flexDirection:"column",gap:10}}>
              {["Personalised sleep diagnosis","Method matched to your comfort level","Step-by-step briefing before you start","Real-time hand-holding through the night"].map((f,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(201,169,110,0.2)",border:"1px solid rgba(201,169,110,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#C9A96E",flexShrink:0}}>✓</div>
                  <span style={{fontSize:14,color:"#8B8680"}}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="f5">
            <div style={{display:"flex",gap:8,marginBottom:16}}>{[0,1,2].map(i=><div key={i} style={{height:2,flex:1,borderRadius:1,background:i===2?"#C9A96E":"rgba(255,255,255,0.1)"}} />)}</div>
            <button className="bp" onClick={()=>setSc(S.BABY)}>Let's Begin</button>
          </div>
        </div>
      )}

      {/* BABY SETUP */}
      {sc===S.BABY&&(
        <div style={{minHeight:"100vh",padding:"60px 28px 48px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div>
            <button className="bg" onClick={()=>setSc(S.ON3)} style={{marginBottom:20,fontSize:13}}>← Back</button>
            <h2 className="f1" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:300,marginBottom:6}}>Tell us about<br />your baby</h2>
            <p className="f2" style={{fontSize:14,color:"#6B6560",marginBottom:32}}>Luna will use this to personalise everything.</p>
            <div className="f3" style={{marginBottom:24}}>
              <label style={{fontSize:12,color:"#6B6560",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}}>Baby's name</label>
              <input className="if" placeholder="Enter name..." value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <div className="f4">
              <label style={{fontSize:12,color:"#6B6560",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}}>Age in months</label>
              <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"24px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:16}}>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:52,fontWeight:300,color:"#C9A96E"}}>{age}</span>
                  <span style={{fontSize:14,color:"#6B6560"}}>months old</span>
                </div>
                <div className="slw"><input type="range" min={4} max={12} value={age} onChange={e=>setAge(Number(e.target.value))} /></div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                  <span style={{fontSize:11,color:"#4A4640"}}>4 months</span>
                  <span style={{fontSize:11,color:"#4A4640"}}>12 months</span>
                </div>
              </div>
              {age<=5&&<div style={{background:"rgba(252,165,165,0.12)",border:"1px solid rgba(252,165,165,0.25)",color:"#FCA5A5",borderRadius:12,padding:"10px 14px",fontSize:13,marginTop:12,lineHeight:1.5}}>⭐ Early Start Mode — extra gentle guidance for babies under 6 months.</div>}
              <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:14,marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[{l:"Naps/day",v:ww.naps},{l:"Wake Window",v:ww.window},{l:"Night Sleep",v:ww.night}].map((s,i)=>(
                  <div key={i} style={{textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:500,color:"#C9A96E"}}>{s.v}</div>
                    <div style={{fontSize:10,color:"#4A4640",marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="f5" style={{paddingTop:24}}>
            <button className="bp" disabled={!name.trim()} onClick={()=>setSc(S.PED)}>Continue →</button>
          </div>
        </div>
      )}

      {/* PED CHECK */}
      {sc===S.PED&&(
        <div style={{minHeight:"100vh",padding:"60px 28px 48px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div>
            <button className="bg" onClick={()=>setSc(S.BABY)} style={{marginBottom:20,fontSize:13}}>← Back</button>
            <div className="f1" style={{fontSize:48,marginBottom:20}}>👶</div>
            <h2 className="f2" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:300,lineHeight:1.2,marginBottom:12}}>One important<br />question first</h2>
            <p className="f3" style={{fontSize:15,color:"#8B8680",lineHeight:1.7,marginBottom:28}}>Has your pediatrician cleared {name} for sleep training? We always recommend checking with your doctor first, especially for babies under 6 months.</p>
            <div className="f4" style={{display:"flex",flexDirection:"column",gap:12}}>
              {[{id:"yes",label:"Yes, we're cleared to start",icon:"✅",sub:"Let's get started!"},{id:"no",label:"Not yet / I'm not sure",icon:"🩺",sub:"We recommend checking first"}].map(opt=>(
                <div key={opt.id} className={`oc ${ped===opt.id?"sl":""}`} onClick={()=>setPed(opt.id)} style={{flexDirection:"column",alignItems:"flex-start",gap:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:22}}>{opt.icon}</span><span style={{fontSize:15,color:"#EDE8DF",fontWeight:500}}>{opt.label}</span></div>
                  <span style={{fontSize:12,color:"#6B6560",paddingLeft:34}}>{opt.sub}</span>
                </div>
              ))}
              {ped==="no"&&<div style={{background:"rgba(252,211,77,0.08)",border:"1px solid rgba(252,211,77,0.2)",borderRadius:16,padding:16,animation:"fadeIn .3s ease"}}><p style={{fontSize:13,color:"#FCD34D",lineHeight:1.6}}>💛 That's totally okay! You can still explore the app and learn about sleep training methods. We'll be right here when you're ready to start.</p></div>}
            </div>
          </div>
          <div className="f5" style={{paddingTop:24}}>
            <button className="bp" disabled={!ped} onClick={()=>{if(ped==="yes"){setQi(0);setSc(S.INTAKE);}else{setSc(S.HOME);}}}>
              {ped==="yes"?"Start Luna's Assessment →":ped==="no"?"Explore the App →":"Select an option"}
            </button>
          </div>
        </div>
      )}

      {/* INTAKE */}
      {sc===S.INTAKE&&cq&&(
        <div style={{minHeight:"100vh",padding:"52px 28px 48px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div style={{flex:1}}>
            <div style={{marginBottom:28}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:12,color:"#6B6560"}}>Luna's Assessment</span>
                <span style={{fontSize:12,color:"#C9A96E"}}>{qi+1} of {IQ.length}</span>
              </div>
              <div className="pb"><div className="pf" style={{width:`${((qi+1)/IQ.length)*100}%`}} /></div>
            </div>
            <div style={{display:"flex",gap:12,marginBottom:24,alignItems:"flex-start"}}>
              <div style={{flexShrink:0,marginTop:2}}><CrescentMoon size={36} glow animate /></div>
              <div className="lb" style={{flex:1}}>
                <p style={{fontSize:15,color:"#EDE8DF",lineHeight:1.6,marginBottom:4}}>{cq.q.replace("{n}",name||"your baby")}</p>
                <p style={{fontSize:12,color:"#6B6560"}}>{cq.sub}</p>
              </div>
            </div>
            {cq.freeText?(
              <div>
                <textarea className="if" placeholder={cq.placeholder} value={notes} onChange={e=>setNotes(e.target.value)} rows={5} style={{resize:"none",lineHeight:1.65,fontSize:14,padding:"16px"}} />
                <p style={{fontSize:12,color:"#4A4640",marginTop:10,lineHeight:1.6}}>This is optional — but anything you share helps Luna give better, more personalised guidance. 💛</p>
              </div>
            ):(
              <div>
                {cq.opts.map(opt=>{
                  const sel=cq.multi?(ans[cq.id]||[]).includes(opt.id):ans[cq.id]===opt.id;
                  return(
                    <div key={opt.id} className={`oc ${sel?"sl":""}`} onClick={()=>handleAns(cq.id,opt.id,cq.multi)}>
                      <span style={{fontSize:22,flexShrink:0}}>{opt.icon}</span>
                      <span style={{fontSize:14,color:sel?"#EDE8DF":"#8B8680",flex:1,transition:"color .2s"}}>{opt.label}</span>
                      {sel&&<span style={{color:"#C9A96E",fontSize:16,flexShrink:0,animation:"checkPop .3s ease"}}>✓</span>}
                    </div>
                  );
                })}
                {cq.multi&&<p style={{fontSize:12,color:"#4A4640",marginTop:8,textAlign:"center"}}>Select all that apply</p>}
              </div>
            )}
          </div>
          <div style={{paddingTop:20}}>
            {qi>0&&<button className="bg" onClick={()=>setQi(p=>p-1)} style={{width:"100%",marginBottom:8,textAlign:"center"}}>← Previous</button>}
            <button className="bp" disabled={!canAdv} onClick={advQ}>{qi===IQ.length-1?"Show Luna's Assessment →":"Next →"}</button>
          </div>
        </div>
      )}

      {/* DIAGNOSIS */}
      {sc===S.DIAG&&diag&&(
        <div style={{minHeight:"100vh",padding:"52px 28px 100px",overflowY:"auto"}}>
          <div className="f1" style={{display:"flex",alignItems:"center",gap:14,marginBottom:28}}>
            <CrescentMoon size={48} glow animate />
            <div><div style={{fontSize:16,fontWeight:500,color:"#EDE8DF"}}>Luna's Assessment</div><div style={{fontSize:12,color:"#4CAF50"}}>● Complete</div></div>
          </div>
          <h2 className="f2" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:300,lineHeight:1.25,marginBottom:20}}>Here's what's happening with <em style={{color:"#C9A96E"}}>{name}</em></h2>
          <div className="f3 lb" style={{marginBottom:20}}>
            {diag.diag.split("\n\n").map((p,i,arr)=>(
              <p key={i} style={{fontSize:14,color:"#D4CFC8",lineHeight:1.7,marginBottom:i<arr.length-1?12:0}}>{p}</p>
            ))}
          </div>
          <div className="f4" style={{background:"rgba(252,211,77,0.07)",border:"1px solid rgba(252,211,77,0.15)",borderRadius:14,padding:14,marginBottom:16}}>
            <p style={{fontSize:12,color:"#FCD34D",lineHeight:1.6}}>💛 This assessment is based on common sleep behavioural patterns. For any health or feeding concerns, always consult your pediatrician first.</p>
          </div>
          {notes.trim()&&(
            <div className="f5" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:14,marginBottom:16}}>
              <p style={{fontSize:11,color:"#4A4640",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>You mentioned</p>
              <p style={{fontSize:13,color:"#8B8680",lineHeight:1.65,fontStyle:"italic"}}>"{notes}"</p>
              <p style={{fontSize:12,color:"#4A4640",marginTop:8}}>Luna has noted this and will factor it into her guidance throughout your training.</p>
            </div>
          )}
          <div className="f5" style={{marginBottom:20}}>
            <p style={{fontSize:12,color:"#6B6560",letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Luna's Recommendation</p>
            {(()=>{const rec=METHODS.find(m=>m.id===diag.rec);return rec?(
              <div style={{background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.3)",borderRadius:20,padding:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div><div style={{fontSize:16,color:"#EDE8DF",fontWeight:500}}>{rec.name}</div><div style={{fontSize:12,color:rec.color,marginTop:2}}>{rec.sub}</div></div>
                  <div style={{background:"#C9A96E",borderRadius:8,padding:"4px 10px",fontSize:11,color:"#0D1117",fontWeight:600}}>Best Fit</div>
                </div>
                <p style={{fontSize:13,color:"#8B8680",lineHeight:1.55}}>{rec.desc}</p>
                <div style={{display:"flex",gap:12,marginTop:14}}><span style={{fontSize:15,fontWeight:600,color:"#C9A96E"}}>⏱ {rec.time}</span><span style={{fontSize:15,fontWeight:600,color:"#C9A96E"}}>😢 Crying: {rec.cry}</span></div>
              </div>
            ):null;})()}
          </div>
          <div className="f6" style={{display:"flex",flexDirection:"column",gap:12}}>
            <button className="bp" onClick={()=>{setBs(0);setSc(S.BRIEF);}}>Continue with Luna's Recommendation →</button>
            <button className="bg" style={{textAlign:"center",fontSize:13}} onClick={()=>setSc(S.METHOD)}>See all sleep methods</button>
          </div>
        </div>
      )}

      {/* METHOD */}
      {sc===S.METHOD&&(
        <div style={{minHeight:"100vh",padding:"52px 24px 100px",overflowY:"auto"}}>
          <button className="bg" onClick={()=>setSc(S.DIAG)} style={{marginBottom:16,fontSize:13}}>← Back</button>
          <h2 className="f1" style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:300,lineHeight:1.2,marginBottom:6}}>Choose your<br />sleep method</h2>
          <p className="f2" style={{fontSize:14,color:"#6B6560",marginBottom:24}}>Luna's recommendation is highlighted. All methods are science-backed.</p>
          {METHODS.map((m,i)=>{
            const isRec=diag?.rec===m.id,isSel=method===m.id;
            return(
              <div key={m.id} className={`mc f${Math.min(i+2,6)} ${isSel?"sl":""}`} onClick={()=>setMethod(m.id)}>
                {isRec&&<div style={{position:"absolute",top:-1,right:16,background:"#C9A96E",borderRadius:"0 0 10px 10px",padding:"3px 12px",fontSize:10,color:"#0D1117",fontWeight:600,letterSpacing:.5}}>LUNA RECOMMENDS</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,paddingTop:isRec?8:0}}>
                  <div><div style={{fontSize:16,fontWeight:500,color:"#EDE8DF"}}>{m.name}</div><div style={{fontSize:12,color:isDayMode?"#2E1A08":m.color,marginTop:2}}>{m.sub}</div></div>
                  <div style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${isSel?"#C9A96E":"rgba(255,255,255,0.15)"}`,background:isSel?"#C9A96E":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
                    {isSel&&<span style={{fontSize:11,color:"#0D1117"}}>✓</span>}
                  </div>
                </div>
                <p style={{fontSize:13,color:"#6B6560",lineHeight:1.5,marginBottom:12}}>{m.desc}</p>
                <div style={{display:"flex",gap:12,marginTop:8}}><span style={{fontSize:15,fontWeight:600,color:"#C9A96E"}}>⏱ {m.time}</span><span style={{fontSize:15,fontWeight:600,color:"#C9A96E"}}>😢 Crying: {m.cry}</span></div>
              </div>
            );
          })}
          {method&&<div style={{animation:"slideUp .3s ease",paddingTop:8}}><button className="bp" onClick={()=>{setBs(0);setSc(S.BRIEF);}}>Continue to Tonight's Briefing →</button></div>}
        </div>
      )}

      {/* BRIEFING */}
      {sc===S.BRIEF&&(()=>{
        const BSTEPS=["Before we begin","Tonight's routine","Your method","What you'll hear","You've got this"];
        return(
          <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
            <div style={{padding:"52px 24px 16px",background:"rgba(13,17,23,0.98)",borderBottom:"1px solid rgba(255,255,255,0.06)",position:"sticky",top:0,zIndex:20}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <CrescentMoon size={30} glow animate />
                <div style={{flex:1}}><div style={{fontSize:12,color:"#C9A96E",letterSpacing:.5}}>Luna's Briefing</div><div style={{fontSize:15,fontWeight:500,color:"#EDE8DF"}}>{BSTEPS[bs]}</div></div>
                <span style={{fontSize:12,color:"#4A4640"}}>{bs+1} / {BSTEPS.length}</span>
              </div>
              <div className="pb"><div className="pf" style={{width:`${((bs+1)/BSTEPS.length)*100}%`}} /></div>
            </div>
            <div key={bs} style={{flex:1,overflowY:"auto",padding:"24px 24px 140px",animation:"fadeUp .4s ease"}}>
              {bs===0&&(
                <div>
                  <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:24}}>
                    <div style={{flexShrink:0}}><CrescentMoon size={44} glow animate /></div>
                    <div className="lb" style={{flex:1}}>
                      <p style={{fontSize:15,color:"#C9A96E",fontStyle:"italic",lineHeight:1.7,marginBottom:14}}>"Before we begin tonight, I need you to hear something."</p>
                      <p style={{fontSize:14,color:"#D4CFC8",lineHeight:1.75,marginBottom:12}}>Tonight is going to be hard. When {name} cries, every instinct you have will tell you to go in, pick them up, and make it stop. That instinct comes from love — and it's also the thing that's been keeping you both stuck.</p>
                      <p style={{fontSize:14,color:"#D4CFC8",lineHeight:1.75,marginBottom:12}}>Sleep training isn't about leaving your baby alone. It's about giving them the greatest gift you can — the ability to fall asleep independently, so they can sleep through the night for the rest of their life.</p>
                      <p style={{fontSize:14,color:"#D4CFC8",lineHeight:1.75}}>I will be right here with you. Every minute. Message me anything. I'll tell you exactly what it means and what to do next.</p>
                    </div>
                  </div>
                  <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:20,padding:20}}>
                    <p style={{fontSize:12,color:"#4A4640",letterSpacing:1,textTransform:"uppercase",marginBottom:16}}>What tonight will feel like</p>
                    {[{icon:"😔",l:"The first cry will break your heart",d:"This is normal. It means you love your baby. It doesn't mean you're doing anything wrong."},{icon:"⏱️",l:"Every minute will feel like ten",d:"Have your phone with you. Message Luna whenever you need to."},{icon:"🌊",l:"It may get worse before it gets better",d:"Crying often peaks around 20–40 minutes before dropping. This is the extinction curve — and it works."},{icon:"🌅",l:"Tomorrow morning will feel different",d:`Most families report a profound shift after Night 1. You'll be tired but proud.`}].map((item,i,arr)=>(
                      <div key={i} style={{display:"flex",gap:12,paddingBottom:i<arr.length-1?14:0,marginBottom:i<arr.length-1?14:0,borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
                        <span style={{fontSize:22,flexShrink:0}}>{item.icon}</span>
                        <div><div style={{fontSize:14,color:"#EDE8DF",fontWeight:500,marginBottom:4}}>{item.l}</div><div style={{fontSize:13,color:"#6B6560",lineHeight:1.6}}>{item.d}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {bs===1&&(
                <div>
                  <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:300,marginBottom:6}}>Tonight's Routine</h3>
                  <p style={{fontSize:14,color:"#6B6560",lineHeight:1.6,marginBottom:20}}>Follow this order every single night. Consistency builds the sleep signal in {name}'s brain.</p>
                  <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:20,padding:20,marginBottom:16}}>
                    {[{icon:"🛁",step:"1",l:"Bath",d:"Warm water lowers body temperature, triggering natural sleepiness. 5–10 minutes."},{icon:"🤲",step:"2",l:"Massage",d:"Gentle lotion massage. Calms the nervous system and signals the end of the active day."},{icon:"🍼",step:"3",l:"Feed",d:`Feed ${name} here — not last. This is the most important change tonight.`},{icon:"📖",step:"4",l:"Book",d:"One calm book. The same book each night becomes part of the sleep signal over time."},{icon:"🛏️",step:"5",l:"Crib — drowsy but awake",d:`Say "I love you, goodnight" and place ${name} down before they're fully asleep.`}].map((item,i,arr)=>(
                      <div key={i} style={{display:"flex",gap:14,paddingBottom:i<arr.length-1?16:0,marginBottom:i<arr.length-1?16:0,borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
                        <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(201,169,110,0.15)",border:"1px solid rgba(201,169,110,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{item.icon}</div>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><span style={{fontSize:10,color:"#C9A96E",fontWeight:600,letterSpacing:.5}}>STEP {item.step}</span><span style={{fontSize:15,color:"#EDE8DF",fontWeight:500}}>{item.l}</span></div>
                          <p style={{fontSize:13,color:"#6B6560",lineHeight:1.6}}>{item.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:"rgba(252,211,77,0.08)",border:"1px solid rgba(252,211,77,0.2)",borderRadius:16,padding:16}}>
                    <p style={{fontSize:13,color:"#FCD34D",fontWeight:500,marginBottom:6}}>💡 Why feed before book, not last?</p>
                    <p style={{fontSize:13,color:"#FCD34D",opacity:.85,lineHeight:1.65}}>Feeding last creates a feed-to-sleep association — {name} learns that milk is the signal to sleep. Moving the feed earlier breaks this link.</p>
                  </div>
                </div>
              )}
              {bs===2&&mo&&(
                <div>
                  <div style={{marginBottom:20}}>
                    <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:300,marginBottom:4}}>{mo.name}</h3>
                    <p style={{fontSize:13,color:mo.color}}>{mo.sub}</p>
                  </div>
                  {ms.map((step,i)=>(
                    <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:16,marginBottom:10,display:"flex",gap:14,alignItems:"flex-start"}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(201,169,110,0.1)",border:"1px solid rgba(201,169,110,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:"#C9A96E",fontWeight:600}}>{i+1}</div>
                      <div>
                        <div style={{fontSize:11,color:"#C9A96E",letterSpacing:.5,marginBottom:5,fontWeight:600,textTransform:"uppercase"}}>{step.t}</div>
                        <p style={{fontSize:14,color:"#D4CFC8",lineHeight:1.65}}>{step.a}</p>
                      </div>
                    </div>
                  ))}
                  <div className="lb" style={{marginTop:16}}>
                    <p style={{fontSize:13,color:"#C9A96E",fontStyle:"italic",lineHeight:1.65}}>"Follow these steps exactly tonight. If you feel the urge to deviate — message me first. Consistency on Night 1 sets the tone for everything that follows."</p>
                    <p style={{fontSize:12,color:"#6B6560",marginTop:8}}>— Luna</p>
                  </div>
                </div>
              )}
              {bs===3&&(
                <div>
                  <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:300,marginBottom:6}}>What You'll Hear</h3>
                  <p style={{fontSize:14,color:"#6B6560",lineHeight:1.6,marginBottom:20}}>Every sound {name} makes tonight has a meaning. Nothing will catch you off guard.</p>
                  {CRY.map((cry,i)=>(
                    <div key={i} style={{background:`${cry.color}12`,border:`1px solid ${cry.color}30`,borderRadius:16,padding:"14px 16px",marginBottom:10,display:"flex",gap:12,alignItems:"flex-start"}}>
                      <span style={{fontSize:22,flexShrink:0}}>{cry.icon}</span>
                      <div>
                        <div style={{fontSize:14,color:"#EDE8DF",fontWeight:500,marginBottom:5}}>"{cry.sound}"</div>
                        <p style={{fontSize:13,color:"#8B8680",lineHeight:1.6}}>{cry.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {bs===4&&(
                <div>
                  <div style={{textAlign:"center",marginBottom:28}}><CrescentMoon size={80} glow animate /></div>
                  <div className="lb" style={{marginBottom:20}}>
                    <p style={{fontSize:15,color:"#C9A96E",fontStyle:"italic",lineHeight:1.75,marginBottom:14}}>"You know everything you need to know for tonight."</p>
                    <p style={{fontSize:14,color:"#D4CFC8",lineHeight:1.75,marginBottom:14}}>Thousands of families have sat exactly where you're sitting right now — hearts pounding, phone in hand, dreading and hoping at the same time. The vast majority made it through. Their babies slept. Their lives changed.</p>
                    <p style={{fontSize:15,color:"#C9A96E",fontStyle:"italic",lineHeight:1.75}}>"You've got this. {name} has got this. Let's go. 🌙"</p>
                    <p style={{fontSize:12,color:"#6B6560",marginTop:12}}>— Luna</p>
                  </div>
                </div>
              )}
            </div>
            <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,padding:"14px 24px 32px",background:"rgba(13,17,23,0.98)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,0.06)",zIndex:20}}>
              <button className="bg" onClick={()=>{if(bs===0)setSc(S.METHOD);else setBs(p=>p-1);}} style={{width:"100%",textAlign:"center",marginBottom:8}}>← Back</button>
              <button className="bp" onClick={()=>{if(bs===BSTEPS.length-1)setSc(S.PRELAUNCH);else setBs(p=>p+1);}}>
                {bs===BSTEPS.length-1?"See Tonight's Summary →":"Next →"}
              </button>
            </div>
          </div>
        );
      })()}

      {/* PRELAUNCH */}
      {sc===S.PRELAUNCH&&(
        <div style={{minHeight:"100vh",padding:"56px 24px 48px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div>
            <div className="f1" style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
              <CrescentMoon size={40} glow animate />
              <div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300}}>Ready for Night {nn}</div>
                <div style={{fontSize:13,color:"#6B6560",marginTop:2}}>{name} · {age} months · {mo?.name}</div>
              </div>
            </div>
            <p className="f2" style={{fontSize:11,color:"#4A4640",letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>Tonight's Routine</p>
            <div className="f3">
              {[{icon:"🛁",l:"Bath",d:"Warm bath to signal wind-down"},{icon:"🤲",l:"Massage",d:"Gentle lotion massage — calms the nervous system"},{icon:"🍼",l:"Feed",d:"Feed here — not last. Breaks the feed-to-sleep link."},{icon:"📖",l:"Book",d:"One calm, familiar book"},{icon:"🛏️",l:"Crib — drowsy but awake",d:`Say "I love you" then place ${name} down before fully asleep`}].map((item,i)=>(
                <div key={i} className="ci ck">
                  <span style={{fontSize:22,flexShrink:0}}>{item.icon}</span>
                  <div style={{flex:1}}><div style={{fontSize:14,color:"#EDE8DF",fontWeight:500,marginBottom:2}}>{item.l}</div><div style={{fontSize:12,color:"#6B6560",lineHeight:1.5}}>{item.d}</div></div>
                  <div style={{width:18,height:18,borderRadius:"50%",background:"rgba(201,169,110,0.2)",border:"1px solid rgba(201,169,110,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#C9A96E",flexShrink:0}}>✓</div>
                </div>
              ))}
            </div>
            <div className="f4 lb" style={{marginTop:16}}>
              <p style={{fontSize:13,color:"#C9A96E",fontStyle:"italic",lineHeight:1.65}}>"Everything is ready. When {name} is in the crib — activate Luna Night Mode and I'll be with you every minute."</p>
              <p style={{fontSize:12,color:"#6B6560",marginTop:8}}>— Luna</p>
            </div>
          </div>
          <div className="f5" style={{paddingTop:24}}>
            <button className="ba" onClick={()=>{saveProfile();setSc(S.ACTIVATING)}}>🌙 &nbsp; Begin Night {nn} with Luna →</button>
            <button className="bg" style={{width:"100%",textAlign:"center",marginTop:12}} onClick={()=>setSc(S.HOME)}>Not tonight — go to home</button>
          </div>
        </div>
      )}

      {/* ACTIVATING */}
      {sc===S.ACTIVATING&&(
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#05060a",position:"relative",overflow:"hidden"}}>
          {[...Array(40)].map((_,i)=>(
            <div key={i} className="nstr" style={{width:Math.random()>.8?3:Math.random()>.5?2:1,height:Math.random()>.8?3:Math.random()>.5?2:1,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,opacity:as2>=2?Math.random()*.6+.1:0,transition:`opacity ${.5+Math.random()}s ease ${Math.random()*1.5}s`}} />
          ))}
          <div style={{position:"absolute",width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,169,110,0.08) 0%,transparent 70%)",opacity:as2>=1?1:0,transition:"opacity 1.5s ease"}} />
          <div style={{transform:`scale(${as2>=1?1.2:.8})`,filter:`drop-shadow(0 0 ${as2>=3?60:as2>=2?30:10}px rgba(201,169,110,${as2>=3?.8:as2>=2?.5:.2}))`,transition:"all 1.2s ease",marginBottom:48}}>
            <CrescentMoon size={120} glow={false} />
          </div>
          <div style={{textAlign:"center",position:"relative",zIndex:10}}>
            <p style={{fontSize:12,letterSpacing:3,textTransform:"uppercase",color:"#4A4640",marginBottom:16,opacity:as2>=1?1:0,transition:"opacity .8s ease .3s"}}>Nuette</p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:300,color:"#C9A96E",opacity:as2>=1?1:0,transition:"opacity .8s ease .5s",marginBottom:16}}>Luna Night Mode</h2>
            <div style={{fontSize:14,color:"#6B6560",opacity:as2>=2?1:0,transition:"opacity .8s ease",marginBottom:8}}>Activating...</div>
            <div style={{display:"flex",justifyContent:"center",gap:8,opacity:as2>=2?1:0,transition:"opacity .6s ease .2s",marginBottom:24}}>
              {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#C9A96E",opacity:as2>=3?1:.3,transform:as2>=3?"scale(1.3)":"scale(1)",transition:`all .4s ease ${i*.15}s`}} />)}
            </div>
            <div style={{fontSize:15,color:"#8B8680",fontStyle:"italic",opacity:as2>=4?1:0,transform:as2>=4?"translateY(0)":"translateY(10px)",transition:"all .8s ease"}}>Luna is online. 🌙</div>
          </div>
        </div>
      )}

      {/* NIGHT MODE */}
      {sc===S.NIGHT&&(
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"#06070c"}}>
          {[...Array(35)].map((_,i)=>(
            <div key={i} className="nstr" style={{width:Math.random()>.8?2:1,height:Math.random()>.8?2:1,left:`${Math.random()*100}%`,top:`${Math.random()*80}%`,opacity:Math.random()*.5+.1,animation:`starFloat ${4+Math.random()*5}s ${Math.random()*4}s ease-in-out infinite`,position:"fixed"}} />
          ))}
          <div style={{padding:"52px 20px 16px",background:"rgba(6,7,12,0.98)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(201,169,110,0.08)",position:"sticky",top:0,zIndex:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{animation:"breatheI 3s ease-in-out infinite"}}><CrescentMoon size={36} glow /></div>
                <div>
                  <div style={{fontSize:14,fontWeight:500,color:"#C9A96E",letterSpacing:.5}}>Luna Night Mode</div>
                  <div style={{fontSize:11,color:"#4CAF50",marginTop:1}}>● Active · Night {nn} · {name}</div>
                </div>
              </div>
              <button onClick={()=>{setNn(p=>p+1);setSc(S.NIGHTSUMMARY);}} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"6px 12px",color:"#6B6560",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>End Night</button>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"20px 18px 140px",display:"flex",flexDirection:"column",gap:14}}>
            {nmsgs.map((msg,i)=>(
              <div key={i} style={{display:"flex",justifyContent:msg.role==="u"?"flex-end":"flex-start",alignItems:"flex-end",gap:10}}>
                {msg.role!=="u"&&<div style={{flexShrink:0,animation:"breatheI 3s ease-in-out infinite"}}><CrescentMoon size={30} glow /></div>}
                <div className={`bub ${msg.role==="u"?"bnu":"bna"}`}>{msg.text}</div>
              </div>
            ))}
            {typing&&<div style={{display:"flex",alignItems:"flex-end",gap:10}}><div style={{flexShrink:0}}><CrescentMoon size={30} glow /></div><div className="bub bna" style={{padding:"14px 18px"}}><span className="dot" style={{background:"#C9A96E"}} /><span className="dot" style={{background:"#C9A96E"}} /><span className="dot" style={{background:"#C9A96E"}} /></div></div>}
            <div ref={nref} />
          </div>
          <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,padding:"12px 24px 28px 20px",background:"rgba(6,7,12,0.98)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(201,169,110,0.08)",zIndex:50}}>
            <div style={{display:"flex",alignItems:"center",marginBottom:10,background:"rgba(201,169,110,0.07)",borderRadius:16,padding:"4px 4px 4px 14px"}}>
              <input placeholder={`Tell Luna what ${name} is doing...`} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendNight()} style={{flex:1,padding:"9px 0",background:"transparent",border:"none",outline:"none",color:"#EDE8DF",fontFamily:"'DM Sans',sans-serif",fontSize:15}} />
              <button onClick={sendNight} disabled={!inp.trim()||typing} style={{width:40,height:40,borderRadius:"50%",background:inp.trim()?"linear-gradient(135deg,#C9A96E,#E8C98A)":"transparent",border:"none",cursor:inp.trim()?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:inp.trim()?"#0D1117":"#4A4035"}}><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2l6 6H9v6H7V8H2z"/></svg></button>
            </div>
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:2}}>
              {[`${name} is crying`,"Eh eh sounds","Rocking on all fours","Calmed then crying again","Is this normal?"].map(q=>(
                <button key={q} onClick={()=>setInp(q)} style={{background:"rgba(201,169,110,0.05)",border:"1px solid rgba(201,169,110,0.12)",borderRadius:20,padding:"6px 13px",color:isDayMode?"#8B6535":"#6B5A3E",fontSize:11,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>{q}</button>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* NIGHT SUMMARY */}
      {sc===S.NIGHTSUMMARY&&(
        <div style={{minHeight:"100vh",padding:"60px 24px 48px",display:"flex",flexDirection:"column",justifyContent:"space-between",background:"linear-gradient(180deg,#0a0a12 0%,#0D1117 100%)"}}>
          <div>
            <div style={{textAlign:"center",marginBottom:32}}>
              <CrescentMoon size={72} glow animate />
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:38,fontWeight:300,marginTop:16,marginBottom:8}}>Night {nn-1} Complete</h2>
              <p style={{fontSize:15,color:"#8B8680",lineHeight:1.6}}>You made it. {name} made it. 🌙</p>
            </div>
            <div className="lb" style={{marginBottom:20}}>
              <p style={{fontSize:14,color:"#D4CFC8",lineHeight:1.75,marginBottom:12}}>Every night gets easier. The patterns {name} is building right now will shape how they sleep for years to come.</p>
              <p style={{fontSize:14,color:"#C9A96E",fontStyle:"italic",lineHeight:1.75}}>"Rest today. I will be back tonight for Night {nn}. You know what to do. 💛"</p>
              <p style={{fontSize:12,color:"#6B6560",marginTop:8}}>— Luna</p>
            </div>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:20,padding:20,marginBottom:16}}>
              <p style={{fontSize:12,color:"#4A4640",letterSpacing:1,textTransform:"uppercase",marginBottom:16}}>Tonight — Night {nn}</p>
              {[{icon:"🛁",l:"Bath"},{icon:"🤲",l:"Massage"},{icon:"🍼",l:"Feed"},{icon:"📖",l:"Book"},{icon:"🛏️",l:"Crib — drowsy but awake"}].map((item,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,paddingBottom:i<4?12:0,marginBottom:i<4?12:0,borderBottom:i<4?"1px solid rgba(255,255,255,0.05)":"none"}}>
                  <span style={{fontSize:20,flexShrink:0}}>{item.icon}</span>
                  <span style={{fontSize:14,color:"#8B8680"}}>{item.l}</span>
                </div>
              ))}
            </div>
            {mo&&(
              <div style={{background:"rgba(201,169,110,0.07)",border:"1px solid rgba(201,169,110,0.15)",borderRadius:16,padding:16}}>
                <p style={{fontSize:12,color:"#C9A96E",letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>Your method — {mo.name}</p>
                {(MSTEPS[method]||[]).slice(0,2).map((step,i)=>(
                  <p key={i} style={{fontSize:13,color:"#8B8680",lineHeight:1.65,marginBottom:i===0?8:0}}><span style={{color:"#C9A96E",fontWeight:500}}>{step.t}:</span> {step.a}</p>
                ))}
              </div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12,paddingTop:24}}>
            <button className="ba" onClick={()=>{setMDone(false);setNaps([{},{},{}]);setShowM(true);setSc(S.HOME);}}>🌅 Morning Check-in — Day {nn}</button>
            <button className="bg" style={{textAlign:"center",fontSize:13}} onClick={()=>{setMDone(false);setNaps([{},{},{}]);setSc(S.HOME);}}>Go to home</button>
          </div>
        </div>
      )}

      {/* MORNING MODAL */}
      {showM&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn .3s ease"}}>
          <div style={{width:"100%",maxWidth:390,background:"#0D1117",borderRadius:"24px 24px 0 0",padding:"28px 24px 40px",border:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <CrescentMoon size={36} glow animate />
                <div><div style={{fontSize:16,fontWeight:500,color:"#EDE8DF"}}>Good morning 🌅</div><div style={{fontSize:13,color:"#6B6560",marginTop:2}}>Let's build {name}'s day</div></div>
              </div>
              <button onClick={()=>{setShowM(false);setMDone(true);}} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}} aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8B8680" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,color:"#6B6560",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}}>What time did {name} wake up?</label>
              <input type="time" value={wt} onChange={e=>setWt(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 16px",color:"#EDE8DF",fontFamily:"'DM Sans',sans-serif",fontSize:20,width:"100%",outline:"none",colorScheme:"dark"}} />
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,color:"#6B6560",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}}>How was last night?</label>
              <div style={{display:"flex",gap:10}}>
                {[{id:"great",label:"😴 Great"},{id:"okay",label:"😐 Okay"},{id:"rough",label:"😩 Rough"}].map(opt=>(
                  <button key={opt.id} onClick={()=>setRating(opt.id)} style={{flex:1,background:rating===opt.id?"rgba(201,169,110,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${rating===opt.id?"rgba(201,169,110,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:12,padding:"10px 6px",color:rating===opt.id?"#C9A96E":"#8B8680",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s"}}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,color:"#6B6560",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}}>How many wake-ups?</label>
              <div style={{display:"flex",gap:8}}>
                {[0,1,2,3,"4+"].map(n=>(
                  <button key={n} onClick={()=>setWups(n)} style={{flex:1,background:wups===n?"rgba(201,169,110,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${wups===n?"rgba(201,169,110,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"10px 4px",color:wups===n?"#C9A96E":"#8B8680",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s"}}>{n}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:24}}>
              <label style={{fontSize:12,color:"#6B6560",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}}>Goal bedtime tonight</label>
              <input type="time" value={gbed} onChange={e=>setGbed(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 16px",color:"#EDE8DF",fontFamily:"'DM Sans',sans-serif",fontSize:20,width:"100%",outline:"none",colorScheme:"dark"}} />
            </div>
            <button className="bp" disabled={!rating||wups===null} onClick={submitM}>Build Today's Schedule →</button>
          </div>
        </div>
      )}

      {/* NAP NOTIF */}
      {notif&&(
        <div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:358,background:"rgba(13,17,23,0.97)",border:"1px solid rgba(201,169,110,0.3)",borderRadius:18,padding:"14px 16px",zIndex:150,animation:"slideUp .4s ease",backdropFilter:"blur(20px)",display:"flex",gap:12,alignItems:"flex-start"}}>
          <CrescentMoon size={28} glow={false} />
          <div style={{flex:1}}><div style={{fontSize:11,color:"#C9A96E",letterSpacing:.5,textTransform:"uppercase",marginBottom:4}}>Luna</div><p style={{fontSize:13,color:"#D4CFC8",lineHeight:1.6}}>{notif}</p></div>
          <button onClick={()=>setNotif(null)} style={{background:"none",border:"none",color:"#4A4640",fontSize:16,cursor:"pointer",flexShrink:0,padding:0}}>✕</button>
        </div>
      )}

      {/* SAVE NAP MODAL */}
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn .3s ease"}}>
          <div style={{width:"100%",maxWidth:390,background:"#0D1117",borderRadius:"24px 24px 0 0",padding:"28px 24px 44px",border:"1px solid rgba(147,197,253,0.15)"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(147,197,253,0.15)",border:"1px solid rgba(147,197,253,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🌤️</div>
              <div><div style={{fontSize:15,fontWeight:500,color:"#EDE8DF"}}>Luna — {modal.label}</div><div style={{fontSize:12,color:"#93C5FD",marginTop:2}}>{modal.duration} min · woke early</div></div>
            </div>
            <div style={{background:"rgba(147,197,253,0.06)",border:"1px solid rgba(147,197,253,0.12)",borderRadius:16,padding:"14px 16px",marginBottom:20}}>
              <p style={{fontSize:14,color:"#C8DCF8",lineHeight:1.7}}>{name} woke after {modal.duration} minutes. Before ending this nap, it's worth trying to resettle first.</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button className="bp" style={{background:"linear-gradient(135deg,#60A5FA,#93C5FD)",color:"#0D1117"}} onClick={()=>{const u=[...naps];u[modal.index]={...u[modal.index],actualEnd:null};setNaps(u);setANap(modal.index);setNapmsg(p=>[...p,{role:"a",text:`Good — give it 5 minutes before going in. I'm right here. 🌤️`}]);setModal(null);setSc(S.NAP);}}>Try to save the nap →</button>
              <button className="bg" style={{textAlign:"center",fontSize:13}} onClick={()=>confirmEnd(modal.index,modal.endTime,modal.duration)}>{name} is fully awake — end nap & adjust schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* HOME */}
      {sc===S.HOME&&(
        <div style={{minHeight:"100vh",paddingBottom:80,overflowY:"auto",background:D.bg}}>
          {!mDone&&method&&!showM&&(()=>{setTimeout(()=>setShowM(true),600);return null;})()}
          <div style={{padding:"56px 24px 20px",background:isDayMode?"linear-gradient(180deg,rgba(245,239,228,1) 0%,rgba(245,239,228,0) 100%)":"linear-gradient(180deg,rgba(13,17,23,1) 0%,rgba(13,17,23,0) 100%)",position:"sticky",top:0,zIndex:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <p style={{fontSize:13,color:D.textDim,marginBottom:4}}>Night {nn} · {mo?.name||"Sleep Training"}</p>
                <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:300,color:D.textPrimary}}>{name||"Your Baby"}'s Day</h1>
              </div>
              <CrescentMoon size={44} glow animate />
            </div>
          </div>
          <div style={{padding:"0 20px"}}>
            {mDone&&ds&&(
              <div className="f1" style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:20,padding:20,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <p style={{fontSize:12,color:D.textDim,letterSpacing:1,textTransform:"uppercase"}}>Today's Schedule</p>
                  <span style={{fontSize:12,color:"#C9A96E"}}>Bed {fmt(ds.idealBedtime)}</span>
                </div>
                <div style={{display:"flex",gap:14,alignItems:"center",paddingBottom:12,marginBottom:12,borderBottom:`1px solid ${D.divider}`}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:isDayMode?"rgba(201,169,110,0.2)":"rgba(252,211,77,0.15)",border:isDayMode?"1px solid rgba(201,169,110,0.4)":"1px solid rgba(252,211,77,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🌅</div>
                  <div style={{flex:1}}><div style={{fontSize:14,color:D.textPrimary,fontWeight:500}}>Woke up</div><div style={{fontSize:12,color:D.textDim,marginTop:2}}>{fmt(wt)}</div></div>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"rgba(76,175,80,0.2)",border:"1px solid rgba(76,175,80,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#4CAF50"}}>✓</div>
                </div>
                {ds.schedule.map((nap,i)=>{
                  const isDone=nap.status==="done",isActive=nap.status==="active",isNext=nap.status==="upcoming"&&ds.schedule.slice(0,i).every(n=>n.status==="done");
                  return(
                    <div key={nap.id} style={{paddingBottom:i<ds.schedule.length-1?12:0,marginBottom:i<ds.schedule.length-1?12:0,borderBottom:i<ds.schedule.length-1?`1px solid ${D.divider}`:"none"}}>
                      <div style={{display:"flex",gap:14,alignItems:"center"}}>
                        <div style={{width:32,height:32,borderRadius:"50%",background:isDone?"rgba(76,175,80,0.15)":isActive?"rgba(100,149,237,0.2)":isNext?"rgba(201,169,110,0.15)":isDayMode?"rgba(201,169,110,0.08)":"rgba(255,255,255,0.05)",border:`1px solid ${isDone?"rgba(76,175,80,0.4)":isActive?"rgba(100,149,237,0.5)":isNext?"rgba(201,169,110,0.3)":isDayMode?"rgba(201,169,110,0.2)":"rgba(255,255,255,0.08)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>
                          {isDone?"✅":isActive?"💤":"🌤️"}
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,color:isDone?D.textDim:isActive?"#93C5FD":isNext?D.textPrimary:D.textDim,fontWeight:isNext||isActive?500:400}}>{nap.label}</div>
                          <div style={{fontSize:12,color:D.textDim,marginTop:2}}>{isDone?`${fmt(nap.actualStart)} → ${fmt(nap.actualEnd)} · ${nap.duration} min${nap.isShort?" ⚠️":""}`:isActive?`Started ${fmt(nap.actualStart)} · in progress...`:`Window ${fmt(nap.windowOpen)}–${fmt(nap.windowClose)}`}</div>
                        </div>
                        {isActive&&<button onClick={()=>endNap(i)} style={{background:"rgba(180,80,80,0.15)",border:"1px solid rgba(180,80,80,0.5)",borderRadius:10,padding:"6px 12px",color:"#A03030",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Nap ended</button>}
                        {isNext&&<button onClick={()=>startNap(i)} style={{background:"rgba(201,169,110,0.25)",border:"1px solid rgba(201,169,110,0.6)",borderRadius:10,padding:"6px 12px",color:"#8B6520",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Nap started</button>}
                      </div>
                      {nap.isShort&&<div style={{marginTop:8,marginLeft:46,background:"rgba(252,211,77,0.08)",border:"1px solid rgba(252,211,77,0.15)",borderRadius:10,padding:"8px 12px",fontSize:12,color:isDayMode?"#8B6914":"#FCD34D",lineHeight:1.5}}>⚠️ Short nap — schedule adjusted.</div>}
                    </div>
                  );
                })}
                {ds.needsCatnap&&(
                  <div style={{background:"rgba(147,197,253,0.08)",border:"1px solid rgba(147,197,253,0.2)",borderRadius:14,padding:"12px 14px",marginTop:4,marginBottom:4,display:"flex",gap:10,alignItems:"flex-start"}}>
                    <span style={{fontSize:18,flexShrink:0}}>🌤️</span>
                    <div>
                      <div style={{fontSize:13,color:"#4A7FA8",fontWeight:500,marginBottom:3}}>Catnap recommended</div>
                      <p style={{fontSize:12,color:isDayMode?"#4A7FA8":"#7BA8C4",lineHeight:1.55}}>Total nap sleep was low. A short catnap will protect tonight. ⚠️ Timings need expert review.</p>
                    </div>
                  </div>
                )}
                <div style={{display:"flex",gap:14,alignItems:"center",paddingTop:12,marginTop:12,borderTop:`1px solid ${D.divider}`}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(201,169,110,0.15)",border:"1px solid rgba(201,169,110,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🌙</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,color:D.textPrimary,fontWeight:500}}>Bedtime</div>
                    {editBed
                      ? <input type="time" value={gbed} autoFocus
                          onChange={e=>setGbed(e.target.value)}
                          onBlur={()=>setEditBed(false)}
                          style={{background:"transparent",border:"none",borderBottom:"1px solid rgba(201,169,110,0.5)",color:"#C9A96E",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",marginTop:2,colorScheme:isDayMode?"light":"dark",width:90}} />
                      : <div style={{fontSize:12,color:"#C9A96E",marginTop:2}}>{fmt(ds.idealBedtime)}</div>
                    }
                  </div>
                  <button onClick={()=>setEditBed(true)} style={{background:"rgba(201,169,110,0.08)",border:"1px solid rgba(201,169,110,0.2)",borderRadius:8,padding:"4px 10px",color:"#C9A96E",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Edit</button>
                </div>
              </div>
            )}
            {!mDone&&method&&(
              <div className="f1" onClick={()=>setShowM(true)} style={{background:isDayMode?"rgba(201,169,110,0.1)":"rgba(252,211,77,0.06)",border:isDayMode?"1px solid rgba(201,169,110,0.3)":"1px solid rgba(252,211,77,0.2)",borderRadius:20,padding:20,marginBottom:14,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <span style={{fontSize:28}}>🌅</span>
                  <div><div style={{fontSize:15,fontWeight:500,color:D.textPrimary}}>Good morning!</div><div style={{fontSize:12,color:"#C9A96E",marginTop:2}}>Tap to build today's schedule</div></div>
                </div>
                <p style={{fontSize:13,color:D.textSec,lineHeight:1.5}}>Tell Luna when {name} woke up and how last night went — she'll calculate today's perfect nap schedule.</p>
              </div>
            )}
            <div className={mDone?"f2":"f1"} onClick={()=>setSc(S.PRELAUNCH)} style={{background:"linear-gradient(135deg,rgba(6,7,12,0.95),rgba(13,10,20,0.98))",border:"1px solid rgba(201,169,110,0.25)",borderRadius:24,padding:22,cursor:"pointer",marginBottom:14,animation:"pulseGold 4s ease-in-out infinite"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
                <div style={{animation:"breathe 4s ease-in-out infinite"}}><CrescentMoon size={40} glow /></div>
                <div>
                  <div style={{fontSize:16,fontWeight:500,color:"#C9A96E"}}>Tonight's Bedtime Routine</div>
                  <div style={{fontSize:12,color:"#6B6560",marginTop:2}}>Ready for Night {nn} · {fmt(ds?.idealBedtime||gbed)}</div>
                </div>
              </div>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,border:"1px solid rgba(201,169,110,0.3)",borderRadius:10,padding:"8px 14px",fontSize:13,color:"#C9A96E"}}>🌙 &nbsp; Begin Night {nn} with Luna →</div>
            </div>
            <div className={mDone?"f3":"f2"} onClick={()=>{initDay();setSc(S.CHAT);}} style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:20,padding:18,cursor:"pointer",marginBottom:14,display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:40,height:40,borderRadius:"50%",background:isDayMode?"rgba(201,169,110,0.12)":"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center"}}><CrescentMoon size={28} glow={false} /></div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500,color:D.textPrimary}}>Talk to Luna</div><div style={{fontSize:12,color:D.textDim,marginTop:2}}>Questions, adjustments, anything</div></div>
              <span style={{fontSize:16,color:D.textDim}}>→</span>
            </div>
            <div style={{display:"flex",gap:12,marginBottom:14}}>
              <div className="sc2" style={{background:D.card,border:`1px solid ${D.border}`}}><div style={{fontSize:11,color:D.textDim,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>Night</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,fontWeight:300,color:"#C9A96E",lineHeight:1}}>{nn}</div><div style={{fontSize:12,color:D.textSec,marginTop:4}}>of training</div></div>
              <div className="sc2" style={{background:D.card,border:`1px solid ${D.border}`}}><div style={{fontSize:11,color:D.textDim,letterSpacing:.5,textTransform:"uppercase",marginBottom:8}}>Wake ups</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,fontWeight:300,color:wups===0?"#4CAF50":wups>=3?"#FCA5A5":"#C9A96E",lineHeight:1}}>{wups??"–"}</div><div style={{fontSize:12,color:D.textSec,marginTop:4}}>last night</div></div>
            </div>
          </div>
          <div style={{textAlign:"center",paddingBottom:110,paddingTop:16}}>
            {!resetConfirm
              ? <button onClick={()=>setResetConfirm(true)} style={{background:"none",border:"none",color:D.textDim,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"16px 40px"}}>Reset app</button>
              : <div style={{display:"flex",gap:12,justifyContent:"center",alignItems:"center"}}>
                  <span style={{fontSize:12,color:D.textSec,fontFamily:"'DM Sans',sans-serif"}}>Start over?</span>
                  <button onClick={handleReset} style={{background:"#C9A96E",border:"none",borderRadius:20,color:"#0D1117",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"8px 16px"}}>Yes</button>
                  <button onClick={()=>setResetConfirm(false)} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,color:D.textSec,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",padding:"8px 16px"}}>Cancel</button>
                </div>
            }
          </div>
          <Nav />
        </div>
      )}

      {/* NAP MODE */}
      {sc===S.NAP&&(
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"#080c14"}}>
          <div style={{padding:"52px 20px 16px",background:"rgba(8,12,20,0.98)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(147,197,253,0.1)",position:"sticky",top:0,zIndex:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(147,197,253,0.15)",border:"1px solid rgba(147,197,253,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,animation:"breathe 4s ease-in-out infinite"}}>🌤️</div>
                <div><div style={{fontSize:14,fontWeight:500,color:"#93C5FD",letterSpacing:.5}}>Luna Nap Mode</div><div style={{fontSize:11,color:"#4CAF50",marginTop:1}}>● Active · Nap {(aNap??0)+1} · {name}</div></div>
              </div>
              <button onClick={()=>{if(aNap!==null)endNap(aNap);else setSc(S.HOME);}} style={{background:"rgba(252,165,165,0.1)",border:"1px solid rgba(252,165,165,0.2)",borderRadius:10,padding:"6px 12px",color:"#FCA5A5",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Nap ended</button>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"20px 18px 140px",display:"flex",flexDirection:"column",gap:14}}>
            {napmsg.map((msg,i)=>(
              <div key={i} style={{display:"flex",justifyContent:msg.role==="u"?"flex-end":"flex-start",alignItems:"flex-end",gap:10}}>
                {msg.role!=="u"&&<div style={{width:30,height:30,borderRadius:"50%",background:"rgba(147,197,253,0.15)",border:"1px solid rgba(147,197,253,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🌤️</div>}
                <div style={{maxWidth:"82%",padding:"14px 16px",borderRadius:20,fontSize:14,lineHeight:1.75,animation:"nightFade .5s ease",...(msg.role!=="u"?{background:"rgba(147,197,253,0.07)",border:"1px solid rgba(147,197,253,0.15)",borderBottomLeftRadius:6,color:"#C8DCF8"}:{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderBottomRightRadius:6,color:"#C8C0B8",marginLeft:"auto"})}}>{msg.text}</div>
              </div>
            ))}
            {typing&&(
              <div style={{display:"flex",alignItems:"flex-end",gap:10}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:"rgba(147,197,253,0.15)",border:"1px solid rgba(147,197,253,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🌤️</div>
                <div style={{padding:"14px 18px",borderRadius:20,borderBottomLeftRadius:6,background:"rgba(147,197,253,0.07)",border:"1px solid rgba(147,197,253,0.15)"}}>
                  <span className="dot" style={{background:"#93C5FD"}} /><span className="dot" style={{background:"#93C5FD"}} /><span className="dot" style={{background:"#93C5FD"}} />
                </div>
              </div>
            )}
            <div ref={napref} />
          </div>
          <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,padding:"12px 16px 28px",background:"rgba(8,12,20,0.98)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(147,197,253,0.08)",zIndex:50}}>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10,overflow:"hidden"}}>
              <input className="in" placeholder={`Tell Luna what ${name} is doing...`} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendNap()} style={{flex:1,padding:"13px 15px",borderColor:"rgba(147,197,253,0.15)"}} />
              <button onClick={sendNap} disabled={!inp.trim()||typing} style={{width:46,height:46,borderRadius:"50%",background:inp.trim()?"linear-gradient(135deg,#60A5FA,#93C5FD)":"rgba(147,197,253,0.06)",border:"none",cursor:inp.trim()?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,lineHeight:"46px",fontFamily:"system-ui",color:inp.trim()?"#0D1117":"#3A3530"}}><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2l6 6H9v6H7V8H2z"/></svg></button>
            </div>
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:2}}>
              {["Won't settle","Crying hard","Almost asleep","Woke up early","Is this normal?"].map(q=>(
                <button key={q} onClick={()=>setInp(q)} style={{background:"rgba(147,197,253,0.05)",border:"1px solid rgba(147,197,253,0.12)",borderRadius:20,padding:"6px 13px",color:"#4A6080",fontSize:11,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>{q}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHAT / LUNA DAY */}
      {sc===S.CHAT&&(
        <div style={{height:"100vh",display:"flex",flexDirection:"column",background:D.bg,overflow:"hidden"}}>
          <div style={{padding:"52px 20px 16px",background:isDayMode?"rgba(240,233,220,0.97)":"rgba(13,17,23,0.98)",backdropFilter:"blur(20px)",borderBottom:isDayMode?"1px solid rgba(212,197,168,0.6)":"1px solid rgba(255,255,255,0.06)",position:"sticky",top:0,zIndex:10}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <CrescentMoon size={36} glow={false} />
              <div><div style={{fontSize:14,fontWeight:500,color:D.textPrimary}}>Luna</div><div style={{fontSize:11,color:"#4CAF50",marginTop:1}}>● Online · Day Mode</div></div>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"20px 18px 140px",display:"flex",flexDirection:"column",gap:14}}>
            {dmsgs.map((msg,i)=>(
              <div key={i} style={{display:"flex",justifyContent:msg.role==="u"?"flex-end":"flex-start",alignItems:"flex-end",gap:10}}>
                {msg.role!=="u"&&<div style={{flexShrink:0}}><CrescentMoon size={30} glow={false} /></div>}
                <div className={`bub ${msg.role==="u"?"buu":"bu"}`} style={{color:msg.role==="u"?(isDayMode?"#2C2010":"#EDE8DF"):D.textPrimary,background:msg.role!=="u"&&isDayMode?"rgba(201,169,110,0.1)":undefined,border:msg.role!=="u"&&isDayMode?"1px solid rgba(201,169,110,0.2)":undefined}}>{msg.text}</div>
              </div>
            ))}
            {typing&&<div style={{display:"flex",alignItems:"flex-end",gap:10}}><CrescentMoon size={30} glow={false} /><div className="bub bu" style={{padding:"14px 18px"}}><span className="dot" /><span className="dot" /><span className="dot" /></div></div>}
            <div ref={dref} />
          </div>
          <div style={{position:"fixed",bottom:68,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:390,padding:"12px 16px 12px",background:isDayMode?"rgba(240,233,220,0.97)":"rgba(13,17,23,0.98)",backdropFilter:"blur(20px)",borderTop:isDayMode?"1px solid rgba(212,197,168,0.6)":"1px solid rgba(255,255,255,0.06)",zIndex:50}}>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
              <input className="if" placeholder="Ask Luna anything..." value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendDay()} style={{flex:1,padding:"13px 15px",color:isDayMode?"#2C2010":"#EDE8DF",background:isDayMode?"rgba(201,169,110,0.1)":"rgba(255,255,255,0.05)",borderColor:isDayMode?"rgba(201,169,110,0.3)":"rgba(255,255,255,0.1)"}} />
              <button onClick={sendDay} disabled={!inp.trim()||typing} style={{width:46,height:46,borderRadius:"50%",background:inp.trim()?"linear-gradient(135deg,#C9A96E,#E8C98A)":"rgba(201,169,110,0.06)",border:"none",cursor:inp.trim()?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,lineHeight:"46px",fontFamily:"system-ui",color:inp.trim()?"#0D1117":"#3A3530"}}><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2l6 6H9v6H7V8H2z"/></svg></button>
            </div>
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:2}}>
              {["Nap schedule","Short nap help","Bedtime advice","How's training going?"].map(q=>(
                <button key={q} onClick={()=>setInp(q)} style={{background:"rgba(201,169,110,0.05)",border:"1px solid rgba(201,169,110,0.12)",borderRadius:20,padding:"6px 13px",color:isDayMode?"#8B6535":"#6B5A3E",fontSize:11,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>{q}</button>
              ))}
            </div>
          </div>
          <Nav />
        </div>
      )}

      {/* PLAN */}
      {sc===S.PLAN&&(
        <div style={{minHeight:"100vh",padding:"52px 24px 100px",overflowY:"auto",background:D.bg}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:300,color:D.textPrimary}}>{name}'s Plan</h2>
            <CrescentMoon size={36} glow={false} />
          </div>
          <div style={{background:isDayMode?"rgba(201,169,110,0.12)":"rgba(201,169,110,0.08)",border:"1px solid rgba(201,169,110,0.25)",borderRadius:20,padding:20,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <p style={{fontSize:12,color:"#C9A96E",letterSpacing:1,textTransform:"uppercase"}}>Current Method</p>
              <button onClick={()=>setChangingMethod(!changingMethod)} style={{background:"none",border:`1px solid rgba(201,169,110,0.4)`,borderRadius:20,padding:"4px 12px",color:"#C9A96E",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                {changingMethod?"Cancel":"Change Method"}
              </button>
            </div>
            {!changingMethod?(
              mo?(
                <div>
                  <div style={{fontSize:18,color:D.textPrimary,fontWeight:500,marginBottom:4}}>{mo.name}</div>
                  <div style={{fontSize:13,color:mo.color,marginBottom:12}}>{mo.sub}</div>
                  <p style={{fontSize:13,color:D.textSec,lineHeight:1.6}}>{mo.desc}</p>
                  <div style={{display:"flex",gap:16,marginTop:12}}><span style={{fontSize:15,fontWeight:600,color:"#C9A96E"}}>⏱ {mo.time}</span><span style={{fontSize:15,fontWeight:600,color:"#C9A96E"}}>😢 Crying: {mo.cry}</span></div>
                </div>
              ):<p style={{fontSize:14,color:D.textSec}}>Complete the assessment to see your plan.</p>
            ):(
              <div>
                <p style={{fontSize:13,color:D.textSec,marginBottom:14,lineHeight:1.5}}>Choose a new method. Luna will support you through the transition.</p>
                {METHODS.map(m=>(
                  <div key={m.id} onClick={()=>{setMethod(m.id);setChangingMethod(false);setNmsgs([{role:"a",text:`Switching to ${m.name} — that takes courage. This method typically takes ${m.time}. I'm here every step of the way. 🌙`}]);}} style={{background:method===m.id?"rgba(201,169,110,0.2)":"rgba(255,255,255,0.03)",border:method===m.id?"1px solid rgba(201,169,110,0.5)":`1px solid ${D.border}`,borderRadius:14,padding:"12px 14px",marginBottom:10,cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:15,color:isDayMode?"#1A0E00":D.textPrimary,fontWeight:700}}>{m.name} {method===m.id&&"✓"}</div>
                        <div style={{fontSize:12,color:isDayMode?"#2E1A08":m.color,marginTop:2}}>{m.sub}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#8B6520"}}>{m.time}</div>
                        <div style={{fontSize:12,color:isDayMode?"#2E1A08":D.textSec,marginTop:2}}>{m.cry} crying</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {!changingMethod&&nn>=5&&mo&&(
            <div style={{background:isDayMode?"rgba(100,160,255,0.08)":"rgba(100,160,255,0.06)",border:"1px solid rgba(100,160,255,0.2)",borderRadius:20,padding:16,marginBottom:14}}>
              <p style={{fontSize:12,color:"#93C5FD",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>💡 Luna's Suggestion</p>
              <p style={{fontSize:13,color:D.textSec,lineHeight:1.6,marginBottom:12}}>
                {mo.id==="ferber"?"You're on Night "+nn+". If "+name+" is still waking frequently, some families find switching to a gentler method like the Fading Method helps at this stage.":
                 mo.id==="nocry"?"You're on Night "+nn+". The No-Cry method takes 4–8 weeks — you're doing great. If progress feels too slow, the Fading Method offers a middle ground.":
                 mo.id==="chair"?"You're on Night "+nn+". The Chair Method can feel long. If you'd like faster results, Ferber has a similar philosophy with a clearer timeline.":
                 "You're on Night "+nn+". If "+name+" isn't responding yet, consider trying a different approach — every baby is different."}
              </p>
              <button onClick={()=>setChangingMethod(true)} style={{background:"none",border:"1px solid rgba(100,160,255,0.3)",borderRadius:20,padding:"6px 14px",color:"#93C5FD",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Explore other methods →</button>
            </div>
          )}
          <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:20,padding:20,marginBottom:14}}>
            <p style={{fontSize:12,color:D.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>Wake Windows · {age} months</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[{l:"Window",v:ww?.window},{l:"Night Sleep",v:ww?.night},{l:"Naps/Day",v:ww?.naps}].map((s,i)=>(
                <div key={i} style={{background:isDayMode?"rgba(201,169,110,0.08)":"rgba(255,255,255,0.03)",borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                  <div style={{fontSize:13,fontWeight:500,color:D.textPrimary}}>{s.v||"—"}</div>
                  <div style={{fontSize:10,color:D.textDim,marginTop:4}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          {notes.trim()&&(
            <div style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:20,padding:20}}>
              <p style={{fontSize:12,color:D.textDim,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Luna's Notes</p>
              <p style={{fontSize:13,color:D.textSec,lineHeight:1.65,fontStyle:"italic"}}>"{notes}"</p>
            </div>
          )}
          <Nav />
        </div>
      )}

      {/* LOG */}
      {sc===S.LOG&&(
        <div style={{minHeight:"100vh",padding:"52px 24px 100px",overflowY:"auto",background:D.bg}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:300,color:D.textPrimary}}>Sleep Log</h2>
            <CrescentMoon size={36} glow={false} />
          </div>

          {/* Night logs */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,color:D.textDim,letterSpacing:1,textTransform:"uppercase"}}>Nights</div>
            <button onClick={openAddLog} style={{background:"rgba(201,169,110,0.12)",border:"1px solid rgba(201,169,110,0.25)",borderRadius:10,padding:"6px 14px",color:"#C9A96E",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>+ Add Entry</button>
          </div>
          {log.length===0?(
            <div style={{textAlign:"center",padding:"40px 20px",background:D.card,border:`1px solid ${D.border}`,borderRadius:16,marginBottom:24}}>
              <div style={{fontSize:36,marginBottom:12}}>📝</div>
              <p style={{fontSize:14,color:D.textPrimary,fontWeight:500,marginBottom:6}}>No nights logged yet</p>
              <p style={{fontSize:13,color:D.textSec,lineHeight:1.6}}>Data appears here after your morning check-in, or tap + Add Entry above.</p>
            </div>
          ):(
            <div style={{marginBottom:24}}>
              {log.map((entry,i)=>(
                <div key={i} onClick={()=>openEditLog(entry,i)} style={{background:D.card,border:`1px solid ${D.border}`,borderRadius:16,padding:16,marginBottom:10,cursor:"pointer",transition:"all .15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontSize:15,color:D.textPrimary,fontWeight:500}}>Night {entry.night}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{fontSize:12,color:D.textDim}}>{entry.date}</div>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6B6560" strokeWidth="1.5" strokeLinecap="round"><path d="M7.5 2.5l2 2M3 7l4-4 2 2-4 4H3V7z"/></svg>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:16}}>
                    <div><div style={{fontSize:11,color:D.textDim,marginBottom:4}}>Rating</div><div style={{fontSize:13,color:entry.rating==="great"?"#4CAF50":entry.rating==="rough"?"#FCA5A5":"#C9A96E"}}>{entry.rating==="great"?"😴 Great":entry.rating==="okay"?"😐 Okay":"😩 Rough"}</div></div>
                    <div><div style={{fontSize:11,color:D.textDim,marginBottom:4}}>Wake-ups</div><div style={{fontSize:13,color:D.textPrimary}}>{entry.wakeups}</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nap logs */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,color:D.textDim,letterSpacing:1,textTransform:"uppercase"}}>Naps</div>
            <button onClick={()=>{setNeStart("");setNeEnd("");setNapEditModal({mode:"add",nap:{nap_number:napLogs.length+1,date:new Date().toLocaleDateString()}});}} style={{background:"rgba(147,197,253,0.12)",border:"1px solid rgba(147,197,253,0.25)",borderRadius:10,padding:"6px 14px",color:"#93C5FD",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>+ Add Nap</button>
          </div>
          {napLogs.length===0?(
            <div style={{textAlign:"center",padding:"32px 20px",background:D.card,border:`1px solid ${D.border}`,borderRadius:16,marginBottom:24}}>
              <div style={{fontSize:28,marginBottom:10}}>🌤️</div>
              <p style={{fontSize:14,color:D.textPrimary,fontWeight:500,marginBottom:6}}>No naps logged yet</p>
              <p style={{fontSize:13,color:D.textSec,lineHeight:1.6}}>Naps are logged automatically via nap mode, or tap + Add Nap above.</p>
            </div>
          ):(
            <div style={{marginBottom:24}}>
              {napLogs.map((nap,i)=>(
                <div key={i} onClick={()=>openEditNap(nap,i)} style={{background:D.card,border:`1px solid rgba(147,197,253,0.12)`,borderRadius:16,padding:16,marginBottom:10,cursor:"pointer",transition:"all .15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{fontSize:15,color:"#93C5FD",fontWeight:500}}>Nap {nap.nap_number}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{fontSize:12,color:D.textDim}}>{nap.date}</div>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6B6560" strokeWidth="1.5" strokeLinecap="round"><path d="M7.5 2.5l2 2M3 7l4-4 2 2-4 4H3V7z"/></svg>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:16}}>
                    <div><div style={{fontSize:11,color:D.textDim,marginBottom:4}}>Time</div><div style={{fontSize:13,color:D.textPrimary}}>{fmt(nap.start_time)} – {fmt(nap.end_time)}</div></div>
                    <div><div style={{fontSize:11,color:D.textDim,marginBottom:4}}>Duration</div><div style={{fontSize:13,color:nap.duration>=40?"#4CAF50":"#FCA5A5"}}>{nap.duration} min</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Nav />
        </div>
      )}

      {/* LOG ADD/EDIT MODAL */}
      {logModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn .3s ease"}}>
          <div style={{width:"100%",maxWidth:390,background:"#0D1117",borderRadius:"24px 24px 0 0",padding:"28px 24px 40px",border:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:24}}>📝</div>
                <div><div style={{fontSize:16,fontWeight:500,color:"#EDE8DF"}}>{logModal.mode==="add"?"Add Sleep Log":"Edit Sleep Log"}</div><div style={{fontSize:13,color:"#6B6560",marginTop:2}}>Night {lmNight} · {lmDate}</div></div>
              </div>
              <button onClick={()=>setLogModal(null)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}} aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8B8680" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
            </div>
            {logModal.mode==="add"&&(
              <div style={{marginBottom:20}}>
                <label style={{fontSize:12,color:"#6B6560",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}}>Night number</label>
                <input type="number" min="1" value={lmNight} onChange={e=>setLmNight(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"14px 16px",color:"#EDE8DF",fontFamily:"'DM Sans',sans-serif",fontSize:20,width:"100%",outline:"none",colorScheme:"dark"}} />
              </div>
            )}
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,color:"#6B6560",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}}>How was the night?</label>
              <div style={{display:"flex",gap:10}}>
                {[{id:"great",label:"😴 Great"},{id:"okay",label:"😐 Okay"},{id:"rough",label:"😩 Rough"}].map(opt=>(
                  <button key={opt.id} onClick={()=>setLmRating(opt.id)} style={{flex:1,background:lmRating===opt.id?"rgba(201,169,110,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${lmRating===opt.id?"rgba(201,169,110,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:12,padding:"10px 6px",color:lmRating===opt.id?"#C9A96E":"#8B8680",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s"}}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:24}}>
              <label style={{fontSize:12,color:"#6B6560",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}}>How many wake-ups?</label>
              <div style={{display:"flex",gap:8}}>
                {[0,1,2,3,"4+"].map(n=>(
                  <button key={n} onClick={()=>setLmWups(n)} style={{flex:1,background:lmWups===n?"rgba(201,169,110,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${lmWups===n?"rgba(201,169,110,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"10px 4px",color:lmWups===n?"#C9A96E":"#8B8680",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s"}}>{n}</button>
                ))}
              </div>
            </div>
            <button className="bp" disabled={!lmRating||lmWups===null} onClick={saveLogEntry}>{logModal.mode==="add"?"Save Entry →":"Update Entry →"}</button>
          </div>
        </div>
      )}

      {/* NAP ADD/EDIT MODAL */}
      {napEditModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fadeIn .3s ease"}}>
          <div style={{width:"100%",maxWidth:390,background:"#0D1117",borderRadius:"24px 24px 0 0",padding:"28px 24px 40px",border:"1px solid rgba(147,197,253,0.15)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:24}}>🌤️</div>
                <div><div style={{fontSize:16,fontWeight:500,color:"#EDE8DF"}}>{napEditModal.mode==="add"?"Add Nap":"Edit Nap "+napEditModal.nap.nap_number}</div><div style={{fontSize:13,color:"#93C5FD",marginTop:2}}>{napEditModal.nap.date}</div></div>
              </div>
              <button onClick={()=>setNapEditModal(null)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}} aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8B8680" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg></button>
            </div>
            {napEditModal.mode==="add"&&(
              <div style={{marginBottom:20}}>
                <label style={{fontSize:12,color:"#6B6560",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}}>Nap number</label>
                <div style={{display:"flex",gap:8}}>
                  {[1,2,3,4].map(n=>(
                    <button key={n} onClick={()=>setNapEditModal(prev=>({...prev,nap:{...prev.nap,nap_number:n}}))} style={{flex:1,background:napEditModal.nap.nap_number===n?"rgba(147,197,253,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${napEditModal.nap.nap_number===n?"rgba(147,197,253,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"10px 4px",color:napEditModal.nap.nap_number===n?"#93C5FD":"#8B8680",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s"}}>{n}</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,color:"#6B6560",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}}>Start time</label>
              <input type="time" value={neStart} onChange={e=>setNeStart(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(147,197,253,0.15)",borderRadius:14,padding:"14px 16px",color:"#EDE8DF",fontFamily:"'DM Sans',sans-serif",fontSize:20,width:"100%",outline:"none",colorScheme:"dark"}} />
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,color:"#6B6560",letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}}>End time</label>
              <input type="time" value={neEnd} onChange={e=>setNeEnd(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(147,197,253,0.15)",borderRadius:14,padding:"14px 16px",color:"#EDE8DF",fontFamily:"'DM Sans',sans-serif",fontSize:20,width:"100%",outline:"none",colorScheme:"dark"}} />
            </div>
            {neStart&&neEnd&&<div style={{textAlign:"center",marginBottom:20,fontSize:14,color:"#93C5FD"}}>{Math.max(t2m(neEnd)-t2m(neStart),0)} minutes</div>}
            <button className="bp" disabled={!neStart||!neEnd} onClick={saveNapEdit}>{napEditModal.mode==="add"?"Save Nap →":"Update Nap →"}</button>
          </div>
        </div>
      )}

      {/* SAVE STATUS TOAST */}
      {saveStatus&&(
        <div style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",background:"rgba(201,169,110,0.95)",color:"#0D1117",padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",zIndex:300,animation:"fadeIn .3s ease"}}>{saveStatus}</div>
      )}


    </div>
  );
}

