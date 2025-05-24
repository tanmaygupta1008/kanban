// totally fine working code
// import React, { useState, useEffect, useCallback } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// import { ImageIcon, Play, ListChecks, Clock, Loader2, Plus, Save, Trash } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { cn } from '../../lib/utils';
// import type { CardItem } from '../../types';
// import { Button } from "../ui/button";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
// import { ScrollArea } from "../ui/scroll-area"
// import { Input } from "../ui/input";
// import { Label } from "../ui/label";

// interface KanbanCardProps {
//   card: CardItem;
//   onCardUpdated?: (updatedCard: CardItem) => void;
//   onCardDeleted?: (cardId: string) => void; // New optional callback for delete
// }

// const KanbanCard: React.FC<KanbanCardProps> = ({ card, onCardUpdated, onCardDeleted }) => {
//   const [showFullDescription, setShowFullDescription] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [localCard, setLocalCard] = useState<CardItem>({...card});
//   const [newReference, setNewReference] = useState('');
//   const [isChanged, setIsChanged] = useState(false);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   useEffect(() => {
//     if (
//       localCard.idea !== card.idea ||
//       localCard.section !== card.section ||
//       localCard.description !== card.description ||
//       localCard.image !== card.image ||
//       localCard.videoLink !== card.videoLink ||
//       JSON.stringify(localCard.references || []) !== JSON.stringify(card.references || [])
//     ) {
//       setIsChanged(true);
//     } else {
//       setIsChanged(false);
//     }
//   }, [localCard, card]);

//   const handleDragStart = (event: React.DragEvent) => {
//     event.dataTransfer.setData('text/plain', localCard.id);
//     event.dataTransfer.setData(
//       'oldColumnKey',
//       ((event.currentTarget.closest('[data-column-key]') as HTMLElement | null)?.dataset.columnKey) || ''
//     );
//   };

//   const handleVideoLoad = () => {
//     setIsLoading(true);
//   }

