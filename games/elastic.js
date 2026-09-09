(function () {
  var LEVELS = [
    { id: "ankle", label: "Ankle", bottom: 38, window: 72, windowTo: "4.2rem", window: 14 },
    { id: "knee", label: "Knee", bottom: 78, range: 118, jumpTo: "6.4rem", window: 12 },
    { id: "waist", label: "Waist", bottom: 118, jump: 168, jumpTo: "8.6rem", window: 10 }
  ];
  var band = document.getElementById("band");
  var jumper = document.getElementById("jumper");
  var statusEl = document.getElementById("status");
  var streakEl = document.getElementById("streak");
  var clearsEl = document.getElementById("clears");
  var levelSpans = document.querySelectorAll("#levels span");
  var levelIndex = 0;
  var streak = 0;
  var clears = 0;
  var t = 0;
  var jumping = false;
  var over = false;
  var raf = null;

  function level() { return LEVELS[levelIndex]; }

  function setStatus(msg) { statusEl.textContent = msg; }

  function hud() {
    streakEl.textContent = String(streak);
    clearsEl.textContent = String(clears);
    levelSpans.forEach(function (span) {
      span.classList.toggle("is-on", span.getAttribute("data-level") === level().id);
    });
  }

  function bandBottom() {
    // oscillate 0..1..0
    var wave = (Math.sin(t) + 1) / 2;
    var L = level();
    var span = 42;
    return L.bottom + wave * span;
  }

  function frame(now) {
    if (over) return;
    t += 0.045;
    var b = bandBottom();
    band.style.bottom = b + "px";
    raf = requestAnimationFrame(frame);
  }

  function jump() {
    if (over || jumping) return;
    jumping = true;
    var L = level();
    var b = bandBottom();
    // success if band is near its low point for this level
    var ok = b <= L.bottom + L.window;
    jumper.style.setProperty("--jump-to", L.jumpTo);
    jumper.classList.add("is-up");
    setTimeout(function () {
      jumper.classList.remove("is-up");
      jumping = false;
      if (ok) {
        streak += 1;
        clears += 1;
        hud();
        if (clears >= 3) {
          if (levelIndex < LEVELS.length - 1) {
            levelIndex += 1;
            clears = 0;
            hud();
            setStatus("Up to " + level().label.toLowerCase() + "! Keep the rhythm.");
          } else {
            clears = 3;
            hud();
            setStatus("Waist cleared three times — fine jump.");
          }
        } else {
          setStatus("Clear! " + (3 - clears) + " more at " + L.label.toLowerCase() + ".");
        }
      } else {
        streak = 0;
        clears = 0;
        over = true;
        hud();
        setStatus("Missed the band. Restart when ready.");
        if (raf) cancelAnimationFrame(raf);
      }
    }, 200);
  }

  function restart() {
    if (raf) cancelAnimationFrame(raf);
    levelIndex = 0;
    streak = 0;
    clears = 0;
    t = 0;
    jumping = false;
    over = false;
    jumper.classList.remove("is-up");
    hud();
    setStatus("Tap or press Space when the band is low enough to clear.");
    raf = requestAnimationFrame(frame);
  }

  document.getElementById("jump").addEventListener("click", jump);
  document.getElementById("restart").addEventListener("click", restart);
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      jump();
    }
  });
  document.getElementById("stage").addEventListener("pointerdown", function (e) {
    if (e.target.closest && e.target.closest("button")) return;
    jump();
  });

  hud();
  raf = requestAnimationFrame(frame);
})();
