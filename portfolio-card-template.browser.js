// ══════════════════════════════════════════════════════════════
//  ÉMINÉO — portfolio-card-template.browser.js
//  Rendu + capture du portfolio visuel (carte enrichie, 3 pages :
//  couverture / mise en situation / choix & justification).
//
//  Charge html2canvas dynamiquement (aucune balise <script> à
//  ajouter pour la lib), capture chaque page en PNG, retourne les
//  3 images en base64 (sans préfixe data:) prêtes à être envoyées
//  en pièce jointe INLINE (content_id + cid:) via l'API Resend.
//
//  Usage (depuis app-livrable.jsx) :
//    const shots = await window.PACPortfolio.renderAndCapture({
//      blocCode, prenom, nom, missionTitre,
//      miseEnSituation, choix, justification,
//      imageSrc, competences: ['C.1','C.3', ...]
//    });
//    // shots = { cover, situation, choix } — chacun en base64 PNG
//
//  ⚠️ imageSrc cross-origin sans CORS peut faire échouer la capture
//  (canvas "tainted"). Préférer un fichier statique du même repo
//  (même origine) à un base64 pour éviter tout risque.
//
//  Ne modifie rien au DOM visible : tout le rendu se fait hors-écran
//  (position: fixed; left: -10000px) puis est retiré après capture.
// ══════════════════════════════════════════════════════════════

