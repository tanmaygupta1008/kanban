const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project', // References the 'Project' model
        required: true
    },
    idea: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    section: { // Corresponds to your KanbanColumnKey (e.g., 'ideas', 'development')
        type: String,
        required: true,
        enum: ['frontend', 'backend'] // Only allow these two values to ensure consistency
    },
    column: { // Corresponds to your KanbanColumnKey (e.g., 'ideas', 'development')
        type: String,
        required: true,
        enum: ['ideas', 'ongoingResearch', 'development', 'integration', 'completed'] // Ensure consistency
    },
    image: {
        type: String, // URL to an image
        required: false
    },
    videoLink: {
        type: String, // URL to a video
        required: false
    },
    references: {
        type: [String], // Array of URLs
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // postedBy: { // Reference to the user who posted/owns the task
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User', // References the 'User' model
    //     required: true
    // },
    postedBy: { // Reference to the user who posted/owns the task
        type: String,
        // ref: 'User', // References the 'User' model
        required: true
    },
    order: { // To maintain the order of tasks within a column
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Task', taskSchema, 'tasks');
