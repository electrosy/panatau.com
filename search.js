(function () {
  var form = document.getElementById("search-form");
  var input = document.getElementById("search-q");
  var clearBtn = document.getElementById("search-clear");
  var status = document.getElementById("search-status");
  var results = document.getElementById("search-results");
  var pages = [];
  var ready = false;

  function fold(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ș|ş/gi, "s")
      .replace(/ț|ţ/gi, "t")
      .toLowerCase();
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function words(q) {
    return fold(q).split(/[^a-z0-9]+/).filter(function (w) {
      return w.length > 0;
    });
  }

  function haystack(page) {
    return fold([
      page.title,
      page.description,
      (page.keywords || []).join(" "),
      page.text
    ].join(" "));
  }

  function score(page, terms) {
    var title = fold(page.title);
    var desc = fold(page.description);
    var keys = fold((page.keywords || []).join(" "));
    var body = fold(page.text);
    var n = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (title === t) n += 80;
      else if (title.indexOf(t) === 0) n += 48;
      else if (title.indexOf(t) !== -1) n += 36;
      if (keys.indexOf(t) !== -1) n += 18;
      if (desc.indexOf(t) !== -1) n += 10;
      if (body.indexOf(t) !== -1) n += 6;
    }
    return n;
  }

  function foldMap(source) {
    var folded = "";
    var map = [];
    for (var i = 0; i < source.length; i++) {
      var piece = fold(source.charAt(i));
      for (var j = 0; j < piece.length; j++) {
        folded += piece.charAt(j);
        map.push(i);
      }
    }
    return { folded: folded, map: map };
  }

  function matchRanges(source, terms) {
    var fm = foldMap(source);
    var marks = [];
    terms.forEach(function (term) {
      var from = 0;
      var at;
      while ((at = fm.folded.indexOf(term, from)) !== -1) {
        marks.push({
          start: fm.map[at],
          end: fm.map[at + term.length - 1] + 1
        });
        from = at + term.length;
      }
    });
    marks.sort(function (a, b) { return a.start - b.start; });
    var merged = [];
    marks.forEach(function (m) {
      var last = merged[merged.length - 1];
      if (last && m.start <= last.end) last.end = Math.max(last.end, m.end);
      else merged.push({ start: m.start, end: m.end });
    });
    return merged;
  }

  function findSpan(source, terms) {
    var marks = matchRanges(source, terms);
    if (!marks.length) return null;
    var best = marks[0];
    var start = Math.max(0, best.start - 42);
    var end = Math.min(source.length, best.end + 78);
    while (start > 0 && source.charAt(start) !== " ") start -= 1;
    while (end < source.length && source.charAt(end) !== " ") end += 1;
    return {
      prefix: start > 0 ? "…" : "",
      text: source.slice(start, end).trim(),
      suffix: end < source.length ? "…" : ""
    };
  }

  function highlight(text, terms) {
    var marks = matchRanges(text, terms);
    if (!marks.length) return escapeHtml(text);
    var out = "";
    var cursor = 0;
    marks.forEach(function (m) {
      out += escapeHtml(text.slice(cursor, m.start)) + "<mark>" + escapeHtml(text.slice(m.start, m.end)) + "</mark>";
      cursor = m.end;
    });
    return out + escapeHtml(text.slice(cursor));
  }

  function snippet(page, terms) {
    var span = findSpan(page.description, terms) || findSpan(page.text, terms) || findSpan((page.keywords || []).join(" · "), terms);
    if (!span) return escapeHtml(page.description);
    return span.prefix + highlight(span.text, terms) + span.suffix;
  }

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function emptyState() {
    results.innerHTML =
      "<div class=\"search-empty\">" +
      "<p>The box is empty. Type a word you remember — a feast, a river, a lesson, a game.</p>" +
      "<p class=\"search-hints\">Try <button type=\"button\" data-q=\"miere\">miere</button>, <button type=\"button\" data-q=\"well\">the well</button>, <button type=\"button\" data-q=\"voronet\">Voroneț</button>, or <button type=\"button\" data-q=\"sotron\">șotron</button>.</p>" +
      "</div>";
    setStatus("");
  }

  function noneState(q) {
    results.innerHTML =
      "<div class=\"search-empty\">" +
      "<p>Nothing on this site holds <span>“" + escapeHtml(q) + "”</span>. Try a feast, a river, or a lesson name.</p>" +
      "</div>";
    setStatus("No pages");
  }

  function render(q) {
    var terms = words(q);
    if (!terms.length) {
      emptyState();
      return;
    }
    var hits = pages.filter(function (page) {
      var hay = haystack(page);
      for (var i = 0; i < terms.length; i++) {
        if (hay.indexOf(terms[i]) === -1) return false;
      }
      return true;
    }).map(function (page) {
      return { page: page, n: score(page, terms) };
    }).filter(function (hit) {
      return hit.n > 0;
    }).sort(function (a, b) {
      return b.n - a.n || a.page.title.localeCompare(b.page.title);
    });

    if (!hits.length) {
      noneState(q);
      return;
    }

    setStatus(hits.length === 1 ? "1 page" : hits.length + " pages");
    results.innerHTML = "<ol class=\"search-list\">" + hits.map(function (hit) {
      var page = hit.page;
      return "<li>" +
        "<a class=\"search-hit\" href=\"" + escapeHtml(page.url) + "\">" +
        "<span class=\"search-title\">" + highlight(page.title, terms) + "</span>" +
        "<span class=\"search-path\">" + escapeHtml(page.url) + "</span>" +
        "<span class=\"search-snip\">" + snippet(page, terms) + "</span>" +
        "</a></li>";
    }).join("") + "</ol>";
  }

  function syncClear() {
    if (!clearBtn) return;
    clearBtn.hidden = !input.value;
  }

  function writeQuery(q, push) {
    if (!history.replaceState) return;
    var url = q ? "search.html?q=" + encodeURIComponent(q) : "search.html";
    var fn = push && history.pushState ? history.pushState : history.replaceState;
    fn.call(history, null, "", url);
  }

  function apply(q, updateUrl) {
    if (input.value !== q) input.value = q;
    syncClear();
    if (updateUrl) writeQuery(q);
    if (!ready) return;
    render(q);
  }

  function fromAddress() {
    var params = new URLSearchParams(location.search);
    return params.get("q") || "";
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var first = results.querySelector(".search-hit");
      if (first) first.click();
    });
  }

  if (input) {
    input.addEventListener("input", function () {
      apply(input.value, true);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && input.value) {
        e.preventDefault();
        apply("", true);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      apply("", true);
      input.focus();
    });
  }

  if (results) {
    results.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-q]");
      if (!btn) return;
      apply(btn.getAttribute("data-q"), true);
      input.focus();
    });
  }

  window.addEventListener("popstate", function () {
    apply(fromAddress(), false);
  });

  emptyState();
  input.value = fromAddress();
  syncClear();

  fetch("search-index.json")
    .then(function (res) {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    })
    .then(function (data) {
      pages = (data && data.pages) || [];
      ready = true;
      apply(input.value, false);
    })
    .catch(function () {
      setStatus("The index did not load.");
      results.innerHTML = "<div class=\"search-empty\"><p>The search list did not load. Open this page from the site, not as a lone file.</p></div>";
    });
})();
