const express = require('express');
const router = express.Router();


const OffreEmploi = require('../models/OffreEmploi');
const { sendContentUpdateToSubscribers } = require('../config/mailer');


/**
 * @swagger
 * /api/offres-emploi:
 *   get:
 *     summary: Récupère toutes les offres d'emploi
 *     tags: [OffreEmploi]
 *     responses:
 *       200:
 *         description: Liste des offres d'emploi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OffreEmploi'
 */
router.get('/', async (req, res) => {
  try {
    const offres = await OffreEmploi.find();
    res.json(offres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/offres-emploi/{id}:
 *   get:
 *     summary: Récupère une offre d'emploi par ID
 *     tags: [OffreEmploi]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'offre d'emploi
 *     responses:
 *       200:
 *         description: Offre trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OffreEmploi'
 *       404:
 *         description: Offre non trouvée
 */
router.get('/:id', async (req, res) => {
  try {
    const offre = await OffreEmploi.findById(req.params.id);
    if (!offre) return res.status(404).json({ error: 'Not found' });
    res.json(offre);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/offres-emploi:
 *   post:
 *     summary: Crée une nouvelle offre d'emploi
 *     tags: [OffreEmploi]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OffreEmploi'
 *     responses:
 *       201:
 *         description: Offre créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OffreEmploi'
 *       400:
 *         description: Erreur de validation
 */
router.post('/', async (req, res) => {
  try {
    const offre = new OffreEmploi(req.body);
    await offre.save();
    try {
      await sendContentUpdateToSubscribers({ type: 'offre', item: offre, action: 'create' });
    } catch (err) {
      console.error('[offres-emploi] Échec de la notification newsletter:', err.message);
    }
    res.status(201).json(offre);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/offres-emploi/{id}:
 *   put:
 *     summary: Met à jour une offre d'emploi
 *     tags: [OffreEmploi]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'offre d'emploi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OffreEmploi'
 *     responses:
 *       200:
 *         description: Offre mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OffreEmploi'
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Offre non trouvée
 */
router.put('/:id', async (req, res) => {
  try {
    const offre = await OffreEmploi.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offre) return res.status(404).json({ error: 'Not found' });
    try {
      await sendContentUpdateToSubscribers({ type: 'offre', item: offre, action: 'update' });
    } catch (err) {
      console.error('[offres-emploi] Échec de la notification newsletter:', err.message);
    }
    res.json(offre);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/offres-emploi/{id}:
 *   delete:
 *     summary: Supprime une offre d'emploi
 *     tags: [OffreEmploi]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'offre d'emploi
 *     responses:
 *       200:
 *         description: Offre supprimée
 *       404:
 *         description: Offre non trouvée
 */
router.delete('/:id', async (req, res) => {
  try {
    const offre = await OffreEmploi.findByIdAndDelete(req.params.id);
    if (!offre) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     OffreEmploi:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: ID auto-généré
 *         title:
 *           type: string
 *           description: Titre de l'offre
 *         description:
 *           type: string
 *           description: Description de l'offre
 *         company:
 *           type: string
 *           description: Nom de l'entreprise
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date de création
 */

module.exports = router;
