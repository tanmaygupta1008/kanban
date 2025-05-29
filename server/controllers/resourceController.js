// const Resource = require('../models/resource');

// // Save a new resource
// exports.createResource = async (req, res) => {
//     try {
//         const { projectId, category, link, description } = req.body;
//         const newResource = new Resource({
//             projectId,
//             category,
//             link,
//             description,
//         });
//         const savedResource = await newResource.save();
//         res.status(201).json(savedResource);
//     } catch (error) {
//         console.error('Error creating resource:', error);
//         res.status(500).json({ message: 'Failed to create resource.', error: error.message });
//     }
// };

// // Fetch resources for a specific project
// exports.getResourcesByProject = async (req, res) => {
//     try {
//         const projectId = req.params.projectId;
//         const resources = await Resource.find({ projectId });
//         res.status(200).json(resources);
//     } catch (error) {
//         console.error('Error fetching resources:', error);
//         res.status(500).json({ message: 'Failed to fetch resources.', error: error.message });
//     }
// };

// // Delete a resource by ID
// exports.deleteResource = async (req, res) => {
//     try {
//         const resourceId = req.params.resourceId;
//         const deletedResource = await Resource.findByIdAndDelete(resourceId);
//         if (!deletedResource) {
//             return res.status(404).json({ message: 'Resource not found.' });
//         }
//         res.status(200).json({ message: 'Resource deleted successfully.' });
//     } catch (error) {
//         console.error('Error deleting resource:', error);
//         res.status(500).json({ message: 'Failed to delete resource.', error: error.message });
//     }
// };


const Resource = require('../models/resource');

// Save a new resource
exports.createResource = async (req, res) => {
    try {
        // Destructure websiteLink from req.body
        const { projectId, category, link, description, websiteLink } = req.body;
        
        const newResource = new Resource({
            projectId,
            category,
            link,
            description,
            // Include websiteLink if it's provided in the request body
            websiteLink: category === 'images' ? websiteLink : undefined, 
        });
        const savedResource = await newResource.save();
        res.status(201).json(savedResource);
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ message: 'Failed to create resource.', error: error.message });
    }
};

// Fetch resources for a specific project
exports.getResourcesByProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        // The find method will automatically include the websiteLink if it exists in the schema
        const resources = await Resource.find({ projectId });
        res.status(200).json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ message: 'Failed to fetch resources.', error: error.message });
    }
};

// Delete a resource by ID
exports.deleteResource = async (req, res) => {
    try {
        const resourceId = req.params.resourceId;
        const deletedResource = await Resource.findByIdAndDelete(resourceId);
        if (!deletedResource) {
            return res.status(404).json({ message: 'Resource not found.' });
        }
        res.status(200).json({ message: 'Resource deleted successfully.' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ message: 'Failed to delete resource.', error: error.message });
    }
};