// ══════════════════════════════════════════════════════════════
//  MAIL APP — générique · 100% piloté par window.LUMIO_DATA.mailbox
//  Aucune narration hardcodée. PAC · Éminéo
// ══════════════════════════════════════════════════════════════
const { useState: useStateMail, useEffect: useEffectMail } = React;

// Résout "@cle.sous" contre window.LUMIO_DATA (sinon renvoie la valeur telle quelle)
function _mailResolve(v) {
  if (typeof v !== 'string' || v[0] !== '@') return v;
  const D = window.LUMIO_DATA || {};
  return v.slice(1).split('.').reduce((o, k) => (o == null ? o : o[k]), D) ?? '';
}

function MailApp({ openId }) {
  const D = window.LUMIO_DATA || {};
  const baseInbox = (D.mailbox || []).map(m => ({ ...m, body: _mailResolve(m.body) }));

  // Email bonus injecté dynamiquement (ex. après contact Slack)
  const bonus = D._bonusEmail;
  const inboxFull = bonus
    ? [...baseInbox.slice(0, 2), { ...bonus, body: _mailResolve(bonus.body) }, ...baseInbox.slice(2)]
    : baseInbox;

  const firstId = (inboxFull[0] && inboxFull[0].id) || 'brief';
  const [selectedId, setSelectedId] = useStateMail(openId || firstId);
  useEffectMail(() => { if (openId) setSelectedId(openId); }, [openId]);

  // Rafraîchir si l'email bonus arrive en cours de session
  const [, setRefresh] = useStateMail(0);
  useEffectMail(() => {
    const i = setInterval(() => { if (window.LUMIO_DATA && window.LUMIO_DATA._bonusEmail) setRefresh(r => r + 1); }, 2000);
    return () => clearInterval(i);
  }, []);

  const selected = inboxFull.find(m => m.id === selectedId) || inboxFull[0] || {};
  const unreadCount = inboxFull.filter(m => m.unread).length;
  const studentName = (D.student && D.student.name) || 'Étudiant·e';

  return (
    <div style={mailStyles.app}>
      <div style={mailStyles.sidebar} className="scroll">
        <div style={mailStyles.sbHead}>Boîtes</div>
        <div style={{ ...mailStyles.sbItem, ...mailStyles.sbActive }}>
          <span>📥</span><span>Réception</span>
          <span style={mailStyles.sbCount}>{unreadCount}</span>
        </div>
        <div style={mailStyles.sbItem}><span>⭐</span><span>Suivis</span></div>
        <div style={mailStyles.sbItem}><span>📤</span><span>Envoyés</span></div>
        <div style={mailStyles.sbItem}><span>📝</span><span>Brouillons</span></div>
        <div style={mailStyles.sbItem}><span>🗑</span><span>Corbeille</span></div>
        <div style={{ ...mailStyles.sbHead, marginTop: 16 }}>Dossiers intelligents</div>
        <div style={mailStyles.sbItem}><span>🔴</span><span>Mission</span><span style={mailStyles.sbCount}>{inboxFull.filter(m => m.flagged).length}</span></div>
      </div>

      <div style={mailStyles.list} className="scroll">
        <div style={mailStyles.listHead}>
          <div style={mailStyles.listHeadTitle}>Réception</div>
          <div style={mailStyles.listHeadSub}>{inboxFull.length} messages · {unreadCount} non lus</div>
        </div>
        {inboxFull.map(m => (
          <div key={m.id} onClick={() => setSelectedId(m.id)}
            style={{ ...mailStyles.listRow, ...(selectedId === m.id ? mailStyles.listRowSelected : {}), ...(m.unread ? mailStyles.listRowUnread : {}) }}>
            {m.unread && <div style={mailStyles.unreadDot} />}
            <div style={{ ...mailStyles.avatar, background: m.avatarColor || '#5b6b85' }}>{m.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={mailStyles.rowTop}>
                <div style={mailStyles.rowFrom}>{m.from}</div>
                <div style={mailStyles.rowDate}>{(m.date || '').split(' · ')[0]}</div>
              </div>
              <div style={mailStyles.rowSubj}>{m.subject}</div>
              <div style={mailStyles.rowPreview}>{m.preview}</div>
              {m.tags && (
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  {m.tags.map((t, i) => <span key={i} style={mailStyles.tag}>{t}</span>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={mailStyles.reader} className="scroll">
        <div style={mailStyles.readerToolbar}>
          <button style={mailStyles.tbBtn}>↩ Répondre</button>
          <button style={mailStyles.tbBtn}>↪ Transférer</button>
          <button style={mailStyles.tbBtn}>🗑</button>
          <button style={mailStyles.tbBtn}>⭐</button>
          <div style={{ flex: 1 }} />
          <button style={mailStyles.tbBtn}>⋯</button>
        </div>
        <div style={mailStyles.readerBody}>
          <h1 style={mailStyles.subjectLine}>{selected.subject}</h1>
          <div style={mailStyles.metaBlock}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ ...mailStyles.avatar, width: 36, height: 36, fontSize: 13, background: selected.avatarColor || '#5b6b85' }}>{selected.avatar}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{selected.from} <span style={{ color: 'var(--ink-faint)', fontWeight: 400 }}>&lt;{selected.fromEmail}&gt;</span></div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>À : {studentName} · {selected.date}</div>
              </div>
            </div>
          </div>
          {selected.forwarded && selected.header && (
            <div style={mailStyles.forwardBlock}>
              <div style={mailStyles.forwardLabel}>— Message d'origine transféré —</div>
              <div style={mailStyles.forwardMeta}>
                <div><strong>De :</strong> {selected.header.from}</div>
                {selected.header.to && <div><strong>À :</strong> {selected.header.to}</div>}
                {selected.header.cc && <div><strong>Cc :</strong> {selected.header.cc}</div>}
                <div><strong>Date :</strong> {selected.header.date}</div>
                {selected.header.tag && <div style={{ marginTop: 6, fontWeight: 700, color: 'var(--accent)', fontSize: 11 }}>{selected.header.tag}</div>}
              </div>
            </div>
          )}
          <div style={mailStyles.bodyText}>
            {(selected.body || '').split('\n').map((line, i) => (
              <p key={i} style={{ margin: line.trim() === '' ? '0.6em 0' : '0 0 0.55em 0' }}>{line || '\u00A0'}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const mailStyles = {
  app: { display: 'flex', height: '100%', background: '#fff', color: 'var(--ink)', overflow: 'hidden' },
  sidebar: { width: 200, flexShrink: 0, background: 'rgba(244,242,238,0.6)', borderRight: '1px solid var(--rule)', padding: '14px 0', fontSize: 13, overflowY: 'auto' },
  sbHead: { padding: '4px 16px', fontSize: 11, fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 },
  sbItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '5px 16px', fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer' },
  sbActive: { background: 'rgba(60, 100, 180, 0.18)', color: 'var(--ink)', fontWeight: 500 },
  sbCount: { marginLeft: 'auto', fontSize: 11, color: 'var(--ink-faint)' },
  list: { width: 320, flexShrink: 0, borderRight: '1px solid var(--rule)', background: '#fafaf8', overflowY: 'auto' },
  listHead: { padding: '14px 16px 10px', borderBottom: '1px solid var(--rule)', position: 'sticky', top: 0, background: '#fafaf8', zIndex: 2 },
  listHeadTitle: { fontSize: 17, fontWeight: 700, color: 'var(--ink)' },
  listHeadSub: { fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 },
  listRow: { position: 'relative', display: 'flex', gap: 10, padding: '12px 16px 12px 22px', borderBottom: '1px solid var(--rule)', cursor: 'pointer' },
  listRowSelected: { background: 'rgba(60, 100, 180, 0.14)' },
  listRowUnread: { fontWeight: 600 },
  unreadDot: { position: 'absolute', left: 8, top: 18, width: 8, height: 8, borderRadius: '50%', background: '#3a7bd5' },
  avatar: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 600, flexShrink: 0 },
  rowTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  rowFrom: { fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowDate: { fontSize: 11, color: 'var(--ink-faint)', flexShrink: 0, marginLeft: 8, fontWeight: 400 },
  rowSubj: { fontSize: 12.5, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 },
  rowPreview: { fontSize: 11.5, color: 'var(--ink-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 400, marginTop: 2 },
  tag: { fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: 'rgba(196,66,15,0.12)', color: 'var(--accent)', letterSpacing: '0.04em' },
  reader: { flex: 1, background: 'white', minWidth: 0, overflowY: 'auto', minHeight: 0 },
  readerToolbar: { display: 'flex', gap: 4, padding: '8px 14px', borderBottom: '1px solid var(--rule)', position: 'sticky', top: 0, background: 'white', zIndex: 2 },
  tbBtn: { background: 'transparent', border: '1px solid var(--rule)', padding: '5px 12px', borderRadius: 5, fontSize: 12, color: 'var(--ink-soft)', cursor: 'pointer' },
  readerBody: { padding: '20px 28px 40px' },
  subjectLine: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, lineHeight: 1.2, color: 'var(--ink)', marginBottom: 14 },
  metaBlock: { paddingBottom: 14, borderBottom: '1px solid var(--rule)' },
  forwardBlock: { borderLeft: '2px solid var(--ink-faint)', padding: '10px 14px', margin: '14px 0', background: 'rgba(20,24,36,0.03)', fontSize: 12 },
  forwardLabel: { fontSize: 10, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontWeight: 600 },
  forwardMeta: { color: 'var(--ink-soft)', lineHeight: 1.7 },
  bodyText: { marginTop: 18, fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.65, color: 'var(--ink-soft)' }
};

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.mail = MailApp;
