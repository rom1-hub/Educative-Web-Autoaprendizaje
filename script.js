
function speak(text){
 if(!("speechSynthesis" in window))return;
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(text);u.lang="fr-FR";u.rate=.88;speechSynthesis.speak(u);
}
document.querySelectorAll("[data-say]").forEach(b=>b.addEventListener("click",()=>speak(b.dataset.say)));

/* Exercises: no answer is revealed until every question has been answered. */
document.querySelectorAll(".exercise").forEach(ex=>{
 const questions=[...ex.querySelectorAll(".question")];
 questions.forEach(q=>{
  q.querySelectorAll(".option").forEach(o=>o.addEventListener("click",()=>{
   if(q.dataset.done)return;
   q.dataset.done="1";
   q.dataset.correct=o.dataset.answer==="correct"?"1":"0";
   o.classList.add(q.dataset.correct==="1"?"correct":"wrong");
   q.querySelectorAll(".option").forEach(x=>x.disabled=true);
   const fb=q.querySelector(".feedback");
   if(fb)fb.textContent="Respuesta registrada.";
   const done=questions.filter(x=>x.dataset.done).length;
   const bar=ex.querySelector(".exercise-progress span");
   const txt=ex.querySelector(".exercise-progress-text");
   const pct=Math.round(done/questions.length*100);
   if(bar)bar.style.width=pct+"%";
   if(txt)txt.textContent=`${done} / ${questions.length} respondidas`;
   if(done===questions.length){
    const answers=ex.querySelector(".answers"); if(answers)answers.classList.add("visible");
    const correct=questions.filter(x=>x.dataset.correct==="1").length;
    const score=ex.querySelector(".exercise-score"); if(score)score.textContent=`Resultado: ${correct} / ${questions.length}`;
    const complete=ex.querySelector(".exercise-complete"); if(complete)complete.classList.remove("hidden");
    localStorage.setItem("coq-stage-complete-"+location.pathname,"1");
    const pageComplete=document.querySelector("#completeBox"); if(pageComplete)pageComplete.classList.remove("hidden");
   }
  }));
 });
});

/* Exit warning for lesson navigation if mandatory exercises are unfinished. */
function hasUnfinishedExercises(){
 const exs=[...document.querySelectorAll(".exercise")];
 return exs.some(ex=>{
  const qs=[...ex.querySelectorAll(".question")];
  return qs.length && qs.some(q=>!q.dataset.done);
 });
}
function guardedNavigate(url){
 if(hasUnfinishedExercises()){
  const modal=document.querySelector("#exitWarning");
  if(modal){modal.classList.add("open");modal.dataset.url=url;return;}
 }
 location.href=url;
}
document.querySelectorAll("[data-guard]").forEach(a=>{
 a.addEventListener("click",e=>{e.preventDefault();guardedNavigate(a.getAttribute("href"));});
});
document.querySelectorAll("[data-close-warning]").forEach(b=>b.addEventListener("click",()=>{
 const modal=document.querySelector("#exitWarning"); if(modal)modal.classList.remove("open");
}));
document.querySelectorAll("[data-confirm-warning]").forEach(b=>b.addEventListener("click",()=>{
 const modal=document.querySelector("#exitWarning");const url=modal?.dataset.url;
 if(modal)modal.classList.remove("open"); if(url)location.href=url;
}));

/* Global search */
const input=document.querySelector("#searchInput"),results=document.querySelector("#searchResults");
if(input){
 input.addEventListener("input",()=>{
  const t=input.value.trim().toLowerCase();
  if(!t){results.classList.remove("open");return}
  const data=[
   ["Les adjectifs possessifs","Grammaire · A1","grammar-possessifs.html"],
   ["Les articles partitifs","Grammaire · A1","stage-partitifs.html"],
   ["Vocabulaire de la nourriture","Vocabulaire · A1","stage-vocabulario.html"],
   ["Prendre — présent","Conjugaison · A1","conjugaison.html"],
   ["En el restaurante y en la cocina","Tema · A1","topic-restaurant.html"]
  ];
  const hits=data.filter(x=>x[0].toLowerCase().includes(t));
  results.innerHTML=(hits.length?hits:[["Aún no hay resultados para esta búsqueda","Coq · búsqueda global",""]])
   .map(x=>`<a class="result" href="${x[2]}">${x[0]}<small>${x[1]}</small></a>`).join("");
  results.classList.add("open");
 });
 document.addEventListener("click",e=>{if(!e.target.closest(".search-wrap"))results.classList.remove("open")});
}

/* Conjugation prototype filters */
function updateConjLabel(){
 const v=document.querySelector("#verbSelect"),t=document.querySelector("#tenseSelect"),g=document.querySelector("#groupSelect");
 const out=document.querySelector("#conjSelection");
 if(out)out.textContent=`${v?.value||"verbo"} · ${t?.value||"tiempo"} · ${g?.value||"grupo"}`;
}
document.querySelectorAll("#verbSelect,#tenseSelect,#groupSelect").forEach(s=>s.addEventListener("change",updateConjLabel));

function mission(){alert("Prototipo: aquí construiremos una Mission interactiva paso a paso, con decisiones, feedback y resultado final.");}




/* Coq v26 — menú responsive global */
(function(){
  function initCoqMenu(){
    document.querySelectorAll('.nav').forEach(function(nav){
      const button=nav.querySelector('.menu');
      const links=nav.querySelector('.navlinks');
      if(!button || !links || button.dataset.coqMenuReady==='1') return;

      button.dataset.coqMenuReady='1';
      button.setAttribute('aria-expanded','false');

      button.addEventListener('click',function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        const open=links.classList.toggle('mobile-open');
        button.setAttribute('aria-expanded',open ? 'true' : 'false');
        if(!open){
          links.querySelectorAll('.nav-item.mobile-submenu-open')
            .forEach(x=>x.classList.remove('mobile-submenu-open'));
        }
      });

      const levelButton=links.querySelector('.nav-item > .nav-button');
      if(levelButton){
        levelButton.addEventListener('click',function(ev){
          if(window.innerWidth<=900){
            ev.preventDefault();
            ev.stopPropagation();
            levelButton.parentElement.classList.toggle('mobile-submenu-open');
          }
        });
      }

      links.addEventListener('click',function(ev){
        const a=ev.target.closest('a');
        if(a && window.innerWidth<=900){
          links.classList.remove('mobile-open');
          links.querySelectorAll('.nav-item.mobile-submenu-open')
            .forEach(x=>x.classList.remove('mobile-submenu-open'));
          button.setAttribute('aria-expanded','false');
        }
      });

      document.addEventListener('click',function(ev){
        if(window.innerWidth<=900 &&
           links.classList.contains('mobile-open') &&
           !nav.contains(ev.target)){
          links.classList.remove('mobile-open');
          links.querySelectorAll('.nav-item.mobile-submenu-open')
            .forEach(x=>x.classList.remove('mobile-submenu-open'));
          button.setAttribute('aria-expanded','false');
        }
      });

      window.addEventListener('resize',function(){
        if(window.innerWidth>900){
          links.classList.remove('mobile-open');
          links.querySelectorAll('.nav-item.mobile-submenu-open')
            .forEach(x=>x.classList.remove('mobile-submenu-open'));
          button.setAttribute('aria-expanded','false');
        }
      });
    });
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initCoqMenu);
  }else{
    initCoqMenu();
  }
})();
