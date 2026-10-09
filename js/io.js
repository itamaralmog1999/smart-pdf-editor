// Export / import as a plain text file (.txt) containing JSON, because some phones block .json files. Importing accepts any text file.
// JSON export / import, encrypted export, and clearing local data.
function clean(){return JSON.parse(JSON.stringify(D,(k,v)=>k==='_dir'||k==='fid'||k==='fname'?undefined:v))}
function download(obj,name){
 const a=h('a',{href:URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'text/plain'})),download:name});
 document.body.append(a);a.click();a.remove();
}
function exportJSON(){download(clean(),(D.title||'document')+'.txt')}

// --- Encryption (AES-GCM, key from password via PBKDF2). Nothing leaves the browser. ---
const b64=u=>{let s='';new Uint8Array(u).forEach(x=>s+=String.fromCharCode(x));return btoa(s)};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function deriveKey(pw,salt){
 const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function encryptDoc(pw){
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},await deriveKey(pw,salt),new TextEncoder().encode(JSON.stringify(clean())));
 return {encrypted:true,v:1,salt:b64(salt),iv:b64(iv),data:b64(ct)};
}
async function decryptDoc(j,pw){
 const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(j.iv)},await deriveKey(pw,unb64(j.salt)),unb64(j.data));
 return JSON.parse(new TextDecoder().decode(pt));
}
async function exportEncrypted(){
 const pw=prompt(t('pw'));if(!pw)return;
 download(await encryptDoc(pw),(D.title||'document')+'.enc.txt');
}

function clearData(){
 if(!confirm(t('clrq')))return;
 try{localStorage.removeItem(KEY)}catch(e){}
 D={title:'',lang:D.lang,cells:[]};render();
}

$('file').addEventListener('change',e=>{
 const f=e.target.files[0];if(!f)return;
 const r=new FileReader();
 r.onload=async()=>{
  try{
   let j=JSON.parse(r.result.replace(/^\uFEFF/,'').trim()); // the file is JSON text; works for .txt and .json
   if(j.encrypted){
    const pw=prompt(t('pw2'));if(!pw)return;
    try{j=await decryptDoc(j,pw)}catch(x){alert(t('wrongpw'));return}
   }
   if(!Array.isArray(j.cells))throw 0;
   D=Object.assign({title:'',lang:'he'},j);save();render();
  }catch(x){alert(t('bad'))}
 };
 r.readAsText(f);e.target.value='';
});