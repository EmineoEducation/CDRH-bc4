// ══════════════════════════════════════════════════════════════
//  MAIL APP — canonique · piloté par window.LUMIO_DATA
//  · Boîte : D.mailbox si présent, sinon construite depuis
//    D.briefEmail (+ D.jakobEmail = second email du dossier, clé
//    historique) — méta (from/subject/date) lues depuis le data.js
//    du bloc : aucune narration hardcodée.
//  · Email bonus : D._bonusEmail (injecté par le moteur d'événements)
//  · Composer : l'étudiant·e écrit à un personnage, Claude répond
//    dans le rôle après un délai réaliste (fil persistant via
//    LUMIO_DATA._mailThreads, notification via pac:notify).
//  PAC · Éminéo
// ══════════════════════════════════════════════════════════════
const { useState: useStateMail, useEffect: useEffectMail } = React;

// Résout "@cle.sous" contre window.LUMIO_DATA (sinon renvoie la valeur telle quelle)
function _mailResolve(v) {
  if (typeof v !== 'string' || v[0] !== '@') return v;
  const D = window.LUMIO_DATA || {};
  return v.slice(1).split('.').reduce((o, k) => (o == null ? o : o[k]), D) ?? '';
}

function _mailParseFrom(s, fallbackName) {
  const m = /^(.*?)\s*<([^>]+)>\s*$/.exec(s || '');
  if (m) return { name: m[1].trim(), email: m[2].trim() };
  return { name: (s || fallbackName || 'Expéditeur').trim(), email: '' };
}
const _mailInitials = (n) => (n || '?').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const _mailSlugMail = (n) => (n || 'contact').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '') + '@lumio-health.com';

// Boîte de repli quand D.mailbox est absent (blocs au schéma briefEmail)
function _mailFallbackInbox(D, cfg) {
  const out = [];
  if (D.briefEmail) {
    const f = _mailParseFrom(D.briefEmail.from, cfg.commanditaire);
    out.push({ id: 'brief', from: f.name, fromEmail: f.email || D.briefEmail.fromEmail || _mailSlugMail(f.name),
      avatar: _mailInitials(f.name), avatarColor: '#5c2d8f',
      subject: D.briefEmail.subject || 'Brief de mission', date: D.briefEmail.date || '',
      preview: (D.briefEmail.body || '').replace(/\n/g, ' ').slice(0, 90) + '…',
      unread: false, flagged: true, body: D.briefEmail.body || '', tags: ['MISSION'] });
  }
  if (D.jakobEmail) {
    const f = _mailParseFrom(D.jakobEmail.from, cfg.commanditaire);
    out.push({ id: 'doc2', from: f.name, fromEmail: f.email || D.jakobEmail.fromEmail || _mailSlugMail(f.name),
      avatar: _mailInitials(f.name), avatarColor: '#1b3a6b',
      subject: D.jakobEmail.subject || 'Complément de dossier', date: D.jakobEmail.date || '',
      preview: (D.jakobEmail.body || '').replace(/\n/g, ' ').slice(0, 90) + '…',
      unread: false, body: D.jakobEmail.body || '',
      tags: D.jakobEmail.tag ? [D.jakobEmail.tag] : [],
      header: (D.jakobEmail.to || D.jakobEmail.tag) ? { from: D.jakobEmail.from, to: D.jakobEmail.to, subject: D.jakobEmail.subject, date: D.jakobEmail.date, tag: D.jakobEmail.tag } : null,
      forwarded: !!D.jakobEmail.to });
  }
  // Distracteurs neutres — aucune référence au cas
  out.push(
    { id: 'd1', from: 'LinkedIn', fromEmail: 'no-reply@linkedin.com', avatar: 'in', avatarColor: '#0a66c2',
      subject: 'De nouvelles offres correspondent à votre profil', date: '',
      preview: 'Découvrez les opportunités sélectionnées pour vous…', unread: true, distractor: true,
      body: 'De nouvelles offres correspondent à votre profil.\n\nVoir toutes les offres →' },
    { id: 'd2', from: 'URSSAF', fromEmail: 'no-reply@urssaf.fr', avatar: 'U', avatarColor: '#003671',
      subject: 'Échéance trimestrielle — déclaration à venir', date: '',
      preview: 'Votre déclaration trimestrielle doit être effectuée…', unread: false, distractor: true,
      body: 'Madame, Monsieur,\n\nVotre déclaration trimestrielle doit être effectuée avant la fin du mois.\n\nCordialement,\nVos services URSSAF.' }
  );
  return out;
}

