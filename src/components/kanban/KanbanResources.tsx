import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { toast } from 'react-toastify';
import { PlusCircle, Trash, XCircle } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Checkbox } from "../../components/ui/checkbox";

interface Resource {
    _id?: string;
    projectId: string;
    category: 'papers' | 'images' | 'videos' | 'repositories' | 'others';
    link: string;
    description?: string;
    websiteLink?: string; // New field for website link (only for images)
    createdAt?: string;
}

interface KanbanResourcesProps {
    selectedProjectId: string | null;
}

const KanbanResources: React.FC<KanbanResourcesProps> = ({ selectedProjectId }) => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);
    const [newResourceLink, setNewResourceLink] = useState('');
    const [newResourceDescription, setNewResourceDescription] = useState('');
    const [newResourceWebsiteLink, setNewResourceWebsiteLink] = useState(''); // State for website link input
    const [newResourceCategory, setNewResourceCategory] = useState<'papers' | 'images' | 'videos' | 'repositories' | 'others'>('others');
    const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
    const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
    const [isDeletingBulk, setIsDeletingBulk] = useState(false);
    const [isConfirmBulkDeleteDialogOpen, setIsConfirmBulkDeleteDialogOpen] = useState(false);
    const [isConfirmSingleDeleteDialogOpen, setIsConfirmSingleDeleteDialogOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
    const [isImageOptionsDialogOpen, setIsImageOptionsDialogOpen] = useState(false);
    const [selectedImageResource, setSelectedImageResource] = useState<Resource | null>(null);
    const [categorySelectAll, setCategorySelectAll] = useState<Record<Resource['category'], boolean>>({
        papers: false,
        images: false,
        videos: false,
        repositories: false,
        others: false,
    });

    const categoryOrder: Resource['category'][] = ['papers', 'repositories', 'videos', 'others', 'images'];

    const fetchResources = useCallback(async (projectId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/resources/projects/${projectId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch resources: ${response.statusText}`);
            }
            const data: Resource[] = await response.json();
            setResources(data);
            setCategorySelectAll(({
                papers: false,
                images: false,
                videos: false,
                repositories: false,
                others: false,
            }));
            setSelectedResourceIds([]);
        } catch (err: unknown) {
            console.error("Error fetching resources:", err);
            if (err instanceof Error) {
                setError(err.message || 'Failed to load resources.');
            } else {
                setError('Failed to load resources.');
            }
            setResources([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedProjectId) {
            fetchResources(selectedProjectId);
        } else {
            setResources([]);
            setLoading(false);
            setError(null);
        }
    }, [selectedProjectId, fetchResources]);

    const handleAddResource = async () => {
        setIsAddResourceDialogOpen(false);
        if (!selectedProjectId) {
            toast.error("Please select a project first.");
            return;
        }
        if (!newResourceLink.trim()) {
            toast.error("Resource link cannot be empty.");
            return;
        }

        const newResourceData: Omit<Resource, '_id' | 'createdAt'> = {
            projectId: selectedProjectId,
            category: newResourceCategory,
            link: newResourceLink,
            description: newResourceDescription,
        };

        if (newResourceCategory === 'images' && newResourceWebsiteLink.trim()) {
            newResourceData.websiteLink = newResourceWebsiteLink;
        }

        try {
            const response = await fetch('http://localhost:5000/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newResourceData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add resource.');
            }
            setNewResourceLink('');
            setNewResourceDescription('');
            setNewResourceWebsiteLink('');
            fetchResources(selectedProjectId);
            toast.success('Resource added successfully!');
        } catch (error: unknown) {
            console.error("Error adding resource:", error);
            let message = "Failed to add resource.";
            if (error instanceof Error) {
                message = error.message;
            }
            toast.error(`Error: ${message}`);
        }
    };

    const enterBulkDeleteMode = () => {
        setIsBulkDeleteMode(true);
        setSelectedResourceIds([]);
        setCategorySelectAll(({
            papers: false,
            images: false,
            videos: false,
            repositories: false,
            others: false,
        }));
    };

    const exitBulkDeleteMode = () => {
        setIsBulkDeleteMode(false);
        setSelectedResourceIds([]);
        setCategorySelectAll(({
            papers: false,
            images: false,
            videos: false,
            repositories: false,
            others: false,
        }));
    };

    const toggleResourceSelection = (resourceId: string) => {
        setSelectedResourceIds((prevIds) => {
            if (prevIds.includes(resourceId)) {
                return prevIds.filter((id) => id !== resourceId);
            } else {
                return [...prevIds, resourceId];
            }
        });
    };

    const handleResourceItemClick = (event: React.MouseEvent, resourceId: string, isLinkClick: boolean = false) => {
        if (isBulkDeleteMode && !isLinkClick) {
            toggleResourceSelection(resourceId);
        } else if (!isBulkDeleteMode) {
            const clickedResource = Object.values(categorizedResources)
                .flat()
                .find(r => r._id === resourceId);
            if (clickedResource && clickedResource.category === 'images') {
                openImageOptions(clickedResource);
            }
            // If not in bulk delete mode and not an image, do nothing on container click
        }
    };

    const handleLinkClick = (event: React.MouseEvent) => {
        // Prevent the container click handler from also firing when a link is clicked
        event.stopPropagation();
    };

    const handleImageClick = (resource: Resource) => {
        if (!isBulkDeleteMode) {
            openImageOptions(resource);
        } else {
            toggleResourceSelection(resource._id!);
        }
    };

    const handleConfirmBulkDelete = () => {
        if (selectedResourceIds.length > 0) {
            setIsConfirmBulkDeleteDialogOpen(true);
        } else {
            toast.info("Please select resources to delete.");
        }
    };

    const performBulkDelete = async () => {
        setIsDeletingBulk(true);
        setIsConfirmBulkDeleteDialogOpen(false);

        try {
            const deletePromises = selectedResourceIds.map(async (resourceId) => {
                const response = await fetch(`http://localhost:5000/resources/${resourceId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Failed to delete resource ${resourceId}: ${errorData.message || response.statusText}`);
                }
            });

            await Promise.all(deletePromises);
            toast.success('Selected resources deleted successfully!');
            if (selectedProjectId) {
                fetchResources(selectedProjectId);
            }
            exitBulkDeleteMode();
        } catch (error: unknown) {
            console.error("Error deleting resources:", error);
            let message = "Failed to delete some resources.";
            if (error instanceof Error) {
                message = error.message;
            }
            toast.error(`Error: ${message}`);
        } finally {
            setIsDeletingBulk(false);
        }
    };

    const confirmSingleDelete = (resourceId: string) => {
        setResourceToDelete(resourceId);
        setIsConfirmSingleDeleteDialogOpen(true);
    };

    const deleteSingleResource = async () => {
        if (!resourceToDelete) return;
        setLoading(true);
        setIsConfirmSingleDeleteDialogOpen(false);
        try {
            const response = await fetch(`http://localhost:5000/resources/${resourceToDelete}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to delete resource: ${errorData.message || response.statusText}`);
            }
            toast.success('Resource deleted successfully!');
            if (selectedProjectId) {
                fetchResources(selectedProjectId);
            }
        } catch (error: unknown) {
            console.error("Error deleting resource:", error);
            let message = "Failed to delete resource.";
            if (error instanceof Error) {
                message = error.message;
            }
            toast.error(`Error: ${message}`);
        } finally {
            setLoading(false);
            setResourceToDelete(null);
        }
    };

    const openImageOptions = (resource: Resource) => {
        setSelectedImageResource(resource);
        setIsImageOptionsDialogOpen(true);
    };

    const closeImageOptions = () => {
        setIsImageOptionsDialogOpen(false);
        setSelectedImageResource(null);
    };

    const categorizedResources = resources.reduce((acc, resource) => {
        acc[resource.category] = acc[resource.category] || [];
        acc[resource.category].push(resource);
        return acc;
    }, {} as Record<Resource['category'], Resource[]>);

    const toggleSelectAllCategory = (category: Resource['category']) => {
        const allInCategory = categorizedResources[category] || [];
        const allSelected = categorySelectAll[category];

        setCategorySelectAll((prev) => ({ ...prev, [category]: !allSelected }));

        const idsToUpdate = allInCategory.map((r) => r._id!).filter(id => id);

        setSelectedResourceIds((prevSelected) => {
            if (!allSelected) {
                // Select all
                return [...prevSelected, ...idsToUpdate.filter(id => !prevSelected.includes(id))];
            } else {
                // Deselect all
                return prevSelected.filter(id => !idsToUpdate.includes(id));
            }
        });
    };

    return (
        <div className="space-y-6">
            <style>{`
                .image-item {
                    transition: transform 0.2s ease-in-out;
                }
                .image-item:hover {
                    transform: scale(1.05);
                }
                .resource-list-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #374151; /* Optional: Add a separator */
                    cursor: pointer; /* Indicate it's clickable for selection in bulk mode */
                }
                .resource-list-item:last-child {
                    border-bottom: none;
                }
                .resource-item-content {
                    flex-grow: 1;
                    margin-right: 1rem; /* Space between text and button */
                }
                .image-grid {
                    column-width: 160px; /* Adjust this value as needed */
                    gap: 1rem;
                }
                .image-grid-item {
                    break-inside: avoid; /* Prevent breaking images across columns */
                    margin-bottom: 1rem; /* Add some vertical spacing between items */
                    position: relative;
                    border-radius: 0.25rem;
                    overflow: hidden;
                    display: inline-block; /* Important for column layout */
                    width: 100%; /* Make items take full width of the column */
                    cursor: pointer;
                }
                .image-grid-item img {
                    display: block;
                    width: 100%;
                    height: auto;
                }
                .image-item-actions {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    display: flex;
                    gap: 0.5rem;
                    z-index: 10;
                }
                .select-all-checkbox {
                    accent-color: #dc2626; /* Red color */
                }
                .select-all-checkbox:checked {
                    background-color: #dc2626; /* Red background when checked */
                }
                .select-all-checkbox:checked::before {
                    content: '';
                    display: block;
                    width: 100%;
                    height: 100%;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M20.29 4.71a1 1 0 00-1.41 0l-11.7 11.7-4.29-4.29a1 1 0 00-1.41 1.41l5 5a1 1 0 001.42 0l12.41-12.42a1 1 0 000-1.41z'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: 70%;
                }
            `}</style>
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-200">Resources</h2>
                {selectedProjectId && (
                    <div className="flex items-center space-x-2">
                        {!isBulkDeleteMode && (
                            <Button onClick={enterBulkDeleteMode} variant="destructive" size="sm">
                                <Trash className="mr-2 w-4 h-4" /> Bulk Delete
                            </Button>
                        )}
                        {!isBulkDeleteMode && (
                            <Dialog open={isAddResourceDialogOpen} onOpenChange={setIsAddResourceDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <PlusCircle className="mr-2 w-4 h-4" /> Add Resource
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                                    {/* Add Resource Dialog Content */}
                                    <DialogHeader>
                                        <DialogTitle>Add New Resource</DialogTitle>
                                        <DialogDescription>Enter the details for the new resource.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="link" className="text-right">
                                                Link
                                            </Label>
                                            <Input id="link" value={newResourceLink} onChange={(e) => setNewResourceLink(e.target.value)} className="col-span-3" />
                                        </div>
                                        {newResourceCategory === 'images' && (
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="websiteLink" className="text-right">
                                                    Website Link
                                                </Label>
                                                <Input
                                                    id="websiteLink"
                                                    value={newResourceWebsiteLink}
                                                    onChange={(e) => setNewResourceWebsiteLink(e.target.value)}
                                                    className="col-span-3"
                                                    placeholder="Optional website URL"
                                                />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-4 items-start gap-4">
                                            <Label htmlFor="description" className="text-right mt-1">
                                                Description
                                            </Label>
                                            <textarea
                                                id="description"
                                                value={newResourceDescription}
                                                onChange={(e) => setNewResourceDescription(e.target.value)}
                                                className="col-span-3 rounded-md bg-gray-800 border-gray-700 text-white p-2"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="category" className="text-right">
                                                Category
                                            </Label>
                                            <select
                                                id="category"
                                                value={newResourceCategory}
                                                onChange={(e) => {
                                                    setNewResourceCategory(e.target.value as Resource['category']);
                                                    // Clear website link when category changes from 'images'
                                                    if (e.target.value !== 'images') {
                                                        setNewResourceWebsiteLink('');
                                                    }
                                                }}
                                                className="col-span-3 rounded-md bg-gray-800 border-gray-700 text-white p-2"
                                            >
                                                <option value="papers">Papers</option>
                                                <option value="images">Images</option>
                                                <option value="videos">Videos</option>
                                                <option value="repositories">Repositories</option>
                                                <option value="others">Others</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="button" variant="secondary" onClick={() => setIsAddResourceDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="button" className="ml-2" onClick={handleAddResource}>
                                            Add
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                        {isBulkDeleteMode && (
                            <Button onClick={handleConfirmBulkDelete} variant="destructive" size="sm" disabled={selectedResourceIds.length === 0}>
                                Confirm Delete ({selectedResourceIds.length})
                            </Button>
                        )}
                        {isBulkDeleteMode && (
                            <Button onClick={exitBulkDeleteMode} variant="secondary" size="sm">
                                <XCircle className="mr-2 w-4 h-4" /> Cancel
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {loading && <div className="text-center text-gray-400">Loading resources...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}

            {!loading && !error && selectedProjectId && categoryOrder.some(cat => categorizedResources[cat]?.length > 0) ? (
                categoryOrder.map((category) => (
                    categorizedResources[category]?.length > 0 && (
                        <div key={category}>
                            <div className="flex items-center ">
                                <h3 className="text-lg font-semibold text-gray-300 pr-5 capitalize">{category}</h3>
                                {isBulkDeleteMode && category !== 'images' && categorizedResources[category]?.length > 0 && (
                                    <Checkbox
                                        className="select-all-checkbox"
                                        checked={categorySelectAll[category]}
                                        onCheckedChange={() => toggleSelectAllCategory(category as Resource['category'])}
                                    />
                                )}
                            </div>
                            {category === 'images' ? (
                                <ul className="image-grid">
                                    {categorizedResources['images']?.map((resource) => (
                                        <li key={resource._id} className="image-grid-item" onClick={() => handleImageClick(resource)}>
                                            <div className="relative">
                                                {isBulkDeleteMode && (
                                                    <Checkbox
                                                        className="absolute top-2 left-2 z-10 select-all-checkbox"
                                                        checked={selectedResourceIds.includes(resource._id!)}
                                                        onCheckedChange={() => toggleResourceSelection(resource._id!)}
                                                    />
                                                )}
                                                <img
                                                    src={resource.link}
                                                    alt={resource.description || 'Resource Image'}
                                                    className="w-full h-auto rounded-md image-item"
                                                    onError={(e) => console.error("Image load error:", e)}
                                                />
                                                {!isBulkDeleteMode && (
                                                    <div className="image-item-actions">
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => confirmSingleDelete(resource._id!)}
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className='text-white text-center pt-2 capitalize'>{resource.description}</h3>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                // <ul className="">
                                //     {categorizedResources[category as keyof typeof categorizedResources]?.map((resource) => (
                                //         <li
                                //             key={resource._id}
                                //             className={`resource-list-item relative`}
                                //             onClick={(e) => handleResourceItemClick(e, resource._id!)}
                                //         >
                                //             {isBulkDeleteMode && (
                                //                 <Checkbox
                                //                     className="absolute top-1/2 left-2 -translate-y-1/2 z-10 select-all-checkbox"
                                //                     checked={selectedResourceIds.includes(resource._id!)}
                                //                     onCheckedChange={() => toggleResourceSelection(resource._id!)}
                                //                 />
                                //             )}
                                //             <div className="resource-item-content flex-grow">
                                //                 <a
                                //                     href={resource.link}
                                //                     target="_blank"
                                //                     rel="noopener noreferrer"
                                //                     className="text-blue-500 hover:underline block"
                                //                     onClick={handleLinkClick}
                                //                 >
                                //                     View {category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}
                                //                 </a>
                                //                 {resource.description && (
                                //                     <p className="text-gray-400 text-sm">{resource.description}</p>
                                //                 )}
                                //             </div>
                                //             {!isBulkDeleteMode && (
                                //                 <Button
                                //                     variant="destructive"
                                //                     size="icon"
                                //                     onClick={() => confirmSingleDelete(resource._id!)}
                                //                     className="ml-2"
                                //                 >
                                //                     <Trash className="w-4 h-4" />
                                //                 </Button>
                                //             )}
                                //         </li>
                                //     ))}
                                // </ul>







                                <ul className="grid grid-cols-2 gap-4">
                                    {categorizedResources[category as keyof typeof categorizedResources]?.map((resource) => (
                                        <li
                                            key={resource._id}
                                            className={`resource-list-item relative p-4 rounded-md`}
                                            onClick={(e) => handleResourceItemClick(e, resource._id!)}
                                        >
                                            {isBulkDeleteMode && (
                                                <Checkbox
                                                    className="absolute top-2 right-2 z-10 select-all-checkbox"
                                                    checked={selectedResourceIds.includes(resource._id!)}
                                                    onCheckedChange={() => toggleResourceSelection(resource._id!)}
                                                />
                                            )}
                                            <div className="grid grid-cols-[1fr_1fr_min-content] items-center gap-2 w-full"> {/* Changed grid-cols */}
                                                <div className="truncate">
                                                    <a
                                                        href={resource.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline block"
                                                        onClick={handleLinkClick}
                                                    >
                                                        View {category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}
                                                    </a>
                                                </div>
                                                {resource.description && (
                                                    <div className="text-gray-400 text-sm truncate">{resource.description}</div>
                                                )}
                                                {!isBulkDeleteMode && (
                                                    <div className="justify-self-end">
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => confirmSingleDelete(resource._id!)}
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {isBulkDeleteMode && <div />} {/* Empty div to occupy space in bulk delete mode */}
                                            </div>
                                        </li>
                                    ))}
                                </ul>





                            )}
                        </div>
                    )
                ))
            ) : !loading && !error && selectedProjectId ? (
                <div className="text-center text-gray-400">No resources added for this project yet.</div>
            ) : (
                <div className="text-center text-gray-400">Please select a project to view resources.</div>
            )}

            {/* Confirm Bulk Delete Dialog */}
            <Dialog open={isConfirmBulkDeleteDialogOpen} onOpenChange={setIsConfirmBulkDeleteDialogOpen}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Confirm Bulk Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the selected {selectedResourceIds.length} resources?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsConfirmBulkDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            className="ml-2"
                            onClick={performBulkDelete}
                            disabled={isDeletingBulk}
                        >
                            {isDeletingBulk ? "Deleting..." : "Confirm Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Single Delete Dialog */}
            <Dialog open={isConfirmSingleDeleteDialogOpen} onOpenChange={setIsConfirmSingleDeleteDialogOpen}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this resource?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsConfirmSingleDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            className="ml-2"
                            onClick={deleteSingleResource}
                            disabled={loading}
                        >
                            {loading ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Image Options Dialog */}
            <Dialog open={isImageOptionsDialogOpen} onOpenChange={setIsImageOptionsDialogOpen}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Image Options</DialogTitle>
                        <DialogDescription>Choose an action for this image.</DialogDescription>
                    </DialogHeader>
                    {selectedImageResource && (
                        <div className="flex items-center pt-5 space-x-2">
                            <Button
                                onClick={() => window.open(selectedImageResource.link, '_blank')}
                                className="flex-1 hover:bg-[#29292b]"
                            >
                                View Image
                            </Button>
                            {selectedImageResource.websiteLink && (
                                <Button
                                    onClick={() => window.open(selectedImageResource.websiteLink, '_blank')}
                                    className="flex-1"
                                    variant="secondary"
                                >
                                    Visit Website
                                </Button>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end mt-4">
                        <Button type="button" variant="secondary" onClick={closeImageOptions}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default KanbanResources;