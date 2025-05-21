export interface CardItem {
    id: string;
    idea: string;
    section: 'frontend' | 'backend';
    image?: string;
    videoLink?: string;
    references?: string[];
    createdAt: Date;
    postedBy: string;
    description?: string;
}

export type ColumnKey = 'ideas' | 'ongoingResearch' | 'development' | 'integration' | 'completed';

export interface Column {
    key: ColumnKey;
    title: string;
    cards: CardItem[];
}

export interface User {
    name: string;
    avatarUrl: string;
}