function _mailReplyPrompt(recipient, cfg, D, prenom) {
  const contexte = (D.contexte && D.contexte.body) || (D.briefEmail && D.briefEmail.body) || '';
  return 'Tu es ' + recipient.name + ', chez Lumio Health. Univers professionnel de formation : tu restes strictement dans ton rôle.\n' +
    'Mission en cours : "' + (cfg.titre || cfg.epreuve || 'la mission') + '". Commanditaire de la mission : ' + (cfg.commanditaire || 'la direction') + '.\n\n' +
    'Contexte factuel — n\'invente aucun fait hors de ces éléments :\n"""\n' + contexte + '\n"""' +
    (window.__pacSessionBrief ? window.__pacSessionBrief() : '') + '\n\n' +
    'Un·e consultant·e externe (' + prenom + ') t\'envoie l\'email ci-dessous. Réponds par UN email professionnel :\n' +
    '- 60 à 130 mots, le ton naturel de ton rôle, pas de ton de coach ou de professeur\n' +
    '- ne fournis jamais un contenu prêt à copier dans un livrable ; oriente, questionne, donne ton point de vue métier\n' +
    '- si la demande relève plutôt de ' + (cfg.commanditaire || 'la direction') + ', dis-le et redirige\n' +
    '- n\'écris ni "Objet :" ni guillemets — uniquement le corps du mail, terminé par ta signature (ton prénom).';
}

