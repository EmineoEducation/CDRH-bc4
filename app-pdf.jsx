// ─── Guide de mission ────────────────────────────────────────
function GuideApp() {
  const G = {
    app: { display: 'flex', flexDirection: 'column', height: '100%', background: '#1a2436', overflow: 'hidden' },
    header: { padding: '20px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 },
    eyebrow: { fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(196,66,15,0.8)', marginBottom: 6 },
    title: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'rgba(255,255,255,0.92)', lineHeight: 1.2 },
    body: { flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 },
    section: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '16px 20px' },
    sectionDay: { fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(196,66,15,0.7)', marginBottom: 8 },
    sectionTitle: { fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.88)', marginBottom: 8 },
    tip: { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, fontFamily: 'var(--font-display)', fontStyle: 'italic' },
    action: { marginTop: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 5, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' },
    divider: { height: 1, background: 'rgba(255,255,255,0.06)' },
    footer: { padding: '12px 28px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)', flexShrink: 0 }
  };

  const tips = [
    {
      day: 'J−4 · Entrée dans la mission',
      title: 'Par où commencer ?',
      body: 'Théo Marczak t\'a écrit ce matin à 07h19. Sa lettre de mission est dans Mail. Lis-la en premier — c\'est là que la mission commence. Puis ouvre l\'email confidentiel de Jakob Rein.',
      action: '→ Mail → Email de mission — Théo Marczak'
    },
    {
      day: 'J−3 · Après lecture des emails',
      title: 'Croiser les sources',
      body: 'Tu vas trouver des contradictions. 4,1 % de churn dans le deck board vs 9 % selon Camille. "230 entreprises clientes" sur le site vs 180 références actives dans les vrais chiffres. La MDR "en cours selon calendrier prévu" dans le deck — et un 3e avis de non-conformité TÜV dans la note de Théo. C\'est le cœur du travail.',
      action: '→ Aperçu → Deck Board Q3 / → Notes → Note interne Théo (CONFIDENTIEL)'
    },
    {
      day: 'J−2 · Passer à l\'action',
      title: 'Jakob attend une hypothèse',
      body: 'Tu n\'as pas besoin d\'avoir tout compris pour écrire à Jakob. Envoie-lui ta première lecture — même partielle. Il répondra en testant chaque point. C\'est comme ça qu\'on avance. Sonia et Camille sont aussi disponibles en DM.',
      action: '→ Slack → DM Jakob Rein'
    },
    {
      day: 'J−1 · Finaliser',
      title: 'Rédiger la recommandation',
      body: 'L\'app Livrable t\'attend dans le dock (icône verte). Tu dois couvrir C.7 à C.12. Ce n\'est pas un résumé de documents — c\'est une prise de position professionnelle avec objectifs SMART, cibles, axes, canaux, évaluation de scénarios et projection budgétaire. Jakob doit pouvoir défendre ce document face à un investisseur.',
      action: '→ Dock → Livrable (icône verte avec coche)'
    },
    {
      day: 'En cas de blocage',
      title: 'Ce que tu cherches est dans ces apps',
      body: 'Si tu tournes en rond, ouvre le Finder → Mission Lumio. Tous les documents sont là. Si tu ne sais pas quoi recommander, commence par écrire : "Le scénario que je recommande est… parce que…" et force-toi à compléter.',
      action: '→ Finder → Mission Lumio'
    }
  ];

  return (
    <div style={G.app}>
      <div style={G.header}>
        <div style={G.eyebrow}>Guide de mission · BC2 · PAC</div>
        <div style={G.title}>Lumio Health — Board Northgate</div>
      </div>
      <div style={G.body}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontFamily: 'var(--font-display)', padding: '0 0 4px' }}>
          Ce guide est là si tu te sens bloqué. Il ne donne pas les réponses — il indique où chercher.
        </div>
        {tips.map((t, i) => (
          <div key={i} style={G.section}>
            <div style={G.sectionDay}>{t.day}</div>
            <div style={G.sectionTitle}>{t.title}</div>
            <div style={G.tip}>{t.body}</div>
            <div style={G.action}>{t.action}</div>
          </div>
        ))}
        <div style={G.divider} />
        <div style={{ ...G.section, background: 'rgba(27,58,107,0.12)', borderColor: 'rgba(27,58,107,0.25)' }}>
          <div style={{ ...G.sectionDay, color: 'rgba(27,58,107,0.8)' }}>Rappel · Livrable final — C.7 à C.12</div>
          <div style={G.sectionTitle}>Ce que tu dois produire</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {[
              ['C.7', 'Objectifs SMART — qualitatifs et quantitatifs, datés, mesurables. Notoriété, leads, CA, délais.'],
              ['C.8', 'Cibles & segmentation — cœur de cible caractérisé (descriptif, comportemental, affinitaire), cibles secondaires hiérarchisées.'],
              ['C.9', 'Axes de communication — proposition de valeur, engagements RSE, adéquation aux cibles.'],
              ['C.10', 'Canaux omnicanal — justifiés par les usages cibles, mix B2B / B2C si scénario hybride.'],
              ['C.11', 'Évaluation des scénarios — au moins 2 scénarios comparés avec ROI estimé. Recommandation argumentée. Gabarit disponible.'],
              ['C.12', 'Budget — projection chiffrée, postes de coûts, position explicite sur la tension 200K€/380K€.'],
            ].map(([badge, desc]) => (
              <div key={badge} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 7px', background: 'rgba(27,58,107,0.2)', color: 'rgba(100,150,220,0.9)', borderRadius: 4, flexShrink: 0, marginTop: 2 }}>{badge}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={G.footer}>Ce guide est disponible à tout moment via le bouton ? en bas à gauche du desktop.</div>
    </div>
  );
}

// ─── PDF Viewer ───────────────────────────────────────────────
const { useState: usePdfState } = React;

function PdfApp({ openGuide }) {
  const D = window.LUMIO_DATA;
  const [activeDoc, setActiveDoc] = usePdfState('deck'); // 'deck' | 'veille'
  const [page, setPage] = usePdfState(1);

  if (openGuide) return <GuideApp />;

  const deckPages = 5;
  const veillePages = 4;
  const totalPages = activeDoc === 'deck' ? deckPages : veillePages;

  const switchDoc = (doc) => { setActiveDoc(doc); setPage(1); };

  return (
    <div style={pdfStyles.app}>
      <div style={pdfStyles.toolbar}>
        {/* Sélecteur de document */}
        <div style={{ display: 'flex', gap: 4, marginRight: 8 }}>
          <button
            onClick={() => switchDoc('deck')}
            style={{ ...pdfStyles.tbBtn, background: activeDoc === 'deck' ? 'rgba(27,58,107,0.15)' : 'transparent', fontWeight: activeDoc === 'deck' ? 700 : 400, color: activeDoc === 'deck' ? '#1b3a6b' : 'var(--ink-soft)' }}>
            Deck Board Q3
          </button>
          <button
            onClick={() => switchDoc('veille')}
            style={{ ...pdfStyles.tbBtn, background: activeDoc === 'veille' ? 'rgba(196,66,15,0.12)' : 'transparent', fontWeight: activeDoc === 'veille' ? 700 : 400, color: activeDoc === 'veille' ? '#c4420f' : 'var(--ink-soft)' }}>
            Veille Yassine ⚠
          </button>
        </div>
        <div style={pdfStyles.tbDivider} />
        <div style={pdfStyles.tbGroup}>
          <button style={pdfStyles.tbBtn} onClick={() => setPage(Math.max(1, page-1))}>‹</button>
          <span style={pdfStyles.pageInd}>{page} / {totalPages}</span>
          <button style={pdfStyles.tbBtn} onClick={() => setPage(Math.min(totalPages, page+1))}>›</button>
        </div>
        <div style={pdfStyles.tbDivider} />
        <div style={pdfStyles.tbGroup}>
          <button style={pdfStyles.tbBtn}>—</button>
          <span style={{ fontSize: 11, color: 'var(--ink-soft)', minWidth: 36, textAlign: 'center' }}>100 %</span>
          <button style={pdfStyles.tbBtn}>+</button>
        </div>
        <div style={{ flex: 1 }} />
        <button style={pdfStyles.tbBtn}>🔍</button>
        <button style={pdfStyles.tbBtn}>🖨</button>
        <button style={pdfStyles.tbBtn}>↗</button>
      </div>

      <div style={pdfStyles.body}>
        <div style={pdfStyles.thumbCol} className="scroll">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <div key={p} onClick={() => setPage(p)}
              style={{ ...pdfStyles.thumb, ...(page===p ? pdfStyles.thumbActive : {}) }}>
              <div style={pdfStyles.thumbPage}>
                <div style={{ height: 4, background: activeDoc === 'deck' ? '#1b3a6b' : '#1a2436', width: '70%', margin: '4px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '3px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '2px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '60%', margin: '2px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '6px auto 2px' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '2px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '50%', margin: '2px auto' }} />
              </div>
              <div style={pdfStyles.thumbLabel}>{p}</div>
            </div>
          ))}
        </div>

        <div style={pdfStyles.pageWrap} className="scroll">
          {activeDoc === 'deck' && <DeckBoardPage page={page} deck={D.deckBoard} />}
          {activeDoc === 'veille' && <VeillePage page={page} r={D.yassineVeille} />}
        </div>
      </div>
    </div>
  );
}

// ── Deck Board Q3 ──────────────────────────────────────────────
function DeckBoardPage({ page, deck }) {
  const slide = deck.slides[page - 1];
  const isFirst = page === 1;
  return (
    <div style={pdfStyles.page}>
      {isFirst ? (
        <>
          <div style={{ background: '#1b3a6b', margin: '-50px -56px 36px', padding: '36px 56px 28px', color: 'white' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Confidentiel — Northgate Capital</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'white', marginBottom: 6, lineHeight: 1.2 }}>{deck.title}</h1>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{deck.subtitle}</div>
            <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{deck.date}</div>
          </div>
          <div style={{ background: '#f0f4fa', borderRadius: 6, padding: '14px 18px', marginBottom: 18, fontSize: 12, color: '#1b3a6b', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>
            📋 Ce deck est la version transmise à Northgate Capital pour la revue trimestrielle. Il contient les chiffres présentés par Sonia Ferracci — pas nécessairement les chiffres réels de terrain.
          </div>
        </>
      ) : (
        <div style={{ borderBottom: '2px solid #1b3a6b', paddingBottom: 10, marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: '#1b3a6b', textTransform: 'uppercase' }}>Lumio Health · Board Q3 2026 · Confidentiel</div>
        </div>
      )}
      <h2 style={{ ...pdfStyles.h2, borderBottomColor: '#1b3a6b', color: '#1b3a6b' }}>{slide?.titre}</h2>
      <pre style={{ ...pdfStyles.p, fontFamily: 'var(--font-sans)', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
        {slide?.contenu}
      </pre>
      {page === 5 && (
        <div style={{ marginTop: 24, padding: '12px 16px', background: '#fff8d8', border: '1px solid #c4420f', borderRadius: 4, fontSize: 11.5, color: '#5a3010', lineHeight: 1.6 }}>
          ⚠ <strong>Note :</strong> L'écart budgétaire de 180 000 € entre le plafond Théo (200K€) et le budget Sonia (380K€) n'est pas résolu dans ce document. C'est à vous de le traiter.
        </div>
      )}
      <div style={pdfStyles.pageNum}>— {page} —</div>
    </div>
  );
}

// ── Veille Yassine ────────────────────────────────────────────
function VeillePage({ page, r }) {
  return (
    <div style={pdfStyles.page}>
      {page === 1 && <VeillePage1 r={r} />}
      {page === 2 && <VeillePage2 r={r} />}
      {page === 3 && <VeillePage3 r={r} />}
      {page === 4 && <VeillePage4 r={r} />}
    </div>
  );
}

const VeillePage1 = ({ r }) => (
  <>
    <div style={{ borderBottom: '2px solid #1a2436', paddingBottom: 14, marginBottom: 24 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: '#c4420f', textTransform: 'uppercase' }}>Note interne · Mars 2026 · ⚠ Document périmé</div>
    </div>
    <h1 style={pdfStyles.title}>{r.title}</h1>
    <div style={pdfStyles.byline}>{r.author} · {r.date}</div>
    <div style={pdfStyles.warningBox}>
      ⚠ <strong>{r.date}</strong> — Ce document date de mars 2026. Plusieurs informations ont évolué depuis (Neuroflow certifié MDR IIa, appel d'offres mutuelles, 3e avis TÜV). À croiser avec les sources récentes.
    </div>
    <h2 style={pdfStyles.h2}>Introduction</h2>
    <p style={pdfStyles.p}>Le marché mondial des wearables santé dépasse <strong>95 Md$</strong> en 2025 et croît à <strong>+18 %/an</strong>. Trois forces structurent le secteur : la pression réglementaire MDR, l'intégration par les géants tech, et l'émergence de spécialistes verticaux sur des indications précises (stress, sommeil, glycémie).</p>
    <p style={pdfStyles.p}>Lumio Health se positionne sur le stress chronique en milieu professionnel, approche B2B-DRH. Ce rapport recense les acteurs concurrents au <strong>1er mars 2026</strong>.</p>
    <div style={pdfStyles.pageNum}>— 1 —</div>
  </>
);

const VeillePage2 = ({ r }) => (
  <>
    <h2 style={pdfStyles.h2}>I. Cartographie concurrentielle</h2>
    <table style={pdfStyles.table}>
      <thead>
        <tr><th>Acteur</th><th>Produit</th><th>Certif. MDR</th><th>Prix B2B</th><th>Funding</th></tr>
      </thead>
      <tbody>
        {r.competitors.map((c, i) => (
          <tr key={i} style={c.name === 'Lumio Health' ? { background: '#fff8d8' } : {}}>
            <td><strong>{c.name}</strong></td>
            <td>{c.product}</td>
            <td style={c.mdr.includes('IIa') ? { color: '#0a7a6e', fontWeight: 600 } : (c.mdr.includes('cours') ? { color: '#c4420f' } : {})}>{c.mdr}</td>
            <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{c.priceB2B}</td>
            <td style={{ fontSize: 11 }}>{c.funding}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div style={pdfStyles.handAnnotation}>
      <span style={{ background: '#fff8b0', padding: '2px 6px', display: 'inline-block', transform: 'rotate(-1deg)', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: '#a02020', border: '1px dashed #c4420f' }}>
        ↑ Yassine : « 230 ou 180 clients actifs ? À clarifier avec Camille »
      </span>
    </div>
    <h2 style={pdfStyles.h2}>II. Signaux MDR (mars 2026)</h2>
    <p style={pdfStyles.p}><strong>73 %</strong> des DRH interrogés à Préventica citent la certification MDR comme critère d'achat n°1. Citation récurrente : « Sans certif, je peux pas justifier l'achat à mon comité d'éthique. »</p>
    <p style={pdfStyles.p}>La certification devient un <em>signal de crédibilité</em> — pas seulement une obligation légale. <strong>58 % des DRH</strong> l'utilisent comme proxy de qualité scientifique.</p>
    <div style={pdfStyles.pageNum}>— 2 —</div>
  </>
);

const VeillePage3 = ({ r }) => (
  <>
    <h2 style={pdfStyles.h2}>III. Tendances identifiées (mars 2026)</h2>
    <ul style={pdfStyles.ul}>
      <li>La certification MDR devient critère d'achat n°1 en B2B institutionnel</li>
      <li>Le marché B2C "médical-grade" est encore peu occupé</li>
      <li>Les mutuelles cherchent des partenaires wearables pour offres prévention</li>
      <li>L'IA générative commence à entrer dans les algorithmes de stress (signal faible)</li>
    </ul>
    <h2 style={pdfStyles.h2}>IV. Lacunes non couvertes</h2>
    <ul style={pdfStyles.ul}>
      <li>Statut exact MDR Lumio — <em>Théo n'a pas répondu à mes sollicitations</em></li>
      <li>Suite levée Biostream et plan B2C — info mars 2026 seulement</li>
      <li>Confirmation partenariat Apple / Malakoff Humanis — non confirmée</li>
      <li>Prix Neuroflow post-lancement Fnac — non communiqué</li>
    </ul>
    <div style={{ ...pdfStyles.warningBox, background: '#e8f0e0', borderColor: '#0a7a6e', color: '#1a3a30' }}>
      💡 <strong>Note Yassine :</strong> J'ai relancé Camille trois fois pour l'étude qualitative B2B. Réponse type : « j'envoie ce soir ». Jamais reçu. À creuser.
    </div>
    <div style={pdfStyles.pageNum}>— 3 —</div>
  </>
);

const VeillePage4 = ({ r }) => (
  <>
    <h2 style={pdfStyles.h2}>V. Ce que ce document ne sait pas</h2>
    <p style={pdfStyles.p}>Depuis la rédaction de ce document (mars 2026), plusieurs éléments ont évolué de façon significative :</p>
    <ul style={pdfStyles.ul}>
      <li><strong>Neuroflow</strong> a obtenu sa certification MDR IIa en mars 2026 — non intégré ici</li>
      <li>Un appel d'offres mutuelles (45 M€, MDR obligatoire) a été lancé — signal fort B2B non anticipé</li>
      <li>TÜV Rheinland a émis un 3e avis de non-conformité sur le dossier clinique Lumio (septembre 2026)</li>
    </ul>
    <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #ccc', fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#6a6f7a', fontSize: 12 }}>
      <p>Je termine avec le sentiment de n'avoir vu qu'une partie du sujet — beaucoup de questions sont restées sans réponse, faute d'accès à l'information.</p>
      <p style={{ marginTop: 14 }}>Yassine Morel<br/>Stagiaire Marketing — Lumio Health · 12 mai 2026</p>
    </div>
    <div style={pdfStyles.pageNum}>— 4 —</div>
  </>
);

const pdfStyles = {
  app: { display: 'flex', flexDirection: 'column', height: '100%', background: '#3a3f4a', overflow: 'hidden' },
  toolbar: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px',
    background: 'linear-gradient(180deg, #f0eee8, #e0ded8)',
    borderBottom: '1px solid rgba(0,0,0,0.15)',
    flexShrink: 0
  },
  tbGroup: { display: 'flex', alignItems: 'center', gap: 2 },
  tbDivider: { width: 1, height: 18, background: 'rgba(0,0,0,0.15)', margin: '0 6px' },
  tbBtn: { background: 'transparent', border: 'none', padding: '5px 10px', fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer', borderRadius: 4 },
  pageInd: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)', minWidth: 50, textAlign: 'center' },

  body: { flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 },
  thumbCol: {
    width: 110, flexShrink: 0,
    background: '#2a2e36',
    padding: '12px 8px',
    display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'
  },
  thumb: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  thumbPage: { width: 80, height: 110, background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', padding: 8 },
  thumbActive: { },
  thumbLabel: { fontSize: 10, color: '#9a9ea8', fontFamily: 'var(--font-mono)' },

  pageWrap: {
    flex: 1, padding: '28px 40px', overflowY: 'auto',
    display: 'flex', justifyContent: 'center'
  },
  page: {
    width: '100%', maxWidth: 580,
    background: 'white', padding: '50px 56px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    fontFamily: 'Georgia, var(--font-display), serif',
    minHeight: 720,
    position: 'relative'
  },
  title: { fontSize: 22, fontWeight: 700, color: '#1a2436', marginBottom: 8, lineHeight: 1.2 },
  byline: { fontSize: 12, color: '#6a6f7a', marginBottom: 24, fontStyle: 'italic' },
  h2: { fontSize: 16, fontWeight: 700, color: '#1a2436', marginTop: 24, marginBottom: 10, paddingBottom: 4, borderBottom: '1px solid #ccc' },
  h3: { fontSize: 13, fontWeight: 700, color: '#3a3f4a', marginTop: 14, marginBottom: 6 },
  p: { fontSize: 12.5, lineHeight: 1.7, color: '#1a2436', marginBottom: 10 },
  ul: { fontSize: 12.5, lineHeight: 1.7, color: '#1a2436', marginLeft: 20, marginBottom: 14 },
  table: { width: '100%', fontSize: 11, borderCollapse: 'collapse', marginBottom: 14, fontFamily: 'var(--font-sans)' },
  warningBox: { background: '#fff8d8', border: '1px solid #c4420f', padding: '10px 14px', fontSize: 12, lineHeight: 1.5, marginBottom: 16, fontFamily: 'var(--font-sans)', color: '#5a3010' },
  handAnnotation: { textAlign: 'right', margin: '4px 0 16px' },
  pageNum: { position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9a9ea8' }
};

// Add table cell styling
const pdfTableStyle = document.createElement('style');
pdfTableStyle.textContent = `
  .${'pdf-table-fix'} {}
  body table th { padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #6a6f7a; border-bottom: 1.5px solid #1a2436; background: #f4f2ee; font-weight: 700; }
  body table td { padding: 6px 8px; border-bottom: 1px solid #e8e6e0; vertical-align: top; }
`;
document.head.appendChild(pdfTableStyle);

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.pdf = PdfApp;
