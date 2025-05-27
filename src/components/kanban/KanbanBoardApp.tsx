import React, { useState, useContext, useRef, useEffect } from 'react';
import KanbanBoard from './KanbanBoard';
import KanbanResources from './KanbanResources';
import { AuthContext } from '../../context/AuthContext';
import { PlusCircle, Trash } from 'lucide-react';
import { FaUser, FaMale, FaFemale } from 'react-icons/fa'; // Specific import for UserMale
// import { UserFemale } from 'lucide-react/dist/esm/icons/user-female'; // Specific import for UserFemale
import { FiLogOut } from 'react-icons/fi'; // Using FiLogOut for the leave project icon
import { Button } from "../../components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { toast } from 'react-toastify';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

interface Project {
    _id: string;
    name: string;
    description?: string;
    teamMembers?: Array<{
        userId: string;
        name: string;
        avatarUrl?: string;
        gender?: 'male' | 'female' | 'other';
    }>;
    createdAt: string;
}

const getGenderIcon = (gender?: 'male' | 'female' | 'other') => {
    // console.log ("Gender Icon" , gender);
    switch (gender) {
        case 'male':
            return <FaMale className="w-4 h-4 text-blue-500" />;
        case 'female':
            return <FaFemale className="w-4 h-4 text-pink-500" />;
        default:
            return <FaUser className="w-4 h-4 text-gray-400" />;
    }
};

const KanbanBoardApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'kanban' | 'resources'>('kanban');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const { logout, user } = useContext(AuthContext);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [projectsError, setProjectsError] = useState<string | null>(null);
    const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false);
    const [isDeletingProject, setIsDeletingProject] = useState(false);
    const mainContentRef = useRef<HTMLDivElement>(null);
    const scrollableContentRef = useRef<HTMLDivElement>(null);
    const [isAddTeamMemberDialogOpen, setIsAddTeamMemberDialogOpen] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; email: string; avatarUrl?: string; }>>([]);
    const [isSearchingUser, setIsSearchingUser] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [userToAdd, setUserToAdd] = useState<{ id: string; name: string; avatarUrl?: string } | null>(null);
    const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);
    const [isLeavingProject, setIsLeavingProject] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const fetchAllProjects = async () => {
        setProjectsLoading(true);
        setProjectsError(null);
        try {
            const response = await fetch(`http://localhost:5000/projects/user/${user?.id}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch projects: ${response.statusText}`);
            }
            const data: Project[] = await response.json();
            setAllProjects(data);
            // If selected project is deleted or not in the new list, clear it
            if (selectedProject && !data.some(p => p._id === selectedProject._id)) {
                setSelectedProject(null);
            }
            // If no project is selected or the current one is gone, select the first available
            if (data.length > 0 && !selectedProject) {
                setSelectedProject(data[0]);
            } else if (data.length === 0) {
                setSelectedProject(null);
            }
        } catch (err: unknown) {
            console.error("Error fetching user's projects:", err);
            if (err instanceof Error) {
                setProjectsError(err.message || 'Failed to load projects.');
            } else {
                setProjectsError('Failed to load projects.');
            }
        } finally {
            setProjectsLoading(false);
        }
    };

    React.useEffect(() => {
        if (user?.id) {
            fetchAllProjects();
        }
    }, [user?.id]);

    const handleProjectSelect = (project: Project) => {
        setSelectedProject(project);
        setActiveTab('kanban');
    };

    const handleCreateProject = async () => {
        setIsCreateProjectDialogOpen(false);
        if (!newProjectName.trim()) {
            toast.error("Project name cannot be empty.");
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newProjectName,
                    description: newProjectDescription,
                    teamMembers: [{ userId: user?.id, name: user?.name }]
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create project.');
            }
            fetchAllProjects();
            setNewProjectName('');
            setNewProjectDescription('');
            toast.success(`Project "${newProjectName}" created successfully.`);
        } catch (error: unknown) {
            console.error("Error creating project:", error);
            let message = "An unknown error occurred while creating the project.";
            if (error instanceof Error) {
                message = error.message;
            }
            toast.error(`Error: ${message}`);
        }
    };

    const handleDeleteProject = async () => {
        setIsDeleteProjectDialogOpen(false);
        if (!selectedProject) {
            toast.error("Error: No project selected to delete.");
            return;
        }

        setIsDeletingProject(true);
        try {
            const response = await fetch(`http://localhost:5000/projects/${selectedProject?._id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete project.');
            }
            toast.success(`Project "${selectedProject.name}" deleted successfully.`);
            setSelectedProject(null); // Clear selected project after deletion
            fetchAllProjects(); // Re-fetch all projects to update the list
        } catch (error: unknown) {
            console.error("Error deleting project:", error);
            let message = "An error occurred while deleting the project.";
            if (error instanceof Error) {
                message = error.message;
            }
            toast.error(`Error: ${message}`);
        } finally {
            setIsDeletingProject(false);
        }
    };

    const handleSearchUserByEmail = async () => {
        setIsSearchingUser(true);
        setSearchError(null);
        setSearchResults([]);
        setUserToAdd(null);
        if (!searchEmail.trim()) {
            toast.error("Please enter an email to search.");
            setIsSearchingUser(false);
            return;
        }
        // console.log("Searching for user with email:", searchEmail);
        try {
            const response = await fetch(`http://localhost:5000/users/email/${searchEmail}`);
            if (!response.ok) {
                if (response.status === 404) {
                    setSearchResults([]);
                    toast.info("No user found with this email.");
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to search for user.');
                }
            } else {
                const data = await response.json();
                setSearchResults([data]);
                if (data) {
                    setUserToAdd({ id: data._id, name: data.name, avatarUrl: data.avatarUrl });
                }
            }
        } catch (error: unknown) {
            console.error("Error searching for user:", error);
            let message = "Failed to search for user.";
            if (error instanceof Error) {
                message = error.message;
            }
            setSearchError(message);
            toast.error(`Error: ${message}`);
        } finally {
            setIsSearchingUser(false);
        }
    };

    const handleAddTeamMemberToProject = async () => {
        if (!selectedProject?._id || !userToAdd?.id) {
            toast.error("Could not add team member. Project or user not selected.");
            return;
        }
        // Check if user is already a member
        const isAlreadyMember = selectedProject.teamMembers?.some(member => member.userId === userToAdd.id);
        if (isAlreadyMember) {
            toast.info(`${userToAdd.name} is already a member of this project.`);
            setIsAddTeamMemberDialogOpen(false);
            setSearchEmail('');
            setSearchResults([]);
            setUserToAdd(null);
            return;
        }

        setIsAddingTeamMember(true);
        try {
            const response = await fetch(`http://localhost:5000/projects/${selectedProject._id}/add-member`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userToAdd.id, name: userToAdd.name }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add team member.');
            }
            toast.success(`${userToAdd.name} added to the project.`);
            fetchAllProjects();
            setIsAddTeamMemberDialogOpen(false);
            setSearchEmail('');
            setSearchResults([]);
            setUserToAdd(null);
            window.location.reload(); // Reload the page to reflect changes
        } catch (error: unknown) {
            console.error("Error adding team member:", error);
            let message = "Failed to add team member.";
            if (error instanceof Error) {
                message = error.message;
            }
            toast.error(`Error: ${message}`);
        } finally {
            setIsAddingTeamMember(false);
        }
    };

    const handleRemoveTeamMember = async (userIdToRemove: string) => {
        if (!selectedProject?._id) {
            toast.error("No project selected.");
            return;
        }
        // Prevent removing the last member via this button if it's the current user
        if (selectedProject.teamMembers?.length === 1 && selectedProject.teamMembers[0].userId === userIdToRemove) {
             toast.error("Cannot remove the last team member. Please use 'Leave Project' if you wish to delete the project.");
             return;
        }
        try {
            const response = await fetch(`http://localhost:5000/projects/${selectedProject._id}/remove-member`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userIdToRemove }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove team member.');
            }
            toast.success("Team member removed successfully.");
            // fetchAllProjects();
            window.location.reload(); // Reload the page to reflect changes
        } catch (error: unknown) {
            console.error("Error removing team member:", error);
            let message = "Failed to remove team member.";
            if (error instanceof Error) {
                message = error.message;
            }
            toast.error(`Error: ${message}`);
        }
    };

    const handleLeaveProject = async () => {
        if (!selectedProject?._id || !user?.id) {
            toast.error("No project selected or user not logged in.");
            return;
        }
        setIsLeavingProject(true);
        try {
            const response = await fetch(`http://localhost:5000/projects/${selectedProject._id}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to leave project.');
            }
            // Check response message to see if project was deleted
            const responseData = await response.json();
            if (responseData.message.includes('project deleted')) {
                toast.success(`You have left the project "${selectedProject.name}" and it was deleted.`);
                setSelectedProject(null); // Clear selected project
            } else {
                toast.success(`You have left the project "${selectedProject.name}".`);
            }
            fetchAllProjects(); // Update the project list
            window.location.reload(); // Reload the page to reflect changes
        } catch (error: unknown) {
            console.error("Error leaving project:", error);
            let message = "Failed to leave project.";
            if (error instanceof Error) {
                message = error.message;
            }
            toast.error(`Error: ${message}`);
        } finally {
            setIsLeavingProject(false);
        }
    };

    return (
        <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-black flex">
            {/* Project Sidebar (Left) */}
            <aside className="min-w-45 max-h-screen overflow-y-hidden bg-gray-800 text-gray-300 p-6 border-r border-gray-700 flex flex-col justify-between">
                <div className='overflow-y-auto hide-scrollbar'>
                    <h2 className="text-xl font-semibold mb-4 text-white">Projects</h2>
                    <ul className="overflow-y-auto max-h-[calc(100vh - 180px)]">
                        {projectsLoading && <li className="py-2 px-4">Loading projects...</li>}
                        {projectsError && <li className="py-2 px-4 text-red-500">{projectsError}</li>}
                        {!projectsLoading && !projectsError && allProjects.length === 0 && (
                            <li className="py-2 px-4">No projects found.</li>
                        )}
                        {!projectsLoading && !projectsError && allProjects.length > 0 && (
                            allProjects.map((project) => (
                                <li
                                    key={project._id}
                                    className={`py-2 px-4 cursor-pointer hover:bg-gray-700 rounded ${
                                        selectedProject?._id === project._id ? 'bg-gray-700 text-white font-semibold' : ''
                                    }`}
                                    onClick={() => handleProjectSelect(project)}
                                >
                                    {project.name}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
                {/* Buttons at the bottom of the sidebar */}
                <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
                    <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full flex items-center justify-center gap-2">
                                <PlusCircle className="w-4 h-4" /> New Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border-gray-700 text-white">
                            <DialogHeader>
                                <DialogTitle>Create New Project</DialogTitle>
                                <DialogDescription>Enter the details for your new project.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input id="name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label htmlFor="description" className="text-right mt-1">
                                        Description
                                    </Label>
                                    <textarea
                                        id="description"
                                        value={newProjectDescription}
                                        onChange={(e) => setNewProjectDescription(e.target.value)}
                                        className="col-span-3 rounded-md bg-gray-800 border-gray-700 text-white p-2"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="button" variant="secondary" onClick={() => setIsCreateProjectDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="button" className="ml-2" onClick={handleCreateProject}>
                                    Create
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {selectedProject && (
                        <Dialog open={isDeleteProjectDialogOpen} onOpenChange={setIsDeleteProjectDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className="w-full flex items-center justify-center gap-2">
                                    <Trash className="w-4 h-4" /> Delete Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-gray-700 text-white">
                                <DialogHeader>
                                    <DialogTitle>Delete Project</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete the project "{selectedProject.name}"?
                                        This will also delete all tasks associated with this project.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-end mt-4">
                                    <Button type="button" variant="secondary" onClick={() => setIsDeleteProjectDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        className="ml-2"
                                        onClick={handleDeleteProject}
                                        disabled={isDeletingProject}
                                    >
                                        {isDeletingProject ? "Deleting..." : "Delete"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                    {/* Add Team Member Dialog - remains here, but trigger moves */}
                    <Dialog open={isAddTeamMemberDialogOpen} onOpenChange={setIsAddTeamMemberDialogOpen}>
                        <DialogContent className="bg-gray-900 border-gray-700 text-white">
                            <DialogHeader>
                                <DialogTitle>Add Team Member</DialogTitle>
                                <DialogDescription>Search for a registered user by email to add them to the project.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="searchEmail" className="text-right">
                                        Email
                                    </Label>
                                    <Input
                                        id="searchEmail"
                                        type="email"
                                        value={searchEmail}
                                        onChange={(e) => setSearchEmail(e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="flex justify-end col-span-4">
                                    <Button onClick={handleSearchUserByEmail} disabled={isSearchingUser}>
                                        {isSearchingUser ? "Searching..." : "Search"}
                                    </Button>
                                </div>
                                {searchError && <p className="text-red-500">{searchError}</p>}
                                {searchResults.length > 0 && userToAdd ? (
                                    <div className="border rounded-md p-4 bg-gray-800">
                                        <p className="text-gray-300">User found:</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Avatar>
                                                <AvatarImage src={userToAdd.avatarUrl || `https://placehold.co/100x100/80ED99/000000?text=${userToAdd.name[0]}`} alt={userToAdd.name} />
                                                <AvatarFallback>{userToAdd.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-white">{userToAdd.name} ({searchResults[0].email})</span>
                                        </div>
                                        <Button className="mt-4 w-full" onClick={handleAddTeamMemberToProject} disabled={isAddingTeamMember}>
                                            {isAddingTeamMember ? "Adding..." : "Add to Project"}
                                        </Button>
                                    </div>
                                ) : (
                                    searchEmail.trim() && !isSearchingUser && !searchError && (
                                        <p className="text-gray-400">No users found with this email.</p>
                                    )
                                )}
                            </div>
                            <div className="flex justify-end">
                                <Button type="button" variant="secondary" onClick={() => {
                                    setIsAddTeamMemberDialogOpen(false);
                                    setSearchEmail('');
                                    setSearchResults([]);
                                    setUserToAdd(null);
                                    setSearchError(null);
                                }}>
                                    Close
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={logout} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500">
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div ref={mainContentRef} className="flex-1 flex flex-col overflow-hidden p-8 pr-5">
                {/* Fixed Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center ">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            {selectedProject?.name || "Select a Project"}
                        </h1>
                        <div className="flex items-center space-x-2"> {/* Container for top-right buttons */}
                            {selectedProject && ( // Only show leave project if a project is selected
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleLeaveProject}
                                    disabled={isLeavingProject}
                                >
                                    <FiLogOut className="w-4 h-4 mr-2" /> {isLeavingProject ? "Leaving..." : "Leave Project"}
                                </Button>
                            )}
                            <button
                                onClick={logout}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {selectedProject ? (
                        <div className="mb-8">
                            {selectedProject.description && (
                                <p className="text-gray-400 text-sm mb-4">
                                    {selectedProject.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 border-white">Team Members:</h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsAddTeamMemberDialogOpen(true)}
                                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {selectedProject.teamMembers?.map((member) => (
                                    <div key={member.userId} className="flex items-center gap-2  p-2 rounded-md shadow-md">
                                        {/* <Avatar>
                                            <AvatarImage src={member.avatarUrl || `https://placehold.co/100x100/80ED99/000000?text=${member.name[0]}`} alt={member.name} />
                                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                                        </Avatar> */}
                                        {getGenderIcon(member.gender)}
                                        <span className="text-white">{member.name}</span>
                                        {member.userId !== user?.id && ( // Only show remove button if not the current user
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-500 hover:bg-gray-700 p-1"
                                                onClick={() => handleRemoveTeamMember(member.userId)}
                                            >
                                                <Trash className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">Select a project to see its details.</div>
                    )}

                    <div className="mb-1">
                        <button
                            className={`mr-4 py-2 px-4 rounded-md ${
                                activeTab === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                            }`}
                            onClick={() => setActiveTab('kanban')}
                        >
                            Kanban Board
                        </button>
                        <button
                            className={`py-2 px-4 rounded-md ${
                                activeTab === 'resources' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                            }`}
                            onClick={() => setActiveTab('resources')}
                        >
                            Resources
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Below Buttons */}
                <div ref={scrollableContentRef} className="overflow-y-auto flex-1 hide-scrollbar">
                    {activeTab === 'kanban' && selectedProject && (
                        <KanbanBoard selectedProjectId={selectedProject?._id} currentProjectDetails={selectedProject} />
                    )}
                    {activeTab === 'kanban' && !selectedProject && (
                        <div className="text-center text-gray-400">Please select a project to view the Kanban Board.</div>
                    )}
                    {activeTab === 'resources' && selectedProject && (
                        <KanbanResources selectedProjectId={selectedProject?._id} />
                    )}
                    {activeTab === 'resources' && !selectedProject && (
                        <div className="text-center text-gray-400">Please select a project to view Resources.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KanbanBoardApp;















// currently working fine code 27th may
// import React, { useState, useContext, useRef, useEffect } from 'react';
// import KanbanBoard from './KanbanBoard';
// import KanbanResources from './KanbanResources';
// import { AuthContext } from '../../context/AuthContext';
// import { PlusCircle } from 'lucide-react';
// import { Button } from "../../components/ui/button";
// import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
// import { Input } from "../../components/ui/input"
// import { Label } from "../../components/ui/label"
// import { Trash } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

// interface Project {
//     _id: string;
//     name: string;
//     description?: string;
//     teamMembers?: Array<{ userId: string; name: string; avatarUrl?: string }>;
//     createdAt: string;
// }

// const KanbanBoardApp: React.FC = () => {
//     const [activeTab, setActiveTab] = useState<'kanban' | 'resources'>('kanban');
//     const [selectedProject, setSelectedProject] = useState<Project | null>(null);
//     const { logout, user } = useContext(AuthContext);
//     const [allProjects, setAllProjects] = useState<Project[]>([]);
//     const [projectsLoading, setProjectsLoading] = useState(false);
//     const [projectsError, setProjectsError] = useState<string | null>(null);
//     const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
//     const [newProjectName, setNewProjectName] = useState('');
//     const [newProjectDescription, setNewProjectDescription] = useState('');
//     const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false);
//     const [isDeletingProject, setIsDeletingProject] = useState(false);
//     const mainContentRef = useRef<HTMLDivElement>(null);
//     const scrollableContentRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         // Prevent body scrolling
//         document.body.style.overflow = 'hidden';
//         return () => {
//             document.body.style.overflow = '';
//         };
//     }, []);

//     const fetchAllProjects = async () => {
//         setProjectsLoading(true);
//         setProjectsError(null);
//         try {
//             const response = await fetch(`http://localhost:5000/projects/user/${user?.id}`);
//             if (!response.ok) {
//                 throw new Error(`Failed to fetch projects: ${response.statusText}`);
//             }
//             const data: Project[] = await response.json();
//             setAllProjects(data);
//             if (data.length > 0 && !selectedProject) {
//                 setSelectedProject(data[0]);
//             } else if (data.length === 0) {
//                 setSelectedProject(null);
//             }
//         } catch (err: unknown) {
//             console.error("Error fetching user's projects:", err);
//             if (err instanceof Error) {
//                 setProjectsError(err.message || 'Failed to load projects.');
//             } else {
//                 setProjectsError('Failed to load projects.');
//             }
//         } finally {
//             setProjectsLoading(false);
//         }
//     };

//     React.useEffect(() => {
//         if (user?.id) {
//             fetchAllProjects();
//         }
//     }, [user?.id]);

//     const handleProjectSelect = (project: Project) => {
//         setSelectedProject(project);
//         setActiveTab('kanban');
//     };

//     const handleCreateProject = async () => {
//         setIsCreateProjectDialogOpen(false);
//         if (!newProjectName.trim()) {
//             toast.error("Project name cannot be empty.");
//             return;
//         }
//         try {
//             const response = await fetch('http://localhost:5000/projects', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     name: newProjectName,
//                     description: newProjectDescription,
//                     teamMembers: [{ userId: user?.id, name: user?.name }]
//                 }),
//             });
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to create project.');
//             }
//             fetchAllProjects();
//             setNewProjectName('');
//             setNewProjectDescription('');
//             toast.success(`Project "${newProjectName}" created successfully.`);
//         } catch (error: unknown) {
//             console.error("Error creating project:", error);
//             let message = "An unknown error occurred while creating the project.";
//             if (error instanceof Error) {
//                 message = error.message;
//             }
//             toast.error(`Error: ${message}`);
//         }
//     };

//     const handleDeleteProject = async () => {
//         setIsDeleteProjectDialogOpen(false);
//         if (!selectedProject) {
//             toast.error("Error: No project selected to delete.");
//             return;
//         }

//         setIsDeletingProject(true);
//         try {
//             const response = await fetch(`http://localhost:5000/projects/${selectedProject?._id}`, {
//                 method: 'DELETE',
//             });
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to delete project.');
//             }
//             toast.success(`Project "${selectedProject.name}" deleted successfully.`);
//             setSelectedProject(null);
//             fetchAllProjects();
//         } catch (error: unknown) {
//             console.error("Error deleting project:", error);
//             let message = "An error occurred while deleting the project.";
//             if (error instanceof Error) {
//                 message = error.message;
//             }
//             toast.error(`Error: ${message}`);
//         } finally {
//             setIsDeletingProject(false);
//         }
//     };

//     return (
//         <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-black flex">
//             {/* Project Sidebar (Left) */}
//             <aside className="min-w-45 max-h-screen overflow-y-hidden bg-gray-800 text-gray-300 p-6 border-r border-gray-700 flex flex-col justify-between">
//                 <div className='overflow-y-auto hide-scrollbar'>
//                     <h2 className="text-xl font-semibold mb-4 text-white">Projects</h2>
//                     <ul className="overflow-y-auto max-h-[calc(100vh - 180px)]">
//                         {projectsLoading && <li className="py-2 px-4">Loading projects...</li>}
//                         {projectsError && <li className="py-2 px-4 text-red-500">{projectsError}</li>}
//                         {!projectsLoading && !projectsError && allProjects.length === 0 && (
//                             <li className="py-2 px-4">No projects found.</li>
//                         )}
//                         {!projectsLoading && !projectsError && allProjects.length > 0 && (
//                             allProjects.map((project) => (
//                                 <li
//                                     key={project._id}
//                                     className={`py-2 px-4 cursor-pointer hover:bg-gray-700 rounded ${
//                                         selectedProject?._id === project._id ? 'bg-gray-700 text-white font-semibold' : ''
//                                     }`}
//                                     onClick={() => handleProjectSelect(project)}
//                                 >
//                                     {project.name}
//                                 </li>
//                             ))
//                         )}
//                     </ul>
//                 </div>
//                 <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
//                     <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
//                         <DialogTrigger asChild>
//                             <Button className="w-full flex items-center justify-center gap-2">
//                                 <PlusCircle className="w-4 h-4" /> New Project
//                             </Button>
//                         </DialogTrigger>
//                         <DialogContent className="bg-gray-900 border-gray-700 text-white">
//                             <DialogHeader>
//                                 <DialogTitle>Create New Project</DialogTitle>
//                                 <DialogDescription>Enter the details for your new project.</DialogDescription>
//                             </DialogHeader>
//                             <div className="grid gap-4 py-4">
//                                 <div className="grid grid-cols-4 items-center gap-4">
//                                     <Label htmlFor="name" className="text-right">
//                                         Name
//                                     </Label>
//                                     <Input id="name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="col-span-3" />
//                                 </div>
//                                 <div className="grid grid-cols-4 items-start gap-4">
//                                     <Label htmlFor="description" className="text-right mt-1">
//                                         Description
//                                     </Label>
//                                     <textarea
//                                         id="description"
//                                         value={newProjectDescription}
//                                         onChange={(e) => setNewProjectDescription(e.target.value)}
//                                         className="col-span-3 rounded-md bg-gray-800 border-gray-700 text-white p-2"
//                                     />
//                                 </div>
//                             </div>
//                             <div className="flex justify-end">
//                                 <Button type="button" variant="secondary" onClick={() => setIsCreateProjectDialogOpen(false)}>
//                                     Cancel
//                                 </Button>
//                                 <Button type="button" className="ml-2" onClick={handleCreateProject}>
//                                     Create
//                                 </Button>
//                             </div>
//                         </DialogContent>
//                     </Dialog>
//                     {selectedProject && (
//                         <Dialog open={isDeleteProjectDialogOpen} onOpenChange={setIsDeleteProjectDialogOpen}>
//                             <DialogTrigger asChild>
//                                 <Button variant="destructive" className="w-full flex items-center justify-center gap-2">
//                                     <Trash className="w-4 h-4" /> Delete Project
//                                 </Button>
//                             </DialogTrigger>
//                             <DialogContent className="bg-gray-900 border-gray-700 text-white">
//                                 <DialogHeader>
//                                     <DialogTitle>Delete Project</DialogTitle>
//                                     <DialogDescription>
//                                         Are you sure you want to delete the project "{selectedProject.name}"?
//                                         This will also delete all tasks associated with this project.
//                                     </DialogDescription>
//                                 </DialogHeader>
//                                 <div className="flex justify-end mt-4">
//                                     <Button type="button" variant="secondary" onClick={() => setIsDeleteProjectDialogOpen(false)}>
//                                         Cancel
//                                     </Button>
//                                     <Button
//                                         type="button"
//                                         variant="destructive"
//                                         className="ml-2"
//                                         onClick={handleDeleteProject}
//                                         disabled={isDeletingProject}
//                                     >
//                                         {isDeletingProject ? "Deleting..." : "Delete"}
//                                     </Button>
//                                 </div>
//                             </DialogContent>
//                         </Dialog>
//                     )}
//                     <Button onClick={logout} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500">
//                         Logout
//                     </Button>
//                 </div>
//             </aside>

//             {/* Main Content Area */}
//             <div ref={mainContentRef} className="flex-1 flex flex-col overflow-hidden p-8 pr-5">
//                 {/* Fixed Header */}
//                 <div className="mb-8">
//                     <div className="flex justify-between items-center mb-4">
//                         <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
//                             {selectedProject?.name || "Select a Project"}
//                         </h1>
//                         <button
//                             onClick={logout}
//                             className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500"
//                         >
//                             Logout
//                         </button>
//                     </div>

//                     {selectedProject && (
//                         <div className="text-center space-y-4 mb-8">
//                             <div className="flex flex-wrap justify-center gap-4">
//                                 {selectedProject.teamMembers?.map((member) => (
//                                     <div key={member.userId} className="flex items-center gap-2">
//                                         <Avatar>
//                                             <AvatarImage src={member.avatarUrl || `https://placehold.co/100x100/80ED99/000000?text=${member.name[0]}`} alt={member.name} />
//                                             <AvatarFallback>{member.name[0]}</AvatarFallback>
//                                         </Avatar>
//                                         <span className="text-gray-300">{member.name}</span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     )}

//                     <div className="mb-1">
//                         <button
//                             className={`mr-4 py-2 px-4 rounded-md ${
//                                 activeTab === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
//                             }`}
//                             onClick={() => setActiveTab('kanban')}
//                         >
//                             Kanban Board
//                         </button>
//                         <button
//                             className={`py-2 px-4 rounded-md ${
//                                 activeTab === 'resources' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
//                             }`}
//                             onClick={() => setActiveTab('resources')}
//                         >
//                             Resources
//                         </button>
//                     </div>
//                 </div>

//                 {/* Scrollable Content Below Buttons */}
//                 <div ref={scrollableContentRef} className="overflow-y-auto flex-1 hide-scrollbar">
//                     {activeTab === 'kanban' && selectedProject && (
//                         <KanbanBoard selectedProjectId={selectedProject?._id} currentProjectDetails={selectedProject} />
//                     )}
//                     {activeTab === 'kanban' && !selectedProject && (
//                         <div className="text-center text-gray-400">Please select a project to view the Kanban Board.</div>
//                     )}
//                     {activeTab === 'resources' && selectedProject && (
//                         <KanbanResources selectedProjectId={selectedProject?._id} />
//                     )}
//                     {activeTab === 'resources' && !selectedProject && (
//                         <div className="text-center text-gray-400">Please select a project to view Resources.</div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default KanbanBoardApp;


































































// // adding code to delete project and task from database
// import React, { useState, useCallback, useContext, useEffect } from 'react';
// import { KanbanColumn } from './KanbanColumn';
// import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
// import { PlusCircle, Trash } from 'lucide-react';
// import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
// import { Input } from "../../components/ui/input"
// import { Label } from "../../components/ui/label"
// import { Button } from "../../components/ui/button"
// // import { Toaster } from "../../components/ui/sonner";
// // import { toast } from "sonner"
// import { toast } from 'react-toastify';

// import type { ColumnKey, CardItem, Column } from '../../types';
// import { AuthContext } from '../../context/AuthContext';

// interface Project {
//     _id: string;
//     name: string;
//     description?: string;
//     teamMembers?: Array<{ userId: string; name: string; avatarUrl?: string }>;
//     createdAt: string;
// }

// const KanbanBoardApp: React.FC = () => {
//     const [allProjects, setAllProjects] = useState<Project[]>([]);
//     const [columns, setColumns] = useState<Column[]>([]);
//     const { logout, user } = useContext(AuthContext);
//     const [selectedProject, setSelectedProject] = useState<Project | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [projectsLoading, setProjectsLoading] = useState(false);
//     const [projectsError, setProjectsError] = useState<string | null>(null);
//     const [currentProjectDetails, setCurrentProjectDetails] = useState<Project | null>(null);
//     const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
//     const [newProjectName, setNewProjectName] = useState('');
//     const [newProjectDescription, setNewProjectDescription] = useState('');
//     const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false);
//     const [isDeletingProject, setIsDeletingProject] = useState(false);
//     // const { toast } = toast;

//     const fetchKanbanData = useCallback(async (projectId: string) => {
//         setLoading(true);
//         setError(null);
//         try {
//             const kanbanResponse = await fetch(`http://localhost:5000/projects/${projectId}/kanban`);
//             if (!kanbanResponse.ok) {
//                 throw new Error(`Failed to fetch Kanban data: ${kanbanResponse.statusText}`);
//             }
//             const kanbanData = await kanbanResponse.json();
//             const adaptedColumns: Column[] = kanbanData.columns.map((col: Column) => ({
//                 key: col.key,
//                 title: col.title,
//                 cards: col.cards.map((card: CardItem) => ({
//                     id: card.id,
//                     idea: card.idea,
//                     description: card.description,
//                     image: card.image,
//                     section: card.section,
//                     videoLink: card.videoLink,
//                     references: card.references,
//                     createdAt: new Date(card.createdAt),
//                     postedBy: card.postedBy,
//                 })),
//             }));
//             setColumns(adaptedColumns);
//             setCurrentProjectDetails(kanbanData.project);
//         } catch (err: unknown) {
//             console.error("Error fetching Kanban data:", err);
//             if (err instanceof Error) {
//                 setError(err.message || 'Failed to load Kanban data.');
//             } else {
//                 setError('Failed to load Kanban data.');
//             }
//             setColumns([]);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     const fetchAllProjects = useCallback(async () => {
//         setProjectsLoading(true);
//         setProjectsError(null);
//         try {
//             const response = await fetch(`http://localhost:5000/projects/user/${user?.id}`);
//             if (!response.ok) {
//                 throw new Error(`Failed to fetch projects: ${response.statusText}`);
//             }
//             const data: Project[] = await response.json();
//             setAllProjects(data);
//             if (data.length > 0 && !selectedProject) {
//                 setSelectedProject(data[0]);
//             } else if (data.length === 0) {
//                 setSelectedProject(null);
//                 setColumns([]);
//                 setCurrentProjectDetails(null);
//             }
//         } catch (err: unknown) {
//             console.error("Error fetching user's projects:", err);
//             if (err instanceof Error) {
//                 setProjectsError(err.message || 'Failed to load projects.');
//             } else {
//                 setProjectsError('Failed to load projects.');
//             }
//         } finally {
//             setProjectsLoading(false);
//         }
//     }, [user?.id, selectedProject]);

//     useEffect(() => {
//         if (user?.id) {
//             fetchAllProjects();
//         }
//     }, [user?.id, fetchAllProjects]);

//     useEffect(() => {
//         if (selectedProject) {
//             fetchKanbanData(selectedProject._id);
//         } else {
//             setColumns([]);
//             setCurrentProjectDetails(null);
//             setLoading(false);
//             setError(null);
//         }
//     }, [selectedProject, fetchKanbanData]);

//     const handleProjectSelect = useCallback((project: Project) => {
//         setSelectedProject(project);
//     }, []);

//     const handleCardMove = useCallback(
//         async (cardId: string, newColumnKey: ColumnKey, oldColumnKey: ColumnKey) => {
//             if (!selectedProject) {
//                 setError("No project selected to move card.");
//                 return;
//             }

//             if (oldColumnKey !== newColumnKey) {
//                 let cardToMove: CardItem | undefined;
//                 for (const col of columns) {
//                     if (col.key === oldColumnKey) {
//                         cardToMove = col.cards.find(card => card.id === cardId);
//                         if (cardToMove) break;
//                     }
//                 }

//                 if (!cardToMove) {
//                     console.error("Card not found for move operation.");
//                     return;
//                 }

//                 setColumns(prevColumns => {
//                     const newColumns = prevColumns.map(col => {
//                         if (col.key === oldColumnKey) {
//                             return { ...col, cards: col.cards.filter(card => card.id !== cardId) };
//                         } else if (col.key === newColumnKey) {
//                             return { ...col, cards: [...col.cards, { ...cardToMove! }] };
//                         }
//                         return col;
//                     });
//                     return newColumns;
//                 });

//                 try {
//                     const response = await fetch(`http://localhost:5000/tasks/${cardId}/move`, {
//                         method: 'PUT',
//                         headers: {
//                             'Content-Type': 'application/json',
//                         },
//                         body: JSON.stringify({
//                             newColumn: newColumnKey,
//                             projectId: selectedProject._id,
//                         }),
//                     });

//                     if (!response.ok) {
//                         await fetchKanbanData(selectedProject._id);
//                         throw new Error('Failed to move card on backend.');
//                     }
//                 } catch (err: unknown) {
//                     console.error("Error moving card:", err);
//                     if (err instanceof Error) {
//                         setError(err.message || 'Failed to move card.');
//                     } else {
//                         setError('Failed to move card.');
//                     }
//                     await fetchKanbanData(selectedProject._id);
//                 }
//             }
//         },
//         [columns, selectedProject, fetchKanbanData]
//     );

//     const handleCardAdd = useCallback(
//         async (columnKey: ColumnKey, newCard: Omit<CardItem, 'id' | 'createdAt' | 'postedBy'>) => {
//             if (!selectedProject || !user) {
//                 setError("Please log in and select a project to add cards.");
//                 return;
//             }

//             try {
//                 const response = await fetch(`http://localhost:5000/tasks`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({
//                         ...newCard,
//                         column: columnKey,
//                         projectId: selectedProject._id,
//                         postedBy: user.name,
//                         postedById: user.id,
//                     }),
//                 });

//                 const data = await response.json();
//                 if (!response.ok) {
//                     throw new Error(data.message || 'Failed to add card.');
//                 }
//                 await fetchKanbanData(selectedProject._id);
//             } catch (err: unknown) {
//                 console.error("Error adding card:", err);
//                 if (err instanceof Error) {
//                     setError(err.message || 'Failed to add card.');
//                 } else {
//                     setError('Failed to add card.');
//                 }
//             }
//         },
//         [selectedProject, user, fetchKanbanData]
//     );

//     const handleCreateProject = async () => {
//         setIsCreateProjectDialogOpen(false);
//         if (!newProjectName.trim()) {
//             // toast({ title: "Error", description: "Project name cannot be empty.", variant: "destructive" });
//             toast.error("Project name cannot be empty.");
//             return;
//         }
//         try {
//             const response = await fetch('http://localhost:5000/projects', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     name: newProjectName,
//                     description: newProjectDescription,
//                     teamMembers: [{ userId: user?.id, name: user?.name }] // Add the creator as a team member
//                 }),
//             });
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to create project.');
//             }
//             fetchAllProjects();
//             setNewProjectName('');
//             setNewProjectDescription('');
//             // toast({ title: "Success", description: `Project "${newProjectName}" created successfully.` });
//             // toast.success(`Project "${newProjectName}" created successfully.` , {
//             //     style: {
//             //         background: '#1f2937', // Dark background
//             //         color: '#ffffff', // White text
//             //         border: '1px solid #374151', // Border color
//             //     },
//             //     duration: 3000, // Duration in milliseconds
//             //     className: 'custom-toast',
//             //     position: 'top-right',
//             //     closeButton: true,
//             //     progress : true
//             //     // Add progress bar
//             // });
//             toast.success(`Project "${newProjectName}" created successfully.`);

//         } catch (error: unknown) {
//             console.error("Error creating project:", error);
//             let message = "An unknown error occurred while creating the project.";
//             if (error instanceof Error) {
//                 message = error.message;
//             }
//             // toast({ title: "Error", description: message, variant: "destructive" });
//             toast.error(`Error: ${message}`);
//         }
//     };

//     const handleDeleteProject = async () => {
//         setIsDeleteProjectDialogOpen(false);
//         if (!selectedProject) {
//             // toast({ title: "Error", description: "No project selected to delete.", variant: "destructive" });
//             toast.error("Error: No project selected to delete.");
//             return;
//         }

//         setIsDeletingProject(true);
//         try {
//             const response = await fetch(`http://localhost:5000/projects/${selectedProject._id}`, {
//                 method: 'DELETE',
//             });
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to delete project.');
//             }
//             // toast({ title: "Success", description: `Project "${selectedProject.name}" deleted successfully.` });
//             toast.error(`Project "${selectedProject.name}" deleted successfully.`);
//             setSelectedProject(null);
//             fetchAllProjects(); // Refetch projects to update the sidebar
//         } catch (error: unknown) {
//             console.error("Error deleting project:", error);
//             let message = "An error occurred while deleting the project.";
//             if (error instanceof Error) {
//                 message = error.message;
//             }
//             // toast({ title: "Error", description: message, variant: "destructive" });
//             toast.error(`Error: ${message}`);
//         } finally {
//             setIsDeletingProject(false);
//         }
//     };

//     const currentTeamMembers = currentProjectDetails?.teamMembers || [];

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex">
//             {/* Project Sidebar (Left) */}
//             <aside className="min-w-45 bg-gray-800 text-gray-300 p-6 border-r border-gray-700 overflow-y-auto flex flex-col justify-between">
//                 <div>
//                     <h2 className="text-xl font-semibold mb-4 text-white">Projects</h2>
//                     <ul>
//                         {projectsLoading && <li className="py-2 px-4">Loading projects...</li>}
//                         {projectsError && <li className="py-2 px-4 text-red-500">{projectsError}</li>}
//                         {!projectsLoading && !projectsError && allProjects.length === 0 && (
//                             <li className="py-2 px-4">No projects found.</li>
//                         )}
//                         {!projectsLoading && !projectsError && allProjects.length > 0 && (
//                             allProjects.map((project) => (
//                                 <li
//                                     key={project._id}
//                                     className={`py-2 px-4 cursor-pointer hover:bg-gray-700 rounded ${
//                                         selectedProject?._id === project._id ? 'bg-gray-700 text-white font-semibold' : ''
//                                     }`}
//                                     onClick={() => handleProjectSelect(project)}
//                                 >
//                                     {project.name}
//                                 </li>
//                             ))
//                         )}
//                     </ul>
//                 </div>
//                 <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
//                     <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
//                         <DialogTrigger asChild>
//                             <Button className="w-full flex items-center justify-center gap-2">
//                                 <PlusCircle className="w-4 h-4" /> New Project
//                             </Button>
//                         </DialogTrigger>
//                         <DialogContent className="bg-gray-900 border-gray-700 text-white">
//                             <DialogHeader>
//                                 <DialogTitle>Create New Project</DialogTitle>
//                                 <DialogDescription>Enter the details for your new project.</DialogDescription>
//                             </DialogHeader>
//                             <div className="grid gap-4 py-4">
//                                 <div className="grid grid-cols-4 items-center gap-4">
//                                     <Label htmlFor="name" className="text-right">
//                                         Name
//                                     </Label>
//                                     <Input id="name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="col-span-3" />
//                                 </div>
//                                 <div className="grid grid-cols-4 items-start gap-4">
//                                     <Label htmlFor="description" className="text-right mt-1">
//                                         Description
//                                     </Label>
//                                     <textarea
//                                         id="description"
//                                         value={newProjectDescription}
//                                         onChange={(e) => setNewProjectDescription(e.target.value)}
//                                         className="col-span-3 rounded-md bg-gray-800 border-gray-700 text-white p-2"
//                                     />
//                                 </div>
//                             </div>
//                             <div className="flex justify-end">
//                                 <Button type="button" variant="secondary" onClick={() => setIsCreateProjectDialogOpen(false)}>
//                                     Cancel
//                                 </Button>
//                                 <Button type="button" className="ml-2" onClick={handleCreateProject}>
//                                     Create
//                                 </Button>
//                             </div>
//                         </DialogContent>
//                     </Dialog>
//                     {selectedProject && (
//                         <Dialog open={isDeleteProjectDialogOpen} onOpenChange={setIsDeleteProjectDialogOpen}>
//                             <DialogTrigger asChild>
//                                 <Button variant="destructive" className="w-full flex items-center justify-center gap-2">
//                                     <Trash className="w-4 h-4" /> Delete Project
//                                 </Button>
//                             </DialogTrigger>
//                             <DialogContent className="bg-gray-900 border-gray-700 text-white">
//                                 <DialogHeader>
//                                     <DialogTitle>Delete Project</DialogTitle>
//                                     <DialogDescription>
//                                         Are you sure you want to delete the project "{selectedProject.name}"?
//                                         This will also delete all tasks associated with this project.
//                                     </DialogDescription>
//                                 </DialogHeader>
//                                 <div className="flex justify-end mt-4">
//                                     <Button type="button" variant="secondary" onClick={() => setIsDeleteProjectDialogOpen(false)}>
//                                         Cancel
//                                     </Button>
//                                     <Button
//                                         type="button"
//                                         variant="destructive"
//                                         className="ml-2"
//                                         onClick={handleDeleteProject}
//                                         disabled={isDeletingProject}
//                                     >
//                                         {isDeletingProject ? "Deleting..." : "Delete"}
//                                     </Button>
//                                 </div>
//                             </DialogContent>
//                         </Dialog>
//                     )}
//                 </div>
//             </aside>

//             {/* Kanban Board Section */}
//             <div className="flex-1 p-8 pr-0">
//                 <div className="max-w-7xl mx-auto space-y-8 ml-0 mr-0">
//                     <div className="flex justify-between items-center">
//                         <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
//                             {selectedProject?.name || "Select a Project"}
//                         </h1>
//                         <div className="flex gap-2">
//                             {selectedProject && (
//                                 <Button
//                                     variant="destructive"
//                                     onClick={() => setIsDeleteProjectDialogOpen(true)}
//                                     disabled={isDeletingProject}
//                                 >
//                                     <Trash className="mr-2 w-4 h-4" /> Delete
//                                 </Button>
//                                 )}
//                             <button
//                                 onClick={logout}
//                                 className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500"
//                             >
//                                 Logout
//                             </button>
//                         </div>
//                     </div>

//                     <div className="text-center space-y-4">
//                         <div className="flex flex-wrap justify-center gap-4">
//                             {currentTeamMembers.map((member) => (
//                                 <div key={member.userId} className="flex items-center gap-2">
//                                     <Avatar>
//                                         <AvatarImage src={member.avatarUrl || `https://placehold.co/100x100/80ED99/000000?text=${member.name[0]}`} alt={member.name} />
//                                         <AvatarFallback>{member.name[0]}</AvatarFallback>
//                                     </Avatar>
//                                     <span className="text-gray-300">{member.name}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {loading && <div className="text-center text-gray-400">Loading project data...</div>}
//                     {error && <div className="text-center text-red-500">{error}</div>}

//                     {!loading && !error && selectedProject && (
//                         <div className="flex overflow-x-auto gap-3 w-full">
//                             {columns.map((column) => (
//                                 <KanbanColumn
//                                     key={column.key}
//                                     column={column}
//                                     onCardMove={handleCardMove}
//                                     onCardAdd={handleCardAdd}
//                                     projectId={selectedProject._id}
//                                 />
//                             ))}
//                         </div>
//                     )}
//                     {!projectsLoading && !projectsError && !selectedProject && allProjects.length > 0 && (
//                         <div className="text-center text-gray-400">Please select a project from the sidebar.</div>
//                     )}
//                     {!projectsLoading && !projectsError && allProjects.length === 0 && (
//                         <div className="text-center text-gray-400">No projects available. Create a new one!</div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default KanbanBoardApp;

















// only ui and no database connection code 
// import React, { useState, useCallback, useContext, useEffect } from 'react';
// import { KanbanColumn } from './KanbanColumn';
// import { initialColumns, teamMembers, ProjectName, projects } from '../../data';
// import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

// import type { ColumnKey, CardItem, Column } from '../../types';
// import { AuthContext } from '../../context/AuthContext';

// const KanbanBoardApp: React.FC = () => {
//     const [columns, setColumns] = useState<Column[]>(initialColumns);
//     const { logout } = useContext(AuthContext);
//     const [selectedProject, setSelectedProject] = useState(projects[0]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchProjectData = async () => {
//             if (selectedProject) {
//                 console.log('Fetching data for project:', selectedProject.id);
//                 setLoading(true);
//                 setError(null);
//                 // Simulate API call - replace with your actual API endpoint
//                 try {
//                     // In a real application, you would call your backend API here
//                     // Example:
//                     // const response = await fetch(`/api/projects/${selectedProject.id}/kanban`);
//                     // if (!response.ok) {
//                     //     throw new Error(`HTTP error! status: ${response.status}`);
//                     // }
//                     // const data = await response.json();
//                     // setColumns(data.columns);

//                     // Simulate a successful fetch with the initial columns for now
//                     await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
//                     setColumns(initialColumns);
//                 } catch (e: unknown) {
//                     console.error("Error fetching kanban data:", e);
//                     setError('Failed to load project data.');
//                     setColumns([]); // Clear columns on error
//                 } finally {
//                     setLoading(false);
//                 }
//             }
//         };

//         fetchProjectData();
//     }, [selectedProject]);


//     const handleCardMove = useCallback(
//         (cardId: string, newColumnKey: ColumnKey, oldColumnKey: ColumnKey) => {
//             setColumns((prevColumns) => {
//                 // Debug logs
//                 // console.log('Moving card:', {
//                 //     cardId,
//                 //     fromColumn: oldColumnKey,
//                 //     toColumn: newColumnKey
//                 // });

//                 const oldColumnData = prevColumns.find((col) => col.key === oldColumnKey);
//                 console.log('Old column data:', oldColumnData);

//                 // Find the card before making any changes
//                 const cardToMove = prevColumns
//                     .find((col) => col.key === oldColumnKey)
//                     ?.cards.find((card) => card.id === cardId);
                
//                 // console.log('Card to move:', cardToMove);

//                 // If card is not found, return unchanged state
//                 if (!cardToMove) {
//                     // console.error('Card not found:', {
//                     //     cardId,
//                     //     oldColumnKey,
//                     //     availableCards: oldColumnData?.cards
//                     // });
//                     return prevColumns;
//                 }

//                 const newColumns = prevColumns.map(col => {
//                     if (col.key === oldColumnKey) {
//                         // Remove from old column
//                         return {
//                             ...col,
//                             cards: col.cards.filter(card => card.id !== cardId)
//                         };
//                     }
//                     if (col.key === newColumnKey) {
//                         // Add to new column with complete card data
//                         return {
//                             ...col,
//                             cards: [...col.cards, { ...cardToMove }]
//                         };
//                     }
//                     return col;
//                 });

//                 // Verify the move
//                 console.log('Updated columns:', newColumns);
                
//                 return newColumns;
//             });
//         },
//         []
//     );


//     const handleCardAdd = useCallback(
//         (columnKey: ColumnKey, newCard: Omit<CardItem, 'id' | 'createdAt' | 'postedBy'>) => {
//             setColumns((prevColumns) => {
//                 const newColumns = [...prevColumns];
//                 const column = newColumns.find((col) => col.key === columnKey);
//                 if (column) {
//                     const newCardWithId: CardItem = {
//                         ...newCard,
//                         id: crypto.randomUUID(),
//                         createdAt: new Date(),
//                         postedBy: 'CurrentUser',
//                     };
//                     column.cards = [newCardWithId, ...column.cards];
//                 }
//                 return newColumns;
//             });
//         },
//         []
//     );

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex ">
//             {/* Project Sidebar (Left) */}
//             <aside className="min-w-45 bg-gray-800 text-gray-300 p-6 border-r border-gray-700 overflow-y-auto">
//                 <h2 className="text-xl font-semibold mb-4 text-white">Projects</h2>
//                 <ul>
//                     {projects.map((project) => (
//                         <li
//                             key={project.id}
//                             className={`py-2 px-4 cursor-pointer hover:bg-gray-700 rounded ${
//                                 selectedProject?.id === project.id ? 'bg-gray-700 text-white font-semibold' : ''
//                             }`}
//                             onClick={() => setSelectedProject(project)}
//                         >
//                             {project.name}
//                         </li>
//                     ))}
//                 </ul>
//             </aside>

//             {/* Kanban Board Section */}
//             <div className="flex-1 p-8 pr-0">
//                 <div className="max-w-7xl mx-auto space-y-8 ml-0 mr-0">
//                     <div className="flex justify-between items-center">
//                         <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
//                             {selectedProject?.name || ProjectName}
//                         </h1>
//                         <button
//                             onClick={logout}
//                             className="bg-red-600 hover:bg-red-700 text-white font-semibold mr-5 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500"
//                         >
//                             Logout
//                         </button>
//                     </div>

//                     <div className="text-center space-y-4">
//                         <div className="flex flex-wrap justify-center gap-4">
//                             {teamMembers.map((user) => (
//                                 <div key={user.name} className="flex items-center gap-2">
//                                     <Avatar>
//                                         <AvatarImage src={user.avatarUrl} alt={user.name} />
//                                         <AvatarFallback>{user.name[0]}</AvatarFallback>
//                                     </Avatar>
//                                     <span className="text-gray-300">{user.name}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {loading && <div className="text-center text-gray-400">Loading project data...</div>}
//                     {error && <div className="text-center text-red-500">{error}</div>}

//                     {!loading && !error && (
//                         <div className="flex overflow-x-auto gap-3 w-full">
//                             {columns.map((column) => (
//                                 <KanbanColumn
//                                     key={column.key}
//                                     column={column}
//                                     onCardMove={handleCardMove}
//                                     onCardAdd={handleCardAdd}
//                                 />
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default KanbanBoardApp;