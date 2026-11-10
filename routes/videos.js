const express = require('express');
const router = express.Router();


const Video = require('../models/Video');
const { sendContentUpdateToSubscribers } = require('../config/mailer');


/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Récupère toutes les vidéos
 *     tags: [Video]
 *     responses:
 *       200:
 *         description: Liste des vidéos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 */
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     summary: Récupère une vidéo par ID
 *     tags: [Video]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la vidéo
 *     responses:
 *       200:
 *         description: Vidéo trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       404:
 *         description: Vidéo non trouvée
 */
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Not found' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/videos:
 *   post:
 *     summary: Crée une nouvelle vidéo
 *     tags: [Video]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Video'
 *     responses:
 *       201:
 *         description: Vidéo créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       400:
 *         description: Erreur de validation
 */
router.post('/', async (req, res) => {
  try {
    const video = new Video(req.body);
    await video.save();
    try {
      await sendContentUpdateToSubscribers({ type: 'video', item: video, action: 'create' });
    } catch (err) {
      console.error('[videos] Échec de la notification newsletter:', err.message);
    }
    res.status(201).json(video);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     summary: Met à jour une vidéo
 *     tags: [Video]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la vidéo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Video'
 *     responses:
 *       200:
 *         description: Vidéo mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Vidéo non trouvée
 */
router.put('/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!video) return res.status(404).json({ error: 'Not found' });
    try {
      await sendContentUpdateToSubscribers({ type: 'video', item: video, action: 'update' });
    } catch (err) {
      console.error('[videos] Échec de la notification newsletter:', err.message);
    }
    res.json(video);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Supprime une vidéo
 *     tags: [Video]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la vidéo
 *     responses:
 *       200:
 *         description: Vidéo supprimée
 *       404:
 *         description: Vidéo non trouvée
 */
router.delete('/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       required:
 *         - url
 *       properties:
 *         _id:
 *           type: string
 *           description: ID auto-généré
 *         url:
 *           type: string
 *           description: URL de la vidéo
 *         description:
 *           type: string
 *           description: Description de la vidéo
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date de création
 */

module.exports = router;
