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
    const [newResourceCategory, setNewResourceCategory] = useState<'papers' | 'images' | 'videos' | 'repositories' | 'others'>('others');
    const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
    const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
    const [isDeletingBulk, setIsDeletingBulk] = useState(false);
    const [isConfirmBulkDeleteDialogOpen, setIsConfirmBulkDeleteDialogOpen] = useState(false);
    const [isConfirmSingleDeleteDialogOpen, setIsConfirmSingleDeleteDialogOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

    const categoryOrder: Resource['category'][] = ['papers', 'repositories', 'images', 'videos', 'others'];

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

        try {
            const response = await fetch('http://localhost:5000/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: selectedProjectId,
                    category: newResourceCategory,
                    link: newResourceLink,
                    description: newResourceDescription,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add resource.');
            }
            setNewResourceLink('');
            setNewResourceDescription('');
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
    };

    const exitBulkDeleteMode = () => {
        setIsBulkDeleteMode(false);
        setSelectedResourceIds([]);
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

    const categorizedResources = resources.reduce((acc, resource) => {
        acc[resource.category] = acc[resource.category] || [];
        acc[resource.category].push(resource);
        return acc;
    }, {} as Record<Resource['category'], Resource[]>);

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
                    border: 1px solid #374151;
                    border-radius: 0.25rem;
                    overflow: hidden;
                    display: inline-block; /* Important for column layout */
                    width: 100%; /* Make items take full width of the column */
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
                                                onChange={(e) => setNewResourceCategory(e.target.value as Resource['category'])}
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
                            <h3 className="text-lg font-semibold text-gray-300 capitalize">{category}</h3>
                            {category === 'videos' ? (
                                <ul className="grid grid-cols-2 gap-4">
                                    {categorizedResources['videos']?.map((resource) => (
                                        <li key={resource._id} className="relative border rounded-md p-2 border-gray-700">
                                            {isBulkDeleteMode && (
                                                <Checkbox
                                                    checked={selectedResourceIds.includes(resource._id!)}
                                                    onCheckedChange={() => toggleResourceSelection(resource._id!)}
                                                    className="absolute top-2 left-2 z-10"
                                                />
                                            )}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="resource-item-content">
                                                    <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block">
                                                        View Video
                                                    </a>
                                                    {resource.description && (
                                                        <p className="text-gray-400 text-sm">{resource.description}</p>
                                                    )}
                                                </div>
                                                {!isBulkDeleteMode && (
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => confirmSingleDelete(resource._id!)}
                                                        className="ml-2"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : category === 'images' ? (
                                <ul className="image-grid">
                                    {categorizedResources['images']?.map((resource) => (
                                        <li key={resource._id} className="image-grid-item">
                                            <div className="relative">
                                                {isBulkDeleteMode && (
                                                    <Checkbox
                                                        checked={selectedResourceIds.includes(resource._id!)}
                                                        onCheckedChange={() => toggleResourceSelection(resource._id!)}
                                                        className="absolute top-2 left-2 z-10"
                                                    />
                                                )}
                                                <a href={resource.link} target="_blank" rel="noopener noreferrer" className="block">
                                                    <img
                                                        src={resource.link}
                                                        alt={resource.description || 'Resource Image'}
                                                        className="w-full h-auto rounded-md image-item"
                                                        onError={(e) => console.error("Image load error:", e)}
                                                    />
                                                </a>
                                                <div className="p-2">
                                                    {resource.description && (
                                                        <p className="text-gray-400 text-sm mb-2">{resource.description}</p>
                                                    )}
                                                    <Button
                                                        asChild
                                                        variant="secondary"

                                                        size="sm"
                                                        className="mt-2 block w-full text-center"
                                                    >
                                                        {/* <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-xs">
                                                            Open in New Tab
                                                        </a> */}
                                                    </Button>
                                                </div>
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
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <ul className="">
                                    {categorizedResources[category as keyof typeof categorizedResources]?.map((resource) => (
                                        <li key={resource._id} className={`resource-list-item relative ${isBulkDeleteMode ? '' : 'flex'}`}>
                                            {isBulkDeleteMode && (
                                                <Checkbox
                                                    checked={selectedResourceIds.includes(resource._id!)}
                                                    onCheckedChange={() => toggleResourceSelection(resource._id!)}
                                                    className="absolute top-1/2 left-2 -translate-y-1/2 z-10"
                                                />
                                            )}
                                            <div className="resource-item-content">
                                                <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                    {resource.description || resource.link}
                                                </a>
                                                {resource.description && (
                                                    <p className="text-gray-400 text-sm">{resource.description}</p>
                                                )}
                                            </div>
                                            {!isBulkDeleteMode && (
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => confirmSingleDelete(resource._id!)}
                                                    className="ml-2"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            )}
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
        </div>
    );
};

export default KanbanResources;