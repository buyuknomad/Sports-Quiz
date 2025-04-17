// In src/components/FAQPage.tsx
// Add the new FAQ item to the faqData array

const faqData = [
  // Existing FAQ items...
  {
    id: 'faq-1',
    question: "How do I play SportIQ?",
    answer: "SportIQ offers two main game modes: Solo Play and 1v1 Multiplayer. In Solo Play, you can practice at your own pace by answering sports trivia questions. In 1v1 mode, you can challenge a friend by creating a game and sharing the invite code, or join an existing game with an invite code."
  },
  // Other existing items...
  
  // New FAQ item about account creation
  {
    id: 'faq-11',
    question: "Do I need to create an account to play SportIQ?",
    answer: "No, you can play SportIQ directly without creating an account. Simply enter a username and start playing! However, creating an account offers several benefits: you can track your game history, save your statistics across sessions, compete on leaderboards, earn achievements, and have a more personalized experience. The choice is yours - play as a guest or create an account for the full experience!"
  },
  
  // Optional: New FAQ about game modes as additional context
  {
    id: 'faq-12',
    question: "What's the difference between Solo and 1v1 game modes?",
    answer: "In Solo mode, you play at your own pace with no time pressure, perfect for practicing and improving your sports knowledge. The 1v1 mode lets you challenge friends to real-time quiz battles - create a game, share the invite code, and see who has the better sports knowledge! Both modes include the same categories and scoring system, but 1v1 adds the competitive element."
  }
];

// The rest of the FAQPage component remains the same
