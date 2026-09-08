/* COQ — Regla única de presentación de tablas de conjugación. */
(function(){
  const SIMPLE_TENSES=new Set([
    "présent de l'indicatif",
    'imparfait',
    'futur simple',
    'conditionnel présent',
    'subjonctif présent'
  ]);

  const SUBJECT_GROUPS={
    'il/elle/on':['il','elle','on'],
    'ils/elles':['ils','elles']
  };

  const SUBJ_PREFIXES={
    je:'que je',
    tu:'que tu',
    il:"qu'il",
    elle:"qu'elle",
    on:"qu'on",
    nous:'que nous',
    vous:'que vous',
    ils:"qu'ils",
    elles:"qu'elles"
  };

  function normalizeSubject(value){
    return String(value||'')
      .trim()
      .toLowerCase()
      .replace(/\s+/g,' ');
  }

  function splitSubjectRow(row,tense){
    const cells=row.querySelectorAll('td');
    if(cells.length<2)return false;

    const rawSubject=cells[0].textContent.trim();
    const normalized=normalizeSubject(
      rawSubject.replace(/\s*\([^)]*\)\s*$/,'')
    );
    const group=SUBJECT_GROUPS[normalized];

    if(!group)return false;

    const suffix=(rawSubject.match(/\s*(\([^)]*\))\s*$/)||[])[1]||'';
    const form=cells[1].textContent.trim();
    const fragment=document.createDocumentFragment();

    group.forEach(function(subject){
      const tr=document.createElement('tr');
      const subjectCell=document.createElement('td');
      const formCell=document.createElement('td');

      let label=subject;
      if(tense==='subjonctif présent'){
        label=SUBJ_PREFIXES[subject]||subject;
      }

      subjectCell.textContent=label+(suffix?' '+suffix:'');
      formCell.textContent=form;
      tr.append(subjectCell,formCell);
      fragment.appendChild(tr);
    });

    row.replaceWith(fragment);
    return true;
  }

  function addSubjonctifPrefix(row){
    const cells=row.querySelectorAll('td');
    if(cells.length<2)return;

    const rawSubject=cells[0].textContent.trim();
    const suffix=(rawSubject.match(/\s*(\([^)]*\))\s*$/)||[])[1]||'';
    const base=normalizeSubject(
      rawSubject.replace(/\s*\([^)]*\)\s*$/,'')
    );

    if(!SUBJ_PREFIXES[base])return;
    if(/^que\s|^qu['’]/i.test(base))return;

    cells[0].textContent=SUBJ_PREFIXES[base]+(suffix?' '+suffix:'');
  }

  function normalizeTable(table){
    if(table.dataset.coqSubjectsNormalized==='1')return;

    const block=table.closest('.tense-block');
    const tense=block?.querySelector('.tense-head h3')?.textContent?.trim()||'';

    if(tense==='impératif présent'){
      table.dataset.coqSubjectsNormalized='1';
      return;
    }

    Array.from(table.querySelectorAll('tbody tr')).forEach(function(row){
      splitSubjectRow(row,tense);
    });

    if(SIMPLE_TENSES.has(tense) && tense==='subjonctif présent'){
      table.querySelectorAll('tbody tr').forEach(addSubjonctifPrefix);
    }

    table.dataset.coqSubjectsNormalized='1';
  }

  function apply(){
    const result=document.querySelector('#conjResult');
    if(!result)return;
    result.querySelectorAll('.tense-table').forEach(normalizeTable);
  }

  function schedule(){
    window.setTimeout(apply,0);
  }

  function init(){
    const result=document.querySelector('#conjResult');
    if(result && !result.dataset.coqTablePresentationObserver){
      result.dataset.coqTablePresentationObserver='1';
      new MutationObserver(schedule).observe(result,{childList:true,subtree:true});
    }
    schedule();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();