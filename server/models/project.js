const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    // You might want to add a reference to the user who created the project
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the 'User' model
        required: false // Or true, depending on your requirements
    },
    // If you want to embed team members directly in the project document
    teamMembers: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            name: { // Store name for easier lookup, though could also populate from User
                type: String,
                required: true
            },
            avatarUrl: { // Optional: if you store avatar URLs here
                type: String
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', projectSchema, 'projects');
