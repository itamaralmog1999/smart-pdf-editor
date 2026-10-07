// FILL MODE: the finished form, only things to fill in (fields, choices, lines). No editing controls.

function renderFill(){
 $('bar').replaceChildren(
  btn(t('pdf'),exportPDF,'p'),btn(t('exp'),exportJSON),btn(t('imp'),()=>$('file').click()),btn(t('enc'),exportEncrypted),
  btn(t('toedit'),()=>{D.fill=false;save();render()},'on'),
  h('span',{className:'sp'}),btn(t('ui'),()=>{D.lang=D.lang==='he'?'en':'he';save();render()}),
  h('div',{id:'fnav'}));
 $('add').replaceChildren();
 $('cells').replaceChildren(...D.cells.map(fillCell));
 setTimeout(()=>{try{markFillPages(measureLayout(buildPrint()))}catch(e){}},0);
}

// Options you tap to select (circled). extra(i,pick) may return an input shown next to option i.
function chips(n,text,get,set,extra){
 const box=h('span',{className:'chips'}),btns=[];
 const paint=()=>btns.forEach((b,i)=>{const on=get()===i;b.className='chip'+(on?' sel':'');b.textContent=(on?'● ':'○ ')+text(i)});
 for(let i=0;i<n;i++){
  const b=h('button',{type:'button'});
  b.addEventListener('click',()=>{set(get()===i?null:i);save();paint()});
  btns.push(b);box.append(b);
  if(extra)box.append(extra(i,()=>{if(get()!==i){set(i);save();paint()}}));
 }
 paint();return box;
}
const fInput=(f,type)=>{
 const e=h('input',{type,value:f.value||'',className:'line',dir:'auto'});
 if(type==='number')e.inputMode='decimal';
 e.addEventListener('input',()=>{f.value=e.value;save()});
 return e;
};
const fUnit=u=>u?h('span',{className:'un',dir:'auto'},u):'';
function fillLines(c){
 c.lt=c.lt||[];
 return h('div',{className:'blpv'},...Array.from({length:c.lines||0},(_,k)=>{
  const e=h('input',{value:c.lt[k]||'',className:'blp',dir:c._dir||'auto'});
  e.addEventListener('input',()=>{c.lt[k]=e.value;save()});
  e.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();if(e.nextElementSibling)e.nextElementSibling.focus()}});
  return e;
 }));
}
function fillChoiceField(f){
 const w=h('div');
 w.append(chips(f.opts.length,i=>f.opts[i].text,()=>f.sel,v=>{f.sel=v},(i,pick)=>{
  const o=f.opts[i];if(!o.fill)return '';
  const v=field(o,'val','','line',false);v.addEventListener('input',()=>{if(v.value)pick()});
  return h('span',{className:'fv fi'},v,fUnit(o.unit));
 }));
 if(f.detail)w.append(h('div',{className:'fv'},h('b',{dir:'auto'},(f.dlabel||'')+':'),field(f,'dtext','','line',false)));
 return w;
}
function fillFields(c){
 const row=h('div',{className:'ffr'});
 c.fields.forEach(f=>{
  const box=h('div',{className:'ffld '+(f.w||'m')});
  if(f.type==='cap')box.append(h('div',{className:'fv'},f.prefix?h('b',{className:'pre',dir:'auto'},f.prefix):'',
   h('div',{className:'capc'},field(f,'value','','line',true),h('i',{className:'cp'},f.label||''))));
  else{
   box.append(h('div',{className:'flb',dir:'auto'},f.label||''));
   if(f.type==='choice')box.append(fillChoiceField(f));
   else box.append(h('div',{className:'fv'},f.type==='text'?field(f,'value','','line',true):fInput(f,f.type==='number'?'number':'date'),f.type==='date'?'':fUnit(f.unit)));
  }
  row.append(box);
 });
 return h('div',{},row,fillLines(c));
}
function fillTable(c){
 const dir=c.dir,head=h('tr'),body=h('tbody');
 if(c.useRowHeaders)head.append(h('th',{dir},c.corner||''));
 c.headers.forEach(x=>head.append(h('th',{dir},x)));
 c.rows.forEach((r,ri)=>{
  const tr=h('tr');
  if(c.useRowHeaders)tr.append(h('th',{dir},c.rowHeaders[ri]||''));
  r.forEach((_,ci)=>tr.append(h('td',{},arrField(r,ci,'',dir))));
  body.append(tr);
 });
 return h('div',{},c.text?h('div',{className:'fq',dir},c.text):'',h('div',{className:'tw'},h('table',{},h('thead',{},head),body)));
}
function fillCell(c,i){
 c._dir=c.dir==='auto'?'auto':c.dir;
 const dir=c.dir,u=c.u?' fu':'',w=h('div',{className:'fc','data-i':i});
 const title=()=>c.text?h('div',{className:'fq'+u,dir},c.text):'';
 if(c.type==='heading'){w.className='fc bare';w.append(h('div',{className:'fh'+u,dir},c.text||''))}
 else if(c.type==='text'){w.className='fc bare';w.append(h('p',{className:'ft'+u,dir},c.text||''))}
 else if(c.type==='question')w.append(title(),field(c,'answer',t('aph'),'ans',true),fillLines(c));
 else if(c.type==='table')w.append(fillTable(c));
 else if(c.type==='fields')w.append(fillFields(c));
 else if(c.type==='choice'){
  w.append(title(),chips(c.opts.length,k=>c.opts[k],()=>c.sel,v=>{c.sel=v}));
  if(c.detail)w.append(h('div',{className:'fv'},h('b',{dir:'auto'},(c.dlabel||'')+':'),field(c,'dtext','','line',false)));
  w.append(fillLines(c));
 }
 else if(c.type==='lines')w.append(fillLines(c));
 else if(c.type==='list'){
  w.append(title());
  c.items.forEach((it,k)=>w.append(h('div',{className:'li'},h('span',{className:'mk'},marker(c,k)),field(it,'t',t('ph'),'',true))));
 }
 else if(c.type==='check'){
  w.append(title());
  c.items.forEach(it=>w.append(h('div',{className:'fck'},chips(it.opts.length,k=>it.opts[k].text,()=>it.sel,v=>{it.sel=v}))));
 }
 return w;
}

// Page markers + a page navigator (page numbers are estimates)
function markFillPages(L){
 document.querySelectorAll('.pgdiv').forEach(e=>e.remove());
 const nav=$('fnav');if(!nav)return;
 nav.replaceChildren();
 const seen=new Set();
 D.cells.forEach((c,i)=>{
  const p=L.page[i];if(!p||seen.has(p))return;
  const el=document.querySelector('.fc[data-i="'+i+'"]');if(!el)return;
  seen.add(p);
  el.before(h('div',{className:'pgdiv',id:'pgd-'+p},t('pgl')+' '+p));
  nav.append(h('button',{type:'button',className:'fnb','data-p':p,on:{click:()=>goPage(p)}},String(p)));
 });
 setActivePage();
}
function goPage(p){
 const el=$('pgd-'+p);if(!el)return;
 window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-$('bar').offsetHeight-8,behavior:'smooth'});
}
function setActivePage(){
 if(!D.fill)return;
 let cur=null;const lim=$('bar').offsetHeight+40;
 document.querySelectorAll('.pgdiv').forEach(d=>{if(d.getBoundingClientRect().top<=lim)cur=d.id.slice(4)});
 document.querySelectorAll('.fnb').forEach(b=>b.classList.toggle('on',b.dataset.p===cur));
}
window.addEventListener('scroll',()=>{if(D.fill)requestAnimationFrame(setActivePage)},{passive:true});