const QcProduction = require('../models/QcProduction');
const { getCurrentDate } = require('../utils/dateUtils');

/** 1. SYSTEM INITIALIZATION **/

exports.initializeTodayEntry = async () => {
    // Skip initialization - QcProduction documents are created when data is submitted
    return;
};

/** 2. DATA RETRIEVAL **/

exports.getAllEntries = async (req, res) => {
    try {
        const documents = await QcProduction.find().sort({ date: -1 });

        res.status(200).json({ success: true, count: documents.length, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching QC production records.' });
    }
};

// Get unique part names for autocomplete
exports.getPartNames = async (req, res) => {
    try {
        // Get distinct part names from the database, excluding empty/null values
        const partNames = await QcProduction.distinct('partName', {
            partName: { $exists: true, $ne: '', $ne: null }
        });

        // Sort alphabetically for better UX
        partNames.sort();

        res.status(200).json({ success: true, partNames });
    } catch (error) {
        console.error('Error fetching part names:', error);
        res.status(500).json({ success: false, message: 'Error fetching part names.' });
    }
};

/** 3. CORE OPERATIONS **/

exports.createEntry = async (req, res) => {
    try {
        const entryData = req.body;
        
        if (!entryData.date) {
            return res.status(400).json({ success: false, message: 'Date is required.' });
        }

        const newEntry = await QcProduction.create(entryData);

        res.status(201).json({ 
            success: true, 
            data: newEntry,
            message: 'Entry added to production log.' 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};