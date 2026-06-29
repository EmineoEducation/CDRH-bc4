// ══════════════════════════════════════════════════════════════
//  LIVRABLE APP — Composant canonique unique (tous PAC)
//  Lit tout depuis window.PAC_CONFIG : competences, juryPrompt,
//  epreuve, titre, deadline, commanditaire, note_reflexive, etc.
//  → Jamais de hardcode par bloc. Aucun JURY_PROMPT codé ici.
// ══════════════════════════════════════════════════════════════

const { useState: useLivState } = React;
const _wc = (t) => (t || "").trim() ? (t || "").trim().split(/\s+/).length : 0;

function LivrableApp() {
  const cfg = window.PAC_CONFIG || window.PASS_CONFIG || {};
  const comps = cfg.competences || [];
  const [answers, setAnswers] = useLivState({});
  const [reflexive, setReflexive] = useLivState("");
  const [sending, setSending] = useLivState(false);
  const [verdict, setVerdict] = useLivState("");
  const [err, setErr] = useLivState("");
  const [sent, setSent] = useLivState("");

  const set = (code, v) => setAnswers(a => ({ ...a, [code]: v }));
  const totalMots = comps.reduce((n, c) => n + _wc(answers[c.code]), 0) + _wc(reflexive);
  const allMin = comps.every(c => _wc(answers[c.code]) >= (c.min || 0));
  const reflexiveOk = !cfg.note_reflexive || _wc(reflexive) >= (cfg.noteReflexiveMinMots || 0);
  const canSubmit = allMin && reflexiveOk && totalMots >= (cfg.livrableMinMots || 0) && !sending;

  const submit = async () => {
    setSending(true); setErr(""); setVerdict("");
    try {
      let prod = comps.map(c => "### " + c.code + " — " + c.label + "\n" + (answers[c.code] || "(vide)")).join("\n\n");
      if (cfg.note_reflexive) prod += "\n\n### Note réflexive\n" + (reflexive || "(vide)");
      const resp = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1400,
          system: cfg.juryPrompt || "Tu es le jury certifiant. Évalue la production sur les compétences listées.",
          messages: [{ role: "user", content: "Voici la production à évaluer :\n\n" + prod }]
        })
      });
      if (!resp.ok) throw new Error("Le jury est indisponible (erreur " + resp.status + ").");
      const data = await resp.json();
      const txt = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      setVerdict(txt || "(réponse vide)");
      if (window.__onLivrableSubmitted) window.__onLivrableSubmitted(answers, reflexive, txt);
      window.LUMIO_LOG = window.LUMIO_LOG || {};
      window.LUMIO_LOG.livrableSubmitted = Date.now();
    } catch (e) { setErr(e.message); }
    setSending(false);
  };

  const sendPortfolio = async () => {
    const stu = (window.LUMIO_DATA && window.LUMIO_DATA.student) || {};
    if (!stu.email) { setSent("Aucun email étudiant détecté."); return; }
    setSent("envoi…");
    try {
      const rows = comps.map(c => "<h3 style=\"color:#134547;margin:18px 0 6px;font-family:sans-serif\">" + c.code + " — " + c.label + "</h3><p style=\"white-space:pre-wrap;color:#0B2B2D;line-height:1.55;font-family:sans-serif\">" + ((answers[c.code] || "(vide)")) + "</p>").join("");
      const refl = cfg.note_reflexive
        ? "<h3 style=\"color:#134547;margin:18px 0 6px;font-family:sans-serif\">Note réflexive</h3><p style=\"white-space:pre-wrap;color:#0B2B2D;line-height:1.55;font-family:sans-serif\">" + (reflexive || "(vide)") + "</p>"
        : "";
      const html = "<div style=\"font-family:sans-serif;max-width:680px;margin:auto;color:#0B2B2D\">" +
        "<h1 style=\"color:#0B2B2D;font-size:22px;margin-bottom:4px\">Portfolio de compétences</h1>" +
        "<p style=\"color:#134547;font-size:13px;margin-top:0\"><b>" + (stu.name || "") + "</b> · " + (cfg.dispositif || "PAC") + " " + (cfg.bloc || "") + " · " + (cfg.titre || cfg.epreuve || "") + "</p>" +
        "<hr style=\"border:none;border-top:1px solid #E3FFF0;margin:18px 0\">" +
        rows + refl +
        "<hr style=\"border:none;border-top:1px solid #E3FFF0;margin:18px 0\">" +
        "<h2 style=\"color:#0B2B2D;font-size:16px\">Retour du jury</h2>" +
        "<p style=\"white-space:pre-wrap;color:#0B2B2D;line-height:1.55\">" + verdict + "</p></div>";
      const resp = await fetch("/api/send-portfolio", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: stu.email, studentName: stu.name, bloc: cfg.bloc, html })
      });
      const result = await resp.json().catch(() => ({}));
      if (!resp.ok && !result.completed) throw new Error("erreur " + resp.status);
      const msg = result.sent === false
        ? "✓ Production validée. (Email indisponible : " + (result.warning || "—") + ")"
        : "✓ Portfolio envoyé à " + stu.email;
      setSent(msg);
    } catch (e) { setSent("Échec de l'envoi (" + e.message + ")."); }
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#f7f4ef", padding: "22px 26px", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--accent)", textTransform: "uppercase" }}>
          {(cfg.dispositif || "PAC")} · {cfg.bloc} · Livrable
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: "6px 0 4px" }}>{cfg.epreuve || cfg.titre || "Livrable certifiant"}</h1>
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 18 }}>
          {cfg.commanditaire ? "Commanditaire : " + cfg.commanditaire : null}
          {cfg.commanditaire && cfg.deadline ? " · " : null}
          {cfg.deadline ? "Échéance : " + cfg.deadline : null}
        </div>

        {comps.map(c => {
          const n = _wc(answers[c.code]); const ok = n >= (c.min || 0);
          return (
            <div key={c.code} style={{ background: "white", borderRadius: 10, padding: "16px 18px", marginBottom: 14, border: "1px solid var(--rule)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{c.code} — {c.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: ok ? "#1a6641" : "var(--ink-faint)" }}>{n}/{c.min || 0} mots</span>
              </div>
              {c.placeholder ? <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 8, lineHeight: 1.5 }}>{c.placeholder}</div> : null}
              <textarea value={answers[c.code] || ""} onChange={e => set(c.code, e.target.value)} rows={5}
                style={{ width: "100%", border: "1px solid var(--rule)", borderRadius: 7, padding: "9px 11px", fontSize: 13, fontFamily: "inherit", lineHeight: 1.55, resize: "vertical", outline: "none" }} />
              {c.conseil ? <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 6, fontStyle: "italic" }}>💡 {c.conseil}</div> : null}
            </div>
          );
        })}

        {cfg.note_reflexive ? (
          <div style={{ background: "white", borderRadius: 10, padding: "16px 18px", marginBottom: 14, border: "1px solid var(--rule)" }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
              Note réflexive
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", marginLeft: 8 }}>
                ({_wc(reflexive)}/{cfg.noteReflexiveMinMots || 0} mots)
              </span>
            </div>
            <textarea value={reflexive} onChange={e => setReflexive(e.target.value)} rows={6}
              style={{ width: "100%", border: "1px solid var(--rule)", borderRadius: 7, padding: "9px 11px", fontSize: 13, fontFamily: "inherit", lineHeight: 1.55, resize: "vertical", outline: "none" }} />
          </div>
        ) : null}

        {err ? <div style={{ color: "var(--accent)", fontSize: 12, marginBottom: 10 }}>{err}</div> : null}

        <button onClick={canSubmit ? submit : undefined} disabled={!canSubmit}
          style={{ background: canSubmit ? "#134547" : "rgba(20,24,36,0.1)", color: canSubmit ? "white" : "var(--ink-faint)", border: "none", borderRadius: 7, padding: "11px 24px", fontSize: 13, fontWeight: 600, cursor: canSubmit ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
          {sending ? "Le jury évalue…" : "Soumettre au jury →"}
        </button>

        {verdict ? (
          <div style={{ marginTop: 22, background: "white", borderRadius: 10, padding: "18px 20px", border: "1px solid var(--rule)", whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.6 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 10 }}>Retour du jury</div>
            {verdict}
          </div>
        ) : null}

        {verdict ? (
          <div style={{ marginTop: 16 }}>
            <button onClick={sendPortfolio}
              style={{ background: "#1a6641", color: "white", border: "none", borderRadius: 7, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              ✉ Recevoir mon portfolio par email
            </button>
            {sent ? <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 8 }}>{sent}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.livrable = LivrableApp;
