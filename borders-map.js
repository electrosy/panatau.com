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
    var x = 58 + (lon - 20.0) * 70;
    var y = 52 + (48.55 - lat) * 94;
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

  function rev(points) {
    return points.slice(1).reverse();
  }

  // Shared edges so the lands tile instead of floating as separate blobs.
  var VIENNA = [
    [21.92, 46.80], [22.60, 46.60], [23.40, 46.50], [24.15, 46.52],
    [24.90, 46.62], [25.55, 46.76]
  ];
  var CARP_SOUTH = [
    [22.38, 44.72], [23.05, 45.18], [23.80, 45.40], [24.50, 45.52],
    [25.20, 45.58], [25.80, 45.68], [26.12, 45.92]
  ];
  var CARP_EAST = [
    [26.12, 45.92], [26.22, 46.32], [26.08, 46.76], [25.55, 46.76]
  ];
  var FOCSANI = [
    [26.12, 45.92], [26.85, 45.68], [27.45, 45.55], [28.02, 45.47]
  ];
  var PRUT = [
    [26.95, 48.08], [27.22, 47.72], [27.52, 47.28], [27.82, 46.82],
    [28.02, 46.32], [28.10, 45.88], [28.02, 45.47]
  ];
  var DANUBE_BEND = [
    [27.40, 44.20], [27.58, 44.58], [27.72, 44.98], [27.88, 45.28],
    [28.02, 45.47]
  ];
  var OUTER_WEST = [
    [20.26, 46.14], [20.38, 45.78], [20.70, 45.28], [21.15, 44.90],
    [21.62, 44.72], [22.10, 44.68], [22.38, 44.72]
  ];
  var OUTER_SOUTH = [
    [22.38, 44.72], [22.72, 44.38], [23.20, 43.96], [23.85, 43.70],
    [24.55, 43.62], [25.25, 43.66], [25.90, 43.80], [26.50, 44.00],
    [27.10, 44.16], [27.40, 44.20]
  ];
  var OUTER_NW = [
    [20.26, 46.14], [20.70, 46.42], [21.25, 46.62], [21.70, 46.78],
    [21.92, 46.80]
  ];
  var OUTER_NORTH_TN = [
    [21.92, 46.80], [21.95, 47.08], [22.35, 47.55], [22.78, 47.78],
    [23.35, 47.96], [23.95, 47.94], [24.50, 47.70], [24.95, 47.42],
    [25.35, 47.38], [25.55, 46.76]
  ];
  var OUTER_NORTH_MO = [
    [25.55, 46.76], [25.20, 47.22], [25.05, 47.52], [25.45, 47.72],
    [25.95, 47.95], [26.40, 48.12], [26.75, 48.05], [26.95, 48.08]
  ];
  var DOBRUJA_SOUTH = [
    [27.40, 44.20], [27.85, 44.02], [28.28, 43.86], [28.57, 43.76]
  ];
  var DOBRUJA_COAST = [
    [28.57, 43.76], [28.65, 44.05], [28.68, 44.28], [28.62, 44.55],
    [28.78, 44.88], [29.20, 45.12], [29.66, 45.16], [29.20, 45.32],
    [28.70, 45.42], [28.25, 45.47], [28.02, 45.47]
  ];

  var REGIONS = [
    {
      id: "transylvaniaNorth",
      label: "N. Transylvania",
      at: [23.6, 47.15],
      d: ring(OUTER_NORTH_TN.concat(rev(VIENNA)))
    },
    {
      id: "transylvaniaSouth",
      label: "Transylvania",
      at: [23.3, 45.85],
      d: ring(OUTER_WEST.concat(CARP_SOUTH.slice(1), CARP_EAST.slice(1), rev(VIENNA), rev(OUTER_NW)))
    },
    {
      id: "wallachia",
      label: "Wallachia",
      at: [24.9, 44.48],
      d: ring(CARP_SOUTH.concat(FOCSANI.slice(1), rev(DANUBE_BEND), rev(OUTER_SOUTH)))
    },
    {
      id: "moldavia",
      label: "Moldavia",
      at: [26.85, 46.70],
      d: ring(OUTER_NORTH_MO.concat(PRUT.slice(1), rev(FOCSANI), CARP_EAST.slice(1)))
    },
    {
      id: "bessarabia",
      label: "Bessarabia",
      at: [29.05, 46.70],
      d: ring(PRUT.concat([
        [28.55, 45.46], [29.15, 45.50], [29.70, 45.72], [30.00, 46.15],
        [29.85, 46.65], [29.55, 47.15], [29.15, 47.65], [28.55, 48.10],
        [27.85, 48.38], [27.25, 48.28], [26.95, 48.08]
      ]))
    },
    {
      id: "bukovinaNorth",
      label: "N. Bukovina",
      at: [26.15, 48.18],
      d: ring([
        [25.15, 47.70], [25.55, 47.88], [26.05, 48.00], [26.55, 47.98],
        [26.95, 48.08], [27.18, 48.22], [26.75, 48.42], [26.15, 48.40],
        [25.55, 48.22], [25.15, 47.70]
      ])
    },
    {
      id: "dobrujaNorth",
      label: "Dobruja",
      at: [28.45, 44.70],
      d: ring(DANUBE_BEND.concat(rev(DOBRUJA_COAST), rev(DOBRUJA_SOUTH)))
    },
    {
      id: "dobrujaSouth",
      label: "S. Dobruja",
      at: [27.85, 43.72],
      d: ring(DOBRUJA_SOUTH.concat([
        [28.42, 43.52], [27.95, 43.38], [27.48, 43.45], [27.22, 43.80],
        [27.26, 44.08], [27.40, 44.20]
      ]))
    }
  ];

  var CARPATHIANS = line(CARP_SOUTH.concat(CARP_EAST.slice(1), [
    [25.20, 47.20], [25.00, 47.52]
  ]));

  var DANUBE = line([
    [21.35, 44.82], [21.90, 44.70]
  ].concat(OUTER_SOUTH, DANUBE_BEND, [
    [28.45, 45.45], [29.05, 45.30], [29.55, 45.18]
  ]));

  var SEA = ring([
    [28.57, 43.76], [28.65, 44.20], [28.78, 44.88], [29.66, 45.16],
    [31.05, 45.05], [31.20, 43.55], [28.90, 43.38], [28.57, 43.76]
  ]);

  var NEIGHBORS = [
    { name: "Hungary", at: [20.55, 47.28] },
    { name: "Serbia", at: [20.95, 44.95] },
    { name: "Bulgaria", at: [25.05, 43.18] },
    { name: "Ukraine", at: [25.15, 48.58] },
    { name: "Black Sea", at: [30.45, 44.28] }
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
    var lostHatch = ns("pattern", {
      id: "bm-lost-hatch",
      width: "6",
      height: "6",
      patternUnits: "userSpaceOnUse",
      patternTransform: "rotate(-32)"
    });
    lostHatch.appendChild(ns("rect", {
      width: "6",
      height: "6",
      fill: "#3a1818"
    }));
    lostHatch.appendChild(ns("path", {
      d: "M 0 0 L 0 6",
      stroke: "#c47a6a",
      "stroke-width": "2",
      opacity: "0.7"
    }));
    defs.appendChild(lostHatch);
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
      if (state === "lost") path.style.fill = "url(#bm-lost-hatch)";
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
