// Cells, tables and the main render() function.
function newCell(type){
 const c={id:uid(),type,dir:'auto',text:''};
 if(type==='question')c.answer='';
 if(type==='fields')c.fields=[{label:t('fl')+' 1',type:'date',value:''},{label:t('fl')+' 2',type:'date',value:''}];
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
 const ub=(c.type==='table'||c.type==='fields')?'':btn('U',()=>{c.u=!c.u;save();render()},c.u?'p':'');
 if(ub){ub.style.textDecoration='underline';ub.title=t('u')}
 const tools=h('div',{className:'tools'},t({heading:'h',text:'t',question:'q',table:'tb',fields:'fr'}[c.type]),
  h('span',{className:'sp'}),ub,sel,btn('▲',()=>move(i,-1)),btn('▼',()=>move(i,1)),btn('✕',()=>{D.cells.splice(i,1);save();render()},'x'));
 tools.querySelector('button:last-child').title=t('del');
 const body=h('div',{className:'body'});
 if(c.type==='heading')body.append(field(c,'text',t('title'),'h ut',false));
 else if(c.type==='text')body.append(field(c,'text',t('ph'),'ut',true));
 else if(c.type==='question')body.append(field(c,'text',t('qph'),'ut',true),field(c,'answer',t('aph'),'ans',true));
 else if(c.type==='fields')body.append(fieldsUI(c));
 else body.append(field(c,'text',t('ph'),'',false),tableUI(c));
 if(c.u)body.classList.add('ul');
 return h('div',{className:'cell'},tools,body);
}

function render(){
 document.documentElement.lang=D.lang;
 document.documentElement.dir=D.lang==='he'?'rtl':'ltr';
 const ti=$('title');ti.value=D.title;ti.placeholder=t('title');ti.dir='auto';
 const bar=$('bar');bar.replaceChildren(
  btn(t('pdf'),exportPDF,'p'),btn(t('exp'),exportJSON),btn(t('imp'),()=>$('file').click()),
  h('span',{className:'sp'}),h('small',{style:'color:var(--mute)'},t('saved')),btn(t('ui'),()=>{D.lang=D.lang==='he'?'en':'he';save();render()}));
 $('add').replaceChildren(btn('+ '+t('h'),()=>add('heading')),btn('+ '+t('t'),()=>add('text')),btn('+ '+t('q'),()=>add('question')),btn('+ '+t('tb'),()=>add('table')),btn('+ '+t('fr'),()=>add('fields')));
 docOpts();
 $('cells').replaceChildren(...D.cells.flatMap((c,i)=>[inserter(i),cellUI(c,i)]),inserter(D.cells.length));
}


// One row of 1-4 fields, divided evenly (e.g. start date / end date)
const newF=i=>({label:t('fl')+' '+i,type:'text',value:''});
function fieldsUI(c){
 if(!c.fields)c.fields=c.frows?c.frows[0]:[newF(1),newF(2)]; // migrate older documents
 c.fields=c.fields.slice(0,4);
 const n=h('select',{on:{change:e=>{
  const k=+e.target.value;
  while(c.fields.length<k)c.fields.push(newF(c.fields.length+1));
  c.fields.length=k;save();render();
 }}},[1,2,3,4].map(v=>h('option',{value:v,selected:v===c.fields.length},v)));
 const g=h('div',{className:'frow'});
 g.style.setProperty('--n',c.fields.length);
 c.fields.forEach(f=>{
  const typeSel=h('select',{on:{change:e=>{f.type=e.target.value;f.value='';save();render()}}},
   ['text','date','number'].map(v=>h('option',{value:v,selected:f.type===v},t('f'+v))));
  const val=h('input',{type:f.type,value:f.value||'',className:'line',dir:'auto'});
  val.addEventListener('input',()=>{f.value=val.value;save()});
  g.append(h('div',{className:'fld'},field(f,'label',t('fl'),'fl',false),val,typeSel));
 });
 return h('div',{},h('div',{className:'tb'},t('inRow')+':',n),g);
}

// "+" button between cells (and before the first / after the last) to insert a new cell there
function insertAt(type,i){D.cells.splice(i,0,newCell(type));save();render()}
function inserter(i){
 const box=h('div',{className:'ins'});
 const close=()=>box.replaceChildren(btn('+',open,'plus'));
 const open=()=>box.replaceChildren(
  ...[['heading','h'],['text','t'],['question','q'],['table','tb'],['fields','fr']].map(([ty,k])=>btn(t(k),()=>insertAt(ty,i))),
  btn('✕',close,'x'));
 close();
 return box;
}

// Document-level options: Besiyata Dishmaya + a header line repeated on every printed page
function docOpts(){
 const cb=h('input',{type:'checkbox',checked:!!D.bsd});
 cb.addEventListener('change',()=>{D.bsd=cb.checked;save()});
 const hd=h('input',{value:D.header||'',placeholder:t('hdr'),className:'hdr',dir:'auto'});
 hd.addEventListener('input',()=>{D.header=hd.value;save()});
 $('opts').replaceChildren(h('label',{className:'c'},cb,t('bsd')),hd);
}
