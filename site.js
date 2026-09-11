(function () {
  var tabs = document.querySelectorAll("[data-tab]");
  var panels = document.querySelectorAll(".panel");
  var themes = document.querySelectorAll("[data-theme]");
  var homeHashes = ["pictures", "history", "store", "maps", "recipes", "words"];

  function show(name) {
    tabs.forEach(function (btn) {
      var on = btn.getAttribute("data-tab") === name;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-current", on ? "page" : "false");
    });
    panels.forEach(function (panel) {
      var on = panel.id === name;
      panel.classList.toggle("is-on", on);
      panel.hidden = !on;
    });
    if (history.replaceState) {
      history.replaceState(null, "", "#" + name);
    }
  }

  function theme(name) {
    document.body.setAttribute("data-theme", name);
    themes.forEach(function (btn) {
      btn.classList.toggle("is-on", btn.getAttribute("data-theme") === name);
    });
    try { localStorage.setItem("panatau-theme", name); } catch (e) {}
  }

  tabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      show(btn.getAttribute("data-tab"));
    });
  });
  themes.forEach(function (btn) {
    btn.addEventListener("click", function () {
      theme(btn.getAttribute("data-theme"));
    });
  });

  var saved = "voronet";
  try { saved = localStorage.getItem("panatau-theme") || saved; } catch (e) {}
  theme(saved);

  function applyHash() {
    var hash = (location.hash || "").replace("#", "");
    if (homeHashes.indexOf(hash) !== -1 && panels.length) {
      show(hash);
    }
  }
  applyHash();
  window.addEventListener("hashchange", applyHash);

  var wrap = document.querySelector(".nav-wrap");
  var menus = Array.prototype.slice.call(document.querySelectorAll(".menu"));
  var desktop = window.matchMedia("(min-width: 861px)");
  var hoverable = window.matchMedia("(hover: hover) and (pointer: fine)");
  var leaveTimer = 0;

  function isDesktop() {
    return desktop.matches;
  }

  function closeMenus(except) {
    menus.forEach(function (menu) {
      if (menu !== except) menu.open = false;
    });
  }

  function syncExpanded() {
    menus.forEach(function (menu) {
      var summary = menu.querySelector("summary");
      if (summary) summary.setAttribute("aria-expanded", menu.open ? "true" : "false");
    });
    if (wrap) {
      var toggle = wrap.querySelector(".nav-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", wrap.open ? "true" : "false");
    }
  }

  function fitDrawer() {
    if (!wrap) return;
    wrap.open = isDesktop();
  }

  menus.forEach(function (menu) {
    var summary = menu.querySelector("summary");
    if (summary) {
      summary.setAttribute("aria-haspopup", "true");
      summary.setAttribute("aria-expanded", menu.open ? "true" : "false");
    }
    menu.addEventListener("toggle", function () {
      if (menu.open) closeMenus(menu);
      syncExpanded();
    });
    if (summary) {
      summary.addEventListener("click", function (e) {
        if (!isDesktop() || !hoverable.matches) return;
        if (e.detail === 0) return;
        e.preventDefault();
        if (!menu.open) {
          closeMenus(menu);
          menu.open = true;
        }
      });
    }
    menu.addEventListener("mouseenter", function () {
      if (!isDesktop() || !hoverable.matches) return;
      clearTimeout(leaveTimer);
      closeMenus(menu);
      menu.open = true;
    });
    menu.addEventListener("mouseleave", function () {
      if (!isDesktop() || !hoverable.matches) return;
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(function () {
        menu.open = false;
      }, 160);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    closeMenus();
    if (wrap && !isDesktop()) wrap.open = false;
    syncExpanded();
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".menu")) closeMenus();
  });

  if (wrap) {
    var toggle = wrap.querySelector(".nav-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", wrap.open ? "true" : "false");
    wrap.addEventListener("toggle", function () {
      if (isDesktop()) wrap.open = true;
      syncExpanded();
    });
    fitDrawer();
    if (desktop.addEventListener) desktop.addEventListener("change", fitDrawer);
    else desktop.addListener(fitDrawer);
    wrap.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!a || isDesktop()) return;
      wrap.open = false;
    });
    tabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!isDesktop()) wrap.open = false;
      });
    });
  }
})();
