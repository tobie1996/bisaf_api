const express = require('express');
const router = express.Router();

const Photo = require('../models/Photo');

router.get('/', async (req, res) => {
  try {
    const photos = await Photo.findAll({ order: [['date', 'DESC']] });
    res.json(photos.map(item => item.get({ plain: true })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Not found' });
    res.json(photo.get({ plain: true }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const photo = await Photo.create(req.body);
    res.status(201).json(photo.get({ plain: true }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedRows, [photo]] = await Photo.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });

    if (!updatedRows || !photo) return res.status(404).json({ error: 'Not found' });
    res.json(photo.get({ plain: true }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Photo.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
