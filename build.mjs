import {cp,mkdir} from 'node:fs/promises';
const root=new URL('./',import.meta.url);await mkdir(new URL('dist/',root),{recursive:true});
for(const f of ['index.html','style.css','script.js','assets','licenses','free-prompt.txt'])await cp(new URL(f,root),new URL('dist/'+f,root),{recursive:true});
