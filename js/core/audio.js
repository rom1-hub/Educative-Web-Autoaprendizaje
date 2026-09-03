/* Coq — servicio de audio global
 * Fuente única de verdad para la pronunciación mediante SpeechSynthesis.
 */
(function(){
  function speak(text){
    if(!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.lang="fr-FR";
    utterance.rate=.88;
    window.speechSynthesis.speak(utterance);
  }
  window.Coqaudio={speak:speak};
  function initAudio(){
    document.querySelectorAll("[data-say]").forEach(function(button){
      if(button.dataset.coqAudioReady==="1") return;
      button.dataset.coqAudioReady="1";
      button.addEventListener("click",function(){speak(button.dataset.say);});
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",initAudio);
  else initAudio();
})();
