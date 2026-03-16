const express = require('express');
const router = express.Router();
const microTensileController = require('../controllers/MicroTensile');
router.get('/current-date', microTensileController.getCurrentDate);
router.get('/check', microTensileController.checkDateDisaEntries);
router.get('/grouped', microTensileController.getGroupedByDate);
router.get('/by-date', microTensileController.getEntriesByDate);
router.get('/filter', microTensileController.filterEntries);

router.route('/')
    .get(microTensileController.getAllEntries)
    .post(microTensileController.createEntry);

router.post('/save-primary', microTensileController.savePrimary);

module.exports = router;