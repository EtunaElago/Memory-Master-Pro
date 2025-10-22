// Fisher-Yates shuffle algorithm
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Create cards for the game
export const createCards = (difficulty) => {
  let pairs;
  
  switch (difficulty) {
    case 'easy':
      pairs = 8;
      break;
    case 'medium':
      pairs = 12;
      break;
    case 'hard':
      pairs = 16;
      break;
    default:
      pairs = 8;
  }

  const symbols = ['🍎', '🍌', '🍒', '🍇', '🍊', '🍓', '🍑', '🥭', '🍍', '🥝', '🍉', '🍐', '🫐', '🍋', '🥥', '🥑'];
  const selectedSymbols = symbols.slice(0, pairs);
  
  const cards = [];
  selectedSymbols.forEach((symbol, index) => {
    cards.push(
      { id: index * 2, value: symbol, flipped: false, matched: false },
      { id: index * 2 + 1, value: symbol, flipped: false, matched: false }
    );
  });
  
  return shuffleArray(cards);
};

// Check if two cards match
export const checkMatch = (card1, card2) => {
  return card1.value === card2.value;
};

// Check if all cards are matched (win condition)
export const checkWinCondition = (cards) => {
  return cards.every(card => card.matched);
};

// Calculate efficiency score
export const calculateEfficiency = (moves, pairs) => {
  const perfectMoves = pairs * 2;
  const efficiency = Math.max(0, 100 - ((moves - perfectMoves) / perfectMoves * 100));
  return Math.round(efficiency);
};