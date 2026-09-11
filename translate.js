(function () {
  var lexicon = window.PANATAU_LEXICON || [];
  var foldMap = {
    "ă": "a", "â": "a", "î": "i", "ș": "s", "ț": "t",
    "Ă": "a", "Â": "a", "Î": "i", "Ș": "s", "Ț": "t",
    "ş": "s", "ţ": "t", "Ş": "s", "Ţ": "t"
  };

  function fold(s) {
    return String(s || "").replace(/[ăâîșțĂÂÎȘȚşţŞŢ]/g, function (ch) {
      return foldMap[ch] || ch;
    }).toLowerCase().replace(/['’]/g, "").replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim();
  }

  function unique(list) {
    var seen = {};
    var out = [];
    list.forEach(function (item) {
      if (!item || seen[item]) return;
      seen[item] = true;
      out.push(item);
    });
    return out;
  }

  var roIndex = {};
  var enIndex = {};
  var dialectIndex = {};

  lexicon.forEach(function (entry) {
    var roKey = fold(entry.ro);
    if (!roIndex[roKey]) roIndex[roKey] = [];
    roIndex[roKey].push(entry);
    var enKeys = [entry.en].concat(entry.alts || []);
    enKeys.forEach(function (en) {
      var enKey = fold(en);
      if (!enKey) return;
      if (!enIndex[enKey]) enIndex[enKey] = [];
      enIndex[enKey].push(entry);
    });
    (entry.dialects || []).forEach(function (d) {
      var dKey = fold(d.form);
      if (!dKey) return;
      if (!dialectIndex[dKey]) dialectIndex[dKey] = [];
      dialectIndex[dKey].push({ entry: entry, dialect: d });
    });
  });

  function lookup(key, dir) {
    if (!key) return [];
    if (dir === "ro-en") {
      return (roIndex[key] || []).concat((dialectIndex[key] || []).map(function (x) { return x.entry; }));
    }
    return enIndex[key] || [];
  }

  function tokenize(text) {
    var parts = [];
    var re = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*|[^\s]/gu;
    var m;
    while ((m = re.exec(text))) {
      parts.push({ raw: m[0], key: fold(m[0]), isWord: /[\p{L}\p{N}]/u.test(m[0]) });
    }
    return parts;
  }

  function longestHit(tokens, start, dir) {
    var max = Math.min(5, tokens.length - start);
    var i;
    for (i = max; i >= 1; i--) {
      var slice = tokens.slice(start, start + i);
      if (!slice.every(function (t) { return t.isWord; })) continue;
      var key = fold(slice.map(function (t) { return t.raw; }).join(" "));
      var hits = lookup(key, dir);
      if (hits.length) return { size: i, hits: uniqueHits(hits), key: key };
    }
    return null;
  }

  function uniqueHits(hits) {
    var seen = {};
    var out = [];
    hits.forEach(function (h) {
      var id = fold(h.ro) + "|" + fold(h.en);
      if (seen[id]) return;
      seen[id] = true;
      out.push(h);
    });
    return out;
  }

  function joinMeanings(hits, dir) {
    if (dir === "ro-en") return unique(hits.map(function (h) { return h.en; })).join(" / ");
    return unique(hits.map(function (h) { return h.ro; })).join(" / ");
  }

  function collectDialects(hits) {
    var chips = [];
    hits.forEach(function (h) {
      (h.dialects || []).forEach(function (d) {
        chips.push({
          head: h.ro,
          form: d.form,
          regions: d.regions,
          note: d.note || ""
        });
      });
    });
    return chips;
  }

  function collectNotes(hits) {
    return unique(hits.map(function (h) { return h.note; }).filter(Boolean));
  }

  function translateLocal(text, dir) {
    var tokens = tokenize(text);
    var out = [];
    var unknown = [];
    var dialects = [];
    var notes = [];
    var coveredWords = 0;
    var totalWords = 0;
    var i = 0;
    while (i < tokens.length) {
      var tok = tokens[i];
      if (!tok.isWord) {
        out.push(tok.raw);
        i += 1;
        continue;
      }
      totalWords += 1;
      var hit = longestHit(tokens, i, dir);
      if (hit) {
        coveredWords += hit.size;
        out.push(joinMeanings(hit.hits, dir));
        dialects = dialects.concat(collectDialects(hit.hits));
        notes = notes.concat(collectNotes(hit.hits));
        if (dir === "ro-en" && dialectIndex[hit.key]) {
          dialectIndex[hit.key].forEach(function (x) {
            dialects.push({
              head: x.entry.ro,
              form: x.dialect.form,
              regions: x.dialect.regions,
              note: x.dialect.note || "Regional form of " + x.entry.ro + "."
            });
          });
        }
        i += hit.size;
      } else {
        unknown.push(tok.raw);
        out.push(tok.raw);
        i += 1;
      }
    }
    var seenChip = {};
    dialects = dialects.filter(function (d) {
      var id = d.form + "|" + d.regions;
      if (seenChip[id]) return false;
      seenChip[id] = true;
      return true;
    });
    return {
      text: out.join(" ").replace(/\s+([,.;:!?])/g, "$1").replace(/\s+/g, " ").trim(),
      unknown: unique(unknown),
      dialects: dialects,
      notes: unique(notes),
      covered: coveredWords,
      total: totalWords,
      complete: totalWords > 0 && unknown.length === 0
    };
  }

  window.PanatauTranslate = {
    fold: fold,
    local: translateLocal
  };

  var input = document.getElementById("tr-in");
  var output = document.getElementById("tr-out");
  var status = document.getElementById("tr-status");
  var notesBox = document.getElementById("tr-notes");
  var dialectsBox = document.getElementById("tr-dialects");
  var unknownBox = document.getElementById("tr-unknown");
  var dirBtns = document.querySelectorAll("[data-dir]");
  var clearBtn = document.getElementById("tr-clear");
  var swapBtn = document.getElementById("tr-swap");
  var form = document.getElementById("tr-form");
  var dir = "ro-en";
  var timer = 0;
  var fallbackTimer = 0;
  var fallbackSeq = 0;

  if (!input || !output) return;

  function currentDir() {
    return dir;
  }

  function setDir(next) {
    dir = next;
    dirBtns.forEach(function (btn) {
      var on = btn.getAttribute("data-dir") === dir;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    input.setAttribute("placeholder", dir === "ro-en"
      ? "Bună ziua. Vreau pâine, vă rog."
      : "Good day. I want bread, please.");
    render(false);
  }

  function setStatus(text, kind) {
    if (!status) return;
    status.textContent = text || "";
    status.className = "tr-status" + (kind ? " is-" + kind : "");
  }

  function renderDialects(chips) {
    if (!dialectsBox) return;
    if (!chips.length) {
      dialectsBox.hidden = true;
      dialectsBox.innerHTML = "";
      return;
    }
    dialectsBox.hidden = false;
    dialectsBox.innerHTML = "<p class=\"tr-kicker\">Dialect forms</p>" +
      chips.map(function (d) {
        return "<span class=\"tr-chip\"><strong>" + escapeHtml(d.form) + "</strong> · " +
          escapeHtml(d.regions) + "<span class=\"tr-chip-note\">" + escapeHtml(d.note) + "</span></span>";
      }).join("") +
      "<p class=\"tr-dialect-link\">Only a few well-known variants, not a map of every village. More on <a href=\"dialects.html\">dialects</a>.</p>";
  }

  function renderNotes(notes) {
    if (!notesBox) return;
    if (!notes.length) {
      notesBox.hidden = true;
      notesBox.innerHTML = "";
      return;
    }
    notesBox.hidden = false;
    notesBox.innerHTML = notes.map(function (n) { return "<p>" + escapeHtml(n) + "</p>"; }).join("");
  }

  function renderUnknown(words) {
    if (!unknownBox) return;
    if (!words.length) {
      unknownBox.hidden = true;
      unknownBox.textContent = "";
      return;
    }
    unknownBox.hidden = false;
    unknownBox.textContent = "Not in the site list: " + words.join(", ") + ".";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[ch];
    });
  }

  function render(wantFallback) {
    var text = input.value;
    if (!text.trim()) {
      output.textContent = "";
      setStatus("The dictionary works without a network. Type a word from the list, or a short phrase.");
      renderDialects([]);
      renderNotes([]);
      renderUnknown([]);
      return;
    }
    var local = translateLocal(text, dir);
    output.textContent = local.text;
    renderDialects(local.dialects);
    renderNotes(local.notes);
    renderUnknown(local.unknown);
    if (local.complete) {
      setStatus("From the site dictionary. Offline.");
      return;
    }
    if (!local.total) {
      setStatus("Nothing to translate yet.");
      return;
    }
    if (local.covered) {
      setStatus("Partly from the site dictionary. Unknown words are left as they are.");
    } else {
      setStatus("Not in the site dictionary.");
    }
    if (wantFallback && local.unknown.length) {
      requestFallback(text, local);
    }
  }

  function requestFallback(text, local) {
    var seq = ++fallbackSeq;
    var pair = dir === "ro-en" ? "ro|en" : "en|ro";
    var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text.trim()) + "&langpair=" + pair;
    setStatus((local.covered ? "Partly from the dictionary. " : "") + "Trying a free public fallback…");
    fetch(url, { headers: { Accept: "application/json" } }).then(function (res) {
      if (!res.ok) throw new Error("bad status");
      return res.json();
    }).then(function (data) {
      if (seq !== fallbackSeq) return;
      var translated = data && data.responseData && data.responseData.translatedText;
      var code = data && data.responseStatus;
      if (!translated || (code && Number(code) !== 200)) throw new Error("empty");
      if (/INVALID SOURCE LANGUAGE|MYMEMORY WARNING|QUERY LENGTH/i.test(translated)) throw new Error("rejected");
      output.textContent = translated;
      setStatus("Online fallback (MyMemory). Check it. The dictionary is the reliable part, and it works offline.", "fallback");
    }).catch(function () {
      if (seq !== fallbackSeq) return;
      setStatus(local.covered
        ? "Dictionary only. The public fallback failed or is offline; unknown words were left as they are."
        : "No dictionary match, and the public fallback failed. Try a shorter phrase from the word list.");
    });
  }

  dirBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setDir(btn.getAttribute("data-dir"));
    });
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      render(true);
    });
  }

  input.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(function () { render(false); }, 140);
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(function () {
      var local = translateLocal(input.value, dir);
      if (input.value.trim() && local.unknown.length && local.total >= 4) render(true);
    }, 1400);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      input.value = "";
      output.textContent = "";
      fallbackSeq += 1;
      render(false);
      input.focus();
    });
  }

  if (swapBtn) {
    swapBtn.addEventListener("click", function () {
      var next = dir === "ro-en" ? "en-ro" : "ro-en";
      var previousOut = output.textContent;
      if (previousOut) input.value = previousOut;
      setDir(next);
    });
  }

  setDir("ro-en");
})();
