/* Portable work files and PDF generation; no student-data network requests. */
(function(root){
  const TYPE='butler-learning-portfolio', VERSION=1, MAX_TEXT=100000;
  function blank(course){return {profile:{name:'',group:''},active:'overview',step:0,chapters:Object.fromEntries(course.map(c=>[c.id,{answers:{},notes:'',checks:[false,false,false],feedback:''}]))};}
  function text(value,label,max=MAX_TEXT){if(typeof value!=='string'||value.length>max)throw new Error('Ungültiges Textfeld: '+label);return value;}
  function validate(file,course){
    if(!file||file.type!==TYPE||file.version!==VERSION||!file.work)throw new Error('Diese Datei ist kein unterstützter Butler-Arbeitsstand. Bitte eine .butler.json-Datei auswählen; PDFs lassen sich nicht als Arbeitsstand laden.');
    const raw=file.work,out=blank(course);
    if(!raw.profile||!raw.chapters||typeof raw.chapters!=='object'||Array.isArray(raw.chapters))throw new Error('Die Projektdatei ist unvollständig.');
    out.profile={name:text(raw.profile.name,'Name',200),group:text(raw.profile.group,'Klasse',100)};
    if(raw.active!=='overview'&&!course.some(c=>c.id===raw.active))throw new Error('Unbekanntes Kapitel.');
    if(!Number.isInteger(raw.step)||raw.step<0||raw.step>3)throw new Error('Ungültiger Lernschritt.');
    out.active=raw.active;out.step=raw.step;
    for(const id of Object.keys(raw.chapters))if(!course.some(c=>c.id===id))throw new Error('Unbekanntes Kapitel in der Datei.');
    for(const c of course){
      const src=raw.chapters[c.id];if(!src||!src.answers||typeof src.answers!=='object'||Array.isArray(src.answers))throw new Error('Kapitel fehlt oder ist beschädigt: '+c.title);
      const dst=out.chapters[c.id],keys=c.stages.flatMap(s=>s.fields.map(f=>f[0]));
      for(const key of Object.keys(src.answers)){if(!keys.includes(key))throw new Error('Unbekanntes Antwortfeld in '+c.title);dst.answers[key]=text(src.answers[key],key);}
      dst.notes=text(src.notes,'Notizen');dst.feedback=text(src.feedback,'Feedback');
      if(!Array.isArray(src.checks)||src.checks.length!==3||src.checks.some(v=>typeof v!=='boolean'))throw new Error('Ungültige Checkliste.');
      dst.checks=[...src.checks];
    }
    return out;
  }
  function wrap(work){return {type:TYPE,version:VERSION,savedAt:new Date().toISOString(),work};}
  function exportSections(work,course,scope){
    const selected=scope==='all'?course:course.filter(c=>c.id===scope);
    return selected.map(c=>({title:c.title,meta:`Lessons ${c.lessons} · ${c.product}`,blocks:[...c.stages.flatMap(s=>s.fields.map(f=>({label:f[1],text:work.chapters[c.id].answers[f[0]]||'—'}))),{label:'Pocket notes',text:work.chapters[c.id].notes||'—'},{label:'Self-check',text:c.stages[3].checks.map((t,i)=>`${work.chapters[c.id].checks[i]?'[x]':'[ ]'} ${t}`).join('\n')},{label:'Feedback',text:work.chapters[c.id].feedback||'—'}]}));
  }
  function makePdf(jsPDF,work,course,scope,fontBase64){
    const doc=new jsPDF({unit:'mm',format:'a4',compress:true});
    doc.addFileToVFS('NotoSans.ttf',fontBase64);doc.addFont('NotoSans.ttf','NotoSans','normal');doc.setFont('NotoSans');doc.setProperties({title:'The Butler — Learning portfolio',subject:'English Q1 LK',author:work.profile.name||'Learner'});
    const width=166,bottom=272;let y=25;
    function newPage(){doc.addPage();y=24;}
    function lineBlock(content,size=11,color=[40,59,68],gap=5.8){
      doc.setFontSize(size);doc.setTextColor(...color);
      const clean=String(content).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'');
      const lines=doc.splitTextToSize(clean||'—',width);
      for(const line of lines){if(y+gap>bottom)newPage();doc.text(line,22,y);y+=gap;}
      y+=3;
    }
    lineBlock('THE BUTLER',12,[119,37,56],7);lineBlock('An American story',24,[73,24,37],11);
    lineBlock('Learning portfolio · English Q1 LK',11,[85,104,116],6);
    lineBlock(`Name: ${work.profile.name||'—'}    Class: ${work.profile.group||'—'}`,11);
    lineBlock(`Exported: ${new Date().toLocaleString('de-DE')}`,9,[85,104,116],5);
    lineBlock('This PDF is a reading copy. Keep your .butler.json file to continue editing.',9,[85,104,116],5);
    const sections=exportSections(work,course,scope);
    sections.forEach((section,index)=>{if(index>0)newPage();else y+=5;
      lineBlock(section.title,19,[73,24,37],9);lineBlock(section.meta,9,[85,104,116],5);
      for(const b of section.blocks){if(y+22>bottom)newPage();lineBlock(b.label,12,[119,37,56],6.5);lineBlock(b.text);y+=3;}
    });
    const total=doc.getNumberOfPages();for(let n=1;n<=total;n++){doc.setPage(n);doc.setDrawColor(209,219,224);doc.line(22,281,188,281);doc.setFontSize(9);doc.setTextColor(99,119,130);doc.text('THE BUTLER · An American story',22,288);doc.text(`${n} / ${total}`,188,288,{align:'right'});}
    return doc;
  }
  root.Portfolio={blank,validate,wrap,exportSections,makePdf,TYPE,VERSION};
})(typeof window==='undefined'?globalThis:window);
