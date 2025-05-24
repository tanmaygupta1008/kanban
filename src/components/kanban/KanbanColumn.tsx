// import React, { useState, useCallback } from 'react';
// import { KanbanCard } from './KanbanCard';
// import { cn } from '../../lib/utils';
// // import { ScrollArea } from "@/components/ui/scroll-area";
// import { ScrollArea } from "../ui/scroll-area";
// // import { Button } from "@/components/ui/button";
// import { Button } from "../ui/button";
// import { PlusCircle } from 'lucide-react';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog"
// import { Textarea } from "../ui/textarea"
// import PropTypes from 'prop-types';

// const KanbanColumn = ({ column, onCardMove, onCardAdd }) => {
//     const [isDraggingOver, setIsDraggingOver] = useState(false);
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [newCardData, setNewCardData] = useState({
//         idea: '',
//         section: 'frontend',
//         description: '',
//     });

//     const handleDragEnter = useCallback((event) => {
//         event.preventDefault();
//         event.stopPropagation();
//         setIsDraggingOver(true);
//     }, []);

//     const handleDragLeave = useCallback((event) => {
//         event.preventDefault();
//         event.stopPropagation();
//         setIsDraggingOver(false);
//     }, []);

//     const handleDragOver = useCallback((event) => {
//         event.preventDefault();
//         event.stopPropagation();
//     }, []);

//     const handleDrop = useCallback((event) => {
//         event.preventDefault();
//         event.stopPropagation();
//         setIsDraggingOver(false);

//         const cardId = event.dataTransfer.getData('text/plain');
//         const oldColumnKey = event.dataTransfer.getData('oldColumnKey');

//         onCardMove(cardId, column.key, oldColumnKey);
//     }, [column.key, onCardMove]);

//     const handleAddNewCard = () => {
//         if (newCardData.idea.trim()) {
//             onCardAdd(column.key, {
//                 ...newCardData,
//                 createdAt: new Date(),
//                 postedBy: 'CurrentUser', // Replace with actual user data
//             });
//             setNewCardData({ idea: '', section: 'frontend', description: '' }); // Reset form
//             setIsDialogOpen(false); // Close dialog
//         }
//     };

//     return (
//         <div
//             className={cn(
//                 'flex flex-col w-full md:w-72 min-w-[280px] transition-all duration-300',
//                 isDraggingOver ? 'ring-2 ring-blue-500/50 rounded-lg' : ''
//             )}
//             onDragEnter={handleDragEnter}
//             onDragLeave={handleDragLeave}
//             onDragOver={handleDragOver}
//             onDrop={handleDrop}
//             data-column-key={column.key}
//         >
//             <div className="flex items-center gap-2.5 mb-4">
//                 <h2 className="text-xl font-semibold text-white">{column.title}</h2>
//                 <span className="text-sm text-gray-400">({column.cards.length})</span>
//             </div>
//             <ScrollArea className="flex-1 pr-4 space-y-4">
//                 {column.cards.map((card) => (
//                     <KanbanCard key={card.id} card={card} />
//                 ))}
//             </ScrollArea>
//             <div className="mt-6">
//                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                     <DialogTrigger asChild>
//                         <Button
//                             variant="outline"
//                             className="w-full text-white hover:bg-white/10 border-gray-700 flex items-center gap-2"
//                         >
//                             <PlusCircle className="w-4 h-4" />
//                             Add New Card
//                         </Button>
//                     </DialogTrigger>
//                     <DialogContent className="bg-gray-900 border-gray-700 text-white">
//                         <DialogHeader>
//                             <DialogTitle className="text-white">Add New Card to {column.title}</DialogTitle>
//                             <DialogDescription className="text-gray-400">
//                                 Enter the details for the new card.
//                             </DialogDescription>
//                         </DialogHeader>
//                         <div className="space-y-4">
//                             <div>
//                                 <label htmlFor="idea" className="block text-sm font-medium text-gray-300">
//                                     Idea
//                                 </label>
//                                 <Textarea
//                                     id="idea"
//                                     value={newCardData.idea}
//                                     onChange={(e) => setNewCardData({ ...newCardData, idea: e.target.value })}
//                                     className="mt-1 bg-gray-800 border-gray-700 text-white"
//                                     placeholder="Enter your idea..."
//                                 />
//                             </div>
//                             <div>
//                                 <label htmlFor="section" className="block text-sm font-medium text-gray-300">
//                                     Section
//                                 </label>
//                                 <select
//                                     id="section"
//                                     value={newCardData.section}
//                                     onChange={(e) =>
//                                         setNewCardData({
//                                             ...newCardData,
//                                             section: e.target.value,
//                                         })
//                                     }
//                                     className="mt-1 block w-full bg-gray-800 border border-gray-700 text-white py-2 px-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 >
//                                     <option value="frontend">Frontend</option>
//                                     <option value="backend">Backend</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label htmlFor="description" className="block text-sm font-medium text-gray-300">
//                                     Description
//                                 </label>
//                                 <Textarea
//                                     id="description"
//                                     value={newCardData.description}
//                                     onChange={(e) => setNewCardData({ ...newCardData, description: e.target.value })}
//                                     className="mt-1 bg-gray-800 border-gray-700 text-white"
//                                     placeholder="Enter description..."
//                                 />
//                             </div>
//                         </div>
//                         <DialogFooter>
//                             <Button
//                                 variant="outline"
//                                 className="text-white hover:bg-white/10 border-gray-700"
//                                 onClick={() => setIsDialogOpen(false)}
//                             >
//                                 Cancel
//                             </Button>
//                             <Button
//                                 className="bg-blue-500 text-white hover:bg-blue-600"
//                                 onClick={handleAddNewCard}
//                                 disabled={!newCardData.idea.trim()}
//                             >
//                                 Add Card
//                             </Button>
//                         </DialogFooter>
//                     </DialogContent>
//                 </Dialog>
//             </div>
//         </div>
//     );
// };

// KanbanColumn.propTypes = {
//     column: PropTypes.shape({
//         key: PropTypes.oneOf(['ideas', 'ongoingResearch', 'development', 'integration', 'completed']).isRequired,
//         title: PropTypes.string.isRequired,
//         cards: PropTypes.arrayOf(PropTypes.shape({
//             id: PropTypes.string.isRequired,
//             idea: PropTypes.string.isRequired,
//             section: PropTypes.oneOf(['frontend', 'backend']).isRequired,
//             image: PropTypes.string,
//             videoLink: PropTypes.string,
//             references: PropTypes.arrayOf(PropTypes.string),
//             createdAt: PropTypes.instanceOf(Date).isRequired,
//             postedBy: PropTypes.string.isRequired,
//             description: PropTypes.string,
//         })).isRequired,
//     }).isRequired,
//     onCardMove: PropTypes.func.isRequired,
//     onCardAdd: PropTypes.func.isRequired,
// };

// export { KanbanColumn };



import React, { useState, useCallback } from 'react';
import { KanbanCard } from './KanbanCard';
import type { ColumnKey, CardItem } from '../../types';
import { cn } from '../../lib/utils';
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog"
import { Textarea } from "../ui/textarea"
// import { projects } from '@/data';

interface KanbanColumnProps {
    column: { key: ColumnKey; title: string; cards: CardItem[] };
    onCardMove: (cardId: string, newColumnKey: ColumnKey, oldColumnKey: ColumnKey) => void;
    onCardAdd: (columnKey: ColumnKey, newCard: Omit<CardItem, 'id' | 'createdAt' | 'postedBy'>) => void;
    projectId?: string; // Optional projectId for future use
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onCardMove, onCardAdd, projectId }) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newCardData, setNewCardData] = useState({
        idea: '',
        section: 'frontend' as 'frontend' | 'backend',
        description: '',
    });

    const handleDragEnter = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(false);
    }, []);

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(false);

        const cardId = event.dataTransfer?.getData('text/plain');
        const oldColumnKey = event.dataTransfer?.getData('oldColumnKey');

        if (cardId && oldColumnKey) {
            onCardMove(cardId, column.key, oldColumnKey as ColumnKey);
        }
    }, [column.key, onCardMove]);

    const handleAddNewCard = () => {
        if (newCardData.idea.trim()) {
            onCardAdd(column.key, {
                ...newCardData
            });
            setNewCardData({ idea: '', section: 'frontend', description: '' }); // Reset form
            setIsDialogOpen(false); // Close dialog
        }
    };

    return (
        <div
            className={cn(
                'flex flex-col w-full md:w-72 min-w-[280px] transition-all duration-300',
                isDraggingOver ? 'ring-2 ring-blue-500/50 rounded-lg' : ''
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            data-column-key={column.key}
        >
            <div className="flex items-center gap-2.5 mb-4">
                <h2 className="text-xl font-semibold text-white">{column.title}</h2>
                <span className="text-sm text-gray-400">({column.cards.length})</span>
            </div>
            <ScrollArea className="flex-1 pr-4 space-y-4">
                {column.cards.map((card) => (
                    <KanbanCard key={card.id} card={card} projectId={projectId} onCardDeleted={() => { /* handle delete here if needed */ }} />
                    // <KanbanCard key={card.id} card={card} projectId={projectId} />
                ))}
            </ScrollArea>
            <div className="mt-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-[200px] mx-auto text-black hover:bg-white/20 hover:text-white border-gray-700 flex items-center gap-2 transform transition-transform duration-300 hover:scale-105"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Add New Card
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white">Add New Card to {column.title}</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Enter the details for the new card.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="idea" className="block text-sm font-medium text-gray-300">
                                    Idea
                                </label>
                                <Textarea
                                    id="idea"
                                    value={newCardData.idea}
                                    onChange={(e) => setNewCardData({ ...newCardData, idea: e.target.value })}
                                    className="mt-1 bg-gray-800 border-gray-700 text-white"
                                    placeholder="Enter your idea..."
                                />
                            </div>
                            <div>
                                <label htmlFor="section" className="block text-sm font-medium text-gray-300">
                                    Section
                                </label>
                                <select
                                    id="section"
                                    value={newCardData.section}
                                    onChange={(e) =>
                                        setNewCardData({
                                            ...newCardData,
                                            section: e.target.value as 'frontend' | 'backend',
                                        })
                                    }
                                    className="mt-1 block w-full bg-gray-800 border border-gray-700 text-white py-2 px-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="frontend">Frontend</option>
                                    <option value="backend">Backend</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                                    Description
                                </label>
                                <Textarea
                                    id="description"
                                    value={newCardData.description}
                                    onChange={(e) => setNewCardData({ ...newCardData, description: e.target.value })}
                                    className="mt-1 bg-gray-800 border-gray-700 text-white"
                                    placeholder="Enter description..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                className="text-black hover:bg-white/10 hover:text-white border-gray-700"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-blue-500 text-white hover:bg-blue-600"
                                onClick={handleAddNewCard}
                                disabled={!newCardData.idea.trim()}
                            >
                                Add Card
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export { KanbanColumn };