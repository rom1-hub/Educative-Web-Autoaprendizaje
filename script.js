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
