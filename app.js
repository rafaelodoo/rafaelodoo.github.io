(function () {
  "use strict";

  var PKG_KEYS = ["p1", "p2", "p3"];
  var html = document.documentElement;

  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  function getQueryPkg() {
    var m = /^p[123]$/i.exec(
      new URLSearchParams(window.location.search).get("paquete") || ""
    );
    return m ? m[0].toLowerCase() : null;
  }

  function setUrlPkg(pkg) {
    var u = new URL(window.location.href);
    if (pkg) u.searchParams.set("paquete", pkg);
    else u.searchParams.delete("paquete");
    window.history.replaceState({}, "", u.pathname + u.search + u.hash);
  }

  function setActivePackage(pkg) {
    var fi = qs("#fase-filter");
    if (fi) fi.value = "";
    qsa(".data-table tbody tr").forEach(function (tr) {
      tr.hidden = false;
    });
    PKG_KEYS.forEach(function (k) {
      var art = qs("#" + k);
      var tab = qs('.package-tab[data-pkg="' + k + '"]');
      if (art) art.classList.toggle("is-hidden", k !== pkg);
      if (tab) tab.setAttribute("aria-selected", k === pkg ? "true" : "false");
    });
    setUrlPkg(pkg);
  }

  function initPackageTabs() {
    var initial = getQueryPkg() || "p1";
    if (PKG_KEYS.indexOf(initial) === -1) initial = "p1";
    setActivePackage(initial);

    qsa(".package-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pkg = btn.getAttribute("data-pkg");
        if (!pkg) return;
        setActivePackage(pkg);
        var el = qs("#" + pkg);
        if (el) el.focus({ preventScroll: true });
      });
    });
  }

  function initSubTabs() {
    html.classList.add("js");

    qsa(".package-article").forEach(function (article) {
      var panels = qsa(".tab-panel", article);
      var tabs = qsa(".subnav-tab", article);
      if (!panels.length || !tabs.length) return;

      function activate(id) {
        tabs.forEach(function (t) {
          var on = t.getAttribute("data-tab") === id;
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        panels.forEach(function (p) {
          var on = p.id === id;
          p.hidden = !on;
          p.classList.toggle("is-active", on);
        });
      }

      var firstId = panels[0].id;
      activate(firstId);

      tabs.forEach(function (t) {
        t.addEventListener("click", function () {
          var id = t.getAttribute("data-tab");
          if (id) activate(id);
        });
      });
    });
  }

  function initTheme() {
    var btn = qs("#theme-toggle");
    if (!btn) return;

    function apply(stored) {
      if (stored === "light" || stored === "dark") {
        html.setAttribute("data-theme", stored);
      } else {
        html.removeAttribute("data-theme");
      }
    }

    try {
      apply(localStorage.getItem("dic-theme"));
    } catch (e) {
      apply(null);
    }

    btn.addEventListener("click", function () {
      var cur = html.getAttribute("data-theme");
      var prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next;
      if (!cur) next = prefersDark ? "light" : "dark";
      else if (cur === "dark") next = "light";
      else next = "dark";
      html.setAttribute("data-theme", next);
      try {
        localStorage.setItem("dic-theme", next);
      } catch (e2) {}
    });
  }

  function initCompact() {
    var btn = qs("#compact-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      document.body.classList.toggle("compact");
      var on = document.body.classList.contains("compact");
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function initPhaseFilter() {
    var input = qs("#fase-filter");
    if (!input) return;

    input.addEventListener("input", function () {
      var q = (input.value || "").trim().toLowerCase();
      var article = qs(".package-article:not(.is-hidden)");
      if (!article) return;
      qsa(".data-table tbody tr", article).forEach(function (tr) {
        var act = (tr.getAttribute("data-activity") || "").toLowerCase();
        var show = !q || act.indexOf(q) !== -1;
        tr.hidden = !show;
      });
    });
  }

  function initScrollHint() {
    if (!window.ResizeObserver) return;
    qsa(".table-wrap.scroll-hint").forEach(function (wrap) {
      function update() {
        wrap.classList.toggle("is-scrollable", wrap.scrollWidth > wrap.clientWidth);
      }
      new ResizeObserver(update).observe(wrap);
      wrap.addEventListener("scroll", function () {
        wrap.classList.toggle(
          "at-end",
          wrap.scrollLeft + wrap.clientWidth >= wrap.scrollWidth - 2
        );
      });
      update();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initPackageTabs();
    initSubTabs();
    initTheme();
    initCompact();
    initPhaseFilter();
    initScrollHint();
  });
})();
