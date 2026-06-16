// ══════════════════════════════════════════════════════════════
//  NOTEPAD — Student's personal notes (persists in localStorage)
//  FINDER — File browser, opens docs into their right apps
//  CALENDAR — Shows the CODIR deadline countdown
//  TRASH — Empty
// ══════════════════════════════════════════════════════════════

function NotepadApp() {
  const STORAGE_KEY = 'lumio_notepad';
  const [text, setText] = React.useState(() => localStorage.getItem(STORAGE_KEY) || '');
  React.useEffect(() => { localStorage.setItem(STORAGE_KEY, text); }, [text]);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fffbef', overflow: 'hidden' }}>
      <div style={{ padding: '14px 22px 8px', borderBottom: '1px solid rgba(20,24,36,0.08)', background: 'rgba(245,232,196,0.5)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>Mes notes — mission Lumio</div>
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>Bloc-notes personnel · sauvegardé automatiquement</div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Tes pensées au fil de l'eau pendant que tu lis le dossier.

▸ Ce qui te frappe en lisant Sonia
▸ Les contradictions entre Sonia et Théo
▸ Ce que dit Camille (et que les autres ne disent pas)
▸ Les questions que tu te poses
▸ Ton hypothèse de positionnement…"
        style={{
          flex: 1,
          width: '100%',
          padding: '20px 26px',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-display)',
          fontSize: 15,
          lineHeight: 1.75,
          color: 'var(--ink)',
          resize: 'none',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 30px, rgba(20,24,36,0.06) 30px, rgba(20,24,36,0.06) 31px)'
        }}
      />
      <div style={{ padding: '8px 22px', borderTop: '1px solid rgba(20,24,36,0.08)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
        <span>{wordCount} mots</span>
        <span>auto-saved · ⌘S</span>
      </div>
    </div>
  );
}
window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.notepad = NotepadApp;

// ─── FINDER ──────────────────────────────────────────────────
function FinderApp({ openFolder }) {
  const { open } = window.useWindows();
  const [folder, setFolder] = React.useState(openFolder || 'mission');

  const folders = {
    mission: {
      title: 'Mission Lumio · Board BC2',
      items: [
        { name: 'Email de mission — Théo Marczak.eml', kind: 'mail', app: 'mail', props: { openId: 'brief' }, label: 'EML' },
        { name: 'Email confidentiel — Jakob Rein.eml', kind: 'mail', app: 'mail', props: { openId: 'jakob' }, label: 'EML' },
        { name: 'Deck Board Q3 2026 — Sonia.pdf', kind: 'pdf', app: 'pdf', label: 'PDF' },
        { name: 'Note interne Théo (CONFIDENTIEL).rtf', kind: 'doc', app: 'notes', props: { openNote: 'theo' }, label: 'RTF' },
        { name: 'Veille concurrentielle — Yassine.pdf', kind: 'pdf', app: 'pdf', label: 'PDF' },
        { name: 'Verbatims Camille Ott — oct.m4a', kind: 'audio', app: 'voice', label: 'M4A' },
        { name: 'Fiche contexte Lumio Health.pdf', kind: 'pdf', app: 'notes', props: { openNote: 'contexte' }, label: 'PDF' },
        { name: 'Revue de presse (3 articles)', kind: 'folder', folder: 'press' },
      ]
    },
    press: {
      title: 'Revue de presse',
      items: [
        { name: 'lesechos-mdr-fracture.html', kind: 'doc', app: 'browser', props: { openTab: 'press-0' }, label: 'WEB' },
        { name: 'hbr-stress-donnee-arme.html', kind: 'doc', app: 'browser', props: { openTab: 'press-1' }, label: 'WEB' },
        { name: '20mn-apple-watch-confiance.html', kind: 'doc', app: 'browser', props: { openTab: 'press-2' }, label: 'WEB' }
      ]
    },
    guide: {
      title: 'Guide de mission',
      items: [
        { name: 'guide_mission_bc2.pdf', kind: 'pdf', app: 'pdf', props: { openGuide: true }, label: 'PDF' }
      ]
    },
    portraits: {
      title: 'Portraits — équipe Lumio',
      items: [
        { name: 'Théo Marczak — L\'Usine Digitale.html', kind: 'doc', app: 'browser', props: { openPortrait: 'theo' }, label: 'WEB' },
        { name: 'Sonia Ferracci — CB News.html', kind: 'doc', app: 'browser', props: { openPortrait: 'sonia' }, label: 'WEB' },
        { name: 'Jakob Rein — Forbes.html', kind: 'doc', app: 'browser', props: { openPortrait: 'jakob' }, label: 'WEB' },
        { name: 'Camille Ott — Action Commerciale.html', kind: 'doc', app: 'browser', props: { openPortrait: 'camille' }, label: 'WEB' },
        { name: 'Yassine Morel — Maddyness.html', kind: 'doc', app: 'browser', props: { openPortrait: 'yassine' }, label: 'WEB' },
      ]
    }
  };

  const cur = folders[folder];

  const onItemClick = (item) => {
    if (item.kind === 'folder') {
      setFolder(item.folder);
    } else if (item.app) {
      open(item.app, item.props || {});
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: 'white' }}>
      <div style={{ width: 180, flexShrink: 0, background: '#e8eaee', padding: '16px 0', borderRight: '1px solid var(--rule)' }}>
        <div style={{ padding: '0 16px', fontSize: 11, color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Favoris</div>
        <div style={{ padding: '4px 16px', fontSize: 13, color: 'var(--ink-soft)' }}>📁 Bureau</div>
        <div style={{ padding: '4px 16px', fontSize: 13, color: 'var(--ink-soft)' }}>📁 Téléchargements</div>
        <div style={{ padding: '4px 16px', fontSize: 13, color: 'var(--ink-soft)' }}>📁 Documents</div>
        <div style={{ padding: '0 16px', fontSize: 11, color: 'var(--ink-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 16, marginBottom: 8 }}>Espaces partagés</div>
        <div onClick={() => setFolder('mission')} style={{ padding: '4px 16px', fontSize: 13, color: folder === 'mission' ? 'white' : 'var(--ink-soft)', background: folder === 'mission' ? '#3a7bd5' : 'transparent', cursor: 'pointer' }}>📂 Mission Lumio</div>
        <div onClick={() => setFolder('press')} style={{ padding: '4px 16px 4px 28px', fontSize: 13, color: folder === 'press' ? 'white' : 'var(--ink-soft)', background: folder === 'press' ? '#3a7bd5' : 'transparent', cursor: 'pointer' }}>📂 Revue de presse</div>
        <div onClick={() => setFolder('guide')} style={{ padding: '4px 16px', fontSize: 13, color: folder === 'guide' ? 'white' : '#1a6641', background: folder === 'guide' ? '#3a7bd5' : 'transparent', cursor: 'pointer', fontWeight: 600 }}>❓ Guide de mission</div>
        <div onClick={() => setFolder('portraits')} style={{ padding: '4px 16px', fontSize: 13, color: folder === 'portraits' ? 'white' : 'var(--ink-soft)', background: folder === 'portraits' ? '#3a7bd5' : 'transparent', cursor: 'pointer' }}>👤 Portraits équipe</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{cur.title}</div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{cur.items.length} éléments</div>
        </div>
        <div className="scroll" style={{ flex: 1, padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 18, alignContent: 'start' }}>
          {cur.items.map((item, i) => (
            <div key={i} onDoubleClick={() => onItemClick(item)} onClick={() => onItemClick(item)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: 6, borderRadius: 4 }}>
              {item.kind === 'folder' ? (
                <window.FolderIcon size={56} />
              ) : (
                <window.FileIcon size={56} kind={item.kind} label={item.label} />
              )}
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
  const boardDay = 16;  // vendredi 16 octobre = board Northgate
  const deadlineDay = 15; // jeudi 15 oct. = deadline reco
  const startOffset = 3; // Oct 2026 commence un jeudi → lun=0, jeu=3

  const [currentDay, setCurrentDay] = React.useState(() => window.__getFictifTime ? window.__getFictifTime().day : 12);
  React.useEffect(() => {
    const id = setInterval(() => {
      if (window.__getFictifTime) setCurrentDay(window.__getFictifTime().day);
    }, 15000);
    return () => clearInterval(id);
  }, []);

  const today = currentDay;
  const daysLeft = Math.max(0, deadlineDay - today);

  const events = {
    13: [{ label: 'Arrivée Jakob à Paris (soir)', color: '#1b3a6b', bg: 'rgba(27,58,107,0.12)' }],
    14: [{ label: 'Draft reco attendu avant dîner', color: '#c4420f', bg: 'rgba(196,66,15,0.12)', bold: true }],
    15: [{ label: '⚠ Deadline reco · 20h00', color: '#c4420f', bg: 'rgba(196,66,15,0.2)', bold: true }],
    16: [{ label: '09h — Board Northgate Capital', color: '#fff', bg: '#1b3a6b', bold: true }],
    20: [{ label: 'Relance TÜV — MDR', color: '#0a7a6e', bg: 'rgba(10,122,110,0.12)' }],
    22: [{ label: 'RDV Malakoff Humanis — Camille', color: '#0a7a6e', bg: 'rgba(10,122,110,0.12)' }],
    27: [{ label: 'CODIR mensuel', color: '#5c2d8f', bg: 'rgba(92,45,143,0.1)' }],
    30: [{ label: 'Clôture Q4 · reporting', color: '#9a9ea8', bg: 'rgba(154,158,168,0.1)' }],
  };

  const urgencyColor = daysLeft <= 3 ? '#c4420f' : daysLeft <= 7 ? '#b85c00' : '#1b3a6b';
  const urgencyBg = daysLeft <= 3 ? 'rgba(196,66,15,0.1)' : daysLeft <= 7 ? 'rgba(184,92,0,0.1)' : 'rgba(27,58,107,0.1)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', overflow: 'hidden' }}>
      <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>Octobre 2026</div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>Aujourd'hui — lundi 12 oct.</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center', padding: '8px 16px', background: urgencyBg, borderRadius: 8, border: `1px solid ${urgencyColor}22` }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: urgencyColor, lineHeight: 1, fontFamily: 'var(--font-display)' }}>J−{daysLeft}</div>
          <div style={{ fontSize: 10, color: urgencyColor, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginTop: 2 }}>AVANT LE BOARD</div>
        </div>
      </div>

      <div style={{ padding: '10px 22px', background: '#fafaf8', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 24, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ color: 'var(--ink-soft)' }}>Deadline reco <strong style={{ color: 'var(--ink)' }}>jeu. 15 oct. 20h</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1b3a6b' }} />
            <span style={{ color: 'var(--ink-soft)' }}>Board Northgate <strong style={{ color: 'var(--ink)' }}>ven. 16 oct.</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0a7a6e' }} />
            <span style={{ color: 'var(--ink-soft)' }}>Malakoff Humanis AO <strong style={{ color: 'var(--ink)' }}>MDR obligatoire</strong></span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'var(--rule)', padding: 1, minHeight: '100%' }}>
          {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => (
            <div key={d} style={{ background: '#f4f2ee', padding: '6px 8px', fontSize: 11, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>{d}</div>
          ))}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={'e'+i} style={{ background: '#fafaf8', minHeight: 80 }} />
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
            const isToday = d === today;
            const isBoard = d === boardDay;
            const isDeadline = d === deadlineDay;
            const isPast = d < today;
            const dayEvents = events[d] || [];
            return (
              <div key={d} style={{
                background: isPast ? '#fafaf8' : 'white',
                padding: '6px 8px', minHeight: 80,
                opacity: isPast ? 0.45 : 1,
                borderTop: isToday ? '3px solid var(--accent)' : isBoard ? '3px solid #1b3a6b' : isDeadline ? '3px solid #c4420f' : '3px solid transparent',
              }}>
                <div style={{
                  width: isToday ? 22 : 'auto', height: isToday ? 22 : 'auto',
                  borderRadius: isToday ? '50%' : 0,
                  background: isToday ? 'var(--accent)' : 'transparent',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: isToday || isBoard || isDeadline ? 700 : 400,
                  color: isToday ? 'white' : isBoard ? '#1b3a6b' : isDeadline ? '#c4420f' : 'var(--ink)',
                  marginBottom: 4,
                }}>{d}</div>
                {dayEvents.map((ev, ei) => (
                  <div key={ei} style={{
                    padding: '2px 5px', borderRadius: 3,
                    fontSize: 9.5, lineHeight: 1.35,
                    background: ev.bg, color: ev.color,
                    fontWeight: ev.bold ? 700 : 400, marginBottom: 2,
                  }}>{ev.label}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '10px 22px', borderTop: '1px solid var(--rule)', background: '#fafaf8', fontSize: 11, color: 'var(--ink-mute)', fontStyle: 'italic', flexShrink: 0 }}>
        Jakob Rein attend une recommandation. Pas un audit. Pas une liste d'options.
        <strong style={{ color: 'var(--ink)', fontStyle: 'normal' }}> Un scénario retenu, argumenté, avec objectifs et projection budgétaire.</strong>
      </div>
    </div>
  );
}
window.LUMIO_APPS.calendar = CalendarApp;

// ─── TRASH ────────────────────────────────────────────────────
function TrashApp() {
  return (
    <div style={{ padding: 40, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', color: 'var(--ink-mute)', textAlign: 'center' }}>
      <div style={{ opacity: 0.4, marginBottom: 20 }}>
        <window.TrashIcon size={80} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>La corbeille est vide.</div>
      <div style={{ fontSize: 12, marginTop: 6 }}>Mais l'idée est bonne. La plupart des consultants commencent par jeter quelque chose.</div>
    </div>
  );
}
window.LUMIO_APPS.trash = TrashApp;
