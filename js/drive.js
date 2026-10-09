// GOOGLE DRIVE: login, a "MYDOCS-<email>" folder in the user's own Drive, a file bar, templates, "done", and periodic refresh.
// The app only sees files it created itself (scope drive.file). Nothing is stored on any server of yours.
//
// ONE-TIME SETUP (by you, the developer): create an OAuth Client ID of type "Web application" in Google Cloud Console,
// add your site address (e.g. https://itamaralmog1999.github.io) under "Authorized JavaScript origins", and paste the Client ID here:

const GOOGLE_CLIENT_ID='448128086418-7lhu422d8dv433c7eahe9o7pmh2laj1p.apps.googleusercontent.com';
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.file';

const DT={
he:{files:'קבצים',login:'התחברות עם Google',logout:'התנתק',loginTitle:'MyDocs',loginSub:'טפסים חכמים שנשמרים בדרייב שלך',
 b1:'עובד בטלפון ובמחשב, עם אותם קבצים',b2:'המסמכים נשמרים בתיקייה בדרייב האישי שלך',b3:'האתר ניגש רק לקבצים שהוא יצר בעצמו',
 loginSkip:'להמשיך בלי חיבור (שמירה במכשיר בלבד)',loginNote:'המסמכים נשמרים בגוגל דרייב שלך, והאחריות על המידע ועל הגישה אליו היא שלך.',
 expired:'ההתחברות פגה, אפשר להתחבר שוב',setup:'עדיין לא הוגדר Client ID בקובץ drive.js',connecting:'מתחבר...',err:'בעיית חיבור לדרייב. אפשר להתחבר מחדש',
 every:'רענון כל',off:'כבוי',m1:'דקה',m2:'2 דקות',m5:'5 דקות',newdoc:'מסמך חדש',savehere:'שמור את המסמך הנוכחי בדרייב',
 tpls:'תבניות',work:'בעבודה',completed:'הושלמו',showdone:'הצג גם קבצים שהושלמו',donesh:'סיימתי',tpl:'תבנית',use:'צור מסמך',
 askname:'שם הקובץ (למשל תעודת הזהות של הלקוח):',askrename:'שם חדש לקובץ:',nofiles:'אין קבצים',search:'חיפוש קובץ',
 note:'הקבצים נשמרים בתיקייה בדרייב שלך:',doneNote:'ההורדה נעשתה והקובץ הוסתר מהרשימה (הוא נשאר בדרייב שלך)',cont:'המשך כ-'},
en:{files:'Files',login:'Sign in with Google',logout:'Sign out',loginTitle:'MyDocs',loginSub:'Smart forms saved in your own Drive',
 b1:'Works on phone and computer, same files',b2:'Documents are saved in a folder in your personal Drive',b3:'The site only accesses files it created itself',
 loginSkip:'Continue without signing in (saved on this device only)',loginNote:'Documents are saved in your Google Drive. You are responsible for the data and access to it.',
 expired:'Sign-in expired, please sign in again',setup:'No Client ID set yet in drive.js',connecting:'Connecting...',err:'Drive connection problem. You can reconnect',
 every:'Refresh every',off:'Off',m1:'1 min',m2:'2 min',m5:'5 min',newdoc:'New document',savehere:'Save the current document to Drive',
 tpls:'Templates',work:'In progress',completed:'Completed',showdone:'Also show completed files',donesh:'Done',tpl:'Template',use:'Create document',
 askname:'File name (e.g. the client ID number):',askrename:'New file name:',nofiles:'No files',search:'Search files',
 note:'Files are stored in this folder in your Drive:',doneNote:'Downloaded, and hidden from the list (it stays in your Drive)',cont:'Continue as '}};
