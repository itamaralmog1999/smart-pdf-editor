// JSON export / import.
function clean(){return JSON.parse(JSON.stringify(D,(k,v)=>k==='_dir'?undefined:v))}
function exportJSON(){
 const a=h('a',{href:URL.createObjectURL(new Blob([JSON.stringify(clean(),null,2)],{type:'application/json'})),download:(D.title||'document')+'.json'});
 document.body.append(a);a.click();a.remove();
}
$('file').addEventListener('change',e=>{
 const f=e.target.files[0];if(!f)return;
 const r=new FileReader();
 r.onload=()=>{try{const j=JSON.parse(r.result);if(!Array.isArray(j.cells))throw 0;D=Object.assign({title:'',lang:'he'},j);save();render()}catch(x){alert(t('bad'))}};
 r.readAsText(f);e.target.value='';
});

