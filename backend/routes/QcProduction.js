const express = require('express');
const router = express.Router();
const qcController = require('../controllers/QcProduction');

router.route('/')
    .get(qcController.getAllEntries)
    .post(qcController.createEntry);

// GET /part-names - Get unique part names for autocomplete
router.get('/part-names', qcController.getPartNames);

module.exports = router;