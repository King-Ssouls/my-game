const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email обязателен'],
            minlength: 4,
            maxlength: 50,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Введите корректный email']
        },

        passwordHash: {
            type: String,
            required: [true, 'Пароль обязателен'],
            select: false
        },

        nickname: {
            type: String,
            required: [true, 'Никнейм обязателен'],
            trim: true,
            unique: true,
            minlength: 4,
            maxlength: 16
        },

        avatarUrl: {
            type: String,
            default: null
        },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('User', userSchema);
