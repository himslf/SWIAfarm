const $=s=>document.querySelector(s), hero=$('.hero-inner'), layer=$('.trail'), replay=$('#play');
const photos=['car','wine','bike','fabric'], loops=['crane','hound','vinyl'], tilts=[-8,5,10,-4,7,-6], reduced=matchMedia('(prefers-reduced-motion:reduce)');
let seq=0,last=null,at=-Infinity,auto=[],rest,preloaded=[];
function warm(){if(preloaded.length||reduced.matches)return;preloaded=[...photos.map(n=>n+'.webp'),...loops.map(n=>n+'.gif')].map(file=>{const i=new Image();i.src='assets/'+file;return i})}
function stamp(x,y){
  const n=seq++, isLoop=n%2===1, pool=isLoop?loops:photos, name=pool[Math.floor(n/2)%pool.length];
  const el=document.createElement('div'), img=new Image(),angle=tilts[n%tilts.length];el.className='stamp';el.setAttribute('aria-hidden','true');img.alt='';img.src='assets/'+name+(isLoop&&!reduced.matches?'.gif':'.webp');el.append(img);
  while(layer.childElementCount>=7)layer.firstElementChild.remove();layer.append(el);let base='translate('+Math.round(x-el.offsetWidth/2)+'px,'+Math.round(y-el.offsetHeight/2)+'px) rotate('+angle+'deg)';el.style.transform=base;
  hero.classList.add('active-trail');clearTimeout(rest);const life=reduced.matches?850:1330;
  if(!reduced.matches){el.animate([{transform:base+' scale(.79)',opacity:.2},{transform:base+' scale(1)',opacity:1,offset:.16},{transform:base+' scale(1)',opacity:1,offset:.73},{transform:base+' translateY(12px) scale(.95)',opacity:0}],{duration:life,easing:'linear',fill:'forwards'})}
  setTimeout(()=>el.remove(),life);rest=setTimeout(()=>hero.classList.remove('active-trail'),life+120)
}
function stopAuto(){for(const t of auto)clearTimeout(t);auto=[]}
function point(e,force=false){if(e.target.closest('a,button,nav')||(!force&&reduced.matches))return;const r=hero.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,t=performance.now();
  if(!force&&(t-at<62||(last&&Math.hypot(x-last[0],y-last[1])<Math.max(54,Math.min(96,r.width*.072)))))return;
  stopAuto();warm();last=[x,y];at=t;stamp(x,y)
}
hero.addEventListener('pointerenter',warm,{once:true});hero.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')point(e)});hero.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')point(e,true)});hero.addEventListener('pointerleave',()=>{last=null});
function play(){stopAuto();warm();const r=hero.getBoundingClientRect(),poses=reduced.matches?[[.53,.49]]:[[.3,.5],[.42,.43],[.55,.4],[.66,.45],[.73,.53],[.63,.58],[.51,.55],[.42,.49]];poses.forEach(([x,y],i)=>auto.push(setTimeout(()=>stamp(x*r.width,y*r.height),i*165)))}
replay.addEventListener('click',play);
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAuto();layer.replaceChildren();hero.classList.remove('active-trail')}});
const menu=$('.menu'), links=$('#links');function closeMenu(){links.classList.remove('open');menu.setAttribute('aria-expanded','false')}
menu.onclick=()=>{menu.setAttribute('aria-expanded',String(links.classList.toggle('open')))};links.addEventListener('click',closeMenu);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&links.classList.contains('open')){closeMenu();menu.focus()}});
$('#brief').onclick=()=>$('#briefbox').showModal();$('#save').onclick=()=>{const field=$('#notes');if(!field.value.trim()){field.focus();return}const url=URL.createObjectURL(new Blob(['swia fake project brief\n\n'+field.value+'\n'],{type:'text/plain'})),a=document.createElement('a');a.href=url;a.download='fake-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
