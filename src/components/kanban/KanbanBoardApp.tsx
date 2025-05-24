// // totally working fine latest code 
// // adding a create new project functionality and testing it with the current code
// import React, { useState, useCallback, useContext, useEffect } from 'react';
// import { KanbanColumn } from './KanbanColumn';
// import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
// import { PlusCircle } from 'lucide-react';
// import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
// import { Input } from "../../components/ui/input"
// import { Label } from "../../components/ui/label"
// import { Button } from "../../components/ui/button"

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

//     const fetchKanbanData = useCallback(async (projectId: string) => {
//         setLoading(true);
//         setError(null);
//         try {
//             const kanbanResponse = await fetch(`http://localhost:5000/projects/${projectId}/kanban`);
//             if (!kanbanResponse.ok) {
//                 throw new Error(`Failed to fetch Kanban data: ${kanbanResponse.statusText}`);
//             }
//             const kanbanData = await kanbanResponse.json();
//             // console.log("Kanban Data:", kanbanData);
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

//     // Move fetchAllProjects to top-level so it can be reused
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
//     }, [user?.id, selectedProject, fetchAllProjects]);

//     useEffect(() => {
//         if (selectedProject) {
//             fetchKanbanData(selectedProject._id);
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

//                 console.log("Backend Response (Add Card): \n", response);
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
//             alert("Project name cannot be empty.");
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
//             // After successful creation, refetch the projects
//             fetchAllProjects();
//             setNewProjectName('');
//             setNewProjectDescription('');
//         } catch (error: unknown) {
//             console.error("Error creating project:", error);
//             if (error instanceof Error) {
//                 alert(error.message);
//             } else {
//                 alert("An unknown error occurred while creating the project.");
//             }
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
//                 <div className="mt-6 pt-6 border-t border-gray-700">
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
//                 </div>
//             </aside>

//             {/* Kanban Board Section */}
//             <div className="flex-1 p-8 pr-0">
//                 <div className="max-w-7xl mx-auto space-y-8 ml-0 mr-0">
//                     <div className="flex justify-between items-center">
//                         <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
//                             {selectedProject?.name || "Select a Project"}
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
//                         <div className="text-center text-gray-400">No projects available.</div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default KanbanBoardApp;








