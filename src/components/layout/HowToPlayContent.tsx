// src/components/layout/HowToPlayContent.tsx
import React from 'react';

export const HowToPlayContent = () => {
  return (
    <div className="mx-auto w-full max-w-xl bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 text-left border border-gray-700/50">
      <h3 className="text-white font-semibold mb-3 text-center text-lg">How to Play SportIQ</h3>
      
      {/* Quick bullet points */}
      <div className="mb-4">
        <h4 className="text-blue-400 text-sm font-medium mb-2">Quick Guide:</h4>
        <ol className="space-y-2 list-decimal list-inside text-sm text-gray-300 marker:text-blue-400">
          <li>Enter your username and hit 'Test Your SportIQ'.</li>
          <li>Select your preferred game mode (Solo or 1v1).</li>
          <li>Choose a sports category that interests you.</li>
          <li>Answer 10 questions as quickly and accurately as possible.</li>
          <li>Earn points for correct answers & speed bonuses. Check the leaderboard!</li>
        </ol>
      </div>
      
      {/* Detailed steps from homepage */}
      <div>
        <h4 className="text-blue-400 text-sm font-medium mb-2">Detailed Instructions:</h4>
        <ol className="space-y-3 text-gray-300 text-sm">
          <li className="flex gap-3">
            <div className="bg-blue-600/30 text-blue-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <p className="font-medium text-white">Choose your game mode</p>
              <p className="text-gray-400">Play solo to practice or challenge a friend in 1v1 mode</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-600/30 text-blue-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <p className="font-medium text-white">Select a sports category</p>
              <p className="text-gray-400">Choose from football, basketball, tennis, Olympics, or mixed sports</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-600/30 text-blue-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <p className="font-medium text-white">Answer 10 questions</p>
              <p className="text-gray-400">Each correct answer is worth 10 points plus time bonuses</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-600/30 text-blue-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">4</div>
            <div>
              <p className="font-medium text-white">Compete and improve</p>
              <p className="text-gray-400">Track your stats and challenge friends to beat your score</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
};
