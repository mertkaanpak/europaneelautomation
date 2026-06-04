/* ════════════════════════════════════════════════════════════════════════
   EUROPANEEL — ZENTRALE AGGREGAT-DATENBANK
   ────────────────────────────────────────────────────────────────────────
   EINZIGE Datenquelle für alle Seiten (Zellenrechner, Aggregatauswahl,
   Aggregate-Übersicht). Wird via <script src="aggregate-data.js"> geladen.

   Pflege:  Nur die Listenpreise (listPrice) und ggf. neue Geräte hier ändern —
            Einkaufs- und Verkaufspreise werden automatisch berechnet.

   AUSLEGUNG (Empfohlenes Raumvolumen):
     • Umgebungstemperatur  +32 °C  (immer)
     • Normalkühlung:  Raumtemperatur   0 °C
     • Tiefkühlung:    Raumtemperatur −20 °C
     Die Werte in "volume" sind die vom Hersteller empfohlenen Raumvolumina
     bei genau diesen Bedingungen (aus den Katalogen 2025 entnommen).

   PREISE (Stand 2025):
     • Govi:    45 %    Rabatt  +30 % Aufschlag  + 150 € Lieferpauschale
     • Zanotti: 49,563 % Rabatt  +30 % Aufschlag  (keine Lieferpauschale)
   ════════════════════════════════════════════════════════════════════════ */
