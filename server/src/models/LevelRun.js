const mongoose = require('mongoose');

const levelRunSchema = new mongoose.Schema(
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

        runToken: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        status: {
            type: String,
            enum: ['started', 'completed', 'expired', 'cancelled'],
            default: 'started',
            index: true
        },

        startedAt: {
            type: Date,
            default: Date.now,
            index: true
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true
        },

        completedAt: {
            type: Date,
            default: null
        },

        submittedResult: {
            elapsedMs: {
                type: Number,
                default: null
            },

            score: {
                type: Number,
                default: null
            },

            kills: {
                type: Number,
                default: null
            },

            damageTaken: {
                type: Number,
                default: null
            },

            deathsTaken: {
                type: Number,
                default: null
            }
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('LevelRun', levelRunSchema);