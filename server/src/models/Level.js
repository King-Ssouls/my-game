const mongoose = require('mongoose');


const levelSchema = new mongoose.Schema(
    {
        number: {
            type: Number,
            required: true,
            unique: true,
            index: true,
            min: 1
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 120
        },

        theme: {
            type: String,
            default: 'default',
            trim: true,
            maxlength: 50
        },

        isPublished: {
            type: Boolean,
            default: true
        },

        minCompletionTimeMs: {
            type: Number,
            default: 5000,
            min: 0
        },

        maxScore: {
            type: Number,
            default: 9999,
            min: 0
        },

        previewBackground: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('Level', levelSchema);