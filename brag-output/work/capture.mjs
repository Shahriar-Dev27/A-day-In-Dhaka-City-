import { chromium } from 'playwright-core';
import fs from 'fs';
const FPS=30, DUR=20.5, N=Math.round(FPS*DUR);
const keys=[[0,0],[1.6,0],[2.9,1250],[4.4,1450],[5.7,3000],[7.8,3500],[8.4,5700],[11.6,9000],[12.0,10900],[12.9,11600],[13.9,12950],[15.2,13500],[15.7,14900],[17.0,15700],[18.0,16700],[19.0,17900],[20.5,17900]];
const sm=x=>x*x*(3-2*x);
function y(t){ for(let i=1;i<keys.length;i++){ if(t<=keys[i][0]){ const [t0,y0]=keys[i-1],[t1,y1]=keys[i]; if(y0===y1) return y0; const u=(t-t0)/(t1-t0); const e = (t1-t0)>2.5? u: sm(u); return y0+(y1-y0)*(0.5*u+0.5*sm(u)); } } return keys.at(-1)[1]; }
const start=+process.argv[2]||0, end=+process.argv[3]||N;
const b = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport:{width:1920,height:1080} });
await p.goto('http://localhost:3001',{waitUntil:'load'});
await p.waitForTimeout(5000);
// warm lazy scenes
const H = await p.evaluate(()=>document.documentElement.scrollHeight);
for(let yy=0; yy<=H; yy+=900){ await p.evaluate(v=>window.scrollTo(0,v),yy); await p.waitForTimeout(250); }
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(2500);
// end-card overlay, opacity set per frame
await p.evaluate(()=>{
  const d=document.createElement('div'); d.id='endcard';
  d.style.cssText='position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:#05070F;opacity:0;pointer-events:none;color:#F6EFDD';
  d.innerHTML='<div style="font-family:var(--font-display);font-size:104px;line-height:1.15;letter-spacing:-.01em">একটি দিন, ঢাকায়</div><div style="font-family:var(--font-sans);font-size:40px;letter-spacing:.32em;text-transform:uppercase;color:#F3C877">A Day in Dhaka</div><div style="font-family:var(--font-sans);font-size:30px;color:#B4BFDA;margin-top:26px">One scroll, one day.</div><div style="width:14px;height:14px;border-radius:50%;background:#F3C877;box-shadow:0 0 40px 10px #F3C87766;margin-top:30px"></div>';
  document.body.appendChild(d);
  const s=document.createElement('style'); s.textContent='*{caret-color:transparent}nextjs-portal,[data-nextjs-toast],#__next-build-watcher{display:none!important}'; document.head.appendChild(s);
});
fs.mkdirSync('frames',{recursive:true});
for(let f=start; f<end; f++){
  const t=f/FPS;
  const op = t<18.5?0: Math.min(1,(t-18.5)/0.9);
  await p.evaluate(([yy,o])=>{ window.scrollTo(0,yy); document.getElementById('endcard').style.opacity=o; },[y(t),op]);
  await p.waitForTimeout(f===start?900:130);
  await p.screenshot({path:`frames/f${String(f).padStart(4,'0')}.jpg`,type:'jpeg',quality:95});
  if(f%30===0) console.log('frame',f);
}
await b.close();
