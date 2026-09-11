(function () {
  var root = document.getElementById("whats-new-log");
  if (!root) return;

  function render(data) {
    if (!data || !data.groups || !data.groups.length) return;
    root.innerHTML = data.groups.map(function (group) {
      var items = (group.items || []).map(function (item) {
        return "<li>" + item + "</li>";
      }).join("");
      return "<h2>" + group.date + "</h2><ul>" + items + "</ul>";
    }).join("");
  }

  fetch("whats-new.json")
    .then(function (res) {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    })
    .then(render)
    .catch(function () {});
})();
