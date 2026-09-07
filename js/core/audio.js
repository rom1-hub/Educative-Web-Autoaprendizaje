/* Coq — servicio de audio global
 * Fuente única de verdad para la pronunciación mediante SpeechSynthesis.
 */
(function(){
  function normalizeFrenchSpeech(text){
    return String(text||'')
      // SpeechSynthesis/Chrome puede verbalizar la apostrophe francesa.
      // El texto visible conserva la ortografía correcta; para audio
      // usamos una grafía fonética sin apostrophe.
      .replace(/\bj['’]a(?:i|ie)\b/gi,'jè')
      .replace(/\bj['’]e/gi,'jè')
      .replace(/\bj['’]o/gi,'jo')
      .replace(/\bj['’]u/gi,'ju')
      .replace(/\bj['’]y/gi,'ji')
      .replace(/\bj['’]([aeiouyàâäéèêëîïôöùûüœæ])/gi,'j$1')
      .replace(/\bque\s+j['’]/gi,'que j')
      .replace(/\bqu['’]il\b/gi,'quil')
      .replace(/\bqu['’]elle\b/gi,'quelle')
      .replace(/\bqu['’]on\b/gi,'quon')
      .replace(/\bqu['’]ils\b/gi,'quils')
      .replace(/\bqu['’]elles\b/gi,'quelles');
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
