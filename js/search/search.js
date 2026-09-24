/* COQ — Servicio de búsqueda global.
 * Usa un índice ligero de verbos y no depende de la base completa de Conjugación.
 */
(function(){
  'use strict';
  const input=document.querySelector('#searchInput');
  const results=document.querySelector('#searchResults');
  if(!input||!results)return;

  const pagePrefix=location.pathname.includes('/pages/')?'':'pages/';
  const staticData=[
    ['Les adjectifs possessifs','Grammaire · A1','grammar-possessifs.html'],
    ['Les articles partitifs','Grammaire · A1','stage-partitifs.html'],
    ['Vocabulaire de la nourriture','Vocabulaire · A1','stage-vocabulario.html'],
    ['Prendre — présent','Conjugaison · A1','conjugaison.html'],
    ['En el restaurante y en la cocina','Tema · A1','topic-restaurant.html']
  ];
  const verbIndex=Array.isArray(window.COQ_VERB_SEARCH_INDEX)?window.COQ_VERB_SEARCH_INDEX:[];
  const data=staticData.concat(verbIndex.map(verb=>[verb,'Conjugación','conjugaison.html']));

  function close(){results.classList.remove('open');}
  function escapeHtml(value){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}

  input.addEventListener('input',function(){
    const term=input.value.trim().toLocaleLowerCase('fr');
    if(!term){close();return;}
    const hits=data.filter(item=>item[0].toLocaleLowerCase('fr').includes(term)).slice(0,12);
    results.innerHTML=(hits.length?hits:[['Aún no hay resultados para esta búsqueda','Coq · búsqueda global','']])
      .map(item=>'<a class="result" href="'+(item[2]?pagePrefix+item[2]:'')+'">'+escapeHtml(item[0])+'<small>'+escapeHtml(item[1])+'</small></a>')
      .join('');
    results.classList.add('open');
  });

  document.addEventListener('click',function(event){
    if(!event.target.closest('.search-wrap'))close();
  });
})();
