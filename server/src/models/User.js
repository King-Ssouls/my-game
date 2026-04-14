const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            name: String,
            required: [true, "email required"],
            minlenght: 4,
            maxlenght: 50, 
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email"],
        },

        passwordHash: {
            type: String,
            required: [true, "hash passwort required "],
            select: false,
        },

        niclname: {
            type: String,
            required: [true, "nickname required"],
            trim: true,
            unique: true,
            minlenght: 4,
            maxlenght: 16,
        },

        avatarUrl: {
            type: String,
            default: null,
        },
        
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('User', userSchema);