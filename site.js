(function () {
  var tabs = document.querySelectorAll("[data-tab]");
  var panels = document.querySelectorAll(".panel");
  var themes = document.querySelectorAll("[data-theme]");

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

  var hash = (location.hash || "").replace("#", "");
  if (["pictures", "history", "store", "maps", "recipes"].indexOf(hash) !== -1) {
    show(hash);
  }
})();
