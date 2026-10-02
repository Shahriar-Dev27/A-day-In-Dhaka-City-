import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport:{width:1920,height:1080} });
p.on('console', m=>{ if(m.type()==='error') console.log('ERR', m.text().slice(0,150)); });
await p.goto('http://localhost:3001', {waitUntil:'load'});
await p.waitForTimeout(6000);
const H = await p.evaluate(()=>document.documentElement.scrollHeight);
console.log('height', H, 'vh', H/1080);
await p.screenshot({path:'p0.png'});
// scene tops
const tops = await p.evaluate(()=>[...document.querySelectorAll('[id^="scene-"]')].map(e=>[e.id, e.getBoundingClientRect().top+scrollY, e.offsetHeight]));
console.log(JSON.stringify(tops));
for (const [i,y] of [[1,0.07],[2,0.17],[3,0.3],[4,0.5],[5,0.65],[6,0.8],[7,0.95]]) {
  await p.evaluate(v=>window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*v), y);
  await p.waitForTimeout(2500);
  await p.screenshot({path:`p${i}.png`});
}
await b.close();
