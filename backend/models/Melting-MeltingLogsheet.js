const mongoose = require('mongoose');

// Sub-schema for a single table entry (one row of all 5 tables)
const EntrySchema = new mongoose.Schema({
    // Table 1 - Charging Details
    heatno: { type: Number, default: 0 },
    grade: { type: String, default: '' },
    chargingkgs: {
        time: { type: String, default: '' },
        ifbath: { type: Number, default: 0 },
        liquidmetal: {
            presspour: { type: Number, default: 0 },
            holder: { type: Number, default: 0 }
        },
        sqmssteel: { type: Number, default: 0 },
        greymssteel: { type: Number, default: 0 },
        returnSg: { type: Number, default: 0 },
        pigiron: { type: Number, default: 0 },
        borings: { type: Number, default: 0 },
        finalbath: { type: Number, default: 0 }
    },

    // Table 2 - Additions
    charcoal: { type: Number, default: 0 },
    cpc: {
        fur: { type: Number, default: 0 },
        lc: { type: Number, default: 0 }
    },
    siliconcarbide: {
        fur: { type: Number, default: 0 }
    },
    ferroSilicon: {
        fur: { type: Number, default: 0 },
        lc: { type: Number, default: 0 }
    },
    ferroManganese: {
        fur: { type: Number, default: 0 },
        lc: { type: Number, default: 0 }
    },
    cu: { type: Number, default: 0 },
    cr: { type: Number, default: 0 },
    pureMg: { type: Number, default: 0 },
    ironPyrite: { type: Number, default: 0 },

    // Table 3 - Timing Details
    labCoin: {
        time: { type: String, default: '' },
        tempC: { type: Number, default: 0 }
    },
    deslagingTime: {
        from: { type: String, default: '' },
        to: { type: String, default: '' }
    },
    metalReadyTime: { type: String, default: '' },
    waitingForTapping: {
        from: { type: String, default: '' },
        to: { type: String, default: '' }
    },
    reason: { type: String, default: '' },

    // Table 4 - Metal Tapping
    metalTapping: {
        time: { type: String, default: '' },
        tempCSg: { type: Number, default: 0 }
    },
    directFurnace: { type: Number, default: 0 },
    holderToFurnace: { type: Number, default: 0 },
    furnaceToHolder: { type: Number, default: 0 },
    disaNo: { type: String, default: '' },
    item: { type: String, default: '' },

    // Table 5 - Electrical Readings
    electricalReadings: {
        furnace1: {
            kw: { type: Number, default: 0 },
            v: { type: Number, default: 0 },
            a: { type: Number, default: 0 }
        },
        furnace2: {
            kw: { type: Number, default: 0 },
            v: { type: Number, default: 0 },
            a: { type: Number, default: 0 }
        },
        furnace3: {
            kw: { type: Number, default: 0 },
            v: { type: Number, default: 0 },
            a: { type: Number, default: 0 }
        },
        furnace4: {
            hz: { type: Number, default: 0 },
            gld: { type: Number, default: 0 },
            kwhr: { type: Number, default: 0 }
        }
    }
}, { _id: true, timestamps: true });

// Sub-schema for a primary combination (shift + furnace + panel)
const PrimarySchema = new mongoose.Schema({
    shift: { type: String, required: true },
    furnaceNo: { type: String, required: true },
    panel: { type: String, required: true },
    cumulativeLiquidMetal: { type: Number, default: 0 },
    finalkwhr: { type: Number, default: 0 },
    initialkwhr: { type: Number, default: 0 },
    totoalunits: { type: Number, default: 0 },
    cumulativeunits: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    entries: [EntrySchema]
}, { _id: true, timestamps: true });

// Main document - one per date
const MeltingLogsheetSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    primaries: [PrimarySchema]
}, {
    timestamps: true,
    collection: 'melting_log_sheet'
});

module.exports = mongoose.model('MeltingLogsheet', MeltingLogsheetSchema);
