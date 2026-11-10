const express = require('express');
const router = express.Router();

const Blog = require('../models/Blog');
const { sendContentUpdateToSubscribers } = require('../config/mailer');

router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.findAll({ order: [['date', 'DESC']] });
    res.json(blogs.map(blog => blog.get({ plain: true })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Not found' });
    res.json(blog.get({ plain: true }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    try {
      await sendContentUpdateToSubscribers({ type: 'blog', item: blog.get({ plain: true }), action: 'create' });
    } catch (err) {
      console.error('[blog] Échec de la notification newsletter:', err.message);
    }
    res.status(201).json(blog.get({ plain: true }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedRows, [blog]] = await Blog.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });

    if (!updatedRows || !blog) return res.status(404).json({ error: 'Not found' });

    try {
      await sendContentUpdateToSubscribers({ type: 'blog', item: blog.get({ plain: true }), action: 'update' });
    } catch (err) {
      console.error('[blog] Échec de la notification newsletter:', err.message);
    }

    res.json(blog.get({ plain: true }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Blog.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
