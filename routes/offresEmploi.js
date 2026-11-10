const express = require('express');
const router = express.Router();

const OffreEmploi = require('../models/OffreEmploi');
const { sendContentUpdateToSubscribers } = require('../config/mailer');

router.get('/', async (req, res) => {
  try {
    const offres = await OffreEmploi.findAll({ order: [['date', 'DESC']] });
    res.json(offres.map(item => item.get({ plain: true })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const offre = await OffreEmploi.findByPk(req.params.id);
    if (!offre) return res.status(404).json({ error: 'Not found' });
    res.json(offre.get({ plain: true }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const offre = await OffreEmploi.create(req.body);
    try {
      await sendContentUpdateToSubscribers({ type: 'offre', item: offre.get({ plain: true }), action: 'create' });
    } catch (err) {
      console.error('[offres-emploi] Échec de la notification newsletter:', err.message);
    }
    res.status(201).json(offre.get({ plain: true }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedRows, [offre]] = await OffreEmploi.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });

    if (!updatedRows || !offre) return res.status(404).json({ error: 'Not found' });

    try {
      await sendContentUpdateToSubscribers({ type: 'offre', item: offre.get({ plain: true }), action: 'update' });
    } catch (err) {
      console.error('[offres-emploi] Échec de la notification newsletter:', err.message);
    }

    res.json(offre.get({ plain: true }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await OffreEmploi.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
