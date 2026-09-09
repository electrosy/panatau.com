(function () {
  var LAYOUT = [
    { n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }, { n: 5 },
    { n: 6 }, { n: 7 }, { n: 8 }, { n: 9 }, { n: 10, heaven: true }
  ];

  var court = document.getElementById("court");
  var statusEl = document.getElementById("status");
  var scoreEl = document.getElementById("score");
  var streakEl = document.getElementById("streak");
  var phaseEl = document.getElementById("phase");
  var cells = [];
  var phase = "throw";
  var marker = null;
  var nextHop = 1;
  var score = 0;
  var streak = 0;

  function setStatus(t) { statusEl.textContent = t; }

  function renderHud() {
    scoreEl.textContent = String(score);
    streakEl.textContent = String(streak);
    phaseEl.textContent = phase === "throw" ? "Throw" : "Hop";
  }

  function paint() {
    cells.forEach(function (btn) {
      var n = Number(btn.dataset.n);
      btn.classList.toggle("has-marker", marker === n);
      btn.classList.toggle("is-next", phase === "hop" && n === nextHop);
      btn.classList.toggle("is-done", phase === "hop" && ((marker !== null && n < nextHop && n !== marker) || (marker === null && n < nextHop)));
      btn.classList.remove("is-miss");
    });
  }

  function build() {
    court.innerHTML = "";
    cells = LAYOUT.map(function (item) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sotron-cell" + (item.heaven ? " is-heaven" : "");
      btn.dataset.n = String(item.n);
      btn.textContent = item.heaven ? item.n + " · house" : String(item.n);
      btn.setAttribute("aria-label", "Square " + item.n);
      btn.addEventListener("click", function () { onCell(item.n, btn); });
      court.appendChild(btn);
      return btn;
    });
  }

  function fail(msg) {
    streak = 0;
    phase = "throw";
    marker = null;
    nextHop = 1;
    setStatus(msg);
    renderHud();
    paint();
  }

  function onCell(n, btn) {
    if (phase === "throw") {
      marker = n;
      nextHop = 1;
      if (nextHop === marker) nextHop = 2;
      phase = "hop";
      setStatus("Stone on " + n + ". Hop " + nextHop + " next.");
      renderHud();
      paint();
      return;
    }

    if (n === marker) {
      btn.classList.add("is-miss");
      fail("Stepped on the stone. Streak reset — throw again.");
      return;
    }
    if (n !== nextHop) {
      btn.classList.add("is-miss");
      fail("Wrong square. Needed " + nextHop + ". Throw again.");
      return;
    }

    nextHop += 1;
    if (nextHop === marker) nextHop += 1;
    if (nextHop > 10) {
      score += 1;
      streak += 1;
      phase = "throw";
      marker = null;
      nextHop = 1;
      setStatus("Court clear! Score +1. Throw again.");
      renderHud();
      paint();
      return;
    }
    setStatus("Good. Next hop: " + nextHop + ".");
    renderHud();
    paint();
  }

  function restart() {
    phase = "throw";
    marker = null;
    nextHop = 1;
    score = 0;
    streak = 0;
    setStatus("Click a square to throw the stone.");
    renderHud();
    paint();
  }

  document.getElementById("restart").addEventListener("click", restart);
  build();
  renderHud();
  paint();
})();
