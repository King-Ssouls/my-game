const mongoose = require('mongoose');

const levelStarSchema = new mongoose.Schema(
    {
        levelNumber: {
            type: Number,
            required: true,
            min: 1,
        },

        stars: {
            type: Number,
            required: true,
            min: 1,
            max: 3,
        },
    },
    {
        _id: false
    }
);

const progressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },

        unlockedLevels: {
            type: [Number],
            default: () => [1]
        },

        completedLevels: {
        type: [Number],
        default: () => []
        },

        levelStars: {
            type: [levelStarSchema],
            default: () => []
        },

        currentLevel: {
            type: Number,
            min: 1,
            default: 1,
        },

        toralStore: {
            type: Number,
            min: 0,
            default: 0
        },
        totalDeath: {
            type: Number,
            min: 0,
            default: 0
        },
        totalPlayTime: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('Progress', progressSchema);