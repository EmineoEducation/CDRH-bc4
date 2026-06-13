// ============================================================
//  ÉMINÉO — api/send-portfolio.js
//  Envoi du portfolio de fin de parcours via Resend
//  + coche de completion sur le portail (Redis du portail).
//  ⚠️  bc4 et cdrh-pac.vercel.app sont substitués par le générateur
//      au moment du ZIP. Ne PAS les remplacer à la main.
// ============================================================

import { createHash } from 'crypto';

const BLOC_ID     = 'bc4';     // ex: 'bc1', 'bc2'... ou 'cdrh-bc1'
const PORTAL_HOST = 'cdrh-pac.vercel.app'; // ex: 'msmc-pac.vercel.app', 'cdrh-pac.vercel.app'

const PORTFOLIO_FROM =
  process.env.PORTFOLIO_FROM ||
  'Éminéo Education <portfolio@emineo-education.fr>';

// Palette Éminéo
const C = {
  abysse: '#0B2B2D',
  petrole: '#134547',
  menthe: '#5DE298',
  givre: '#E3FFF0',
  gris: '#5A6B6C',
};

// IBM Plex Sans si dispo, repli système partout ailleurs (Outlook inclus)
const FONT =
  "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// SHA-256(email lowercased trimmed)[:24] — identique côté portail
function hashEmail(email) {
  return createHash('sha256')
    .update(String(email || '').trim().toLowerCase())
    .digest('hex')
    .slice(0, 24);
}

/**
 * Coche de completion auprès du portail. À appeler AVANT Resend
 * pour que la progression Redis soit garantie même si l'email échoue.
 * Best-effort : ne lève pas, log seulement.
 * @returns {Promise<boolean>} true si la coche a été acceptée
 */
async function markCompleted(email) {
  if (!email || !PORTAL_HOST || PORTAL_HOST.indexOf('__') === 0) {
    console.warn('markCompleted skipped: missing email or unsubstituted PORTAL_HOST');
    return false;
  }
  try {
    const r = await fetch('https://' + PORTAL_HOST + '/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hash: hashEmail(email),
        bloc: BLOC_ID,
        status: 'completed'
      })
    });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      console.warn('markCompleted non-OK:', r.status, t.slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.warn('markCompleted error:', e.message);
    return false;
  }
}

function buildPortfolioHtml(p) {
  const prenom = escapeHtml(p.prenom);
  const nom = escapeHtml(p.nom);
  const formation = escapeHtml(p.formation);
  const bloc = escapeHtml(p.bloc);
  const contenuHtml = p.contenuHtml || '';

  const preheader =
    'Portfolio de compétences' +
    (p.prenom ? ' de ' + escapeHtml(p.prenom) : '') +
    ' — généré dans le cadre de votre parcours Éminéo.';

  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Votre portfolio · Éminéo Education</title>
  <!--[if mso]><style>table,td{font-family:Arial,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${C.givre};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${C.givre};">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.givre};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:${C.abysse};padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:${FONT};font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">Éminéo<span style="color:${C.menthe};"> Education</span></td>
                  <td align="right" style="font-family:${FONT};font-size:12px;color:${C.menthe};text-transform:uppercase;letter-spacing:1px;">${bloc || 'Portfolio'}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:4px;background:${C.menthe};line-height:4px;font-size:4px;">&nbsp;</td></tr>
          <tr>
            <td style="padding:36px 32px 8px 32px;font-family:${FONT};color:${C.abysse};">
              <h1 style="margin:0 0 18px 0;font-size:22px;font-weight:700;color:${C.abysse};">${prenom ? 'Bonjour ' + prenom + ',' : 'Bonjour,'}</h1>
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${C.gris};">Voici votre portfolio de compétences${formation ? ', établi dans le cadre de votre parcours <strong style="color:' + C.petrole + ';">' + formation + '</strong>' : ''}. Il rassemble les éléments produits au cours de votre parcours d'activation des compétences.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px 32px;font-family:${FONT};color:${C.abysse};font-size:15px;line-height:1.6;">${contenuHtml}</td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.givre};border-radius:8px;">
                <tr>
                  <td style="padding:16px 20px;font-family:${FONT};font-size:13px;line-height:1.5;color:${C.petrole};"><strong>Message automatique — ne pas répondre.</strong><br>Cet e-mail est envoyé depuis une adresse de notification (<span style="color:${C.gris};">portfolio@emineo-education.fr</span>) qui ne reçoit aucune réponse. Pour toute question, contactez votre référent de formation.</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:${C.petrole};padding:20px 32px;font-family:${FONT};font-size:12px;color:${C.givre};text-align:center;line-height:1.5;">Éminéo Education${nom ? ' · ' + prenom + ' ' + nom : ''}<br><span style="color:${C.menthe};">Parcours d'Activation des Compétences</span></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildPortfolioText(p) {
  return [
    p.prenom ? 'Bonjour ' + p.prenom + ',' : 'Bonjour,',
    '',
    'Voici votre portfolio de compétences' +
      (p.formation ? ', établi dans le cadre de votre parcours ' + p.formation : '') +
      '.',
    '',
    '--- Message automatique — ne pas répondre. ---',
    'Envoyé depuis portfolio@emineo-education.fr (adresse de notification, sans réception).',
    'Pour toute question, contactez votre référent de formation.',
    '',
    'Éminéo Education — Parcours d\'Activation des Compétences',
  ].join('\n');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'RESEND_API_KEY not configured' });

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    const {
      to,
      subject,
      bloc,
      prenom,
      nom,
      formation,
      contenuHtml,
      studentName,
      html,
    } = body || {};

    if (!to) return res.status(400).json({ error: 'Missing required field: to' });

    if (!html && !contenuHtml) {
      return res.status(400).json({ error: 'Missing portfolio content: provide html or contenuHtml' });
    }

    // ── 1. Coche de completion AVANT Resend ──
    // (garantit la progression Redis même si l'email échoue ensuite)
    const completed = await markCompleted(to);

    // Prénom : priorité au champ explicite, sinon dérivé de studentName
    const _prenom = prenom || (studentName ? String(studentName).trim().split(/\s+/)[0] : '');
    const _nom = nom || (studentName ? String(studentName).trim().split(/\s+/).slice(1).join(' ') : '');

    const finalHtml =
      html ||
      buildPortfolioHtml({ prenom: _prenom, nom: _nom, formation, bloc: bloc || BLOC_ID, contenuHtml });

    const finalSubject =
      subject || ('Votre portfolio' + ((bloc || BLOC_ID) ? ' — ' + (bloc || BLOC_ID) : '') + ' · Éminéo Education');

    const finalText = buildPortfolioText({ prenom: _prenom, formation });

    // ── 2. Envoi Resend ──
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        from: PORTFOLIO_FROM,
        to: [to],
        subject: finalSubject,
        html: finalHtml,
        text: finalText,
        reply_to: [],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      // Resend KO mais la coche Redis est déjà passée → 200 avec warning
      console.error('Resend API error:', data);
      return res.status(200).json({
        sent: false,
        completed,
        warning: 'Email failed but progress saved on portal',
        resendError: data
      });
    }
    return res.status(200).json({ sent: true, completed, id: data.id });
  } catch (err) {
    console.error('send-portfolio error:', err);
    return res.status(500).json({ error: 'send error', message: err.message });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
