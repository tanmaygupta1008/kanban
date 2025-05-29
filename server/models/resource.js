// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const resourceSchema = new Schema({
//     projectId: {
//         type: Schema.Types.ObjectId,
//         ref: 'Project', // Assuming you have a Project model
//         required: true,
//     },
//     category: {
//         type: String,
//         enum: ['papers', 'images', 'videos', 'repositories', 'others'],
//         required: true,
//     },
//     link: {
//         type: String,
//         required: true,
//     },
//     description: {
//         type: String,
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
// });

// module.exports = mongoose.model('Resource', resourceSchema);




const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resourceSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project', // Assuming you have a Project model
        required: true,
    },
    category: {
        type: String,
        enum: ['papers', 'images', 'videos', 'repositories', 'others'],
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    websiteLink: { // New field for website link (only relevant for images)
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Resource', resourceSchema);