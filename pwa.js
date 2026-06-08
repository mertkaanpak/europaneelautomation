/* ════════════════════════════════════════════════════════════════════════
   EUROPANEEL — PWA-Initialisierung
   Macht die Seite zur installierbaren App: Manifest + App-Meta einbinden,
   Notch-Unterstützung, Service-Worker registrieren. Wird auf jeder Seite
   über <script src="pwa.js"></script> im <head> geladen.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  // Notch / Safe-Area aktivieren
  var vp = document.querySelector('meta[name="viewport"]');
  if (vp && vp.content.indexOf("viewport-fit") < 0) vp.content += ", viewport-fit=cover";

  function addMeta(name, content) {
    if (!document.querySelector('meta[name="' + name + '"]')) {
      var m = document.createElement("meta");
      m.setAttribute("name", name);
      m.setAttribute("content", content);
      document.head.appendChild(m);
    }
  }
  addMeta("theme-color", "#ffffff");
  addMeta("mobile-web-app-capable", "yes");
  addMeta("apple-mobile-web-app-capable", "yes");
  addMeta("apple-mobile-web-app-status-bar-style", "default");
  addMeta("apple-mobile-web-app-title", "Europaneel");

  if (!document.querySelector('link[rel="manifest"]')) {
    var l = document.createElement("link");
    l.rel = "manifest";
    l.href = "manifest.json";
    document.head.appendChild(l);
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  /* ── Saubere Linien-Symbole für Sidebar & untere Leiste (statt Emojis) ── */
  var S = function (p) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  };
  var ICONS = {
    "index.html":              S('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>'),                         // Haus
    "zellenrechner.html":      S('<path d="M12 2.5 21 7v10l-9 4.5L3 17V7z"/><path d="M3 7l9 4.5L21 7"/><path d="M12 11.5V21.5"/>'),               // Quader (Zelle)
    "aggregatauswahl.html":    S('<path d="M12 2v20M2 12h20M4.8 4.8l14.4 14.4M19.2 4.8 4.8 19.2"/>'),                                            // Schneeflocke (Kühlung)
    "aggregate.html":          S('<rect x="3" y="3" width="7.5" height="7.5" rx="1.2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.2"/>'), // Raster
    "paneelrechner.html":      S('<path d="M12 3 3 7.5l9 4.5 9-4.5L12 3z"/><path d="M3 12l9 4.5L21 12"/><path d="M3 16.5 12 21l9-4.5"/>'),         // Schichten (Paneele)
    "lagerbestand_tueren.html":S('<rect x="3" y="4" width="18" height="4.5" rx="1"/><path d="M5 8.5V20h14V8.5"/><path d="M9.5 12.5h5"/>'),         // Lager-Box
    "kalender.html":           S('<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>')                       // Kalender
  };
  var LABELS = {
    "index.html": "Home", "zellenrechner.html": "Zellen", "aggregatauswahl.html": "Aggregat",
    "paneelrechner.html": "Paneele", "lagerbestand_tueren.html": "Lager", "kalender.html": "Kalender"
  };
  function navKey(a) { return (a.getAttribute("href") || "").split(/[\\/]/).pop().split("?")[0]; }
  function enhanceNav() {
    document.querySelectorAll(".bottom-nav-item, .nav-link").forEach(function (a) {
      var k = navKey(a), ni = a.querySelector(".nav-icon");
      if (ni && ICONS[k]) ni.innerHTML = ICONS[k];
      if (a.classList.contains("bottom-nav-item") && LABELS[k]) {     // Label korrigieren (untere Leiste, nicht übersetzt)
        var lab = a.querySelector("span:not(.nav-icon)");
        if (lab) lab.textContent = LABELS[k];
      }
    });
  }
  if (document.readyState !== "loading") enhanceNav();
  else document.addEventListener("DOMContentLoaded", enhanceNav);
})();
