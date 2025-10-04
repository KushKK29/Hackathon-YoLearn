'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// Using Tailwind CSS instead of CSS modules
console.log('app page');
// Mock companion data
const mockCompanions = [
  { 
    id: 'companion-1-luna', 
    name: 'Luna', 
    roomId: 'room-luna-001', 
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2593/2593651.png', 
    description: 'A calm and knowledgeable AI specializing in mindfulness and history.' 
  },
  { 
    id: 'companion-2-rex', 
    name: 'Rex', 
    roomId: 'room-rex-002', 
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/10796/10796820.png', 
    description: 'An energetic and motivating fitness coach AI to guide your workouts.' 
  },
  { 
    id: 'companion-3-nova', 
    name: 'Nova', 
    roomId: 'room-nova-003', 
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/619/619032.png', 
    description: 'A futuristic tech expert and coding assistant AI.' 
  },
];


export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const handleStartSession = (companionId: string) => {
    if (!userName.trim()) {
      alert('Please enter your name!');
      return;
    }
  
    localStorage.setItem('userName', userName.trim());
    localStorage.setItem('selectedCompanion', companionId); // Store selected companion
  
    const companion = mockCompanions.find(c => c.id === companionId);
    if (!companion) return;
  
    // Redirect to call page with companion's fixed room
    router.push(`/call/${companion.roomId}`);
  };
  

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-start p-8 font-sans">
      <div className="max-w-6xl w-full text-center">
        <h1 className="text-5xl font-bold text-white mb-4">AI Companion Dashboard</h1>
        <p className="text-xl text-gray-300 mb-8">Enter your name and select a companion to start your session.</p>

        <input
          type="text"
          placeholder="Enter your name..."
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="px-4 py-3 w-full max-w-md text-lg rounded-lg border-0 mb-8 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockCompanions.map((companion) => (
            <div key={companion.id} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-white text-center transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-black hover:shadow-opacity-50">
              <Image 
                src={companion.imageUrl} 
                alt={companion.name} 
                width={80}
                height={80}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover bg-gray-200" 
              />
              <h2 className="text-2xl font-semibold mb-2">{companion.name}</h2>
              <p className="text-gray-300 mb-6 flex-grow">{companion.description}</p>
              <button
                onClick={() => handleStartSession(companion.id)}
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-500 focus:ring-opacity-50"
              >
                Start Session
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
