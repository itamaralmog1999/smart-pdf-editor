const VERSION='2026-10-09'; // shown next to the autosave note, to confirm an update arrived
// App state (D), helpers, and autosave to the browser.
const KEY='nbeditor.v1';
let D=load()||{title:'',lang:'he',cells:[]};
const $=id=>document.getElementById(id);
const uid=()=>Math.random().toString(36).slice(2,9);
const t=k=>T[D.lang][k];

function load(){try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return null}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}}