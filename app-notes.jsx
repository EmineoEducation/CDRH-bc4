// ══════════════════════════════════════════════════════════════
//  NOTES APP — générique · piloté par window.LUMIO_DATA.notes
//  Aucune narration hardcodée. PAC · Éminéo
// ══════════════════════════════════════════════════════════════
const { useState: useNotesState } = React;

function _notesResolve(v) {
  if (typeof v !== 'string' || v[0] !== '@') return v;
  const D = window.LUMIO_DATA || {};
  return v.slice(1).split('.').reduce((o, k) => (o == null ? o : o[k]), D) ?? '';
}

function NotesApp({ openNote }) {
  const D = window.LUMIO_DATA || {};
  const notes = (D.notes || []).map(n => ({ ...n, body: _notesResolve(n.body) }));

  const firstId = (notes[0] && notes[0].id) || '';
  const [selectedId, setSelectedId] = useNotesState(openNote || firstId);
  const note = notes.find(n => n.id === selectedId) || notes[0] || {};

  return (
    <div style={notesStyles.app}>
      <div style={notesStyles.sidebar} className="scroll">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--rule)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Toutes les notes</div>
        </div>
        {notes.map(n => (
          <div key={n.id} onClick={() => setSelectedId(n.id)}
            style={{ ...notesStyles.row, ...(selectedId === n.id ? notesStyles.rowActive : {}) }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{n.title}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 500 }}>{n.date}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.preview}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={notesStyles.editor} className="scroll">
        <div style={{ padding: '8px 28px', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--ink-faint)' }}>
          <span>Aa</span><span>•</span><span>—</span><span>𝐁 𝑰 𝑈̲</span><span>· · ·</span>
          <div style={{ flex: 1 }} />
          <span>{note.date}</span>
        </div>
        <NoteRender note={note} />
      </div>
    </div>
  );
}

function NoteRender({ note }) {
  const render = note.render || 'plain';
  if (render === 'confidential') {
    return (
      <div style={{ padding: '28px 36px', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        {note.kicker && <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: '#c4420f', textTransform: 'uppercase', marginBottom: 12 }}>{note.kicker}</div>}
        <h1 style={{ fontSize: 26, fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: 4 }}>{note.title}</h1>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', borderBottom: '1px solid var(--rule)', paddingBottom: 14, marginBottom: 20 }}>{note.byline || note.date}</div>
        {note.banner && (
          <div style={{ background: '#fff8d8', border: '1px solid #c4420f', padding: '10px 14px', borderRadius: 4, fontSize: 12, color: '#5a3010', lineHeight: 1.55, marginBottom: 20, fontFamily: 'var(--font-sans)' }}>
            ⚠ {note.banner}
          </div>
        )}
        <div style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--ink-soft)', whiteSpace: 'pre-wrap' }}>{note.body}</div>
      </div>
    );
  }
  if (render === 'contexte') {
    return (
      <div style={{ padding: '28px 36px', fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        {note.kicker && <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', color: '#1b3a6b', textTransform: 'uppercase', marginBottom: 12 }}>{note.kicker}</div>}
        <h1 style={{ fontSize: 26, fontWeight: 400, lineHeight: 1.15, marginBottom: 4 }}>{note.title}</h1>
        {note.subtitle && <div style={{ fontSize: 12, color: 'var(--ink-mute)', borderBottom: '1px solid var(--rule)', paddingBottom: 14, marginBottom: 20 }}>{note.subtitle}</div>}
        <div style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--ink-soft)', whiteSpace: 'pre-wrap' }}>{note.body}</div>
      </div>
    );
  }
  return (
    <div style={{ padding: '24px 32px', fontFamily: 'var(--font-display)', fontSize: 14, lineHeight: 1.8, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, marginBottom: 10 }}>{note.title}</h1>
      {note.body}
    </div>
  );
}

const notesStyles = {
  app: { display: 'flex', height: '100%', background: 'white', overflow: 'hidden' },
  sidebar: { width: 240, flexShrink: 0, borderRight: '1px solid var(--rule)', background: '#fafaf8', overflowY: 'auto' },
  row: { padding: '10px 16px', borderBottom: '1px solid var(--rule)', cursor: 'pointer' },
  rowActive: { background: 'rgba(224,181,58,0.18)', borderLeft: '3px solid #e0b53a', paddingLeft: 13 },
  editor: { flex: 1, background: 'white', overflowY: 'auto', minHeight: 0 }
};

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.notes = NotesApp;
