// ══════════════════════════════════════════════════════════════
//  LIVRABLE APP v2 — Composant canonique unique (tous PAC)
//  Flux : Évaluation formative → Reprise → Débrief final → Portfolio
//  Lit tout depuis window.PAC_CONFIG. Aucun prompt hardcodé.
// ══════════════════════════════════════════════════════════════

const { useState: useLivState } = React;
const _wc = (t) => (t || "").trim() ? (t || "").trim().split(/\s+/).length : 0;

// ── Markdown-lite : rendu sécurisé (échappement HTML systématique) ──
// Supporte : **gras**, *italique*, listes (- / 1.), tableaux (| a | b |).
const _mdEsc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const _mdInline = (s) => s
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/\*([^*]+)\*/g, "<em>$1</em>");

function _mdToHtml(raw) {
  const lines = _mdEsc(raw || "").split(/\r?\n/);
  const out = [];
  let i = 0;
  const isTableLine = (l) => /^\s*\|.*\|\s*$/.test(l);
  const isSep = (l) => /^\s*\|[\s:|-]+\|\s*$/.test(l);
  while (i < lines.length) {
    const l = lines[i];
    if (isTableLine(l)) {
      const block = [];
      while (i < lines.length && isTableLine(lines[i])) { block.push(lines[i]); i++; }
      const hasSep = block.length > 1 && isSep(block[1]);
      const rows = block.filter(r => !isSep(r)).map(r => r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(c => _mdInline(c.trim())));
      let html = "<table style=\"border-collapse:collapse;width:100%;margin:8px 0;font-size:12.5px\">";
      rows.forEach((cells, ri) => {
        const tag = (hasSep && ri === 0) ? "th" : "td";
        html += "<tr>" + cells.map(c => "<" + tag + " style=\"border:1px solid #d8d4cc;padding:5px 8px;text-align:left;vertical-align:top;" + (tag === "th" ? "background:#f0ede7;font-weight:700" : "") + "\">" + (c || "&nbsp;") + "</" + tag + ">").join("") + "</tr>";
      });
      html += "</table>";
      out.push(html);
      continue;
    }
    if (/^\s*[-*]\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(_mdInline(lines[i].replace(/^\s*[-*]\s+/, ""))); i++; }
      out.push("<ul style=\"margin:6px 0;padding-left:20px\">" + items.map(x => "<li>" + x + "</li>").join("") + "</ul>");
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { items.push(_mdInline(lines[i].replace(/^\s*\d+[.)]\s+/, ""))); i++; }
      out.push("<ol style=\"margin:6px 0;padding-left:20px\">" + items.map(x => "<li>" + x + "</li>").join("") + "</ol>");
      continue;
    }
    out.push(_mdInline(l) + "<br>");
    i++;
  }
  return out.join("");
}

// Comptage de mots : la syntaxe markdown (pipes, puces, séparateurs, astérisques) ne compte pas
const _stripMd = (t) => String(t || "")
  .replace(/^\s*\|[\s:|-]+\|\s*$/gm, "")
  .replace(/\|/g, " ")
  .replace(/^\s*[-*]\s+/gm, "")
  .replace(/^\s*\d+[.)]\s+/gm, "")
  .replace(/\*/g, "");
const _wcMd = (t) => _wc(_stripMd(t));

