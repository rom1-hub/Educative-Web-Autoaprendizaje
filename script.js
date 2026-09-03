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

/* Conjugation prototype filters */
function updateConjLabel(){
 const v=document.querySelector("#verbSelect"),t=document.querySelector("#tenseSelect"),g=document.querySelector("#groupSelect");
 const out=document.querySelector("#conjSelection");
 if(out)out.textContent=`${v?.value||"verbo"} · ${t?.value||"tiempo"} · ${g?.value||"grupo"}`;
}
document.querySelectorAll("#verbSelect,#tenseSelect,#groupSelect").forEach(s=>s.addEventListener("change",updateConjLabel));

function mission(){alert("Prototipo: aquí construiremos una Mission interactiva paso a paso, con decisiones, feedback y resultado final.");}
