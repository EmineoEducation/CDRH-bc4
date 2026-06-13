// ══════════════════════════════════════════════════════════════
//  app-trash.jsx — Corbeille · Easter Egg WhatsApp
// ══════════════════════════════════════════════════════════════

const MESSAGES_WA = [
  { id: 1, from: 'them', time: '08h14', text: "Salut Théo. J'ai vu la sortie de presse Withings ce matin. Tu l'as vue ?" },
  { id: 2, from: 'theo', time: '08h31', text: "Oui. Je suis en réunion là." },
  { id: 3, from: 'them', time: '08h32', text: "Ils annoncent la classe IIa pour la ScanWatch 3 dès janvier. Avec remboursement partiel CPAM en vue. C'est plus juste un argument marketing." },
  { id: 4, from: 'them', time: '08h33', text: "Vous en êtes où sur votre dossier ?" },
  { id: 5, from: 'theo', time: '09h02', text: "Je ne peux pas en parler ici." },
  { id: 6, from: 'them', time: '09h03', text: "Je comprends. Mais si le fonds a mis la pression pour accélérer le go-to-market grand public... vous allez avoir un problème de positionnement très vite." },
  { id: 7, from: 'them', time: '09h04', text: "Un dispositif sans certification qui prétend concurrencer un MDR IIa certifié, ça ne tient pas face aux DRH." },
  { id: 8, from: 'theo', time: '09h17', text: "Je sais." },
  { id: 9, from: 'theo', time: '09h18', text: "On en parle demain ?" },
  { id: 10, from: 'them', time: '09h19', text: "Appelle-moi. Et Théo — si Sonia veut lancer la campagne grand public avant la certification, il faut que tu poses un véto formel. Pas juste en réunion." },
  { id: 11, from: 'them', time: '09h19', text: "C'est ton nom qui est sur la marque, pas le sien." },
];

