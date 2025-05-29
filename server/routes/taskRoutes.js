const express = require('express');
const {
    getTasksByProject,
    createTask,
    moveTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
// const { protect } = require('../middleware/authMiddleware'); // If you add auth middleware

const router = express.Router();

// Public routes (or protected based on your auth strategy)
router.get('/:projectId', getTasksByProject); // GET /api/tasks/:projectId

// Protected routes (uncomment protect middleware when implemented)
router.post('/', createTask); // POST /api/tasks
router.put('/:id/move', moveTask); // PUT /api/tasks/:id/move
router.put('/:id', updateTask); // PUT /api/tasks/:id
router.delete('/:id', deleteTask); // DELETE /api/tasks/:id

module.exports = router;