(function () {

  var COLORS = {
    abysse: '#0B2B2D',
    petrole: '#134547',
    menthe: '#5DE298',
    givre: '#E3FFF0',
    saumon: '#E89B77'
  };

  var FONTS_URL = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400;1,500;1,600&family=IBM+Plex+Sans:wght@400;500;600&display=swap';
  var HTML2CANVAS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

  function ensureFontsLoaded() {
    if (!document.querySelector('link[data-pac-portfolio-fonts]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONTS_URL;
      link.setAttribute('data-pac-portfolio-fonts', '1');
      document.head.appendChild(link);
    }
    var specs = [
      'italic 600 34px Fraunces',
      'italic 500 24px Fraunces',
      'italic 500 19px Fraunces',
      '500 13px "IBM Plex Sans"',
      '400 13px "IBM Plex Sans"'
    ];
    return Promise.all(specs.map(function (s) {
      return document.fonts.load(s)['catch'](function () {});
    })).then(function () { return document.fonts.ready; });
  }

  function loadScriptOnce() {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = HTML2CANVAS_URL;
      s.setAttribute('data-pac-h2c', '1');
      s.onload = function () { resolve(window.html2canvas); };
      s.onerror = function () { reject(new Error('html2canvas indisponible (réseau bloqué ?)')); };
      document.head.appendChild(s);
    });
  }

  function ensureHtml2Canvas() {
    if (window.html2canvas) return Promise.resolve(window.html2canvas);
    var existing = document.querySelector('script[data-pac-h2c]');
    if (existing) {
      return new Promise(function (resolve, reject) {
        existing.addEventListener('load', function () { resolve(window.html2canvas); });
        existing.addEventListener('error', function () { reject(new Error('html2canvas indisponible (réseau bloqué ?)')); });
      });
    }
    return loadScriptOnce().catch(function () {
      // Échec CDN souvent transitoire — un seul retry avant d'abandonner.
      var failed = document.querySelector('script[data-pac-h2c]');
      if (failed && failed.parentNode) failed.parentNode.removeChild(failed);
      return loadScriptOnce();
    });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function ring(cls, size, borderPx, color, opacity) {
    return '<span class="pac-ring ' + cls + '" style="width:' + size + 'px;height:' + size + 'px;border:' +
      borderPx + 'px solid ' + color + ';opacity:' + opacity + '"></span>';
  }

  function buildPagesHtml(cfg) {
    var bloc = esc((cfg.blocCode || '').toUpperCase());
    var nomComplet = esc([cfg.prenom, cfg.nom].filter(Boolean).join(' ')) || 'Étudiant·e';
    var missionTitre = esc(cfg.missionTitre || '');
    var miseEnSituation = esc(cfg.miseEnSituation || '');
    var choix = esc(cfg.choix || '');
    var justification = esc(cfg.justification || '');
    var competences = Array.isArray(cfg.competences) ? cfg.competences : [];
    var imageSrc = cfg.imageSrc || '';

    var chips = competences.map(function (c) {
      return '<span class="pac-chip">' + esc(c) + '</span>';
    }).join('');

    var imageBlock = imageSrc
      ? '<div class="pac-sit-image" style="background-image:url(\'' + String(imageSrc).replace(/'/g, '%27') +
        '\');background-size:cover;background-position:center;"><div class="pac-sit-pill">' + bloc + '</div></div>'
      : '<div class="pac-sit-image"><div class="pac-sit-pill">' + bloc + '</div><span>photo de mise en situation</span></div>';

    var cover =
      '<div class="pac-page pac-cover">' +
        ring('cr1', 170, 30, COLORS.menthe, .85) + ring('cr2', 270, 30, COLORS.menthe, .5) +
        ring('cr3', 370, 30, COLORS.givre, .3) + ring('cr4', 470, 30, COLORS.givre, .14) +
        '<div class="pac-content">' +
          '<div class="pac-eyebrow">PAC · ' + bloc + '</div>' +
          '<div class="pac-cover-title">Portfolio de<br>compétences</div>' +
          '<div class="pac-cover-bottom">' +
            '<div class="pac-cover-name">' + nomComplet + '</div>' +
            (missionTitre ? '<div class="pac-cover-sub">' + missionTitre + '</div>' : '') +
            '<div class="pac-dots pac-dots-light"><span class="pac-dot active"></span><span class="pac-dot"></span><span class="pac-dot"></span></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    var situation =
      '<div class="pac-page pac-situation">' +
        ring('sr1', 110, 16, COLORS.saumon, .35) + ring('sr2', 190, 16, COLORS.saumon, .16) +
        '<div class="pac-content">' +
          '<div class="pac-sit-title">Mise en situation</div>' +
          '<div class="pac-sit-rule"></div>' +
          imageBlock +
          (miseEnSituation ? '<div class="pac-sit-body">' + miseEnSituation + '</div>' : '') +
          '<div class="pac-dots pac-dots-dark"><span class="pac-dot"></span><span class="pac-dot active"></span><span class="pac-dot"></span></div>' +
        '</div>' +
      '</div>';

    var choixHtml =
      '<div class="pac-page pac-choix">' +
        ring('xr1', 90, 14, COLORS.menthe, .18) + ring('xr2', 150, 14, COLORS.menthe, .09) +
        '<div class="pac-content">' +
          (choix ? '<div class="pac-choix-block"><div class="pac-choix-title">Choix</div><div class="pac-choix-body">' + choix + '</div></div>' : '') +
          (justification ? '<div class="pac-choix-block"><div class="pac-choix-title">Justification</div><div class="pac-choix-body">' + justification + '</div></div>' : '') +
          (chips ? '<div class="pac-chips">' + chips + '</div>' : '') +
          '<div class="pac-choix-footer">Parcours d\'Acquisition des Compétences · Septembre 2026</div>' +
        '</div>' +
      '</div>';

    return { cover: cover, situation: situation, choix: choixHtml };
  }

  var STYLE = [
    '.pac-portfolio-root { position: fixed; top: 0; left: -10000px; z-index: -1; }',
    '.pac-page { width: 340px; height: 480px; border-radius: 16px; position: relative; overflow: hidden; font-family: "IBM Plex Sans", sans-serif; }',
    '.pac-content { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; padding: 32px 30px; box-sizing: border-box; }',
    '.pac-ring { position: absolute; border-radius: 50%; z-index: 0; }',
    '.pac-cover { background: ' + COLORS.abysse + '; }',
    '.pac-cover .pac-ring { left: 0; bottom: 0; }',
    '.pac-eyebrow { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: ' + COLORS.menthe + '; font-weight: 500; }',
    '.pac-cover-title { font-family: "Fraunces", serif; font-style: italic; font-weight: 600; font-size: 33px; line-height: 1.1; color: ' + COLORS.givre + '; margin-top: 16px; }',
    '.pac-cover-bottom { margin-top: auto; }',
    '.pac-cover-name { font-size: 16px; font-weight: 500; color: ' + COLORS.givre + '; }',
    '.pac-cover-sub { font-size: 13px; color: rgba(227,255,240,.7); margin-top: 4px; }',
    '.pac-situation { background: ' + COLORS.givre + '; }',
    '.pac-situation .pac-ring { right: 0; bottom: 0; }',
    '.pac-sit-title { font-family: "Fraunces", serif; font-style: italic; font-weight: 500; font-size: 23px; color: ' + COLORS.abysse + '; }',
    '.pac-sit-rule { width: 36px; height: 3px; background: ' + COLORS.saumon + '; margin: 10px 0 18px; }',
    '.pac-sit-image { position: relative; height: 160px; border-radius: 10px; background: repeating-linear-gradient(135deg, rgba(11,43,45,.06) 0 10px, rgba(11,43,45,.11) 10px 20px); display: flex; align-items: center; justify-content: center; }',
    '.pac-sit-image span { font-size: 11px; color: rgba(11,43,45,.45); }',
    '.pac-sit-pill { position: absolute; top: 10px; left: 10px; background: ' + COLORS.abysse + '; color: ' + COLORS.givre + '; font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 20px; }',
    '.pac-sit-body { font-size: 13px; line-height: 1.55; margin-top: 18px; color: rgba(11,43,45,.85); }',
    '.pac-choix { background: ' + COLORS.petrole + '; }',
    '.pac-choix .pac-ring { top: 0; right: 0; }',
    '.pac-choix-title { font-family: "Fraunces", serif; font-style: italic; font-weight: 500; font-size: 18px; color: ' + COLORS.menthe + '; }',
    '.pac-choix-body { font-size: 13px; line-height: 1.55; margin-top: 8px; color: rgba(227,255,240,.88); }',
    '.pac-choix-block + .pac-choix-block { margin-top: 22px; }',
    '.pac-chips { display: flex; gap: 8px; margin-top: 24px; flex-wrap: wrap; }',
    '.pac-chip { font-size: 11px; font-weight: 500; padding: 5px 10px; border: 1px solid ' + COLORS.menthe + '; color: ' + COLORS.menthe + '; border-radius: 20px; }',
    '.pac-choix-footer { margin-top: auto; padding-top: 18px; text-align: center; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: rgba(227,255,240,.55); }',
    '.pac-dots { display: flex; gap: 6px; margin-top: 16px; }',
    '.pac-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: .3; }',
    '.pac-dot.active { opacity: 1; }',
    '.pac-dots-light { color: ' + COLORS.givre + '; }',
    '.pac-dots-dark { color: ' + COLORS.abysse + '; }'
  ].join('\n');

  function ensureStyle() {
    if (document.getElementById('pac-portfolio-style')) return;
    var style = document.createElement('style');
    style.id = 'pac-portfolio-style';
    style.textContent = STYLE;
    document.head.appendChild(style);
  }

  function toBase64(canvas) {
    return canvas.toDataURL('image/png').split(',')[1];
  }

  function renderAndCapture(cfg) {
    cfg = cfg || {};
    ensureStyle();
    return Promise.all([ensureFontsLoaded(), ensureHtml2Canvas()]).then(function () {
      var pages = buildPagesHtml(cfg);
      var root = document.createElement('div');
      root.className = 'pac-portfolio-root';
      root.innerHTML = pages.cover + pages.situation + pages.choix;
      document.body.appendChild(root);

      var nodes = root.querySelectorAll('.pac-page');
      var keys = ['cover', 'situation', 'choix'];
      var shots = {};

      var chain = Promise.resolve();
      keys.forEach(function (key, i) {
        chain = chain.then(function () {
          return window.html2canvas(nodes[i], { scale: 2, backgroundColor: null, useCORS: true });
        }).then(function (canvas) {
          shots[key] = toBase64(canvas);
        });
      });

      return chain.then(function () {
        document.body.removeChild(root);
        return shots;
      })['catch'](function (err) {
        document.body.removeChild(root);
        throw err;
      });
    });
  }

  window.PACPortfolio = { renderAndCapture: renderAndCapture };

})();
