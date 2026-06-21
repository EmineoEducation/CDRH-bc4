// ══════════════════════════════════════════════════════════════
//  WINDOW MANAGER + DESKTOP + DOCK + MENU BAR
// ══════════════════════════════════════════════════════════════
const { useState: useWmState, useEffect: useWmEffect, useRef: useWmRef, useContext: useWmContext, createContext } = React;

const WindowsCtx = createContext(null);
window.useWindows = () => useWmContext(WindowsCtx);

// ─── App registry ───────────────────────────────────────────
const APP_META = {
  mail:     { title: 'Mail',         w: 1100, h: 680, icon: 'MailIcon' },
  browser:  { title: 'Safari',       w: 1080, h: 720, icon: 'BrowserIcon' },
  pdf:      { title: 'Aperçu',       w:  900, h: 700, icon: 'PdfIcon' },
  voice:    { title: 'Mémos vocaux', w:  820, h: 560, icon: 'VoiceIcon' },
  notes:    { title: 'Notes',        w:  960, h: 660, icon: 'NotesIcon' },
  notepad:  { title: 'Bloc-notes',   w:  560, h: 620, icon: 'NotepadIcon' },
  slack:    { title: 'Slack — Lumio Health', w: 980, h: 640, icon: 'SlackIcon' },
  finder:   { title: 'Finder',       w:  820, h: 540, icon: 'FinderIcon' },
  calendar: { title: 'Calendrier',   w:  780, h: 580, icon: 'CalendarIcon' },
  trash:    { title: 'Corbeille',    w:  500, h: 360, icon: 'TrashIcon' },
  livrable:  { title: 'Livrable — ' + (window.PAC_CONFIG ? window.PAC_CONFIG.bloc : ''),        w: 920, h: 620, icon: 'LivrableIcon' },
  jefferson: { title: 'Jefferson · Guide PAC', w: 480, h: 560, icon: 'JeffersonIcon' }
};

// ═════ Window component ═════════════════════════════════════
function Win({ win, onFocus, onClose, onMinimize, onMove, onResize }) {
  const dragRef = useWmRef(null);
  const onDragStart = (e) => {
    if (win.maximized) return;
    onFocus(win.id);
    const startX = e.clientX, startY = e.clientY;
    const startWX = win.x, startWY = win.y;
    const move = (ev) => onMove(win.id, startWX + ev.clientX - startX, Math.max(28, startWY + ev.clientY - startY));
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  };

  const onResizeStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onFocus(win.id);
    const startX = e.clientX, startY = e.clientY;
    const startW = win.w, startH = win.h;
    const move = (ev) => onResize(win.id, Math.max(440, startW + ev.clientX - startX), Math.max(320, startH + ev.clientY - startY));
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  };

  const meta = APP_META[win.app];
  const AppComp = (window.LUMIO_APPS || {})[win.app];

  const style = win.maximized ? {
    left: 0, top: 28, width: '100%', height: 'calc(100% - 28px - 76px)'
  } : {
    left: win.x, top: win.y, width: win.w, height: win.h
  };

  return (
    <div
      onMouseDown={() => onFocus(win.id)}
      style={{
        position: 'absolute',
        ...style,
        background: 'white',
        borderRadius: 10,
        boxShadow: win.focused
          ? '0 24px 60px rgba(20,24,36,0.32), 0 6px 18px rgba(20,24,36,0.18), 0 0 0 0.5px rgba(20,24,36,0.4)'
          : '0 10px 24px rgba(20,24,36,0.18), 0 0 0 0.5px rgba(20,24,36,0.3)',
        zIndex: win.z,
        display: win.minimized ? 'none' : 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        opacity: win.focused ? 1 : 0.97,
        transition: 'opacity 120ms'
      }}>
      <div
        onMouseDown={onDragStart}
        onDoubleClick={() => onFocus(win.id, 'toggleMax')}
        style={{
          height: 32,
          background: win.focused ? 'linear-gradient(180deg, #f4f2ee, #e8e6e0)' : '#f0eee8',
          borderBottom: '1px solid rgba(20,24,36,0.12)',
          display: 'flex', alignItems: 'center',
          padding: '0 10px',
          flexShrink: 0,
          cursor: 'grab',
          userSelect: 'none'
        }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <button onClick={(e) => { e.stopPropagation(); onClose(win.id); }} style={trafficLight('#fc615d')} />
          <button onClick={(e) => { e.stopPropagation(); onMinimize(win.id); }} style={trafficLight('#fdbc40')} />
          <button onClick={(e) => { e.stopPropagation(); onFocus(win.id, 'toggleMax'); }} style={trafficLight('#34c84a')} />
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600, color: win.focused ? 'var(--ink)' : 'var(--ink-mute)', letterSpacing: '0.005em' }}>
          {meta.title}
        </div>
        <div style={{ width: 60 }} />
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {AppComp ? <AppComp {...(win.props || {})} /> : <div style={{ padding: 40 }}>Chargement…</div>}
      </div>
      {!win.maximized && (
        <div
          onMouseDown={onResizeStart}
          style={{
            position: 'absolute',
            right: 0, bottom: 0,
            width: 16, height: 16,
            cursor: 'nwse-resize',
            background: 'linear-gradient(135deg, transparent 50%, rgba(20,24,36,0.18) 50%)',
            zIndex: 10
          }}
        />
      )}
    </div>
  );
}

