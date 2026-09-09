(function () {
  var SPOTS = [
    { id: "bush", label: "Bush" },
    { id: "well", label: "Well" },
    { id: "gate", label: "Gate" },
    { id: "porch", label: "Porch" },
    { id: "tree", label: "Tree" },
    { id: "woodpile", label: "Woodpile" },
    { id: "shed", label: "Onion shed" }
  ];
  var LOOKS = 4;
  var yard = document.getElementById("yard");
  var statusEl = document.getElementById("status");
  var looksEl = document.getElementById("looks");
  var roundEl = document.getElementById("round");
  var hiding = null;
  var looksLeft = LOOKS;
  var round = 1;
  var over = false;
  var buttons = [];

  function pickHide() {
    hiding = SPOTS[Math.floor(Math.random() * SPOTS.length)].id;
  }

  function setStatus(t) { statusEl.textContent = t; }

  function hud() {
    looksEl.textContent = String(looksLeft);
    roundEl.textContent = String(round);
  }

  function build() {
    yard.innerHTML = "";
    buttons = SPOTS.map(function (spot) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hide-spot";
      btn.dataset.id = spot.id;
      btn.textContent = spot.label;
      btn.addEventListener("click", function () { look(spot, btn); });
      yard.appendChild(btn);
      return btn;
    });
  }

  function look(spot, btn) {
    if (over) return;
    if (btn.disabled) return;
    looksLeft -= 1;
    hud();
    if (spot.id === hiding) {
      over = true;
      btn.classList.add("is-found");
      buttons.forEach(function (b) { b.disabled = true; });
      setStatus("Found them at the " + spot.label.toLowerCase() + "! „Gata!”");
      return;
    }
    btn.classList.add("is-empty");
    btn.disabled = true;
    btn.textContent = spot.label + " — empty";
    if (looksLeft <= 0) {
      over = true;
      buttons.forEach(function (b) {
        b.disabled = true;
        if (b.dataset.id === hiding) {
          b.classList.add("is-found");
          b.textContent = SPOTS.find(function (s) { return s.id === hiding; }).label + " — here!";
        }
      });
      setStatus("Out of looks. They were at the " +
        SPOTS.find(function (s) { return s.id === hiding; }).label.toLowerCase() + ".");
      return;
    }
    setStatus("Not there. " + looksLeft + " look" + (looksLeft === 1 ? "" : "s") + " left.");
  }

  function restart() {
    if (!over && looksLeft < LOOKS) round += 1;
    else if (over) round += 1;
    over = false;
    looksLeft = LOOKS;
    pickHide();
    build();
    hud();
    setStatus("Someone is hiding. Pick a spot to look.");
  }

  document.getElementById("restart").addEventListener("click", function () {
    over = true; // force round bump
    restart();
  });
  pickHide();
  build();
  hud();
})();
