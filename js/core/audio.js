/* Coq — servicio de audio global
 * Fuente única de verdad para la pronunciación mediante SpeechSynthesis.
 */
(function(){
  function normalizeFrenchSpeech(text){
    return String(text||'')
      // SpeechSynthesis/Chrome puede verbalizar la apostrophe de "j'aie"
      // como "j apostrophe". En francés "j'aie" y "j'ai" son homófonos;
      // para audio usamos la segunda grafía sin modificar el texto visible.
      .replace(/\bque\s+j['’]aie\b/gi,"que j'ai")
      .replace(/\bque\s+je\s+([aeiouyàâäéèêëîïôöùûüœæ])/gi,"que j'$1")
      .replace(/\bje\s+([aeiouyàâäéèêëîïôöùûüœæ])/gi,"j'$1")
      .replace(/\bque\s+il\b/gi,"qu'il")
      .replace(/\bque\s+elle\b/gi,"qu'elle")
      .replace(/\bque\s+on\b/gi,"qu'on");
  }

  function speak(text){
    if(!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(normalizeFrenchSpeech(text));
    utterance.lang='fr-FR';
    utterance.rate=.88;
    window.speechSynthesis.speak(utterance);
  }
  window.Coqaudio={speak:speak};
  function initAudio(){
    document.querySelectorAll('[data-say]').forEach(function(button){
      if(button.dataset.coqAudioReady==='1') return;
      button.dataset.coqAudioReady='1';
      button.addEventListener('click',function(){speak(button.dataset.say);});
    });
  }
  function fixConjugaisonResponsive(){
    if(!/conjugaison\.html$/i.test(window.location.pathname)) return;
    const style=document.createElement('style');
    style.id='conjugaison-responsive-fix';
    style.textContent=`
      @media (max-width:900px){
        .tense-block{overflow-x:hidden!important;min-width:0!important}
        .tense-table{width:100%!important;min-width:0!important;table-layout:fixed!important}
        .tense-table td,.tense-table th{overflow-wrap:anywhere;word-break:break-word}
        .result-table-wrap{overflow-x:hidden!important}
        .result-table{width:100%!important;min-width:0!important;table-layout:fixed!important}
        .result-table td,.result-table th{overflow-wrap:anywhere;word-break:break-word}
        .verb-summary #practiceThisVerb{min-width:0!important;white-space:normal!important}
      }
    `;
    document.head.appendChild(style);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){initAudio();fixConjugaisonResponsive();});
  else { initAudio(); fixConjugaisonResponsive(); }
})();
