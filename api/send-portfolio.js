// api/send-portfolio.js — BC4 CDRH
// Envoi du portfolio de compétences par email (Resend)
// + écriture complétion dans cdrh-pac (Redis via portail)
// Variables d'environnement Vercel requises :
//   RESEND_API_KEY   (clé API Resend)
//   PORTFOLIO_FROM   (optionnel — ex: "PAC Éminéo <portfolio@emineo-education.fr>")

import { createHash } from 'crypto';

const PORTAIL_URL = 'https://cdrh-pac.vercel.app/api/progress';
const BLOC_ID     = 'bc4';

// ── Mapping campus → email RP (Sylvain complétera) ──
const CAMPUS_RP = {
  'paris':    ['chloe.guyot@cesacom.fr', 'celine.maheo@cesacom.fr'],
  'nantes':   ['manon.parageaud@cesacom.fr', 'lara.naccache@emineo-education.fr'],
  'bordeaux': ['anthony.nabli@emineo-education.fr'],
  'le mans':  ['etienne.azerad@cesacom.fr'],
  'lemans':   ['etienne.azerad@cesacom.fr'],
};

function hashEmail(email) {
  return createHash('sha256')
    .update(email.toLowerCase().trim())
    .digest('hex')
    .slice(0, 24);
}

async function markCompleted(email) {
  if (!email) return;
  try {
    const hash = hashEmail(email);
    await fetch(PORTAIL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash, bloc: BLOC_ID, status: 'completed' }),
    });
  } catch (err) {
    // Non bloquant — la complétion est best-effort
    console.warn('markCompleted error:', err.message);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const resendKey = process.env.RESEND_API_KEY;
  const from      = process.env.PORTFOLIO_FROM || 'PAC Éminéo <onboarding@resend.dev>';

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const { email, studentName, portfolioHTML, bloc, date, campus } = body || {};

    if (!email || !portfolioHTML) {
      return res.status(400).json({ error: 'Champs requis manquants : email, portfolioHTML' });
    }

    if (!resendKey) {
      console.error('RESEND_API_KEY non configurée — portfolio non envoyé');
      return res.status(503).json({ error: 'RESEND_API_KEY non configurée', sent: false });
    }

    const nomBloc    = bloc || 'BC1 MSMC';
    const dateStr    = date || new Date().toLocaleDateString('fr-FR');
    const prenom     = studentName ? studentName.split(' ')[0] : 'Étudiant(e)';
    const subject    = `Votre portfolio de compétences PAC — ${nomBloc}`;

    // ── Template email Éminéo ──────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'IBM Plex Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f4;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0"
             style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="background:#0B2B2D;padding:28px 32px;">
            <span style="font-size:22px;font-weight:700;color:#5DE298;letter-spacing:-0.5px;">
              Éminéo Education
            </span>
            <span style="font-size:13px;color:#E3FFF0;margin-left:12px;opacity:0.7;">
              PAC · Parcours Activation Compétences
            </span>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding:32px 32px 16px;">
            <p style="margin:0 0 12px;font-size:16px;color:#0B2B2D;">Bonjour ${prenom},</p>
            <p style="margin:0 0 12px;font-size:15px;color:#134547;line-height:1.6;">
              Voici votre portfolio de compétences issu du <strong>${nomBloc}</strong>,
              généré le <strong>${dateStr}</strong>.
            </p>
            <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">
              Ce document retrace votre parcours dans l'affaire Lumio Health et
              l'évaluation IA de vos productions sur les critères du référentiel RNCP 38438.
            </p>
          </td>
        </tr>

        <!-- Séparateur menthe -->
        <tr>
          <td style="padding:0 32px;">
            <div style="height:3px;background:linear-gradient(90deg,#5DE298,#134547);border-radius:2px;"></div>
          </td>
        </tr>

        <!-- Corps portfolio -->
        <tr>
          <td style="padding:24px 32px;">
            ${portfolioHTML}
          </td>
        </tr>

        <!-- Encart no-reply -->
        <tr>
          <td style="padding:0 32px 24px;">
            <div style="background:#E3FFF0;border-left:4px solid #5DE298;
                        padding:12px 16px;border-radius:0 6px 6px 0;">
              <p style="margin:0;font-size:12px;color:#134547;">
                ⚠️ Cet email est envoyé depuis une adresse <strong>no-reply</strong>. 
                Pour toute question, contactez directement votre référent Éminéo.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0B2B2D;padding:20px 32px;">
            <p style="margin:0;font-size:12px;color:#E3FFF0;opacity:0.6;text-align:center;">
              Éminéo Education · RNCP 38438 · PAC ${nomBloc} · ${dateStr}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // ── Envoi Resend ──────────────────────────────────────────────────────
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from,
        to:       [email],
        cc:       (campus && CAMPUS_RP[(campus || '').toLowerCase()]) ? CAMPUS_RP[campus.toLowerCase()] : [],
        reply_to: [],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend error:', resendData);
      return res.status(502).json({ error: 'Resend error', details: resendData, sent: false });
    }

    // ── Complétion portail (best-effort, non bloquant) ────────────────────
    await markCompleted(email);

    return res.status(200).json({ sent: true, id: resendData.id });

  } catch (err) {
    console.error('send-portfolio handler error:', err);
    return res.status(500).json({ error: 'Erreur serveur', message: err.message, sent: false });
  }
}