const trafficLight = (color) => ({
  width: 12, height: 12, borderRadius: '50%',
  background: color, border: 'none', padding: 0,
  cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.2)'
});

// ═════ Menu bar ═════════════════════════════════════════════
// Temps fictif BC2 : 3h30 réelles = 18 jours fictifs (12→30 oct.)
// Ratio : 1 min réelle = 5.14 min fictives. Départ : lun. 12 oct. 07h19
const FICTIF_START_MIN = 7 * 60 + 19; // 07h19 en minutes depuis minuit le 12 oct.
const RATIO = 18 * 24 * 60 / (3 * 60 + 30); // ~74x (18 jours / 3h30)
const OCT_DAYS = ['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'];
// 12 oct. 2026 = lundi → offset 1
function getFictifTime() {
  const startReal = window.LUMIO_TIMER_START || Date.now();
  const realElapsed = (Date.now() - startReal) / 60000;
  const fictifElapsed = realElapsed * RATIO;
  const totalMin = FICTIF_START_MIN + fictifElapsed;
  const dayOffset = Math.floor(totalMin / (24 * 60));
  const day = Math.min(12 + dayOffset, 30); // cap au 30 oct.
  const minuteOfDay = totalMin % (24 * 60);
  const hh = Math.floor(minuteOfDay / 60).toString().padStart(2,'0');
  const mm = Math.floor(minuteOfDay % 60).toString().padStart(2,'0');
  const dowOffset = (1 + dayOffset) % 7; // lundi 12 oct = offset 1
  const dow = OCT_DAYS[dowOffset];
  return { label: `${dow} ${day} oct.  ${hh}:${mm}`, day, dayOffset };
}

// Dates fictives : board vendredi 16 oct. 2026
// Surveillance fin de session → J=30 (30 oct.) = deadline dépassée
// Exposer pour le Calendrier
window.__getFictifTime = getFictifTime;

