(function () {
  var root = document.querySelector("[data-practice]");
  if (!root) return;
  var dataEl = document.getElementById("practice-data");
  if (!dataEl) return;
  var items;
  try { items = JSON.parse(dataEl.textContent); } catch (e) { return; }
  if (!items || !items.length) return;

  var foldMap = {
    "ă": "a", "â": "a", "î": "i", "ș": "s", "ț": "t",
    "Ă": "a", "Â": "a", "Î": "i", "Ș": "s", "Ț": "t",
    "ş": "s", "ţ": "t", "Ş": "s", "Ţ": "t"
  };
  function fold(s) {
    return String(s || "").replace(/[ăâîșțĂÂÎȘȚşţŞŢ]/g, function (ch) {
      return foldMap[ch] || ch;
    }).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[ch];
    });
  }
  function shuffle(list) {
    var copy = list.slice();
    var i, j, t;
    for (i = copy.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = copy[i]; copy[i] = copy[j]; copy[j] = t;
    }
    return copy;
  }

  items.forEach(function (item, idx) {
    var card = document.createElement("div");
    card.className = "quiz-card practice-card";
    var num = document.createElement("p");
    num.className = "quiz-num";
    num.textContent = "Practice " + (idx + 1);
    card.appendChild(num);
    var title = document.createElement("h2");
    title.textContent = item.prompt;
    card.appendChild(title);

    if (item.type === "choice") {
      var box = document.createElement("div");
      box.className = "quiz-choices";
      var choices = item.choices.slice();
      var correct = item.choices[item.answer];
      if (item.shuffle !== false) choices = shuffle(choices);
      var feedback = document.createElement("p");
      feedback.className = "quiz-feedback";
      choices.forEach(function (label) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-choice";
        btn.textContent = label;
        btn.addEventListener("click", function () {
          if (card.getAttribute("data-done") === "1") return;
          card.setAttribute("data-done", "1");
          var ok = label === correct;
          btn.classList.add(ok ? "is-correct" : "is-wrong");
          Array.prototype.forEach.call(box.querySelectorAll(".quiz-choice"), function (other) {
            other.disabled = true;
            if (other.textContent === correct) other.classList.add("is-correct");
          });
          feedback.textContent = ok ? (item.ok || "Yes.") : (item.no || ("The answer is " + correct + "."));
          feedback.classList.add(ok ? "is-correct" : "is-wrong");
        });
        box.appendChild(btn);
      });
      card.appendChild(box);
      card.appendChild(feedback);
    } else if (item.type === "fill") {
      var label = document.createElement("label");
      label.className = "practice-fill";
      var input = document.createElement("input");
      input.type = "text";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.setAttribute("aria-label", item.prompt);
      if (item.placeholder) input.placeholder = item.placeholder;
      label.appendChild(input);
      card.appendChild(label);
      var actions = document.createElement("div");
      actions.className = "practice-actions";
      var check = document.createElement("button");
      check.type = "button";
      check.className = "quiz-next";
      check.textContent = item.check || "Check";
      actions.appendChild(check);
      card.appendChild(actions);
      var feedback = document.createElement("p");
      feedback.className = "quiz-feedback";
      card.appendChild(feedback);
      var accepted = [item.answer].concat(item.accept || []).map(fold);
      function judge() {
        var val = fold(input.value);
        if (!val) { feedback.textContent = item.empty || "Type an answer."; feedback.className = "quiz-feedback is-wrong"; return; }
        var ok = accepted.indexOf(val) !== -1;
        input.disabled = true;
        check.disabled = true;
        input.classList.add(ok ? "is-correct" : "is-wrong");
        feedback.textContent = ok ? (item.ok || "Yes.") : (item.no || ("The answer is " + item.answer + "."));
        feedback.className = "quiz-feedback " + (ok ? "is-correct" : "is-wrong");
      }
      check.addEventListener("click", judge);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); judge(); }
      });
    } else if (item.type === "match") {
      var pairs = item.pairs.slice();
      var left = shuffle(pairs.map(function (p) { return p[0]; }));
      var right = shuffle(pairs.map(function (p) { return p[1]; }));
      var map = {};
      pairs.forEach(function (p) { map[p[0]] = p[1]; });
      var grid = document.createElement("div");
      grid.className = "practice-match";
      var colL = document.createElement("div");
      var colR = document.createElement("div");
      colL.className = "practice-col";
      colR.className = "practice-col";
      var selected = { side: "", value: "", btn: null };
      var matched = 0;
      var feedback = document.createElement("p");
      feedback.className = "quiz-feedback";
      function paint(btn, side, value) {
        btn.type = "button";
        btn.className = "quiz-choice";
        btn.textContent = value;
        btn.addEventListener("click", function () {
          if (btn.classList.contains("is-correct")) return;
          if (!selected.btn) {
            selected = { side: side, value: value, btn: btn };
            btn.classList.add("is-on");
            return;
          }
          if (selected.side === side) {
            selected.btn.classList.remove("is-on");
            selected = { side: side, value: value, btn: btn };
            btn.classList.add("is-on");
            return;
          }
          var a = selected.side === "L" ? selected.value : value;
          var b = selected.side === "R" ? selected.value : value;
          var ok = map[a] === b;
          selected.btn.classList.remove("is-on");
          if (ok) {
            selected.btn.classList.add("is-correct");
            btn.classList.add("is-correct");
            selected.btn.disabled = true;
            btn.disabled = true;
            matched += 1;
            feedback.textContent = matched === pairs.length ? (item.ok || "All matched.") : "";
            feedback.className = "quiz-feedback" + (matched === pairs.length ? " is-correct" : "");
          } else {
            var leftBtn = selected.btn;
            var rightBtn = btn;
            leftBtn.classList.add("is-wrong");
            rightBtn.classList.add("is-wrong");
            setTimeout(function () {
              leftBtn.classList.remove("is-wrong");
              rightBtn.classList.remove("is-wrong");
            }, 450);
          }
          selected = { side: "", value: "", btn: null };
        });
        return btn;
      }
      left.forEach(function (v) { colL.appendChild(paint(document.createElement("button"), "L", v)); });
      right.forEach(function (v) { colR.appendChild(paint(document.createElement("button"), "R", v)); });
      grid.appendChild(colL);
      grid.appendChild(colR);
      card.appendChild(grid);
      card.appendChild(feedback);
    }

    root.appendChild(card);
  });
})();
