const express = require('express');
const router = express.Router();
const db = require('../db');

// List all notifications / alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await db.getAlerts();
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark alert as read
router.put('/:id/read', async (req, res) => {
  try {
    await db.markAlertRead(req.params.id);
    res.json({ success: true, message: 'Alert marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
