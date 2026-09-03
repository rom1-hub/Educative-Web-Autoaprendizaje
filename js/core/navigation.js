/* Coq — navegación responsive global
 * Fuente única de verdad para el menú de navegación en todas las páginas.
 */
(function(){
  function initCoqMenu(){
    document.querySelectorAll('.nav').forEach(function(nav){
      const button=nav.querySelector('.menu');
      const links=nav.querySelector('.navlinks');
      if(!button || !links || button.dataset.coqMenuReady==='1') return;
      button.dataset.coqMenuReady='1';
      button.setAttribute('aria-expanded','false');
      button.addEventListener('click',function(ev){
        ev.preventDefault(); ev.stopPropagation();
        const open=links.classList.toggle('mobile-open');
        button.setAttribute('aria-expanded',open ? 'true' : 'false');
        if(!open) links.querySelectorAll('.nav-item.mobile-submenu-open').forEach(x=>x.classList.remove('mobile-submenu-open'));
      });
      const levelButton=links.querySelector('.nav-item > .nav-button');
      if(levelButton) levelButton.addEventListener('click',function(ev){
        if(window.innerWidth<=900){
          ev.preventDefault(); ev.stopPropagation();
          levelButton.parentElement.classList.toggle('mobile-submenu-open');
        }
      });
      links.addEventListener('click',function(ev){
        const a=ev.target.closest('a');
        if(a && window.innerWidth<=900){
          links.classList.remove('mobile-open');
          links.querySelectorAll('.nav-item.mobile-submenu-open').forEach(x=>x.classList.remove('mobile-submenu-open'));
          button.setAttribute('aria-expanded','false');
        }
      });
      document.addEventListener('click',function(ev){
        if(window.innerWidth<=900 && links.classList.contains('mobile-open') && !nav.contains(ev.target)){
          links.classList.remove('mobile-open');
          links.querySelectorAll('.nav-item.mobile-submenu-open').forEach(x=>x.classList.remove('mobile-submenu-open'));
          button.setAttribute('aria-expanded','false');
        }
      });
      window.addEventListener('resize',function(){
        if(window.innerWidth>900){
          links.classList.remove('mobile-open');
          links.querySelectorAll('.nav-item.mobile-submenu-open').forEach(x=>x.classList.remove('mobile-submenu-open'));
          button.setAttribute('aria-expanded','false');
        }
      });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initCoqMenu);
  else initCoqMenu();
})();
