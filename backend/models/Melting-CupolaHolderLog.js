const mongoose = require('mongoose');

// Sub-schema for a single entry row (one heat)
const EntrySchema = new mongoose.Schema({
    heatNo: { type: String, default: '' },
    // Additions
    cpc: { type: Number, default: 0 },
    FeSl: { type: Number, default: 0 },
    feMn: { type: Number, default: 0 },
    sic: { type: Number, default: 0 },
    pureMg: { type: Number, default: 0 },
    cu: { type: Number, default: 0 },
    feCr: { type: Number, default: 0 },
    // Tapping
    actualTime: { type: String, default: '' },
    tappingTime: { type: String, default: '' },
    tappingTemp: { type: Number, default: 0 },
    metalKg: { type: Number, default: 0 },
    // Pouring
    disaLine: { type: String, default: '' },
    indFur: { type: String, default: '' },
    bailNo: { type: String, default: '' },
    // Electrical
    tap: { type: String, default: '' },
    kw: { type: Number, default: 0 },
    // Remarks
    remarks: { type: String, default: '' }
}, { _id: true, timestamps: true });

// Sub-schema for a primary combination (shift + holderNumber)
const PrimarySchema = new mongoose.Schema({
    shift: { type: String, required: true },
    holderNumber: { type: String, required: true },
    entries: [EntrySchema]
}, { _id: true, timestamps: true });

// Main document — one per date
const CupolaHolderLogSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    primaries: [PrimarySchema]
}, {
    timestamps: true,
    collection: 'cupola_holder_log'
});

module.exports = mongoose.model('CupolaHolderLog', CupolaHolderLogSchema);
