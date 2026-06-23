// ══════════════════════════════════════════════════════════════
//  EXTRAS — Notepad · Finder · Calendar · Trash
//  Générique · piloté par window.LUMIO_DATA. Aucune narration hardcodée.
//  PAC · Éminéo
// ══════════════════════════════════════════════════════════════

// ─── NOTEPAD (bloc-notes étudiant, persistant) ───────────────
function NotepadApp() {
  const D = window.LUMIO_DATA || {};
  const np = D.notepad || {};
  const STORAGE_KEY = 'lumio_notepad_' + ((window.PAC_CONFIG && window.PAC_CONFIG.bloc) || 'bc');
  const [text, setText] = React.useState(() => { try { return localStorage.getItem(STORAGE_KEY) || ''; } catch (e) { return ''; } });
  React.useEffect(() => { try { localStorage.setItem(STORAGE_KEY, text); } catch (e) {} }, [text]);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fffbef', overflow: 'hidden' }}>
      <div style={{ padding: '14px 22px 8px', borderBottom: '1px solid rgba(20,24,36,0.08)', background: 'rgba(245,232,196,0.5)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>{np.title || 'Mes notes — mission'}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>Bloc-notes personnel · sauvegardé automatiquement</div>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)}
        placeholder={np.placeholder || "Tes pensées au fil de l'eau pendant que tu lis le dossier."}
        style={{ flex: 1, width: '100%', padding: '7px 26px 20px', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-display)', fontSize: 16, lineHeight: '31px', color: 'var(--ink)', resize: 'none', backgroundImage: 'repeating-linear-gradient(transparent, transparent 30px, rgba(20,24,36,0.06) 30px, rgba(20,24,36,0.06) 31px)', backgroundAttachment: 'local' }} />
      <div style={{ padding: '8px 22px', borderTop: '1px solid rgba(20,24,36,0.08)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
        <span>{wordCount} mots</span><span>auto-saved · ⌘S</span>
      </div>
    </div>
  );
}
window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.notepad = NotepadApp;

// ─── FINDER ──────────────────────────────────────────────────
function FinderApp({ openFolder }) {
  const D = window.LUMIO_DATA || {};
  const F = D.finder || { folders: {}, order: [] };
  const folders = F.folders || {};
  const order = F.order || Object.keys(folders);
  const { open } = window.useWindows();
  const [folder, setFolder] = React.useState(openFolder || order[0] || '');
  const cur = folders[folder] || { title: '', items: [] };

  const onItemClick = (item) => {
    if (item.kind === 'folder') setFolder(item.folder);
    else if (item.app) open(item.app, item.props || {});
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: 'white' }}>
      <div style={{ width: 180, flexShrink: 0, background: '#e8eaee', padding: '16px 0', borderRight: '1px solid var(--rule)' }}>
        <div style={{ padding: '0 16px', fontSize: 11, color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Favoris</div>
        <div style={{ padding: '4px 16px', fontSize: 13, color: 'var(--ink-soft)' }}>📁 Bureau</div>
        <div style={{ padding: '4px 16px', fontSize: 13, color: 'var(--ink-soft)' }}>📁 Téléchargements</div>
        <div style={{ padding: '4px 16px', fontSize: 13, color: 'var(--ink-soft)' }}>📁 Documents</div>
        <div style={{ padding: '0 16px', fontSize: 11, color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 16, marginBottom: 8 }}>Espaces partagés</div>
        {order.map(fid => {
          const f = folders[fid] || {};
          const active = folder === fid;
          const isGuide = fid === 'guide';
          return (
            <div key={fid} onClick={() => setFolder(fid)}
              style={{ padding: f.indent ? '4px 16px 4px 28px' : '4px 16px', fontSize: 13, color: active ? 'white' : (isGuide ? '#1a6641' : 'var(--ink-soft)'), background: active ? '#3a7bd5' : 'transparent', cursor: 'pointer', fontWeight: isGuide ? 600 : 400 }}>
              {f.icon || '📂'} {f.sidebar || f.title}
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{cur.title}</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{(cur.items || []).length} éléments</div>
        </div>
        <div className="scroll" style={{ flex: 1, padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 18, alignContent: 'start' }}>
          {(cur.items || []).map((item, i) => (
            <div key={i} onDoubleClick={() => onItemClick(item)} onClick={() => onItemClick(item)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: 6, borderRadius: 4 }}>
              {item.kind === 'folder' ? <window.FolderIcon size={56} /> : <window.FileIcon size={56} kind={item.kind} label={item.label} />}
              <div style={{ fontSize: 11.5, textAlign: 'center', marginTop: 6, color: 'var(--ink)', wordBreak: 'break-word', maxWidth: 110, lineHeight: 1.3 }}>{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
window.LUMIO_APPS.finder = FinderApp;

// ─── CALENDAR ─────────────────────────────────────────────────
function CalendarApp() {
  const D = window.LUMIO_DATA || {};
  const C = D.calendar || {};
  const events = C.events || {};
  const deadlineDay = C.deadlineDay || 15;
  const boardDay = C.boardDay || null;
  const startOffset = C.startOffset || 0;
  const daysInMonth = C.daysInMonth || 31;

  const [currentDay, setCurrentDay] = React.useState(() => window.__getFictifTime ? window.__getFictifTime().day : (C.startDay || 1));
  React.useEffect(() => {
    const id = setInterval(() => { if (window.__getFictifTime) setCurrentDay(window.__getFictifTime().day); }, 15000);
    return () => clearInterval(id);
  }, []);

  const today = currentDay;
  const daysLeft = Math.max(0, deadlineDay - today);
  const urgencyColor = daysLeft <= 3 ? '#c4420f' : daysLeft <= 7 ? '#b85c00' : '#1b3a6b';
  const urgencyBg = daysLeft <= 3 ? 'rgba(196,66,15,0.1)' : daysLeft <= 7 ? 'rgba(184,92,0,0.1)' : 'rgba(27,58,107,0.1)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', overflow: 'hidden' }}>
      <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>{C.monthLabel || ''}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{C.todayLabel || ''}</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center', padding: '8px 16px', background: urgencyBg, borderRadius: 8, border: `1px solid ${urgencyColor}22` }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: urgencyColor, lineHeight: 1, fontFamily: 'var(--font-display)' }}>J−{daysLeft}</div>
          <div style={{ fontSize: 10, color: urgencyColor, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginTop: 2 }}>{C.countdownLabel || 'AVANT ÉCHÉANCE'}</div>
        </div>
      </div>

      {C.legend && C.legend.length > 0 && (
        <div style={{ padding: '10px 22px', background: '#fafaf8', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 24, fontSize: 12, flexWrap: 'wrap' }}>
            {C.legend.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                <span style={{ color: 'var(--ink-soft)' }} dangerouslySetInnerHTML={{ __html: l.text }} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'var(--rule)', padding: 1, minHeight: '100%' }}>
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
            <div key={d} style={{ background: '#f4f2ee', padding: '6px 8px', fontSize: 11, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>{d}</div>
          ))}
          {Array.from({ length: startOffset }).map((_, i) => <div key={'e' + i} style={{ background: '#fafaf8', minHeight: 80 }} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
            const isToday = d === today, isBoard = d === boardDay, isDeadline = d === deadlineDay, isPast = d < today;
            const dayEvents = events[d] || [];
            return (
              <div key={d} style={{ background: isPast ? '#fafaf8' : 'white', padding: '6px 8px', minHeight: 80, opacity: isPast ? 0.45 : 1, borderTop: isToday ? '3px solid var(--accent)' : isBoard ? '3px solid #1b3a6b' : isDeadline ? '3px solid #c4420f' : '3px solid transparent' }}>
                <div style={{ width: isToday ? 22 : 'auto', height: isToday ? 22 : 'auto', borderRadius: isToday ? '50%' : 0, background: isToday ? 'var(--accent)' : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: isToday || isBoard || isDeadline ? 700 : 400, color: isToday ? 'white' : isBoard ? '#1b3a6b' : isDeadline ? '#c4420f' : 'var(--ink)', marginBottom: 4 }}>{d}</div>
                {dayEvents.map((ev, ei) => (
                  <div key={ei} style={{ padding: '2px 5px', borderRadius: 3, fontSize: 9.5, lineHeight: 1.35, background: ev.bg, color: ev.color, fontWeight: ev.bold ? 700 : 400, marginBottom: 2 }}>{ev.label}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {C.footer && (
        <div style={{ padding: '10px 22px', borderTop: '1px solid var(--rule)', background: '#fafaf8', fontSize: 11, color: 'var(--ink-mute)', fontStyle: 'italic', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: C.footer }} />
      )}
    </div>
  );
}
window.LUMIO_APPS.calendar = CalendarApp;

// ─── TRASH ────────────────────────────────────────────────────
function TrashApp() {
  const D = window.LUMIO_DATA || {};
  const t = D.trash || {};
  return (
    <div style={{ padding: 40, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', color: 'var(--ink-mute)', textAlign: 'center' }}>
      <div style={{ opacity: 0.4, marginBottom: 20 }}><window.TrashIcon size={80} /></div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>{t.title || 'La corbeille est vide.'}</div>
      <div style={{ fontSize: 12, marginTop: 6 }}>{t.body || "Mais l'idée est bonne. La plupart des consultants commencent par jeter quelque chose."}</div>
    </div>
  );
}
window.LUMIO_APPS.trash = TrashApp;
