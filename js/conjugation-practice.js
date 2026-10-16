/* ==========================================================
   COQ — MOTOR DE PRÁCTICA DE CONJUGACIÓN
   Usa el catálogo y el motor canónico de consulta existentes.
   No modifica la lógica de «Ver un verbo».
   ========================================================== */
(() => {
  "use strict";

  const TENSES = [
    ["present", "Présent de l'indicatif"],
    ["imparfait", "Imparfait"],
    ["passe-compose", "Passé composé"],
    ["plus-que-parfait", "Plus-que-parfait"],
    ["passe-simple", "Passé simple"],
    ["passe-anterieur", "Passé antérieur"],
    ["futur-simple", "Futur simple"],
    ["futur-anterieur", "Futur antérieur"],
    ["subjonctif-present", "Subjonctif présent"],
    ["subjonctif-passe", "Subjonctif passé"],
    ["subjonctif-imparfait", "Subjonctif imparfait"],
    ["subjonctif-plus-que-parfait", "Subjonctif plus-que-parfait"],
    ["conditionnel-present", "Conditionnel présent"],
    ["conditionnel-passe", "Conditionnel passé"],
    ["imperatif-present", "Impératif présent"],
    ["imperatif-passe", "Impératif passé"]
  ];
  const TENSE_LABELS = Object.fromEntries(TENSES);
  const PERSONS = ["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"];
  const MAX_QUESTIONS = 20;

  const normalize = value => String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  function infinitiveOf(verb) {
    return String(verb?.infinitif || verb?.infinitive || verb?.lemma || verb?.verb || verb?.verbe || verb?.forme || "")
      .replace(/[’‘]/g, "'").trim();
  }

  function keyedRecords(database, defaultType = "regular") {
    if (!database) return [];
    const entries = Array.isArray(database)
      ? database.map((record, index) => [String(index), record])
      : Object.entries(database);
    return entries.map(([key, record]) => {
      if (!record || typeof record !== "object") return null;
      const fallback = String(key).replace(/^se-/, "se ").replace(/-/g, " ");
      const label = infinitiveOf(record) || fallback;
      return { ...record, infinitif: label, ...(defaultType === "pronominal" ? { pronominal: true } : {}) };
    }).filter(Boolean);
  }

  function baseInfinitiveOf(verb) {
    return normalize(
      verb?.formeNonPronominale || verb?.infinitifBase || verb?.infinitif_base ||
      verb?.verbeBase || infinitiveOf(verb)
    ).replace(/^(?:se\s+|s')/, "");
  }

  function isPronominal(verb) {
    return Boolean(verb?.pronominal || /^(?:se\s+|s')/i.test(infinitiveOf(verb)));
  }

  function declaredGroup(verb) {
    const raw = verb?.groupe ?? verb?.group ?? verb?.groupeVerbal ?? verb?.verbalGroup;
    if (typeof raw === "number" && [1, 2, 3].includes(raw)) return raw;
    const value = normalize(raw);
    const match = value.match(/(?:^|\D)([123])(?:er|e|eme|ème)?(?:\s+groupe)?/);
    if (match) return Number(match[1]);
    if (/premier|1er/.test(value)) return 1;
    if (/deuxieme|2e|2eme/.test(value)) return 2;
    if (/troisieme|3e|3eme/.test(value)) return 3;
    return null;
  }

  function presentNous(verb) {
    const forms = verb?.formes?.["présent de l'indicatif"] ||
      verb?.formes?.["present de l'indicatif"];
    if (!Array.isArray(forms)) return "";
    const entry = forms[3];
    if (Array.isArray(entry)) return String(entry[entry.length - 1] ?? "").trim();
    if (entry && typeof entry === "object") return String(entry.form ?? entry.value ?? entry.conjugation ?? "").trim();
    return String(entry ?? "").trim().replace(/^nous\s+/i, "");
  }

  function groupOf(verb) {
    const base = baseInfinitiveOf(verb);
    if (base === "aller") return 3;
    const declared = declaredGroup(verb);
    if (declared) return declared;
    if (/er$/.test(base)) return 1;
    if (/ir$/.test(base) && /issons$/i.test(presentNous(verb))) return 2;
    return 3;
  }

  function familyOf(verb) {
    const base = baseInfinitiveOf(verb);
    const rawBase = String(
      verb?.formeNonPronominale || verb?.infinitifBase || verb?.infinitif_base ||
      verb?.verbeBase || infinitiveOf(verb)
    ).toLocaleLowerCase("fr").replace(/[’‘]/g, "'").trim().replace(/^(?:se\s+|s')/, "");
    const group = groupOf(verb);

    // Las familias del primer grupo tienen prioridad sobre la categoría
    // general de verbos regulares en -ER.
    if (group === 1) {
      if (/ger$/.test(base)) return "ger";
      if (/cer$/.test(base)) return "cer";
      if (/eler$/.test(base)) return "eler";
      if (/eter$/.test(base)) return "eter";
      if (/yer$/.test(base)) return "yer";
      if (/e[^aeiouy]er$/.test(rawBase)) return "e-accent";
      return "premier-groupe-reguliers";
    }

    if (group === 2) return "deuxieme-groupe";

    // Orden específico para evitar que las familias en -DRE absorban
    // -OUDRE y -EINDRE/-AINDRE/-OINDRE.
    if (/oudre$/.test(base)) return "oudre";
    if (/ttre$/.test(base)) return "ttre";
    if (/(?:eindre|aindre|oindre)$/.test(base)) return "eindre-combined";
    if (/aitre$/.test(base)) return "aitre";
    if (/(?:oir|oire)$/.test(base)) return "oir-oire";
    if (/uire$/.test(base) || /ire$/.test(base) || base === "faire" || base === "plaire") {
      return "ire-uire";
    }
    if (/dre$/.test(base)) return "dre";
    if (/ir$/.test(base)) return "ir";
    return "irreguliers";
  }

  function recordList(database) {
    if (!database) return [];
    return Array.isArray(database) ? database : Object.values(database);
  }

  function getBaseRecords() {
    const byInfinitive = new Map();
    const add = record => {
      if (!record || typeof record !== "object") return;
      const label = infinitiveOf(record);
      const key = normalize(label).replace(/^(?:se\s+|s')/, "");
      if (!key) return;
      const previous = byInfinitive.get(key);
      byInfinitive.set(key, previous ? { ...previous, ...record } : record);
    };
    keyedRecords(window.COQ_VERBS).forEach(add);
    keyedRecords(window.COQ_IMPERSONAL_VERBS).forEach(add);
    return byInfinitive;
  }

  function buildVerbPool() {
    const bases = getBaseRecords();
    const pool = [];
    const seen = new Set();

    for (const base of bases.values()) {
      if (isPronominal(base)) continue;
      const key = "base:" + normalize(infinitiveOf(base));
      if (!seen.has(key)) {
        seen.add(key);
        pool.push({ ...base, pronominal: false });
      }
    }

    const pronominalDatabase = window.COQ_PRONOMINAL_VERBS;
    for (const record of keyedRecords(pronominalDatabase, "pronominal")) {
      const label = infinitiveOf(record);
      const baseKey = baseInfinitiveOf(record);
      const base = bases.get(baseKey);
      if (!label || !base) continue;
      const key = "pronominal:" + normalize(label);
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push({
        ...base,
        ...record,
        infinitif: label,
        infinitifBase: baseKey,
        pronominal: true
      });
    }

    return pool;
  }

  function matchesAuxiliary(verb, requested) {
    if (!requested) return true;
    if (isPronominal(verb)) return requested === "etre";
    const declared = Array.isArray(verb?.auxiliaires)
      ? verb.auxiliaires.map(normalize)
      : [normalize(verb?.auxiliaire || verb?.auxiliary || "avoir")];
    // Se aplica la misma regla que en el motor de consulta: si hay dos
    // auxiliares declarados, se prioriza être; si no, se usa avoir.
    const selected = declared.includes("etre") ? "etre" : "avoir";
    return selected === requested;
  }

  function filterVerbs(filters) {
    let pool = buildVerbPool();
    const requestedVerb = normalize(filters.verb);

    // Si se ha indicado un infinitivo, ese verbo tiene prioridad sobre los
    // metadatos de familia/auxiliar: no deben excluirlo por etiquetas
    // incompletas o heredadas del catálogo.
    if (requestedVerb) {
      const exact = pool.filter(verb =>
        normalize(infinitiveOf(verb)) === requestedVerb
      );
      if (exact.length) return exact;

      // Permite escribir el verbo base cuando se ha elegido su construcción
      // pronominal, sin convertirlo en un filtro de familia.
      if (filters.construction === "pronominal" &&
          !/^(?:se\s+|s')/.test(requestedVerb)) {
        const pronominalMatches = pool.filter(verb =>
          isPronominal(verb) && baseInfinitiveOf(verb) === requestedVerb
        );
        if (pronominalMatches.length) return pronominalMatches;
      }
      return [];
    }

    if (filters.construction === "pronominal") pool = pool.filter(isPronominal);
    if (filters.construction === "non-pronominal") pool = pool.filter(verb => !isPronominal(verb));

    if (filters.family) {
      const requestedGroup = ({
        "premier-groupe": 1,
        "deuxieme-groupe": 2,
        "troisieme-groupe": 3
      })[filters.family];
      if (requestedGroup) {
        pool = pool.filter(verb => groupOf(verb) === requestedGroup);
      } else if (filters.family === "top-50") {
        // La lista de los 50 verbos se definirá junto con el usuario.
        pool = [];
      } else {
        pool = pool.filter(verb => familyOf(verb) === filters.family);
      }
    }

    if (filters.auxiliary) pool = pool.filter(verb => matchesAuxiliary(verb, filters.auxiliary));
    return pool;
  }

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function rowsFor(verb, tense, engine) {
    try {
      const rows = engine.conjugate(verb, tense);
      if (!Array.isArray(rows)) return [];
      return rows.filter(row => row && row.person && String(row.form ?? "").trim());
    } catch {
      return [];
    }
  }

  function sampleVerbsForQuestionGeneration(verbs, limit = 120) {
    if (verbs.length <= limit) return shuffle(verbs);
    const groups = new Map([[1, []], [2, []], [3, []]]);
    for (const verb of shuffle(verbs)) groups.get(groupOf(verb)).push(verb);
    const selected = [];
    const order = shuffle([1, 2, 3]);
    while (selected.length < limit) {
      let added = false;
      for (const group of order) {
        const next = groups.get(group).shift();
        if (next) {
          selected.push(next);
          added = true;
          if (selected.length >= limit) break;
        }
      }
      if (!added) break;
    }
    return selected;
  }

  function getCandidateQuestions(verbs, selectedTense, engine) {
    const tenses = selectedTense ? [selectedTense] : shuffle(TENSES.map(([key]) => key));
    const candidatesByGroup = new Map([[1, []], [2, []], [3, []]]);
    // El catálogo completo puede contener miles de verbos. Una muestra
    // equilibrada evita recorrer todos los tiempos de todo el catálogo
    // cada vez que se inicia una sesión.
    for (const verb of sampleVerbsForQuestionGeneration(verbs)) {
      const verbQuestions = [];
      for (const tense of tenses) {
        for (const row of rowsFor(verb, tense, engine)) {
          verbQuestions.push({
            verb,
            verbLabel: infinitiveOf(verb),
            tense,
            tenseLabel: TENSE_LABELS[tense],
            person: row.person,
            answer: String(row.form).trim(),
            group: groupOf(verb),
            pronominal: isPronominal(verb)
          });
        }
      }
      if (verbQuestions.length) {
        const group = groupOf(verb);
        candidatesByGroup.get(group).push(shuffle(verbQuestions));
      }
    }

    // Conservar una copia completa para poder completar veinte preguntas
    // cuando un filtro estrecho deja menos combinaciones distintas.
    const allQuestions = [...candidatesByGroup.values()].flat(2).map(question => ({ ...question }));
    // Una pregunta por verbo en la primera ronda y alternancia de grupos
    // para que «Todos los grupos» no se concentre en el primer grupo.
    const output = [];
    const groupOrder = shuffle([1, 2, 3]);
    let round = 0;
    while (output.length < MAX_QUESTIONS) {
      let addedThisRound = false;
      for (const group of groupOrder) {
        const queues = candidatesByGroup.get(group);
        if (!queues.length) continue;
        const verbQueue = queues[round % queues.length];
        if (!verbQueue || !verbQueue.length) continue;
        const question = verbQueue.shift();
        if (question) {
          output.push(question);
          addedThisRound = true;
          if (output.length >= MAX_QUESTIONS) break;
        }
      }
      if (!addedThisRound) {
        const remaining = [...candidatesByGroup.values()].flat(2);
        if (remaining.length) {
          output.push(...shuffle(remaining).slice(0, MAX_QUESTIONS - output.length));
        }
        break;
      }
      round++;
    }

    // Si el usuario fija un único verbo y un único tiempo, puede haber menos
    // de veinte combinaciones distintas. Completar la sesión sin bloquearla.
    if (output.length && output.length < MAX_QUESTIONS) {
      while (output.length < MAX_QUESTIONS) output.push({ ...allQuestions[output.length % allQuestions.length] });
    }
    return shuffle(output).slice(0, MAX_QUESTIONS);
  }

  function expandPedagogicalNotation(value) {
    let variants = [String(value ?? "").trim()];
    for (let guard = 0; guard < 4; guard++) {
      let changed = false;
      const next = [];
      for (const variant of variants) {
        const match = variant.match(/\(([^)]+)\)/);
        if (!match) {
          next.push(variant);
          continue;
        }
        changed = true;
        next.push(variant.slice(0, match.index) + variant.slice(match.index + match[0].length));
        next.push(variant.slice(0, match.index) + match[1] + variant.slice(match.index + match[0].length));
      }
      variants = [...new Set(next)];
      if (!changed) break;
    }
    return variants;
  }

  function normalizeAnswer(value) {
    return normalize(value)
      .replace(/[‐‑‒–—]/g, "-")
      .replace(/\s+/g, " ")
      .replace(/[.!?]+$/g, "")
      .trim();
  }

  function answerIsCorrect(value, expected) {
    const actual = normalizeAnswer(value);
    if (!actual) return false;
    return expandPedagogicalNotation(expected).some(variant => normalizeAnswer(variant) === actual);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  function createSession(filters, target, engine) {
    const verbs = filterVerbs(filters);
    if (!verbs.length) {
      target.innerHTML = '<div class="practice-notice is-error" role="alert">No se encontraron verbos que coincidan con los filtros. Comprueba el infinitivo o cambia algún filtro.</div>';
      return;
    }

    const questions = getCandidateQuestions(verbs, filters.tense, engine);
    if (!questions.length) {
      target.innerHTML = '<div class="practice-notice is-error" role="alert">No hay formas conjugadas disponibles para esta combinación de filtros.</div>';
      return;
    }

    let index = 0;
    let score = 0;
    let answered = false;
    const answers = [];
    const render = () => {
      if (index >= questions.length) {
        renderSummary();
        return;
      }
      const question = questions[index];
      const progress = Math.round((index / questions.length) * 100);
      target.innerHTML =
        '<section class="practice-session" aria-label="Sesión de práctica">' +
          '<div class="practice-session-top"><div><span class="eyebrow">Ejercicio ' + (index + 1) + ' de ' + questions.length + '</span>' +
          '<h2>Conjuga el verbo</h2></div><span class="practice-score">Puntuación: ' + score + ' / ' + index + '</span></div>' +
          '<div class="practice-progress" role="progressbar" aria-label="Progreso de la práctica" aria-valuemin="0" aria-valuemax="' + questions.length + '" aria-valuenow="' + index + '">' +
          '<span style="width:' + progress + '%"></span></div>' +
          '<div class="practice-prompt"><span class="practice-prompt-label">' + escapeHtml(question.tenseLabel) + '</span>' +
          '<div class="practice-prompt-main"><span class="practice-person">' + escapeHtml(question.person) + '</span>' +
          '<span class="practice-verb">' + escapeHtml(question.verbLabel) + '</span></div>' +
          '<p>Escribe la forma conjugada sin repetir el sujeto. No necesitas escribir el acento: también se aceptan respuestas sin diacríticos.</p></div>' +
          '<form class="practice-answer-form" data-practice-answer-form>' +
          '<label for="practice-answer">Tu respuesta</label>' +
          '<input id="practice-answer" name="answer" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" required aria-describedby="practice-answer-help">' +
          '<small id="practice-answer-help">En los tiempos compuestos, escribe también el auxiliar y el participio.</small>' +
          '<div class="practice-answer-actions"><button class="button button-primary" type="submit">Comprobar respuesta</button></div>' +
          '</form><div class="practice-feedback" data-practice-feedback aria-live="polite" hidden></div>' +
        '</section>';

      const form = target.querySelector("[data-practice-answer-form]");
      const input = target.querySelector("#practice-answer");
      const feedback = target.querySelector("[data-practice-feedback]");
      const submitButton = form.querySelector('button[type="submit"]');
      input.focus();

      form.addEventListener("submit", event => {
        event.preventDefault();
        if (answered) {
          index++;
          answered = false;
          render();
          return;
        }
        const userAnswer = input.value.trim();
        if (!userAnswer) {
          input.focus();
          return;
        }
        const correct = answerIsCorrect(userAnswer, question.answer);
        if (correct) score++;
        answers.push({ question, userAnswer, correct });
        answered = true;
        input.disabled = true;
        feedback.hidden = false;
        feedback.className = "practice-feedback " + (correct ? "is-correct" : "is-incorrect");
        feedback.innerHTML = correct
          ? '<strong>Correcto.</strong> La forma esperada es <span>' + escapeHtml(question.answer) + '</span>.'
          : '<strong>Respuesta incorrecta.</strong> La forma esperada es <span>' + escapeHtml(question.answer) + '</span>.';
        submitButton.textContent = index === questions.length - 1 ? "Ver resultados" : "Siguiente ejercicio";
        submitButton.focus();
        const bar = target.querySelector(".practice-progress");
        const fill = bar?.querySelector("span");
        if (bar) bar.setAttribute("aria-valuenow", String(index + 1));
        if (fill) fill.style.width = Math.round(((index + 1) / questions.length) * 100) + "%";
        target.querySelector(".practice-score").textContent = "Aciertos: " + score + " / " + questions.length;
      });
    };

    const renderSummary = () => {
      const percentage = Math.round((score / questions.length) * 100);
      const mistakes = answers.filter(answer => !answer.correct);
      target.innerHTML =
        '<section class="practice-summary" aria-label="Resultados de la práctica">' +
          '<span class="eyebrow">Sesión completada</span><h2>Resultados de tu práctica</h2>' +
          '<div class="practice-summary-score"><strong>' + score + ' / ' + questions.length + '</strong><span>' + percentage + ' % de respuestas correctas</span></div>' +
          '<div class="practice-progress" role="progressbar" aria-label="Resultado final" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + percentage + '">' +
          '<span style="width:' + percentage + '%"></span></div>' +
          '<p>' + (mistakes.length ? 'Revisa las formas que necesitas reforzar.' : 'Todas las respuestas han sido correctas.') + '</p>' +
          (mistakes.length ? '<details class="practice-mistakes"><summary>Revisar errores (' + mistakes.length + ')</summary><ul>' +
            mistakes.map(item => '<li><strong>' + escapeHtml(item.question.person + ' · ' + item.question.verbLabel + ' · ' + item.question.tenseLabel) + '</strong><span>Tu respuesta: ' + escapeHtml(item.userAnswer) + '</span><span>Forma esperada: ' + escapeHtml(item.question.answer) + '</span></li>').join("") +
            '</ul></details>' : '') +
          '<div class="practice-answer-actions"><button class="button button-primary" type="button" data-practice-restart>Repetir práctica</button></div>' +
        '</section>';
      target.querySelector("[data-practice-restart]")?.addEventListener("click", () => createSession(filters, target, engine));
    };

    render();
  }

  function start(filters, target) {
    const engine = window.COQ_LOOKUP_ENGINE;
    if (!engine || typeof engine.conjugate !== "function") {
      target.innerHTML = '<div class="practice-notice is-error" role="alert">El motor de conjugación no está disponible. Recarga la página o vuelve a intentarlo más tarde.</div>';
      return;
    }
    createSession({
      verb: String(filters?.verb ?? "").trim(),
      tense: String(filters?.tense ?? "").trim(),
      family: String(filters?.family ?? "").trim(),
      construction: String(filters?.construction ?? "").trim(),
      auxiliary: String(filters?.auxiliary ?? "").trim()
    }, target, engine);
  }

  window.COQ_PRACTICE_ENGINE = { start, answerIsCorrect };
})();
