const Task = require('../models/task');
const Project = require('../models/project'); // Import Project model to validate projectId
const User = require('../models/User'); // Import User model for postedBy validation

// @desc    Get all tasks for a specific project
// @route   GET /api/tasks/:projectId
// @access  Public (or Private, depending on auth strategy)
exports.getTasksByProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const tasks = await Task.find({ projectId: projectId })
                                .populate('postedBy', 'name avatarUrl') // Populate user details
                                .sort({ order: 1, createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (requires authentication)
exports.createTask = async (req, res) => {
    const { projectId, idea, description, section, column, image, videoLink, references, postedBy, postedById } = req.body;
    // console.log('Creating task with data: \n', req.body);
    // Validate projectId
    const projectExists = await Project.findById(projectId);
    if (!projectExists) {
        return res.status(404).json({ message: 'Project not found' });
    }

    // Validate postedBy (ensure it's a valid User ID)
    const userExists = await User.findById(postedById);
    // const userExists = await User.find(postedBy)
    // userName = await User.findById(postedBy).select('name'); // Get user name for logging or response if needed
    if (!userExists) {
        return res.status(404).json({ message: 'PostedBy user not found' });
    }

    const task = new Task({
        projectId,
        idea,
        description,
        section,
        column, // This should be the KanbanColumnKey (e.g., 'ideas', 'ongoingResearch', etc.)
        image,
        videoLink,
        references,
        postedBy // This should be the ObjectId of the user
    });

    try {
        const newTask = await task.save();
        // Populate the postedBy field before sending the response back to the client
        await newTask.populate('postedBy', 'name avatarUrl');
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Move a task to a different column (section)
// @route   PUT /api/tasks/:id/move
// @access  Private (requires authentication and task ownership/permissions)
exports.moveTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { newColumn, projectId } = req.body; // Expect projectId from frontend

        const task = await Task.findOne({ _id: taskId, projectId: projectId });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or does not belong to the specified project' });
        }

        task.column = newColumn; // Update the column to the new one
        await task.save();
        res.status(200).json({ message: 'Task moved successfully', task });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a task (e.g., idea, description)
// @route   PUT /api/tasks/:id
// @access  Private (requires authentication and task ownership/permissions)
exports.updateTask = async (req, res) => {
    const { idea, description, image, videoLink, references } = req.body;

    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.idea = idea || task.idea;
        task.description = description || task.description;
        task.image = image || task.image;
        task.videoLink = videoLink || task.videoLink;
        task.references = references || task.references;

        const updatedTask = await task.save();
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (requires authentication and task ownership/permissions)
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        // console.log('Task to delete:', task);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // console.log('Deleting task:', task._id);

        await task.deleteOne(); // Use deleteOne()
        res.status(200).json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
