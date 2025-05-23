import React, { useState, useCallback, useContext, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

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
    const [currentProjectDetails, setCurrentProjectDetails] = useState<Project | null>(null); // To hold full project details with team members

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
                    videoLink: card.videoLink,
                    references: card.references,
                    createdAt: new Date(card.createdAt),
                    postedBy: card.postedBy,
                })),
            }));
            setColumns(adaptedColumns);
            // We might not need to update selectedProject here if it's already set by the sidebar click
            // Instead, we can update a separate state for the full project details if needed.
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

    useEffect(() => {
        const fetchAllProjects = async () => {
            setProjectsLoading(true);
            setProjectsError(null);
            try {
                const response = await fetch('http://localhost:5000/projects');
                if (!response.ok) {
                    throw new Error(`Failed to fetch projects: ${response.statusText}`);
                }
                const data: Project[] = await response.json();
                setAllProjects(data);
                if (data.length > 0 && !selectedProject) {
                    setSelectedProject(data[0]);
                }
            } catch (err: unknown) {
                console.error("Error fetching all projects:", err);
                if (err instanceof Error) {
                    setProjectsError(err.message || 'Failed to load projects.');
                } else {
                    setProjectsError('Failed to load projects.');
                }
            } finally {
                setProjectsLoading(false);
            }
        };

        fetchAllProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchKanbanData(selectedProject._id);
        }
    }, [selectedProject, fetchKanbanData]);

    const handleProjectSelect = useCallback((project: Project) => {
        setSelectedProject(project);
        // Fetch Kanban data will be triggered by the selectedProject change
    }, []);

    const handleCardMove = useCallback(
        async (cardId: string, newColumnKey: ColumnKey, oldColumnKey: ColumnKey) => {
            if (!selectedProject) {
                setError("No project selected to move card.");
                return;
            }

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
                        newSection: newColumnKey,
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
                        section: columnKey,
                        projectId: selectedProject._id,
                        postedBy: user.id,
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

    // Use currentProjectDetails for rendering team members
    const currentTeamMembers = currentProjectDetails?.teamMembers || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex">
            {/* Project Sidebar (Left) */}
            <aside className="min-w-45 bg-gray-800 text-gray-300 p-6 border-r border-gray-700 overflow-y-auto">
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
            </aside>

            {/* Kanban Board Section */}
            <div className="flex-1 p-8 pr-0">
                <div className="max-w-7xl mx-auto space-y-8 ml-0 mr-0">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            {selectedProject?.name || "Select a Project"}
                        </h1>
                        <button
                            onClick={logout}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold mr-5 py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Logout
                        </button>
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
                                />
                            ))}
                        </div>
                    )}
                    {!projectsLoading && !projectsError && !selectedProject && allProjects.length > 0 && (
                        <div className="text-center text-gray-400">Please select a project from the sidebar.</div>
                    )}
                    {!projectsLoading && !projectsError && allProjects.length === 0 && (
                        <div className="text-center text-gray-400">No projects available.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KanbanBoardApp;






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