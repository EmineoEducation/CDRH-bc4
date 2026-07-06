// ══════════════════════════════════════════════════════════════
//  SLACK APP — générique · persona dynamique (cfg.commanditaire)
//  PAC · Parcours Activation Compétences · Éminéo
//  Ne contient aucun contenu figé par affaire : tout est lu depuis
//  window.LUMIO_DATA (D) et window.PAC_CONFIG / window.PASS_CONFIG (cfg).
// ══════════════════════════════════════════════════════════════
const { useState: useSlackState, useEffect: useSlackEffect, useRef: useSlackRef } = React;

// ─── Casting Lumio Health — repères visuels de repli ─────────
// Utilisé seulement si D.personnages ne fournit pas déjà avatar/couleur/rôle
// pour la personne concernée. N'importe quel nom absent de cette table
// reçoit des initiales et une couleur neutre générées automatiquement.
const LUMIO_CAST = {
  'Théo Marczak':   { avatar: 'TM', color: '#5c2d8f', role: 'CEO fondateur' },
  'Sonia Ferracci': { avatar: 'SF', color: '#c4420f', role: 'Directrice Marketing' },
  'Camille Ott':    { avatar: 'CO', color: '#0a7a6e', role: 'Responsable partenariats B2B' },
  'Jakob Rein':     { avatar: 'JR', color: '#1b3a6b', role: 'Partner, Northgate Capital' },
  'Yassine Morel':  { avatar: 'YM', color: '#2d6a4f', role: 'Content Manager' },
  'Isabelle Kwan':  { avatar: 'IK', color: '#7a3b46', role: 'Directrice des Ressources Humaines' }
};

function slackSlugify(name) {
  return (name || 'contact').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'contact';
}

function slackAutoInitials(name) {
  return (name || '??').split(' ').filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase() || '??';
}

// ─── Construction du prompt d'évaluation (dialogue courant) ──
function buildSlackEvalPrompt(primaryName, role, cfg, D) {
  const contexte = (D.contexte && D.contexte.body) || '';
  const brief = (D.briefEmail && D.briefEmail.body) || '';
  const titre = cfg.titre || cfg.epreuve || 'la mission en cours';
  return `Tu es ${primaryName}, ${role} chez Lumio Health.

Tu accompagnes ou tu as mandaté un·e consultant·e externe sur la mission suivante : "${titre}".

Contexte factuel dont tu disposes — n'invente aucun fait qui n'y figure pas :
"""
${contexte}
"""

Le cadrage de la mission, tel qu'il a été transmis :
"""
${brief}
"""

Ta posture dans cet échange Slack :
- Tu évalues les hypothèses du/de la consultant·e sans jamais donner la réponse à sa place.
- Tu relances par une question précise quand une hypothèse manque de méthode, de preuve ou de chiffres issus du dossier.
- Tu gardes le ton et les priorités de ton rôle (${role}) — jamais un ton de coach ou de professeur.
- Si le/la consultant·e ne s'appuie sur aucune source du dossier, tu le relèves directement.

Format de réponse strict :
- 2 à 3 messages courts séparés par "---SPLIT---"
- Chaque message : 1 à 3 phrases
- Termine par une question précise ou une demande concrète
- Maximum 150 mots cumulés
- N'écris jamais "Bonjour" ni "Merci" en ouverture. Entre directement dans le sujet.`;
}

// ─── Prompt de réaction au livrable soumis ────────────────────
function buildSlackLivrablePrompt(primaryName, role, cfg) {
  const titre = cfg.titre || cfg.epreuve || 'la mission';
  return `Tu es ${primaryName}, ${role} chez Lumio Health. Le/la consultant·e externe vient de soumettre sa production pour "${titre}". Tu la parcours rapidement et tu réagis en Slack : dis si ça tient la route par rapport à ce que tu attendais, ce qui te convainc ou t'interroge encore, puis termine par la question exigeante que tu poserais avant de la valider. 2 à 3 messages séparés par "---SPLIT---", 120 mots maximum cumulés. Ne commence jamais par "Bonjour" ou "Merci".`;
}

