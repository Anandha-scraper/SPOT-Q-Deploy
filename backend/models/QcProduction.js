const mongoose = require('mongoose');

const QcProductionSchema = new mongoose.Schema({

    date: { 
        type: Date, 
        required: true 
    },

    partName: { 
        type: String, 
        required: true, 
        trim: true
     },

    noOfMoulds: { 
        type: Number, 
        required: true,
        min: 1 
        },

    cPercentFrom: { 
        type: Number, 
        required: true
    },
    cPercentTo: { 
        type: Number, 
        default: 0
    },

    siPercentFrom: { 
        type: Number, 
        required: true
    },
    siPercentTo: { 
        type: Number, 
        default: 0
    },

    mnPercentFrom: { 
        type: Number,
        required: true
    },
    mnPercentTo: { 
        type: Number,
        default: 0
    },

    pPercentFrom: { 
        type: Number,
        required: true
    },
    pPercentTo: { 
        type: Number,
        default: 0
    },

    sPercentFrom: {
         type: Number, 
         required: true
    },
    sPercentTo: {
         type: Number, 
         default: 0
    },

    mgPercentFrom: { 
        type: Number,
        required: true
    },
    mgPercentTo: { 
        type: Number,
        default: 0
    },

    cuPercentFrom: {
        type: Number,
        required: true
    },
    cuPercentTo: {
        type: Number,
        default: 0
    },

    crPercentFrom: { 
        type: Number,
        required: true
    },
    crPercentTo: { 
        type: Number,
        default: 0
    },

    nodularity: {
        type: Number,
        required: true
    },

    noduleCount: {
        type: Number,
        required: true
    },

    graphiteTypeFrom: {
        type: Number,
        required: true
    },
    graphiteTypeTo: {
        type: Number,
        default: 0
    },

    pearlite: {
        type: Number,
        required: true
    },

    ferrite: {
        type: Number,
        required: true
    },

    hardnessBHNFrom: { 
        type: Number,
        required: true
    },
    hardnessBHNTo: { 
        type: Number,
        default: 0
    },

    ts: [{
        type: Number,
        required: true
    }],
    ys: [{
        type: String,
        required: true,
        trim: true
    }],
    el: [{
        type: String,
        required: true,
        trim: true
    }]
}, {
    timestamps: true,
    collection: 'qc_production_details'
});

module.exports = mongoose.model('QcProduction', QcProductionSchema);