const dt=k=>(DT[D&&D.lang]||DT.he)[k]||k;
const ls=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}};
const dr={token:'',exp:0,email:'',folder:'',files:[],msg:'',mt:{},poll:+(ls('mydocs.poll')||60),showDone:false,q:'',saving:false,dirty:false,edit:0,needAuth:false};
const D3='https://www.googleapis.com/drive/v3/',UP='https://www.googleapis.com/upload/drive/v3/';

// ---------- Google sign-in (token only, no server) ----------
let gsiP;
const loadGsi=()=>gsiP||(gsiP=new Promise((res,rej)=>{
 if(window.google&&google.accounts&&google.accounts.oauth2)return res();
 const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';
 s.onload=res;s.onerror=()=>{gsiP=null;rej(new Error('gsi'))};document.head.append(s);
}));
function getToken(interactive){
 return loadGsi().then(()=>new Promise((res,rej)=>{
  const tc=google.accounts.oauth2.initTokenClient({client_id:GOOGLE_CLIENT_ID,scope:DRIVE_SCOPE,hint:ls('mydocs.email')||undefined,
   callback:r=>{if(r.error)return rej(new Error(r.error));dr.token=r.access_token;dr.exp=Date.now()+(r.expires_in-120)*1000;res()},
   error_callback:e=>rej(new Error((e&&e.type)||'auth'))});
  tc.requestAccessToken({prompt:interactive?(ls('mydocs.email')?'':'consent'):'none'});
 }));
}
async function api(url,init={}){
 if(!dr.token||Date.now()>=dr.exp)await getToken(false);
 const r=await fetch(url,{...init,headers:{Authorization:'Bearer '+dr.token,...(init.headers||{})}});
 if(r.status===401){dr.token='';throw new Error('auth')}
 if(!r.ok)throw new Error('http '+r.status);
 return r;
}
const jget=async u=>(await api(u)).json();
const jsonH={'Content-Type':'application/json; charset=UTF-8'};
const setMsg=k=>{dr.msg=k;const m=document.querySelector('.dpm');if(m)m.textContent=k?dt(k):''};

async function driveConnect(interactive){
 try{
  setMsg('connecting');
  await getToken(interactive);
  dr.email=(await jget(D3+'about?fields=user(emailAddress)')).user.emailAddress;
  ls('mydocs.email',dr.email);
  dr.folder=await ensureFolder();
  await refreshList();
  dr.needAuth=false;setMsg('');startPoll();
  if(dr.dirty)driveFlush();
  closeLogin();renderPanel();rerenderBar();
  return true;
 }catch(e){dr.needAuth=true;setMsg('err');renderPanel();return false}
}
async function ensureFolder(){
 const name='MYDOCS-'+dr.email;
 const q=encodeURIComponent("name='"+name.replace(/'/g,"\\'")+"' and mimeType='application/vnd.google-apps.folder' and trashed=false");
 const r=await jget(D3+'files?q='+q+'&orderBy=createdTime&fields=files(id)');
 if(r.files.length)return r.files[0].id;      // already created (e.g. from the computer): use it
 return (await (await api(D3+'files?fields=id',{method:'POST',headers:jsonH,body:JSON.stringify({name,mimeType:'application/vnd.google-apps.folder'})})).json()).id;
}

// ---------- files in the folder ----------
async function refreshList(){
 const q=encodeURIComponent("'"+dr.folder+"' in parents and trashed=false");
 const r=await jget(D3+'files?q='+q+'&pageSize=300&orderBy=modifiedTime%20desc&fields=files(id,name,modifiedTime,appProperties)');
 dr.files=r.files.map(f=>({id:f.id,name:f.name.replace(/\.json$/,''),mt:f.modifiedTime,kind:(f.appProperties&&f.appProperties.kind)||'doc',done:!!(f.appProperties&&f.appProperties.done==='1')}));
 renderList();
}
async function createFile(name,obj,kind){
 const meta={name:name+'.json',parents:[dr.folder],mimeType:'application/json',appProperties:{kind:kind||'doc',done:'0'}},B='mydocs'+Date.now();
 const body='--'+B+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+'\r\n--'+B+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(obj)+'\r\n--'+B+'--';
 const r=await (await api(UP+'files?uploadType=multipart&fields=id,modifiedTime',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+B},body})).json();
 dr.mt[r.id]=r.modifiedTime;return r.id;
}
async function updateFile(id,obj){
 const r=await (await api(UP+'files/'+id+'?uploadType=media&fields=modifiedTime',{method:'PATCH',headers:jsonH,body:JSON.stringify(obj)})).json();
 dr.mt[id]=r.modifiedTime;
}
const readFile=async id=>(await api(D3+'files/'+id+'?alt=media')).json();
const patchMeta=(id,body)=>api(D3+'files/'+id,{method:'PATCH',headers:jsonH,body:JSON.stringify(body)});

