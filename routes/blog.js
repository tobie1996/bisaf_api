const express = require('express');
const router = express.Router();


const Blog = require('../models/Blog');
const { sendContentUpdateToSubscribers } = require('../config/mailer');


/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Récupère tous les articles de blog
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: Liste des articles de blog
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 */
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/blog/{id}:
 *   get:
 *     summary: Récupère un article de blog par ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'article de blog
 *     responses:
 *       200:
 *         description: Article trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Article non trouvé
 */
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/blog:
 *   post:
 *     summary: Crée un nouvel article de blog
 *     tags: [Blog]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       201:
 *         description: Article créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Erreur de validation
 */
router.post('/', async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    try {
      await sendContentUpdateToSubscribers({ type: 'blog', item: blog, action: 'create' });
    } catch (err) {
      console.error('[blog] Échec de la notification newsletter:', err.message);
    }
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/blog/{id}:
 *   put:
 *     summary: Met à jour un article de blog
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'article de blog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       200:
 *         description: Article mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Article non trouvé
 */
router.put('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ error: 'Not found' });
    try {
      await sendContentUpdateToSubscribers({ type: 'blog', item: blog, action: 'update' });
    } catch (err) {
      console.error('[blog] Échec de la notification newsletter:', err.message);
    }
    res.json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/blog/{id}:
 *   delete:
 *     summary: Supprime un article de blog
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'article de blog
 *     responses:
 *       200:
 *         description: Article supprimé
 *       404:
 *         description: Article non trouvé
 */
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
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
 *           description: Titre de l'article
 *         content:
 *           type: string
 *           description: Contenu de l'article
 *         author:
 *           type: string
 *           description: Auteur de l'article
 *         image:
 *           type: string
 *           description: URL de l'image de l'article
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date de création
 */

module.exports = router;