function WhatsAppOverlay({ onClose }) {
  const endRef = React.useRef(null);
  React.useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999,
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif"
    }} onClick={onClose}>
      {/* Phone shell */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 360, maxHeight: '84vh',
          display: 'flex', flexDirection: 'column',
          background: '#111',
          borderRadius: 44,
          overflow: 'hidden',
          boxShadow: '0 48px 96px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,.07)'
        }}
      >
        {/* Status bar */}
        <div style={{
          background: '#161616', padding: '14px 24px 6px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.8)',
          flexShrink: 0
        }}>
          <span>9:19</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Signal */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              {[0,1,2,3].map((i) => (
                <rect key={i} x={i*4} y={12-(i+1)*3} width="3" height={(i+1)*3} rx="1"
                  fill={i < 3 ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.25)'} />
              ))}
            </svg>
            {/* WiFi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill="rgba(255,255,255,.8)"/>
              <path d="M3.5 6.5C5 5 6.4 4.2 8 4.2s3 .8 4.5 2.3" stroke="rgba(255,255,255,.8)" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
              <path d="M1 4C3.2 1.8 5.5.8 8 .8s4.8 1 7 3.2" stroke="rgba(255,255,255,.35)" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
            </svg>
            {/* Battery */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div style={{ width: 24, height: 12, borderRadius: 3, border: '1px solid rgba(255,255,255,.4)', padding: 1, display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '72%', height: '100%', background: '#4cd964', borderRadius: 1 }} />
              </div>
              <div style={{ width: 2, height: 5, background: 'rgba(255,255,255,.4)', borderRadius: '0 1px 1px 0' }} />
            </div>
          </div>
        </div>

        {/* WhatsApp header */}
        <div style={{
          background: '#161616', padding: '6px 14px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid rgba(255,255,255,.05)',
          flexShrink: 0
        }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#25d366', fontSize: 22, padding: 0, lineHeight: 1, paddingRight: 2
          }}>‹</button>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #1e4d35, #0d2e1f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#7ecfa0'
          }}>JR</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Julien Roux — MDR Conseil
            </div>
            <div style={{ fontSize: 11, color: '#25d366', marginTop: 1 }}>vu il y a 2h</div>
          </div>
          <div style={{ display: 'flex', gap: 16, color: 'rgba(255,255,255,.4)', fontSize: 18 }}>
            <span>📞</span>
            <span>⋮</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          background: '#0b141a',
          padding: '12px 10px',
          display: 'flex', flexDirection: 'column', gap: 2
        }}>
          {/* Date */}
          <div style={{ textAlign: 'center', margin: '4px 0 10px' }}>
            <span style={{
              fontSize: 11, color: 'rgba(255,255,255,.4)',
              background: 'rgba(255,255,255,.07)',
              padding: '3px 10px', borderRadius: 10
            }}>aujourd'hui</span>
          </div>

          {MESSAGES_WA.map((msg, i) => {
            const isTheo = msg.from === 'theo';
            const prev = i > 0 && MESSAGES_WA[i-1].from === msg.from;
            const next = i < MESSAGES_WA.length-1 && MESSAGES_WA[i+1].from === msg.from;

            return (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: isTheo ? 'flex-end' : 'flex-start',
                marginBottom: next ? 1 : 5,
                marginTop: !prev && i > 1 ? 8 : 0
              }}>
                <div style={{
                  maxWidth: '76%',
                  background: isTheo ? '#005c4b' : '#202c33',
                  borderRadius: isTheo
                    ? `14px 3px ${next ? '3px' : '14px'} 14px`
                    : `3px 14px 14px ${next ? '3px' : '14px'}`,
                  padding: '6px 9px 4px'
                }}>
                  <p style={{ fontSize: 13, color: '#e9edef', lineHeight: 1.5, margin: 0, wordBreak: 'break-word' }}>
                    {msg.text}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{msg.time}</span>
                    {isTheo && (
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5l3 3.5L9 2" stroke="#53bdeb" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 5l3 3.5 5-6.5" stroke="#53bdeb" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Input bar (lecture seule) */}
        <div style={{
          background: '#161616', padding: '8px 10px',
          display: 'flex', alignItems: 'center', gap: 8,
          borderTop: '1px solid rgba(255,255,255,.05)',
          flexShrink: 0
        }}>
          <div style={{ fontSize: 20, color: 'rgba(255,255,255,.25)' }}>☺</div>
          <div style={{
            flex: 1, background: '#2a2f32', borderRadius: 20,
            padding: '8px 14px', fontSize: 13, color: 'rgba(255,255,255,.2)'
          }}>Message</div>
          <div style={{ fontSize: 20, color: 'rgba(255,255,255,.25)' }}>📎</div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#25d366',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M2 12l19-9-8 19-3-8z"/>
            </svg>
          </div>
        </div>

        {/* Home indicator */}
        <div style={{ background: '#111', padding: '6px 0 8px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ width: 100, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.18)', margin: '0 auto' }} />
        </div>
      </div>

      {/* Badge discret */}
      <div style={{
        position: 'fixed', top: '7%', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,.1)', borderRadius: 8,
        padding: '5px 14px', fontSize: 10, color: 'rgba(255,255,255,.4)',
        letterSpacing: '.12em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }}>
        ne_pas_transmettre.msg — corbeille
      </div>
    </div>
  );
}

function TrashApp() {
  const [showWhatsApp, setShowWhatsApp] = React.useState(false);
  const [hoverFile, setHoverFile] = React.useState(false);
  const [selected, setSelected] = React.useState(false);

  const trashItems = [
    { name: 'ne_pas_transmettre.msg',  icon: '📧', size: '3 Ko',   date: '10 sept.', isEgg: true },
    { name: 'draft_brief_v1.docx',     icon: '📄', size: '18 Ko',  date: '3 sept.',  isEgg: false },
    { name: 'ancien_logo_test.png',    icon: '🖼', size: '224 Ko', date: '28 août',  isEgg: false },
    { name: 'budget_prev_2025.xlsx',   icon: '📊', size: '41 Ko',  date: '14 août',  isEgg: false },
    { name: 'notes_réunion_juin.txt',  icon: '📝', size: '6 Ko',   date: '2 juil.',  isEgg: false },
  ];

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#f5f3ef',
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif"
    }}>
      {/* Toolbar Finder */}
      <div style={{
        background: 'linear-gradient(180deg, #e8e4de 0%, #ddd9d2 100%)',
        borderBottom: '1px solid rgba(20,24,36,.12)',
        padding: '6px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {['⬛','☰','⊞','🗂'].map((ic, i) => (
            <button key={i} style={{
              background: i === 0 ? 'rgba(20,24,36,.12)' : 'transparent',
              border: 'none', borderRadius: 4, padding: '4px 7px',
              fontSize: 12, cursor: 'default', color: 'var(--ink-soft)'
            }}>{ic}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          background: 'rgba(20,24,36,.08)', borderRadius: 6,
          padding: '4px 10px', fontSize: 11, color: 'var(--ink-faint)',
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          <span>🔍</span> <span>Rechercher</span>
        </div>
      </div>

      {/* Sidebar + contenu */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{
          width: 150, flexShrink: 0,
          background: 'rgba(236,233,226,.7)',
          borderRight: '1px solid rgba(20,24,36,.1)',
          padding: '10px 0',
          fontSize: 11, color: 'var(--ink-soft)'
        }}>
          {[
            { icon: '💻', label: 'Lumio MacBook' },
            { icon: '📁', label: 'Documents' },
            { icon: '⬇️', label: 'Téléchargements' },
            { icon: '🗑', label: 'Corbeille', active: true },
          ].map((it, i) => (
            <div key={i} style={{
              padding: '4px 12px',
              display: 'flex', alignItems: 'center', gap: 7,
              background: it.active ? 'rgba(20,24,36,.09)' : 'transparent',
              borderRadius: 6, margin: '0 4px',
              fontWeight: it.active ? 600 : 400,
              color: it.active ? 'var(--ink)' : 'var(--ink-soft)',
              cursor: 'default'
            }}>
              <span style={{ fontSize: 13 }}>{it.icon}</span>
              {it.label}
            </div>
          ))}
        </div>

        {/* Zone fichiers */}
        <div style={{ flex: 1, padding: '12px 16px', overflowY: 'auto' }}>
          {/* Header corbeille */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 12,
            paddingBottom: 10,
            borderBottom: '1px solid rgba(20,24,36,.08)'
          }}>
            <span style={{ fontSize: 22 }}>🗑</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Corbeille</div>
              <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{trashItems.length} éléments</div>
            </div>
            <div style={{ flex: 1 }} />
            <button style={{
              background: 'rgba(20,24,36,.08)', border: '1px solid rgba(20,24,36,.12)',
              borderRadius: 6, padding: '4px 10px', fontSize: 11,
              color: 'var(--ink-soft)', cursor: 'default'
            }}>Vider la corbeille</button>
          </div>

          {/* En-têtes colonnes */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 60px 80px',
            padding: '2px 8px 6px',
            fontSize: 10, color: 'var(--ink-faint)',
            letterSpacing: '.06em', textTransform: 'uppercase',
            borderBottom: '1px solid rgba(20,24,36,.06)'
          }}>
            <span>Nom</span>
            <span>Taille</span>
            <span>Supprimé</span>
          </div>

          {/* Liste fichiers */}
          {trashItems.map((item, i) => (
            <div
              key={i}
              onClick={() => item.isEgg && setSelected(true)}
              onDoubleClick={() => item.isEgg && setShowWhatsApp(true)}
              onMouseEnter={() => item.isEgg && setHoverFile(true)}
              onMouseLeave={() => item.isEgg && setHoverFile(false)}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 60px 80px',
                padding: '6px 8px',
                borderRadius: 5,
                background: item.isEgg && selected
                  ? 'rgba(0,104,181,.15)'
                  : item.isEgg && hoverFile
                  ? 'rgba(20,24,36,.05)'
                  : 'transparent',
                cursor: item.isEgg ? 'default' : 'default',
                borderBottom: i < trashItems.length - 1 ? '1px solid rgba(20,24,36,.04)' : 'none',
                transition: 'background .1s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                <span style={{
                  fontSize: 12,
                  color: item.isEgg ? 'var(--ink)' : 'var(--ink-soft)',
                  fontWeight: item.isEgg ? 500 : 400,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {item.name}
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center' }}>{item.size}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-faint)', display: 'flex', alignItems: 'center' }}>{item.date}</span>
            </div>
          ))}

          {/* Hint très discret au hover */}
          {hoverFile && (
            <div style={{
              marginTop: 16,
              fontSize: 10, color: 'rgba(20,24,36,.28)',
              textAlign: 'center', letterSpacing: '.04em'
            }}>
              Double-clic pour ouvrir
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp overlay */}
      {showWhatsApp && <WhatsAppOverlay onClose={() => setShowWhatsApp(false)} />}
    </div>
  );
}

// Enregistrement dans le registre global
window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.trash = TrashApp;
