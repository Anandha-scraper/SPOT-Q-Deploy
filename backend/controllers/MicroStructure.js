const MicroStructure = require('../models/MicroStructure');

/** 1. SYSTEM INITIALIZATION & METADATA **/

// Initialize current date entry on server startup
exports.initializeTodayEntry = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const existingDoc = await MicroStructure.findOne({ date: today });
        
        if (!existingDoc) {
            await MicroStructure.create({ date: today, entries: [], savedDisas: [] });
            console.log(`Created empty MicroStructure document for ${today}`);
        }
    } catch (error) {
        console.error('MicroStructure initialization failed:', error.message);
    }
};

// Get current date from server (ensures timezone consistency)
exports.getCurrentDate = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let document = await MicroStructure.findOne({ date: today });
        
        if (!document) {
            document = await MicroStructure.create({ date: today, entries: [], savedDisas: [] });
        }
        
        res.status(200).json({ success: true, date: today });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching current date.' });
    }
};

/** 2. GET LAST USED DISA **/

// Returns the most recently used DISA value from the database
// Looks at the latest document (by date) and returns the last savedDisa
exports.getLastDisa = async (req, res) => {
    try {
        // Find the most recent document that has savedDisas
        const latestDoc = await MicroStructure.findOne(
            { savedDisas: { $exists: true, $ne: [] } }
        ).sort({ date: -1 });

        if (!latestDoc || !latestDoc.savedDisas || latestDoc.savedDisas.length === 0) {
            return res.status(200).json({ success: true, lastDisa: '' });
        }

        // Return the last DISA in the savedDisas array of the most recent document
        const lastDisa = latestDoc.savedDisas[latestDoc.savedDisas.length - 1];
        res.status(200).json({ success: true, lastDisa });
    } catch (error) {
        console.error('Error fetching last DISA:', error);
        res.status(500).json({ success: false, message: 'Error fetching last DISA.' });
    }
};

/** 3. CHECK DATE+DISA ENTRIES COUNT **/
exports.checkDateDisaEntries = async (req, res) => {
    try {
        const { date, disa } = req.query;

        if (!date || !disa) {
            return res.status(400).json({ success: false, message: 'Date and DISA are required.' });
        }

        const document = await MicroStructure.findOne({ date });

        if (!document) {
            return res.status(200).json({ success: true, exists: false, count: 0 });
        }

        // Check if this disa is in savedDisas array
        const exists = document.savedDisas && document.savedDisas.includes(disa);
        
        // Count entries for this specific disa
        const count = document.entries.filter(entry => entry.disa === disa).length;

        return res.status(200).json({ success: true, exists, count });
    } catch (error) {
        console.error('Error checking date+disa:', error);
        res.status(500).json({ success: false, message: 'Error checking entries.' });
    }
};

/** 3. SAVE PRIMARY DATA (Date + DISA) **/
exports.savePrimary = async (req, res) => {
    try {
        const { date, disa } = req.body;

        if (!date || !disa) {
            return res.status(400).json({ success: false, message: 'Date and DISA are required.' });
        }

        let document = await MicroStructure.findOne({ date });

        if (!document) {
            // Create new document with this disa in savedDisas
            document = await MicroStructure.create({
                date,
                savedDisas: [disa],
                entries: []
            });
        } else {
            // Add disa to savedDisas if not already present
            if (!document.savedDisas.includes(disa)) {
                document.savedDisas.push(disa);
                await document.save();
            }
        }

        // Count entries for this specific disa
        const count = document.entries.filter(entry => entry.disa === disa).length;

        return res.status(200).json({ 
            success: true, 
            count,
            message: 'Primary data saved successfully.' 
        });
    } catch (error) {
        console.error('Error saving primary:', error);
        res.status(500).json({ success: false, message: 'Error saving primary data.' });
    }
};

/** 4. DATA RETRIEVAL & REPORTING **/

exports.getGroupedByDate = async (req, res) => {
    try {
        const documents = await MicroStructure.find().select('date entries').sort({ date: -1 });
        const grouped = documents.map(doc => ({
            date: doc.date,
            count: doc.entries.length,
            hasData: doc.entries.length > 0
        }));
        res.status(200).json({ success: true, count: grouped.length, data: grouped });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching grouped dates.' });
    }
};

exports.getEntriesByDate = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ success: false, message: 'Date required.' });

        let document = await MicroStructure.findOne({ date });
        if (!document) {
            document = await MicroStructure.create({ date, entries: [], savedDisas: [] });
        }
        res.status(200).json({ success: true, count: document.entries.length, data: document.entries });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching entries.' });
    }
};

/** 3. CORE CRUD OPERATIONS **/

exports.createEntry = async (req, res) => {
    try {
        const { date, ...entryData } = req.body;
        
        // Basic mandatory field validation
        if (!date || !entryData.disa || !entryData.partName || !entryData.heatCode) {
            return res.status(400).json({ success: false, message: 'Date, DISA, Part Name, and Heat Code are required.' });
        }

        let document = await MicroStructure.findOne({ date });
        if (!document) {
            document = await MicroStructure.create({ date, entries: [], savedDisas: [] });
        }
        document.entries.push(entryData);
        await document.save();

        res.status(201).json({ 
            success: true, 
            data: document.entries[document.entries.length - 1],
            message: 'MicroStructure record added successfully.' 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/** 4. ADVANCED FILTERING (History View) **/

exports.filterEntries = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate) return res.status(400).json({ success: false, message: 'Start date required.' });

        // Use string comparison for dates (YYYY-MM-DD format sorts lexicographically)
        const query = { date: { $gte: startDate } };
        if (endDate) {
            query.date.$lte = endDate;
        } else {
            query.date.$lte = startDate;
        }

        const documents = await MicroStructure.find(query).sort({ date: -1 });

        // Flatten entries while attaching the parent date for traceability
        const allEntries = documents.flatMap(doc => 
            doc.entries.map(entry => ({ ...entry.toObject(), date: doc.date }))
        );

        res.status(200).json({ success: true, count: allEntries.length, data: allEntries });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Filtering failed.' });
    }
};