// Cells, tables and the main render() function.
function newCell(type){
 const c={id:uid(),type,dir:'auto',text:''};
 if(type==='question')c.answer='';
 if(type==='fields')c.fields=[{label:t('fl')+' 1',type:'date',value:''},{label:t('fl')+' 2',type:'date',value:''}];
 if(type==='choice'){c.opts=[t('o1'),t('o2')];c.sel=null;c.detail=true;c.dlabel=t('det');c.dtext='';c.lines=2}
 if(type==='lines')c.lines=4;
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
 const ub=(c.type==='table'||c.type==='fields'||c.type==='lines')?'':btn('U',()=>{c.u=!c.u;save();render()},c.u?'p':'');
 if(ub){ub.style.textDecoration='underline';ub.title=t('u')}
 const pb=btn('📌',()=>{c.pin=!c.pin;save();render()},c.pin?'on':'');
 pb.title=t('pin');
 const tools=h('div',{className:'tools'},t({heading:'h',text:'t',question:'q',table:'tb',fields:'fr',choice:'ch',lines:'ln'}[c.type])+(c.pin?' · '+t('pinned'):''),
  h('span',{className:'sp'}),pb,ub,sel,btn('▲',()=>move(i,-1)),btn('▼',()=>move(i,1)),btn('✕',()=>{D.cells.splice(i,1);save();render()},'x'));
 tools.querySelector('button:last-child').title=t('del');
 const body=h('div',{className:'body'});
 if(c.type==='heading')body.append(field(c,'text',t('title'),'h ut',false));
 else if(c.type==='text')body.append(field(c,'text',t('ph'),'ut',true));
 else if(c.type==='question')body.append(field(c,'text',t('qph'),'ut',true),field(c,'answer',t('aph'),'ans',true),linesCtl(c));
 else if(c.type==='fields')body.append(fieldsUI(c),linesCtl(c));
 else if(c.type==='choice')body.append(choiceUI(c));
 else if(c.type==='lines')body.append(linesUI(c));
 else body.append(field(c,'text',t('ph'),'',false),tableUI(c));
 if(c.u)body.classList.add('ul');
 return h('div',{className:'cell'},tools,body);
}

function render(){
 document.documentElement.lang=D.lang;
 document.documentElement.dir=D.lang==='he'?'rtl':'ltr';
 const ti=$('title');ti.value=D.title;ti.placeholder=t('title');ti.dir='auto';
 const bar=$('bar');bar.replaceChildren(
  btn(t('pdf'),exportPDF,'p'),topInput(),btn(t('exp'),exportJSON),btn(t('imp'),()=>$('file').click()),
  h('span',{className:'sp'}),h('small',{style:'color:var(--mute)'},t('saved')),btn(t('ui'),()=>{D.lang=D.lang==='he'?'en':'he';save();render()}));
 $('add').replaceChildren(btn('+ '+t('h'),()=>add('heading')),btn('+ '+t('t'),()=>add('text')),btn('+ '+t('q'),()=>add('question')),btn('+ '+t('tb'),()=>add('table')),btn('+ '+t('fr'),()=>add('fields')),btn('+ '+t('ch'),()=>add('choice')),btn('+ '+t('ln'),()=>add('lines')));
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
  ...[['heading','h'],['text','t'],['question','q'],['table','tb'],['fields','fr'],['choice','ch'],['lines','ln']].map(([ty,k])=>btn(t(k),()=>insertAt(ty,i))),
  btn('✕',close,'x'));
 close();
 return box;
}

// Small text typed by hand (e.g. בס"ד), printed top-right on every page
function topInput(){
 const i=h('input',{value:D.top||'',placeholder:t('top'),className:'top',dir:'auto',title:t('toptip')});
 i.addEventListener('input',()=>{D.top=i.value;save()});
 return i;
}

// Number of blank writing lines printed after a cell
function linesCtl(c,onChange){
 const i=h('input',{type:'number',value:c.lines||0,min:0,max:60,className:'num'});
 i.addEventListener('input',()=>{c.lines=Math.max(0,Math.min(60,parseInt(i.value)||0));save();if(onChange)onChange()});
 return h('label',{className:'c'},t('ln')+':',i);
}
// Stand-alone block of blank lines
function linesUI(c){
 const pv=h('div',{className:'blpv'});
 const draw=()=>pv.replaceChildren(...Array.from({length:Math.min(c.lines||0,12)},()=>h('div',{className:'blp'})));
 draw();
 return h('div',{},linesCtl(c,draw),pv);
}
// Choice: label + options (tap one to circle it) + optional details line + blank lines
function choiceUI(c){
 const w=h('div');
 w.append(field(c,'text',t('qph'),'ut',false));
 const opts=h('div',{className:'tb'});
 c.opts.forEach((o,i)=>{
  const on=c.sel===i;
  opts.append(h('span',{className:'opt'+(on?' sel':'')},
   btn(on?'●':'○',()=>{c.sel=on?null:i;save();render()}),
   arrField(c.opts,i,t('opt')),
   c.opts.length>2?btn('✕',()=>{c.opts.splice(i,1);if(c.sel===i)c.sel=null;else if(c.sel>i)c.sel--;save();render()},'x'):''));
 });
 if(c.opts.length<6)opts.append(btn(t('addO'),()=>{c.opts.push('');save();render()}));
 w.append(opts);
 const cb=h('input',{type:'checkbox',checked:!!c.detail,on:{change:e=>{c.detail=e.target.checked;save();render()}}});
 w.append(h('div',{className:'tb'},h('label',{className:'c'},cb,t('det'))));
 if(c.detail)w.append(h('div',{className:'tb dt'},field(c,'dlabel',t('dlab'),'fl',false),field(c,'dtext','','line',false)));
 w.append(linesCtl(c));
 return w;
}
