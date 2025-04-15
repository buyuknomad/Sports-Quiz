// src/components/layout/HowToPlayContent.tsx
import React from 'react';

export const HowToPlayContent = () => {
  return (
    <div className="mx-auto w-full max-w-xl bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 text-left border border-gray-700/50">
      <h3 className="text-white font-semibold mb-3 text-center text-lg">Quick Guide</h3>
      <ol className="space-y-2 list-decimal list-inside text-sm text-gray-300 marker:text-blue-400">
        <li>Enter your username and hit 'Test Your SportIQ'.</li>
        <li>Select your preferred game mode (Solo or 1v1).</li>
        <li>Choose a sports category that interests you.</li>
        <li>Answer 10 questions as quickly and accurately as possible.</li>
        <li>Earn points for correct answers & speed bonuses. Check the leaderboard!</li>
      </ol>
    </div>
  );
};