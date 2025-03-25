// Home component with required username input
import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface HomeProps {
  onStart: (username: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(false);

  const handlePlay = () => {
    if (username.trim().length === 0) {
      setError(true);
      return;
    }
    onStart(username.trim());
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-12 leading-tight">
          Sports Quiz Game ⚽ 🎾
        </h1>

        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(false);
              }}
              className={`w-full p-4 text-lg rounded-lg bg-gray-700 text-white placeholder-gray-400 
                       border-2 ${error ? 'border-red-500' : 'border-transparent'} 
                       focus:border-green-500 focus:outline-none transition-colors`}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 text-left">
                Please enter a username to continue
              </p>
            )}
          </div>

          <button
            onClick={handlePlay}
            className="w-full p-4 text-xl font-semibold rounded-lg bg-[#28a745] hover:bg-[#218838] 
                     text-white transition-colors duration-200 flex items-center justify-center gap-3"
          >
            <Play size={24} />
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
};