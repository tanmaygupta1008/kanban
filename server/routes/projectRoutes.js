const express = require('express');
const {
    getProjects,
    getProjectKanbanData,
    createProject,
    updateProject,
    deleteProject,
    getProjectsForUser,



    addTeamMember,
    removeTeamMember,
    leaveProject
} = require('../controllers/projectController');
// const { protect } = require('../middleware/authMiddleware'); // If you add auth middleware

const router = express.Router();

// New route to get projects for a specific user
router.get('/user/:userId', getProjectsForUser);

router.post('/:projectId/add-member', addTeamMember);
router.post('/:projectId/remove-member', removeTeamMember);
router.post('/:projectId/leave', leaveProject);





// Public routes (or protected based on your auth strategy)
router.get('/', getProjects); // GET /api/projects
router.get('/:projectId/kanban', getProjectKanbanData); // GET /api/projects/:projectId/kanban

// Protected routes (uncomment protect middleware when implemented)
router.post('/', createProject); // POST /api/projects
router.put('/:id', updateProject); // PUT /api/projects/:id
router.delete('/:id', deleteProject); // DELETE /api/projects/:id

module.exports = router;
