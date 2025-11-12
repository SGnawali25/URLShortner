// models/user.js
import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: {
        url: { type: String },
    },
    role: { type: String, default: 'user'},
    createdAt: { type: Date, default: Date.now }
});


export const User = mongoose.model('User', userSchema);



