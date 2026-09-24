/* COQ — Navegación de lecciones y protección de salida.
 * Conserva el comportamiento histórico de data-guard sin depender de legacy/script.js.
 */
(function(){
  'use strict';

  function hasUnfinishedExercises(){
    return [...document.querySelectorAll('.exercise')].some(function(exercise){
      const questions=[...exercise.querySelectorAll('.question')];
      return questions.length>0 && questions.some(function(question){return !question.dataset.done;});
    });
  }

  function navigate(url){
    if(!url)return;
    const modal=document.querySelector('#exitWarning');
    if(hasUnfinishedExercises()&&modal){
      modal.classList.add('open');
      modal.dataset.url=url;
      return;
    }
    location.href=url;
  }

  document.querySelectorAll('[data-guard]').forEach(function(link){
    link.addEventListener('click',function(event){
      event.preventDefault();
      navigate(link.getAttribute('href'));
    });
  });

  document.querySelectorAll('[data-close-warning]').forEach(function(button){
    button.addEventListener('click',function(){
      const modal=document.querySelector('#exitWarning');
      if(modal)modal.classList.remove('open');
    });
  });

  document.querySelectorAll('[data-confirm-warning]').forEach(function(button){
    button.addEventListener('click',function(){
      const modal=document.querySelector('#exitWarning');
      const url=modal&&modal.dataset.url;
      if(modal)modal.classList.remove('open');
      if(url)location.href=url;
    });
  });
})();
