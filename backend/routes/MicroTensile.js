const express = require('express');
const router = express.Router();
const microTensileController = require('../controllers/MicroTensile');
router.get('/current-date', microTensileController.getCurrentDate);
router.get('/check', microTensileController.checkDateDisaEntries);
router.get('/grouped', microTensileController.getGroupedByDate);
router.get('/by-date', microTensileController.getEntriesByDate);
router.get('/filter', microTensileController.filterEntries);

router.post('/save-primary', microTensileController.savePrimary);
router.post('/', microTensileController.createEntry);

module.exports = router;