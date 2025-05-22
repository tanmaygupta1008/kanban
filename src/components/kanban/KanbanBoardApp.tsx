// import React, { useState, useCallback, useContext } from 'react';
// import { KanbanColumn } from './KanbanColumn';
// import { initialColumns, teamMembers, ProjectName } from '../../data';
// import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

// import type { ColumnKey, CardItem } from '../../types';
// import { AuthContext } from '../../context/AuthContext';

// const KanbanBoardApp: React.FC = () => {
//   const [columns, setColumns] = useState(initialColumns);
//   const { logout } = useContext(AuthContext);

//   const handleCardMove = useCallback(
//     (cardId: string, newColumnKey: ColumnKey, oldColumnKey: ColumnKey) => {
//       setColumns((prevColumns) => {
//         const newColumns = prevColumns.map(col => {
//           if (col.key === oldColumnKey) {
//             return { ...col, cards: col.cards.filter(card => card.id !== cardId) };
//           }
//           if (col.key === newColumnKey) {
//             const cardToMove = prevColumns
//               .find((c) => c.key === oldColumnKey)?.cards.find((card) => card.id === cardId);
//             return cardToMove ? { ...col, cards: [...col.cards, { ...cardToMove }] } : col;
//           }
//           return col;
//         });
//         return newColumns;
//       });
//     },
//     []
//   );

//   const handleCardAdd = useCallback(
//     (columnKey: ColumnKey, newCard: Omit<CardItem, 'id' | 'createdAt' | 'postedBy'>) => {
//       setColumns((prevColumns) => {
//         return prevColumns.map((col) =>
//           col.key === columnKey
//             ? {
//                 ...col,
//                 cards: [
//                   {
//                     ...newCard,
//                     id: crypto.randomUUID(),
//                     createdAt: new Date(),
//                     postedBy: 'CurrentUser',
//                   },
//                   ...col.cards,
//                 ],
//               }
//             : col
//         );
//       });
//     },
//     []
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black py-10">
//       <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 space-y-10">
        // <div className="flex justify-between items-center">
        //   <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
        //     {ProjectName}
        //   </h1>
        //   <button
        //     onClick={logout}
        //     className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500"
        //   >
        //     Logout
        //   </button>
        // </div>

//         <div className="mb-6">
//           <h2 className="text-xl font-semibold text-gray-300 mb-3">Team Members</h2>
//           <div className="flex flex-wrap gap-3">
//             {teamMembers.map((user) => (
//               <div key={user.name} className="flex items-center gap-2">
//                 <Avatar>
//                   <AvatarImage src={user.avatarUrl} alt={user.name} />
//                   <AvatarFallback>{user.name[0]}</AvatarFallback>
//                 </Avatar>
//                 <span className="text-gray-400">{user.name}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-0">
//           {columns.map((column) => (
//             <KanbanColumn
//               key={column.key}
//               column={column}
//               onCardMove={handleCardMove}
//               onCardAdd={handleCardAdd}
//               // sclassName="mb-6 md:mb-0" // Add some bottom margin for mobile view
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default KanbanBoardApp;



import React, { useState, useCallback, useContext } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { initialColumns, teamMembers, ProjectName } from '../../data';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

import type { ColumnKey, CardItem } from '../../types';
import { AuthContext } from '../../context/AuthContext';
// import { color } from 'framer-motion';

const KanbanBoardApp: React.FC = () => {
    const [columns, setColumns] = useState(initialColumns);
    const { logout } = useContext(AuthContext);

    // const handleCardMove = useCallback(
    //     (cardId: string, newColumnKey: ColumnKey, oldColumnKey: ColumnKey) => {
    //         setColumns((prevColumns) => {
    //             const newColumns = [...prevColumns];

    //             // Remove card from old column
    //             const oldColumn = newColumns.find((col) => col.key === oldColumnKey);
    //             // console.log('oldColumn : \n', oldColumn);
    //             if (oldColumn) {
    //                 oldColumn.cards = oldColumn.cards.filter((card) => card.id !== cardId);
    //             }

    //             // Add card to new column
    //             const newColumn = newColumns.find((col) => col.key === newColumnKey);
    //             if (newColumn) {
    //                 const cardToMove = prevColumns
    //                     .find((col) => col.key === oldColumnKey)
    //                     ?.cards.find((card) => card.id === cardId);
    //                 console.log('cardToMove : \n', cardToMove);
    //                 if (cardToMove) {
    //                     newColumn.cards = [...newColumn.cards, cardToMove];
    //                 }
    //             }

    //             return newColumns;
    //         });
    //     },
    //     []
    // );

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
                        id: crypto.randomUUID(), // Generate unique ID
                        createdAt: new Date(),
                        postedBy: 'CurrentUser', // Replace with actual user data
                    };
                    column.cards = [newCardWithId, ...column.cards]; // Add to the beginning
                    // column.cards = [...column.cards, newCardWithId]; // Add to the end
                }
                return newColumns;
            });
        },
        []
    );

    return (
        
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8">
            {/* <div className="max-w-7xl mx-auto space-y-8"> */}
            <div className="max-w-7xl my-auto space-y-8 mx-3">
                {/* <button onClick={logout} className="px-6 py-3 text-lg">Logout</button> */}

                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        {/* {ProjectName} */}
                    </h1>
                    <button
                        onClick={logout}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Logout
                    </button>
                </div>

                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 py-4">
                        {ProjectName}
                    </h1>
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
                <div className="flex flex-col md:flex-row gap-3 w-full">
                    {columns.map((column) => (
                        <KanbanColumn
                            key={column.key}
                            column={column}
                            onCardMove={handleCardMove}
                            onCardAdd={handleCardAdd}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KanbanBoardApp;