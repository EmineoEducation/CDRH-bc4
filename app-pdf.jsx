// ══════════════════════════════════════════════════════════════
//  PDF APP — générique · piloté par window.LUMIO_DATA.dossiers + .guide
//  Types de dossier : 'deck' | 'rich' | 'guide'
//  Aucune narration hardcodée. PAC · Éminéo
// ══════════════════════════════════════════════════════════════
const { useState: usePdfState } = React;

// ─── Guide de mission (lit D.guide + PAC_CONFIG.competences) ──
function GuideApp() {
  const D = window.LUMIO_DATA || {};
  const cfg = window.PAC_CONFIG || {};
  const guide = D.guide || {};
  const tips = guide.tips || [];
  const comps = cfg.competences || [];
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
  return (
    <div style={G.app}>
      <div style={G.header}>
        <div style={G.eyebrow}>Guide de mission · {cfg.bloc} · {cfg.dispositif || 'PAC'}</div>
        <div style={G.title}>{guide.title || cfg.titre || 'Guide de mission'}</div>
      </div>
      <div style={G.body}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontFamily: 'var(--font-display)', padding: '0 0 4px' }}>
          {guide.intro || "Ce guide est là si tu te sens bloqué. Il ne donne pas les réponses — il indique où chercher."}
        </div>
        {tips.map((t, i) => (
          <div key={i} style={G.section}>
            <div style={G.sectionDay}>{t.day}</div>
            <div style={G.sectionTitle}>{t.title}</div>
            <div style={G.tip}>{t.body}</div>
            {t.action && <div style={G.action}>{t.action}</div>}
          </div>
        ))}
        {comps.length > 0 && (
          <>
            <div style={G.divider} />
            <div style={{ ...G.section, background: 'rgba(27,58,107,0.12)', borderColor: 'rgba(27,58,107,0.25)' }}>
              <div style={{ ...G.sectionDay, color: 'rgba(27,58,107,0.8)' }}>Rappel · Livrable final — {comps[0].code} à {comps[comps.length - 1].code}</div>
              <div style={G.sectionTitle}>Ce que tu dois produire</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {comps.map(c => (
                  <div key={c.code} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 7px', background: 'rgba(27,58,107,0.2)', color: 'rgba(100,150,220,0.9)', borderRadius: 4, flexShrink: 0, marginTop: 2 }}>{c.code}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{c.label}{c.conseil ? ' — ' + c.conseil : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <div style={G.footer}>{guide.footer || 'Ce guide est disponible à tout moment via le bouton ? en bas à gauche du desktop.'}</div>
    </div>
  );
}

// ─── PDF Viewer ───────────────────────────────────────────────
function PdfApp({ openGuide, openDoc }) {
  const D = window.LUMIO_DATA || {};
  const dossiers = (D.dossiers || []).filter(d => d.type !== 'guide');
  const firstId = (dossiers[0] && dossiers[0].id) || '';
  const [activeId, setActiveId] = usePdfState(openDoc || firstId);
  const [page, setPage] = usePdfState(1);

  if (openGuide) return <GuideApp />;
  if (dossiers.length === 0) return <GuideApp />;

  const doc = dossiers.find(d => d.id === activeId) || dossiers[0];
  const totalPages = doc.type === 'deck' ? (doc.slides || []).length : (doc.pages || []).length || 1;
  const switchDoc = (id) => { setActiveId(id); setPage(1); };

  return (
    <div style={pdfStyles.app}>
      <div style={pdfStyles.toolbar}>
        <div style={{ display: 'flex', gap: 4, marginRight: 8 }}>
          {dossiers.map(d => {
            const active = d.id === doc.id;
            const accent = d.accent || '#1b3a6b';
            return (
              <button key={d.id} onClick={() => switchDoc(d.id)}
                style={{ ...pdfStyles.tbBtn, background: active ? (accent + '22') : 'transparent', fontWeight: active ? 700 : 400, color: active ? accent : 'var(--ink-soft)' }}>
                {d.tab || d.title}{d.warning ? ' ⚠' : ''}
              </button>
            );
          })}
        </div>
        <div style={pdfStyles.tbDivider} />
        <div style={pdfStyles.tbGroup}>
          <button style={pdfStyles.tbBtn} onClick={() => setPage(Math.max(1, page - 1))}>‹</button>
          <span style={pdfStyles.pageInd}>{page} / {totalPages}</span>
          <button style={pdfStyles.tbBtn} onClick={() => setPage(Math.min(totalPages, page + 1))}>›</button>
        </div>
        <div style={pdfStyles.tbDivider} />
        <div style={pdfStyles.tbGroup}>
          <button style={pdfStyles.tbBtn}>—</button>
          <span style={{ fontSize: 11, color: 'var(--ink-soft)', minWidth: 36, textAlign: 'center' }}>100 %</span>
          <button style={pdfStyles.tbBtn}>+</button>
        </div>
        <div style={{ flex: 1 }} />
        <button style={pdfStyles.tbBtn}>🔍</button><button style={pdfStyles.tbBtn}>🖨</button><button style={pdfStyles.tbBtn}>↗</button>
      </div>

      <div style={pdfStyles.body}>
        <div style={pdfStyles.thumbCol} className="scroll">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <div key={p} onClick={() => setPage(p)} style={{ ...pdfStyles.thumb, ...(page === p ? pdfStyles.thumbActive : {}) }}>
              <div style={pdfStyles.thumbPage}>
                <div style={{ height: 4, background: doc.accent || '#1b3a6b', width: '70%', margin: '4px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '3px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '2px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '60%', margin: '2px auto' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '85%', margin: '6px auto 2px' }} />
                <div style={{ height: 2, background: '#9a9ea8', width: '50%', margin: '2px auto' }} />
              </div>
              <div style={pdfStyles.thumbLabel}>{p}</div>
            </div>
          ))}
        </div>
        <div style={pdfStyles.pageWrap} className="scroll">
          {doc.type === 'deck' && <DeckPage doc={doc} page={page} />}
          {doc.type === 'rich' && <RichPage doc={doc} page={page} />}
        </div>
      </div>
    </div>
  );
}

// ── Deck (slides) ──────────────────────────────────────────────
function DeckPage({ doc, page }) {
  const slide = (doc.slides || [])[page - 1] || {};
  const accent = doc.accent || '#1b3a6b';
  const isFirst = page === 1;
  return (
    <div style={pdfStyles.page}>
      {isFirst ? (
        <>
          <div style={{ background: accent, margin: '-50px -56px 36px', padding: '36px 56px 28px', color: 'white' }}>
            {doc.confidential && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>{doc.confidential}</div>}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'white', marginBottom: 6, lineHeight: 1.2 }}>{doc.title}</h1>
            {doc.subtitle && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{doc.subtitle}</div>}
            {doc.date && <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{doc.date}</div>}
          </div>
          {doc.intro && <div style={{ background: '#f0f4fa', borderRadius: 6, padding: '14px 18px', marginBottom: 18, fontSize: 12, color: accent, fontFamily: 'var(--font-sans)', lineHeight: 1.6 }}>📋 {doc.intro}</div>}
        </>
      ) : (
        <div style={{ borderBottom: `2px solid ${accent}`, paddingBottom: 10, marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: accent, textTransform: 'uppercase' }}>{doc.runningHead || doc.title}</div>
        </div>
      )}
      <h2 style={{ ...pdfStyles.h2, borderBottomColor: accent, color: accent }}>{slide.titre}</h2>
      <pre style={{ ...pdfStyles.p, fontFamily: 'var(--font-sans)', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{slide.contenu}</pre>
      {slide.callout && (
        <div style={{ marginTop: 24, padding: '12px 16px', background: '#fff8d8', border: '1px solid #c4420f', borderRadius: 4, fontSize: 11.5, color: '#5a3010', lineHeight: 1.6 }}>⚠ {slide.callout}</div>
      )}
      <div style={pdfStyles.pageNum}>— {page} —</div>
    </div>
  );
}

// ── Rich document (pages de blocs) ─────────────────────────────
function RichPage({ doc, page }) {
  const p = (doc.pages || [])[page - 1] || {};
  return (
    <div style={pdfStyles.page}>
      {p.kicker && (
        <div style={{ borderBottom: '2px solid #1a2436', paddingBottom: 14, marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: '#c4420f', textTransform: 'uppercase' }}>{p.kicker}</div>
        </div>
      )}
      {p.title && <h1 style={pdfStyles.title}>{p.title}</h1>}
      {p.byline && <div style={pdfStyles.byline}>{p.byline}</div>}
      {(p.blocks || []).map((b, i) => <Block key={i} b={b} />)}
      <div style={pdfStyles.pageNum}>— {page} —</div>
    </div>
  );
}

function Block({ b }) {
  switch (b.type) {
    case 'h2': return <h2 style={pdfStyles.h2}>{b.text}</h2>;
    case 'h3': return <h3 style={pdfStyles.h3}>{b.text}</h3>;
    case 'p': return <p style={pdfStyles.p} dangerouslySetInnerHTML={{ __html: b.html || b.text }} />;
    case 'ul': return <ul style={pdfStyles.ul}>{(b.items || []).map((it, i) => <li key={i} dangerouslySetInnerHTML={{ __html: it }} />)}</ul>;
    case 'warning': return <div style={{ ...pdfStyles.warningBox, ...(b.tone === 'info' ? { background: '#e8f0e0', borderColor: '#0a7a6e', color: '#1a3a30' } : {}) }} dangerouslySetInnerHTML={{ __html: (b.tone === 'info' ? '💡 ' : '⚠ ') + (b.html || b.text) }} />;
    case 'annotation': return (
      <div style={pdfStyles.handAnnotation}>
        <span style={{ background: '#fff8b0', padding: '2px 6px', display: 'inline-block', transform: 'rotate(-1deg)', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: '#a02020', border: '1px dashed #c4420f' }}>{b.text}</span>
      </div>
    );
    case 'signature': return (
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #ccc', fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#6a6f7a', fontSize: 12 }}>
        {(b.lines || []).map((l, i) => <p key={i} style={{ marginTop: i ? 14 : 0 }} dangerouslySetInnerHTML={{ __html: l }} />)}
      </div>
    );
    case 'table': return (
      <table style={pdfStyles.table}>
        <thead><tr>{(b.headers || []).map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>
          {(b.rows || []).map((row, i) => (
            <tr key={i} style={row._highlight ? { background: '#fff8d8' } : {}}>
              {(row.cells || row).map((cell, j) => <td key={j} dangerouslySetInnerHTML={{ __html: typeof cell === 'object' ? cell.html : cell }} />)}
            </tr>
          ))}
        </tbody>
      </table>
    );
    default: return null;
  }
}

const pdfStyles = {
  app: { display: 'flex', flexDirection: 'column', height: '100%', background: '#e8eaed', overflow: 'hidden' },
  toolbar: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'linear-gradient(180deg, #f4f2ee, #e6e4de)', borderBottom: '1px solid rgba(20,24,36,0.12)', flexShrink: 0 },
  tbGroup: { display: 'flex', alignItems: 'center', gap: 2 },
  tbDivider: { width: 1, height: 18, background: 'rgba(20,24,36,0.12)', margin: '0 6px' },
  tbBtn: { background: 'transparent', border: 'none', padding: '5px 10px', fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer', borderRadius: 4 },
  pageInd: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-soft)', minWidth: 50, textAlign: 'center' },
  body: { flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, background: '#e8eaed' },
  thumbCol: { width: 110, flexShrink: 0, background: '#eceef2', borderRight: '1px solid rgba(20,24,36,0.10)', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' },
  thumb: { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  thumbPage: { width: 80, height: 110, background: 'white', boxShadow: '0 2px 6px rgba(20,24,36,0.18)', padding: 8 },
  thumbActive: {},
  thumbLabel: { fontSize: 10, color: '#5b6473', fontFamily: 'var(--font-mono)' },
  pageWrap: { flex: 1, padding: '28px 40px', overflowY: 'auto', display: 'flex', justifyContent: 'center', background: '#e8eaed' },
  page: { width: '100%', maxWidth: 580, background: 'white', padding: '50px 56px', boxShadow: '0 2px 16px rgba(20,24,36,0.16)', fontFamily: 'Georgia, var(--font-display), serif', minHeight: 720, position: 'relative', borderRadius: 2 },
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

const pdfTableStyle = document.createElement('style');
pdfTableStyle.textContent = `
  body table th { padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #6a6f7a; border-bottom: 1.5px solid #1a2436; background: #f4f2ee; font-weight: 700; }
  body table td { padding: 6px 8px; border-bottom: 1px solid #e8e6e0; vertical-align: top; }
`;
document.head.appendChild(pdfTableStyle);

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.pdf = PdfApp;
