// Motion (motion.dev, build vanilla via CDN): reveals ao scroll, transição entre páginas, contadores e rota do mapa
(function () {
  var root = document.documentElement;
  // .motion-pending is only set when reduced motion is off; the head script drops it after 3s if Motion never loads
  if (!root.classList.contains("motion-pending")) return;
  if (!window.Motion) { root.classList.remove("motion-pending"); return; }
  var animate = Motion.animate, inView = Motion.inView;
  var EASE = [0.22, 1, 0.36, 1], BACK = [0.34, 1.56, 0.64, 1];
  var NS = "http://www.w3.org/2000/svg";

  // containers whose children reveal one by one instead of as a single block
  var LISTS = "section, footer, .cv, .hero-grid, .cards2, .track, .timeline, .challenges, .results, .stages, .stage, .two, .edu, .bio, .bio .text";
  function units(node, out) {
    Array.prototype.forEach.call(node.children, function (c) { if (c.matches(LISTS)) units(c, out); else out.push(c); });
    return out;
  }
  var targets = [];
  document.querySelectorAll(".page, footer").forEach(function (n) { units(n, targets); });
  targets.forEach(function (el) { el.style.opacity = "0"; });
  root.classList.remove("motion-pending");

  function countUp(el) {
    var text = el.textContent, nums = text.match(/\d+/g);
    if (!nums) return;
    var last = nums[nums.length - 1], at = text.lastIndexOf(last);
    var pre = text.slice(0, at), post = text.slice(at + last.length);
    var from = nums.length > 1 ? +nums[0] : 0;
    el.textContent = pre + from + post;
    animate(from, +last, { duration: 1.4, delay: 0.2, ease: EASE, onUpdate: function (v) { el.textContent = pre + Math.round(v) + post; } });
  }

  // the route is dashed, so it is drawn through a solid mask instead of animating its own dasharray
  function drawRoute(svg) {
    var path = svg.querySelector("path"), dots = svg.querySelectorAll("circle");
    if (!path || dots.length < 2) return;
    var mask = document.createElementNS(NS, "mask"), m = document.createElementNS(NS, "path");
    mask.id = "route-mask";
    [["maskUnits", "userSpaceOnUse"], ["x", 0], ["y", 0], ["width", 864], ["height", 336]].forEach(function (a) { mask.setAttribute(a[0], a[1]); });
    [["d", path.getAttribute("d")], ["fill", "none"], ["stroke", "#fff"], ["stroke-width", 4], ["pathLength", 1], ["stroke-dasharray", "1 1"], ["stroke-dashoffset", 1]].forEach(function (a) { m.setAttribute(a[0], a[1]); });
    mask.appendChild(m); svg.appendChild(mask);
    path.setAttribute("mask", "url(#route-mask)");
    dots.forEach(function (d) { d.style.transformBox = "fill-box"; d.style.transformOrigin = "center"; d.style.transform = "scale(0)"; });
    animate(dots[0], { transform: ["scale(0)", "scale(1)"] }, { duration: 0.5, delay: 0.3, ease: BACK });
    animate(0, 1, { duration: 1.2, delay: 0.6, ease: [0.65, 0, 0.35, 1], onUpdate: function (v) { m.setAttribute("stroke-dashoffset", 1 - v); } });
    animate(dots[1], { transform: ["scale(0)", "scale(1)"] }, { duration: 0.5, delay: 1.7, ease: BACK });
  }

  function reveal(el, delay) {
    // `translate`, not `transform`, so the tilted process steps keep their CSS rotate and hover
    animate(el, { opacity: [0, 1], translate: ["0px 24px", "0px 0px"] }, { duration: 0.7, delay: delay, ease: EASE });
    var big = el.matches(".metric") && el.querySelector(".big");
    if (big) countUp(big);
    var map = el.querySelector && el.querySelector("#map");
    if (map) drawRoute(map);
  }

  // batch everything that enters in the same frame so it staggers in document order
  var queue = [], scheduled = false;
  function flush() {
    scheduled = false;
    queue.sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
    queue.forEach(function (el, i) { reveal(el, Math.min(i, 8) * 0.08); });
    queue = [];
  }
  inView(targets, function (el) {
    queue.push(el);
    if (!scheduled) { scheduled = true; requestAnimationFrame(flush); }
  }, { amount: 0.2 });

  // fade the page in when the hash router swaps pages
  var shown = document.querySelector(".page:not([hidden])");
  window.addEventListener("hashchange", function () {
    var now = document.querySelector(".page:not([hidden])");
    if (!now || now === shown) return;
    shown = now;
    animate(now, { opacity: [0, 1] }, { duration: 0.4, ease: "easeOut" });
  });

  // slow spin for the circular "arraste para o lado" badge
  var ring = document.querySelector(".drag-hint text");
  if (ring) {
    ring.style.transformBox = "view-box"; ring.style.transformOrigin = "56px 56px";
    animate(ring, { transform: ["rotate(0deg)", "rotate(360deg)"] }, { duration: 24, repeat: Infinity, ease: "linear" });
  }
})();
