const express = require('express');
const router = express.Router();


const Newsletter = require('../models/Newsletter');
const { sendNewsletterWelcome } = require('../config/mailer');


/**
 * @swagger
 * /api/newsletter:
 *   get:
 *     summary: Récupère toutes les newsletters
 *     tags: [Newsletter]
 *     responses:
 *       200:
 *         description: Liste des newsletters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Newsletter'
 */
router.get('/', async (req, res) => {
  try {
    const newsletters = await Newsletter.find();
    res.json(newsletters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/newsletter/{id}:
 *   get:
 *     summary: Récupère une newsletter par ID
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la newsletter
 *     responses:
 *       200:
 *         description: Newsletter trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Newsletter'
 *       404:
 *         description: Newsletter non trouvée
 */
router.get('/:id', async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) return res.status(404).json({ error: 'Not found' });
    res.json(newsletter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/newsletter:
 *   post:
 *     summary: Crée une nouvelle newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Newsletter'
 *     responses:
 *       201:
 *         description: Newsletter créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Newsletter'
 *       400:
 *         description: Erreur de validation
 */
router.post('/', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Une adresse email valide est obligatoire.' });
    }

    let newsletter = await Newsletter.findOne({ email });
    if (newsletter) {
      return res.status(200).json({ ...newsletter.toObject(), alreadySubscribed: true });
    }

    newsletter = new Newsletter({ email, name: (req.body.name || '').trim() });
    await newsletter.save();

    try {
      await sendNewsletterWelcome(newsletter.email, newsletter.name);
    } catch (err) {
      console.error('[newsletter] Échec de l\'email de bienvenue:', err.message);
    }

    res.status(201).json(newsletter);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/newsletter/{id}:
 *   put:
 *     summary: Met à jour une newsletter
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la newsletter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Newsletter'
 *     responses:
 *       200:
 *         description: Newsletter mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Newsletter'
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Newsletter non trouvée
 */
router.put('/:id', async (req, res) => {
  try {
    const newsletter = await Newsletter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!newsletter) return res.status(404).json({ error: 'Not found' });
    res.json(newsletter);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/newsletter/{id}:
 *   delete:
 *     summary: Supprime une newsletter
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la newsletter
 *     responses:
 *       200:
 *         description: Newsletter supprimée
 *       404:
 *         description: Newsletter non trouvée
 */
router.delete('/:id', async (req, res) => {
  try {
    const newsletter = await Newsletter.findByIdAndDelete(req.params.id);
    if (!newsletter) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Newsletter:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: ID auto-généré
 *         title:
 *           type: string
 *           description: Titre de la newsletter
 *         content:
 *           type: string
 *           description: Contenu de la newsletter
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date de création
 */

module.exports = router;
