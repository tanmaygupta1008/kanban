import React, { useState, useCallback, useContext, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
// import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import type { ColumnKey, CardItem, Column } from '../../types';
import { AuthContext } from '../../context/AuthContext';

interface ProjectDetails {
    _id: string;
    name: string;
    description?: string;
    teamMembers?: Array<{ userId: string; name: string; avatarUrl?: string }>;
    createdAt: string;
}

interface KanbanBoardProps {
    selectedProjectId: string | null;
    currentProjectDetails?: ProjectDetails | null;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ selectedProjectId }) => {
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useContext(AuthContext);

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
        if (selectedProjectId) {
            fetchKanbanData(selectedProjectId);
        } else {
            setColumns([]);
            setLoading(false);
            setError(null);
        }
    }, [selectedProjectId, fetchKanbanData]);

    const handleCardMove = useCallback(
        async (cardId: string, newColumnKey: ColumnKey, oldColumnKey: ColumnKey) => {
            if (!selectedProjectId) return;

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
                            projectId: selectedProjectId,
                        }),
                    });

                    if (!response.ok) {
                        await fetchKanbanData(selectedProjectId);
                        throw new Error('Failed to move card on backend.');
                    }
                } catch (err: unknown) {
                    console.error("Error moving card:", err);
                    if (err instanceof Error) {
                        setError(err.message || 'Failed to move card.');
                    } else {
                        setError('Failed to move card.');
                    }
                    await fetchKanbanData(selectedProjectId);
                }
            }
        },
        [columns, selectedProjectId, fetchKanbanData]
    );

    const handleCardAdd = useCallback(
        async (columnKey: ColumnKey, newCard: Omit<CardItem, 'id' | 'createdAt' | 'postedBy'>) => {
            if (!selectedProjectId || !user) {
                console.error("No project selected or user not logged in to add cards.");
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
                        projectId: selectedProjectId,
                        postedBy: user.name,
                        postedById: user.id,
                    }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to add card.');
                }
                await fetchKanbanData(selectedProjectId);
            } catch (err: unknown) {
                console.error("Error adding card:", err);
                if (err instanceof Error) {
                    setError(err.message || 'Failed to add card.');
                } else {
                    setError('Failed to add card.');
                }
            }
        },
        [selectedProjectId, user, fetchKanbanData]
    );

    // const currentTeamMembers = currentProjectDetails?.teamMembers || [];

    return (
        <div className="space-y-8">
            {/* <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {currentProjectDetails?.name || "Kanban Board"}
                </h1>
            </div> */}

            {/* <div className="text-center space-y-4">
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
            </div> */}

            {loading && <div className="text-center text-gray-400">Loading project data...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}

            {!loading && !error && selectedProjectId && (
                <div className="flex overflow-x-auto gap-3 w-full">
                    {columns.map((column) => (
                        <KanbanColumn
                            key={column.key}
                            column={column}
                            onCardMove={handleCardMove}
                            onCardAdd={handleCardAdd}
                            projectId={selectedProjectId}
                        />
                    ))}
                </div>
            )}
            {!selectedProjectId && !loading && !error && (
                <div className="text-center text-gray-400">Please select a project to view the Kanban Board.</div>
            )}
        </div>
    );
};

export default KanbanBoard;