(function (global) {
  "use strict";

  /* ── Preis-Parameter je Hersteller ────────────────────────────────────── */
  const PRICING = {
    Govi:    { discount: 0.45,    margin: 0.30, deliveryFee: 150, deliveryLabel: "Govi Lieferpauschale" },
    Zanotti: { discount: 0.49563, margin: 0.30, deliveryFee: 0,   deliveryLabel: "" }
  };

  const r2 = v => Math.round((v + Number.EPSILON) * 100) / 100;

  /* Berechnet Einkaufspreis (EK), Netto-VK (mit Marge, ohne Lieferung),
     Lieferpauschale und Gesamt-VK aus dem Listenpreis. */
  function computePricing(item) {
    const p = PRICING[item.manufacturer] || PRICING.Zanotti;
    const ek    = item.listPrice * (1 - p.discount);
    const netVK = r2(item.listPrice * (1 - p.discount) * (1 + p.margin));
    const fee   = p.deliveryFee;
    return {
      ek:           r2(ek),
      netVK:        netVK,                 // Geräte-VK inkl. 30 % Marge, OHNE Lieferung
      deliveryFee:  fee,                   // Govi 150 €, Zanotti 0 €
      deliveryLabel:p.deliveryLabel,
      total:        r2(netVK + fee),       // Endpreis netto (Gerät + Lieferpauschale)
      discount:     p.discount,
      margin:       p.margin
    };
  }

  /* ── Produktbilder je (Hersteller, Montage) ───────────────────────────── */
  const IMAGES = {
    "Govi|Wand":     "img/govi-polarik-wand.png",
    "Govi|Decke":    "img/govi-polarik-decke.png",
    "Zanotti|Wand":  "img/zanotti-ps-wand.jpg",
    "Zanotti|Decke": "img/zanotti-pc-decke.jpg"
  };
  function imageFor(item) { return IMAGES[item.manufacturer + "|" + item.mount] || ""; }

  /* ════════════════════════════════════════════════════════════════════════
     GERÄTE
     volume = empfohlenes Raumvolumen [m³] bei +32 °C Umgebung,
              0 °C (Normal) bzw. −20 °C (Tief) Raumtemperatur.
     listPrice = Hersteller-Listenpreis netto [€].
     ════════════════════════════════════════════════════════════════════════ */
  const AGGREGATES = [
    /* ─── GOVI POLARIK — WAND — NORMALKÜHLUNG (0 °C) ─────────────────────── */
    { manufacturer:"Govi", mount:"Wand", cooling:"normal", model:"Polarik 10WN1", volume:10, listPrice:1980, voltage:"230V/50Hz" },
    { manufacturer:"Govi", mount:"Wand", cooling:"normal", model:"Polarik 13WN1", volume:13, listPrice:2350, voltage:"230V/50Hz" },
    { manufacturer:"Govi", mount:"Wand", cooling:"normal", model:"Polarik 18WN2", volume:18, listPrice:3030, voltage:"230V/50Hz" },
    { manufacturer:"Govi", mount:"Wand", cooling:"normal", model:"Polarik 31WN2", volume:31, listPrice:3240, voltage:"400V/50Hz" },
    { manufacturer:"Govi", mount:"Wand", cooling:"normal", model:"Polarik 39WN3", volume:39, listPrice:4000, voltage:"400V/50Hz" },
    { manufacturer:"Govi", mount:"Wand", cooling:"normal", model:"Polarik 47WN3", volume:47, listPrice:4150, voltage:"400V/50Hz" },
    { manufacturer:"Govi", mount:"Wand", cooling:"normal", model:"Polarik 56WN3", volume:56, listPrice:4300, voltage:"400V/50Hz" },

    /* ─── GOVI POLARIK — WAND — TIEFKÜHLUNG (−20 °C) ─────────────────────── */
    { manufacturer:"Govi", mount:"Wand", cooling:"tief", model:"Polarik 8WL1",  volume:8,  listPrice:2220, voltage:"230V/50Hz" },
    { manufacturer:"Govi", mount:"Wand", cooling:"tief", model:"Polarik 12WL2", volume:12, listPrice:3100, voltage:"230V/50Hz" },
    { manufacturer:"Govi", mount:"Wand", cooling:"tief", model:"Polarik 23WL2", volume:23, listPrice:3740, voltage:"400V/50Hz" },
    { manufacturer:"Govi", mount:"Wand", cooling:"tief", model:"Polarik 26WL3", volume:26, listPrice:4500, voltage:"400V/50Hz" },
    { manufacturer:"Govi", mount:"Wand", cooling:"tief", model:"Polarik 35WL3", volume:35, listPrice:4650, voltage:"400V/50Hz" },

    /* ─── GOVI POLARIK — DECKE — NORMALKÜHLUNG (0 °C) — Preisliste 10/2025 ─ */
    { manufacturer:"Govi", mount:"Decke", cooling:"normal", model:"Polarik 7TN1",  volume:10, listPrice:2980, voltage:"230V/50Hz" },
    { manufacturer:"Govi", mount:"Decke", cooling:"normal", model:"Polarik 15TN2", volume:15, listPrice:3325, voltage:"230V/50Hz" },
    { manufacturer:"Govi", mount:"Decke", cooling:"normal", model:"Polarik 20TN2", volume:20, listPrice:4480, voltage:"400V/50Hz" },

    /* ─── GOVI POLARIK — DECKE — TIEFKÜHLUNG (−20 °C) — Preisliste 10/2025 ─ */
    { manufacturer:"Govi", mount:"Decke", cooling:"tief", model:"Polarik 5TL1",  volume:4,  listPrice:2875, voltage:"230V/50Hz" },
    { manufacturer:"Govi", mount:"Decke", cooling:"tief", model:"Polarik 10TL2", volume:12, listPrice:5035, voltage:"400V/50Hz" },

    /* ─── ZANOTTI — WAND (PS) — NORMALKÜHLUNG (MPS, 0 °C) ────────────────── */
    { manufacturer:"Zanotti", mount:"Wand", cooling:"normal", model:"MPS 1107YA11A", volume:7,    listPrice:2604, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Wand", cooling:"normal", model:"MPS 1110YA11A", volume:13.5, listPrice:2996, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Wand", cooling:"normal", model:"MPS 3112YA11A", volume:19.8, listPrice:3765, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Wand", cooling:"normal", model:"MPS 3220YA11A", volume:36.1, listPrice:5214, voltage:"230V/50Hz" },

    /* ─── ZANOTTI — WAND (PS) — TIEFKÜHLUNG (BPS, −20 °C) ────────────────── */
    { manufacturer:"Zanotti", mount:"Wand", cooling:"tief", model:"BPS 3112YA11A", volume:6.2,  listPrice:3250, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Wand", cooling:"tief", model:"BPS 3115YA11A", volume:7.7,  listPrice:3753, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Wand", cooling:"tief", model:"BPS 3224YA11A", volume:16.8, listPrice:4137, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Wand", cooling:"tief", model:"BPS 3230YA11A", volume:20.8, listPrice:5240, voltage:"230V/50Hz" },

    /* ─── ZANOTTI — DECKE (PC) — NORMALKÜHLUNG (MPC, 0 °C) ───────────────── */
    { manufacturer:"Zanotti", mount:"Decke", cooling:"normal", model:"MPC 1107YA11X", volume:8,  listPrice:3543, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Decke", cooling:"normal", model:"MPC 1110YA11X", volume:12, listPrice:3824, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Decke", cooling:"normal", model:"MPC 2112YA11X", volume:16, listPrice:4951, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Decke", cooling:"normal", model:"MPC 3220YA11X", volume:32, listPrice:6288, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Decke", cooling:"normal", model:"MPC 3224YA11X", volume:43, listPrice:7072, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Decke", cooling:"normal", model:"MPC 4336YA11X", volume:71, listPrice:9436, voltage:"230V/50Hz" },

    /* ─── ZANOTTI — DECKE (PC) — TIEFKÜHLUNG (BPC, −20 °C) ───────────────── */
    { manufacturer:"Zanotti", mount:"Decke", cooling:"tief", model:"BPC 1112YA11X", volume:4,  listPrice:4327, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Decke", cooling:"tief", model:"BPC 2224YA11X", volume:12, listPrice:6448, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Decke", cooling:"tief", model:"BPC 4336YA11X", volume:22, listPrice:8624, voltage:"230V/50Hz" },
    { manufacturer:"Zanotti", mount:"Decke", cooling:"tief", model:"BPC 4345YA11X", volume:38, listPrice:9795, voltage:"230V/50Hz" }
  ];

  /* Jedes Gerät mit berechneten Preisen + Bildpfad anreichern. */
  AGGREGATES.forEach(a => {
    const pr = computePricing(a);
    a.ek          = pr.ek;
    a.netVK       = pr.netVK;        // Geräte-VK ohne Lieferung
    a.deliveryFee = pr.deliveryFee;
    a.salePrice   = pr.total;        // Endpreis (Gerät + Lieferpauschale) — kompatibel zu alt
    a.image       = imageFor(a);
  });

  /* ════════════════════════════════════════════════════════════════════════
     AUSWAHL-LOGIK
     Wählt das kleinste Gerät, dessen empfohlenes Raumvolumen ≥ Raumvolumen ist.
     Ist der Raum größer als das größte Gerät  →  größtes Gerät + oversized:true.
     Rückgabe: null (keine Geräte) ODER { ...gerät, oversized:boolean }.
     ════════════════════════════════════════════════════════════════════════ */
  function pickAggregate(roomVolume, cooling, mount, manufacturer) {
    let list = AGGREGATES.filter(i => i.cooling === cooling && i.mount === mount);
    if (manufacturer && manufacturer !== "auto") list = list.filter(i => i.manufacturer === manufacturer);
    if (!list.length) return null;

    list.sort((a, b) => a.volume - b.volume);
    const fit = list.find(i => i.volume >= roomVolume);

    if (fit) {
      // Bei Gleichstand im Volumen das günstigste nehmen.
      const cheapest = list.filter(i => i.volume === fit.volume)
                           .sort((a, b) => a.salePrice - b.salePrice)[0];
      return Object.assign({}, cheapest, { oversized: false });
    }
    // Kein Gerät groß genug → größtes wählen + markieren.
    const largest = list[list.length - 1];
    return Object.assign({}, largest, { oversized: true });
  }

  /* Liefert das günstigste passende Gerät über ALLE Hersteller. */
  function pickCheapest(roomVolume, cooling, mount) {
    const candidates = ["Govi", "Zanotti"]
      .map(m => pickAggregate(roomVolume, cooling, mount, m))
      .filter(Boolean);
    if (!candidates.length) return null;
    // Bevorzugt nicht-oversized; sonst günstigstes.
    const fitting = candidates.filter(c => !c.oversized);
    const pool = fitting.length ? fitting : candidates;
    return pool.sort((a, b) => a.salePrice - b.salePrice)[0];
  }

  function fmtEUR(v) {
    return (isFinite(v) ? v : 0).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  }

  /* Auslegungs-Bedingungen als Text (für Hinweise in der UI). */
  const DESIGN_CONDITIONS = {
    normal: "Auslegung: Umgebung +32 °C, Raumtemperatur 0 °C",
    tief:   "Auslegung: Umgebung +32 °C, Raumtemperatur −20 °C"
  };

  /* ── Export ───────────────────────────────────────────────────────────── */
  global.EuropaneelData = {
    AGGREGATES,
    PRICING,
    pickAggregate,
    pickCheapest,
    computePricing,
    imageFor,
    fmtEUR,
    DESIGN_CONDITIONS
  };

})(typeof window !== "undefined" ? window : this);
