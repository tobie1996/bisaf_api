const nodemailer = require('nodemailer');

const Newsletter = require('../models/Newsletter');

const BRAND_NAME = 'BISAF Cameroun';
const BRAND_COLOR = '#00aeef';
const BRAND_DARK = '#0096cc';
const FROM_EMAIL = process.env.GMAIL_USER || 'infobisafcameroun@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'infobisafcameroun@gmail.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://bisafcameroun.vercel.app';
const LOGO_URL = process.env.LOGO_URL || 'https://api-bisaf.vercel.app';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || FROM_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(text, length) {
  const str = String(text || '');
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildLayout({ title, subtitle, contentHtml, footerNote }) {
  const siteLink = `<a href="${FRONTEND_URL}" style="color:${BRAND_COLOR};text-decoration:none;font-weight:600;">${BRAND_NAME}</a>`;
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <!-- En-tête -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_COLOR},${BRAND_DARK});padding:32px 40px;text-align:center;">
              <img src="${LOGO_URL}/logo.png" alt="${BRAND_NAME}" style="display:block;margin:0 auto;width:120px;height:auto;" />
               <div style="color:#ffffff;font-size:22px;font-weight:bold;margin-top:12px;letter-spacing:0.5px;">${BRAND_NAME}</div>
              <div style="color:#e0f5ff;font-size:13px;margin-top:4px;">Bien-être et Santé Familiale</div>
            </td>
          </tr>
          <!-- Titre -->
          <tr>
            <td style="padding:32px 40px 8px 40px;text-align:center;">
              <div style="color:#1f2937;font-size:24px;font-weight:bold;line-height:1.3;">${escapeHtml(title)}</div>
              ${subtitle ? `<div style="color:#6b7280;font-size:15px;margin-top:8px;line-height:1.5;">${subtitle}</div>` : ''}
            </td>
          </tr>
          <!-- Contenu -->
          <tr>
            <td style="padding:16px 40px 32px 40px;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Pied de page -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <div style="color:#6b7280;font-size:13px;line-height:1.6;">
                ${footerNote || `Vous recevez cet email car vous êtes inscrit(e) à la newsletter de ${BRAND_NAME}.`}
              </div>
              <div style="color:#9ca3af;font-size:12px;margin-top:10px;line-height:1.6;">
                ${siteLink} &bull; Yaoundé, Cameroun
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendMail({ to, subject, html }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[mailer] GMAIL_USER / GMAIL_APP_PASSWORD manquants, email non envoyé à', to);
    return null;
  }
  const transporter = getTransporter();
  const plainText = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 800);
  const info = await transporter.sendMail({
    from: `"${BRAND_NAME}" <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    text: plainText,
  });
  console.log(`[mailer] Email envoyé à ${to}: ${info.messageId}`);
  return info;
}

/* ── Newsletter : bienvenue ── */
async function sendNewsletterWelcome(email, name) {
  const contentHtml = `
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
      Bonjour ${escapeHtml(name || 'cher abonné')}, et bienvenue dans la communauté ${BRAND_NAME} !
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
      Vous recevrez désormais un email dès qu'une <strong>offre d'emploi</strong>, une <strong>vidéo</strong> ou un
      <strong>article de blog</strong> est publié ou mis à jour sur notre site.
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px 0;">
      Merci de nous suivre et de soutenir nos actions pour le bien-être et la santé des familles camerounaises.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:4px 0 0 0;">
          <a href="${FRONTEND_URL}" style="background-color:${BRAND_COLOR};color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;display:inline-block;">Découvrir notre site</a>
        </td>
      </tr>
    </table>`;
  return sendMail({
    to: email,
    subject: `Bienvenue à la newsletter ${BRAND_NAME} 🎉`,
    html: buildLayout({
      title: 'Inscription confirmée',
      subtitle: 'Vous faites maintenant partie de la communauté BISAF.',
      contentHtml,
      footerNote: 'Vous recevez cet email car votre adresse a été inscrite à notre newsletter.',
    }),
  });
}

/* ── Newsletter : notification de contenu ── */
function buildContentItemHtml(type, item, action) {
  const typeLabel = type === 'blog'
    ? 'Article de blog'
    : type === 'video'
      ? 'Vidéo'
      : "Offre d'emploi";

  let body = '';

  if (type === 'offre') {
    body = `
      ${item.company ? `<div style="color:${BRAND_COLOR};font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${escapeHtml(item.company)}</div>` : ''}
      <div style="color:#1f2937;font-size:18px;font-weight:bold;margin-bottom:8px;">${escapeHtml(item.title)}</div>
      ${item.location ? `<div style="color:#6b7280;font-size:14px;margin-bottom:8px;">📍 ${escapeHtml(item.location)}</div>` : ''}
      <div style="color:#374151;font-size:14px;line-height:1.6;margin-bottom:12px;">${escapeHtml(truncate(item.description, 260))}</div>`;
  } else if (type === 'video') {
    body = `
      <div style="color:#1f2937;font-size:18px;font-weight:bold;margin-bottom:8px;">${escapeHtml(item.title)}</div>
      ${item.description ? `<div style="color:#374151;font-size:14px;line-height:1.6;margin-bottom:12px;">${escapeHtml(truncate(item.description, 260))}</div>` : ''}
      ${item.url ? `<div style="margin-bottom:12px;"><a href="${escapeHtml(item.url)}" style="background-color:#ffffff;border:2px solid ${BRAND_COLOR};color:${BRAND_COLOR};padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold;display:inline-block;">▶ Regarder la vidéo</a></div>` : ''}`;
  } else {
    body = `
      <div style="color:#1f2937;font-size:18px;font-weight:bold;margin-bottom:8px;">${escapeHtml(item.title)}</div>
      ${item.author ? `<div style="color:#6b7280;font-size:14px;margin-bottom:8px;">Par ${escapeHtml(item.author)}</div>` : ''}
      <div style="color:#374151;font-size:14px;line-height:1.6;margin-bottom:12px;">${escapeHtml(truncate(String(item.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), 320))}</div>`;
  }

  const detailUrl = `${FRONTEND_URL}/#/documents/${type === 'blog' ? 'blogs' : type === 'video' ? 'videos' : 'offres-emploi'}`;

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;margin-bottom:16px;">
      <tr>
        <td style="padding:20px 24px;">
          <div style="color:${BRAND_COLOR};font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">${typeLabel} ${action === 'update' ? '— mise à jour' : '— nouvelle publication'}</div>
          ${body}
          <div style="border-top:1px solid #f3f4f6;padding-top:12px;margin-top:4px;">
            <a href="${detailUrl}" style="color:${BRAND_COLOR};text-decoration:none;font-weight:bold;font-size:14px;">Voir en ligne →</a>
          </div>
        </td>
      </tr>
    </table>`;
}

async function sendContentUpdateToSubscribers({ type, item, action }) {
  const subscribers = await Newsletter.find();
  if (!subscribers.length) return [];

  const typeLabel = type === 'blog'
    ? 'article de blog'
    : type === 'video'
      ? 'vidéo'
      : "offre d'emploi";
  const subject = `${BRAND_NAME} — Nouveau : ${truncate(item.title || typeLabel, 70)}`;

  const contentHtml = `
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px 0;">
      Une ${typeLabel} a été ${action === 'update' ? 'mise à jour' : 'publiée'} sur notre site. Voici les détails :
    </p>
    ${buildContentItemHtml(type, item, action)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:8px 0 0 0;">
          <a href="${FRONTEND_URL}" style="background-color:${BRAND_COLOR};color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;display:inline-block;">Voir toutes nos actualités</a>
        </td>
      </tr>
    </table>`;

  const results = [];
  for (const sub of subscribers) {
    try {
      const info = await sendMail({
        to: sub.email,
        subject,
        html: buildLayout({
          title: `${BRAND_NAME} — Nouvelle ${typeLabel}`,
          subtitle: action === 'update' ? 'Ce contenu vient d\'être mis à jour.' : 'Un nouveau contenu vient d\'être publié.',
          contentHtml,
          footerNote: `Vous recevez cet email car vous êtes inscrit(e) à la newsletter de ${BRAND_NAME}.`,
        }),
      });
      results.push(info);
    } catch (err) {
      console.error(`[mailer] Échec envoi à ${sub.email}:`, err.message);
    }
  }
  return results;
}

/* ── Contact : notification administrateur ── */
async function sendContactNotification({ name, email, phone, subject, message }) {
  const subjectLabel = subject || 'Message depuis le site';

  const rows = [
    { label: 'Nom complet', value: name },
    { label: 'Email', value: email },
    { label: 'Téléphone', value: phone || '—' },
    { label: 'Sujet', value: subjectLabel },
  ].map(row => `
    <tr>
      <td style="padding:10px 16px;color:#6b7280;font-size:14px;font-weight:bold;width:140px;border-bottom:1px solid #f3f4f6;">${escapeHtml(row.label)}</td>
      <td style="padding:10px 16px;color:#1f2937;font-size:14px;border-bottom:1px solid #f3f4f6;">${escapeHtml(row.value)}</td>
    </tr>`).join('');

  const contentHtml = `
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
      Un nouveau message a été envoyé depuis le formulaire de contact du site.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;margin-bottom:20px;">
      ${rows}
      <tr>
        <td style="padding:10px 16px;color:#6b7280;font-size:14px;font-weight:bold;vertical-align:top;border-bottom:1px solid #f3f4f6;">Message</td>
        <td style="padding:10px 16px;color:#1f2937;font-size:14px;line-height:1.7;border-bottom:1px solid #f3f4f6;white-space:pre-line;">${escapeHtml(message)}</td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:4px 0 0 0;">
          <a href="mailto:${escapeHtml(email)}" style="background-color:${BRAND_COLOR};color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;display:inline-block;">Répondre à ${escapeHtml(name || email)}</a>
        </td>
      </tr>
    </table>`;

  return sendMail({
    to: ADMIN_EMAIL,
    subject: `📩 Nouveau message de contact — ${escapeHtml(name || email)}`,
    html: buildLayout({
      title: 'Nouveau message de contact',
      subtitle: 'Un visiteur vous a contacté via le site.',
      contentHtml,
      footerNote: 'Message reçu automatiquement depuis le formulaire de contact de bisafcameroun.vercel.app.',
    }),
  });
}

/* ── Contact : confirmation utilisateur ── */
async function sendContactConfirmation({ name, email }) {
  const contentHtml = `
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
      Bonjour ${escapeHtml(name || 'cher visiteur')},
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
      Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais (généralement sous 24h).
    </p>
    <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px 0;">
      Merci pour votre intérêt pour les actions de ${BRAND_NAME}.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:4px 0 0 0;">
          <a href="${FRONTEND_URL}" style="background-color:${BRAND_COLOR};color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;display:inline-block;">Visiter notre site</a>
        </td>
      </tr>
    </table>`;
  return sendMail({
    to: email,
    subject: `Nous avons bien reçu votre message — ${BRAND_NAME}`,
    html: buildLayout({
      title: 'Message bien reçu ✅',
      subtitle: 'Nous vous répondrons sous 24h.',
      contentHtml,
      footerNote: `Vous avez utilisé le formulaire de contact de ${BRAND_NAME}.`,
    }),
  });
}

module.exports = {
  sendNewsletterWelcome,
  sendContentUpdateToSubscribers,
  sendContactNotification,
  sendContactConfirmation,
};
