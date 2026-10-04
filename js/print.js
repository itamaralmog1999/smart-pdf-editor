// PDF export (via browser print). Edit print look in css/style.css (@media print).
const fv=f=>f.type==='date'&&f.value?f.value.split('-').reverse().join('/'):(f.value||'');
function exportPDF(){
 const P=$('print');P.replaceChildren();
 P.dir=D.lang==='he'?'rtl':'ltr';
 if(D.title)P.append(h('h1',{dir:'auto'},D.title));
 const H=h('div',{className:'phd'}); // pinned cells + בס"ד go here
 D.cells.forEach(c=>{
  const d=c.dir,u=c.u?' ul':'',out=c.pin?H:P;
  if(c.pin)H.classList.add('has');
  if(c.type==='heading')out.append(h('h2',{dir:d,className:u.trim()},c.text));
  else if(c.type==='text')out.append(h('p',{dir:d,className:u.trim()},c.text));
  else if(c.type==='question')out.append(h('p',{dir:d,className:'q'+u},c.text),h('p',{dir:d},c.answer||''));
  else if(c.type==='fields'){
   const g=h('div',{className:'pf',dir:d},c.fields.map(f=>h('div',{className:'pfld'},h('b',{},f.label+':'),h('span',{dir:'auto'},fv(f)))));
   g.style.gridTemplateColumns='repeat('+c.fields.length+',1fr)';
   out.append(g);
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
 });
 if(D.top||H.childNodes.length){
  // wrap everything in a table: its <thead> repeats at the top of every printed page
  if(D.top)H.prepend(h('div',{className:'bsd'},D.top));
  const td=h('td');td.append(...P.childNodes);
  P.replaceChildren(h('table',{className:'pg'},h('thead',{},h('tr',{},h('td',{},H))),h('tbody',{},h('tr',{},td))));
 }
 const oldTitle=document.title;document.title=D.title||'document'; // browser prints this in its header, and uses it as the PDF file name
 window.addEventListener('afterprint',()=>{document.title=oldTitle},{once:true});
 window.print();
}
