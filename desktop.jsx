// ══════════════════════════════════════════════════════════════
//  WINDOW MANAGER + DESKTOP + DOCK + MENU BAR — générique
//  Structure réutilisable. Toute narration lue depuis :
//    · window.PAC_CONFIG.temps   → barre des 5 actes
//    · window.LUMIO_DATA.fictif  → calendrier du temps fictif
//    · window.LUMIO_DATA.events  → moteur de notifications / tips / réactions
//    · window.LUMIO_DATA.desktopIcons → icônes du bureau
//  PAC · Éminéo
// ══════════════════════════════════════════════════════════════
const { useState: useWmState, useEffect: useWmEffect, useRef: useWmRef, useContext: useWmContext, createContext } = React;

const WindowsCtx = createContext(null);
window.useWindows = () => useWmContext(WindowsCtx);

const APP_META = {
  mail:     { title: 'Mail',         w: 1100, h: 680, icon: 'MailIcon' },
  browser:  { title: 'Safari',       w: 1080, h: 720, icon: 'BrowserIcon' },
  pdf:      { title: 'Aperçu',       w:  900, h: 700, icon: 'PdfIcon' },
  voice:    { title: 'Mémos vocaux', w:  820, h: 560, icon: 'VoiceIcon' },
  notes:    { title: 'Notes',        w:  960, h: 660, icon: 'NotesIcon' },
  notepad:  { title: 'Bloc-notes',   w:  560, h: 620, icon: 'NotepadIcon' },
  slack:    { title: 'Slack',        w:  980, h: 640, icon: 'SlackIcon' },
  finder:   { title: 'Finder',       w:  820, h: 540, icon: 'FinderIcon' },
  calendar: { title: 'Calendrier',   w:  780, h: 580, icon: 'CalendarIcon' },
  trash:    { title: 'Corbeille',    w:  500, h: 360, icon: 'TrashIcon' },
  livrable:  { title: 'Livrable — ' + (window.PAC_CONFIG ? window.PAC_CONFIG.bloc : ''), w: 920, h: 620, icon: 'LivrableIcon' },
  jefferson: { title: 'Jefferson · Guide PAC', w: 480, h: 560, icon: 'JeffersonIcon' }
};

// ═════ Window component ═════════════════════════════════════
function Win({ win, onFocus, onClose, onMinimize, onMove, onResize }) {
  const onDragStart = (e) => {
    if (win.maximized) return;
    onFocus(win.id);
    const startX = e.clientX, startY = e.clientY, startWX = win.x, startWY = win.y;
    const move = (ev) => onMove(win.id, startWX + ev.clientX - startX, Math.max(28, startWY + ev.clientY - startY));
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
    document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
  };
  const onResizeStart = (e) => {
    e.stopPropagation(); e.preventDefault(); onFocus(win.id);
    const startX = e.clientX, startY = e.clientY, startW = win.w, startH = win.h;
    const move = (ev) => onResize(win.id, Math.max(440, startW + ev.clientX - startX), Math.max(320, startH + ev.clientY - startY));
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
    document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
  };
  const meta = APP_META[win.app];
  const AppComp = (window.LUMIO_APPS || {})[win.app];
  const style = win.maximized ? { left: 0, top: 28, width: '100%', height: 'calc(100% - 28px - 76px)' } : { left: win.x, top: win.y, width: win.w, height: win.h };

  return (
    <div onMouseDown={() => onFocus(win.id)}
      style={{ position: 'absolute', ...style, background: 'white', borderRadius: 10,
        boxShadow: win.focused ? '0 24px 60px rgba(20,24,36,0.32), 0 6px 18px rgba(20,24,36,0.18), 0 0 0 0.5px rgba(20,24,36,0.4)' : '0 10px 24px rgba(20,24,36,0.18), 0 0 0 0.5px rgba(20,24,36,0.3)',
        zIndex: win.z, display: win.minimized ? 'none' : 'flex', flexDirection: 'column', overflow: 'hidden', opacity: win.focused ? 1 : 0.97, transition: 'opacity 120ms' }}>
      <div onMouseDown={onDragStart} onDoubleClick={() => onFocus(win.id, 'toggleMax')}
        style={{ height: 32, background: win.focused ? 'linear-gradient(180deg, #f4f2ee, #e8e6e0)' : '#f0eee8', borderBottom: '1px solid rgba(20,24,36,0.12)', display: 'flex', alignItems: 'center', padding: '0 10px', flexShrink: 0, cursor: 'grab', userSelect: 'none' }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <button onClick={(e) => { e.stopPropagation(); onClose(win.id); }} style={trafficLight('#fc615d')} />
          <button onClick={(e) => { e.stopPropagation(); onMinimize(win.id); }} style={trafficLight('#fdbc40')} />
          <button onClick={(e) => { e.stopPropagation(); onFocus(win.id, 'toggleMax'); }} style={trafficLight('#34c84a')} />
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600, color: win.focused ? 'var(--ink)' : 'var(--ink-mute)' }}>{meta.title}</div>
        <div style={{ width: 60 }} />
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {AppComp ? <AppComp {...(win.props || {})} /> : <div style={{ padding: 40 }}>Chargement…</div>}
      </div>
      {!win.maximized && (
        <div onMouseDown={onResizeStart} style={{ position: 'absolute', right: 0, bottom: 0, width: 16, height: 16, cursor: 'nwse-resize', background: 'linear-gradient(135deg, transparent 50%, rgba(20,24,36,0.18) 50%)', zIndex: 10 }} />
      )}
    </div>
  );
}

