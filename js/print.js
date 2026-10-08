// PDF export (via browser print). Edit print look in css/style.css (@media print).
// Each field sizes itself to its content; if the row is too full the next field moves down (no overlap)
const pf=f=>{const e=pf0(f);e.style.flexGrow=({n:0.6,w:2.5}[f.w]||1);const v=e.querySelector(':scope>span:not(.pco):not(.pdl),:scope>.capcol');if(v)v.style.minWidth=({n:'36pt',w:'160pt'}[f.w]||'80pt');return e};
const psig=(src,cap)=>h('div',{className:'psgw'},h('div',{className:'psg'},h('div',{className:'psgl'},src?h('img',{src}):''),h('i',{className:'cp'},cap||t('sig'))));
const pf0=f=>f.type==='sig'
 ?h('div',{className:'pfld cap'},f.prefix?h('b',{className:'pre'},f.prefix):'',h('div',{className:'capcol sg'},h('span',{},f.value?h('img',{src:f.value}):''),h('i',{className:'cp'},f.label||'')))
 :f.type==='cap'
 ?h('div',{className:'pfld cap'},f.prefix?h('b',{className:'pre'},f.prefix):'',h('div',{className:'capcol'},h('span',{dir:'auto'},f.value||''),h('i',{className:'cp'},f.label||'')))
 :f.type==='choice'
 ?h('div',{className:'pfld'},h('b',{},f.label?f.label+':':''),h('span',{className:'pco'},f.opts.map((o,i)=>h('span',{className:'po'+(f.sel===i?' circ':'')},o.text,o.fill?[' ',h('span',{className:'pfl'},o.val||''),' '+(o.unit||'')]:[]))),f.detail?[h('b',{},(f.dlabel||'')+':'),h('span',{className:'pdl',dir:'auto'},f.dtext||'')]:'')
 :h('div',{className:'pfld'},h('b',{},f.label?f.label+':':''),h('span',{dir:'auto',className:f.type==='number'?'ctr':''},fv(f)),f.unit?h('b',{dir:'auto'},f.unit):'');
const fv=f=>f.type==='date'&&f.value?f.value.split('-').reverse().join('/'):(f.value||'');
function buildPrint(plan){
 const P=$('print');P.replaceChildren();
 P.dir=D.lang==='he'?'rtl':'ltr';
 const T=D.title?h('h1',{dir:'auto'},D.title):null; // document title: first page only
 const H=h('div',{className:'phd'}); // pinned cells + בס"ד go here
 D.cells.forEach((c,ci)=>{
  const d=c.dir,u=c.u?' ul':'',out=c.pin?H:h('div',{className:'kw'}); // each cell is kept together on one page
  if(c.pin)H.classList.add('has');else out.dataset.i=ci;
  if(c.type==='heading')out.append(h('h2',{dir:d,className:u.trim()},c.text));
  else if(c.type==='text')out.append(h('p',{dir:d,className:u.trim()},c.text));
  else if(c.type==='question')out.append(h('p',{dir:d,className:'q'+u},c.text),h('p',{dir:d},c.answer||''));
  else if(c.type==='fields'){
   const g=h('div',{className:'pf',dir:d==='auto'?P.dir:d},c.fields.map(pf));
   out.append(g);
  }
  else if(c.type==='lines'){}
  else if(c.type==='check'){
   if(c.text)out.append(h('p',{dir:d,className:'q'+u},c.text));
   c.items.forEach(it=>out.append(h('div',{className:'pck',dir:d==='auto'?P.dir:d},
    h('b',{},it.sel!=null?'●':'○'),
    h('span',{},it.opts.map((o,k)=>[k?' / ':'',h('span',{className:'po'+(it.sel===k&&it.opts.length>1?' circ':'')},o.text)]).flat()))));
  }
  else if(c.type==='list'){
   if(c.text)out.append(h('p',{dir:d,className:'q'+u},c.text));
   c.items.forEach((it,i)=>{out.append(h('div',{className:'pli',dir:d==='auto'?P.dir:d},h('b',{},marker(c,i)),h('span',{},it.t||'')));if(c.sig)out.append(psig(it.sig,c.sigLabel))});
  }
  else if(c.type==='choice'){
   out.append(h('div',{className:'pch',dir:d==='auto'?P.dir:d},
    h('b',{className:u.trim()},c.text?c.text+':':''),
    c.opts.map((o,i)=>h('span',{className:'po'+(c.sel===i?' circ':'')},o)),
    c.detail?[h('b',{},(c.dlabel||'')+':'),h('span',{className:'pdl',dir:'auto'},c.dtext||'')]:[]));
  }
  else{
   if(c.text)out.append(h('p',{dir:d,className:'q'},c.text));
   const hr=h('tr');
   if(c.useRowHeaders)hr.append(h('th',{dir:d},c.corner||''));
   c.headers.forEach(x=>hr.append(h('th',{dir:d},x)));
   const tb=h('tbody');
   c.rows.forEach((r,ri)=>{const tr=h('tr');
    if(c.useRowHeaders)tr.append(h('th',{dir:d},c.rowHeaders[ri]||''));
    r.forEach(x=>tr.append(h('td',{dir:d},x)));tb.append(tr)});
   out.append(h('table',{},h('thead',{},hr),tb));
  }
 if(['question','fields','choice','lines'].includes(c.type))for(let k=0;k<(c.lines||0);k++)out.append(h('div',{className:'bl',dir:d},(c.lt||[])[k]||''));
  if(!c.pin){
   if(plan&&plan.brk[ci])out.classList.add('pbrk');
   P.append(out);
  }
 });
 // Layout: [top text, repeats] > [title, first page only] > [pinned cells, repeat] > content
 const wrap=(hd,nodes)=>{const td=h('td');td.append(...nodes);return h('table',{className:'pg'},h('thead',{},h('tr',{},h('td',{},hd))),h('tbody',{},h('tr',{},td)))};
 const body=[...P.childNodes];
 const core=H.childNodes.length?[wrap(H,body)]:body;
 const inner=T?[T,...core]:core;
 if(D.top)P.replaceChildren(wrap(h('div',{className:'phd'},h('div',{className:'bsd'},D.top)),inner));
 else P.replaceChildren(...inner);
 return P;
}
function exportPDF(){
 window._printing=true; // keep the page estimator away from the print layout until printing ends
 const L=measureLayout(buildPrint());
 const P=buildPrint(L);
 fitRows(P);
 const oldTitle=document.title;document.title=D.title||'document'; // browser prints this in its header, and uses it as the PDF file name
 window.addEventListener('afterprint',()=>{document.title=oldTitle;window._printing=false;updatePages()},{once:true});
 setTimeout(()=>{window._printing=false},60000);
 const imgs=[...P.querySelectorAll('img')]; // wait until signatures are decoded, then print
 if(imgs.length)Promise.all(imgs.map(i=>i.decode().catch(()=>0))).then(()=>window.print());else window.print();
}

