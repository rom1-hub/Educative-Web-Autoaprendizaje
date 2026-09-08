/* COQ — Capa única de presentación de tablas de conjugación.
 *
 * Responsabilidad exclusiva:
 * - transformar la representación técnica de las filas en la forma visible;
 * - gestionar la elisión de je/j';
 * - presentar los sujetos del subjonctif con que/qu';
 * - separar grupos de sujetos cuando la fuente los entrega agrupados.
 *
 * Este módulo NO genera conjugaciones y NO modifica el motor.
 */
(function(){
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

  const SUBJECT_GROUPS={
    'il/elle/on':['il','elle','on'],
    'ils/elles':['ils','elles']
  };

  const VOWELS=/^[aeiouàâäéèêëîïôöùûüÿœæ]/i;

  function normalizeSubject(value){
    return String(value||'')
      .trim()
      .toLowerCase()
      .replace(/\s+/g,' ');
  }

  function stripMetadata(value){
    return String(value||'')
      .replace(/\s*\([^)]*\)\s*/g,'')
      .trim();
  }

  function baseSubject(value){
    return stripMetadata(value)
      .replace(/^que\s+/i,'')
      .replace(/^qu['’]/i,'')
      .trim()
      .toLowerCase();
  }

  function elideJe(label,form){
    const subject=normalizeSubject(label);
    const value=String(form||'').trim();

    if(subject==='je' && VOWELS.test(value))return "j'";
    if(subject==='que je' && VOWELS.test(value))return "que j'";
    return label;
  }

  function addSubjonctifPrefix(label,form){
    const raw=String(label||'').trim();
    const base=baseSubject(raw);
    const prefix=SUBJ_PREFIXES[base];
    if(!prefix)return raw;
    if(/^que\s|^qu['’]/i.test(raw))return elideJe(raw,form);
    return elideJe(prefix,form);
  }

  function splitGroupedRows(rows,tense){
    const result=[];

    (rows||[]).forEach(function(row){
      const subject=String(row?.[0]||'').trim();
      const form=String(row?.[1]||'').trim();
      const base=normalizeSubject(stripMetadata(subject));
      const group=SUBJECT_GROUPS[base];

      if(!group){
        result.push([subject,form]);
        return;
      }

      const suffix=(subject.match(/\s*(\([^)]*\))\s*$/)||[])[1]||'';
      group.forEach(function(member){
        let label=member;
        if(tense==='subjonctif présent')label=addSubjonctifPrefix(label,form);
        else label=elideJe(label,form);
        result.push([label+(suffix?' '+suffix:''),form]);
      });
    });

    return result;
  }

  function normalizeRows(rows,tense){
    return splitGroupedRows(rows,tense).map(function(row){
      const label=String(row[0]||'').trim();
      const form=String(row[1]||'').trim();

      if(tense==='subjonctif présent'){
        return [addSubjonctifPrefix(label,form),form];
      }

      return [elideJe(label,form),form];
    });
  }

  function normalizeTable(table){
    if(!table || table.dataset.coqSubjectsNormalized==='1')return;

    const block=table.closest('.tense-block');
    const tense=block?.querySelector('.tense-head h3')?.textContent?.trim()||'';

    Array.from(table.querySelectorAll('tbody tr')).forEach(function(row){
      const cells=row.querySelectorAll('td');
      if(cells.length<2)return;

      const subject=cells[0].textContent.trim();
      const form=cells[1].textContent.trim();
      const base=normalizeSubject(stripMetadata(subject));
      const group=SUBJECT_GROUPS[base];

      if(group){
        const suffix=(subject.match(/\s*(\([^)]*\))\s*$/)||[])[1]||'';
        const fragment=document.createDocumentFragment();

        group.forEach(function(member){
          const tr=document.createElement('tr');
          const subjectCell=document.createElement('td');
          const formCell=document.createElement('td');
          let label=member;

          if(tense==='subjonctif présent')label=addSubjonctifPrefix(member,form);
          else label=elideJe(member,form);

          subjectCell.textContent=label+(suffix?' '+suffix:'');
          formCell.textContent=form;
          tr.append(subjectCell,formCell);
          fragment.appendChild(tr);
        });

        row.replaceWith(fragment);
        return;
      }

      if(tense==='subjonctif présent'){
        cells[0].textContent=addSubjonctifPrefix(subject,form);
      }else{
        cells[0].textContent=elideJe(subject,form);
      }
    });

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

  window.COQ_TABLE_PRESENTATION={
    normalizeRows,
    normalizeTable,
    apply
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();
