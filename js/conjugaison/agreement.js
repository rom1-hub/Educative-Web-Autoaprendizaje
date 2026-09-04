/* COQ — Concordancia básica para Conjugaison.
 * Alcance deliberadamente limitado: sujeto y construcciones pronominales simples.
 * Los casos complejos de COD se tratarán en una lección independiente.
 */
(function(){
  const rules=window.COQ_PRONOMINAL_RULES||{};
  function normalizeGender(g){return g==='féminin'?'féminin':'masculin';}
  function normalizeNumber(n){return n==='pluriel'?'pluriel':'singulier';}
  function stripAgreementMarkers(form){return String(form||'').replace(/\(e\)\(s\)/g,'').replace(/\(e\)s/g,'').replace(/\(e\)/g,'');}
  function applySubjectAgreement(participle, subject){
    const g=normalizeGender(subject&&subject.gender), n=normalizeNumber(subject&&subject.number);
    const base=stripAgreementMarkers(participle);
    if(n==='pluriel') return base+(g==='féminin'?'es':'s');
    return base+(g==='féminin'?'e':'');
  }
  function agree(participle, subject, context){
    if(!context) return stripAgreementMarkers(participle);
    if(context.auxiliaire==='être' && context.type==='non-pronominale') return applySubjectAgreement(participle,subject);
    if(context.type!=='pronominale') return stripAgreementMarkers(participle);
    const rule=rules[context.baseVerb];
    if(!rule || rule.accord==='aucun') return stripAgreementMarkers(participle);
    if(rule.accord==='sujet') return applySubjectAgreement(participle,subject);
    return stripAgreementMarkers(participle);
  }
  window.COQ_CONJ_AGREEMENT={agree,applySubjectAgreement,stripAgreementMarkers};
})();