// adding code to delete project and task from database
import React, { useState, useCallback, useContext, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { PlusCircle, Trash } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
// import { Toaster } from "../../components/ui/sonner";
import { toast } from "sonner"

import type { ColumnKey, CardItem, Column } from '../../types';
import { AuthContext } from '../../context/AuthContext';

interface Project {
    _id: string;
    name: string;
    description?: string;
    teamMembers?: Array<{ userId: string; name: string; avatarUrl?: string }>;
    createdAt: string;
}

const KanbanBoardApp: React.FC = () => {
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);
    const { logout, user } = useContext(AuthContext);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [projectsError, setProjectsError] = useState<string | null>(null);
    const [currentProjectDetails, setCurrentProjectDetails] = useState<Project | null>(null);
    const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false);
    const [isDeletingProject, setIsDeletingProject] = useState(false);
    // const { toast } = toast;

    const fetchKanbanData = useCallback(async (projectId: string) => {
        setLoading(true);
        setError(null);
        try {
            const kanbanResponse = await fetch(`http://localhost:5000/projects/${projectId}/kanban`);
            if (!kanbanResponse.ok) {
                throw new Error(`Failed to fetch Kanban data: ${kanbanResponse.statusText}`);
            }
            const kanbanData = await kanbanResponse.json();
            const adaptedColumns: Column[] = kanbanData.columns.map((col: Column) => ({
                key: col.key,
                title: col.title,
                cards: col.cards.map((card: CardItem) => ({
                    id: card.id,
                    idea: card.idea,
                    description: card.description,
                    image: card.image,
                    section: card.section,
                    videoLink: card.videoLink,
                    references: card.references,
                    createdAt: new Date(card.createdAt),
                    postedBy: card.postedBy,
                })),
            }));
            setColumns(adaptedColumns);
            setCurrentProjectDetails(kanbanData.project);
        } catch (err: unknown) {
            console.error("Error fetching Kanban data:", err);
            if (err instanceof Error) {
                setError(err.message || 'Failed to load Kanban data.');
            } else {
                setError('Failed to load Kanban data.');
            }
            setColumns([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAllProjects = useCallback(async () => {
        setProjectsLoading(true);
        setProjectsError(null);
        try {
            const response = await fetch(`http://localhost:5000/projects/user/${user?.id}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch projects: ${response.statusText}`);
            }
            const data: Project[] = await response.json();
            setAllProjects(data);
            if (data.length > 0 && !selectedProject) {
                setSelectedProject(data[0]);
            } else if (data.length === 0) {
                setSelectedProject(null);
                setColumns([]);
                setCurrentProjectDetails(null);
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
    }, [user?.id, selectedProject]);

    useEffect(() => {
        if (user?.id) {
            fetchAllProjects();
        }
    }, [user?.id, fetchAllProjects]);

    useEffect(() => {
        if (selectedProject) {
            fetchKanbanData(selectedProject._id);
        } else {
            setColumns([]);
            setCurrentProjectDetails(null);
            setLoading(false);
            setError(null);
        }
    }, [selectedProject, fetchKanbanData]);

    const handleProjectSelect = useCallback((project: Project) => {
        setSelectedProject(project);
    }, []);

    const handleCardMove = useCallback(
        async (cardId: string, newColumnKey: ColumnKey, oldColumnKey: ColumnKey) => {
            if (!selectedProject) {
                setError("No project selected to move card.");
                return;
            }

            if (oldColumnKey !== newColumnKey) {
                let cardToMove: CardItem | undefined;
                for (const col of columns) {
                    if (col.key === oldColumnKey) {
                        cardToMove = col.cards.find(card => card.id === cardId);
                        if (cardToMove) break;
                    }
                }

                if (!cardToMove) {
                    console.error("Card not found for move operation.");
                    return;
                }

                setColumns(prevColumns => {
                    const newColumns = prevColumns.map(col => {
                        if (col.key === oldColumnKey) {
                            return { ...col, cards: col.cards.filter(card => card.id !== cardId) };
                        } else if (col.key === newColumnKey) {
                            return { ...col, cards: [...col.cards, { ...cardToMove! }] };
                        }
                        return col;
                    });
                    return newColumns;
                });

                try {
                    const response = await fetch(`http://localhost:5000/tasks/${cardId}/move`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            newColumn: newColumnKey,
                            projectId: selectedProject._id,
                        }),
                    });

                    if (!response.ok) {
                        await fetchKanbanData(selectedProject._id);
                        throw new Error('Failed to move card on backend.');
                    }
                } catch (err: unknown) {
                    console.error("Error moving card:", err);
                    if (err instanceof Error) {
                        setError(err.message || 'Failed to move card.');
                    } else {
                        setError('Failed to move card.');
                    }
                    await fetchKanbanData(selectedProject._id);
                }
            }
        },
        [columns, selectedProject, fetchKanbanData]
    );

    const handleCardAdd = useCallback(
        async (columnKey: ColumnKey, newCard: Omit<CardItem, 'id' | 'createdAt' | 'postedBy'>) => {
            if (!selectedProject || !user) {
                setError("Please log in and select a project to add cards.");
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...newCard,
                        column: columnKey,
                        projectId: selectedProject._id,
                        postedBy: user.name,
                        postedById: user.id,
                    }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to add card.');
                }
                await fetchKanbanData(selectedProject._id);
            } catch (err: unknown) {
                console.error("Error adding card:", err);
                if (err instanceof Error) {
                    setError(err.message || 'Failed to add card.');
                } else {
                    setError('Failed to add card.');
                }
            }
        },
        [selectedProject, user, fetchKanbanData]
    );

    const handleCreateProject = async () => {
        setIsCreateProjectDialogOpen(false);
        if (!newProjectName.trim()) {
            // toast({ title: "Error", description: "Project name cannot be empty.", variant: "destructive" });
            toast("Project name cannot be empty.");
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
                    teamMembers: [{ userId: user?.id, name: user?.name }] // Add the creator as a team member
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create project.');
            }
            fetchAllProjects();
            setNewProjectName('');
            setNewProjectDescription('');
            // toast({ title: "Success", description: `Project "${newProjectName}" created successfully.` });
            toast(`Project "${newProjectName}" created successfully.`);

        } catch (error: unknown) {
            console.error("Error creating project:", error);
            let message = "An unknown error occurred while creating the project.";
            if (error instanceof Error) {
                message = error.message;
            }
            // toast({ title: "Error", description: message, variant: "destructive" });
            toast(`Error: ${message}`);
        }
    };

    const handleDeleteProject = async () => {
        setIsDeleteProjectDialogOpen(false);
        if (!selectedProject) {
            // toast({ title: "Error", description: "No project selected to delete.", variant: "destructive" });
            toast("Error: No project selected to delete.");
            return;
        }

        setIsDeletingProject(true);
        try {
            const response = await fetch(`http://localhost:5000/projects/${selectedProject._id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete project.');
            }
            // toast({ title: "Success", description: `Project "${selectedProject.name}" deleted successfully.` });
            toast(`Project "${selectedProject.name}" deleted successfully.`);
            setSelectedProject(null);
            fetchAllProjects(); // Refetch projects to update the sidebar
        } catch (error: unknown) {
            console.error("Error deleting project:", error);
            let message = "An error occurred while deleting the project.";
            if (error instanceof Error) {
                message = error.message;
            }
            // toast({ title: "Error", description: message, variant: "destructive" });
            toast(`Error: ${message}`);
        } finally {
            setIsDeletingProject(false);
        }
    };

    const currentTeamMembers = currentProjectDetails?.teamMembers || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex">
            {/* Project Sidebar (Left) */}
            <aside className="min-w-45 bg-gray-800 text-gray-300 p-6 border-r border-gray-700 overflow-y-auto flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-white">Projects</h2>
                    <ul>
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
                </div>
            </aside>

            {/* Kanban Board Section */}
            <div className="flex-1 p-8 pr-0">
                <div className="max-w-7xl mx-auto space-y-8 ml-0 mr-0">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            {selectedProject?.name || "Select a Project"}
                        </h1>
                        <div className="flex gap-2">
                            {selectedProject && (
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsDeleteProjectDialogOpen(true)}
                                    disabled={isDeletingProject}
                                >
                                    <Trash className="mr-2 w-4 h-4" /> Delete
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

                    <div className="text-center space-y-4">
                        <div className="flex flex-wrap justify-center gap-4">
                            {currentTeamMembers.map((member) => (
                                <div key={member.userId} className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarImage src={member.avatarUrl || `https://placehold.co/100x100/80ED99/000000?text=${member.name[0]}`} alt={member.name} />
                                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-gray-300">{member.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {loading && <div className="text-center text-gray-400">Loading project data...</div>}
                    {error && <div className="text-center text-red-500">{error}</div>}

                    {!loading && !error && selectedProject && (
                        <div className="flex overflow-x-auto gap-3 w-full">
                            {columns.map((column) => (
                                <KanbanColumn
                                    key={column.key}
                                    column={column}
                                    onCardMove={handleCardMove}
                                    onCardAdd={handleCardAdd}
                                    projectId={selectedProject._id}
                                />
                            ))}
                        </div>
                    )}
                    {!projectsLoading && !projectsError && !selectedProject && allProjects.length > 0 && (
                        <div className="text-center text-gray-400">Please select a project from the sidebar.</div>
                    )}
                    {!projectsLoading && !projectsError && allProjects.length === 0 && (
                        <div className="text-center text-gray-400">No projects available. Create a new one!</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KanbanBoardApp;

















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