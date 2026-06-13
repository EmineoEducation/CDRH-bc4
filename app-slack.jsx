// ══════════════════════════════════════════════════════════════
//  SLACK APP — générique · piloté par window.LUMIO_DATA.slack + .slackPrompts
//  L'interlocuteur IA = le DM marqué isCommanditaire. Aucune narration hardcodée.
//  PAC · Parcours Activation Compétences · Éminéo
// ══════════════════════════════════════════════════════════════
const { useState: useSlackState, useEffect: useSlackEffect, useRef: useSlackRef } = React;

function SlackApp({ openChannel }) {
  const D = window.LUMIO_DATA || {};
  const cfg = window.PAC_CONFIG || {};
  const S = D.slack || {};
  const prompts = D.slackPrompts || {};

  const channels = S.channels || [];
  const dms = S.dms || [];
  const seed = S.seed || {};
  const workspace = S.workspace || cfg.entreprise || 'Workspace';

  // Interlocuteur IA = DM marqué isCommanditaire (sinon premier DM)
  const ai = dms.find(d => d.isCommanditaire) || dms[0] || { id: 'commanditaire', name: cfg.commanditaire || 'Commanditaire', avatar: 'C', color: '#1b3a6b' };
  const aiId = ai.id;

  const defaultActive = openChannel || aiId || (channels[0] && channels[0].id) || '';
  const [unreads, setUnreads] = useSlackState(S.unreads || {});
  const [activeId, setActiveId] = useSlackState(defaultActive);
  const activeIdRef = useSlackRef(defaultActive);
  const setActive = (id) => { activeIdRef.current = id; setActiveId(id); };
  const [chatHistory, setChatHistory] = useSlackState({});
  const [draft, setDraft] = useSlackState('');
  const [sending, setSending] = useSlackState(false);
  const [exchangeCount, setExchangeCountLocal] = useSlackState(0);
  const scrollRef = useSlackRef(null);

  const studentName = (D.student && D.student.name) || 'Étudiant·e';
  const studentFirst = studentName.split(' ')[0];

  useSlackEffect(() => { if (Object.keys(chatHistory).length === 0) setChatHistory(seed); }, []);
  useSlackEffect(() => { if (openChannel) { setActive(openChannel); setUnreads(u => ({ ...u, [openChannel]: 0 })); } }, [openChannel]);
  useSlackEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [chatHistory, activeId, sending]);

  const pushAiReplies = async (raw, startDelay) => {
    const replies = raw.split('---SPLIT---').map(s => s.trim()).filter(Boolean);
    let delay = startDelay;
    for (const reply of replies) {
      await new Promise(r => setTimeout(r, delay));
      const t = new Date();
      const tt = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
      setChatHistory(h => ({ ...h, [aiId]: [...(h[aiId] || []), { from: ai.name, avatar: ai.avatar, color: ai.color, time: tt, text: reply }] }));
      if (activeIdRef.current !== aiId) setUnreads(u => ({ ...u, [aiId]: (u[aiId] || 0) + 1 }));
      delay = 1300 + reply.length * 8;
    }
  };

  // Réaction du commanditaire quand le livrable est soumis
  useSlackEffect(() => {
    window.__onSoniaLivrableReaction = async (sections) => {
      setActive(aiId);
      setSending(true);
      const resume = Object.entries(sections || {}).map(([code, text]) => `${code} : ${(text || '').substring(0, 300)}`).join('\n\n');
      const prompt = `${prompts.commanditaireLivrable || 'Tu réagis à la production soumise en 2-3 messages courts séparés par ---SPLIT---.'}\n\nProduction reçue :\n${resume}`;
      try {
        const resp = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }) });
        const data = await resp.json();
        const raw = (data.content || []).map(b => b.text || '').join('') || '';
        await pushAiReplies(raw, 600);
      } catch (e) {
        await pushAiReplies('Bien reçu. On en reparle.', 600);
      } finally { setSending(false); }
    };
    return () => { window.__onSoniaLivrableReaction = null; };
  }, [chatHistory]);

  const isAi = activeId === aiId;
  const messages = chatHistory[activeId] || [];

  const sendMessage = async () => {
    if (!draft.trim() || sending) return;
    const text = draft.trim();
    setDraft('');
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const studentInitial = (studentName.split(' ').map(w => w[0]).join('') || '?').substring(0, 2).toUpperCase();
    const userMsg = { from: studentName, avatar: studentInitial, color: '#1a2436', time, text, isMe: true };
    setChatHistory(h => ({ ...h, [activeId]: [...(h[activeId] || []), userMsg] }));

    if (isAi) {
      const newCount = exchangeCount + 1;
      setExchangeCountLocal(newCount);
      if (window.__onSlackExchange) window.__onSlackExchange(newCount);
      if (window.__onSlackSent) window.__onSlackSent();
      setSending(true);
      setTimeout(async () => {
        try {
          const history = (chatHistory[aiId] || []).filter(m => !m.typing).map(m => `${m.isMe ? studentFirst : ai.name.split(' ')[0]}: ${m.text}`).join('\n');
          const userPrompt = `${history}\n${studentFirst}: ${text}\n\nRéponds maintenant en tant que ${ai.name} (2-3 messages courts séparés par ---SPLIT---).`;
          const resp = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 500, system: prompts.commanditaire || ('Tu es ' + ai.name + '.'), messages: [{ role: 'user', content: userPrompt }] }) });
          if (!resp.ok) { const err = await resp.json().catch(() => ({})); throw new Error(err.error || `HTTP ${resp.status}`); }
          const data = await resp.json();
          const raw = (data.content || []).map(b => b.text || '').join('') || '';
          await pushAiReplies(raw, 800);
        } catch (e) {
          await pushAiReplies('Problème réseau. Renvoie-moi ça directement.', 600);
        } finally { setSending(false); }
      }, 600);
    }
  };

  const onKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const activeMeta = [...channels, ...dms].find(x => x.id === activeId);

  return (
    <div style={slackStyles.app}>
      <div style={slackStyles.sidebar} className="scroll">
        <div style={slackStyles.workspace}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{workspace}</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>● {studentName} · invité</div>
        </div>
        <div style={slackStyles.section}>
          <div style={slackStyles.sectionTitle}>▼ Canaux</div>
          {channels.map(c => (
            <div key={c.id} onClick={() => { setActive(c.id); setUnreads(u => ({ ...u, [c.id]: 0 })); }}
              style={{ ...slackStyles.item, ...(activeId === c.id ? slackStyles.itemActive : {}), ...(unreads[c.id] ? slackStyles.itemUnread : {}) }}>
              <span style={{ opacity: 0.7 }}>#</span><span>{c.name}</span>
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

      <div style={slackStyles.main}>
        <div style={slackStyles.chatHead}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{activeMeta && activeMeta.type === 'channel' ? '# ' : ''}{activeMeta && activeMeta.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>{activeMeta && activeMeta.type === 'channel' ? `${activeMeta.members} membres` : (activeMeta && activeMeta.status === 'online' ? '● En ligne' : '○ Inactif')}</div>
          </div>
        </div>

        <div ref={scrollRef} style={slackStyles.chatBody} className="scroll">
          {messages.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--ink-faint)' }}>Début de la conversation avec <strong>{activeMeta && activeMeta.name}</strong></div>
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
          {sending && isAi && (
            <div style={slackStyles.message}>
              <div style={{ ...slackStyles.msgAvatar, background: ai.color }}>{ai.avatar}</div>
              <div>
                <div style={{ display: 'flex', gap: 4, padding: '6px 0' }}>
                  <span style={slackStyles.typeDot} /><span style={{ ...slackStyles.typeDot, animationDelay: '0.15s' }} /><span style={{ ...slackStyles.typeDot, animationDelay: '0.3s' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{ai.name.split(' ')[0]} est en train d'écrire…</div>
              </div>
            </div>
          )}
        </div>

        <div style={slackStyles.composer}>
          <div style={slackStyles.composerInner}>
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown}
              placeholder={isAi ? `Écris à ${ai.name.split(' ')[0]}…  (Entrée pour envoyer)` : `Message ${activeMeta && activeMeta.type === 'channel' ? '#' + activeMeta.name : (activeMeta && activeMeta.name)}`}
              style={slackStyles.textarea} rows={2} />
            <div style={slackStyles.composerToolbar}>
              <div style={{ display: 'flex', gap: 8, color: 'var(--ink-faint)' }}><span>𝐁</span><span>𝑰</span><span>🔗</span><span>📎</span><span>😊</span></div>
              <button onClick={sendMessage} disabled={!draft.trim() || sending} style={{ ...slackStyles.sendBtn, ...(!draft.trim() || sending ? slackStyles.sendBtnDisabled : {}) }}>{sending ? '…' : '↑'}</button>
            </div>
          </div>
          {isAi && messages.filter(m => m.isMe).length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
              💬 {ai.name.split(' ')[0]} attend votre première hypothèse. Envoyez-lui votre lecture du dossier — sa réaction débloque l'accès au Livrable.
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
