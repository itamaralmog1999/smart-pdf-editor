// Small helpers for building HTML elements and input fields.
function h(tag,props,...kids){
 const e=document.createElement(tag);
 for(const k in props||{}){
  if(k==='on')for(const ev in props.on)e.addEventListener(ev,props.on[ev]);
  else if(k in e)e[k]=props[k];else e.setAttribute(k,props[k]);
 }
 kids.flat().forEach(c=>e.append(c));
 return e;
}
const btn=(txt,fn,cls)=>h('button',{type:'button',className:cls||'',on:{click:fn}},txt);

function field(obj,key,ph,cls,multi){
 const e=h(multi?'textarea':'input',{value:obj[key]||'',placeholder:ph||'',className:cls||'',dir:obj._dir||'auto'});
 if(multi)e.rows=1;
 const grow=()=>{if(multi){e.style.height='auto';e.style.height=e.scrollHeight+2+'px'}};
 e.addEventListener('input',()=>{obj[key]=e.value;grow();save()});
 if(multi)setTimeout(grow,0);
 return e;
}
function arrField(arr,i,ph,dir){
 const e=h('input',{value:arr[i]||'',placeholder:ph||'',dir:dir||'auto'});
 e.addEventListener('input',()=>{arr[i]=e.value;save()});
 return e;
}


// ---- Signatures: drawn on a small pad (finger or mouse), stored as a PNG data URL inside the document (and its JSON) ----
function openSigPad(cur,done){
 const W=480,H=160,r=Math.max(2,window.devicePixelRatio||1);
 const cv=h('canvas',{className:'sgcv',width:W*r,height:H*r});
 const ctx=cv.getContext('2d');ctx.scale(r,r);ctx.lineWidth=2.6;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#111';
 let ink=!!cur,drawing=false;
 if(cur){const im=new Image();im.onload=()=>ctx.drawImage(im,0,0,W,H);im.src=cur}
 const pos=e=>{const b=cv.getBoundingClientRect();return [(e.clientX-b.left)*W/b.width,(e.clientY-b.top)*H/b.height]};
 cv.addEventListener('pointerdown',e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);drawing=true;ink=true;const [x,y]=pos(e);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+.01,y);ctx.stroke()});
 cv.addEventListener('pointermove',e=>{if(!drawing)return;const [x,y]=pos(e);ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y)});
 const up=()=>{drawing=false};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 const ov=h('div',{className:'sgov'});
 const close=()=>{ov.remove();document.removeEventListener('keydown',esc)};
 const esc=e=>{if(e.key==='Escape')close()};document.addEventListener('keydown',esc);
 ov.append(h('div',{className:'sgbox'},h('div',{className:'sgt'},t('sigtitle')),cv,
  h('div',{className:'tb'},
   btn(t('sigclear'),()=>{ctx.clearRect(0,0,W,H);ink=false}),
   h('span',{className:'sp'}),
   btn(t('cancel'),close),
   btn(t('sigsave'),()=>{done(ink?cv.toDataURL('image/png'):undefined);close()},'p'))));
 document.body.append(ov);
}
function sigBox(obj,key,caption){
 const box=h('button',{type:'button',className:'sgb'});
 const paint=()=>box.replaceChildren(obj[key]?h('img',{src:obj[key],alt:''}):h('span',{className:'sgph'},'✍ '+t('sigtap')));
 box.addEventListener('click',()=>openSigPad(obj[key],v=>{obj[key]=v;save();paint()}));
 paint();
 return h('div',{className:'sgslot'},box,h('i',{className:'cp'},caption||t('sig')));
}