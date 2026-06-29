// ══════════════════════════════════════════════════════════════
//  LIVRABLE APP v2 — Composant canonique unique (tous PAC)
//  Flux : Évaluation formative → Reprise → Débrief final → Portfolio
//  Lit tout depuis window.PAC_CONFIG. Aucun prompt hardcodé.
// ══════════════════════════════════════════════════════════════

const { useState: useLivState } = React;
const _wc = (t) => (t || "").trim() ? (t || "").trim().split(/\s+/).length : 0;

function LivrableApp() {
  const cfg = window.PAC_CONFIG || window.PASS_CONFIG || {};
  const comps = cfg.competences || [];
  const [answers, setAnswers] = useLivState({});
  const [reflexive, setReflexive] = useLivState("");
  const [sending, setSending] = useLivState(false);
  const [step, setStep] = useLivState("draft");       // draft | feedback | revision | debrief
  const [feedback, setFeedback] = useLivState("");     // retour formatif
  const [debrief, setDebrief] = useLivState("");       // débrief final
  const [err, setErr] = useLivState("");
  const [sent, setSent] = useLivState("");

  const set = (code, v) => setAnswers(a => ({ ...a, [code]: v }));
  const totalMots = comps.reduce((n, c) => n + _wc(answers[c.code]), 0) + _wc(reflexive);
  const allMin = comps.every(c => _wc(answers[c.code]) >= (c.min || 0));
  const reflexiveOk = !cfg.note_reflexive || _wc(reflexive) >= (cfg.noteReflexiveMinMots || 0);
  const canSubmit = allMin && reflexiveOk && totalMots >= (cfg.livrableMinMots || 0) && !sending;

  // ── Construire le texte de production ──
  const buildProd = () => {
    let prod = comps.map(c => "### " + c.code + " — " + c.label + "\n" + (answers[c.code] || "(vide)")).join("\n\n");
    if (cfg.note_reflexive) prod += "\n\n### Note réflexive\n" + (reflexive || "(vide)");
    return prod;
  };

  // ── Étape 1 : Évaluation formative ──
  const submitForFeedback = async () => {
    setSending(true); setErr("");
    try {
      const prod = buildProd();
      const systemPrompt = (cfg.juryPrompt || "Tu évalues la production sur les compétences listées.")
        + "\n\nIMPORTANT : Ceci est une évaluation formative. L'étudiant pourra reprendre sa copie. Sois précis sur les points à améliorer.";
      const resp = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1600,
          system: systemPrompt,
          messages: [{ role: "user", content: "Voici la production à évaluer :\n\n" + prod }]
        })
      });
      if (!resp.ok) throw new Error("Évaluation indisponible (erreur " + resp.status + ").");
      const data = await resp.json();
      const txt = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      setFeedback(txt || "(réponse vide)");
      setStep("feedback");
    } catch (e) { setErr(e.message); }
    setSending(false);
  };

  // ── Étape 2 : Débrief final (après reprise) ──
  const submitFinal = async () => {
    setSending(true); setErr("");
    try {
      const prod = buildProd();
      const systemPrompt = (cfg.juryPrompt || "Tu évalues la production sur les compétences listées.")
        + "\n\nCeci est le débrief FINAL. L'étudiant a déjà reçu un retour formatif et a pu reprendre sa copie. Sois exigeant et conclusif. Donne un niveau global.";
      const resp = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1800,
          system: systemPrompt,
          messages: [{ role: "user", content: "Voici la production finale à évaluer :\n\n" + prod }]
        })
      });
      if (!resp.ok) throw new Error("Débrief indisponible (erreur " + resp.status + ").");
      const data = await resp.json();
      const txt = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      setDebrief(txt || "(réponse vide)");
      setStep("debrief");
      if (window.__onLivrableSubmitted) window.__onLivrableSubmitted(answers, reflexive, txt);
      window.LUMIO_LOG = window.LUMIO_LOG || {};
      window.LUMIO_LOG.livrableSubmitted = Date.now();
    } catch (e) { setErr(e.message); }
    setSending(false);
  };

  // ── Envoi portfolio par email ──
  const sendPortfolio = async () => {
    const stu = (window.LUMIO_DATA && window.LUMIO_DATA.student) || {};
    if (!stu.email) { setSent("Aucun email étudiant détecté."); return; }
    setSent("envoi…");
    try {
      const rows = comps.map(c => "<h3 style=\"color:#134547;margin:18px 0 6px;font-family:'IBM Plex Sans',sans-serif\">" + c.code + " — " + c.label + "</h3><p style=\"white-space:pre-wrap;color:#0B2B2D;line-height:1.55;font-family:'IBM Plex Sans',sans-serif\">" + ((answers[c.code] || "(vide)")) + "</p>").join("");
      const refl = cfg.note_reflexive
        ? "<h3 style=\"color:#134547;margin:18px 0 6px;font-family:'IBM Plex Sans',sans-serif\">Note réflexive</h3><p style=\"white-space:pre-wrap;color:#0B2B2D;line-height:1.55;font-family:'IBM Plex Sans',sans-serif\">" + (reflexive || "(vide)") + "</p>"
        : "";
      const html = "<div style=\"font-family:'IBM Plex Sans',sans-serif;max-width:680px;margin:auto;color:#0B2B2D\">" +
        "<div style=\"background:#0B2B2D;padding:24px 28px;border-radius:10px 10px 0 0\">" +
        "<img src=\"https://emineo-pac.vercel.app/logo-emineo-white.png\" alt=\"Éminéo\" style=\"height:28px;margin-bottom:12px\" />" +
        "<h1 style=\"color:#5DE298;font-size:20px;margin:0 0 4px\">Portfolio de compétences</h1>" +
        "<p style=\"color:#E3FFF0;font-size:13px;margin:0\">" + (stu.name || "") + " · " + (cfg.dispositif || "PAC") + " " + (cfg.bloc || "") + " · " + (cfg.titre || cfg.epreuve || "") + "</p>" +
        "</div>" +
        "<div style=\"padding:24px 28px;border:1px solid #E3FFF0;border-top:none;border-radius:0 0 10px 10px\">" +
        rows + refl +
        "<hr style=\"border:none;border-top:2px solid #5DE298;margin:24px 0\">" +
        "<h2 style=\"color:#0B2B2D;font-size:16px;margin-bottom:8px\">Débrief de compétences</h2>" +
        "<div style=\"white-space:pre-wrap;color:#0B2B2D;line-height:1.55;font-size:13px\">" + debrief + "</div>" +
        "<hr style=\"border:none;border-top:1px solid #E3FFF0;margin:24px 0\">" +
        "<p style=\"font-size:11px;color:#999;text-align:center\">Ce document a été généré automatiquement par le dispositif PAC · Éminéo Education<br>Ne pas répondre à cet email.</p>" +
        "</div></div>";
      const resp = await fetch("/api/send-portfolio", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: stu.email, studentName: stu.name, bloc: cfg.bloc, html,
          campus: stu.campus || "" })
      });
      const result = await resp.json().catch(() => ({}));
      if (!resp.ok && !result.completed) throw new Error("erreur " + resp.status);
      setSent(result.sent === false
        ? "✓ Production validée. (Email temporairement indisponible)"
        : "✓ Portfolio envoyé à " + stu.email);
    } catch (e) { setSent("Échec de l'envoi (" + e.message + ")."); }
  };

  // ── Reprise après feedback ──
  const revise = () => { setStep("revision"); };

  // ══════════════ RENDU ══════════════
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

        {/* ── Champs par compétence ── */}
        {comps.map(c => {
          const n = _wc(answers[c.code]); const ok = n >= (c.min || 0);
          const locked = step === "debrief";
          return (
            <div key={c.code} style={{ background: "white", borderRadius: 10, padding: "16px 18px", marginBottom: 14, border: "1px solid var(--rule)", opacity: locked ? 0.7 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{c.code} — {c.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: ok ? "#1a6641" : "var(--ink-faint)" }}>{n}/{c.min || 0} mots</span>
              </div>
              {c.placeholder ? <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 8, lineHeight: 1.5 }}>{c.placeholder}</div> : null}
              <textarea value={answers[c.code] || ""} onChange={e => set(c.code, e.target.value)} rows={5} disabled={locked}
                style={{ width: "100%", border: "1px solid var(--rule)", borderRadius: 7, padding: "9px 11px", fontSize: 13, fontFamily: "inherit", lineHeight: 1.55, resize: "vertical", outline: "none", background: locked ? "#f0f0f0" : "white" }} />
              {c.conseil ? <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 6, fontStyle: "italic" }}>💡 {c.conseil}</div> : null}
            </div>
          );
        })}

        {/* ── Note réflexive ── */}
        {cfg.note_reflexive ? (
          <div style={{ background: "white", borderRadius: 10, padding: "16px 18px", marginBottom: 14, border: "1px solid var(--rule)", opacity: step === "debrief" ? 0.7 : 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
              Note réflexive
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)", marginLeft: 8 }}>
                ({_wc(reflexive)}/{cfg.noteReflexiveMinMots || 0} mots)
              </span>
            </div>
            <textarea value={reflexive} onChange={e => setReflexive(e.target.value)} rows={6} disabled={step === "debrief"}
              style={{ width: "100%", border: "1px solid var(--rule)", borderRadius: 7, padding: "9px 11px", fontSize: 13, fontFamily: "inherit", lineHeight: 1.55, resize: "vertical", outline: "none", background: step === "debrief" ? "#f0f0f0" : "white" }} />
          </div>
        ) : null}

        {err ? <div style={{ color: "#c4420f", fontSize: 12, marginBottom: 10 }}>{err}</div> : null}

        {/* ── Bouton étape 1 : soumettre pour évaluation ── */}
        {(step === "draft" || step === "revision") ? (
          <button onClick={canSubmit ? (step === "draft" ? submitForFeedback : submitFinal) : undefined} disabled={!canSubmit}
            style={{ background: canSubmit ? "#134547" : "rgba(20,24,36,0.1)", color: canSubmit ? "white" : "var(--ink-faint)", border: "none", borderRadius: 7, padding: "11px 24px", fontSize: 13, fontWeight: 600, cursor: canSubmit ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
            {sending ? "Évaluation en cours…" : step === "draft" ? "Soumettre pour évaluation →" : "Valider le livrable final →"}
          </button>
        ) : null}

        {/* ── Retour formatif (étape 1) ── */}
        {step === "feedback" && feedback ? (
          <div style={{ marginTop: 22 }}>
            <div style={{ background: "white", borderRadius: 10, padding: "18px 20px", border: "1px solid var(--rule)", whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.6 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", color: "#1a6641", textTransform: "uppercase", marginBottom: 10 }}>Retour d'évaluation</div>
              {feedback}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 12 }}>
              <button onClick={revise}
                style={{ background: "#134547", color: "white", border: "none", borderRadius: 7, padding: "11px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                ✏️ Reprendre ma copie
              </button>
              <button onClick={submitFinal}
                style={{ background: "#1a6641", color: "white", border: "none", borderRadius: 7, padding: "11px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Valider tel quel → débrief final
              </button>
            </div>
          </div>
        ) : null}

        {/* ── Débrief final (étape 2) ── */}
        {step === "debrief" && debrief ? (
          <div style={{ marginTop: 22 }}>
            <div style={{ background: "#0B2B2D", borderRadius: 10, padding: "20px 22px", whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.6, color: "#E3FFF0" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", color: "#5DE298", textTransform: "uppercase", marginBottom: 10 }}>Débrief de compétences</div>
              {debrief}
            </div>
            <div style={{ marginTop: 16 }}>
              <button onClick={sendPortfolio}
                style={{ background: "#5DE298", color: "#0B2B2D", border: "none", borderRadius: 7, padding: "11px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                ✉ Recevoir mon portfolio par email
              </button>
              {sent ? <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 8 }}>{sent}</div> : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.livrable = LivrableApp;
