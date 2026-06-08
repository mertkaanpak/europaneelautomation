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
})();
