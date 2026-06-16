// ══════════════════════════════════════════════════════════════
//  SLACK APP — BC2 · Jakob Rein commanditaire IA
//  PAC · Parcours Activation Compétences · Éminéo · MSMC
// ══════════════════════════════════════════════════════════════
const { useState: useSlackState, useEffect: useSlackEffect, useRef: useSlackRef } = React;

// ─── Prompt Jakob Rein ────────────────────────────────────────
const JAKOB_PROMPT = `Tu es Jakob Rein, Partner chez Northgate Capital, fonds américain.

Tu attends une recommandation stratégique d'un(e) consultant(e) externe (Lou) missionné(e) par Théo Marczak pour préparer le board de vendredi. Tu n'es pas là pour aider — tu es là pour tester. Chaque hypothèse que Lou t'envoie, tu l'évalues à l'aune d'une seule logique : est-ce que ça protège mon investissement de 22 M$ ?

Contexte que tu connais :
- Lumio Health : medtech B2B, wearable stress, 8 ans, 180 références actives (pas 230 — tu as vu les chiffres)
- Objectif Northgate : 20 M€ CA en 36 mois, passage B2C obligatoire selon ton term sheet
- MDR : procédure en cours, Q2 2027 best case — mais tu sais que TÜV a émis un 3e avis en septembre (Théo te l'a dit au téléphone)
- Budget : tension 200K€ (Théo) vs 380K€ (Sonia) — tu te fous du montant, tu veux un ROI crédible
- Tu as une clause de sortie à 18 mois si le pivot n'est pas engagé — tu ne la mentionnes pas spontanément
- Tu as lu la plateforme de marque de Sonia. C'est un bon document de brand. Ce n'est pas une stratégie.

Ton style :
- Anglicismes naturels ("ROI", "time to market", "make it work", "bottom line")
- Phrases courtes. Directes. Sans politesse inutile.
- Tu ne complimentes jamais une hypothèse — tu la pousses dans ses retranchements
- Si Lou ne chiffre pas, tu demandes des chiffres. Si Lou ne date pas, tu demandes des dates.
- Si Lou propose "on attend la MDR", tu demandes une lettre de l'organisme notifié
- Si Lou propose "on pivote maintenant", tu demandes comment on vend un non-certifié en Europe post-MDR
- Tu ne joues pas le mentor. Tu évalues.

Format de réponse :
- 2 à 3 messages courts séparés par "---SPLIT---"
- Chaque message : 1 à 3 phrases
- Termine par une question précise ou une demande concrète
- Maximum 150 mots cumulés

Ne commence jamais par "Bonjour" ou "Merci". Entre direct dans le sujet.`;

// ─── Prompt réaction livrable soumis ─────────────────────────
const JAKOB_LIVRABLE_PROMPT = `Tu es Jakob Rein, Partner Northgate Capital. Le/la consultant·e vient de te soumettre la recommandation stratégique que tu attendais pour le board. Tu l'as parcourue rapidement. Tu réagis en Slack — en 3 messages maximum, séparés par ---SPLIT---. Tu dis si ça tient la route pour un board d'investisseurs ou pas. Tu poses une question de jury : celle que tu vas poser vendredi matin à Théo si cette recommandation est mise sur la table. 120 mots maximum.`;

