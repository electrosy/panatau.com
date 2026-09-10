(function () {
  var svg = document.getElementById("border-map-svg");
  var titleEl = document.getElementById("bm-title");
  var yearsEl = document.getElementById("bm-years");
  var captionEl = document.getElementById("bm-caption");
  var playBtn = document.getElementById("bm-play");
  var prevBtn = document.getElementById("bm-prev");
  var nextBtn = document.getElementById("bm-next");
  var scrub = document.getElementById("bm-scrub");
  var dotsEl = document.getElementById("bm-dots");
  if (!svg || !titleEl || !playBtn) return;

  var HOLD_MS = 5200;
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function proj(lon, lat) {
    var x = 36 + (lon - 20.0) * 76;
    var y = 40 + (48.55 - lat) * 100;
    return x.toFixed(1) + "," + y.toFixed(1);
  }

  function ring(points) {
    return "M " + points.map(function (p) {
      return proj(p[0], p[1]);
    }).join(" L ") + " Z";
  }

  function line(points) {
    return "M " + points.map(function (p) {
      return proj(p[0], p[1]);
    }).join(" L ");
  }

  var REGIONS = [
    {
      id: "transylvaniaNorth",
      label: "N. Transylvania",
      at: [23.55, 47.18],
      d: ring([
        [21.72, 46.62], [21.90, 47.05], [22.15, 47.55], [22.50, 47.88],
        [23.20, 47.98], [24.10, 47.98], [24.90, 47.72], [25.25, 47.25],
        [25.40, 46.72], [24.80, 46.65], [24.00, 46.58], [23.20, 46.52],
        [22.40, 46.55], [21.72, 46.62]
      ])
    },
    {
      id: "transylvaniaSouth",
      label: "Transylvania",
      at: [23.45, 45.95],
      d: ring([
        [20.26, 46.14], [20.55, 45.55], [20.78, 44.95], [21.25, 44.78],
        [21.90, 44.70], [22.15, 44.85], [22.80, 45.15], [23.50, 45.35],
        [24.30, 45.48], [25.10, 45.52], [25.70, 45.62], [26.05, 45.95],
        [26.15, 46.35], [25.95, 46.72], [25.40, 46.72], [24.80, 46.65],
        [24.00, 46.58], [23.20, 46.52], [22.40, 46.55], [21.72, 46.62],
        [21.40, 46.55], [20.90, 46.38], [20.26, 46.14]
      ])
    },
    {
      id: "wallachia",
      label: "Wallachia",
      at: [24.7, 44.55],
      d: ring([
        [22.15, 44.85], [22.40, 44.55], [22.90, 44.10], [23.80, 43.75],
        [24.50, 43.62], [25.40, 43.70], [26.30, 43.88], [27.15, 44.15],
        [27.55, 44.35], [27.70, 44.70], [27.85, 45.20], [28.00, 45.47],
        [26.80, 45.55], [26.05, 45.95], [25.70, 45.62], [25.10, 45.52],
        [24.30, 45.48], [23.50, 45.35], [22.80, 45.15], [22.15, 44.85]
      ])
    },
    {
      id: "moldavia",
      label: "Moldavia",
      at: [26.75, 46.65],
      d: ring([
        [25.40, 46.72], [25.95, 46.72], [26.15, 46.35], [26.05, 45.95],
        [26.80, 45.55], [28.00, 45.47], [28.08, 45.80], [28.05, 46.25],
        [27.85, 46.75], [27.50, 47.20], [27.05, 47.62], [26.55, 47.85],
        [26.00, 47.95], [25.40, 47.70], [25.15, 47.25], [25.40, 46.72]
      ])
    },
    {
      id: "bessarabia",
      label: "Bessarabia",
      at: [28.9, 46.75],
      d: ring([
        [27.05, 47.62], [27.50, 47.85], [28.20, 48.15], [28.80, 48.20],
        [29.20, 47.75], [29.60, 47.20], [29.70, 46.70], [29.85, 46.30],
        [29.60, 45.80], [29.20, 45.48], [28.60, 45.47], [28.00, 45.47],
        [28.08, 45.80], [28.05, 46.25], [27.85, 46.75], [27.50, 47.20],
        [27.05, 47.62]
      ])
    },
    {
      id: "bukovinaNorth",
      label: "N. Bukovina",
      at: [26.15, 48.12],
      d: ring([
        [24.90, 47.72], [25.40, 47.70], [26.00, 47.95], [26.55, 47.85],
        [27.05, 47.62], [27.20, 47.85], [26.80, 48.25], [26.10, 48.32],
        [25.40, 48.15], [24.90, 47.72]
      ])
    },
    {
      id: "dobrujaNorth",
      label: "Dobruja",
      at: [28.55, 44.72],
      d: ring([
        [27.55, 44.35], [27.70, 44.70], [27.85, 45.20], [28.00, 45.47],
        [28.40, 45.47], [29.10, 45.35], [29.65, 45.17], [28.85, 44.95],
        [28.72, 44.55], [28.67, 44.17], [28.57, 43.78], [28.20, 43.88],
        [27.80, 44.05], [27.55, 44.35]
      ])
    },
    {
      id: "dobrujaSouth",
      label: "S. Dobruja",
      at: [27.95, 43.78],
      d: ring([
        [27.55, 44.35], [27.80, 44.05], [28.20, 43.88], [28.57, 43.78],
        [28.45, 43.55], [28.00, 43.42], [27.50, 43.48], [27.25, 43.75],
        [27.30, 44.10], [27.55, 44.35]
      ])
    }
  ];

  var CARPATHIANS = line([
    [22.20, 44.88], [22.80, 45.18], [23.50, 45.38], [24.30, 45.50],
    [25.10, 45.55], [25.70, 45.65], [26.08, 46.00], [26.12, 46.40],
    [25.90, 46.80], [25.30, 47.20], [25.05, 47.55]
  ]);

  var DANUBE = line([
    [21.40, 44.82], [22.15, 44.68], [22.70, 44.42], [23.60, 43.88],
    [24.50, 43.64], [25.50, 43.72], [26.40, 43.90], [27.20, 44.18],
    [27.55, 44.38], [27.75, 44.85], [27.92, 45.25], [28.15, 45.48],
    [28.70, 45.42], [29.20, 45.28], [29.55, 45.18]
  ]);

  var SEA = ring([
    [28.67, 44.17], [29.65, 45.17], [31.15, 45.05], [31.30, 43.55],
    [28.90, 43.40], [28.57, 43.78], [28.67, 44.17]
  ]);

  var NEIGHBORS = [
    { name: "Hungary", at: [20.55, 47.35] },
    { name: "Serbia", at: [20.85, 44.95] },
    { name: "Bulgaria", at: [24.85, 43.15] },
    { name: "Ukraine", at: [25.35, 48.58] },
    { name: "Black Sea", at: [30.35, 44.35] }
  ];

  var OFF = "off";
  var OTHER = "other";

  var ERAS = [
    {
      title: "Three lands",
      years: "14th century – 1858",
      caption: "Wallachia and Moldavia were separate principalities. Transylvania sat under another crown. Not yet one state.",
      states: {
        wallachia: "own-a",
        moldavia: "own-b",
        transylvaniaSouth: OTHER,
        transylvaniaNorth: OTHER,
        bessarabia: OFF,
        bukovinaNorth: OFF,
        dobrujaNorth: OFF,
        dobrujaSouth: OFF
      }
    },
    {
      title: "United Principalities",
      years: "1859–1877",
      caption: "Wallachia and Moldavia elected the same prince in 1859. One administration, assembled from two. Transylvania still outside.",
      states: {
        wallachia: "in",
        moldavia: "in",
        transylvaniaSouth: OTHER,
        transylvaniaNorth: OTHER,
        bessarabia: OFF,
        bukovinaNorth: OFF,
        dobrujaNorth: OFF,
        dobrujaSouth: OFF
      }
    },
    {
      title: "Independence and Dobruja",
      years: "1878–1917",
      caption: "Treaties after 1877–78 made a recognized state and added northern Dobruja. A southern strip came from Bulgaria in 1913.",
      states: {
        wallachia: "in",
        moldavia: "in",
        dobrujaNorth: "in",
        dobrujaSouth: "in",
        transylvaniaSouth: OTHER,
        transylvaniaNorth: OTHER,
        bessarabia: OFF,
        bukovinaNorth: OFF
      }
    },
    {
      title: "Greater Romania",
      years: "1918–1939",
      caption: "Assemblies in Bessarabia, Bukovina, and Transylvania voted union. The widest the line would reach, and not a settlement everyone accepted.",
      states: {
        wallachia: "in",
        moldavia: "in",
        transylvaniaSouth: "in",
        transylvaniaNorth: "in",
        bessarabia: "in",
        bukovinaNorth: "in",
        dobrujaNorth: "in",
        dobrujaSouth: "in"
      }
    },
    {
      title: "Wartime losses",
      years: "1940–1944",
      caption: "Bessarabia and northern Bukovina to the Soviet Union; northern Transylvania to Hungary for a time; southern Dobruja to Bulgaria.",
      states: {
        wallachia: "in",
        moldavia: "in",
        transylvaniaSouth: "in",
        dobrujaNorth: "in",
        transylvaniaNorth: "lost",
        bessarabia: "lost",
        bukovinaNorth: "lost",
        dobrujaSouth: "lost"
      }
    },
    {
      title: "Postwar / present",
      years: "1947 – today",
      caption: "Northern Transylvania stayed. Bessarabia, northern Bukovina, and southern Dobruja did not. The present outline is that settlement.",
      states: {
        wallachia: "in",
        moldavia: "in",
        transylvaniaSouth: "in",
        transylvaniaNorth: "in",
        dobrujaNorth: "in",
        bessarabia: "ghost",
        bukovinaNorth: "ghost",
        dobrujaSouth: "ghost"
      }
    }
  ];

  function ns(name, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.keys(attrs || {}).forEach(function (k) {
      el.setAttribute(k, attrs[k]);
    });
    return el;
  }

  function build() {
    svg.innerHTML = "";
    var defs = ns("defs");
    var hatch = ns("pattern", {
      id: "bm-hatch",
      width: "7",
      height: "7",
      patternUnits: "userSpaceOnUse",
      patternTransform: "rotate(28)"
    });
    hatch.appendChild(ns("path", {
      d: "M 0 0 L 0 7",
      stroke: "currentColor",
      "stroke-width": "1",
      opacity: "0.35"
    }));
    defs.appendChild(hatch);
    svg.appendChild(defs);

    svg.appendChild(ns("path", {
      d: SEA,
      "class": "bm-sea",
      "aria-hidden": "true"
    }));
    svg.appendChild(ns("path", {
      d: DANUBE,
      "class": "bm-river",
      fill: "none",
      "aria-hidden": "true"
    }));

    REGIONS.forEach(function (r) {
      svg.appendChild(ns("path", {
        d: r.d,
        id: "bm-r-" + r.id,
        "class": "bm-region is-off",
        "data-region": r.id
      }));
    });

    svg.appendChild(ns("path", {
      d: CARPATHIANS,
      "class": "bm-ridge",
      fill: "none",
      "aria-hidden": "true"
    }));

    REGIONS.forEach(function (r) {
      var xy = proj(r.at[0], r.at[1]).split(",");
      var t = ns("text", {
        x: xy[0],
        y: xy[1],
        id: "bm-l-" + r.id,
        "class": "bm-label is-off"
      });
      t.textContent = r.label;
      svg.appendChild(t);
    });

    NEIGHBORS.forEach(function (n) {
      var xy = proj(n.at[0], n.at[1]).split(",");
      var t = ns("text", {
        x: xy[0],
        y: xy[1],
        "class": "bm-neighbor"
      });
      t.textContent = n.name;
      svg.appendChild(t);
    });

    scrub.max = String(ERAS.length - 1);
    ERAS.forEach(function (era, i) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "border-map-dot";
      btn.setAttribute("data-era", String(i));
      btn.setAttribute("aria-label", era.title + ", " + era.years);
      btn.textContent = era.title;
      btn.addEventListener("click", function () {
        pause();
        show(i);
      });
      li.appendChild(btn);
      dotsEl.appendChild(li);
    });
  }

  var index = 0;
  var timer = null;
  var playing = !reduceMotion;

  function show(i) {
    index = (i + ERAS.length) % ERAS.length;
    var era = ERAS[index];
    titleEl.textContent = era.title;
    yearsEl.textContent = era.years;
    captionEl.textContent = era.caption;
    scrub.value = String(index);

    REGIONS.forEach(function (r) {
      var state = era.states[r.id] || OFF;
      var path = document.getElementById("bm-r-" + r.id);
      var label = document.getElementById("bm-l-" + r.id);
      path.setAttribute("class", "bm-region is-" + state);
      if (state === "other") path.style.fill = "url(#bm-hatch)";
      else path.style.fill = "";
      var labelState = state;
      if (r.id === "transylvaniaNorth") {
        var south = era.states.transylvaniaSouth;
        if (state === south && state !== "lost") labelState = OFF;
      }
      label.setAttribute("class", "bm-label is-" + labelState);
    });

    var dots = dotsEl.querySelectorAll("button");
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.toggle("is-on", d === index);
      if (d === index) dots[d].setAttribute("aria-current", "true");
      else dots[d].removeAttribute("aria-current");
    }
  }

  function play() {
    playing = true;
    playBtn.textContent = "Pause";
    playBtn.setAttribute("aria-pressed", "true");
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      show(index + 1);
    }, HOLD_MS);
  }

  function pause() {
    playing = false;
    playBtn.textContent = "Play";
    playBtn.setAttribute("aria-pressed", "false");
    window.clearInterval(timer);
    timer = null;
  }

  playBtn.addEventListener("click", function () {
    if (playing) pause();
    else play();
  });
  prevBtn.addEventListener("click", function () {
    pause();
    show(index - 1);
  });
  nextBtn.addEventListener("click", function () {
    pause();
    show(index + 1);
  });
  scrub.addEventListener("input", function () {
    pause();
    show(parseInt(scrub.value, 10) || 0);
  });

  build();
  show(0);
  if (playing) play();
})();
