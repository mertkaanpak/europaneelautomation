const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\mertk\\Desktop\\EuropaneelAutomations';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const additionalStyles = `
    /* mobile-modern */
    :root {
      --border: #e3e7eb;
      --radius-lg: 20px;
      --shadow-soft: 0 8px 20px rgba(15, 23, 42, 0.08);
    }
    body {
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    a, button, input, select { font-family: inherit; }
    button, .btn, .primary-btn, .toggle-btn, .back-link { min-height: 44px; }
    input, select { font-size: 16px; }
    @media (max-width: 720px) {
      .page { padding: 18px 14px 70px; }
      .header { border-left: 0; border-top: 6px solid var(--red); }
      .header img { height: 40px; }
      .header h1 { font-size: clamp(20px, 5vw, 24px); }
      .card { padding: 18px; border-radius: 18px; }
    }`;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('/* mobile-modern */')) {
    let custom = additionalStyles;
    
    if (file === 'index.html') {
      custom += `
    .nav .nav-link, .card, .lang-btn { min-height: 44px; }
    @media (hover: none) {
      .nav .nav-link:hover { transform: none; }
      .card:hover { transform: none; }
    }
    @media (max-width: 900px) {
      body { overflow: auto; }
      .shell { height: auto; min-height: 100vh; }
      .main { overflow: visible; }
      .sidebar { position: sticky; top: 0; z-index: 5; backdrop-filter: blur(10px); }
    }
    @media (max-width: 720px) {
      .hero { border-left: 0; border-top: 6px solid var(--red); }
      .hero-actions { width: 100%; flex-wrap: wrap; }
      .grid { grid-template-columns: 1fr; }
      .card { min-height: auto; }
    }`;
    } else if (file === 'zellenrechner.html') {
      custom += `
    @media (hover: none) {
      .selection-card:hover { transform: none; }
      .btn-calc:hover { transform: none; }
    }
    @media (max-width: 720px) {
      .input-row { grid-template-columns: 1fr; }
      .selection-card { padding: 24px 16px; }
      .config-card { padding: 18px; }
      .status-badge { flex-wrap: wrap; }
      .summary-row { flex-direction: column; align-items: flex-start; gap: 4px; }
    }`;
    } else if (file === 'aggregatauswahl.html') {
      custom += `
    @media (hover: none) {
      .toggle-btn:hover { transform: none; }
    }
    @media (max-width: 720px) {
      .toggle-row { gap: 8px; }
      .toggle-btn { flex: 1 1 100%; text-align: center; }
      .mode-row { flex-direction: column; }
      .mode-row label { width: 100%; }
      .control-grid { grid-template-columns: 1fr; }
      .result-grid { grid-template-columns: 1fr; }
    }`;
    } else if (file === 'paneelrechner.html') {
      custom += `
    @media (hover: none) {
      .btn-primary:hover { transform: none; }
    }
    @media (max-width: 720px) {
      .row-card { grid-template-columns: 1fr; }
      .row-footer { flex-direction: column; align-items: flex-start; }
      .btn-row { flex-direction: column; }
      .btn { width: 100%; }
    }`;
    } else if (file === 'aggregate.html') {
       custom += `
    @media (max-width: 720px) {
      .table-wrap { overflow: visible; }
      table { min-width: 0; }
      thead { display: none; }
      tbody tr {
        display: block;
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 12px;
        margin-bottom: 12px;
        background: #fff;
      }
      tbody td {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 6px 0;
        border: none;
      }
      tbody td::before {
        content: attr(data-label);
        font-weight: 600;
        color: var(--steel);
      }
    }`;
    } else {
      custom += `
    @media (max-width: 720px) {
      .placeholder { padding: 18px; font-size: 15px; }
      .chip { min-height: 32px; }
    }`;
    }

    content = content.replace('</style>', `${custom}  </style>`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
console.log('CSS overrides applied successfully.');