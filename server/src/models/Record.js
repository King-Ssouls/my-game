const mongoose = require('mongoose');


const recordSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },

        levelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Level',
            required: true,
            index: true
        },

        levelNumber: {
            type: Number,
            required: true,
            index: true,
            min: 1
        },

        bestTimeMs: {
            type: Number,
            required: true,
            min: 0
        },

        bestScore: {
            type: Number,
            required: true,
            min: 0
        },

        kills: {
            type: Number,
            default: 0,
            min: 0
        },

        damageTaken: {
            type: Number,
            default: 0,
            min: 0
        },

        deathsTaken: {
            type: Number,
            default: 0,
            min: 0
        },

        lastRunAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

recordSchema.index({ userId: 1, levelId: 1 }, { unique: true });

module.exports = mongoose.model('Record', recordSchema);