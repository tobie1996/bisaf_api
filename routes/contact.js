const express = require('express');
const router = express.Router();

const {
  sendContactNotification,
  sendContactConfirmation,
} = require('../config/mailer');

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Envoie un message de contact (notifie l'administrateur par email)
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message envoyé
 *       400:
 *         description: Champs manquants ou invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Le nom est obligatoire.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Une adresse email valide est obligatoire.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Le message est obligatoire.' });
    }

    const data = {
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      subject: subject || 'Autre',
      message: message.trim(),
    };

    await sendContactNotification(data);
    try {
      await sendContactConfirmation(data);
    } catch (err) {
      console.error('[contact] Échec de l\'email de confirmation:', err.message);
    }

    res.status(200).json({ message: 'Message envoyé avec succès.' });
  } catch (err) {
    console.error('[contact] Erreur:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
