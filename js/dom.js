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