function SlackApp({ openChannel }) {
  const D = window.LUMIO_DATA;
  const cfg = window.PASS_CONFIG;

  const channels = [
    { id: 'general', name: 'général', type: 'channel', members: 12 },
    { id: 'mission-board', name: 'mission-board-reco', type: 'channel', members: 4, special: true },
    { id: 'random', name: 'random', type: 'channel', members: 11 },
  ];
  const dms = [
    { id: 'jakob', name: 'Jakob Rein', avatar: 'JR', color: '#1b3a6b', status: 'online' },
    { id: 'sonia', name: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', status: 'online' },
    { id: 'camille', name: 'Camille Ott', avatar: 'CO', color: '#0a7a6e', status: 'online' },
    { id: 'theo', name: 'Théo Marczak', avatar: 'TM', color: '#5c2d8f', status: 'away' }
  ];

  const [unreads, setUnreads] = useSlackState({ 'mission-board': 1, sonia: 1 });
  const [activeId, setActiveId] = useSlackState(openChannel || 'jakob');
  const activeIdRef = useSlackRef(openChannel || 'jakob');
  const setActive = (id) => { activeIdRef.current = id; setActiveId(id); };
  const [chatHistory, setChatHistory] = useSlackState({});
  const [draft, setDraft] = useSlackState('');
  const [sending, setSending] = useSlackState(false);
  const scrollRef = useSlackRef(null);

  const studentName = D?.student?.name || "Lou Bertrand";

  // Messages initiaux
  const seed = {
    jakob: [
      { from: 'Jakob Rein', avatar: 'JR', color: '#1b3a6b', time: '07:25', text: 'Lou. Théo me dit que vous préparez la recommandation pour vendredi.' },
      { from: 'Jakob Rein', avatar: 'JR', color: '#1b3a6b', time: '07:25', text: "One thing : I need a decision, not a diagnosis. If the document doesn't end with a clear recommendation, it's not useful to me." }
    ],
    sonia: [
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: '07:31', text: "Lou, je sais que Théo t'a briefé. Si tu veux mon angle sur la strat avant de plonger dans les docs, je suis dispo." },
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: '07:32', text: "Il y a des choses qu'il ne t'a pas dites. Notamment sur l'accord Darty. Dis-moi si tu veux qu'on se parle." }
    ],
    camille: [
      { from: 'Camille Ott', avatar: 'CO', color: '#0a7a6e', time: '07:44', text: "Hello 👋 Bon courage pour la reco. Si tu veux les vrais chiffres du terrain — pas ceux du deck —, je suis là." }
    ],
    theo: [
      { from: 'Théo Marczak', avatar: 'TM', color: '#5c2d8f', time: '07:20', text: "Lou — bien reçu mon mail ? Le board c'est vendredi. Jeudi soir max pour la reco." }
    ],
    'mission-board': [
      { from: 'Théo Marczak', avatar: 'TM', color: '#5c2d8f', time: 'lun. 09:12', text: "J'ai missionné Lou pour préparer la recommandation board. @sonia @jakob merci de lui faciliter l'accès aux infos utiles." },
      { from: 'Sonia Ferracci', avatar: 'SF', color: '#c4420f', time: 'lun. 09:34', text: "Reçu. Lou — je t'ai ajouté sur les canaux pertinents. Les docs sont sur ton espace partagé." },
      { from: 'Jakob Rein', avatar: 'JR', color: '#1b3a6b', time: 'lun. 16:18', text: "I'll be in Paris Wednesday evening. Expecting a draft before dinner." }
    ],
    general: [
      { from: 'lumio-bot', avatar: '🤖', color: '#9a9ea8', time: '08:00', text: '☀️ Bonjour à tous · 18 personnes connectées ce matin' }
    ]
  };

  useSlackEffect(() => {
    if (Object.keys(chatHistory).length === 0) {
      setChatHistory(seed);
    }
  }, []);

  useSlackEffect(() => {
    if (openChannel) {
      setActive(openChannel);
      setUnreads(u => ({ ...u, [openChannel]: 0 }));
    }
  }, [openChannel]);

  useSlackEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, activeId, sending]);

  // Réaction de Jakob quand le livrable est soumis
  useSlackEffect(() => {
    window.__onSoniaLivrableReaction = async (sections) => {
      setActive('jakob');
      setSending(true);
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;

      const livrableResume = Object.entries(sections || {})
        .map(([code, text]) => `${code} : ${(text || '').substring(0, 300)}`)
        .join('\n\n');

      const prompt = `${JAKOB_LIVRABLE_PROMPT}\n\nRecommandation reçue :\n${livrableResume}`;

      try {
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 400,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        const data = await resp.json();
        const raw = data.content?.map(b => b.text || '').join('') || '';
        const replies = raw.split('---SPLIT---').map(s => s.trim()).filter(Boolean);
        let delay = 600;
        for (const reply of replies) {
          await new Promise(r => setTimeout(r, delay));
          const t = new Date();
          const tt = `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}`;
          setChatHistory(h => ({
            ...h,
            jakob: [...(h.jakob || []), { from: 'Jakob Rein', avatar: 'JR', color: '#1b3a6b', time: tt, text: reply }]
          }));
          if (activeIdRef.current !== 'jakob') {
            setUnreads(u => ({ ...u, jakob: (u.jakob || 0) + 1 }));
          }
          delay = 1200 + reply.length * 8;
        }
      } catch(e) {
        setChatHistory(h => ({
          ...h,
          jakob: [...(h.jakob || []), { from: 'Jakob Rein', avatar: 'JR', color: '#1b3a6b', time, text: 'Received. We\'ll discuss Friday.' }]
        }));
        if (activeIdRef.current !== 'jakob') {
          setUnreads(u => ({ ...u, jakob: (u.jakob || 0) + 1 }));
        }
      } finally {
        setSending(false);
      }
    };
    return () => { window.__onSoniaLivrableReaction = null; };
  }, [chatHistory]);

  const isJakob = activeId === 'jakob';
  const messages = chatHistory[activeId] || [];
  const [exchangeCount, setExchangeCountLocal] = useSlackState(0);

  const sendMessage = async () => {
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    setDraft('');
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const studentInitial = (studentName.split(' ').map(w => w[0]).join('') || 'LB').substring(0, 2).toUpperCase();
    const userMsg = { from: studentName, avatar: studentInitial, color: '#1a2436', time, text, isMe: true };
    setChatHistory(h => ({ ...h, [activeId]: [...(h[activeId] || []), userMsg] }));

    if (isJakob) {
      const newCount = exchangeCount + 1;
      setExchangeCountLocal(newCount);
      if (window.__onSlackExchange) window.__onSlackExchange(newCount);
      if (window.__onSlackSent) window.__onSlackSent();

      setSending(true);
      setTimeout(async () => {
        try {
          const history = (chatHistory.jakob || []).filter(m => !m.typing).map(m =>
            `${m.isMe ? studentName.split(' ')[0] : 'Jakob'}: ${m.text}`
          ).join('\n');
          const userPrompt = `${history}\n${studentName.split(' ')[0]}: ${text}\n\nRéponds maintenant en tant que Jakob (2-3 messages courts séparés par ---SPLIT---).`;

          const resp = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'claude-sonnet-4-6',
              max_tokens: 500,
              system: JAKOB_PROMPT,
              messages: [{ role: 'user', content: userPrompt }]
            })
          });
          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${resp.status}`);
          }
          const data = await resp.json();
          const raw = data.content?.map(b => b.text || '').join('') || '';
          const replies = raw.split('---SPLIT---').map(s => s.trim()).filter(Boolean);
          let delay = 800;
          for (const reply of replies) {
            await new Promise(r => setTimeout(r, delay));
            const t = new Date();
            const tt = `${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}`;
            setChatHistory(h => ({
              ...h,
              jakob: [...(h.jakob || []), { from: 'Jakob Rein', avatar: 'JR', color: '#1b3a6b', time: tt, text: reply }]
            }));
            if (activeIdRef.current !== 'jakob') {
              setUnreads(u => ({ ...u, jakob: (u.jakob || 0) + 1 }));
            }
            delay = 1400 + reply.length * 8;
          }
        } catch(e) {
          setChatHistory(h => ({
            ...h,
            jakob: [...(h.jakob || []), { from: 'Jakob Rein', avatar: 'JR', color: '#1b3a6b', time: 'maintenant', text: 'Network issue. Send me the doc directly.' }]
          }));
          if (activeIdRef.current !== 'jakob') {
            setUnreads(u => ({ ...u, jakob: (u.jakob || 0) + 1 }));
          }
        } finally {
          setSending(false);
        }
      }, 600);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const activeMeta = [...channels, ...dms].find(x => x.id === activeId);
  const activeColor = dms.find(d => d.id === activeId)?.color || '#1a2436';

  return (
    <div style={slackStyles.app}>
      {/* Sidebar */}
      <div style={slackStyles.sidebar} className="scroll">
        <div style={slackStyles.workspace}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Lumio Health</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>● {studentName} · invité</div>
        </div>
        <div style={slackStyles.section}>
          <div style={slackStyles.sectionTitle}>▼ Canaux</div>
          {channels.map(c => (
            <div key={c.id} onClick={() => { setActive(c.id); setUnreads(u => ({ ...u, [c.id]: 0 })); }}
              style={{ ...slackStyles.item, ...(activeId === c.id ? slackStyles.itemActive : {}), ...(unreads[c.id] ? slackStyles.itemUnread : {}) }}>
              <span style={{ opacity: 0.7 }}>#</span>
              <span>{c.name}</span>
              {unreads[c.id] > 0 && <span style={slackStyles.badge}>{unreads[c.id]}</span>}
            </div>
          ))}
        </div>
        <div style={slackStyles.section}>
          <div style={slackStyles.sectionTitle}>▼ Messages directs</div>
          {dms.map(d => (
            <div key={d.id} onClick={() => { setActive(d.id); setUnreads(u => ({ ...u, [d.id]: 0 })); }}
              style={{ ...slackStyles.item, ...(activeId === d.id ? slackStyles.itemActive : {}), ...(unreads[d.id] ? slackStyles.itemUnread : {}) }}>
              <span style={{ ...slackStyles.statusDot, background: d.status === 'online' ? '#2eb67d' : '#9a9ea8' }} />
              <span>{d.name}</span>
              {unreads[d.id] > 0 && <span style={slackStyles.badge}>{unreads[d.id]}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Zone principale */}
      <div style={slackStyles.main}>
        <div style={slackStyles.chatHead}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
              {activeMeta?.type === 'channel' ? '# ' : ''}{activeMeta?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>
              {activeMeta?.type === 'channel'
                ? `${activeMeta.members} membres`
                : (activeMeta?.status === 'online' ? '● En ligne' : '○ Inactif')}
            </div>
          </div>
        </div>

        <div ref={scrollRef} style={slackStyles.chatBody} className="scroll">
          {messages.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-faint)' }}>
              Début de la conversation avec <strong>{activeMeta?.name}</strong>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={slackStyles.message}>
              <div style={{ ...slackStyles.msgAvatar, background: m.color }}>{m.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{m.from}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{m.time}</div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginTop: 1, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.text}</div>
              </div>
            </div>
          ))}
          {sending && isJakob && (
            <div style={slackStyles.message}>
              <div style={{ ...slackStyles.msgAvatar, background: '#1b3a6b' }}>JR</div>
              <div>
                <div style={{ display: 'flex', gap: 4, padding: '6px 0' }}>
                  <span style={slackStyles.typeDot} />
                  <span style={{ ...slackStyles.typeDot, animationDelay: '0.15s' }} />
                  <span style={{ ...slackStyles.typeDot, animationDelay: '0.3s' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>Jakob est en train d'écrire…</div>
              </div>
            </div>
          )}
        </div>

        <div style={slackStyles.composer}>
          <div style={slackStyles.composerInner}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={isJakob
                ? 'Écris à Jakob…  (Entrée pour envoyer)'
                : `Message ${activeMeta?.type === 'channel' ? '#' + activeMeta?.name : activeMeta?.name}`}
              style={slackStyles.textarea}
              rows={2}
            />
            <div style={slackStyles.composerToolbar}>
              <div style={{ display: 'flex', gap: 8, color: 'var(--ink-faint)' }}>
                <span>𝐁</span><span>𝑰</span><span>🔗</span><span>📎</span><span>😊</span>
              </div>
              <button
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                style={{ ...slackStyles.sendBtn, ...(!draft.trim() || sending ? slackStyles.sendBtnDisabled : {}) }}>
                {sending ? '…' : '↑'}
              </button>
            </div>
          </div>
          {isJakob && messages.filter(m => m.isMe).length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
              💬 Jakob attend votre première hypothèse. Envoyez-lui votre lecture du dossier — sa réaction débloque l'accès au Livrable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const slackStyles = {
  app: { display: 'flex', height: '100%', background: 'white', overflow: 'hidden' },
  sidebar: { width: 220, flexShrink: 0, background: '#1b3a6b', color: 'rgba(255,255,255,0.85)', padding: 0, overflowY: 'auto' },
  workspace: { padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  section: { padding: '12px 0' },
  sectionTitle: { padding: '4px 16px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.02em' },
  item: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', fontSize: 13.5, cursor: 'pointer' },
  itemActive: { background: 'rgba(255,255,255,0.15)', color: 'white' },
  itemUnread: { fontWeight: 700, color: 'white' },
  statusDot: { width: 8, height: 8, borderRadius: '50%' },
  badge: { marginLeft: 'auto', background: '#cd2553', color: 'white', fontSize: 10, fontWeight: 700, padding: '0 6px', borderRadius: 9, minWidth: 16, textAlign: 'center', height: 16, lineHeight: '16px' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', background: 'white', minWidth: 0, overflow: 'hidden' },
  chatHead: { padding: '10px 20px', borderBottom: '1px solid var(--rule)', flexShrink: 0 },
  chatBody: { flex: 1, padding: '12px 0', overflowY: 'auto', minHeight: 0 },
  message: { display: 'flex', gap: 12, padding: '6px 20px', alignItems: 'flex-start' },
  msgAvatar: { width: 32, height: 32, borderRadius: 4, color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  typeDot: { width: 6, height: 6, borderRadius: '50%', background: '#9a9ea8', display: 'inline-block', animation: 'typedot 1.2s infinite' },
  composer: { padding: '0 20px 12px', flexShrink: 0 },
  composerInner: { border: '1px solid rgba(20,24,36,0.18)', borderRadius: 8, background: 'white' },
  textarea: { width: '100%', border: 'none', outline: 'none', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', resize: 'none', color: 'var(--ink)' },
  composerToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderTop: '1px solid var(--rule)' },
  sendBtn: { background: '#1b3a6b', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  sendBtnDisabled: { background: 'rgba(20,24,36,0.1)', color: 'var(--ink-faint)', cursor: 'not-allowed' }
};

const slackKeyframes = document.createElement('style');
slackKeyframes.textContent = `@keyframes typedot { 0%,60%,100% { opacity: 0.2; } 30% { opacity: 1; } }`;
document.head.appendChild(slackKeyframes);

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.slack = SlackApp;
