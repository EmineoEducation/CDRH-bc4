// ══════════════════════════════════════════════════════════════
//  app-trash.jsx — Corbeille · Easter Egg (générique)
//  Piloté par window.LUMIO_DATA.trash : { items[], egg{contact,status,badge,messages[]} }
//  Si pas d'egg en data → simple corbeille vide. Aucune narration hardcodée.
//  Charge APRÈS app-extras → ce TrashApp (riche) remplace le stub. PAC · Éminéo
// ══════════════════════════════════════════════════════════════

function WhatsAppOverlay({ onClose, egg }) {
  const endRef = React.useRef(null);
  React.useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' }); }, []);
  const MESSAGES_WA = egg.messages || [];
  const meKey = egg.meKey || 'me';
  const initials = (egg.contact || '').split(/[ —-]/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
      <div style={{ width: 380, maxWidth: '92vw', height: 620, maxHeight: '88vh', background: '#0b141a', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(0,0,0,.6)', border: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ background: '#1f2c34', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,.05)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#25d366', fontSize: 22, padding: 0, lineHeight: 1, paddingRight: 2 }}>‹</button>
          <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #1e4d35, #0d2e1f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#7ecfa0' }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{egg.contact}</div>
            <div style={{ fontSize: 11, color: '#25d366', marginTop: 1 }}>{egg.status || 'en ligne'}</div>
          </div>
          <div style={{ display: 'flex', gap: 16, color: 'rgba(255,255,255,.4)', fontSize: 18 }}><span>📞</span><span>⋮</span></div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#0b141a', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ textAlign: 'center', margin: '4px 0 10px' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.07)', padding: '3px 10px', borderRadius: 10 }}>aujourd'hui</span>
          </div>
          {MESSAGES_WA.map((msg, i) => {
            const isMe = msg.from === meKey;
            const next = i < MESSAGES_WA.length - 1 && MESSAGES_WA[i + 1].from === msg.from;
            const prev = i > 0 && MESSAGES_WA[i - 1].from === msg.from;
            return (
              <div key={msg.id || i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: next ? 1 : 5, marginTop: !prev && i > 1 ? 8 : 0 }}>
                <div style={{ maxWidth: '76%', background: isMe ? '#005c4b' : '#202c33', borderRadius: isMe ? `14px 3px ${next ? '3px' : '14px'} 14px` : `3px 14px 14px ${next ? '3px' : '14px'}`, padding: '6px 9px 4px' }}>
                  <p style={{ fontSize: 13, color: '#e9edef', lineHeight: 1.5, margin: 0, wordBreak: 'break-word' }}>{msg.text}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{msg.time}</span>
                    {isMe && (
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5l3 3.5L9 2" stroke="#53bdeb" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 5l3 3.5 5-6.5" stroke="#53bdeb" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div style={{ background: '#161616', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid rgba(255,255,255,.05)', flexShrink: 0 }}>
          <div style={{ fontSize: 20, color: 'rgba(255,255,255,.25)' }}>☺</div>
          <div style={{ flex: 1, background: '#2a2f32', borderRadius: 20, padding: '8px 14px', fontSize: 13, color: 'rgba(255,255,255,.2)' }}>Message</div>
          <div style={{ fontSize: 20, color: 'rgba(255,255,255,.25)' }}>📎</div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M2 12l19-9-8 19-3-8z" /></svg>
          </div>
        </div>
        <div style={{ background: '#111', padding: '6px 0 8px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ width: 100, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.18)', margin: '0 auto' }} />
        </div>
      </div>
      {egg.badge && (
        <div style={{ position: 'fixed', top: '7%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '5px 14px', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '.12em', textTransform: 'uppercase', whiteSpace: 'nowrap', pointerEvents: 'none' }}>{egg.badge}</div>
      )}
    </div>
  );
}

function TrashApp() {
  const D = window.LUMIO_DATA || {};
  const T = D.trash || {};
  const egg = T.egg || null;
  const trashItems = T.items || [
    { name: 'draft_v1.docx', icon: '📄', size: '18 Ko', date: '3 sept.', isEgg: false },
    { name: 'ancien_logo_test.png', icon: '🖼', size: '224 Ko', date: '28 août', isEgg: false }
  ];
  const [showWhatsApp, setShowWhatsApp] = React.useState(false);
  const [hoverFile, setHoverFile] = React.useState(false);
  const [selected, setSelected] = React.useState(false);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f5f3ef', fontFamily: "-apple-system, 'Helvetica Neue', sans-serif" }}>
      <div style={{ background: 'linear-gradient(180deg, #e8e4de 0%, #ddd9d2 100%)', borderBottom: '1px solid rgba(20,24,36,.12)', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {['⬛', '☰', '⊞', '🗂'].map((ic, i) => <button key={i} style={{ background: i === 0 ? 'rgba(20,24,36,.12)' : 'transparent', border: 'none', borderRadius: 4, padding: '4px 7px', fontSize: 12, cursor: 'default', color: 'var(--ink-soft)' }}>{ic}</button>)}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ background: 'rgba(20,24,36,.08)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center', gap: 4 }}><span>🔍</span> <span>Rechercher</span></div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ width: 150, flexShrink: 0, background: 'rgba(236,233,226,.7)', borderRight: '1px solid rgba(20,24,36,.1)', padding: '10px 0', fontSize: 11, color: 'var(--ink-soft)' }}>
          {[{ icon: '💻', label: 'MacBook' }, { icon: '📁', label: 'Documents' }, { icon: '⬇️', label: 'Téléchargements' }, { icon: '🗑', label: 'Corbeille', active: true }].map((it, i) => (
            <div key={i} style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 7, background: it.active ? 'rgba(20,24,36,.09)' : 'transparent', borderRadius: 6, margin: '0 4px', fontWeight: it.active ? 600 : 400, color: it.active ? 'var(--ink)' : 'var(--ink-soft)', cursor: 'default' }}>
              <span style={{ fontSize: 13 }}>{it.icon}</span>{it.label}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, padding: '12px 16px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(20,24,36,.08)' }}>
            <span style={{ fontSize: 22 }}>🗑</span>
            <div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Corbeille</div><div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{trashItems.length} éléments</div></div>
            <div style={{ flex: 1 }} />
            <button style={{ background: 'rgba(20,24,36,.08)', border: '1px solid rgba(20,24,36,.12)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: 'var(--ink-soft)', cursor: 'default' }}>Vider la corbeille</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px', padding: '2px 8px 6px', fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '.06em', textTransform: 'uppercase', borderBottom: '1px solid rgba(20,24,36,.06)' }}>
            <span>Nom</span><span>Taille</span><span>Supprimé</span>
          </div>
          {trashItems.map((item, i) => (
            <div key={i}
              onClick={() => item.isEgg && egg && setSelected(true)}
              onDoubleClick={() => item.isEgg && egg && setShowWhatsApp(true)}
              onMouseEnter={() => item.isEgg && egg && setHoverFile(true)}
              onMouseLeave={() => item.isEgg && egg && setHoverFile(false)}
              style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px', padding: '6px 8px', borderRadius: 5, background: item.isEgg && selected ? 'rgba(0,104,181,.15)' : item.isEgg && hoverFile ? 'rgba(20,24,36,.05)' : 'transparent', cursor: 'default', borderBottom: i < trashItems.length - 1 ? '1px solid rgba(20,24,36,.04)' : 'none', transition: 'background .1s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: item.isEgg ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: item.isEgg ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center' }}>{item.size}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center' }}>{item.date}</span>
            </div>
          ))}
          {hoverFile && egg && <div style={{ marginTop: 16, fontSize: 10, color: 'rgba(20,24,36,.28)', textAlign: 'center', letterSpacing: '.04em' }}>Double-clic pour ouvrir</div>}
        </div>
      </div>

      {showWhatsApp && egg && <WhatsAppOverlay onClose={() => setShowWhatsApp(false)} egg={egg} />}
    </div>
  );
}

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.trash = TrashApp;