//   const handleVideoLoaded = () => {
//     setIsLoading(false);
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setLocalCard(prevCard => ({
//       ...prevCard,
//       [name]: value,
//     }));
//   };

//   const handleAddReference = () => {
//     if (newReference.trim()) {
//       setLocalCard(prevCard => ({
//         ...prevCard,
//         references: [...(prevCard.references || []), newReference.trim()],
//       }));
//       setNewReference('');
//     }
//   };

//   const handleSave = () => {
//     if (onCardUpdated) {
//       onCardUpdated(localCard);
//     }
//     setIsChanged(false);
//   };

//   const handleDialogClose = () => {
//     setLocalCard({...card});
//     setIsChanged(false);
//     setIsDialogOpen(false);
//   };

//   const handleDialogOpenChange = (open: boolean) => {
//     setIsDialogOpen(open);
//     if (!open) {
//       handleDialogClose();
//     }
//   };

//   const handleDeleteCard = useCallback(() => {
//     if (onCardDeleted) {
//       onCardDeleted(localCard.id);
//     }
//     setIsDialogOpen(false); // Close the dialog after deleting
//   }, [onCardDeleted, localCard.id]);

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: -10 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, x: -20 }}
//       transition={{ duration: 0.2 }}
//       className="group pb-5"
//       draggable
//       data-card-id={localCard.id}
//     >
//       <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
//         <DialogTrigger asChild>
//           <Card
//             className={cn(
//               'bg-white/5 backdrop-blur-md border border-white/10',
//               'shadow-lg hover:shadow-xl transition-all duration-300',
//               'hover:scale-[1.01] hover:border-gray-400/20 cursor-grab'
//             )}
//             draggable
//             onDragStart={handleDragStart}
//           >
//             <CardHeader>
//               <CardTitle className="text-lg font-semibold text-white">
//                 {localCard.idea}
//               </CardTitle>
//               <CardDescription className="text-gray-400">
//                 Section: {localCard.section}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {localCard.image && localCard.image !== "None" && (
//                 <div className="relative">
//                   <img
//                     src={localCard.image}
//                     alt="Card Image"
//                     className="w-full h-auto rounded-md aspect-video object-cover"
//                   />
//                   <ImageIcon className="absolute top-2 left-2 text-gray-300/80 w-5 h-5" />
//                 </div>
//               )}
//               {localCard.videoLink && localCard.videoLink !== "None" && (
//                 <div className="relative">
//                   {isLoading && (
//                     <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-md">
//                       <Loader2 className="animate-spin text-white w-8 h-8" />
//                     </div>
//                   )}
//                   <iframe
//                     className={cn(
//                       "w-full aspect-video rounded-md",
//                       isLoading ? 'opacity-50' : 'opacity-100'
//                     )}
//                     src={localCard.videoLink}
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//                     allowFullScreen
//                     title="Video Link"
//                     onLoadStart={handleVideoLoad}
//                     onLoad={handleVideoLoaded}
//                   />
//                   {!isLoading && <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 w-10 h-10" />}
//                 </div>
//               )}
//               {localCard.references && localCard.references.length > 0 && localCard.references.some(ref => ref !== "None") && (
//                 <div>
//                   <h4 className="font-semibold text-gray-300 flex items-center gap-1.5">
//                     <ListChecks className="w-4 h-4" />
//                     References:
//                   </h4>
//                   <ul className="list-disc list-inside space-y-1">
//                     {localCard.references
//                       .filter(ref => ref !== "None")
//                       .map((ref, index) => (
//                         <li key={index} className="text-blue-400 hover:underline">
//                           <a href={ref} target="_blank" rel="noopener noreferrer">
//                             {ref}
//                           </a>
//                         </li>
//                       ))}
//                   </ul>
//                 </div>
//               )}
//               {localCard.description && localCard.description !== "None" && (
//                 <div className="space-y-2">
//                   <p className="text-gray-300">
//                     {showFullDescription
//                       ? localCard.description
//                       : localCard.description.length > 100
//                         ? `${localCard.description.substring(0, 100)}...`
//                         : localCard.description
//                     }
//                   </p>
//                   {localCard.description.length > 100 && (
//                     <Button
//                       variant="link"
//                       className="text-blue-400 p-0 hover:underline"
//                       onClick={() => setShowFullDescription(!showFullDescription)}
//                     >
//                       {showFullDescription ? 'Show Less' : 'Show More'}
//                     </Button>
//                   )}
//                 </div>
//               )}
//               <div className="flex items-center justify-between text-xs text-gray-400">
//                 <div>
//                   Posted by <span className="font-medium text-white">{localCard.postedBy}</span>
//                 </div>
//                 <div className="flex items-center gap-1.5">
//                   <Clock className="w-3 h-3" />
//                   {localCard.createdAt.toLocaleDateString()}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </DialogTrigger>
//         <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
//           <DialogHeader>
//             <DialogTitle className="text-white">{localCard.idea}</DialogTitle>
//             <DialogDescription className="text-gray-400">
//               Section: {localCard.section}
//             </DialogDescription>
//           </DialogHeader>
//           <ScrollArea className="h-[500px] pr-4">
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="image">Image URL:</Label>
//                 <Input
//                   type="text"
//                   id="image"
//                   name="image"
//                   value={localCard.image || ''}
//                   onChange={handleInputChange}
//                   className="mt-1"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="videoLink">Video Link:</Label>
//                 <Input
//                   type="text"
//                   id="videoLink"
//                   name="videoLink"
//                   value={localCard.videoLink || ''}
//                   onChange={handleInputChange}
//                   className="mt-1"
//                 />
//               </div>
//               <div>
//                 <Label>References:</Label>
//                 <ul>
//                   {localCard.references && localCard.references.filter(ref => ref !== "None").map((ref, index) => (
//                     <li key={index} className="text-blue-400 hover:underline py-1">
//                       <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
//                     </li>
//                   ))}
//                 </ul>
//                 <div className="flex items-center space-x-2 mt-2">
//                   <Input
//                     type="text"
//                     placeholder="Add new reference"
//                     value={newReference}
//                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReference(e.target.value)}
//                   />
//                   <Button type="button" size="sm" onClick={handleAddReference}>
//                     <Plus className="w-4 h-4" /> Add
//                   </Button>
//                 </div>
//               </div>
//               <div>
//                 <Label htmlFor="description">Description:</Label>
//                 <textarea
//                   id="description"
//                   name="description"
//                   value={localCard.description || ''}
//                   onChange={handleInputChange}
//                   className="w-full mt-1 p-2 rounded-md bg-gray-800 border-gray-700 text-white"
//                 />
//               </div>
//               {localCard.image && localCard.image !== "None" && (
//                 <div className="relative">
//                   <img
//                     src={localCard.image}
//                     alt="Card Image"
//                     className="w-full h-auto rounded-md aspect-video object-cover"
//                   />
//                   <ImageIcon className="absolute top-2 left-2 text-gray-300/80 w-5 h-5" />
//                 </div>
//               )}
//               {localCard.videoLink && localCard.videoLink !== "None" && (
//                 <div className="relative">
//                   {isLoading && (
//                     <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-md">
//                       <Loader2 className="animate-spin text-white w-8 h-8" />
//                     </div>
//                   )}
//                   <iframe
//                     className={cn(
//                       "w-full aspect-video rounded-md",
//                       isLoading ? 'opacity-50' : 'opacity-100'
//                     )}
//                     src={localCard.videoLink}
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//                     allowFullScreen
//                     title="Video Link"
//                     onLoadStart={handleVideoLoad}
//                     onLoad={handleVideoLoaded}
//                   />
//                   {!isLoading && <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 w-10 h-10" />}
//                 </div>
//               )}
//               {localCard.references && localCard.references.length > 0 && localCard.references.some(ref => ref !== "None") && (
//                 <div>
//                   <h4 className="font-semibold text-gray-300 flex items-center gap-1.5">
//                     <ListChecks className="w-4 h-4" />
//                     References:
//                   </h4>
//                   <ul className="list-disc list-inside space-y-1">
//                     {localCard.references
//                       .filter(ref => ref !== "None")
//                       .map((ref, index) => (
//                         <li key={index} className="text-blue-400 hover:underline">
//                           <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
//                         </li>
//                       ))}
//                   </ul>
//                 </div>
//               )}
//               {localCard.description && localCard.description !== "None" && (
//                 <div className="space-y-4">
//                   <h4 className="font-semibold text-gray-300">Description:</h4>
//                   <p className="text-gray-200 whitespace-pre-line">{localCard.description}</p>
//                 </div>
//               )}
//               <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-700">
//                 <div>
//                   Posted by <span className="font-medium text-white">{localCard.postedBy}</span>
//                 </div>
//                 <div className="flex items-center gap-1.5">
//                   <Clock className="w-4 h-4" />
//                   {localCard.createdAt.toLocaleDateString()}
//                 </div>
//               </div>
//             </div>
//           </ScrollArea>
//           <div className="flex justify-between items-center p-4">
//             <Button
//               variant="destructive"
//               size="sm"
//               onClick={handleDeleteCard}
//             >
//               <Trash className="mr-2 w-4 h-4" /> Delete
//             </Button>
//             <div>
//               {isChanged && (
//                 <Button onClick={handleSave}>
//                   <Save className="mr-2 w-4 h-4" /> Save
//                 </Button>
//               )}
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </motion.div>
//   );
// };

// export { KanbanCard };











// adding deleting a card from database functionality
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ImageIcon, Play, ListChecks, Clock, Loader2, Plus, Save, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { CardItem } from '../../types';
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface KanbanCardProps {
    card: CardItem;
    onCardUpdated?: (updatedCard: CardItem) => void;
    onCardDeleted?: (cardId: string) => void; // Callback to notify parent of deletion
    projectId?: string; // To know which project the card belongs to for backend calls
}

const KanbanCard: React.FC<KanbanCardProps> = ({ card, onCardUpdated, onCardDeleted, projectId }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [localCard, setLocalCard] = useState<CardItem>({...card});
    const [newReference, setNewReference] = useState('');
    const [isChanged, setIsChanged] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // State to show deleting state
    // const projectID = projectId
    

    // console.log("Project ID in KanbanCard: ", projectId);

    useEffect(() => {
        if (
            localCard.idea !== card.idea ||
            localCard.section !== card.section ||
            localCard.description !== card.description ||
            localCard.image !== card.image ||
            localCard.videoLink !== card.videoLink ||
            JSON.stringify(localCard.references || []) !== JSON.stringify(card.references || [])
        ) {
            setIsChanged(true);
        } else {
            setIsChanged(false);
        }
    }, [localCard, card]);

    const handleDragStart = (event: React.DragEvent) => {
        event.dataTransfer.setData('text/plain', localCard.id);
        event.dataTransfer.setData(
            'oldColumnKey',
            ((event.currentTarget.closest('[data-column-key]') as HTMLElement | null)?.dataset.columnKey) || ''
        );
    };

    const handleVideoLoad = () => {
        setIsLoading(true);
    }

    const handleVideoLoaded = () => {
        setIsLoading(false);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalCard(prevCard => ({
            ...prevCard,
            [name]: value,
        }));
    };

    const handleAddReference = () => {
        if (newReference.trim()) {
            setLocalCard(prevCard => ({
                ...prevCard,
                references: [...(prevCard.references || []), newReference.trim()],
            }));
            setNewReference('');
        }
    };

    const handleSave = async () => {
        if (onCardUpdated) {
            setIsLoading(true);
            try {
                // Assuming your update API endpoint is something like /tasks/:cardId
                const response = await fetch(`http://localhost:5000/tasks/${localCard.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(localCard),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Failed to update card:", errorData);
                    // Optionally show an error message to the user
                    setIsLoading(false);
                    return;
                }
                const updatedData: CardItem = await response.json();
                onCardUpdated(updatedData);
                setIsChanged(false);
            } catch (error) {
                console.error("Error updating card:", error);
                // Optionally show an error message to the user
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDialogClose = () => {
        setLocalCard({...card});
        setIsChanged(false);
        setIsDialogOpen(false);
    };

    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            handleDialogClose();
        }
    };

    const handleDeleteCard = useCallback(async () => {
      console.log("Deleting card with ID:", localCard.id);
      console.log("Project ID which has card for deletion: ", projectId);
      console.log("onCardDeleted callback: ", onCardDeleted);
      // onCardDeleted = localCard.id;
        if (onCardDeleted && projectId) {
        // if (projectId) {
          console.log("entered in if condition for deleting card");
            setIsDeleting(true);
            try {
                const response = await fetch(`http://localhost:5000/tasks/${localCard.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ projectId: projectId }), // Optionally send projectId for backend validation
                });
                // console.log("Response from delete request:", response);
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Failed to delete card:", errorData);
                    // Optionally show an error message
                    setIsDeleting(false);
                    return;
                }
                onCardDeleted(localCard.id); // Notify parent to update UI
                setIsDialogOpen(false); // Close the dialog after successful deletion
                window.location.reload(); // Reload the page to reflect changes
            } catch (error) {
                console.error("Error deleting card:", error);
                // Optionally show an error message
            } finally {
                setIsDeleting(false);
            }
        } else if (!projectId) {
            console.error("Project ID is missing. Cannot delete from backend.");
            // Optionally show an error
        }
    }, [onCardDeleted, localCard.id, projectId]);

    

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="group pb-5"
            draggable
            data-card-id={localCard.id}
        >
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                    <Card
                        className={cn(
                            'bg-white/5 backdrop-blur-md border border-white/10',
                            'shadow-lg hover:shadow-xl transition-all duration-300',
                            'hover:scale-[1.01] hover:border-gray-400/20 cursor-grab'
                        )}
                        draggable
                        onDragStart={handleDragStart}
                    >
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white">
                                {localCard.idea}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Section: {localCard.section}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {localCard.image && localCard.image !== "None" && (
                                <div className="relative">
                                    <img
                                        src={localCard.image}
                                        alt="Card Image"
                                        className="w-full h-auto rounded-md aspect-video object-cover"
                                    />
                                    <ImageIcon className="absolute top-2 left-2 text-gray-300/80 w-5 h-5" />
                                </div>
                            )}
                            {localCard.videoLink && localCard.videoLink !== "None" && (
                                <div className="relative">
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-md">
                                            <Loader2 className="animate-spin text-white w-8 h-8" />
                                        </div>
                                    )}
                                    <iframe
                                        className={cn(
                                            "w-full aspect-video rounded-md",
                                            isLoading ? 'opacity-50' : 'opacity-100'
                                        )}
                                        src={localCard.videoLink}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        title="Video Link"
                                        onLoadStart={handleVideoLoad}
                                        onLoad={handleVideoLoaded}
                                    />
                                    {!isLoading && <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 w-10 h-10" />}
                                </div>
                            )}
                            {localCard.references && localCard.references.length > 0 && localCard.references.some(ref => ref !== "None") && (
                                <div>
                                    <h4 className="font-semibold text-gray-300 flex items-center gap-1.5">
                                        <ListChecks className="w-4 h-4" />
                                        References:
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {localCard.references
                                            .filter(ref => ref !== "None")
                                            .map((ref, index) => (
                                                <li key={index} className="text-blue-400 hover:underline">
                                                    <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}
                            {localCard.description && localCard.description !== "None" && (
                                <div className="space-y-2">
                                    <p className="text-gray-300">
                                        {showFullDescription
                                            ? localCard.description
                                            : localCard.description.length > 100
                                                ? `${localCard.description.substring(0, 100)}...`
                                                : localCard.description
                                        }
                                    </p>
                                    {localCard.description.length > 100 && (
                                        <Button
                                            variant="link"
                                            className="text-blue-400 p-0 hover:underline"
                                            onClick={() => setShowFullDescription(!showFullDescription)}
                                        >
                                            {showFullDescription ? 'Show Less' : 'Show More'}
                                        </Button>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <div>
                                    Posted by <span className="font-medium text-white">{localCard.postedBy}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    {localCard.createdAt.toLocaleDateString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-white">{localCard.idea}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Section: {localCard.section}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="image">Image URL:</Label>
                                <Input
                                    type="text"
                                    id="image"
                                    name="image"
                                    value={localCard.image || ''}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="videoLink">Video Link:</Label>
                                <Input
                                    type="text"
                                    id="videoLink"
                                    name="videoLink"
                                    value={localCard.videoLink || ''}
                                    onChange={handleInputChange}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>References:</Label>
                                <ul>
                                    {localCard.references && localCard.references.filter(ref => ref !== "None").map((ref, index) => (
                                        <li key={index} className="text-blue-400 hover:underline py-1">
                                            <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex items-center space-x-2 mt-2">
                                    <Input
                                        type="text"
                                        placeholder="Add new reference"
                                        value={newReference}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReference(e.target.value)}
                                    />
                                    <Button type="button" size="sm" onClick={handleAddReference}>
                                        <Plus className="w-4 h-4" /> Add
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="description">Description:</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={localCard.description || ''}
                                    onChange={handleInputChange}
                                    className="w-full mt-1 p-2 rounded-md bg-gray-800 border-gray-700 text-white"
                                />
                            </div>
                            {localCard.image && localCard.image !== "None" && (
                                <div className="relative">
                                    <img
                                        src={localCard.image}
                                        alt="Card Image"
                                        className="w-full h-auto rounded-md aspect-video object-cover"
                                    />
                                    <ImageIcon className="absolute top-2 left-2 text-gray-300/80 w-5 h-5" />
                                </div>
                            )}
                            {localCard.videoLink && localCard.videoLink !== "None" && (
                                <div className="relative">
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-md">
                                            <Loader2 className="animate-spin text-white w-8 h-8" />
                                        </div>
                                    )}
                                    <iframe
                                        className={cn(
                                            "w-full aspect-video rounded-md",
                                            isLoading ? 'opacity-50' : 'opacity-100'
                                        )}
                                        src={localCard.videoLink}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        title="Video Link"
                                        onLoadStart={handleVideoLoad}
                                        onLoad={handleVideoLoaded}
                                    />
                                    {!isLoading && <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 w-10 h-10" />}
                                </div>
                            )}
                            {localCard.references && localCard.references.length > 0 && localCard.references.some(ref => ref !== "None") && (
                                <div>
                                    <h4 className="font-semibold text-gray-300 flex items-center gap-1.5">
                                        <ListChecks className="w-4 h-4" />
                                        References:
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {localCard.references
                                            .filter(ref => ref !== "None")
                                            .map((ref, index) => (
                                                <li key={index} className="text-blue-400 hover:underline">
                                                    <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            )}
                            {localCard.description && localCard.description !== "None" && (
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-300">Description:</h4>
                                    <p className="text-gray-200 whitespace-pre-line">{localCard.description}</p>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-700">
                                <div>
                                    Posted by <span className="font-medium text-white">{localCard.postedBy}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {localCard.createdAt.toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="flex justify-between items-center p-4">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteCard}
                            disabled={isDeleting}
                        >
                            {
                              isDeleting ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Trash className="mr-2 w-4 h-4" />
                            }
                            Delete
                        </Button>
                        <div>
                            {isChanged && (
                                <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
                                    Save
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export { KanbanCard };










// import React, { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// import { ImageIcon, Play, ListChecks, Clock, Loader2 } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { cn } from '../../lib/utils';
// import type { CardItem } from '../../types';
// import { Button } from "../ui/button";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
// import { ScrollArea } from "../ui/scroll-area"

// interface KanbanCardProps {
//     card: CardItem;
// }

// const KanbanCard: React.FC<KanbanCardProps> = ({ card }) => {
//     const [showFullDescription, setShowFullDescription] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);

//     const handleDragStart = (event: React.DragEvent) => {
//         event.dataTransfer.setData('text/plain', card.id);
//         event.dataTransfer.setData(
//             'oldColumnKey',
//             ((event.currentTarget.closest('[data-column-key]') as HTMLElement | null)?.dataset.columnKey) || ''
//         );
//     };

//     const handleVideoLoad = () => {
//         setIsLoading(true); // Start loading
//     }

//     const handleVideoLoaded = () => {
//         setIsLoading(false); // Stop loading
//     }

//     return (
//         <motion.div
//             layout
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             transition={{ duration: 0.2 }}
//             className="group"
//             draggable
//             data-card-id={card.id}
//         >
//             <Dialog>
//                 <DialogTrigger asChild>
//                     <Card
//                         className={cn(
//                             'bg-white/5 backdrop-blur-md border border-white/10',
//                             'shadow-lg hover:shadow-xl transition-all duration-300',
//                             'hover:scale-[1.01] hover:border-gray-400/20 cursor-grab'
//                         )}
//                         draggable
//                         onDragStart={handleDragStart}
//                     >
//                         <CardHeader>
//                             <CardTitle className="text-lg font-semibold text-white">
//                                 {card.idea}
//                             </CardTitle>
//                             <CardDescription className="text-gray-400">
//                                 Section: {card.section}
//                             </CardDescription>
//                         </CardHeader>
//                         <CardContent className="space-y-4">
//                             {card.image && card.image !== "None" && (
//                                 <div className="relative">
//                                     <img
//                                         src={card.image}
//                                         alt="Card Image"
//                                         className="w-full h-auto rounded-md aspect-video object-cover"
//                                     />
//                                     <ImageIcon className="absolute top-2 left-2 text-gray-300/80 w-5 h-5" />
//                                 </div>
//                             )}
//                             {card.videoLink && card.videoLink !== "None" && (
//                                 <div className="relative">
//                                     {isLoading && (
//                                         <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-md">
//                                             <Loader2 className="animate-spin text-white w-8 h-8" />
//                                         </div>
//                                     )}
//                                     <iframe
//                                         className={cn(
//                                             "w-full aspect-video rounded-md",
//                                             isLoading ? 'opacity-50' : 'opacity-100'
//                                         )}
//                                         src={card.videoLink}
//                                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//                                         allowFullScreen
//                                         title="Video Link"
//                                         onLoadStart={handleVideoLoad}
//                                         onLoad={handleVideoLoaded}
//                                     />
//                                     {!isLoading && <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 w-10 h-10" />}
//                                 </div>
//                             )}
//                             {card.references && card.references.length > 0 && card.references.some(ref => ref !== "None") && (
//                                 <div>
//                                     <h4 className="font-semibold text-gray-300 flex items-center gap-1.5">
//                                         <ListChecks className="w-4 h-4" />
//                                         References:
//                                     </h4>
//                                     <ul className="list-disc list-inside space-y-1">
//                                         {card.references
//                                             .filter(ref => ref !== "None")
//                                             .map((ref, index) => (
//                                                 <li key={index} className="text-blue-400 hover:underline">
//                                                     <a href={ref} target="_blank" rel="noopener noreferrer">
//                                                         {ref}
//                                                     </a>
//                                                 </li>
//                                             ))}
//                                     </ul>
//                                 </div>
//                             )}
//                             {card.description && card.description !== "None" && (
//                                 <div className="space-y-2">
//                                     <p className="text-gray-300">
//                                         {showFullDescription
//                                             ? card.description
//                                             : card.description.length > 100
//                                                 ? `${card.description.substring(0, 100)}...`
//                                                 : card.description
//                                         }
//                                     </p>
//                                     {card.description.length > 100 && (
//                                         <Button
//                                             variant="link"
//                                             className="text-blue-400 p-0 hover:underline"
//                                             onClick={() => setShowFullDescription(!showFullDescription)}
//                                         >
//                                             {showFullDescription ? 'Show Less' : 'Show More'}
//                                         </Button>
//                                     )}
//                                 </div>
//                             )}
//                             <div className="flex items-center justify-between text-xs text-gray-400">
//                                 <div>
//                                     Posted by <span className="font-medium text-white">{card.postedBy}</span>
//                                 </div>
//                                 <div className="flex items-center gap-1.5">
//                                     <Clock className="w-3 h-3" />
//                                     {card.createdAt.toLocaleDateString()}
//                                 </div>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </DialogTrigger>
//                 <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
//                     <DialogHeader>
//                         <DialogTitle className="text-white">{card.idea}</DialogTitle>
//                         <DialogDescription className="text-gray-400">
//                             Section: {card.section}
//                         </DialogDescription>
//                     </DialogHeader>
//                     <ScrollArea className="h-[400px] pr-4">
//                         <div className="space-y-4">
//                             {card.image && card.image !== "None" && (
//                                 <div className="relative">
//                                     <img
//                                         src={card.image}
//                                         alt="Card Image"
//                                         className="w-full h-auto rounded-md aspect-video object-cover"
//                                     />
//                                     <ImageIcon className="absolute top-2 left-2 text-gray-300/80 w-5 h-5" />
//                                 </div>
//                             )}
//                             {card.videoLink && card.videoLink !== "None" && (
//                                 <div className="relative">
//                                     {isLoading && (
//                                         <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-md">
//                                             <Loader2 className="animate-spin text-white w-8 h-8" />
//                                         </div>
//                                     )}
//                                     <iframe
//                                         className={cn(
//                                             "w-full aspect-video rounded-md",
//                                             isLoading ? 'opacity-50' : 'opacity-100'
//                                         )}
//                                         src={card.videoLink}
//                                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//                                         allowFullScreen
//                                         title="Video Link"
//                                         onLoadStart={handleVideoLoad}
//                                         onLoad={handleVideoLoaded}
//                                     />
//                                     {!isLoading && <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 w-10 h-10" />}
//                                 </div>
//                             )}
//                             {card.references && card.references.length > 0 && card.references.some(ref => ref !== "None") && (
//                                 <div>
//                                     <h4 className="font-semibold text-gray-300 flex items-center gap-1.5">
//                                         <ListChecks className="w-4 h-4" />
//                                         References:
//                                     </h4>
//                                     <ul className="list-disc list-inside space-y-1">
//                                         {card.references
//                                             .filter(ref => ref !== "None")
//                                             .map((ref, index) => (
//                                                 <li key={index} className="text-blue-400 hover:underline">
//                                                     <a href={ref} target="_blank" rel="noopener noreferrer">
//                                                         {ref}
//                                                     </a>
//                                                 </li>
//                                             ))}
//                                     </ul>
//                                 </div>
//                             )}
//                             {card.description && card.description !== "None" && (
//                                 <div className="space-y-4">
//                                     <h4 className="font-semibold text-gray-300">Description:</h4>
//                                     <p className="text-gray-200 whitespace-pre-line">{card.description}</p>
//                                 </div>
//                             )}
//                             <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-700">
//                                 <div>
//                                     Posted by <span className="font-medium text-white">{card.postedBy}</span>
//                                 </div>
//                                 <div className="flex items-center gap-1.5">
//                                     <Clock className="w-4 h-4" />
//                                     {card.createdAt.toLocaleDateString()}
//                                 </div>
//                             </div>
//                         </div>
//                     </ScrollArea>
//                 </DialogContent>
//             </Dialog>
//         </motion.div>
//     );
// };

// export { KanbanCard };