function SlackApp({ openChannel }) {
  const D = window.LUMIO_DATA;
  const cfg = window.PAC_CONFIG || window.PASS_CONFIG || {};

  // ── Repères visuels : D.personnages (si présent) prime sur LUMIO_CAST ──
  const personnagesData = D.personnages || {};
  const overrides = {};
  Object.keys(personnagesData).forEach(k => {
    const p = personnagesData[k];
    if (p && p.nom) overrides[p.nom] = { avatar: p.avatar, color: p.couleur, role: p.role };
  });
  const castOf = (name) => overrides[name] || LUMIO_CAST[name] || {
    avatar: slackAutoInitials(name), color: '#5b6b85', role: ''
  };

  const slackSeed = D.slackMessages || {};
  const primaryName = cfg.commanditaire
    || (slackSeed.initial && slackSeed.initial[0] && slackSeed.initial[0].from)
    || 'Commanditaire';
  const primaryId = slackSlugify(primaryName);
  const primaryRole = castOf(primaryName).role || 'commanditaire de la mission';
  const primaryFirst = primaryName.split(' ')[0];

  // ── DM list construite depuis les personnes réellement citées dans D.slackMessages ──
  const seenNames = [];
  const pushName = (n) => { if (n && seenNames.indexOf(n) === -1) seenNames.push(n); };
  pushName(primaryName);
  (slackSeed.initial || []).forEach(m => pushName(m.from));
  (slackSeed.delayed || []).forEach(m => pushName(m.from));

  const dms = seenNames.map(name => {
    const info = castOf(name);
    return { id: slackSlugify(name), name, avatar: info.avatar, color: info.color, status: name === primaryName ? 'online' : 'away' };
  });

  const channels = [
    { id: 'general', name: 'général', type: 'channel', members: 12 }
  ];

  const [unreads, setUnreads] = useSlackState({});
  const [activeId, setActiveId] = useSlackState(openChannel || primaryId);
  const activeIdRef = useSlackRef(openChannel || primaryId);
  const setActive = (id) => { activeIdRef.current = id; setActiveId(id); };
  const [chatHistory, setChatHistory] = useSlackState({});
  const [draft, setDraft] = useSlackState('');
  const [sending, setSending] = useSlackState(false);
  const [exchangeCount, setExchangeCountLocal] = useSlackState(0);
  const scrollRef = useSlackRef(null);

  const studentName = (D && D.student && D.student.name) || 'Lou Bertrand';

  // ── Seed initial depuis D.slackMessages ──
  useSlackEffect(() => {
    if (Object.keys(chatHistory).length > 0) return;
    const seed = {};
    seed[primaryId] = (slackSeed.initial || []).map(m => {
      const info = castOf(m.from);
      return { from: m.from, avatar: info.avatar, color: info.color, time: m.time || '', text: m.text };
    });
    seed.general = [
      { from: 'lumio-bot', avatar: '🤖', color: '#9a9ea8', time: '08:00', text: '☀️ Bonjour à tous · 18 personnes connectées ce matin' }
    ];
    setChatHistory(seed);
  }, []);

  // ── Révélation différée des messages "delayed" ──
  useSlackEffect(() => {
    const list = slackSeed.delayed || [];
    const timers = list.map((m, i) => {
      const match = /(\d+)\s*min/i.exec(m.time || '');
      const mins = match ? parseInt(match[1], 10) : (i + 1) * 12;
      const realDelayMs = Math.min(8000 + mins * 400, 30000);
      return setTimeout(() => {
        const chanId = slackSlugify(m.from);
        const info = castOf(m.from);
        setChatHistory(h => ({ ...h, [chanId]: [...(h[chanId] || []), { from: m.from, avatar: info.avatar, color: info.color, time: m.time || '', text: m.text }] }));
        if (activeIdRef.current !== chanId) setUnreads(u => ({ ...u, [chanId]: (u[chanId] || 0) + 1 }));
      }, realDelayMs);
    });
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  useSlackEffect(() => {
    if (openChannel) { setActive(openChannel); setUnreads(u => ({ ...u, [openChannel]: 0 })); }
  }, [openChannel]);

  // ── Alertes temps (émises par le bureau) → messages du commanditaire dans le fil ──
  useSlackEffect(() => {
    const info = castOf(primaryName);
    const nowT = () => { const t = new Date(); return `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`; };
    const toMsg = (text) => ({ from: primaryName, avatar: info.avatar, color: info.color, time: nowT(), text });
    // Rattrapage : alertes émises pendant que la fenêtre Slack était fermée
    setChatHistory(h => {
      const alerts = (window.LUMIO_DATA._timeAlerts || []).map(a => a.text);
      if (!alerts.length) return h;
      const cur = h[primaryId] || [];
      const known = {}; cur.forEach(m => { known[m.text] = true; });
      const add = alerts.filter(t => !known[t]).map(toMsg);
      return add.length ? { ...h, [primaryId]: [...cur, ...add] } : h;
    });
    const onAlert = (e) => {
      const text = (e.detail && e.detail.text) || '';
      if (!text) return;
      setChatHistory(h => {
        const cur = h[primaryId] || [];
        if (cur.some(m => m.text === text)) return h;
        return { ...h, [primaryId]: [...cur, toMsg(text)] };
      });
      if (activeIdRef.current !== primaryId) setUnreads(u => ({ ...u, [primaryId]: (u[primaryId] || 0) + 1 }));
    };
    window.addEventListener('pac:time-alert', onAlert);
    return () => window.removeEventListener('pac:time-alert', onAlert);
  }, []);


  useSlackEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, activeId, sending]);

  // ── Réaction de la persona commanditaire quand le livrable est soumis ──
  useSlackEffect(() => {
    window.__onSoniaLivrableReaction = async (sections) => {
      setActive(primaryId);
      setSending(true);
      const livrableResume = Object.entries(sections || {})
        .map(([code, text]) => `${code} : ${(text || '').substring(0, 300)}`)
        .join('\n\n');
      const prompt = `${buildSlackLivrablePrompt(primaryName, primaryRole, cfg)}\n\nProduction reçue :\n${livrableResume}`;
      const info = castOf(primaryName);
      try {
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, messages: [{ role: 'user', content: prompt }] })
        });
        const data = await resp.json();
        const raw = data.content?.map(b => b.text || '').join('') || '';
        const replies = raw.split('---SPLIT---').map(s => s.trim()).filter(Boolean);
        let delay = 600;
        for (const reply of replies) {
          await new Promise(r => setTimeout(r, delay));
          const t = new Date();
          const tt = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
          setChatHistory(h => ({ ...h, [primaryId]: [...(h[primaryId] || []), { from: primaryName, avatar: info.avatar, color: info.color, time: tt, text: reply }] }));
          if (activeIdRef.current !== primaryId) setUnreads(u => ({ ...u, [primaryId]: (u[primaryId] || 0) + 1 }));
          delay = 1200 + reply.length * 8;
        }
      } catch (e) {
        setChatHistory(h => ({ ...h, [primaryId]: [...(h[primaryId] || []), { from: primaryName, avatar: info.avatar, color: info.color, time: 'maintenant', text: 'Bien reçu. J\'y reviens rapidement.' }] }));
        if (activeIdRef.current !== primaryId) setUnreads(u => ({ ...u, [primaryId]: (u[primaryId] || 0) + 1 }));
      } finally {
        setSending(false);
      }
    };
    return () => { window.__onSoniaLivrableReaction = null; };
  }, [chatHistory]);

  const isPrimary = activeId === primaryId;
  const messages = chatHistory[activeId] || [];

  const sendMessage = async () => {
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    setDraft('');
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const studentInitial = (studentName.split(' ').map(w => w[0]).join('') || 'LB').substring(0, 2).toUpperCase();
    const userMsg = { from: studentName, avatar: studentInitial, color: '#1a2436', time, text, isMe: true };
    setChatHistory(h => ({ ...h, [activeId]: [...(h[activeId] || []), userMsg] }));

    if (!isPrimary) return; // seule la persona commanditaire répond via l'IA

    const newCount = exchangeCount + 1;
    setExchangeCountLocal(newCount);
    if (window.__onSlackExchange) window.__onSlackExchange(newCount);
    if (window.__onSlackSent) window.__onSlackSent();

    setSending(true);
    setTimeout(async () => {
      const info = castOf(primaryName);
      try {
        const history = (chatHistory[primaryId] || []).map(m =>
          `${m.isMe ? studentName.split(' ')[0] : primaryFirst}: ${m.text}`
        ).join('\n');
        const userPrompt = `${history}\n${studentName.split(' ')[0]}: ${text}\n\nRéponds maintenant en tant que ${primaryName} (2-3 messages courts séparés par ---SPLIT---).`;
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 500,
            system: buildSlackEvalPrompt(primaryName, primaryRole, cfg, D) + (window.__pacSessionBrief ? window.__pacSessionBrief() : ''),
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
          const tt = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
          setChatHistory(h => ({ ...h, [primaryId]: [...(h[primaryId] || []), { from: primaryName, avatar: info.avatar, color: info.color, time: tt, text: reply }] }));
          if (activeIdRef.current !== primaryId) setUnreads(u => ({ ...u, [primaryId]: (u[primaryId] || 0) + 1 }));
          delay = 1400 + reply.length * 8;
        }
      } catch (e) {
        setChatHistory(h => ({ ...h, [primaryId]: [...(h[primaryId] || []), { from: primaryName, avatar: info.avatar, color: info.color, time: 'maintenant', text: 'Souci réseau. Renvoie-moi ça directement.' }] }));
        if (activeIdRef.current !== primaryId) setUnreads(u => ({ ...u, [primaryId]: (u[primaryId] || 0) + 1 }));
      } finally {
        setSending(false);
      }
    }, 600);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const activeMeta = [...channels, ...dms].find(x => x.id === activeId);
  const primaryInfo = castOf(primaryName);

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
          {sending && isPrimary && (
            <div style={slackStyles.message}>
              <div style={{ ...slackStyles.msgAvatar, background: primaryInfo.color }}>{primaryInfo.avatar}</div>
              <div>
                <div style={{ display: 'flex', gap: 4, padding: '6px 0' }}>
                  <span style={slackStyles.typeDot} />
                  <span style={{ ...slackStyles.typeDot, animationDelay: '0.15s' }} />
                  <span style={{ ...slackStyles.typeDot, animationDelay: '0.3s' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{primaryFirst} est en train d'écrire…</div>
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
              placeholder={isPrimary
                ? `Écris à ${primaryFirst}…  (Entrée pour envoyer)`
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
          {isPrimary && messages.filter(m => m.isMe).length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
              💬 {primaryFirst} attend votre première hypothèse. Envoyez votre lecture du dossier — sa réaction débloque l'accès au Livrable.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const slackStyles = {
  app: { display: 'flex', height: '100%', background: 'white', overflow: 'hidden' },
  sidebar: { width: 220, flexShrink: 0, background: '#3f0e40', color: 'rgba(255,255,255,0.85)', padding: 0, overflowY: 'auto' },
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
  sendBtn: { background: '#3f0e40', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  sendBtnDisabled: { background: 'rgba(20,24,36,0.1)', color: 'var(--ink-faint)', cursor: 'not-allowed' }
};

const slackKeyframes = document.createElement('style');
slackKeyframes.textContent = `@keyframes typedot { 0%,60%,100% { opacity: 0.2; } 30% { opacity: 1; } }`;
document.head.appendChild(slackKeyframes);

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.slack = SlackApp;
