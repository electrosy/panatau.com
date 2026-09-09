(function () {
  var TOTAL = 4;
  var DURATION = 45;
  var field = document.getElementById("field");
  var veil = document.getElementById("veil");
  var statusEl = document.getElementById("status");
  var caughtEl = document.getElementById("caught");
  var totalEl = document.getElementById("total");
  var timeEl = document.getElementById("time");
  var kids = [];
  var caught = 0;
  var left = DURATION;
  var timer = null;
  var raf = null;
  var running = false;
  var lx = 0.5;
  var ly = 0.5;
  var lightR = 54;

  totalEl.textContent = String(TOTAL);

  function setStatus(t) { statusEl.textContent = t; }

  function setLight(clientX, clientY) {
    var rect = field.getBoundingClientRect();
    lx = (clientX - rect.left) / rect.width;
    ly = (clientY - rect.top) / rect.height;
    lx = Math.max(0, Math.min(1, lx));
    ly = Math.max(0, Math.min(1, ly));
    veil.style.setProperty("--lx", (lx * 100) + "%");
    veil.style.setProperty("--ly", (ly * 100) + "%");
  }

  function spawn() {
    field.querySelectorAll(".baba-kid").forEach(function (n) { n.remove(); });
    kids = [];
    for (var i = 0; i < TOTAL; i++) {
      var el = document.createElement("div");
      el.className = "baba-kid";
      el.setAttribute("aria-hidden", "true");
      var kid = {
        el: el,
        x: 0.15 + Math.random() * 0.7,
        y: 0.15 + Math.random() * 0.7,
        vx: (Math.random() * 0.004 + 0.0015) * (Math.random() < 0.5 ? -1 : 1),
        vy: (Math.random() * 0.004 + 0.0015) * (Math.random() < 0.5 ? -1 : 1),
        caught: false
      };
      place(kid);
      field.appendChild(el);
      kids.push(kid);
    }
  }

  function place(kid) {
    kid.el.style.left = (kid.x * 100) + "%";
    kid.el.style.top = (kid.y * 100) + "%";
  }

  function tick() {
    if (!running) return;
    var rect = field.getBoundingClientRect();
    var px = lx * rect.width;
    var py = ly * rect.height;
    kids.forEach(function (kid) {
      if (kid.caught) return;
      kid.x += kid.vx;
      kid.y += kid.vy;
      if (kid.x < 0.06 || kid.x > 0.94) kid.vx *= -1;
      if (kid.y < 0.08 || kid.y > 0.92) kid.vy *= -1;
      kid.x = Math.max(0.06, Math.min(0.94, kid.x));
      kid.y = Math.max(0.08, Math.min(0.92, kid.y));
      place(kid);
      var kx = kid.x * rect.width;
      var ky = kid.y * rect.height;
      var dx = kx - px;
      var dy = ky - py;
      if (dx * dx + dy * dy < lightR * lightR * 0.55) {
        kid.caught = true;
        kid.el.classList.add("is-caught");
        caught += 1;
        caughtEl.textContent = String(caught);
        if (caught >= TOTAL) {
          endRound(true);
          return;
        }
        setStatus("Caught " + caught + " — keep searching.");
      }
    });
    raf = requestAnimationFrame(tick);
  }

  function endRound(won) {
    running = false;
    if (timer) { clearInterval(timer); timer = null; }
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    setStatus(won
      ? "All caught — short round done."
      : "Time. You caught " + caught + " of " + TOTAL + ".");
  }

  function start() {
    if (timer) clearInterval(timer);
    if (raf) cancelAnimationFrame(raf);
    caught = 0;
    left = DURATION;
    caughtEl.textContent = "0";
    timeEl.textContent = String(left);
    running = true;
    spawn();
    setStatus("Move the circle of light. Touch a child to catch them.");
    timer = setInterval(function () {
      left -= 1;
      timeEl.textContent = String(left);
      if (left <= 0) endRound(false);
    }, 1000);
    raf = requestAnimationFrame(tick);
  }

  field.addEventListener("pointermove", function (e) {
    setLight(e.clientX, e.clientY);
  });
  field.addEventListener("pointerdown", function (e) {
    field.setPointerCapture(e.pointerId);
    setLight(e.clientX, e.clientY);
  });

  document.getElementById("restart").addEventListener("click", start);
  veil.style.setProperty("--lx", "50%");
  veil.style.setProperty("--ly", "50%");
  start();
})();
