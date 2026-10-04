// PDF export (via browser print). Edit print look in css/style.css (@media print).
function exportPDF(){
 const P=$('print');P.replaceChildren();
 P.dir=D.lang==='he'?'rtl':'ltr';
 if(D.title)P.append(h('h1',{dir:'auto'},D.title));
 D.cells.forEach(c=>{
  const d=c.dir,u=c.u?' ul':'';
  if(c.type==='heading')P.append(h('h2',{dir:d,className:u.trim()},c.text));
  else if(c.type==='text')P.append(h('p',{dir:d,className:u.trim()},c.text));
  else if(c.type==='question')P.append(h('p',{dir:d,className:'q'+u},c.text),h('p',{dir:d},c.answer||''));
  else if(c.type==='fields'){
   P.append(h('div',{className:'pf'},c.fields.map(f=>h('div',{className:'pfld',dir:d},h('b',{},f.label+':'),h('span',{dir:'auto'},f.type==='date'&&f.value?f.value.split('-').reverse().join('/'):(f.value||''))))));
  }
  else{
   if(c.text)P.append(h('p',{dir:d,className:'q'},c.text));
   const hr=h('tr');
   if(c.useRowHeaders)hr.append(h('th',{dir:d},c.corner||''));
   c.headers.forEach(x=>hr.append(h('th',{dir:d},x)));
   const tb=h('tbody');
   c.rows.forEach((r,ri)=>{const tr=h('tr');
    if(c.useRowHeaders)tr.append(h('th',{dir:d},c.rowHeaders[ri]||''));
    r.forEach(x=>tr.append(h('td',{dir:d},x)));tb.append(tr)});
   P.append(h('table',{},h('thead',{},hr),tb));
  }
 });
 window.print();
}