const trafficLight = (color) => ({ width: 12, height: 12, borderRadius: '50%', background: color, border: 'none', padding: 0, cursor: 'pointer', boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.2)' });

// ═════ Temps fictif (lu depuis D.fictif) ════════════════════
const _F = (window.LUMIO_DATA && window.LUMIO_DATA.fictif) || {};
const DOW = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const FICTIF_START_MIN = (_F.startHour != null ? _F.startHour : 7) * 60 + (_F.startMinute != null ? _F.startMinute : 19);
const TOTAL_REAL_MIN = (window.PAC_CONFIG && window.PAC_CONFIG.dureeMinutes) || 210;
const FICTIF_SPAN_DAYS = _F.spanDays || 18;
const RATIO = FICTIF_SPAN_DAYS * 24 * 60 / TOTAL_REAL_MIN;
const FICTIF_START_DAY = _F.startDay || 1;
const FICTIF_END_DAY = _F.endDay || (FICTIF_START_DAY + FICTIF_SPAN_DAYS);
const FICTIF_START_DOW = _F.startDow != null ? _F.startDow : 1; // index dans DOW
const FICTIF_MONTH = _F.monthShort || 'oct.';

function getFictifTime() {
  const startReal = window.LUMIO_TIMER_START || Date.now();
  const realElapsed = (Date.now() - startReal) / 60000;
  const totalMin = FICTIF_START_MIN + realElapsed * RATIO;
  const dayOffset = Math.floor(totalMin / (24 * 60));
  const day = Math.min(FICTIF_START_DAY + dayOffset, FICTIF_END_DAY);
  const minuteOfDay = totalMin % (24 * 60);
  const hh = Math.floor(minuteOfDay / 60).toString().padStart(2, '0');
  const mm = Math.floor(minuteOfDay % 60).toString().padStart(2, '0');
  const dow = DOW[(FICTIF_START_DOW + dayOffset) % 7];
  return { label: `${dow} ${day} ${FICTIF_MONTH}  ${hh}:${mm}`, day, dayOffset };
}
window.__getFictifTime = getFictifTime;

// ═════ Menu bar ═════════════════════════════════════════════
function MenuBar({ activeApp, openLogout }) {
  const [timeLabel, setTimeLabel] = useWmState('');
  const [showUserMenu, setShowUserMenu] = useWmState(false);
  useWmEffect(() => { const tick = () => setTimeLabel(getFictifTime().label); tick(); const id = setInterval(tick, 10000); return () => clearInterval(id); }, []);
  const stu = (window.LUMIO_DATA && window.LUMIO_DATA.student) || {};

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 28, background: 'rgba(245,243,239,0.78)', backdropFilter: 'blur(20px) saturate(1.4)', WebkitBackdropFilter: 'blur(20px) saturate(1.4)', borderBottom: '1px solid rgba(20,24,36,0.08)', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 13, color: 'var(--ink)', zIndex: 10000 }}>
      <div style={{ fontSize: 14, marginRight: 14 }}> </div>
      <div style={{ fontWeight: 700, marginRight: 18 }}>{activeApp || 'Finder'}</div>
      {['Fichier', 'Édition', 'Présentation', 'Aller', 'Fenêtre', 'Aide'].map(m => <div key={m} style={{ marginRight: 14, color: 'var(--ink-soft)', cursor: 'default' }}>{m}</div>)}
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: 14, color: 'var(--ink-soft)', alignItems: 'center' }}>
        <span>🔋 84%</span><span>📶</span><span>🔍</span>
        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{timeLabel}</span>
        <span onClick={() => setShowUserMenu(m => !m)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#c4420f', color: 'white', fontSize: 9, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{stu.initial || (stu.name || '?')[0]}</span>
          {(stu.name || 'Étudiant·e').split(' ')[0]} ▾
          {showUserMenu && (
            <div style={{ position: 'absolute', top: 22, right: 0, background: 'white', border: '1px solid rgba(20,24,36,0.12)', borderRadius: 8, boxShadow: '0 8px 24px rgba(20,24,36,0.18)', minWidth: 180, zIndex: 20000, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--rule)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{stu.name || 'Étudiant·e'}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{stu.role || 'Consultant·e externe'}</div>
              </div>
              <div onClick={() => { setShowUserMenu(false); if (window.confirm('Quitter la session en cours ?')) openLogout(); }} style={{ padding: '9px 14px', fontSize: 12, color: '#c0392b', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>⏻ Quitter la session</div>
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
    { id: 'finder', label: 'Finder' }, { id: 'mail', label: 'Mail' }, { id: 'browser', label: 'Safari' },
    { id: 'pdf', label: 'Aperçu' }, { id: 'voice', label: 'Mémos vocaux' }, { id: 'notes', label: 'Notes' },
    { id: 'notepad', label: 'Bloc-notes' }, { id: 'slack', label: 'Slack' }, { id: 'calendar', label: 'Calendrier' },
    { id: 'trash', label: 'Corbeille' }
  ];
  const items = livrableUnlocked
    ? [...baseItems.slice(0, -1), { id: 'livrable', label: 'Livrable', bounce: true }, baseItems[baseItems.length - 1]]
    : [...baseItems.slice(0, -1), { id: 'livrable', label: 'Livrable' }, baseItems[baseItems.length - 1]];

  useWmEffect(() => {
    if (!document.getElementById('dock-bounce-style')) {
      const s = document.createElement('style'); s.id = 'dock-bounce-style';
      s.textContent = `@keyframes dock-bounce {0%,100%{transform:translateY(0) scale(1)}20%{transform:translateY(-18px) scale(1.1)}40%{transform:translateY(-4px) scale(1.02)}60%{transform:translateY(-10px) scale(1.06)}80%{transform:translateY(-2px) scale(1.01)}}.dock-bounce{animation:dock-bounce 0.9s ease 3}`;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(245,243,239,0.55)', backdropFilter: 'blur(28px) saturate(1.6)', WebkitBackdropFilter: 'blur(28px) saturate(1.6)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 12px 30px rgba(20,24,36,0.18)', borderRadius: 18, padding: '6px 10px', display: 'flex', alignItems: 'flex-end', gap: 6, zIndex: 9999 }}>
      {items.map((it, idx) => {
        const Icon = window[APP_META[it.id] && APP_META[it.id].icon];
        if (!Icon) return null;
        const isOpen = openWindows.some(w => w.app === it.id);
        const bouncing = it.bounce && livrableUnlocked;
        return (
          <div key={it.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={() => openApp(it.id)} title={it.label} className={bouncing ? 'dock-bounce' : ''}
              style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', transition: 'transform 180ms cubic-bezier(.34,1.56,.64,1)' }}
              onMouseEnter={(e) => { if (!bouncing) e.currentTarget.style.transform = 'translateY(-6px) scale(1.18)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}>
              <Icon size={50} />
            </button>
            {bouncing && <div style={{ position: 'absolute', top: -6, right: -4, width: 14, height: 14, borderRadius: '50%', background: '#34c84a', border: '2px solid white', fontSize: 8, color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</div>}
            {isOpen && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(20,24,36,0.5)', position: 'absolute', bottom: -2 }} />}
            {idx === 0 && <div style={{ width: 1, height: 40, background: 'rgba(20,24,36,0.15)', position: 'absolute', right: -7, top: 8 }} />}
          </div>
        );
      })}
    </div>
  );
}

// ═════ Desktop icons (labels lus depuis D.desktopIcons) ══════
function DesktopIcons({ openApp }) {
  const D = window.LUMIO_DATA || {};
  const icons = D.desktopIcons || [
    { app: 'finder', folder: 'mission', label: 'Mission', kind: 'folder' },
    { app: 'finder', folder: 'portraits', label: 'Portraits équipe', kind: 'folder' },
    { app: 'mail', label: 'Mail.app', kind: 'app' },
    { app: 'slack', label: 'Slack.app', kind: 'app' },
    { app: 'notepad', label: 'Mes notes.txt', kind: 'app' }
  ];
  return (
    <>
      {icons.map((it, i) => {
        const meta = APP_META[it.app];
        const Icon = it.kind === 'folder' ? window.FolderIcon : window[meta.icon];
        const x = it.x != null ? it.x : 36;
        const y = it.y != null ? it.y : 56 + i * 118;
        return (
          <div key={i} onDoubleClick={() => openApp(it.app, it.kind === 'folder' ? { openFolder: it.folder } : {})} onClick={() => openApp(it.app, it.kind === 'folder' ? { openFolder: it.folder } : {})}
            style={{ position: 'absolute', left: x, top: y, width: 88, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: 6, borderRadius: 4 }}>
            <Icon size={56} />
            <div style={{ fontSize: 12, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.6)', marginTop: 4, textAlign: 'center', padding: '1px 5px', borderRadius: 2, lineHeight: 1.2 }}>{it.label}</div>
          </div>
        );
      })}
    </>
  );
}

function Wallpaper() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: `radial-gradient(ellipse at 20% 30%, #f5d5b8 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #e8a5b0 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #b8c8d8 0%, transparent 60%), linear-gradient(160deg, #f0c8a8 0%, #d8a098 30%, #98a8c8 60%, #5878a8 100%)`, zIndex: 0 }} />
  );
}

function NotificationStack({ notifications, onDismiss, onClick }) {
  return (
    <div style={{ position: 'fixed', top: 36, right: 12, width: 340, zIndex: 11000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {notifications.map(n => (
        <div key={n.id} onClick={() => onClick(n)} style={{ background: 'rgba(245,243,239,0.94)', backdropFilter: 'blur(20px) saturate(1.6)', WebkitBackdropFilter: 'blur(20px) saturate(1.6)', borderRadius: 12, padding: '12px 14px', boxShadow: '0 8px 24px rgba(20,24,36,0.22), 0 0 0 0.5px rgba(20,24,36,0.1)', cursor: 'pointer', animation: 'slideInNotif 280ms ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: n.color || '#1a2436', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{n.icon || '!'}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{n.app}</div></div>
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

// ═════ PAC Timeline — actes lus depuis PAC_CONFIG.temps ══════
function PacTimeline() {
  const cfg = window.PAC_CONFIG || {};
  const ACTES = (cfg.temps || []).map(t => ({ n: t.n, label: t.label, start: t.debut, end: t.fin }));
  const TOTAL = ACTES.length ? ACTES[ACTES.length - 1].end : 210;
  const [elapsed, setElapsed] = useWmState(0);
  useWmEffect(() => { const tick = () => { if (!window.LUMIO_TIMER_START) { setElapsed(0); return; } setElapsed(Math.floor((Date.now() - window.LUMIO_TIMER_START) / 60000)); }; tick(); const id = setInterval(tick, 15000); return () => clearInterval(id); }, []);
  if (!ACTES.length) return null;
  const pct = Math.min(100, (elapsed / TOTAL) * 100);
  const currentActe = ACTES.find(a => elapsed >= a.start && elapsed < a.end) || ACTES[ACTES.length - 1];
  const urgentStart = ACTES.length >= 2 ? ACTES[ACTES.length - 1].start : TOTAL;
  const isUrgent = elapsed >= urgentStart;
  const remaining = Math.max(0, TOTAL - elapsed);

  return (
    <div style={{ position: 'fixed', top: 32, left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 320px)', maxWidth: 860, zIndex: 9990, background: 'rgba(11,43,45,0.88)', backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)', borderRadius: '0 0 12px 12px', border: '1px solid rgba(93,226,152,0.18)', borderTop: 'none', padding: '6px 14px 7px', boxShadow: '0 4px 20px rgba(11,43,45,0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {ACTES.map(a => {
          const done = elapsed >= a.end, active = a.n === currentActe.n;
          const span = (a.end - a.start);
          return (
            <div key={a.n} style={{ flex: Math.max(1, Math.round(span / 30)), display: 'flex', alignItems: 'center', gap: 4, padding: '3px 7px', borderRadius: 6, background: active ? 'rgba(93,226,152,0.18)' : 'transparent', border: active ? '1px solid rgba(93,226,152,0.35)' : '1px solid transparent', transition: 'all .3s' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, background: done ? '#5DE298' : active ? 'rgba(93,226,152,0.5)' : 'rgba(255,255,255,0.08)', border: active ? '1.5px solid #5DE298' : done ? 'none' : '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: done ? '#0B2B2D' : active ? '#5DE298' : 'rgba(255,255,255,0.3)' }}>{done ? '✓' : a.n}</div>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, color: done ? '#9DF0C4' : active ? '#5DE298' : 'rgba(255,255,255,0.35)', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{a.label}</span>
            </div>
          );
        })}
        <div style={{ marginLeft: 4, flexShrink: 0, background: isUrgent ? 'rgba(232,155,119,0.2)' : 'rgba(255,255,255,0.06)', border: isUrgent ? '1px solid rgba(232,155,119,0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: isUrgent ? '#E89B77' : 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono, monospace)' }}>{remaining}m</div>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: isUrgent ? 'linear-gradient(90deg, #5DE298, #E89B77)' : 'linear-gradient(90deg, #5DE298, #9DF0C4)', borderRadius: 2, transition: 'width 1s linear' }} />
      </div>
    </div>
  );
}

// ═════ Desktop ══════════════════════════════════════════════
function Desktop({ onLogout }) {
  const D = window.LUMIO_DATA || {};
  const EV = D.events || {};
  const [windows, setWindows] = useWmState([]);
  const [zCounter, setZCounter] = useWmState(100);
  const [notifications, setNotifications] = useWmState([]);
  const [livrableUnlocked, setLivrableUnlocked] = useWmState(false);
  const notifSeqRef = useWmRef(0);

  const pushNotif = (n, ttl) => {
    const id = ++notifSeqRef.current;
    setNotifications(ns => [...ns, { id, ...n }]);
    if (ttl !== 0) setTimeout(() => setNotifications(ns => ns.filter(x => x.id !== id)), ttl || 14000);
    return id;
  };

  // Moteur d'événements (data-driven) — réactions au Slack + soumission livrable
  useWmEffect(() => {
    const firstName = ((D.student && D.student.name) || '').split(' ')[0] || '';

    window.__onSlackExchange = (count) => {
      // Débloquer le livrable après N échanges (défaut 1)
      const unlockAt = EV.unlockLivrableAfter != null ? EV.unlockLivrableAfter : 1;
      if (count >= unlockAt) setLivrableUnlocked(true);

      (EV.onSlackExchange || []).filter(e => e.atCount === count).forEach(e => {
        setTimeout(() => {
          if (e.notif) pushNotif(e.notif);
          if (e.injectBonusEmail && !window.LUMIO_DATA._bonusEmailAdded) {
            window.LUMIO_DATA._bonusEmailAdded = true;
            const be = { ...e.injectBonusEmail };
            if (typeof be.body === 'string') be.body = be.body.replace(/\{\{PRENOM\}\}/g, firstName);
            window.LUMIO_DATA._bonusEmail = be;
          }
          if (e.unlockNote) window.LUMIO_DATA['_note_' + e.unlockNote] = true;
        }, e.delay || 2000);
      });
    };

    window.__onLivrableSubmitted = (answers, reflexive, juryResult) => {
      if (EV.onLivrableSubmitted) pushNotif(EV.onLivrableSubmitted);
      window.LUMIO_DATA._livrableSubmitted = { answers, reflexive, juryResult };
      setTimeout(() => { if (window.__onSoniaLivrableReaction) window.__onSoniaLivrableReaction(answers); }, 4000);
    };
    return () => { window.__onSlackExchange = null; window.__onLivrableSubmitted = null; };
  }, []);

  // Déclencheurs basés sur le temps fictif (jour J)
  useWmEffect(() => {
    const fired = new Set();
    const check = setInterval(() => {
      if (!window.__getFictifTime) return;
      const { day } = window.__getFictifTime();
      (EV.dayTriggers || []).forEach((t, i) => {
        if (!fired.has('dt' + i) && day >= t.atDay) { fired.add('dt' + i); pushNotif(t.notif, t.ttl); }
      });
    }, 15000);
    return () => clearInterval(check);
  }, []);

  // Tips contextuels (comportement)
  useWmEffect(() => {
    const openedApps = new Set();
    const slackSent = { v: false };
    window.__onAppOpened = (app) => openedApps.add(app);
    window.__onSlackSent = () => { slackSent.v = true; };
    const ctx = { openedApps, slackSent: () => slackSent.v, livrableUnlocked };
    const timers = (EV.contextTips || []).map(c => setTimeout(() => {
      let ok = true;
      if (c.requireNoneOpened) ok = openedApps.size === 0;
      if (c.requireOpened) ok = ok && c.requireOpened.every(a => openedApps.has(a));
      if (c.requireNotOpened) ok = ok && c.requireNotOpened.every(a => !openedApps.has(a));
      if (c.requireSlackSent === false) ok = ok && !slackSent.v;
      if (c.requireLivrableUnlocked) ok = ok && livrableUnlocked;
      if (ok) pushNotif({ app: 'Guide', icon: '?', color: '#1a6641', title: c.title, body: c.body }, 18000);
    }, c.delay));
    return () => timers.forEach(clearTimeout);
  }, [livrableUnlocked]);

  // Notifications ambiantes (timing réel)
  useWmEffect(() => {
    const timers = (EV.ambient || []).map(ev => setTimeout(() => pushNotif(ev.notif, ev.ttl), ev.t));
    return () => timers.forEach(clearTimeout);
  }, []);

  const openApp = (app, props = {}) => {
    const meta = APP_META[app];
    if (!meta) return;
    if (window.__onAppOpened) window.__onAppOpened(app);
    setWindows(ws => {
      const existing = ws.find(w => w.app === app);
      const nz = zCounter + 1; setZCounter(nz);
      if (existing) return ws.map(w => w.app === app ? { ...w, minimized: false, focused: true, z: nz, props: { ...w.props, ...props } } : { ...w, focused: false });
      const offset = ws.length * 26;
      return [...ws.map(w => ({ ...w, focused: false })), { id: app + '-' + Date.now(), app, props, x: 120 + offset, y: 70 + offset, w: meta.w, h: meta.h, z: nz, focused: true, minimized: false, maximized: false }];
    });
  };
  const focusWin = (id, action) => setWindows(ws => { const nz = zCounter + 1; setZCounter(nz); return ws.map(w => w.id === id ? { ...w, focused: true, z: nz, maximized: action === 'toggleMax' ? !w.maximized : w.maximized, minimized: false } : { ...w, focused: false }); });
  const closeWin = (id) => setWindows(ws => ws.filter(w => w.id !== id));
  const minimizeWin = (id) => setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: true, focused: false } : w));
  const moveWin = (id, x, y) => setWindows(ws => ws.map(w => w.id === id ? { ...w, x, y } : w));
  const resizeWin = (id, w, h) => setWindows(ws => ws.map(win => win.id === id ? { ...win, w, h } : win));
  const dismissNotif = (id) => setNotifications(ns => ns.filter(n => n.id !== id));
  const clickNotif = (n) => { if (n.click) openApp(n.click.app, n.click.props || {}); dismissNotif(n.id); };

  const focusedWin = windows.find(w => w.focused);
  const activeAppTitle = focusedWin ? APP_META[focusedWin.app].title : 'Finder';

  return (
    <WindowsCtx.Provider value={{ open: openApp }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', userSelect: 'none' }}>
        <Wallpaper />
        <MenuBar activeApp={activeAppTitle} openLogout={onLogout} />
        <DesktopIcons openApp={openApp} />
        {windows.map(w => <Win key={w.id} win={w} onFocus={focusWin} onClose={closeWin} onMinimize={minimizeWin} onMove={moveWin} onResize={resizeWin} />)}
        <Dock openApp={openApp} openWindows={windows} livrableUnlocked={livrableUnlocked} />
        <PacTimeline />
        <NotificationStack notifications={notifications} onDismiss={dismissNotif} onClick={clickNotif} />
        <JeffersonFab openApp={openApp} isOpen={windows.some(w => w.app === 'jefferson')} />
        <button onClick={() => openApp('finder', { openFolder: 'guide' })} title="Guide de mission"
          style={{ position: 'fixed', bottom: 90, left: 16, zIndex: 9998, width: 32, height: 32, borderRadius: '50%', background: 'rgba(245,243,239,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 12px rgba(20,24,36,0.18)', color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,102,65,0.85)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,243,239,0.55)'; e.currentTarget.style.color = 'var(--ink-soft)'; }}>?</button>
      </div>
    </WindowsCtx.Provider>
  );
}

// ═════ Jefferson FAB ═══════════════════════════════════════
// Bouton flottant en bas à droite (hors dock). 3 états visuels :
// idle (gris), talking (animé quand fenêtre ouverte), alert (badge rouge).
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
