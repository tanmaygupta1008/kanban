import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { toast } from 'react-toastify';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";

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

    const fetchResources = useCallback(async (projectId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/projects/${projectId}/resources`);
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

    const categorizedResources = resources.reduce((acc, resource) => {
        acc[resource.category] = acc[resource.category] || [];
        acc[resource.category].push(resource);
        return acc;
    }, {} as Record<Resource['category'], Resource[]>);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-200">Resources</h2>
                {selectedProjectId && (
                    <Dialog open={isAddResourceDialogOpen} onOpenChange={setIsAddResourceDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
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
            </div>

            {loading && <div className="text-center text-gray-400">Loading resources...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}

            {!loading && !error && selectedProjectId && Object.keys(categorizedResources).length > 0 ? (
                Object.keys(categorizedResources).map((category) => (
                    <div key={category}>
                        <h3 className="text-lg font-semibold text-gray-300 capitalize">{category}</h3>
                        <ul>
                            {categorizedResources[category as keyof typeof categorizedResources]?.map((resource) => (
                                <li key={resource._id} className="py-2">
                                    {resource.category === 'images' ? (
                                        <img src={resource.link} alt={resource.description || 'Resource Image'} className="max-w-full h-auto rounded-md" />
                                    ) : resource.category === 'videos' ? (
                                        <iframe
                                            width="560"
                                            height="315"
                                            src={resource.link}
                                            title={resource.description || 'Resource Video'}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            className="rounded-md"
                                        ></iframe>
                                    ) : (
                                        <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                            {resource.description || resource.link}
                                        </a>
                                    )}
                                    {resource.description && resource.category !== 'images' && resource.category !== 'videos' && (
                                        <p className="text-gray-400 text-sm">{resource.description}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : !loading && !error && selectedProjectId ? (
                <div className="text-center text-gray-400">No resources added for this project yet.</div>
            ) : (
                <div className="text-center text-gray-400">Please select a project to view resources.</div>
            )}
        </div>
    );
};

export default KanbanResources;