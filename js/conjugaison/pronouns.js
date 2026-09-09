/* COQ — Pronombres y construcciones pronominales.
 * Capa de datos/reglas, sin interfaz.
 */
(function(){
  const subjectPronouns={
    je:'me', tu:'te', il:'se', elle:'se', on:'se', nous:'nous', vous:'vous', ils:'se', elles:'se'
  };
  const subjectBase={
    "j'":'je', je:'je', tu:'tu', il:'il', elle:'elle', on:'on', nous:'nous', vous:'vous', ils:'ils', elles:'elles',
    "que je":'je', "que j'":'je', "que tu":'tu', "qu'il":'il', "qu'elle":'elle', "qu'on":'on',
    "qu'il/elle/on":'il', "que nous":'nous', "que vous":'vous', "qu'ils":'ils', "qu'elles":'elles', "qu'ils/elles":'ils'
  };
  const imperativePronouns={tu:'toi',nous:'nous',vous:'vous'};
  function baseSubject(label){
    const s=String(label||'').trim();
    const withoutGender=s.replace(/\s*\([^)]*\)\s*$/,'').trim();
    if(subjectBase[s]) return subjectBase[s];
    if(subjectBase[withoutGender]) return subjectBase[withoutGender];
    const normalized=withoutGender.replace(/^qu['’]/,'').replace(/^que\s+/,'').replace(/^q['’]/,'').trim();
    if(subjectBase[normalized]) return subjectBase[normalized];
    const first=withoutGender.split(/\s+/)[0].split('/')[0];
    const normalizedFirst=first.replace(/^qu['’]/,'').replace(/^que\s*/,'').replace(/^q['’]/,'');
    return subjectBase[first]||subjectBase[normalizedFirst]||normalizedFirst;
  }
  function pronounFor(label){return subjectPronouns[baseSubject(label)]||null;}
  function imperativePronounFor(label){return imperativePronouns[baseSubject(label)]||null;}
  function contractPronoun(pronoun, nextWord){
    if(!pronoun || !nextWord) return pronoun;
    if(!['me','te','se'].includes(pronoun)) return pronoun;
    return /^[aeiouyàâäéèêëîïôöùûüÿh]/i.test(nextWord) ? pronoun.charAt(0)+"'" : pronoun;
  }
  function apply(subjectLabel, verbForm){
    const p=pronounFor(subjectLabel);
    if(!p) return verbForm;
    const clean=String(verbForm||'').trim();
    if(!clean) return clean;
    const first=clean.match(/^([^\s']+)/)?.[1]||clean;
    const cp=contractPronoun(p, first);
    return cp + (cp.endsWith("'")?'':' ') + clean;
  }
  window.COQ_CONJ_PRONOUNS={subjectPronouns,baseSubject,pronounFor,imperativePronounFor,contractPronoun,apply};
})();
