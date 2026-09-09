(function () {
  var NAMES = [
    "Ana", "Ion", "Maria", "Gheorghe", "Elena", "Vasile",
    "Ioana", "Andrei", "Sofia", "Mihai", "Catinca", "Radu"
  ];
  var rosterTara = document.getElementById("roster-tara");
  var rosterOstasi = document.getElementById("roster-ostasi");
  var statusEl = document.getElementById("status");
  var turnEl = document.getElementById("turn");
  var roundEl = document.getElementById("round");
  var duel = document.getElementById("duel");
  var callout = document.getElementById("callout");
  var strength = document.getElementById("strength");
  var tara = [];
  var ostasi = [];
  var turn = "tara"; // tara calls from ostasi
  var round = 1;
  var pending = null;
  var over = false;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function setStatus(t) { statusEl.textContent = t; }

  function hud() {
    turnEl.textContent = turn === "tara" ? "Țara" : "Ostași";
    roundEl.textContent = String(round);
  }

  function renderRosters() {
    function fill(el, list, selectable) {
      el.innerHTML = "";
      list.forEach(function (name) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tara-name";
        btn.textContent = name;
        if (!selectable || over || pending) {
          btn.disabled = true;
        } else {
          btn.addEventListener("click", function () { callName(name); });
        }
        if (pending && pending.name === name) btn.classList.add("is-picked");
        el.appendChild(btn);
      });
    }
    fill(rosterTara, tara, turn === "ostasi");
    fill(rosterOstasi, ostasi, turn === "tara");
  }

  function callName(name) {
    if (over || pending) return;
    pending = { name: name, side: turn };
    duel.hidden = false;
    callout.textContent = (turn === "tara" ? "Țara" : "Ostași") +
      ": „Țară, țară, vrem ostași” — calling " + name + ". Resolve the capture.";
    setStatus("Rock-paper-scissors or tug to see if the chain holds.");
    renderRosters();
  }

  function beats(a, b) {
    return (a === "rock" && b === "scissors") ||
      (a === "paper" && b === "rock") ||
      (a === "scissors" && b === "paper");
  }

  function resolve(callerWins) {
    if (!pending || over) return;
    var name = pending.name;
    var caller = pending.side;
    // If caller wins duel, they capture the named child onto their side.
    // If they lose, the chain held and the runner joins the defending side
    // (already there) — caller loses initiative / we just flip turn.
    if (callerWins) {
      if (caller === "tara") {
        ostasi = ostasi.filter(function (n) { return n !== name; });
        tara.push(name);
        setStatus(name + " breaks through and joins Țara.");
      } else {
        tara = tara.filter(function (n) { return n !== name; });
        ostasi.push(name);
        setStatus(name + " is pulled over to the ostași.");
      }
    } else {
      setStatus("The chain holds. " + name + " stays. Turn passes.");
    }
    pending = null;
    duel.hidden = true;
    round += 1;
    turn = turn === "tara" ? "ostasi" : "tara";
    hud();
    checkEnd();
    renderRosters();
  }

  function checkEnd() {
    if (tara.length === 0 || ostasi.length === 0) {
      over = true;
      duel.hidden = true;
      var winner = tara.length ? "Țara" : "Ostași";
      setStatus(winner + " has everyone. Short game over.");
    } else if (turn === "tara" && ostasi.length === 0) {
      over = true;
    } else if (turn === "ostasi" && tara.length === 0) {
      over = true;
    } else {
      setStatus((turn === "tara" ? "Țara" : "Ostași") + " calls next — pick a name from the other line.");
    }
  }

  document.getElementById("rps").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-choice]");
    if (!btn || !pending) return;
    var choice = btn.getAttribute("data-choice");
    var ai = ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
    if (choice === ai) {
      callout.textContent = "Tie (" + choice + "). Try again.";
      return;
    }
    resolve(beats(choice, ai));
  });

  document.getElementById("pull").addEventListener("click", function () {
    if (!pending) return;
    var v = Number(strength.value);
    var wall = 40 + Math.floor(Math.random() * 35);
    resolve(v >= wall);
  });

  function restart() {
    var mixed = shuffle(NAMES);
    tara = mixed.slice(0, 6);
    ostasi = mixed.slice(6);
    turn = "tara";
    round = 1;
    pending = null;
    over = false;
    duel.hidden = true;
    strength.value = 50;
    hud();
    setStatus("Țara calls first — pick a name from the other line.");
    renderRosters();
  }

  document.getElementById("restart").addEventListener("click", restart);
  restart();
})();
