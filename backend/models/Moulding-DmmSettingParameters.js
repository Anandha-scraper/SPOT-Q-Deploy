const mongoose = require('mongoose');

const ParameterEntrySchema = new mongoose.Schema({
    sNo: {
        type: Number,
        required: true
    },
    customer: {
        type: String,
        default: ''
    },
    itemDescription: {
        type: String,
        default: ''
    },
    time: {
        type: String,
        default: ''
    },
    ppThickness: {
        type: Number,
        default: 0
    },
    ppHeight: {
        type: Number,
        default: 0
    },
    spThickness: {
        type: Number,
        default: 0
    },
    spHeight: {
        type: Number,
        default: 0
    },
    coreMaskThickness: {
        type: Number,
        default: 0
    },
    coreMaskHeightOutside: {
        type: Number,
        default: 0
    },
    coreMaskHeightInside: {
        type: Number,
        default: 0
    },
    sandShotPressureBar: {
        type: Number,
        default: 0
    },
    correctionShotTime: {
        type: Number,
        default: 0
    },
    squeezePressure: {
        type: Number,
        default: 0
    },
    ppStrippingAcceleration: {
        type: Number,
        default: 0
    },
    ppStrippingDistance: {
        type: Number,
        default: 0
    },
    spStrippingAcceleration: {
        type: Number,
        default: 0
    },
    spStrippingDistance: {
        type: Number,
        default: 0
    },
    mouldThicknessPlus10: {
        type: Number,
        default: 0
    },
    closeUpForceMouldCloseUpPressure: {
        type: String,
        default: ''
    },
    remarks: {
        type: String,
        default: ''
    }
}, { _id: false });

const MachineShiftEntrySchema = new mongoose.Schema({
    machine: {
        type: String,
        required: true,
        trim: true
    },
    shift: {
        type: String,
        required: true,
        trim: true
    },
    operatorName: {
        type: String,
        default: ''
    },
    checkedBy: {
        type: String,
        default: ''
    },
    parameters: [ParameterEntrySchema]
}, { _id: false });

const DmmSettingParametersSchema = new mongoose.Schema({
    // Primary Identifier - only date (unique)
    date: {
        type: Date,
        required: true,
        unique: true,
        index: true
    },
    
    // Array of machine-shift combinations
    entries: [MachineShiftEntrySchema]
}, {
    timestamps: true,
    collection: 'dmm_setting_parameters'
});

module.exports = mongoose.model('DmmSettingParameters', DmmSettingParametersSchema);
