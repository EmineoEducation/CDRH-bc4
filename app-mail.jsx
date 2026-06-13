// ══════════════════════════════════════════════════════════════
//  MAIL APP — Outlook/Apple Mail-like
// ══════════════════════════════════════════════════════════════
const { useState: useStateMail, useEffect: useEffectMail, useRef: useRefMail } = React;

function MailApp({ winId, openId }) {
  const D = window.LUMIO_DATA;

  // Build mailbox BC2
  const inbox = [
    {
      id: 'brief',
      from: 'Théo Marczak',
      fromEmail: 'theo@lumio-health.com',
      avatar: 'TM',
      avatarColor: '#5c2d8f',
      subject: 'Mission urgente — Board Northgate vendredi',
      date: '12/10/26 · 07:19',
      preview: 'Lou, Je vais être direct parce qu\'on n\'a pas le temps. Le board Northgate…',
      unread: false,
      flagged: true,
      body: D.briefEmail.body,
      tags: ['URGENT', 'MISSION']
    },
    {
      id: 'jakob',
      from: 'Jakob Rein',
      fromEmail: 'j.rein@northgate-capital.com',
      avatar: 'JR',
      avatarColor: '#1b3a6b',
      subject: 'Board Friday — what I expect',
      date: '09/10/26 · 16:44',
      preview: 'Short version : I need one scenario. Not three. One…',
      unread: false,
      forwarded: true,
      body: D.jakobEmail.body,
      tags: ['TRANSMIS par Sonia', 'CONFIDENTIEL'],
      header: {
        from: D.jakobEmail.from,
        to: D.jakobEmail.to,
        subject: D.jakobEmail.subject,
        date: D.jakobEmail.date,
        tag: D.jakobEmail.tag
      }
    },
    // Emails distracteurs
    {
      id: 'd1', from: 'LinkedIn', fromEmail: 'no-reply@linkedin.com',
      avatar: 'in', avatarColor: '#0a66c2',
      subject: 'Vous avez 4 nouvelles offres correspondant à votre profil',
      date: '02/10/26 · 18:30',
      preview: 'Senior Brand Strategist · Healthtech — Paris · BNP Paribas Cardif…',
      unread: true, distractor: true,
      body: 'Vous avez 4 nouvelles offres correspondant à votre profil.\n\n→ Senior Brand Strategist · Healthtech — Paris · BNP Paribas Cardif\n→ Directeur de Marque — Doctolib\n→ Head of Brand — Withings\n→ Consultant Senior — Frog Design\n\nVoir toutes les offres →'
    },
    {
      id: 'd2', from: 'Le Slip Français', fromEmail: 'newsletter@leslipfrancais.fr',
      avatar: '🩳', avatarColor: '#1a4d7a',
      subject: '–30% sur la collection Automne 🍂',
      date: '02/10/26 · 09:15',
      preview: 'Le retour du froid, c\'est aussi le retour de nos bestsellers…',
      unread: true, distractor: true,
      body: '—30% sur la collection Automne. Code : AUTOMNE26.'
    },
    {
      id: 'd3', from: 'URSSAF', fromEmail: 'no-reply@urssaf.fr',
      avatar: 'U', avatarColor: '#003671',
      subject: 'Échéance trimestrielle — déclaration à venir',
      date: '01/10/26 · 06:00',
      preview: 'Madame, Monsieur, Votre déclaration trimestrielle doit être effectuée avant le 30/09/2026…',
      unread: false, distractor: true,
      body: 'Madame, Monsieur,\n\nVotre déclaration trimestrielle doit être effectuée avant le 30 septembre 2026.\n\nCordialement, vos services URSSAF.'
    }
  ];

  // Injecter l'email bonus Camille si disponible
  const camilleEmail = window.LUMIO_DATA?._camilleEmail;
  const inboxFull = camilleEmail
    ? [inbox[0], inbox[1], camilleEmail, ...inbox.slice(2)]
    : inbox;

  const [selectedId, setSelectedId] = useStateMail(openId || 'brief');
  useEffectMail(() => { if (openId) setSelectedId(openId); }, [openId]);

  // Rafraîchir si l'email Camille arrive
  const [refresh, setRefresh] = useStateMail(0);
  useEffectMail(() => {
    const interval = setInterval(() => {
      if (window.LUMIO_DATA?._camilleEmail) setRefresh(r => r + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const selected = inboxFull.find(m => m.id === selectedId) || inboxFull[0];

  return (
    <div style={mailStyles.app}>
      <div style={mailStyles.sidebar} className="scroll">
        <div style={mailStyles.sbHead}>Boîtes</div>
        <div style={{...mailStyles.sbItem, ...mailStyles.sbActive}}>
          <span>📥</span><span>Réception</span>
          <span style={mailStyles.sbCount}>2</span>
        </div>
        <div style={mailStyles.sbItem}><span>⭐</span><span>Suivis</span></div>
        <div style={mailStyles.sbItem}><span>📤</span><span>Envoyés</span></div>
        <div style={mailStyles.sbItem}><span>📝</span><span>Brouillons</span></div>
        <div style={mailStyles.sbItem}><span>🗑</span><span>Corbeille</span></div>
        <div style={{...mailStyles.sbHead, marginTop: 16}}>Dossiers intelligents</div>
        <div style={mailStyles.sbItem}><span>🔴</span><span>Mission Lumio</span><span style={mailStyles.sbCount}>2</span></div>
      </div>

      <div style={mailStyles.list} className="scroll">
        <div style={mailStyles.listHead}>
          <div style={mailStyles.listHeadTitle}>Réception</div>
          <div style={mailStyles.listHeadSub}>{inboxFull.length} messages · {inboxFull.filter(m=>m.unread).length} non lus</div>
        </div>
        {inboxFull.map(m => (
          <div
            key={m.id}
            onClick={() => setSelectedId(m.id)}
            style={{
              ...mailStyles.listRow,
              ...(selectedId === m.id ? mailStyles.listRowSelected : {}),
              ...(m.unread ? mailStyles.listRowUnread : {})
            }}>
            {m.unread && <div style={mailStyles.unreadDot} />}
            <div style={{ ...mailStyles.avatar, background: m.avatarColor }}>{m.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={mailStyles.rowTop}>
                <div style={mailStyles.rowFrom}>{m.from}</div>
                <div style={mailStyles.rowDate}>{m.date.split(' · ')[0]}</div>
              </div>
              <div style={mailStyles.rowSubj}>{m.subject}</div>
              <div style={mailStyles.rowPreview}>{m.preview}</div>
              {m.tags && (
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  {m.tags.map((t, i) => (
                    <span key={i} style={mailStyles.tag}>{t}</span>
                  ))}
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
            <div style={{ display:'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ ...mailStyles.avatar, width: 36, height: 36, fontSize: 13, background: selected.avatarColor }}>{selected.avatar}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{selected.from} <span style={{ color: 'var(--ink-faint)', fontWeight: 400 }}>&lt;{selected.fromEmail}&gt;</span></div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>À : {window.LUMIO_DATA?.student?.name || 'Étudiant·e'} · {selected.date}</div>
              </div>
            </div>
          </div>
          {selected.forwarded && (
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
            {selected.body.split('\n').map((line, i) => (
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
  sidebar: {
    width: 200, flexShrink: 0,
    background: 'rgba(244,242,238,0.6)',
    borderRight: '1px solid var(--rule)',
    padding: '14px 0',
    fontSize: 13,
    overflowY: 'auto'
  },
  sbHead: { padding: '4px 16px', fontSize: 11, fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 },
  sbItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '5px 16px', fontSize: 13, color: 'var(--ink-soft)',
    cursor: 'pointer'
  },
  sbActive: { background: 'rgba(60, 100, 180, 0.18)', color: 'var(--ink)', fontWeight: 500 },
  sbCount: { marginLeft: 'auto', fontSize: 11, color: 'var(--ink-faint)' },

  list: {
    width: 320, flexShrink: 0,
    borderRight: '1px solid var(--rule)',
    background: '#fafaf8',
    overflowY: 'auto'
  },
  listHead: { padding: '14px 16px 10px', borderBottom: '1px solid var(--rule)', position: 'sticky', top: 0, background: '#fafaf8', zIndex: 2 },
  listHeadTitle: { fontSize: 17, fontWeight: 700, color: 'var(--ink)' },
  listHeadSub: { fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 },
  listRow: {
    position: 'relative',
    display: 'flex', gap: 10,
    padding: '12px 16px 12px 22px',
    borderBottom: '1px solid var(--rule)',
    cursor: 'pointer'
  },
  listRowSelected: { background: 'rgba(60, 100, 180, 0.14)' },
  listRowUnread: { fontWeight: 600 },
  unreadDot: { position: 'absolute', left: 8, top: 18, width: 8, height: 8, borderRadius: '50%', background: '#3a7bd5' },
  avatar: {
    width: 28, height: 28, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: 11, fontWeight: 600,
    flexShrink: 0
  },
  rowTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  rowFrom: { fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowDate: { fontSize: 11, color: 'var(--ink-faint)', flexShrink: 0, marginLeft: 8, fontWeight: 400 },
  rowSubj: { fontSize: 12.5, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 },
  rowPreview: { fontSize: 11.5, color: 'var(--ink-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 400, marginTop: 2 },
  tag: { fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: 'rgba(196,66,15,0.12)', color: 'var(--accent)', letterSpacing: '0.04em' },

  reader: { flex: 1, background: 'white', minWidth: 0, overflowY: 'auto', minHeight: 0 },
  readerToolbar: {
    display: 'flex', gap: 4, padding: '8px 14px',
    borderBottom: '1px solid var(--rule)',
    position: 'sticky', top: 0, background: 'white', zIndex: 2
  },
  tbBtn: {
    background: 'transparent', border: '1px solid var(--rule)',
    padding: '5px 12px', borderRadius: 5,
    fontSize: 12, color: 'var(--ink-soft)', cursor: 'pointer'
  },
  readerBody: { padding: '20px 28px 40px' },
  subjectLine: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, lineHeight: 1.2, color: 'var(--ink)', marginBottom: 14 },
  metaBlock: { paddingBottom: 14, borderBottom: '1px solid var(--rule)' },
  forwardBlock: { borderLeft: '2px solid var(--ink-faint)', padding: '10px 14px', margin: '14px 0', background: 'rgba(20,24,36,0.03)', fontSize: 12 },
  forwardLabel: { fontSize: 10, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontWeight: 600 },
  forwardMeta: { color: 'var(--ink-soft)', lineHeight: 1.7 },
  bodyText: {
    marginTop: 18,
    fontFamily: 'var(--font-sans)',
    fontSize: 14, lineHeight: 1.65, color: 'var(--ink-soft)'
  }
};

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.mail = MailApp;
