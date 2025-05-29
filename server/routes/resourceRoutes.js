const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

// POST /resources - Save a new resource
router.post('/', resourceController.createResource);

// GET /projects/:projectId/resources - Fetch resources for a project
router.get('/projects/:projectId', resourceController.getResourcesByProject);

// DELETE /resources/:resourceId - Delete a resource by ID
router.delete('/:resourceId', resourceController.deleteResource);

module.exports = router;