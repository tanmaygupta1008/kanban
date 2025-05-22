// import React, { useState, useCallback, useContext } from 'react';
// import { KanbanColumn } from './KanbanColumn';
// import { initialColumns, teamMembers, ProjectName } from '../../data';
// import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

// import type { ColumnKey, CardItem } from '../../types';
// import { AuthContext } from '../../context/AuthContext';
// // import { color } from 'framer-motion';

// const KanbanBoardApp: React.FC = () => {
//     const [columns, setColumns] = useState(initialColumns);
//     const { logout } = useContext(AuthContext);

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
//                         id: crypto.randomUUID(), // Generate unique ID
//                         createdAt: new Date(),
//                         postedBy: 'CurrentUser', // Replace with actual user data
//                     };
//                     column.cards = [newCardWithId, ...column.cards]; // Add to the beginning
//                     // column.cards = [...column.cards, newCardWithId]; // Add to the end
//                 }
//                 return newColumns;
//             });
//         },
//         []
//     );

//     return (
        
//         <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8">
//             {/* <div className="max-w-7xl mx-auto space-y-8"> */}
//             <div className="max-w-7xl my-auto space-y-8 mx-3">
//                 {/* <button onClick={logout} className="px-6 py-3 text-lg">Logout</button> */}

//                 <div className="flex justify-between items-center">
//                     <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
//                         {/* {ProjectName} */}
//                     </h1>
//                     <button
//                         onClick={logout}
//                         className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500"
//                     >
//                         Logout
//                     </button>
//                 </div>

//                 <div className="text-center space-y-4">
//                     <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 py-4">
//                         {ProjectName}
//                     </h1>
//                     <div className="flex flex-wrap justify-center gap-4">
//                         {teamMembers.map((user) => (
//                             <div key={user.name} className="flex items-center gap-2">
//                                 <Avatar>
//                                     <AvatarImage src={user.avatarUrl} alt={user.name} />
//                                     <AvatarFallback>{user.name[0]}</AvatarFallback>
//                                 </Avatar>
//                                 <span className="text-gray-300">{user.name}</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//                 <div className="flex flex-col md:flex-row gap-3 w-full">
//                     {columns.map((column) => (
//                         <KanbanColumn
//                             key={column.key}
//                             column={column}
//                             onCardMove={handleCardMove}
//                             onCardAdd={handleCardAdd}
//                         />
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default KanbanBoardApp;




import React, { useState, useCallback, useContext, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { initialColumns, teamMembers, ProjectName, projects } from '../../data';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

import type { ColumnKey, CardItem, Column } from '../../types';
import { AuthContext } from '../../context/AuthContext';

const KanbanBoardApp: React.FC = () => {
    const [columns, setColumns] = useState<Column[]>(initialColumns);
    const { logout } = useContext(AuthContext);
    const [selectedProject, setSelectedProject] = useState(projects[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjectData = async () => {
            if (selectedProject) {
                console.log('Fetching data for project:', selectedProject.id);
                setLoading(true);
                setError(null);
                // Simulate API call - replace with your actual API endpoint
                try {
                    // In a real application, you would call your backend API here
                    // Example:
                    // const response = await fetch(`/api/projects/${selectedProject.id}/kanban`);
                    // if (!response.ok) {
                    //     throw new Error(`HTTP error! status: ${response.status}`);
                    // }
                    // const data = await response.json();
                    // setColumns(data.columns);

                    // Simulate a successful fetch with the initial columns for now
                    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
                    setColumns(initialColumns);
                } catch (e: unknown) {
                    console.error("Error fetching kanban data:", e);
                    setError('Failed to load project data.');
                    setColumns([]); // Clear columns on error
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProjectData();
    }, [selectedProject]);



    const handleCardMove = useCallback(
        (cardId: string, newColumnKey: ColumnKey, oldColumnKey: ColumnKey) => {
            setColumns((prevColumns) => {
                // Debug logs
                // console.log('Moving card:', {
                //     cardId,
                //     fromColumn: oldColumnKey,
                //     toColumn: newColumnKey
                // });

                const oldColumnData = prevColumns.find((col) => col.key === oldColumnKey);
                console.log('Old column data:', oldColumnData);

                // Find the card before making any changes
                const cardToMove = prevColumns
                    .find((col) => col.key === oldColumnKey)
                    ?.cards.find((card) => card.id === cardId);
                
                // console.log('Card to move:', cardToMove);

                // If card is not found, return unchanged state
                if (!cardToMove) {
                    // console.error('Card not found:', {
                    //     cardId,
                    //     oldColumnKey,
                    //     availableCards: oldColumnData?.cards
                    // });
                    return prevColumns;
                }

                const newColumns = prevColumns.map(col => {
                    if (col.key === oldColumnKey) {
                        // Remove from old column
                        return {
                            ...col,
                            cards: col.cards.filter(card => card.id !== cardId)
                        };
                    }
                    if (col.key === newColumnKey) {
                        // Add to new column with complete card data
                        return {
                            ...col,
                            cards: [...col.cards, { ...cardToMove }]
                        };
                    }
                    return col;
                });

                // Verify the move
                console.log('Updated columns:', newColumns);
                
                return newColumns;
            });
        },
        []
    );


    const handleCardAdd = useCallback(
        (columnKey: ColumnKey, newCard: Omit<CardItem, 'id' | 'createdAt' | 'postedBy'>) => {
            setColumns((prevColumns) => {
                const newColumns = [...prevColumns];
                const column = newColumns.find((col) => col.key === columnKey);
                if (column) {
                    const newCardWithId: CardItem = {
                        ...newCard,
                        id: crypto.randomUUID(),
                        createdAt: new Date(),
                        postedBy: 'CurrentUser',
                    };
                    column.cards = [newCardWithId, ...column.cards];
                }
                return newColumns;
            });
        },
        []
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex ">
            {/* Project Sidebar (Left) */}
            <aside className="min-w-45 bg-gray-800 text-gray-300 p-6 border-r border-gray-700 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4 text-white">Projects</h2>
                <ul>
                    {projects.map((project) => (
                        <li
                            key={project.id}
                            className={`py-2 px-4 cursor-pointer hover:bg-gray-700 rounded ${
                                selectedProject?.id === project.id ? 'bg-gray-700 text-white font-semibold' : ''
                            }`}
                            onClick={() => setSelectedProject(project)}
                        >
                            {project.name}
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Kanban Board Section */}
            <div className="flex-1 p-8 pr-0">
                <div className="max-w-7xl mx-auto space-y-8 ml-0 mr-0">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            {selectedProject?.name || ProjectName}
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
                            {teamMembers.map((user) => (
                                <div key={user.name} className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-gray-300">{user.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {loading && <div className="text-center text-gray-400">Loading project data...</div>}
                    {error && <div className="text-center text-red-500">{error}</div>}

                    {!loading && !error && (
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
                </div>
            </div>
        </div>
    );
};

export default KanbanBoardApp;