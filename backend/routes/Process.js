const express = require('express');
const router = express.Router();
const {
    getAllEntries,
    createEntry,
    checkDateDisaEntries,
    savePrimary,
    getPartNames
} = require('../controllers/Process');

router.route('/')
    .get(getAllEntries)
    .post(createEntry);

router.route('/check')
    .get(checkDateDisaEntries);

router.route('/save-primary')
    .post(savePrimary);

router.route('/part-names')
    .get(getPartNames);

module.exports = router;