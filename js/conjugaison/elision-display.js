/* COQ — Corrección visual de elisión en la consulta de conjugaciones. */
(function(){
  const VOWELS=/^[aeiouyàâäéèêëîïôöùûüœ]/i;

  function applyElision(){
    const result=document.querySelector('#conjResult');
    if(!result)return;

    result.querySelectorAll('.tense-block').forEach(block=>{
      const tense=block.querySelector('.tense-head h3')?.textContent?.trim()||'';
      const isCompound=window.COQ_CONJ_COMPOUND?.isCompound?.(tense);
      if(isCompound)return;

      block.querySelectorAll('.tense-table tbody tr').forEach(row=>{
        const cells=row.querySelectorAll('td');
        if(cells.length<2)return;

        const subject=cells[0].textContent.trim();
        const form=cells[1].textContent.trim();

        if(subject==='je' && VOWELS.test(form)){
          cells[0].textContent="j'";
        }else if(subject==='que je' && VOWELS.test(form)){
          cells[0].textContent="que j'";
        }
      });
    });
  }

  function schedule(){
    window.setTimeout(applyElision,0);
  }

  document.addEventListener('DOMContentLoaded',function(){
    const result=document.querySelector('#conjResult');
    if(result){
      new MutationObserver(schedule).observe(result,{childList:true,subtree:true});
    }
    document.querySelector('#lookupVerb')?.addEventListener('input',schedule);
    document.querySelector('#lookupVerb')?.addEventListener('change',schedule);
    document.querySelector('#lookupTense')?.addEventListener('change',schedule);
    schedule();
  });
})();
