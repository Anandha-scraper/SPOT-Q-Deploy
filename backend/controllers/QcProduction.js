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

// Helper function to parse range string "min - max" or single value
const parseRange = (rangeStr) => {
    if (typeof rangeStr === 'string' && rangeStr.includes(' - ')) {
        const [from, to] = rangeStr.split(' - ').map(v => parseFloat(v.trim()));
        return { from, to };
    }
    // Single value or already a number
    const value = parseFloat(rangeStr);
    return { from: value, to: 0 };
};

exports.createEntry = async (req, res) => {
    try {
        const entryData = req.body;
        
        if (!entryData.date) {
            return res.status(400).json({ success: false, message: 'Date is required.' });
        }

        // Transform frontend payload to backend model format
        const cPercent = parseRange(entryData.cPercent);
        const siPercent = parseRange(entryData.siPercent);
        const mnPercent = parseRange(entryData.mnPercent);
        const pPercent = parseRange(entryData.pPercent);
        const sPercent = parseRange(entryData.sPercent);
        const mgPercent = parseRange(entryData.mgPercent);
        const cuPercent = parseRange(entryData.cuPercent);
        const crPercent = parseRange(entryData.crPercent);
        const graphiteType = parseRange(entryData.graphiteType);
        const hardnessBHN = parseRange(entryData.hardnessBHN);

        const transformedData = {
            date: entryData.date,
            partName: entryData.partName,
            noOfMoulds: parseFloat(entryData.noOfMoulds),
            cPercentFrom: cPercent.from,
            cPercentTo: cPercent.to,
            siPercentFrom: siPercent.from,
            siPercentTo: siPercent.to,
            mnPercentFrom: mnPercent.from,
            mnPercentTo: mnPercent.to,
            pPercentFrom: pPercent.from,
            pPercentTo: pPercent.to,
            sPercentFrom: sPercent.from,
            sPercentTo: sPercent.to,
            mgPercentFrom: mgPercent.from,
            mgPercentTo: mgPercent.to,
            cuPercentFrom: cuPercent.from,
            cuPercentTo: cuPercent.to,
            crPercentFrom: crPercent.from,
            crPercentTo: crPercent.to,
            nodularity: parseFloat(entryData.nodularity),
            noduleCount: parseFloat(entryData.noduleCount),
            graphiteTypeFrom: graphiteType.from,
            graphiteTypeTo: graphiteType.to,
            pearlite: parseFloat(entryData.pearlite),
            ferrite: parseFloat(entryData.ferrite),
            hardnessBHNFrom: hardnessBHN.from,
            hardnessBHNTo: hardnessBHN.to,
            ts: entryData.ts, // Array of numbers
            ys: entryData.ys, // Array of strings (range format)
            el: entryData.el  // Array of strings (range format)
        };

        const newEntry = await QcProduction.create(transformedData);

        res.status(201).json({ 
            success: true, 
            data: newEntry,
            message: 'Entry added to production log.' 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};