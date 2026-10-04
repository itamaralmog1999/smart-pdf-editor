// Cells, tables and the main render() function.
function newCell(type){
 const c={id:uid(),type,dir:'auto',text:''};
 if(type==='question')c.answer='';
 if(type==='table'){c.headers=[t('c1')+' 1',t('c1')+' 2'];c.corner='';c.useRowHeaders=false;c.rowHeaders=[''];c.rows=[['','']]}
 return c;
}
function add(type){D.cells.push(newCell(type));save();render();window.scrollTo(0,document.body.scrollHeight)}
function move(i,d){const j=i+d;if(j<0||j>=D.cells.length)return;[D.cells[i],D.cells[j]]=[D.cells[j],D.cells[i]];save();render()}

function tableUI(c){
 const w=h('div');
 const dir=c.dir;
 const head=h('tr');
 if(c.useRowHeaders)head.append(h('th',{},arrField(c,'corner',t('corner'),dir)));
 c.headers.forEach((_,i)=>{
  head.append(h('th',{},arrField(c.headers,i,t('c1'),dir),
   c.headers.length>1?h('div',{style:'text-align:center'},btn('✕',()=>{c.headers.splice(i,1);c.rows.forEach(r=>r.splice(i,1));save();render()},'x')):''));
 });
 const body=h('tbody');
 c.rows.forEach((r,ri)=>{
  const tr=h('tr');
  if(c.useRowHeaders)tr.append(h('th',{},arrField(c.rowHeaders,ri,t('r1'),dir)));
  r.forEach((_,ci)=>tr.append(h('td',{},arrField(r,ci,'',dir))));
  tr.append(h('td',{className:'k'},c.rows.length>1?btn('✕',()=>{c.rows.splice(ri,1);c.rowHeaders.splice(ri,1);save();render()},'x'):''));
  body.append(tr);
 });
 w.append(h('div',{className:'tw'},h('table',{},h('thead',{},head),body)));
 const cb=h('input',{type:'checkbox',checked:c.useRowHeaders,on:{change:e=>{c.useRowHeaders=e.target.checked;save();render()}}});
 w.append(h('div',{className:'tb'},
  btn(t('row'),()=>{c.rows.push(Array(c.headers.length).fill(''));c.rowHeaders.push('');save();render()}),
  btn(t('col'),()=>{c.headers.push(t('c1')+' '+(c.headers.length+1));c.rows.forEach(r=>r.push(''));save();render()}),
  h('label',{className:'c'},cb,t('rh'))));
 return w;
}

function cellUI(c,i){
 c._dir=c.dir==='auto'?'auto':c.dir;
 const sel=h('select',{on:{change:e=>{c.dir=e.target.value;save();render()}}},
  ['auto','rtl','ltr'].map(v=>h('option',{value:v,selected:c.dir===v},t(v))));
 const tools=h('div',{className:'tools'},t(c.type==='heading'?'h':c.type==='text'?'t':c.type==='question'?'q':'tb'),
  h('span',{className:'sp'}),sel,btn('▲',()=>move(i,-1)),btn('▼',()=>move(i,1)),btn('✕',()=>{D.cells.splice(i,1);save();render()},'x'));
 tools.querySelector('button:last-child').title=t('del');
 const body=h('div',{className:'body'});
 if(c.type==='heading')body.append(field(c,'text',t('title'),'h',false));
 else if(c.type==='text')body.append(field(c,'text',t('ph'),'',true));
 else if(c.type==='question')body.append(field(c,'text',t('qph'),'',true),field(c,'answer',t('aph'),'ans',true));
 else body.append(field(c,'text',t('ph'),'',false),tableUI(c));
 return h('div',{className:'cell'},tools,body);
}

function render(){
 document.documentElement.lang=D.lang;
 document.documentElement.dir=D.lang==='he'?'rtl':'ltr';
 const ti=$('title');ti.value=D.title;ti.placeholder=t('title');ti.dir='auto';
 const bar=$('bar');bar.replaceChildren(
  btn(t('pdf'),exportPDF,'p'),btn(t('exp'),exportJSON),btn(t('imp'),()=>$('file').click()),
  h('span',{className:'sp'}),h('small',{style:'color:var(--mute)'},t('saved')),btn(t('ui'),()=>{D.lang=D.lang==='he'?'en':'he';save();render()}));
 $('add').replaceChildren(btn('+ '+t('h'),()=>add('heading')),btn('+ '+t('t'),()=>add('text')),btn('+ '+t('q'),()=>add('question')),btn('+ '+t('tb'),()=>add('table')));
 $('cells').replaceChildren(...D.cells.map(cellUI));
}

