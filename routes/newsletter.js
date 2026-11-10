const express = require('express');
const router = express.Router();

const Newsletter = require('../models/Newsletter');
const { sendNewsletterWelcome } = require('../config/mailer');

router.get('/', async (req, res) => {
  try {
    const newsletters = await Newsletter.findAll({ order: [['date', 'DESC']] });
    res.json(newsletters.map(item => item.get({ plain: true })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const newsletter = await Newsletter.findByPk(req.params.id);
    if (!newsletter) return res.status(404).json({ error: 'Not found' });
    res.json(newsletter.get({ plain: true }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Une adresse email valide est obligatoire.' });
    }

    let newsletter = await Newsletter.findOne({ where: { email } });
    if (newsletter) {
      return res.status(200).json({ ...newsletter.get({ plain: true }), alreadySubscribed: true });
    }

    newsletter = await Newsletter.create({ email, name: (req.body.name || '').trim() });

    try {
      await sendNewsletterWelcome(newsletter.email, newsletter.name);
    } catch (err) {
      console.error("[newsletter] Échec de l'email de bienvenue:", err.message);
    }

    res.status(201).json(newsletter.get({ plain: true }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedRows, [newsletter]] = await Newsletter.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });

    if (!updatedRows || !newsletter) return res.status(404).json({ error: 'Not found' });
    res.json(newsletter.get({ plain: true }));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Newsletter.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
