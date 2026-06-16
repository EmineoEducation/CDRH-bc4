// ══════════════════════════════════════════════════════════════
//  JEFFERSON · PAC bc2
//  Composant générique — guide par acte + chat. Lit window.PAC_CONFIG.
// ══════════════════════════════════════════════════════════════

const { useState: useJefState } = React;

function buildJeffersonPrompt(name, elapsed) {
  const cfg = window.PAC_CONFIG || {};
  const prenom = (name || "").split(" ")[0] || "vous";
  const cmd = cfg.commanditaire || "le commanditaire";
  const left = Math.max(0, 210 - elapsed);
  let phase, obj, action;
  if      (elapsed < 20)  { phase = "Acte 1 · Ancrage";      obj = "Observer, lire le brief."; action = "Ouvrir Mail. Lire le brief de " + cmd + "."; }
  else if (elapsed < 50)  { phase = "Acte 2 · Affaire";      obj = "Lire tous les documents."; action = "PDF, Mail, Navigateur, Mémos."; }
  else if (elapsed < 95)  { phase = "Acte 3 · Diagnostic";   obj = "Tester une hypothèse.";    action = "Slack → " + cmd + ". Sa réaction débloque le Livrable."; }
  else if (elapsed < 175) { phase = "Acte 4 · Production";   obj = "Rédiger le livrable " + cfg.bloc + "."; action = "Ouvrir le Livrable. Traiter chaque compétence dans l'ordre."; }
  else                    { phase = "Acte 5 · Réflexion";    obj = (cfg.note_reflexive ? "Note réflexive puis soumettre." : "Relire puis soumettre."); action = (cfg.note_reflexive ? "Onglet réflexif, puis Soumettre." : "Soumettre au jury."); }
  return "Tu es Jefferson, le guide du PAC " + cfg.bloc + ". Tu dis QUOI FAIRE, jamais QUOI PENSER. " +
    "Étudiant·e : " + prenom + ". Temps écoulé : " + elapsed + " min, " + left + " min restantes. " +
    "Phase : " + phase + ". Objectif : " + obj + " Action immédiate : " + action + " " +
    "Réponds en 2 phrases maximum, concret, sans donner la réponse au livrable. " +
    "Texte simple uniquement : aucun markdown, pas de #, pas de ** gras **, pas de listes à puces, pas de titres. Juste des phrases.";
}

function JeffersonApp() {
  const [msgs, setMsgs] = useJefState([{ role: "assistant", text: "Salut " + ((window.LUMIO_DATA && window.LUMIO_DATA.student && window.LUMIO_DATA.student.name || "").split(" ")[0] || "") + " ! Je te dis quoi faire à chaque étape. Pose-moi une question si tu bloques." }]);
  const [draft, setDraft] = useJefState("");
  const [sending, setSending] = useJefState(false);

  const send = async () => {
    const q = draft.trim(); if (!q || sending) return;
    setDraft(""); setMsgs(m => [...m, { role: "user", text: q }]); setSending(true);
    try {
      const elapsed = window.LUMIO_TIMER_START ? Math.floor((Date.now() - window.LUMIO_TIMER_START) / 60000) : 0;
      const name = (window.LUMIO_DATA && window.LUMIO_DATA.student && window.LUMIO_DATA.student.name) || "";
      const resp = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 300, system: buildJeffersonPrompt(name, elapsed), messages: [{ role: "user", content: q }] })
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
