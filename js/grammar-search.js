(() => {
  "use strict";
  const input = document.querySelector("#grammar-topic-search");
  const results = document.querySelector("#grammar-search-results");
  const clearButton = document.querySelector(".grammar-search-clear");
  const curriculum = document.querySelector(".grammar-curriculum");
  if (!input || !results || !clearButton || !curriculum) return;

  const normalize = (value) => value.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[’']/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

  const topics = Array.from(curriculum.querySelectorAll(".grammar-level-section")).flatMap((section) => {
    const level = section.querySelector(".grammar-level-mark strong")?.textContent.trim() || "";
    return Array.from(section.querySelectorAll(".grammar-topic")).map((topic) => {
      const title = topic.querySelector(".grammar-topic-copy strong")?.textContent.trim() || "";
      const description = topic.querySelector(".grammar-topic-copy small")?.textContent.trim() || "";
      const group = topic.closest(".grammar-topic-group")?.querySelector("h3")?.textContent.trim() || "";
      const link = topic.matches("a[href]") ? topic.getAttribute("href") : null;
      return { title, description, group, level, link, searchable: normalize([title, description, group, level].join(" ")) };
    });
  });

  const createResult = (topic) => {
    const item = document.createElement(topic.link ? "a" : "div");
    item.className = "grammar-search-result";
    if (topic.link) item.href = topic.link;
    const copy = document.createElement("span");
    copy.className = "grammar-search-result-copy";
    const title = document.createElement("strong");
    title.textContent = topic.title;
    const detail = document.createElement("small");
    detail.textContent = topic.level + (topic.description ? " · " + topic.description : "");
    copy.append(title, detail);
    const status = document.createElement("span");
    status.className = "grammar-search-result-status";
    status.textContent = topic.link ? "Abrir lección →" : "En preparación";
    item.append(copy, status);
    return item;
  };

  const renderResults = () => {
    const query = normalize(input.value);
    results.replaceChildren();
    clearButton.hidden = !input.value;
    if (!query) { results.hidden = true; return; }
    const matches = topics.filter((topic) => topic.searchable.includes(query));
    results.hidden = false;
    if (!matches.length) {
      const message = document.createElement("p");
      message.className = "grammar-search-empty";
      message.textContent = "No se encontraron temas. Prueba con otro término.";
      results.append(message);
      return;
    }
    matches.forEach((topic) => results.append(createResult(topic)));
  };

  input.addEventListener("input", renderResults);
  clearButton.addEventListener("click", () => {
    input.value = "";
    renderResults();
    input.focus();
  });
})();