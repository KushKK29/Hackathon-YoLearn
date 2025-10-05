'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Enhanced companion data with study focus
const studyCompanions = [
  { 
    id: 'companion-1-luna', 
    name: 'Luna', 
    roomId: 'room-luna-001', 
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2593/2593651.png', 
    subject: 'Mindfulness & History',
    description: 'A calm and knowledgeable AI specializing in mindfulness and history.',
    color: 'from-purple-500 to-pink-500',
    icon: '🧘‍♀️',
    features: ['Meditation Guidance', 'Historical Context', 'Mindful Learning', 'Peace Studies']
  },
  { 
    id: 'companion-2-rex', 
    name: 'Rex', 
    roomId: 'room-rex-002', 
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/10796/10796820.png', 
    subject: 'Science & Health',
    description: 'An energetic and motivating fitness coach AI to guide your workouts.',
    color: 'from-green-500 to-blue-500',
    icon: '💪',
    features: ['Biology Concepts', 'Health Science', 'Fitness Theory', 'Nutrition']
  },
  { 
    id: 'companion-3-nova', 
    name: 'Nova', 
    roomId: 'room-nova-003', 
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/619/619032.png', 
    subject: 'Technology & Programming',
    description: 'A futuristic tech expert and coding assistant AI.',
    color: 'from-cyan-500 to-blue-500',
    icon: '💻',
    features: ['Coding Help', 'Tech Concepts', 'AI & ML', 'Web Development']
  },
];


export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const handleStartSession = (companionId: string) => {
    if (!userName.trim()) {
      alert('Please enter your name to start your study session!');
      return;
    }
  
    localStorage.setItem('userName', userName.trim());
    localStorage.setItem('selectedCompanion', companionId);
  
    const companion = studyCompanions.find(c => c.id === companionId);
    if (!companion) return;
  
    // Redirect to call page with companion's fixed room
    router.push(`/call/${companion.roomId}`);
  };
  

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-start p-4 md:p-8 font-sans">
      {/* Header Section */}
      <div className="max-w-7xl w-full text-center mb-12">
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-6">
            AI Study Companions
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Learn with personalized AI tutors that speak, listen, and guide you
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Voice Interaction
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              AI Avatars
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              Study Focused
            </span>
          </div>
        </div>

        {/* Name Input */}
        <div className="max-w-md mx-auto mb-12">
          <label className="block text-lg font-semibold text-white mb-4">
            What&apos;s your name?
          </label>
          <input
            type="text"
            placeholder="Enter your name to start learning..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-6 py-4 text-lg rounded-2xl border-0 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300"
          />
        </div>
      </div>

      {/* Companions Grid */}
      <div className="max-w-7xl w-full">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Choose Your Study Companion
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {studyCompanions.map((companion) => (
            <div 
              key={companion.id} 
              className="group bg-white/5 backdrop-blur-sm rounded-3xl p-8 text-white transition-all duration-500 hover:transform hover:-translate-y-4 hover:shadow-2xl hover:shadow-purple-500/25 border border-white/10 hover:border-white/20"
            >
              {/* Companion Header */}
              <div className="text-center mb-6">
                <div className="relative mb-4">
                  <div className={`w-24 h-24 rounded-full mx-auto bg-gradient-to-r ${companion.color} p-1`}>
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-4xl">
                      {companion.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                    AI
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{companion.name}</h3>
                <p className={`text-sm font-semibold bg-gradient-to-r ${companion.color} bg-clip-text text-transparent`}>
                  {companion.subject}
                </p>
              </div>

              {/* Description */}
              <p className="text-gray-300 mb-6 text-center leading-relaxed">
                {companion.description}
              </p>

              {/* Features */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                  Specializes In
                </h4>
                <div className="flex flex-wrap gap-2">
                  {companion.features.map((feature, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-gray-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleStartSession(companion.id)}
                className={`w-full bg-gradient-to-r ${companion.color} hover:shadow-lg hover:shadow-purple-500/25 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50 group-hover:shadow-xl`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>Start Learning</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-16 text-center text-gray-400">
        <p className="text-sm">
          Powered by AI • Voice Recognition • Real-time Avatars • Study Focused
        </p>
      </div>
    </main>
  );
}
