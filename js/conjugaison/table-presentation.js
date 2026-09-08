/* COQ — Capa única de presentación de tablas de conjugación.
 *
 * Responsabilidad exclusiva:
 * - transformar la representación técnica de las filas en la forma visible;
 * - gestionar la elisión de je/j';
 * - presentar los sujetos del subjonctif con que/qu';
 * - separar grupos de sujetos cuando la fuente los entrega agrupados;
 * - aplicar decoraciones exclusivamente visuales del imperativo;
 * - añadir controles de audio a cada forma visible.
 *
 * Este módulo NO genera conjugaciones y NO modifica el motor.
 */
(function(){
  const SUBJ_PREFIXES={je:'que je',tu:'que tu',il:"qu'il",elle:"qu'elle",on:"qu'on",nous:'que nous',vous:'que vous',ils:"qu'ils",elles:"qu'elles"};
  const SUBJECT_GROUPS={'il/elle/on':['il','elle','on'],'ils/elles':['ils','elles']};
  const VOWELS=/^[aeiouàâäéèêëîïôöùûüÿœæ]/i;
  const YER_SIMPLE=new Set(["présent de l'indicatif",'imparfait','futur simple','conditionnel présent','subjonctif présent']);

  function normalizeSubject(value){return String(value||'').trim().toLowerCase().replace(/\s+/g,' ');}
  function stripMetadata(value){return String(value||'').replace(/\s*\([^)]*\)\s*/g,'').trim();}
  function baseSubject(value){return stripMetadata(value).replace(/^que\s+/i,'').replace(/^qu['’]/i,'').trim().toLowerCase();}
  function elideJe(label,form){const subject=normalizeSubject(label),value=String(form||'').trim();if(subject==='je'&&VOWELS.test(value))return "j'";if(subject==='que je'&&VOWELS.test(value))return "que j'";return label;}
  function addSubjonctifPrefix(label,form){const raw=String(label||'').trim(),base=baseSubject(raw),prefix=SUBJ_PREFIXES[base];if(!prefix)return raw;if(/^que\s|^qu['’]/i.test(raw))return elideJe(raw,form);return elideJe(prefix,form);}
  function speechForm(form){return stripMetadata(form).replace(/\s+/g,' ').trim();}
  function addFormAudioButtons(table){
    if(!table||table.dataset.coqFormAudioReady==='1')return;
    const speak=window.Coqaudio&&typeof window.Coqaudio.speak==='function'?window.Coqaudio.speak:null;
    if(!speak)return;
    table.querySelectorAll('tbody tr').forEach(function(row){
      const cells=row.querySelectorAll('td');
      if(cells.length<2||cells[1].querySelector('[data-speak-form]'))return;
      const form=cells[1].textContent.trim();
      const spoken=speechForm(form);
      if(!spoken)return;
      const button=document.createElement('button');
      button.type='button';
      button.className='btn tiny secondary';
      button.dataset.speakForm=spoken;
      button.setAttribute('aria-label','Écouter la forme « '+spoken+' »');
      button.textContent='🔊';
      button.style.marginLeft='8px';
      button.addEventListener('click',function(){speak(spoken);});
      cells[1].appendChild(button);
    });
    table.dataset.coqFormAudioReady='1';
  }

  function splitGroupedRows(rows,tense){
    const result=[];
    (rows||[]).forEach(function(row){
      const subject=String(row?.[0]||'').trim(),form=String(row?.[1]||'').trim(),base=normalizeSubject(stripMetadata(subject)),group=SUBJECT_GROUPS[base];
      if(!group){result.push([subject,form]);return;}
      const suffix=(subject.match(/\s*(\([^)]*\))\s*$/)||[])[1]||'';
      group.forEach(function(member){let label=member;if(tense==='subjonctif présent')label=addSubjonctifPrefix(label,form);else label=elideJe(label,form);result.push([label+(suffix?' '+suffix:''),form]);});
    });
    return result;
  }

  function normalizeRows(rows,tense){
    return splitGroupedRows(rows,tense).map(function(row){const label=String(row[0]||'').trim(),form=String(row[1]||'').trim();return tense==='subjonctif présent'?[addSubjonctifPrefix(label,form),form]:[elideJe(label,form),form];});
  }

  function decorateImperativeTable(table){
    if(!table||table.dataset.imperativeDecorated==='1')return;
    table.querySelectorAll('tbody tr').forEach(function(row){
      const subjectCell=row.querySelector('td:first-child');
      if(!subjectCell)return;
      const subject=subjectCell.textContent.trim();
      if(subject==='tu'||subject==='nous'||subject==='vous')subjectCell.textContent=subject+'*';
    });
    const tbody=table.querySelector('tbody');
    if(tbody){
      const noteRow=document.createElement('tr'),noteCell=document.createElement('td');
      noteCell.colSpan=2;
      noteCell.textContent='* En el imperativo los sujetos desaparecen. No se pronuncian, ni se escriben.';
      noteRow.appendChild(noteCell);tbody.appendChild(noteRow);
    }
    table.dataset.imperativeDecorated='1';
  }

  function groupYerTable(table){
    if(!table||table.dataset.yerGrouped==='1')return;
    const rows=Array.from(table.querySelectorAll('tbody tr'));
    const merge=function(subjects,label){
      const matches=rows.filter(row=>subjects.includes(row.querySelector('td:first-child')?.textContent.trim()));
      if(matches.length!==subjects.length)return;
      const forms=matches.map(row=>row.querySelector('td:nth-child(2)')?.textContent.trim());
      if(new Set(forms).size!==1)return;
      matches[0].querySelector('td:first-child').textContent=label;
      matches.slice(1).forEach(row=>row.remove());
    };
    merge(['il','elle','on'],'il/elle/on');
    merge(['ils','elles'],'ils/elles');
    table.dataset.yerGrouped='1';
  }

  function normalizeTable(table){
    if(!table||table.dataset.coqSubjectsNormalized==='1')return;
    const block=table.closest('.tense-block'),tense=block?.querySelector('.tense-head h3')?.textContent?.trim()||'';
    Array.from(table.querySelectorAll('tbody tr')).forEach(function(row){
      const cells=row.querySelectorAll('td');if(cells.length<2)return;
      const subject=cells[0].textContent.trim(),form=cells[1].textContent.trim(),base=normalizeSubject(stripMetadata(subject)),group=SUBJECT_GROUPS[base];
      if(group){
        const suffix=(subject.match(/\s*(\([^)]*\))\s*$/)||[])[1]||'',fragment=document.createDocumentFragment();
        group.forEach(function(member){const tr=document.createElement('tr'),subjectCell=document.createElement('td'),formCell=document.createElement('td');let label=member;if(tense==='subjonctif présent')label=addSubjonctifPrefix(member,form);else label=elideJe(member,form);subjectCell.textContent=label+(suffix?' '+suffix:'');formCell.textContent=form;tr.append(subjectCell,formCell);fragment.appendChild(tr);});
        row.replaceWith(fragment);return;
      }
      cells[0].textContent=tense==='subjonctif présent'?addSubjonctifPrefix(subject,form):elideJe(subject,form);
    });
    if(tense==='impératif présent')decorateImperativeTable(table);
    addFormAudioButtons(table);
    table.dataset.coqSubjectsNormalized='1';
  }

  function apply(){
    const result=document.querySelector('#conjResult');if(!result)return;
    result.querySelectorAll('.tense-table').forEach(function(table){
      const block=table.closest('.tense-block'),tense=block?.querySelector('.tense-head h3')?.textContent?.trim()||'';
      normalizeTable(table);
      if(tense==='impératif présent')decorateImperativeTable(table);
      if(YER_SIMPLE.has(tense)){
        const verb=document.querySelector('#lookupVerb')?.value?.trim().toLowerCase()||'';
        const resolver=window.COQ_PATTERN_RESOLVER;
        if(resolver&&typeof resolver.resolvePattern==='function'&&resolver.resolvePattern(verb)==='yer')groupYerTable(table);
      }
    });
  }

  function schedule(){window.setTimeout(apply,0);}
  function init(){const result=document.querySelector('#conjResult');if(result&&!result.dataset.coqTablePresentationObserver){result.dataset.coqTablePresentationObserver='1';new MutationObserver(schedule).observe(result,{childList:true,subtree:true});}schedule();}

  window.COQ_TABLE_PRESENTATION={normalizeRows,normalizeTable,apply};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
