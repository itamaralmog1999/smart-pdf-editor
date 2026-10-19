// Startup.
$('title').addEventListener('input',e=>{D.title=e.target.value;save()});
render();
driveInit();
// Warn if the css and js files come from different updates (a common cause of odd layout bugs)
setTimeout(()=>{
 if(!window.MYDOCS_CONFIG){const w=document.createElement('div');w.className='verwarn';w.textContent='⚠ הקובץ js/config.js חסר. הוסיפו אותו לפרויקט (ההגדרות שלכם נמצאות בו).';document.body.prepend(w)}
 const v=getComputedStyle(document.documentElement).getPropertyValue('--ver').replace(/["'\s]/g,'');
 if(v!==VERSION){const b=document.createElement('div');b.className='verwarn';b.textContent='⚠ קבצי האתר לא תואמים (css: '+(v||'חסר')+', js: '+VERSION+'). בצעו רענון חזק (Ctrl+Shift+R) או החליפו את css/style.css בגרסה העדכנית.';document.body.prepend(b)}
},400);