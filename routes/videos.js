const express = require('express');
const router = express.Router();

const Video = require('../models/Video');
const { sendContentUpdateToSubscribers } = require('../config/mailer');

router.get('/', async (req, res) => {
  try {
    const videos = await Video.findAll({ order: [['date', 'DESC']] });
    res.json(videos.map(item => item.get({ plain: true })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.id);
    if (!video) return res.status(404).json({ error: 'Not found' });
    res.json(video.get({ plain: true }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const video = await Video.create(req.body);
    try {
      await sendContentUpdateToSubscribers({ type: 'video', item: video.get({ plain: true }), action: 'create' });
    } catch (err) {
      console.error('[videos] Échec de la notification newsletter:', err.message);
    }
    res.status(201).json(video.get({ plain: true }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedRows, [video]] = await Video.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });

    if (!updatedRows || !video) return res.status(404).json({ error: 'Not found' });

    try {
      await sendContentUpdateToSubscribers({ type: 'video', item: video.get({ plain: true }), action: 'update' });
    } catch (err) {
      console.error('[videos] Échec de la notification newsletter:', err.message);
    }

    res.json(video.get({ plain: true }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Video.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
