const express = require('express');
const router = express.Router();
const { 
    createEntry, 
    getEntriesByDate, 
    getGroupedByDate, 
    getCurrentDate, 
    getValidationSchema, 
    filterEntries,
    getAllEntries
} = require('../controllers/Tensile');
router.get('/current-date', getCurrentDate);
router.get('/validation-schema', getValidationSchema);
router.get('/grouped', getGroupedByDate); 
router.get('/by-date', getEntriesByDate); 
router.get('/filter', filterEntries);     
router.get('/', getAllEntries);
router.post('/', createEntry);

module.exports = router;