// ── Champ de saisie avec mise en forme (toolbar + aperçu) ──
function LivField({ title, count, min, placeholder, conseil, value, onChange, locked, rows, tableauModele }) {
  const [preview, setPreview] = useLivState(false);
  const taRef = React.useRef(null);
  const apply = (before, after, blockPrefix) => {
    const ta = taRef.current; if (!ta || locked) return;
    const v = value || "";
    const s = ta.selectionStart, e = ta.selectionEnd;
    let nv, ns, ne;
    if (blockPrefix) {
      const sel = v.slice(s, e) || "élément";
      const block = sel.split("\n").map(x => blockPrefix + x).join("\n");
      nv = v.slice(0, s) + block + v.slice(e);
      ns = s; ne = s + block.length;
    } else {
      const sel = v.slice(s, e) || "texte";
      nv = v.slice(0, s) + before + sel + after + v.slice(e);
      ns = s + before.length; ne = ns + sel.length;
    }
    onChange(nv);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(ns, ne); });
  };
  const insertBlock = (block) => {
    const ta = taRef.current; if (locked) return;
    const v = value || "";
    const s = (ta && ta.selectionStart != null) ? ta.selectionStart : v.length;
    const pre = v.slice(0, s), post = v.slice(s);
    onChange(pre + (pre && !pre.endsWith("\n") ? "\n\n" : "") + block + "\n" + post);
    if (ta) requestAnimationFrame(() => ta.focus());
  };
  const TBL = "| Colonne 1 | Colonne 2 | Colonne 3 |\n|---|---|---|\n|  |  |  |\n|  |  |  |";
  const btn = { border: "1px solid var(--rule)", background: "white", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "var(--ink-soft)", fontFamily: "inherit" };
  return (
    <div style={{ background: "white", borderRadius: 10, padding: "16px 18px", marginBottom: 14, border: "1px solid var(--rule)", opacity: locked ? 0.7 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: count >= min ? "#1a6641" : "var(--ink-faint)" }}>{count}/{min} mots</span>
      </div>
      {placeholder ? <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 8, lineHeight: 1.5 }}>{placeholder}</div> : null}
      {!locked ? (
        <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
          <button style={{ ...btn, fontWeight: 700 }} title="Gras (**texte**)" onClick={() => apply("**", "**")}>B</button>
          <button style={{ ...btn, fontStyle: "italic" }} title="Italique (*texte*)" onClick={() => apply("*", "*")}>I</button>
          <button style={btn} title="Liste à puces" onClick={() => apply(null, null, "- ")}>• Liste</button>
          <button style={btn} title="Insérer un tableau vide" onClick={() => insertBlock(TBL)}>⊞ Tableau</button>
          {tableauModele ? (
            <button style={{ ...btn, borderColor: "#1a6641", color: "#1a6641", fontWeight: 600 }} title="Insérer la structure de tableau attendue pour cette compétence"
              onClick={() => insertBlock(tableauModele)}>⊞ Insérer le modèle attendu</button>
          ) : null}
          <span style={{ flex: 1 }} />
          <button style={{ ...btn, background: preview ? "#134547" : "white", color: preview ? "white" : "var(--ink-soft)", borderColor: preview ? "#134547" : "var(--rule)" }}
            onClick={() => setPreview(p => !p)}>{preview ? "✎ Éditer" : "👁 Aperçu"}</button>
        </div>
      ) : null}
      {preview && !locked ? (
        <div style={{ border: "1px dashed var(--rule)", borderRadius: 7, padding: "10px 12px", fontSize: 13, lineHeight: 1.55, minHeight: 90, background: "#fbfaf7" }}
          dangerouslySetInnerHTML={{ __html: _mdToHtml(value || "") || "<span style=\"color:#a8a294\">(vide)</span>" }} />
      ) : (
        <textarea ref={taRef} value={value || ""} onChange={e => onChange(e.target.value)} rows={rows || 5} disabled={locked}
          style={{ width: "100%", border: "1px solid var(--rule)", borderRadius: 7, padding: "9px 11px", fontSize: 13, fontFamily: "inherit", lineHeight: 1.55, resize: "vertical", outline: "none", background: locked ? "#f0f0f0" : "white" }} />
      )}
      {conseil ? <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 6, fontStyle: "italic" }}>💡 {conseil}</div> : null}
    </div>
  );
}


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
  const totalMots = comps.reduce((n, c) => n + _wcMd(answers[c.code]), 0) + _wcMd(reflexive);
  const allMin = comps.every(c => _wcMd(answers[c.code]) >= (c.min || 0));
  const reflexiveOk = !cfg.note_reflexive || _wcMd(reflexive) >= (cfg.noteReflexiveMinMots || 0);
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
        + "\n\nIMPORTANT : Ceci est une évaluation formative. L'étudiant pourra reprendre sa copie. Sois précis sur les points à améliorer."
        + "\n\nNOTE FORMAT : les réponses peuvent contenir une mise en forme markdown légère (**gras**, *italique*, listes, tableaux délimités par |). Évalue le fond ; un tableau structuré et complet est un signe de professionnalisme, pas du remplissage.";
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
        + "\n\nCeci est le débrief FINAL. L'étudiant a déjà reçu un retour formatif et a pu reprendre sa copie. Sois exigeant et conclusif. Donne un niveau global."
        + "\n\nNOTE FORMAT : les réponses peuvent contenir une mise en forme markdown légère (**gras**, *italique*, listes, tableaux délimités par |). Évalue le fond ; un tableau structuré et complet est un signe de professionnalisme, pas du remplissage.";
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
      const rows = comps.map(c => "<h3 style=\"color:#134547;margin:18px 0 6px;font-family:'IBM Plex Sans',sans-serif\">" + c.code + " — " + c.label + "</h3><div style=\"color:#0B2B2D;line-height:1.55;font-family:'IBM Plex Sans',sans-serif\">" + _mdToHtml(answers[c.code] || "(vide)") + "</div>").join("");
      const refl = cfg.note_reflexive
        ? "<h3 style=\"color:#134547;margin:18px 0 6px;font-family:'IBM Plex Sans',sans-serif\">Note réflexive</h3><div style=\"color:#0B2B2D;line-height:1.55;font-family:'IBM Plex Sans',sans-serif\">" + _mdToHtml(reflexive || "(vide)") + "</div>"
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

        {/* ── Champs par compétence (saisie markdown-lite : toolbar + aperçu) ── */}
        {comps.map(c => (
          <LivField key={c.code}
            title={c.code + " — " + c.label}
            count={_wcMd(answers[c.code])} min={c.min || 0}
            placeholder={c.placeholder} conseil={c.conseil}
            value={answers[c.code]} onChange={v => set(c.code, v)}
            locked={step === "debrief"} rows={5}
            tableauModele={c.tableauModele} />
        ))}

        {/* ── Note réflexive ── */}
        {cfg.note_reflexive ? (
          <LivField title="Note réflexive"
            count={_wcMd(reflexive)} min={cfg.noteReflexiveMinMots || 0}
            value={reflexive} onChange={setReflexive}
            locked={step === "debrief"} rows={6} />
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
