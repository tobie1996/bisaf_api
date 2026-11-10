const express = require('express');
const router = express.Router();


const Photo = require('../models/Photo');


/**
 * @swagger
 * /api/photos:
 *   get:
 *     summary: Récupère toutes les photos
 *     tags: [Photo]
 *     responses:
 *       200:
 *         description: Liste des photos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Photo'
 */
router.get('/', async (req, res) => {
  try {
    const photos = await Photo.find();
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/photos/{id}:
 *   get:
 *     summary: Récupère une photo par ID
 *     tags: [Photo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la photo
 *     responses:
 *       200:
 *         description: Photo trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Photo'
 *       404:
 *         description: Photo non trouvée
 */
router.get('/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Not found' });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/photos:
 *   post:
 *     summary: Crée une nouvelle photo
 *     tags: [Photo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Photo'
 *     responses:
 *       201:
 *         description: Photo créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Photo'
 *       400:
 *         description: Erreur de validation
 */
router.post('/', async (req, res) => {
  try {
    const photo = new Photo(req.body);
    await photo.save();
    res.status(201).json(photo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/photos/{id}:
 *   put:
 *     summary: Met à jour une photo
 *     tags: [Photo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la photo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Photo'
 *     responses:
 *       200:
 *         description: Photo mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Photo'
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Photo non trouvée
 */
router.put('/:id', async (req, res) => {
  try {
    const photo = await Photo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!photo) return res.status(404).json({ error: 'Not found' });
    res.json(photo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/photos/{id}:
 *   delete:
 *     summary: Supprime une photo
 *     tags: [Photo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la photo
 *     responses:
 *       200:
 *         description: Photo supprimée
 *       404:
 *         description: Photo non trouvée
 */
router.delete('/:id', async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Photo:
 *       type: object
 *       required:
 *         - url
 *       properties:
 *         _id:
 *           type: string
 *           description: ID auto-généré
 *         url:
 *           type: string
 *           description: URL de la photo
 *         description:
 *           type: string
 *           description: Description de la photo
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date de création
 */

module.exports = router;