function MailApp({ openId }) {
  const D = window.LUMIO_DATA || {};
  const cfg = window.PAC_CONFIG || window.PASS_CONFIG || {};
  const studentName = (D.student && D.student.name) || 'Étudiant·e';
  const prenom = studentName.split(' ')[0];

  const baseInbox = (D.mailbox && D.mailbox.length)
    ? D.mailbox.map(m => ({ ...m, body: _mailResolve(m.body) }))
    : _mailFallbackInbox(D, cfg);

  const bonus = D._bonusEmail;
  const threads = D._mailThreads || [];
  const inboxFull = [
    ...threads.slice().reverse(),
    ...(bonus ? [{ id: 'bonus', avatar: _mailInitials(bonus.from), avatarColor: '#0a7a6e', unread: true, ...bonus }] : []),
    ...baseInbox
  ];

  const firstId = (inboxFull[0] && inboxFull[0].id) || 'brief';
  const [selectedId, setSelectedId] = useStateMail(openId || firstId);
  const [view, setView] = useStateMail('read');           // read | compose
  const [refresh, setRefresh] = useStateMail(0);
  const [cTo, setCTo] = useStateMail('');
  const [cSubject, setCSubject] = useStateMail('');
  const [cBody, setCBody] = useStateMail('');
  const [cStatus, setCStatus] = useStateMail('');

  useEffectMail(() => { if (openId) { setSelectedId(openId); setView('read'); } }, [openId]);
  useEffectMail(() => {
    const i = setInterval(() => {
      const n = ((window.LUMIO_DATA && window.LUMIO_DATA._mailThreads) || []).length + (window.LUMIO_DATA && window.LUMIO_DATA._bonusEmail ? 1 : 0);
      setRefresh(r => (r === n ? r : n));
    }, 2000);
    return () => clearInterval(i);
  }, []);

  // Destinataires : personnages du dossier (hors distracteurs) + commanditaire
  const recipients = (() => {
    const seen = {}; const out = [];
    const push = (name, email) => {
      const n = (name || '').trim();
      if (!n || seen[n]) return; seen[n] = 1;
      out.push({ name: n, email: email || _mailSlugMail(n) });
    };
    if (cfg.commanditaire) push(cfg.commanditaire);
    baseInbox.filter(m => !m.distractor).forEach(m => push(m.from, m.fromEmail));
    return out;
  })();

  const selected = inboxFull.find(m => m.id === selectedId) || inboxFull[0] || {};
  if (selected && selected.unread && selected._thread) { selected.unread = false; }
  const unreadCount = inboxFull.filter(m => m.unread).length;

  const sendCompose = async () => {
    const rec = recipients.find(r => r.name === cTo) || recipients[0];
    if (!rec || !cSubject.trim() || !cBody.trim() || cStatus === 'envoi') return;
    setCStatus('envoi');
    const nowD = new Date();
    const dateLbl = nowD.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' · ' + nowD.getHours().toString().padStart(2, '0') + ':' + nowD.getMinutes().toString().padStart(2, '0');
    window.LUMIO_DATA._mailThreads = window.LUMIO_DATA._mailThreads || [];
    const sentId = 'sent-' + Date.now();
    window.LUMIO_DATA._mailThreads.push({
      id: sentId, _thread: true, sent: true,
      from: studentName, fromEmail: 'consultant.externe@lumio-health.com',
      avatar: _mailInitials(studentName), avatarColor: '#1a2436',
      subject: cSubject.trim(), date: dateLbl,
      preview: cBody.trim().replace(/\n/g, ' ').slice(0, 90),
      unread: false, body: 'À : ' + rec.name + ' <' + rec.email + '>\n\n' + cBody.trim(), tags: ['ENVOYÉ']
    });
    const subj = cSubject.trim(); const bodyTxt = cBody.trim();
    setCSubject(''); setCBody(''); setView('read'); setSelectedId(sentId); setCStatus('');
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400,
          system: _mailReplyPrompt(rec, cfg, D, prenom),
          messages: [{ role: 'user', content: 'Objet : ' + subj + '\n\n' + bodyTxt }] })
      });
      const data = await resp.json();
      const txt = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
      if (!txt) return;
      // Délai réaliste — le callback n'écrit QUE dans le global (survit à la fermeture de la fenêtre)
      setTimeout(() => {
        const t2 = new Date();
        const d2 = t2.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' · ' + t2.getHours().toString().padStart(2, '0') + ':' + t2.getMinutes().toString().padStart(2, '0');
        window.LUMIO_DATA._mailThreads = window.LUMIO_DATA._mailThreads || [];
        window.LUMIO_DATA._mailThreads.push({
          id: 'reply-' + Date.now(), _thread: true,
          from: rec.name, fromEmail: rec.email,
          avatar: _mailInitials(rec.name), avatarColor: '#0a7a6e',
          subject: 'Re : ' + subj, date: d2,
          preview: txt.replace(/\n/g, ' ').slice(0, 90),
          unread: true, body: txt
        });
        try { window.dispatchEvent(new CustomEvent('pac:notify', { detail: { app: 'Mail', icon: '✉', color: '#1b3a6b', title: rec.name + ' vous a répondu', body: 'Re : ' + subj, click: { app: 'mail' } } })); } catch (e) {}
      }, 45000 + Math.floor(Math.random() * 25000));
    } catch (e) { /* silencieux : l'email envoyé reste visible, la réponse n'arrive pas */ }
  };

  const bodyLines = String(selected.body || '').replace(/\{\{PRENOM\}\}/g, prenom).split('\n');

  return (
    <div style={mailStyles.app}>
      <div style={mailStyles.sidebar} className="scroll">
        <div style={{ padding: '0 12px 10px' }}>
          <button onClick={() => setView(v => v === 'compose' ? 'read' : 'compose')}
            style={{ width: '100%', background: view === 'compose' ? '#134547' : '#1b3a6b', color: 'white', border: 'none', borderRadius: 6, padding: '7px 0', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            ✎ Nouveau message
          </button>
        </div>
        <div style={mailStyles.sbHead}>Boîtes</div>
        <div style={{ ...mailStyles.sbItem, ...mailStyles.sbActive }}>
          <span>📥</span><span>Réception</span>
          <span style={mailStyles.sbCount}>{unreadCount}</span>
        </div>
        <div style={mailStyles.sbItem}><span>⭐</span><span>Suivis</span></div>
        <div style={mailStyles.sbItem}><span>📤</span><span>Envoyés</span><span style={mailStyles.sbCount}>{inboxFull.filter(m => m.sent).length}</span></div>
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
          <div key={m.id}
            onClick={() => { setSelectedId(m.id); setView('read'); if (m.unread && m._thread) { m.unread = false; setRefresh(r => r + 0.1); } }}
            style={{ ...mailStyles.listRow, ...(selectedId === m.id && view === 'read' ? mailStyles.listRowSelected : {}), ...(m.unread ? mailStyles.listRowUnread : {}) }}>
            {m.unread ? <div style={mailStyles.unreadDot} /> : null}
            <div style={{ ...mailStyles.avatar, background: m.avatarColor || '#5b6b85' }}>{m.avatar || _mailInitials(m.from)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={mailStyles.rowTop}>
                <div style={mailStyles.rowFrom}>{m.from}</div>
                <div style={mailStyles.rowDate}>{(m.date || '').split(' · ')[0]}</div>
              </div>
              <div style={mailStyles.rowSubj}>{m.subject}</div>
              <div style={mailStyles.rowPreview}>{m.preview}</div>
              {m.tags && m.tags.length ? (
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  {m.tags.map((t, i) => <span key={i} style={mailStyles.tag}>{t}</span>)}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div style={mailStyles.reader} className="scroll">
        {view === 'compose' ? (
          <div style={{ padding: '20px 28px 40px' }}>
            <h1 style={{ ...mailStyles.subjectLine, fontSize: 22 }}>Nouveau message</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--ink-mute)', width: 24 }}>À :</span>
                <select value={cTo || (recipients[0] && recipients[0].name) || ''} onChange={e => setCTo(e.target.value)}
                  style={{ flex: 1, border: '1px solid var(--rule)', borderRadius: 6, padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', background: 'white', color: 'var(--ink)' }}>
                  {recipients.map(r => <option key={r.name} value={r.name}>{r.name} — {r.email}</option>)}
                </select>
              </div>
              <input value={cSubject} onChange={e => setCSubject(e.target.value)} placeholder="Objet"
                style={{ border: '1px solid var(--rule)', borderRadius: 6, padding: '8px 11px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
              <textarea value={cBody} onChange={e => setCBody(e.target.value)} rows={12} placeholder={'Votre message…'}
                style={{ border: '1px solid var(--rule)', borderRadius: 6, padding: '9px 11px', fontSize: 13.5, fontFamily: 'inherit', lineHeight: 1.6, resize: 'vertical', outline: 'none' }} />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={sendCompose} disabled={!cSubject.trim() || !cBody.trim()}
                  style={{ background: (cSubject.trim() && cBody.trim()) ? '#1b3a6b' : 'rgba(20,24,36,0.1)', color: (cSubject.trim() && cBody.trim()) ? 'white' : 'var(--ink-faint)', border: 'none', borderRadius: 6, padding: '9px 22px', fontSize: 13, fontWeight: 600, cursor: (cSubject.trim() && cBody.trim()) ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                  ↗ Envoyer
                </button>
                <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontStyle: 'italic' }}>Votre interlocuteur répond généralement sous quelques minutes.</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={mailStyles.readerToolbar}>
              <button style={mailStyles.tbBtn}
                onClick={() => { if (selected && selected.from && selected.from !== studentName && !selected.distractor) { setCTo(_mailParseFrom(selected.from, selected.from).name); setCSubject((selected.subject || '').indexOf('Re :') === 0 ? selected.subject : 'Re : ' + (selected.subject || '')); setView('compose'); } }}>↩ Répondre</button>
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
                  <div style={{ ...mailStyles.avatar, width: 36, height: 36, fontSize: 13, background: selected.avatarColor || '#5b6b85' }}>{selected.avatar || _mailInitials(selected.from)}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{selected.from} <span style={{ color: 'var(--ink-faint)', fontWeight: 400 }}>&lt;{selected.fromEmail || ''}&gt;</span></div>
                    <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{selected.sent ? 'De' : 'À'} : {studentName} · {selected.date || ''}</div>
                  </div>
                </div>
              </div>
              {selected.forwarded && selected.header ? (
                <div style={mailStyles.forwardBlock}>
                  <div style={mailStyles.forwardLabel}>— Message d'origine transféré —</div>
                  <div style={mailStyles.forwardMeta}>
                    <div><strong>De :</strong> {selected.header.from}</div>
                    {selected.header.to ? <div><strong>À :</strong> {selected.header.to}</div> : null}
                    {selected.header.cc ? <div><strong>Cc :</strong> {selected.header.cc}</div> : null}
                    <div><strong>Date :</strong> {selected.header.date}</div>
                    {selected.header.tag ? <div style={{ marginTop: 6, fontWeight: 700, color: 'var(--accent)', fontSize: 11 }}>{selected.header.tag}</div> : null}
                  </div>
                </div>
              ) : null}
              <div style={mailStyles.bodyText}>
                {bodyLines.map((line, i) => (
                  <p key={i} style={{ margin: line.trim() === '' ? '0.6em 0' : '0 0 0.55em 0' }}>{line || '\u00A0'}</p>
                ))}
              </div>
            </div>
          </>
        )}
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