// If a row of fields is too wide for the page, first tighten the gaps between the choice options (then wrap only if still needed)
function fitRows(P){
 P.style.cssText='display:block;position:absolute;left:-9999px;width:182mm;font-size:12pt';
 const wrapped=r=>{const k=[...r.children];return k.some(x=>Math.abs(x.getBoundingClientRect().top-k[0].getBoundingClientRect().top)>2)};
 P.querySelectorAll('.pf').forEach(r=>{for(const k of ['tight','tighter']){if(!wrapped(r))break;r.classList.add(k)}});
 P.removeAttribute('style');
}

// Estimates on which page each cell lands (same rules as the browser: a cell is kept whole; forced breaks / minimum page numbers are applied)
function measureLayout(){
 const P=$('print'),mm=v=>v*96/25.4,pt=v=>v*96/72;
 P.style.cssText='display:block;position:absolute;left:-9999px;width:182mm;font-size:12pt';
 const th=P.querySelector('table.pg>thead'),T=P.querySelector('h1');
 const avail=mm(265)-(th?th.offsetHeight:0);
 let page=1,y=T?T.offsetHeight+pt(12):0,last=1;
 const L={page:{},first:{},brk:{}};
 P.querySelectorAll('.kw').forEach(k=>{
  const i=+k.dataset.i,c=D.cells[i],hh=k.offsetHeight;let gap=y>0?pt(7):0;
  const forced=c.pb&&y>0;
  if(forced){page++;y=0;gap=0}
  L.brk[i]=forced;
  if(y>0&&y+gap+hh>avail){page++;y=0;gap=0}
  L.page[i]=page;L.first[i]=page>last;
  y+=gap+hh;
  if(y>avail){const n=Math.ceil(y/avail)-1;page+=n;y-=n*avail}
  last=page;
 });
 P.removeAttribute('style');
 return L;
}
// Shows the estimated page number on every cell, and marks the cell where a new page begins
function updatePages(){
 if(window._printing)return;
 const L=measureLayout(buildPrint());window._L=L;if(D.fill){markFillPages(L);return}
 document.querySelectorAll('.pgno').forEach(s=>{
  const i=+s.dataset.i,p=L.page[i];
  s.textContent=p?t('pgl')+' '+p:'';s.title=t('pgest');
  const cell=s.closest('.cell');if(cell)cell.classList.toggle('newpg',!!(L.first[i]||L.brk[i]));
 });
}