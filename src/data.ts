import type { Column, ColumnKey, CardItem } from './types';

export const ProjectName = 'Project Phoenix';

export const initialColumns: Column[] = [
    {
        key: 'ideas' as ColumnKey,
        title: 'Ideas',
        cards: [
            {
                id: '1',
                idea: 'Brainstorm new UI components',
                section: 'frontend',
                image: 'https://placehold.co/400x200/EEE/31343C',
                references: ['https://example.com/ui-library'],
                createdAt: new Date(Date.now() - 86400000), // 1 day ago
                postedBy: 'Alice Smith',
                description: 'Explore different UI frameworks and libraries for modern web development.',
                // videoLink: "None",
            },
            {
                id: '2',
                idea: 'Explore database optimization techniques',
                section: 'backend',
                videoLink: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                createdAt: new Date(Date.now() - 172800000), // 2 days ago
                postedBy: 'Bob Johnson',
                description: 'Investigate indexing, query optimization, and caching strategies for our database.',
                // image: "None",
                // references: ["None"],
            },
        ] as CardItem[],
    },
    {
        key: 'ongoingResearch' as ColumnKey,
        title: 'Ongoing Research',
        cards: [
            {
                id: '3',
                idea: 'Investigate GraphQL implementation',
                section: 'backend',
                references: ['https://graphql.org/'],
                createdAt: new Date(Date.now() - 259200000), // 3 days ago
                postedBy: 'Charlie Brown',
                description: 'Evaluate the benefits and drawbacks of using GraphQL versus REST for our API.',
                // image: "None",
                // videoLink: "None",
            },
        ] as CardItem[],
    },
    {
        key: 'development' as ColumnKey,
        title: 'Development',
        cards: [
            {
                id: '4',
                idea: 'Build user authentication flow',
                section: 'frontend',
                image: 'https://placehold.co/400x200/EEE/31343C',
                videoLink: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                createdAt: new Date(Date.now() - 604800000), // 1 week ago
                postedBy: 'Diana Miller',
                description: 'Implement secure user registration, login, and password recovery features.',
                // references: ["None"],
            },
            {
                id: '5',
                idea: 'Implement REST API endpoints',
                section: 'backend',
                references: ['https://restfulapi.net/'],
                createdAt: new Date(), // Today
                postedBy: 'Alice Smith',
                description: 'Design and develop the API endpoints for our core application features.',
                // image: "None",
                // videoLink: "None",
            },
            {
                id: '6',
                idea: 'Create data models',
                section: 'backend',
                createdAt: new Date(), // Today
                postedBy: 'Bob Johnson',
                description: 'Define the structure of our data using appropriate models and schemas.',
                // image: "None",
                // videoLink: "None",
                // references: ["None"],
            }
        ] as CardItem[],
    },
    {
        key: 'integration' as ColumnKey,
        title: 'Integration',
        cards: [
            {
                id: '7',
                idea: 'Integrate payment gateway',
                section: 'backend',
                references: ['https://stripe.com/docs'],
                createdAt: new Date(), // Today
                postedBy: 'Charlie Brown',
                description: 'Set up the payment gateway to process transactions securely.',
                // image: "None",
                // videoLink: "None",
            },
        ] as CardItem[],
    },
    {
        key: 'completed' as ColumnKey,
        title: 'Completed',
        cards: [
            {
                id: '8',
                idea: 'Design landing page',
                section: 'frontend',
                image: 'https://placehold.co/400x200/EEE/31343C',
                createdAt: new Date(Date.now() - 2592000000), // 1 month ago
                postedBy: 'Diana Miller',
                description: 'Create the visual design and layout for the main landing page.',
                // videoLink: "None",
                // references: ["None"],
            },
        ] as CardItem[],
    },
];

export const teamMembers = [
    { name: 'Alice Smith', avatarUrl: 'https://placehold.co/100x100/80ED99/000000' },
    { name: 'Bob Johnson', avatarUrl: 'https://placehold.co/100x100/FFC85E/000000' },
    { name: 'Charlie Brown', avatarUrl: 'https://placehold.co/100x100/FF8AAE/000000' },
    { name: 'Diana Miller', avatarUrl: 'https://placehold.co/100x100/469990/000000' },
];


// NEW: Dummy project data
export const projects = [
    { id: 'phoenix', name: 'Project Phoenix' },
    { id: 'alpha', name: 'Project Alpha' },
    { id: 'beta', name: 'Project Beta' },
];