function MenuBar({ activeApp, openLogout }) {
  const [timeLabel, setTimeLabel] = useWmState('');
  const [showUserMenu, setShowUserMenu] = useWmState(false);

  useWmEffect(() => {
    const tick = () => setTimeLabel(getFictifTime().label);
    tick();
    const id = setInterval(tick, 10000); // refresh toutes les 10s réelles ≈ ~12 min fictives
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 28,
      background: 'rgba(245,243,239,0.78)',
      backdropFilter: 'blur(20px) saturate(1.4)',
      WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
      borderBottom: '1px solid rgba(20,24,36,0.08)',
      display: 'flex', alignItems: 'center',
      padding: '0 14px',
      fontSize: 13, color: 'var(--ink)',
      zIndex: 10000
    }}>
      <div style={{ fontSize: 14, marginRight: 14 }}> </div>
      <div style={{ fontWeight: 700, marginRight: 18 }}>{activeApp || 'Finder'}</div>
      {['Fichier','Édition','Présentation','Aller','Fenêtre','Aide'].map(m => (
        <div key={m} style={{ marginRight: 14, color: 'var(--ink-soft)', cursor: 'default' }}>{m}</div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: 14, color: 'var(--ink-soft)', alignItems: 'center' }}>
        <span>🔋 84%</span>
        <span>📶</span>
        <span>🔍</span>
        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{timeLabel}</span>
        <span
          onClick={() => setShowUserMenu(m => !m)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#c4420f', color: 'white', fontSize: 9, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {window.LUMIO_DATA?.student?.initial || 'L'}
          </span>
          {window.LUMIO_DATA?.student?.name?.split(' ')[0] || 'Étudiant·e'} ▾
          {showUserMenu && (
            <div style={{
              position: 'absolute', top: 22, right: 0,
              background: 'white', border: '1px solid rgba(20,24,36,0.12)',
              borderRadius: 8, boxShadow: '0 8px 24px rgba(20,24,36,0.18)',
              minWidth: 180, zIndex: 20000, overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--rule)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{window.LUMIO_DATA?.student?.name || 'Étudiant·e'}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>Consultant·e externe</div>
              </div>
              <div
                onClick={() => { setShowUserMenu(false); if (window.confirm('Quitter la session en cours ?')) openLogout(); }}
                style={{ padding: '9px 14px', fontSize: 12, color: '#c0392b', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background='#fff5f5'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                ⏻ Quitter la session
              </div>
            </div>
          )}
        </span>
      </div>
      {showUserMenu && <div onClick={() => setShowUserMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 19999 }} />}
    </div>
  );
}

// ═════ Dock ═════════════════════════════════════════════════
function Dock({ openApp, openWindows, livrableUnlocked }) {
  const baseItems = [
    { id: 'finder', label: 'Finder' },
    { id: 'mail', label: 'Mail' },
    { id: 'browser', label: 'Safari' },
    { id: 'pdf', label: 'Aperçu' },
    { id: 'voice', label: 'Mémos vocaux' },
    { id: 'notes', label: 'Notes' },
    { id: 'notepad', label: 'Bloc-notes' },
    { id: 'slack', label: 'Slack' },
    { id: 'calendar', label: 'Calendrier' },
    { id: 'trash', label: 'Corbeille' }
  ];
  const items = livrableUnlocked
    ? [...baseItems.slice(0, -1), { id: 'livrable', label: 'Livrable', bounce: true }, baseItems[baseItems.length - 1]]
    : baseItems;

  // CSS bounce injecté une fois
  useWmEffect(() => {
    if (!document.getElementById('dock-bounce-style')) {
      const s = document.createElement('style');
      s.id = 'dock-bounce-style';
      s.textContent = `
        @keyframes dock-bounce {
          0%,100%{transform:translateY(0) scale(1)}
          20%{transform:translateY(-18px) scale(1.1)}
          40%{transform:translateY(-4px) scale(1.02)}
          60%{transform:translateY(-10px) scale(1.06)}
          80%{transform:translateY(-2px) scale(1.01)}
        }
        .dock-bounce { animation: dock-bounce 0.9s ease 3; }
      `;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: 8, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(245,243,239,0.55)',
      backdropFilter: 'blur(28px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 12px 30px rgba(20,24,36,0.18)',
      borderRadius: 18,
      padding: '6px 10px',
      display: 'flex', alignItems: 'flex-end', gap: 6,
      zIndex: 9999
    }}>
      {items.map((it, idx) => {
        const Icon = window[APP_META[it.id]?.icon];
        if (!Icon) return null;
        const isOpen = openWindows.some(w => w.app === it.id);
        return (
          <div key={it.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onClick={() => openApp(it.id)}
              title={it.label}
              className={it.bounce && livrableUnlocked ? 'dock-bounce' : ''}
              style={{
                background: 'transparent', border: 'none',
                padding: 4, cursor: 'pointer',
                transition: 'transform 180ms cubic-bezier(.34,1.56,.64,1)'
              }}
              onMouseEnter={(e) => { if (!it.bounce) e.currentTarget.style.transform = 'translateY(-6px) scale(1.18)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              <Icon size={50} />
            </button>
            {it.bounce && livrableUnlocked && (
              <div style={{
                position: 'absolute', top: -6, right: -4,
                width: 14, height: 14, borderRadius: '50%',
                background: '#34c84a', border: '2px solid white',
                fontSize: 8, color: 'white', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>!</div>
            )}
            {isOpen && (
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(20,24,36,0.5)', position: 'absolute', bottom: -2 }} />
            )}
            {idx === 0 && <div style={{ width: 1, height: 40, background: 'rgba(20,24,36,0.15)', position: 'absolute', right: -7, top: 8 }} />}
          </div>
        );
      })}
    </div>
  );
}

// ═════ Desktop icons ════════════════════════════════════════
function DesktopIcons({ openApp }) {
  const icons = [
    { app: 'finder', folder: 'mission', label: 'Mission Lumio', kind: 'folder', x: 36, y: 56 },
    { app: 'finder', folder: 'portraits', label: 'Portraits équipe', kind: 'folder', x: 36, y: 174 },
    { app: 'mail', label: 'Mail.app', kind: 'app', x: 36, y: 292 },
    { app: 'slack', label: 'Slack.app', kind: 'app', x: 36, y: 410 },
    { app: 'notepad', label: 'Mes notes.txt', kind: 'app', x: 36, y: 528 }
  ];
  return (
    <>
      {icons.map((it, i) => {
        const meta = APP_META[it.app];
        const Icon = it.kind === 'folder' ? window.FolderIcon : window[meta.icon];
        return (
          <div key={i}
            onDoubleClick={() => openApp(it.app, it.kind === 'folder' ? { openFolder: it.folder } : {})}
            onClick={() => openApp(it.app, it.kind === 'folder' ? { openFolder: it.folder } : {})}
            style={{
              position: 'absolute',
              left: it.x, top: it.y,
              width: 88,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 4
            }}>
            <Icon size={56} />
            <div style={{
              fontSize: 12,
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              marginTop: 4,
              textAlign: 'center',
              padding: '1px 5px',
              borderRadius: 2,
              lineHeight: 1.2
            }}>{it.label}</div>
          </div>
        );
      })}
    </>
  );
}

// ═════ Wallpaper ════════════════════════════════════════════
function Wallpaper() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: `
        radial-gradient(ellipse at 20% 30%, #f5d5b8 0%, transparent 55%),
        radial-gradient(ellipse at 80% 20%, #e8a5b0 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, #b8c8d8 0%, transparent 60%),
        linear-gradient(160deg, #f0c8a8 0%, #d8a098 30%, #98a8c8 60%, #5878a8 100%)
      `,
      zIndex: 0
    }} />
  );
}

// ═════ Notifications ════════════════════════════════════════
function NotificationStack({ notifications, onDismiss, onClick }) {
  return (
    <div style={{ position: 'fixed', top: 36, right: 12, width: 340, zIndex: 11000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {notifications.map(n => (
        <div
          key={n.id}
          onClick={() => onClick(n)}
          style={{
            background: 'rgba(245,243,239,0.94)',
            backdropFilter: 'blur(20px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
            borderRadius: 12,
            padding: '12px 14px',
            boxShadow: '0 8px 24px rgba(20,24,36,0.22), 0 0 0 0.5px rgba(20,24,36,0.1)',
            cursor: 'pointer',
            animation: 'slideInNotif 280ms ease-out'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: n.color || '#1a2436', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{n.icon || '!'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{n.app}</div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink-faint)' }}>maintenant</div>
            <button onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }} style={{ background: 'transparent', border: 'none', color: 'var(--ink-faint)', fontSize: 14, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600, marginBottom: 2 }}>{n.title}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.4 }}>{n.body}</div>
        </div>
      ))}
    </div>
  );
}

// ═════ PAC Timeline — barre de progression 5 actes ══════════
function PacTimeline() {
  const [elapsed, setElapsed] = useWmState(0);

  useWmEffect(() => {
    const tick = () => {
      if (!window.LUMIO_TIMER_START) { setElapsed(0); return; }
      setElapsed(Math.floor((Date.now() - window.LUMIO_TIMER_START) / 60000));
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  const ACTES = [
    { n: 1, label: 'Ancrage',    start: 0,   end: 20  },
    { n: 2, label: 'Affaire',    start: 20,  end: 50  },
    { n: 3, label: 'Diagnostic', start: 50,  end: 95  },
    { n: 4, label: 'Production', start: 95,  end: 175 },
    { n: 5, label: 'Réflexion',  start: 175, end: 210 }
  ];
  const TOTAL = 210;
  const pct = Math.min(100, (elapsed / TOTAL) * 100);
  const currentActe = ACTES.find(a => elapsed >= a.start && elapsed < a.end) || ACTES[ACTES.length - 1];
  const isUrgent = elapsed >= 175;
  const remaining = Math.max(0, TOTAL - elapsed);

  return (
    <div style={{
      position: 'fixed',
      top: 32, // just below menu bar (28px) + 4px gap
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 320px)', // leave room for dock tooltip areas
      maxWidth: 860,
      zIndex: 9990,
      background: 'rgba(11,43,45,0.88)',
      backdropFilter: 'blur(18px) saturate(1.4)',
      WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
      borderRadius: '0 0 12px 12px',
      border: '1px solid rgba(93,226,152,0.18)',
      borderTop: 'none',
      padding: '6px 14px 7px',
      boxShadow: '0 4px 20px rgba(11,43,45,0.25)'
    }}>
      {/* Ligne 1 : actes + timer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {ACTES.map(a => {
          const done = elapsed >= a.end;
          const active = a.n === currentActe.n;
          return (
            <div key={a.n} style={{
              flex: a.n === 4 ? 2 : 1, // Acte 4 plus large (1h20)
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 7px',
              borderRadius: 6,
              background: active ? 'rgba(93,226,152,0.18)' : 'transparent',
              border: active ? '1px solid rgba(93,226,152,0.35)' : '1px solid transparent',
              transition: 'all .3s'
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                background: done ? '#5DE298' : active ? 'rgba(93,226,152,0.5)' : 'rgba(255,255,255,0.08)',
                border: active ? '1.5px solid #5DE298' : done ? 'none' : '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 700, color: done ? '#0B2B2D' : active ? '#5DE298' : 'rgba(255,255,255,0.3)'
              }}>
                {done ? '✓' : a.n}
              </div>
              <span style={{
                fontSize: 9, fontWeight: active ? 700 : 400,
                color: done ? '#9DF0C4' : active ? '#5DE298' : 'rgba(255,255,255,0.35)',
                letterSpacing: '0.02em', whiteSpace: 'nowrap'
              }}>{a.label}</span>
            </div>
          );
        })}
        {/* Timer */}
        <div style={{
          marginLeft: 4, flexShrink: 0,
          background: isUrgent ? 'rgba(232,155,119,0.2)' : 'rgba(255,255,255,0.06)',
          border: isUrgent ? '1px solid rgba(232,155,119,0.5)' : '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6, padding: '2px 8px',
          fontSize: 10, fontWeight: 700,
          color: isUrgent ? '#E89B77' : 'rgba(255,255,255,0.55)',
          fontFamily: 'var(--font-mono, monospace)'
        }}>
          {remaining}m
        </div>
      </div>

      {/* Ligne 2 : barre de progression */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: isUrgent
            ? 'linear-gradient(90deg, #5DE298, #E89B77)'
            : 'linear-gradient(90deg, #5DE298, #9DF0C4)',
          borderRadius: 2,
          transition: 'width 1s linear'
        }} />
      </div>
    </div>
  );
}


function Desktop({ onLogout }) {
  const [windows, setWindows] = useWmState([]);
  const [zCounter, setZCounter] = useWmState(100);
  const [notifications, setNotifications] = useWmState([]);
  const [exchangeCount, setExchangeCount] = useWmState(0);
  const [livrableUnlocked, setLivrableUnlocked] = useWmState(false);
  const notifSeqRef = useWmRef(0);

  // Expose pour que SlackApp puisse incrémenter
  useWmEffect(() => {
    window.__onSlackExchange = (count) => {
      setExchangeCount(count);
      // Débloquer livrable après 2 échanges
      if (count >= 2) setLivrableUnlocked(true);
      // Docs bonus : email Camille après échange 1
      if (count === 1) {
        setTimeout(() => {
          const id = ++notifSeqRef.current;
          setNotifications(ns => [...ns, {
            id,
            app: 'Mail',
            icon: 'CO',
            color: '#0a7a6e',
            title: 'Camille Ott',
            body: 'J\'ai des choses à te dire que je ne mets pas sur Slack.',
            click: { app: 'mail', props: { openId: 'camille_bonus' } }
          }]);
          setTimeout(() => setNotifications(ns => ns.filter(n => n.id !== id)), 14000);
          // Injecter l'email Camille bonus dans MailApp
          if (!window.LUMIO_DATA._camilleEmailAdded) {
            window.LUMIO_DATA._camilleEmailAdded = true;
            window.LUMIO_DATA._camilleEmail = {
              id: 'camille_bonus',
              from: 'Camille Ott',
              fromEmail: 'camille.ott@lumio-health.com',
              avatar: 'CO', avatarColor: '#0a7a6e',
              subject: 'Ce que je ne mets pas sur Slack',
              date: '12/10/26 · 09:14',
              preview: 'Le vrai churn c\'est 9 %, pas 4. Et j\'ai des comptes en attente de la MDR…',
              unread: true,
              tags: ['TERRAIN'],
              body: `${(window.LUMIO_DATA?.student?.name || '').split(' ')[0] || 'Bonjour'},

Je préfère t'écrire par mail. Théo lit les canaux Slack.

Deux choses que tu dois savoir pour ton document.

Première chose : le churn qu'on présente au board est de 4,1 %. C'est le churn sur les contrats signés depuis janvier 2025, c'est-à-dire les meilleurs clients. Si tu calcules sur la base totale des 180 clients actifs, tu es plus près de 9 %. C'est le chiffre que j'utilise dans mes prévisions terrain. Sonia ne veut pas l'entendre.

Deuxième chose : j'ai au moins 8 à 10 comptes B2B en stand-by sur la MDR pour monter en gamme. Un seul m'a dit mot pour mot : "Le jour où Lumio a sa MDR, on double le périmètre." Ça représente 600K€ de CA additionnel sur 12 mois sans aller chercher un seul nouveau client. Est-ce que quelqu'un a mis ça dans une projection ? Non.

Le board va entendre deux positions : Sonia qui veut aller vite, Théo qui veut attendre. La vraie question, celle que personne ne pose, c'est : qu'est-ce qu'on perd en B2B si on annonce le pivot maintenant, avant la MDR ?

À toi de décider comment tu l'intègres.

Camille`
            };
          }
        }, 2500);
      }
      // Après échange 3 : Sonia envoie une note Slack
      if (count === 3) {
        setTimeout(() => {
          const id = ++notifSeqRef.current;
          setNotifications(ns => [...ns, {
            id,
            app: 'Notes',
            icon: '📝',
            color: '#e0b53a',
            title: 'Note déposée',
            body: 'Sonia a partagé une note : "À régler avec Théo"',
            click: { app: 'notes', props: { openNote: 'theo_regler' } }
          }]);
          setTimeout(() => setNotifications(ns => ns.filter(n => n.id !== id)), 14000);
          // Activer la note dans NotesApp
          window.LUMIO_DATA._theoNoteUnlocked = true;
        }, 1800);
      }
    };

    // Livrable soumis — Sonia envoie un message Slack
    window.__onLivrableSubmitted = (veille, plateforme, juryResult) => {
      const id = ++notifSeqRef.current;
      setNotifications(ns => [...ns, {
        id,
        app: 'Slack',
        icon: 'JR',
        color: '#1b3a6b',
        title: 'Jakob Rein',
        body: 'I received your document. Reading now.',
        click: { app: 'slack', props: {} }
      }]);
      setTimeout(() => setNotifications(ns => ns.filter(n => n.id !== id)), 14000);
      window.LUMIO_DATA._livrableSubmitted = { veille, plateforme, juryResult };
      setTimeout(() => {
        if (window.__onSoniaLivrableReaction) window.__onSoniaLivrableReaction(veille, plateforme);
      }, 4000);
    };
  }, []);

  // Surveiller la fin de session (J-0 = CODIR)
  useWmEffect(() => {
    const check = setInterval(() => {
      if (!window.__getFictifTime) return;
      const { day } = window.__getFictifTime();
      if (day >= 30 && !window.__codirNotified) {
        window.__codirNotified = true;
        const id = ++notifSeqRef.current;
        setNotifications(ns => [...ns, {
          id,
          app: 'Calendrier',
          icon: '📅',
          color: '#c4420f',
          title: 'Board Northgate dans 5 minutes',
          body: 'Jakob arrive. Dernière chance d\'envoyer la recommandation. Il est 08h55 le 30 octobre.',
          click: { app: 'livrable', props: {} }
        }]);
      }
    }, 15000);
    return () => clearInterval(check);
  }, []);

  const openApp = (app, props = {}) => {
    const meta = APP_META[app];
    if (!meta) return;
    // Tracker pour les tips contextuels
    if (window.__onAppOpened) window.__onAppOpened(app);
    setWindows(ws => {
      // Update props of existing window if open
      const existingIdx = ws.findIndex(w => w.app === app);
      if (existingIdx >= 0) {
        const newZ = zCounter + 1;
        setZCounter(newZ);
        return ws.map((w, i) => i === existingIdx
          ? { ...w, props: { ...w.props, ...props }, focused: true, minimized: false, z: newZ }
          : { ...w, focused: false }
        );
      }
      const id = `w_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      const newZ = zCounter + 1;
      setZCounter(newZ);
      const offset = ws.length * 28;
      return [
        ...ws.map(w => ({ ...w, focused: false })),
        {
          id, app, props,
          x: 80 + offset, y: 60 + offset,
          w: meta.w, h: meta.h,
          z: newZ, focused: true, minimized: false, maximized: false
        }
      ];
    });
  };
  window.__openApp = openApp;

  const focusWin = (id, action) => {
    setWindows(ws => {
      const newZ = zCounter + 1;
      setZCounter(newZ);
      return ws.map(w => w.id === id
        ? { ...w, focused: true, z: newZ, ...(action === 'toggleMax' ? { maximized: !w.maximized } : {}) }
        : { ...w, focused: false }
      );
    });
  };
  const closeWin = (id) => setWindows(ws => ws.filter(w => w.id !== id));
  const minimizeWin = (id) => setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: true, focused: false } : w));
  const moveWin = (id, x, y) => setWindows(ws => ws.map(w => w.id === id ? { ...w, x, y } : w));
  const resizeWin = (id, w, h) => setWindows(ws => ws.map(win => win.id === id ? { ...win, w, h } : win));

  // ─── Système de tips ──────────────────────────────────────
  const shownTipsRef = useWmRef(new Set());

  const pushTip = (key, tip) => {
    if (shownTipsRef.current.has(key)) return;
    shownTipsRef.current.add(key);
    const id = ++notifSeqRef.current;
    setNotifications(ns => [...ns, {
      id,
      app: 'Mission · Guide',
      icon: '?',
      color: '#1a6641',
      ...tip,
      click: tip.click || { app: 'finder', props: { openFolder: 'guide' } }
    }]);
    setTimeout(() => setNotifications(ns => ns.filter(n => n.id !== id)), 18000);
  };

  // Tips déclenchés par le temps fictif (J-)
  useWmEffect(() => {
    const check = setInterval(() => {
      if (!window.__getFictifTime) return;
      const { day } = window.__getFictifTime();
      const dLeft = 30 - day;

      if (dLeft <= 12 && dLeft > 7) {
        pushTip('j12', {
          title: 'J−12 · Par où commencer',
          body: 'Théo t\'a écrit ce matin à 07h19. Commence par Mail — sa lettre de mission est là.',
          click: { app: 'mail', props: { openId: 'brief' } }
        });
      }
      if (dLeft <= 7 && dLeft > 3) {
        pushTip('j7', {
          title: 'J−7 · Passer à l\'action',
          body: 'Jakob attend une position, pas un diagnostic. Ouvre Slack et envoie-lui ta première hypothèse — même imparfaite.',
          click: { app: 'slack', props: {} }
        });
      }
      if (dLeft <= 3 && dLeft > 0) {
        pushTip('j3', {
          title: 'J−3 · Finaliser',
          body: 'L\'app Livrable t\'attend dans le dock. C.7 à C.12 — tu as assez d\'éléments pour la recommandation board.',
          click: { app: 'livrable', props: {} }
        });
      }
    }, 20000);
    return () => clearInterval(check);
  }, []);

  // Tips contextuels — surveillance de la progression
  useWmEffect(() => {
    const openedApps = new Set();
    const slackMessageSent = { v: false };
    window.__onAppOpened = (app) => openedApps.add(app);
    window.__onSlackSent = () => { slackMessageSent.v = true; };

    const checks = [
      // 3 min sans rien ouvrir → Mail
      { delay: 3 * 60 * 1000, key: 'ctx_start', cond: () => openedApps.size === 0,
        tip: { title: 'Par où commencer ?', body: 'Théo t\'a écrit ce matin à 07h19. Sa lettre de mission est dans Mail — commence par là.', click: { app: 'mail', props: { openId: 'brief' } } } },
      // 6 min — Mail ouvert mais pas Slack
      { delay: 6 * 60 * 1000, key: 'ctx_slack', cond: () => openedApps.has('mail') && !openedApps.has('slack'),
        tip: { title: 'Jakob attend', body: 'Tu as lu le brief. Jakob Rein attend ta première hypothèse sur Slack — ouvre-le et envoie-lui quelque chose.', click: { app: 'slack', props: {} } } },
      // 8 min — Slack ouvert mais rien envoyé
      { delay: 8 * 60 * 1000, key: 'ctx_send', cond: () => openedApps.has('slack') && !slackMessageSent.v,
        tip: { title: 'Envoie quelque chose', body: 'Slack est ouvert. Envoie une phrase à Jakob — même incomplète. Ça débloque la suite.', click: { app: 'slack', props: {} } } },
      // 10 min — pas ouvert PDF
      { delay: 10 * 60 * 1000, key: 'ctx_pdf', cond: () => !openedApps.has('pdf'),
        tip: { title: 'Le deck board Q3 est dans Aperçu', body: 'Sonia a préparé un deck board pour octobre. Il contient des chiffres clés — et des projections que tu dois analyser.', click: { app: 'pdf', props: {} } } },
      // 15 min — pas ouvert Mémos vocaux
      { delay: 15 * 60 * 1000, key: 'ctx_voice', cond: () => !openedApps.has('voice'),
        tip: { title: 'Camille a enregistré trois verbatims', body: 'Ouvre Mémos vocaux — Camille Ott dit des choses sur les clients B2B que les documents ne montrent pas.', click: { app: 'voice', props: {} } } },
      // 20 min — livrable débloqué mais pas ouvert
      { delay: 20 * 60 * 1000, key: 'ctx_livrable', cond: () => livrableUnlocked && !openedApps.has('livrable'),
        tip: { title: 'Le livrable t\'attend', body: 'L\'app Livrable rebondit dans le dock. C.7 à C.12 — commence à construire la recommandation.', click: { app: 'livrable', props: {} } } },
    ];

    const timers = checks.map(c =>
      setTimeout(() => { if (c.cond()) pushTip(c.key, c.tip); }, c.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [livrableUnlocked]);

  // Notification scheduler ambiant (existant, allégé)
  useWmEffect(() => {
    const events = [
      { t: 12000, n: { app: 'Slack', icon: 'CO', color: '#0a7a6e', title: 'Camille Ott', body: 'Si tu veux les vrais chiffres terrain avant de commencer — pas ceux du deck — dis-moi 🙃', click: { app: 'slack', props: { openChannel: 'camille' } } } },
      { t: 60000, n: { app: 'Calendrier', icon: '📅', color: '#1b3a6b', title: 'Board Northgate Capital', body: 'Vendredi 16 oct. à 09:00 — dans 4 jours. Recommandation attendue jeudi soir.', click: { app: 'calendar' } } },
      { t: 130000, n: { app: 'Slack', icon: 'CO', color: '#0a7a6e', title: 'Camille Ott', body: 'PS — j\'ai des verbatims clients qui peuvent nourrir ta reco. Audio dispo dans Mémos vocaux.', click: { app: 'voice' } } },
      { t: 20 * 60 * 1000, n: { app: 'Les Échos', icon: 'LE', color: '#1a1a2e', title: 'Breaking · Wearables & Mutuelles', body: 'Signal fort B2B : appel d\'offres mutuelles 45 M€ avec MDR obligatoire.', click: { app: 'browser', props: { openTab: 'fausse-une' } } } }
    ];
    const timers = events.map(ev => setTimeout(() => {
      const id = ++notifSeqRef.current;
      setNotifications(ns => [...ns, { id, ...ev.n }]);
      setTimeout(() => setNotifications(ns => ns.filter(n => n.id !== id)), 14000);
    }, ev.t));
    return () => timers.forEach(clearTimeout);
  }, []);

  const dismissNotif = (id) => setNotifications(ns => ns.filter(n => n.id !== id));
  const clickNotif = (n) => {
    if (n.click) openApp(n.click.app, n.click.props || {});
    dismissNotif(n.id);
  };

  const focusedWin = windows.find(w => w.focused);
  const activeAppTitle = focusedWin ? APP_META[focusedWin.app].title : 'Finder';

  return (
    <WindowsCtx.Provider value={{ open: openApp }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', userSelect: 'none' }}>
        <Wallpaper />
        <MenuBar activeApp={activeAppTitle} openLogout={onLogout} />
        <DesktopIcons openApp={openApp} />
        {windows.map(w => (
          <Win key={w.id} win={w}
            onFocus={focusWin}
            onClose={closeWin}
            onMinimize={minimizeWin}
            onMove={moveWin}
            onResize={resizeWin}
          />
        ))}
        <Dock openApp={openApp} openWindows={windows} livrableUnlocked={livrableUnlocked} />
        <PacTimeline />
        <NotificationStack notifications={notifications} onDismiss={dismissNotif} onClick={clickNotif} />
        {/* Bouton ? — aide à la demande */}
        <JeffersonFab openApp={openApp} isOpen={windows.some(w => w.app === 'jefferson')} />
        <button
          onClick={() => openApp('finder', { openFolder: 'guide' })}
          title="Guide de mission"
          style={{
            position: 'fixed', bottom: 90, left: 16, zIndex: 9998,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(245,243,239,0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 4px 12px rgba(20,24,36,0.18)',
            color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,102,65,0.85)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,243,239,0.55)'; e.currentTarget.style.color = 'var(--ink-soft)'; }}
        >?</button>
      </div>
    </WindowsCtx.Provider>
  );
}


// ═════ Jefferson FAB ═══════════════════════════════════════
// Bouton flottant en bas à droite (hors dock). États visuels :
// idle (gris), talking (animé quand la fenêtre Jefferson est ouverte).
function JeffersonFab({ openApp, isOpen }) {
  const Icon = window.JeffersonIcon;
  const [hover, setHover] = useWmState(false);
  useWmEffect(() => {
    if (!document.getElementById('jefferson-fab-style')) {
      const s = document.createElement('style'); s.id = 'jefferson-fab-style';
      s.textContent = '@keyframes jefferson-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}.jefferson-talking{animation:jefferson-pulse 1.4s ease-in-out infinite}';
      document.head.appendChild(s);
    }
  }, []);
  return (
    <button
      onClick={() => openApp('jefferson')}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Jefferson · Guide PAC"
      className={isOpen ? 'jefferson-talking' : ''}
      style={{
        position: 'fixed', bottom: 22, right: 22, zIndex: 9998,
        width: 60, height: 60, borderRadius: '50%',
        background: 'rgba(245,243,239,0.78)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: hover ? '0 14px 36px rgba(20,24,36,0.28)' : '0 8px 22px rgba(20,24,36,0.18)',
        cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 220ms cubic-bezier(.34,1.56,.64,1), box-shadow 220ms ease',
        transform: hover ? 'translateY(-3px) scale(1.04)' : 'none'
      }}>
      {Icon ? <Icon size={42} /> : <span style={{ fontSize: 24 }}>🐰</span>}
    </button>
  );
}

window.LumioDesktop = Desktop;
