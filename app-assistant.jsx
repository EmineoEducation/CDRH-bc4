// ══════════════════════════════════════════════════════════════
//  JEFFERSON · PAC — guide contextuel générique
//  · Actes lus dynamiquement depuis PAC_CONFIG.temps (plus de seuils figés)
//  · État réel de la session injecté dans le prompt (apps ouvertes,
//    échanges Slack, statut livrable) — lu depuis LUMIO_DATA._* (desktop.jsx)
//  · Historique de conversation transmis à l'API → plus de réponses en boucle
// ══════════════════════════════════════════════════════════════

const { useState: useJefState } = React;

// Conseils génériques par numéro d'acte — les durées viennent de cfg.temps
const JEF_ACTES = {
  1: { obj: "Observer, lire le brief.", action: (cmd) => "Ouvrir Mail. Lire le brief de " + cmd + "." },
  2: { obj: "Lire tous les documents du dossier.", action: () => "PDF, Mail, Navigateur, Mémos vocaux, Finder." },
  3: { obj: "Tester une hypothèse.", action: (cmd) => "Slack → " + cmd + ". Sa réaction débloque le Livrable." },
  4: { obj: "Rédiger le livrable.", action: () => "Ouvrir le Livrable. Traiter chaque compétence dans l'ordre." },
  5: { obj: "Relire puis soumettre.", action: () => "Soumettre au jury." }
};

function jefSnapshot() {
  const cfg = window.PAC_CONFIG || window.PASS_CONFIG || {};
  const D = window.LUMIO_DATA || {};
  const EV = D.events || {};
  const ACTES = cfg.temps || [];
  const TOTAL = ACTES.length ? (ACTES[ACTES.length - 1].fin || 210) : 210;
  const elapsed = window.LUMIO_TIMER_START ? Math.floor((Date.now() - window.LUMIO_TIMER_START) / 60000) : 0;
  const left = Math.max(0, TOTAL - elapsed);
  const acte = ACTES.find(a => elapsed >= a.debut && elapsed < a.fin) || ACTES[ACTES.length - 1] || { n: 1, label: "" };
  const cmd = cfg.commanditaire || "le commanditaire";
  const opened = D._openedApps || [];
  const exch = D._slackExchanges || 0;
  const unlockAt = EV.unlockLivrableAfter != null ? EV.unlockLivrableAfter : 1;
  const livrable = D._livrableSubmitted
    ? "soumis — débrief final reçu"
    : (exch >= unlockAt ? "débloqué, en cours de rédaction" : "pas encore débloqué (il faut d'abord envoyer une hypothèse sur Slack à " + cmd + ")");
  const fictif = window.__getFictifTime ? window.__getFictifTime().label : "";
  const g = JEF_ACTES[acte.n] || JEF_ACTES[1];
  return { cfg, cmd, elapsed, left, TOTAL, acte, opened, exch, livrable, fictif, obj: g.obj, action: g.action(cmd) };
}

function buildJeffersonPrompt(name) {
  const s = jefSnapshot();
  const prenom = (name || "").split(" ")[0] || "vous";
  return "Tu es Jefferson, le guide du PAC " + (s.cfg.bloc || "") + ". Tu dis QUOI FAIRE, jamais QUOI PENSER.\n\n" +
    "ÉTAT RÉEL DE LA SESSION — appuie-toi uniquement là-dessus, ne suppose rien d'autre :\n" +
    "- Étudiant·e : " + prenom + "\n" +
    "- Acte " + s.acte.n + (s.acte.label ? " · " + s.acte.label : "") + " — " + s.elapsed + " min écoulées sur " + s.TOTAL + ", " + s.left + " min restantes" + (s.fictif ? " (temps fictif : " + s.fictif + ")" : "") + "\n" +
    "- Objectif de l'acte : " + s.obj + " Action type : " + s.action + "\n" +
    "- Applications déjà ouvertes : " + (s.opened.length ? s.opened.join(", ") : "aucune") + "\n" +
    "- Échanges Slack avec " + s.cmd + " : " + s.exch + "\n" +
    "- Livrable : " + s.livrable + "\n\n" +
    "RÈGLES :\n" +
    "- Ne conseille jamais une action déjà faite (application déjà ouverte, échange Slack déjà réalisé, livrable déjà débloqué).\n" +
    "- Ne répète jamais un conseil déjà donné dans l'historique de cette conversation : reformule ou passe à l'étape suivante.\n" +
    "- Si l'étudiant·e est en retard sur la phase (ex. Acte 4 mais livrable pas débloqué), dis-le clairement et donne la priorité.\n" +
    "- Réponds en 2 phrases maximum, concret, sans donner la réponse au livrable.\n" +
    "- Texte simple uniquement : aucun markdown, pas de #, pas de ** gras **, pas de listes à puces, pas de titres. Juste des phrases.";
}

function JeffersonApp() {
  const [msgs, setMsgs] = useJefState([{ role: "assistant", text: "Salut " + ((window.LUMIO_DATA && window.LUMIO_DATA.student && window.LUMIO_DATA.student.name || "").split(" ")[0] || "") + " ! Je te dis quoi faire à chaque étape. Pose-moi une question si tu bloques." }]);
  const [draft, setDraft] = useJefState("");
  const [sending, setSending] = useJefState(false);

  const send = async () => {
    const q = draft.trim(); if (!q || sending) return;
    setDraft(""); setMsgs(m => [...m, { role: "user", text: q }]); setSending(true);
    try {
      const name = (window.LUMIO_DATA && window.LUMIO_DATA.student && window.LUMIO_DATA.student.name) || "";
      // Historique complet (sans le message d'accueil), tronqué aux 20 derniers tours
      const history = msgs.slice(1).slice(-20).map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
      const resp = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 300, system: buildJeffersonPrompt(name), messages: [...history, { role: "user", content: q }] })
      });
      const data = await resp.json();
      const txt = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("") || "…";
      setMsgs(m => [...m, { role: "assistant", text: txt }]);
    } catch (e) { setMsgs(m => [...m, { role: "assistant", text: "Je suis momentanément indisponible." }]); }
    setSending(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg)", fontFamily: "var(--font-sans)" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ textAlign: m.role === "user" ? "right" : "left", marginBottom: 10 }}>
            <span style={{ display: "inline-block", maxWidth: "85%", padding: "8px 12px", borderRadius: 12, fontSize: 13, lineHeight: 1.5,
              background: m.role === "user" ? "#1a6641" : "white", color: m.role === "user" ? "white" : "var(--ink)", border: m.role === "user" ? "none" : "1px solid var(--rule)" }}>{m.text}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--rule)", display: "flex", gap: 8 }}>
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder="Demander à Jefferson…" style={{ flex: 1, border: "1px solid var(--rule)", borderRadius: 18, padding: "8px 14px", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
        <button onClick={send} disabled={!draft.trim() || sending}
          style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: draft.trim() && !sending ? "#1a6641" : "rgba(11,43,45,0.1)", color: "white", cursor: draft.trim() && !sending ? "pointer" : "default", fontSize: 15 }}>↑</button>
      </div>
    </div>
  );
}

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.jefferson = JeffersonApp;
