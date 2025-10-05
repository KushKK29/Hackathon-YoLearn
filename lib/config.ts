export const companions = [
  {
    id: 'companion-luna',
    name: 'Luna',
    roomId: 'room-luna',
    description: 'A calm and knowledgeable AI specializing in mindfulness and history.',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2593/2593651.png'
  },
  {
    id: 'companion-nova',
    name: 'Nova', 
    roomId: 'room-nova',
    description: 'A futuristic tech expert and coding assistant AI.',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/619/619032.png'
  },
  {
    id: 'companion-orion',
    name: 'Orion',
    roomId: 'room-orion', 
    description: 'An energetic and motivating fitness coach AI to guide your workouts.',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/10796/10796820.png'
  },
];

export const ZEGO_CONFIG = {
  APP_ID: 293628284,
  SERVER_SECRET: process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "7ef5ad0e5bb3b97fb13ff842d1122837",
};

