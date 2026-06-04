/* ════════════════════════════════════════════════════════════════════════
   EUROPANEEL — PARAMETRISCHE 3D-SKIZZE EINER KÜHLZELLE
   ────────────────────────────────────────────────────────────────────────
   Erzeugt eine isometrische SVG-Zeichnung aus den Maßen L × B × H.
   • Wandpaneele sind immer 1,00 m breit  →  Fugen werden im 1-m-Raster gezeichnet
     (3,00 m Wand = 3 Paneele, 2,50 m = 2 ganze + 1 halbes usw.).
   • Tür (mit Griff), Decken-Paneelraster, optional Aggregat (Wand/Decke),
     Maßangaben und Paneel-Stückzahl.
   Keine Abhängigkeiten, funktioniert offline und im Druck/PDF.

   Aufruf:  EuropaneelZelle3D.buildSVG({ L, B, H, door:{w,h}|null,
              mitBoden:bool, agg:{ mount:'Wand'|'Decke', model:'…' }|null, width:px })
   ════════════════════════════════════════════════════════════════════════ */
(function (global) {
  "use strict";

  const A = Math.PI / 6;                 // 30° Isometrie
  const COS = Math.cos(A), SIN = Math.sin(A);

  const nf = v => (v).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Rohprojektion (Meter -> 2D, Maßstab 1)
  function raw(x, y, z) { return [ (x - y) * COS, (x + y) * SIN - z ]; }

  function buildSVG(opts) {
    opts = opts || {};
    const L = Math.max(0.1, +opts.L || 0);
    const B = Math.max(0.1, +opts.B || 0);
    const H = Math.max(0.1, +opts.H || 0);
    const door = opts.door && opts.door.w ? { w: Math.min(opts.door.w, L * 0.9), h: Math.min(opts.door.h, H * 0.96) } : null;
    const agg = opts.agg && opts.agg.mount ? opts.agg : null;

    // Farben
    const C = {
      top: "#eef2f7", front: "#e2e8f0", side: "#cdd6e1",
      seam: "#aeb9c6", edge: "#475569", base: "#94a3b8",
      doorFill: "#fbfdff", doorStroke: "#64748b", handle: "#334155", hinge: "#b08d57",
      aggFill: "#e2e8f0", aggSide: "#cdd6e1", aggTop: "#eef2f7", aggStroke: "#475569",
      dim: "#64748b", accent: "#e30613", capTxt: "#334155"
    };

    // Maßstab: auf Zielbreite einpassen
    const corners = [
      raw(0,0,0), raw(L,0,0), raw(0,B,0), raw(L,B,0),
      raw(0,0,H), raw(L,0,H), raw(0,B,H), raw(L,B,H)
    ];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    corners.forEach(p => { minX=Math.min(minX,p[0]); maxX=Math.max(maxX,p[0]); minY=Math.min(minY,p[1]); maxY=Math.max(maxY,p[1]); });

    const targetInnerW = Math.max(360, opts.width || 540);
    const padX = 56, padTop = 42, padBottom = 64;
    const s = targetInnerW / (maxX - minX);
    const W = targetInnerW + padX * 2;
    const Hpx = (maxY - minY) * s + padTop + padBottom;

    // Screen-Mapper
    const S = (x, y, z) => { const r = raw(x, y, z); return [ (r[0]-minX)*s + padX, (r[1]-minY)*s + padTop ]; };
    const poly = pts => pts.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
    const line = (a, b, stroke, w, dash) =>
      `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${stroke}" stroke-width="${w}"${dash?` stroke-dasharray="${dash}"`:""} stroke-linecap="round"/>`;

    let svg = "";

    /* ── Sichtbare Flächen: linke Frontwand (y=B), rechte Frontwand (x=L), Decke (z=H) ── */
    const rightFace = [ S(L,0,0), S(L,B,0), S(L,B,H), S(L,0,H) ];   // rechte Wand (Breite B)
    const leftFace  = [ S(0,B,0), S(L,B,0), S(L,B,H), S(0,B,H) ];   // linke Wand  (Länge L, mit Tür)
    const topFace   = [ S(0,0,H), S(L,0,H), S(L,B,H), S(0,B,H) ];
    svg += `<polygon points="${poly(rightFace)}" fill="${C.side}"  stroke="${C.edge}" stroke-width="1.6" stroke-linejoin="round"/>`;
    svg += `<polygon points="${poly(leftFace)}"  fill="${C.front}" stroke="${C.edge}" stroke-width="1.6" stroke-linejoin="round"/>`;
    svg += `<polygon points="${poly(topFace)}"   fill="${C.top}"   stroke="${C.edge}" stroke-width="1.6" stroke-linejoin="round"/>`;

    /* ── Paneelfugen (1-m-Raster) ── */
    const innerN = d => Math.max(0, Math.ceil(d - 1e-6) - 1);   // Anzahl innenliegender Fugen
    for (let i = 1; i <= innerN(L); i++) {            // linke Wand + Decke: Fugen in Längsrichtung
      svg += line(S(i,B,0), S(i,B,H), C.seam, 1);
      svg += line(S(i,0,H), S(i,B,H), C.seam, 1);
    }
    for (let j = 1; j <= innerN(B); j++)              // rechte Wand: senkrechte Fugen
      svg += line(S(L,j,0), S(L,j,H), C.seam, 1);

    /* ── Bodenprofil / Boden ── */
    if (opts.mitBoden) {
      svg += `<polygon points="${poly([S(0,B,0),S(L,B,0),S(L,0,0),S(0,0,0)])}" fill="#dfe6ee" fill-opacity="0.45" stroke="${C.base}" stroke-width="1"/>`;
    } else {
      // U-Profil-Andeutung an den sichtbaren Bodenkanten
      svg += line(S(0,B,0), S(L,B,0), C.base, 3);
      svg += line(S(L,B,0), S(L,0,0), C.base, 3);
    }

    /* ── Aggregat als 3D-Block (Wand- oder Deckengerät) ── */
    if (agg) {
      const aggBox = (x0,x1,y0,y1,z0,z1, louver) => {
        const fy = [S(x0,y1,z0),S(x1,y1,z0),S(x1,y1,z1),S(x0,y1,z1)]; // +y (Seite)
        const fx = [S(x1,y0,z0),S(x1,y1,z0),S(x1,y1,z1),S(x1,y0,z1)]; // +x (Front)
        const ft = [S(x0,y0,z1),S(x1,y0,z1),S(x1,y1,z1),S(x0,y1,z1)]; // oben
        svg += `<polygon points="${poly(fy)}" fill="${C.aggSide}" stroke="${C.aggStroke}" stroke-width="1.1" stroke-linejoin="round"/>`;
        svg += `<polygon points="${poly(fx)}" fill="${C.aggFill}" stroke="${C.aggStroke}" stroke-width="1.1" stroke-linejoin="round"/>`;
        svg += `<polygon points="${poly(ft)}" fill="${C.aggTop}"  stroke="${C.aggStroke}" stroke-width="1.1" stroke-linejoin="round"/>`;
        if (louver === 'x') for (let k=1;k<=4;k++){ const zz=z0+(z1-z0)*k/5; svg += line(S(x1,y0,zz),S(x1,y1,zz),C.aggStroke,0.7); }
        else for (let k=1;k<=4;k++){ const xx=x0+(x1-x0)*k/5; svg += line(S(xx,y1,z0),S(xx,y1,z1),C.aggStroke,0.7); }
      };
      if (agg.mount === "Decke") {
        aggBox(L*0.5-0.55, L*0.5+0.55, B*0.5-0.42, B*0.5+0.42, H, H+0.34, 'y');   // Block auf dem Dach
      } else {
        aggBox(L, L+0.44, B*0.5-0.5, B*0.5+0.5, H-0.82, H-0.24, 'x');             // Wandblock, ragt rechts aus der Wand
      }
    }

    /* ── Tür auf der linken Frontwand (y=B) ── */
    if (door) {
      const dx = Math.max(0.08, (L - door.w) / 2);
      const dPts = [ S(dx,B,0), S(dx+door.w,B,0), S(dx+door.w,B,door.h), S(dx,B,door.h) ];
      svg += `<polygon points="${poly(dPts)}" fill="${C.doorFill}" stroke="${C.doorStroke}" stroke-width="1.4" stroke-linejoin="round"/>`;
      const inset = 0.06;
      svg += `<polygon points="${poly([S(dx+inset,B,inset),S(dx+door.w-inset,B,inset),S(dx+door.w-inset,B,door.h-inset),S(dx+inset,B,door.h-inset)])}" fill="none" stroke="${C.doorStroke}" stroke-width="0.7" stroke-opacity="0.6"/>`;
      // Scharniere links, Griff rechts (Schließseite)
      [0.18,0.5,0.82].forEach(f=>{ const h=S(dx+0.06,B,door.h*f); svg += `<rect x="${(h[0]-2).toFixed(1)}" y="${(h[1]-4).toFixed(1)}" width="4" height="8" rx="1" fill="${C.hinge}"/>`; });
      const gh = S(dx+door.w-0.12, B, door.h*0.48);
      svg += `<rect x="${(gh[0]-3).toFixed(1)}" y="${(gh[1]-7).toFixed(1)}" width="6" height="14" rx="1.5" fill="${C.handle}"/>`;
    }

    /* ── Maßangaben ── */
    const lbl = (p, dx, dy, txt, anchor) =>
      `<text x="${(p[0]+dx).toFixed(1)}" y="${(p[1]+dy).toFixed(1)}" font-family="Segoe UI,Arial,sans-serif" font-size="13" font-weight="600" fill="${C.dim}" text-anchor="${anchor}">${esc(txt)}</text>`;
    svg += lbl(S(L/2,B,0), -6, 28, "L · " + nf(L) + " m", "middle");
    svg += lbl(S(L,B/2,0), 16, 20, "B · " + nf(B) + " m", "start");
    svg += lbl(S(0,B,H/2), -12, 4, "H · " + nf(H) + " m", "end");

    /* ── Bildunterschrift: Paneel-Stückzahl ── */
    const nL = Math.max(1, Math.ceil(L - 1e-6)), nB = Math.max(1, Math.ceil(B - 1e-6));
    const cap = `Wandpaneele je 1,00 m   ·   Länge ${nL} Paneele   ·   Breite ${nB} Paneele`;
    svg += `<text x="${(W/2).toFixed(1)}" y="${(Hpx-26).toFixed(1)}" font-family="Segoe UI,Arial,sans-serif" font-size="13" font-weight="700" fill="${C.capTxt}" text-anchor="middle">${esc(cap)}</text>`;
    if (agg) svg += `<text x="${(W/2).toFixed(1)}" y="${(Hpx-8).toFixed(1)}" font-family="Segoe UI,Arial,sans-serif" font-size="11.5" fill="${C.dim}" text-anchor="middle">Aggregat (${esc(agg.mount)}): ${esc(agg.model||"")}</text>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(0)} ${Hpx.toFixed(0)}" width="${W.toFixed(0)}" height="${Hpx.toFixed(0)}" role="img" aria-label="3D-Skizze der Kühlzelle">${svg}</svg>`;
  }

  /* ── KOMBI: EIN Quader mit innenliegender Trennwand und zwei Türen ──────
     opts = { rooms:[{len, door:{w,h}}], depth, H, mitBoden, width }
     Räume liegen entlang der Längsachse nebeneinander (gemeinsame Breite/Tiefe);
     Gesamtlänge = len1 + len2, Trennwand am Übergang, beide Türen auf der Längsseite. */
  function buildKombiSVG(opts) {
    const rA = opts.rooms[0], rB = opts.rooms[1];
    const lenA = Math.max(0.1, rA.len), lenB = Math.max(0.1, rB.len);
    const W = lenA + lenB, D = Math.max(0.1, opts.depth), H = Math.max(0.1, opts.H);
    const split = lenA;

    const C = {
      top:"#eef2f7", front:"#e2e8f0", side:"#cdd6e1",
      seam:"#aeb9c6", edge:"#475569", base:"#94a3b8",
      doorFill:"#fbfdff", doorStroke:"#64748b", handle:"#334155", hinge:"#b08d57",
      partition:"#e30613", dim:"#64748b", capTxt:"#334155"
    };

    const corners = [ raw(0,0,0),raw(W,0,0),raw(0,D,0),raw(W,D,0), raw(0,0,H),raw(W,0,H),raw(0,D,H),raw(W,D,H) ];
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    corners.forEach(p=>{minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);});
    const targetInnerW=Math.max(380,opts.width||560), padX=54,padTop=30,padBottom=70;
    const s=targetInnerW/(maxX-minX);
    const SW=targetInnerW+padX*2, SH=(maxY-minY)*s+padTop+padBottom;
    const S=(x,y,z)=>{const r=raw(x,y,z);return [(r[0]-minX)*s+padX,(r[1]-minY)*s+padTop];};
    const poly=pts=>pts.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ");
    const line=(a,b,st,w,dash)=>`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${st}" stroke-width="${w}"${dash?` stroke-dasharray="${dash}"`:""} stroke-linecap="round"/>`;
    let svg="";

    // Flächen: rechte Wand (x=W), linke Frontwand (y=D), Decke
    svg+=`<polygon points="${poly([S(W,0,0),S(W,D,0),S(W,D,H),S(W,0,H)])}" fill="${C.side}"  stroke="${C.edge}" stroke-width="1.6" stroke-linejoin="round"/>`;
    svg+=`<polygon points="${poly([S(0,D,0),S(W,D,0),S(W,D,H),S(0,D,H)])}" fill="${C.front}" stroke="${C.edge}" stroke-width="1.6" stroke-linejoin="round"/>`;
    svg+=`<polygon points="${poly([S(0,0,H),S(W,0,H),S(W,D,H),S(0,D,H)])}" fill="${C.top}"   stroke="${C.edge}" stroke-width="1.6" stroke-linejoin="round"/>`;

    // Paneelfugen (1-m-Raster)
    const innerN=d=>Math.max(0,Math.ceil(d-1e-6)-1);
    for(let i=1;i<=innerN(W);i++){ svg+=line(S(i,D,0),S(i,D,H),C.seam,1); svg+=line(S(i,0,H),S(i,D,H),C.seam,1); }
    for(let j=1;j<=innerN(D);j++) svg+=line(S(W,j,0),S(W,j,H),C.seam,1);

    // Boden / U-Profil
    if(opts.mitBoden){ svg+=`<polygon points="${poly([S(0,D,0),S(W,D,0),S(W,0,0),S(0,0,0)])}" fill="#dfe6ee" fill-opacity="0.45" stroke="${C.base}" stroke-width="1"/>`; }
    else { svg+=line(S(0,D,0),S(W,D,0),C.base,3); svg+=line(S(W,D,0),S(W,0,0),C.base,3); }

    // Trennwand (rot) bei x=split — Dachkante + Frontkante
    svg+=line(S(split,0,H),S(split,D,H),C.partition,2.6);
    svg+=line(S(split,D,0),S(split,D,H),C.partition,2.6);
    const tp=S(split,0,H);
    svg+=`<text x="${tp[0].toFixed(1)}" y="${(tp[1]-7).toFixed(1)}" font-family="Segoe UI,Arial,sans-serif" font-size="11" font-weight="700" fill="${C.partition}" text-anchor="middle">Trennwand</text>`;

    // Zwei Türen auf der Frontwand (je Raum)
    function drawDoor(cx, w, h, sectLen){
      const dw=Math.min(w||0.9, sectLen*0.8), dh=Math.min(h||2.0, H*0.96);
      const dx=Math.max(0.06, cx-dw/2);
      svg+=`<polygon points="${poly([S(dx,D,0),S(dx+dw,D,0),S(dx+dw,D,dh),S(dx,D,dh)])}" fill="${C.doorFill}" stroke="${C.doorStroke}" stroke-width="1.4" stroke-linejoin="round"/>`;
      const ins=0.06;
      svg+=`<polygon points="${poly([S(dx+ins,D,ins),S(dx+dw-ins,D,ins),S(dx+dw-ins,D,dh-ins),S(dx+ins,D,dh-ins)])}" fill="none" stroke="${C.doorStroke}" stroke-width="0.7" stroke-opacity="0.6"/>`;
      [0.18,0.5,0.82].forEach(f=>{const hh=S(dx+0.06,D,dh*f);svg+=`<rect x="${(hh[0]-2).toFixed(1)}" y="${(hh[1]-4).toFixed(1)}" width="4" height="8" rx="1" fill="${C.hinge}"/>`;});
      const gh=S(dx+dw-0.12,D,dh*0.48);
      svg+=`<rect x="${(gh[0]-3).toFixed(1)}" y="${(gh[1]-7).toFixed(1)}" width="6" height="14" rx="1.5" fill="${C.handle}"/>`;
    }
    drawDoor(lenA/2, rA.door&&rA.door.w, rA.door&&rA.door.h, lenA);
    drawDoor(lenA+lenB/2, rB.door&&rB.door.w, rB.door&&rB.door.h, lenB);

    // Maße
    const lbl=(p,dx,dy,txt,anchor)=>`<text x="${(p[0]+dx).toFixed(1)}" y="${(p[1]+dy).toFixed(1)}" font-family="Segoe UI,Arial,sans-serif" font-size="13" font-weight="600" fill="${C.dim}" text-anchor="${anchor}">${esc(txt)}</text>`;
    svg+=lbl(S(W/2,D,0),-6,30,"L · "+nf(W)+" m","middle");
    svg+=lbl(S(W,D/2,0),16,20,"B · "+nf(D)+" m","start");
    svg+=lbl(S(0,D,H/2),-12,4,"H · "+nf(H)+" m","end");

    // Bildunterschrift
    const cap=`Ein Raum mit Trennwand · ${nf(W)} × ${nf(D)} m`;
    const sub=`Raum 1: ${nf(lenA)} m   ·   Raum 2: ${nf(lenB)} m   ·   Trennwand bei ${nf(split)} m   ·   2 Türen`;
    svg+=`<text x="${(SW/2).toFixed(1)}" y="${(SH-28).toFixed(1)}" font-family="Segoe UI,Arial,sans-serif" font-size="13" font-weight="700" fill="${C.capTxt}" text-anchor="middle">${esc(cap)}</text>`;
    svg+=`<text x="${(SW/2).toFixed(1)}" y="${(SH-10).toFixed(1)}" font-family="Segoe UI,Arial,sans-serif" font-size="11.5" fill="${C.dim}" text-anchor="middle">${esc(sub)}</text>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW.toFixed(0)} ${SH.toFixed(0)}" width="${SW.toFixed(0)}" height="${SH.toFixed(0)}" role="img" aria-label="3D-Skizze Kombi-Kühlzelle">${svg}</svg>`;
  }

  // Türmaße aus Auswahltext "… 80×190 cm …" lesen -> {w,h} in Metern
  function parseDoor(text) {
    const m = (text || "").match(/(\d{2,3})\s*[×x]\s*(\d{2,3})/);
    if (!m) return null;
    return { w: (+m[1]) / 100, h: (+m[2]) / 100 };
  }

  global.EuropaneelZelle3D = { buildSVG, buildKombiSVG, parseDoor };

})(typeof window !== "undefined" ? window : this);