// A copy of a template with everything that people fill in removed (answers, choices, signatures, lines, table cells...)
function blankOf(src){
 const o=JSON.parse(JSON.stringify(src));
 delete o.fid;delete o.fname;
 (o.cells||[]).forEach(c=>{
  delete c.lt;delete c.dtext;delete c.pg;
  if(c.type==='question')c.answer='';
  if(c.type==='choice'||c.type==='check')c.sel=null;
  if(c.type==='table')c.rows=c.rows.map(r=>r.map(()=>''));
  (c.fields||[]).forEach(f=>{f.value='';f.sig='';delete f.dtext;if(f.type==='choice'){f.sel=null;(f.opts||[]).forEach(p=>{if(p.fill)p.val=''})}});
  (c.items||[]).forEach(it=>{if('t' in it)it.t='';if('sig' in it)it.sig='';if('sel' in it)it.sel=null});
 });
 return o;
}
function useDoc(obj,id,name){
 D=Object.assign({title:'',lang:D.lang,cells:[]},obj);D.fid=id;D.fname=name;
 ls(KEY,JSON.stringify(D));
 render();window.scrollTo(0,0);
}
const askName=(msg,def)=>{const n=prompt(msg,def||'');return n&&n.trim().replace(/[\\/:*?"<>|]/g,'-')};

async function openFile(f){
 try{
  await driveFlush();
  const o=await readFile(f.id);dr.mt[f.id]=f.mt;
  useDoc(o,f.id,f.name);closePanel();
 }catch(e){setMsg('err')}
}
async function newDoc(){
 const n=askName(dt('askname'));if(!n)return;
 try{const o={title:'',lang:D.lang,cells:[]};useDoc(o,await createFile(n,o,'doc'),n);await refreshList();closePanel()}catch(e){setMsg('err')}
}
async function fromTemplate(f){
 const n=askName(dt('askname'));if(!n)return;
 try{
  const o=blankOf(await readFile(f.id));
  useDoc(o,await createFile(n,o,'doc'),n);await refreshList();closePanel();
 }catch(e){setMsg('err')}
}
async function saveCurrent(){
 const n=askName(dt('askname'),D.title);if(!n)return;
 try{const id=await createFile(n,clean(),'doc');D.fid=id;D.fname=n;ls(KEY,JSON.stringify(D));await refreshList();render();renderPanel()}catch(e){setMsg('err')}
}
async function renameFile(f){
 const n=askName(dt('askrename'),f.name);if(!n)return;
 try{await patchMeta(f.id,{name:n+'.json'});if(D.fid===f.id){D.fname=n;ls(KEY,JSON.stringify(D));render()}await refreshList()}catch(e){setMsg('err')}
}
async function toggleTpl(f,on){try{await patchMeta(f.id,{appProperties:{kind:on?'template':'doc'}});await refreshList()}catch(e){setMsg('err')}}
async function toggleDone(f,on){
 try{
  if(on){                       // finished: download the file to this device, then hide it from the list
   if(D.fid===f.id)await driveFlush();
   download(D.fid===f.id?clean():await readFile(f.id),f.name+'.txt');
  }
  await patchMeta(f.id,{appProperties:{done:on?'1':'0'}});await refreshList();
 }catch(e){setMsg('err')}
}
function driveLogout(){
 try{if(dr.token)google.accounts.oauth2.revoke(dr.token,()=>{})}catch(e){}
 clearInterval(dr.timer);Object.assign(dr,{token:'',email:'',folder:'',files:[],exp:0});ls('mydocs.email','');
 renderPanel();rerenderBar();
}

// ---------- saving + refreshing ----------
function driveSaveSoon(){
 if(!D||!D.fid||!dr.email)return;
 dr.dirty=true;dr.edit=Date.now();clearTimeout(dr.st);dr.st=setTimeout(driveFlush,2000);
}
async function driveFlush(){
 if(!dr.dirty||dr.saving||!D.fid||dr.needAuth)return;
 dr.saving=true;dr.dirty=false;
 try{await updateFile(D.fid,clean());if(dr.msg)setMsg('')}
 catch(e){dr.dirty=true;dr.needAuth=true;setMsg('err');rerenderBar()}
 dr.saving=false;
 if(dr.dirty&&!dr.needAuth)dr.st=setTimeout(driveFlush,4000);
}
const typing=()=>{const a=document.activeElement;return !!a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)&&a.id!=='dsearch'};
async function driveRefresh(){
 if(!dr.folder||document.hidden||dr.needAuth)return;
 try{
  await refreshList();
  const f=D.fid&&dr.files.find(x=>x.id===D.fid);
  if(f&&dr.mt[f.id]&&f.mt>dr.mt[f.id]&&!dr.dirty&&!dr.saving&&Date.now()-dr.edit>8000&&!typing()){
   const o=await readFile(f.id),y=window.scrollY;dr.mt[f.id]=f.mt;useDoc(o,f.id,f.name);window.scrollTo(0,y);   // changed on another device
  }
 }catch(e){dr.needAuth=true;setMsg('err');rerenderBar()}
}
function startPoll(){clearInterval(dr.timer);if(dr.poll>0)dr.timer=setInterval(driveRefresh,dr.poll*1000)}

// ---------- screens ----------
const rerenderBar=()=>{try{render()}catch(e){}};
function driveBtn(){
 const b=btn((dr.needAuth&&dr.email?'⚠ ':'📁 ')+(D.fname||dt('files')),openPanel,'on');b.title=dt('files');return b;
}
const cbox=(on,fn)=>{const c=h('input',{type:'checkbox',checked:on});c.addEventListener('change',()=>fn(c.checked));return c};
function openPanel(){renderPanel();$('dp').classList.add('open')}
function closePanel(){const p=$('dp');if(p)p.classList.remove('open')}
function pollSel(){
 const s=h('select',{on:{change:e=>{dr.poll=+e.target.value;ls('mydocs.poll',dr.poll);startPoll()}}},
  [[0,'off'],[60,'m1'],[120,'m2'],[300,'m5']].map(([v,k])=>h('option',{value:v,selected:dr.poll===v},dt(k))));
 return s;
}
function renderPanel(){
 let p=$('dp');if(!p){p=h('div',{id:'dp',className:'dp'});document.body.append(p)}
 p.dir=document.documentElement.dir;
 const on=!!dr.email;
 const search=h('input',{id:'dsearch',placeholder:dt('search'),value:dr.q,dir:'auto'});
 search.addEventListener('input',()=>{dr.q=search.value;renderList()});
 p.replaceChildren(
  h('div',{className:'dph'},h('b',{},'📁 '+dt('files')),h('span',{className:'sp'}),btn('✕',closePanel)),
  on?h('div',{className:'dpa'},h('div',{},'✓ '+dr.email),
    h('div',{className:'tb'},btn('🔄',driveRefresh),h('label',{className:'c'},dt('every')+':',pollSel()),btn(dt('logout'),driveLogout,'x')),
    h('div',{className:'dpm'},dr.msg?dt(dr.msg):''))
   :h('div',{className:'dpa'},btn(dt('login'),()=>driveConnect(true),'p'),h('div',{className:'dpm'},dr.msg?dt(dr.msg):'')),
  on?h('div',{className:'dpa'},h('div',{className:'tb'},btn('+ '+dt('newdoc'),newDoc,'p'),D.fid?'':btn(dt('savehere'),saveCurrent)),search):'',
  h('div',{id:'dpl'}),
  on?h('div',{className:'dpa dpm'},dt('note')+' MYDOCS-'+dr.email):'');
 renderList();
}
function renderList(){
 const L=$('dpl');if(!L)return;
 const q=dr.q.trim().toLowerCase(),m=f=>!q||f.name.toLowerCase().includes(q);
 const row=(f,tpl)=>h('div',{className:'dpr'+(f.id===D.fid?' cur':'')},
  h('button',{type:'button',className:'dpn',on:{click:()=>openFile(f)}},f.name),
  tpl?btn('➕ '+dt('use'),()=>fromTemplate(f),'p'):h('label',{className:'c'},cbox(f.done,v=>toggleDone(f,v)),dt('donesh')),
  h('label',{className:'c'},cbox(f.kind==='template',v=>toggleTpl(f,v)),dt('tpl')),
  btn('✎',()=>renameFile(f)));
 const sec=(title,list,tpl)=>list.length?[h('div',{className:'dps'},title+' ('+list.length+')'),...list.map(f=>row(f,tpl))]:[];
 const docs=dr.files.filter(m);
 const sd=h('label',{className:'c'},cbox(dr.showDone,v=>{dr.showDone=v;renderList()}),dt('showdone'));
 L.replaceChildren(
  ...sec(dt('tpls'),docs.filter(f=>f.kind==='template'),true),
  ...sec(dt('work'),docs.filter(f=>f.kind!=='template'&&!f.done),false),
  dr.files.length?'':h('div',{className:'dpm'},dt('nofiles')),
  sd,
  ...(dr.showDone?sec(dt('completed'),docs.filter(f=>f.kind!=='template'&&f.done),false):[]));
}
function closeLogin(){const l=$('lg');if(l)l.remove()}
function showLogin(expired){
 closeLogin();
 const em=ls('mydocs.email'),bad=GOOGLE_CLIENT_ID.startsWith('PASTE');
 const go=h('button',{type:'button',className:'lgb'},expired&&em?dt('cont')+em:dt('login'));
 go.addEventListener('click',()=>{if(bad){alert(dt('setup'));return}driveConnect(true)});
 const skip=h('button',{type:'button',className:'lgs'},dt('loginSkip'));
 skip.addEventListener('click',()=>{ls('mydocs.skip','1');closeLogin()});
 document.body.append(h('div',{id:'lg',className:'lgo',dir:document.documentElement.dir},h('div',{className:'lgc'},
  h('div',{className:'lge'},'📄'),h('h2',{},dt('loginTitle')),h('p',{className:'lgsub'},expired?dt('expired'):dt('loginSub')),
  h('ul',{},h('li',{},dt('b1')),h('li',{},dt('b2')),h('li',{},dt('b3'))),
  go,skip,bad?h('p',{className:'lgn'},'⚙ '+dt('setup')):'',h('p',{className:'lgn'},dt('loginNote')))));
}
function driveInit(){
 document.addEventListener('visibilitychange',()=>{if(document.hidden)driveFlush();else driveRefresh()});
 const em=ls('mydocs.email'),bad=GOOGLE_CLIENT_ID.startsWith('PASTE');
 if(em&&!bad)driveConnect(false).then(ok=>{if(!ok)showLogin(true)});   // silent reconnect with the remembered account
 else if(!ls('mydocs.skip'))showLogin();
}