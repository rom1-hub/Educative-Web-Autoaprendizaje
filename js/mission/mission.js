/* COQ — Mission de la scène restaurant.
 * Comportamiento conservado durante la limpieza: el prototipo sigue mostrando
 * el mismo aviso hasta que la Mission interactiva esté implementada.
 */
(function(){
  'use strict';
  const missionButton=document.querySelector('#missionButton');
  if(!missionButton)return;
  missionButton.addEventListener('click',function(){
    alert('Prototipo: aquí construiremos una Mission interactiva paso a paso, con decisiones, feedback y resultado final.');
  });
})();
