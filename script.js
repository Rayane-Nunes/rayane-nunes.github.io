(function () {
  var NS = "http://www.w3.org/2000/svg";
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function el(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  var TONE = { green: "var(--data-green)", blue: "var(--accent)", mist: "var(--map-bar-strong)" };

  // bar illustrations (placeholder art for pending images)
  function bars(w, h, n, tone, seed) {
    var r = rng(seed), svg = el("svg", { viewBox: "0 0 " + w + " " + h, preserveAspectRatio: "none", "aria-hidden": "true", "class": "art" });
    var g = el("g", { fill: TONE[tone] || TONE.mist });
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1), base = 0.2 + 0.7 * Math.abs(Math.sin((t * 2.1 + seed * 0.17) * Math.PI));
      var hh = Math.max(4, Math.round(h * base * (0.65 + 0.35 * r())));
      g.appendChild(el("rect", { x: (i * w / n).toFixed(1), y: h - hh, width: 2, height: hh }));
    }
    svg.appendChild(g); return svg;
  }
  var seed = 3;
  document.querySelectorAll(".tablet").forEach(function (t) {
    ["ink", "w70", "w40"].forEach(function (c) { var d = document.createElement("div"); d.className = "bar " + c; t.appendChild(d); });
    var row = document.createElement("div"); row.className = "row";
    ["on", "", "", ""].forEach(function (c) { var d = document.createElement("div"); d.className = "chip " + c; row.appendChild(d); });
    t.appendChild(row);
    t.appendChild(bars(240, 80, 48, t.dataset.art, seed += 4));
  });
  document.querySelectorAll(".ph").forEach(function (p) { p.insertBefore(bars(600, 200, 90, p.dataset.art, seed += 5), p.firstChild); });

  // world map, 5° grid
  var LAND = [[[16,22],[24,31],[39,40],[46,47],[55,57]],[[13,23],[24,32],[47,49],[52,60]],[[3,8],[9,15],[17,23],[24,32],[40,72]],[[2,16],[20,24],[25,30],[32,33],[37,72]],[[5,16],[20,24],[27,28],[37,63],[67,72]],[[10,16],[19,25],[34,35],[37,68],[68,69]],[[11,25],[34,35],[35,63],[64,64]],[[11,23],[35,41],[43,62],[64,64]],[[11,21],[34,36],[38,39],[40,60],[61,61],[63,64]],[[11,20],[34,49],[49,60],[63,63]],[[12,17],[19,19],[33,42],[43,60]],[[13,17],[32,43],[44,47],[49,54],[55,60]],[[14,17],[19,20],[32,43],[44,46],[50,53],[55,58]],[[16,18],[32,44],[45,46],[51,52],[56,58],[60,60]],[[18,19],[20,24],[32,45],[51,51],[56,57],[60,60]],[[20,26],[34,45],[56,57],[59,60]],[[20,28],[38,44],[55,56],[58,60],[62,65]],[[20,29],[38,44],[57,59],[62,66]],[[20,28],[38,44],[62,64]],[[21,28],[38,43],[45,45],[60,65]],[[22,28],[38,43],[45,45],[59,66]],[[22,27],[38,42],[59,66]],[[22,26],[39,42],[59,66]],[[22,25],[60,65],[70,70]],[[22,24],[65,65],[69,70]],[[22,23],[69,69]],[[22,23]],[[22,23]]];
  var map = document.getElementById("map");
  if (map) {
    var r = rng(42), cell = 12, W = 864, H = 336;
    LAND.forEach(function (ranges, row) { ranges.forEach(function (rg) { for (var c = rg[0]; c <= rg[1] && c < 72; c++) for (var k = 0; k < 3; k++) {
      var hh = Math.round(cell * (0.35 + 0.65 * r())), y = row * cell + Math.round((cell - hh) * r()), t = r();
      map.appendChild(el("rect", { "class": t < .45 ? "b1" : t < .8 ? "b2" : "b3", x: c * cell + k * 4, y: y, width: 2, height: hh }));
    } }); });
    function pt(lon, lat) { return [(lon + 180) / 360 * W, (80 - lat) / 140 * H]; }
    var a = pt(-38.5, -3.7), b = pt(-9.1, 38.7);
    map.appendChild(el("path", { d: "M" + a[0] + " " + a[1] + " Q " + ((a[0] + b[0]) / 2 - 40) + " " + ((a[1] + b[1]) / 2 - 30) + " " + b[0] + " " + b[1], fill: "none", stroke: "var(--ink-muted)", "stroke-width": 1.5, "stroke-dasharray": "2 5" }));
    map.appendChild(el("circle", { "class": "pt-g", cx: a[0], cy: a[1], r: 6 }));
    map.appendChild(el("circle", { "class": "pt-b", cx: b[0], cy: b[1], r: 6 }));
  }

  // drag-to-scroll for the process row
  var track = document.getElementById("track");
  if (track) {
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add("dragging"); });
    window.addEventListener("pointermove", function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; track.scrollLeft = sl - dx; });
    window.addEventListener("pointerup", function () { down = false; track.classList.remove("dragging"); });
    track.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") track.scrollBy({ left: 300, behavior: "smooth" }); if (e.key === "ArrowLeft") track.scrollBy({ left: -300, behavior: "smooth" }); });
  }

  // router: bare hash tokens only
  var PAGES = { vinculos: 1, ciclo: 1, curriculo: 1 };
  var HOME_SECTIONS = ["sobre", "trabalho", "processo", "experiencias"];
  var navLinks = document.querySelectorAll("[data-nav]");
  function setActive(key) { navLinks.forEach(function (a) { a.setAttribute("aria-current", a.dataset.nav === key ? "true" : "false"); }); }
  var current = null;
  function route() {
    var h = (location.hash || "").replace("#", "");
    var page = PAGES[h] ? h : "home";
    document.querySelectorAll("[data-page]").forEach(function (m) { m.hidden = m.dataset.page !== page; });
    if (page !== "home") { window.scrollTo(0, 0); setActive(page === "curriculo" ? "curriculo" : "trabalho"); }
    else {
      var target = h && document.getElementById(h);
      if (target) { if (current !== "home") target.scrollIntoView(); } else if (current !== "home") window.scrollTo(0, 0);
      setActive(HOME_SECTIONS.indexOf(h) >= 0 ? h : "sobre");
    }
    current = page;
  }
  window.addEventListener("hashchange", route);
  route();

  // active nav follows scroll on the home page
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (current !== "home") return;
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    HOME_SECTIONS.forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }
})();
