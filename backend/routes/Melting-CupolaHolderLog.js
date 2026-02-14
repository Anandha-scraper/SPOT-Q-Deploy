const express = require('express');
const router = express.Router();
const cupolaController = require('../controllers/Melting-CupolaHolderLog');

router.get('/filter', cupolaController.filterByDateRange);
router.get('/primary/:date', cupolaController.getPrimaryByDate);
router.post('/primary', cupolaController.createOrUpdatePrimary);
router.post('/table-update', cupolaController.createTableEntry);

module.exports = router;