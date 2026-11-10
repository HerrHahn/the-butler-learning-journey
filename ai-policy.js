/* Classroom labels only: never sends student work or suggestions anywhere. */
window.ButlerAiPolicy = (() => {
 const labels = {green:'GREEN · AI allowed',amber:'AMBER · Limited AI use',red:'RED · No AI'};
 const descriptions = {
  green:'You may use AI freely for this research task. Check the results, understand what you use, and state how you used AI.',
  amber:'Write your own draft. You may then use the optional AI feedback to review it; decide on revisions yourself.',
  red:'Complete this task independently without AI. No AI-generated text, answers, translations, or corrections, even for part of the task.'
 };
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function badge(level,detail){if(!labels[level])return '';return `<div class="ai-rule ai-rule-${level}" role="note"><strong><span class="ai-dot" aria-hidden="true"></span>${labels[level]}</strong><p>${esc(detail||descriptions[level])}</p></div>`;}
 function field(c,key){const s=c.stages.find(s=>s.fields.some(f=>f[0]===key));const p=s?.aiFields?.[key];return p?badge(typeof p==='string'?p:p.level,p.detail):'';}
 function stage(s){return s.ai==='mixed'?'<div class="ai-rule ai-rule-mixed" role="note"><strong>AI rules change within this step</strong><p>Research is GREEN. Share and compare, and the film connection, are RED. Follow the label on each task and answer field.</p></div>':badge(s.ai);}
 return {badge,field,stage};
})();
