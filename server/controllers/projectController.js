const Project = require('../models/project');
const Task = require('../models/task');
const User = require('../models/User'); // Assuming User model is in User.js
const Resource = require('../models/resource'); // Assuming Resource model is in resource.js

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public (or Private, depending on auth strategy)


exports.getProjects = async (req, res) => {
    // const userId = req;
    // console.log('User ID:', userId); // Log the userId to check if it's being passed correctly
    try {
        const projects = await Project.find({  });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// exports.getProjects = async (req, res) => {
//     const userId = req.params.userId;
//     try {
//         const projects = await Project.find({ 'teamMembers.userId': userId });
//         res.status(200).json(projects);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // @desc    Get Kanban data for a specific project
// // @route   GET /api/projects/:projectId/kanban
// // @access  Public (or Private, depending on auth strategy)
exports.getProjectKanbanData = async (req, res) => {
    try {
        // console.log("Fetching Kanban data for project ID:", req); // Log the projectId to check if it's being passed correctly
        const projectId = req.params.projectId;
        // console.log("Project ID : " , projectId); // Log the projectId to check if it's being passed correctly

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Fetch tasks for the project, grouped by section
        // Populate 'postedBy' to get user details (e.g., name)
        const tasks = await Task.find({ projectId: projectId })
            .populate('postedBy', 'name avatarUrl') // Populate 'name' and 'avatarUrl' from User model
            .sort({ order: 1, createdAt: -1 }); // Sort by order, then by creation date

        // console.log("Tasks fetched for Kanban:", tasks); // Log tasks to check if they are fetched correctly

        // Define your Kanban columns explicitly.
        // This ensures all columns are present even if they have no cards.
        const columnKeys = ['ideas', 'ongoingResearch', 'development', 'integration', 'completed'];
        const columns = columnKeys.map(key => ({
            key: key,
            title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'), // Convert to "Ideas", "Ongoing Research" etc.
            cards: []
        }));

        // console.log("Columns initialized:", columns); // Log columns to check their structure

        // Distribute tasks into their respective columns
        tasks.forEach(task => {
            const columnIndex = columns.findIndex(col => col.key === task.column); // Use 'column' instead of 'section'
            if (columnIndex !== -1) {
                columns[columnIndex].cards.push({
                    id: task._id,
                    idea: task.idea,
                    description: task.description,
                    section: task.section, // Include section if needed
                    image: task.image,
                    videoLink: task.videoLink,
                    references: task.references,
                    createdAt: task.createdAt,
                    // postedBy: {
                    //     id: task.postedBy._id,
                    //     name: task.postedBy.name,
                    //     avatarUrl: task.postedBy.avatarUrl // Include avatarUrl if populated
                    // },
                    postedBy: task.postedBy,
                });
            }
        });

        // console.log("Columns after distributing tasks: \n", columns); // Log columns to check if tasks are distributed correctly

        res.status(200).json({ columns, project }); // Return both columns and project details
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// @desc     Get Kanban data for a specific project IF user is a member
// @route    GET /api/projects/:projectId/kanban
// @access   Private (requires authentication)
// exports.getProjectKanbanData = async (req, res) => {
//     try {
//         const projectId = req.params.projectId;
//         const userId = req.user ? req.user._id : null; // Assuming you have user authentication

//         if (!userId) {
//             return res.status(401).json({ message: 'Not authenticated' });
//         }

//         const project = await Project.findOne({ _id: projectId, 'teamMembers.userId': userId });

//         if (!project) {
//             return res.status(404).json({ message: 'Project not found or you are not a member' });
//         }

//         // Fetch tasks for the project, grouped by section
//         const tasks = await Task.find({ projectId: projectId })
//             .populate('postedBy', 'name avatarUrl')
//             .sort({ order: 1, createdAt: -1 });

//         const columnKeys = ['ideas', 'ongoingResearch', 'development', 'integration', 'completed'];
//         const columns = columnKeys.map(key => ({
//             key: key,
//             title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
//             cards: []
//         }));

//         tasks.forEach(task => {
//             const columnIndex = columns.findIndex(col => col.key === task.section);
//             if (columnIndex !== -1) {
//                 columns[columnIndex].cards.push({
//                     id: task._id,
//                     idea: task.idea,
//                     description: task.description,
//                     image: task.image,
//                     videoLink: task.videoLink,
//                     references: task.references,
//                     createdAt: task.createdAt,
//                     postedBy: {
//                         id: task.postedBy._id,
//                         name: task.postedBy.name,
//                         avatarUrl: task.postedBy.avatarUrl
//                     },
//                 });
//             }
//         });

//         res.status(200).json({ columns, project });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };





// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (requires authentication)
exports.createProject = async (req, res) => {
    const { name, description, teamMembers } = req.body;

    try {
        const project = new Project({
            name,
            description,
            // createdBy: req.user._id, // If you have user authentication, get ID from req.user
            teamMembers: teamMembers || [] // Allow teamMembers to be passed
        });

        const createdProject = await project.save();
        res.status(201).json(createdProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (requires authentication and ownership/permissions)
exports.updateProject = async (req, res) => {
    const { name, description, teamMembers } = req.body;

    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.name = name || project.name;
        project.description = description || project.description;
        project.teamMembers = teamMembers || project.teamMembers;

        const updatedProject = await project.save();
        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (requires authentication and ownership/permissions)
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        // const tasks = await Task.find({ projectId: req.params.id });


        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await project.deleteOne(); // Use deleteOne()
        await Task.deleteMany({ projectId: req.params.id }); // Delete all tasks associated with the project
        await Resource.deleteMany({ projectId: req.params.id }); // Delete all resources associated with the project
        res.status(200).json({ message: 'Project removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};





// In server/controllers/projectController.js

exports.getProjectsForUser = async (req, res) => {
    const userId = req.params.userId;
    // console.log('Fetching projects for user ID:', userId); // Log the userId to check if it's being passed correctly
    try {
        const projects = await Project.find({ 'teamMembers.userId': userId });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... other controller functions




















// ... other project controller functions ...

// Add a team member to a project
exports.addTeamMember = async (req, res) => {
    const { projectId } = req.params;
    const { userId, name } = req.body; // Assuming you also send the name

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if the user is already a member
        const isMember = project.teamMembers.some(member => member.userId.toString() === userId);
        if (isMember) {
            return res.status(409).json({ message: 'User is already a member of this project' });
        }

        project.teamMembers.push({ userId, name }); // You might want to fetch user details if needed
        await project.save();
        res.status(200).json({ message: 'Team member added successfully', project });
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ message: 'Failed to add team member' });
    }
};

// Remove a team member from a project
exports.removeTeamMember = async (req, res) => {
    const { projectId } = req.params;
    const { userId } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.teamMembers = project.teamMembers.filter(member => member.userId.toString() !== userId);
        await project.save();
        res.status(200).json({ message: 'Team member removed successfully', project });
    } catch (error) {
        console.error('Error removing team member:', error);
        res.status(500).json({ message: 'Failed to remove team member' });
    }
};

// Leave a project
exports.leaveProject = async (req, res) => {
    const { projectId } = req.params;
    const { userId } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.teamMembers = project.teamMembers.filter(member => member.userId.toString() !== userId);
        await project.save();

        // Check if the user was the last member
        if (project.teamMembers.length === 0) {
            await Project.findByIdAndDelete(projectId);
            return res.status(200).json({ message: 'Left project and project deleted as it was the last member' });
        }

        res.status(200).json({ message: 'Left project successfully', project });
    } catch (error) {
        console.error('Error leaving project:', error);
        res.status(500).json({ message: 'Failed to leave project' });
    }
};

// ... potentially other project controller functions ...