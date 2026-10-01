export const DECKS = [
  {
    id: 'znmd',
    name: "Zindagi Na Milegi Dobara",
    description: "Self-Discovery & Freedom. Examines existential dread, career pressure, and hidden desires.",
    baselines: ['Road', 'Sky', 'Camera', 'Clock', 'Luggage', 'Shoe', 'Water', 'Glass', 'Paper', 'Bread', 'Chair', 'Pencil'],
    triggers: [
      { word: 'Success', domain: 'Career/Pressure' },
      { word: 'Money', domain: 'Career/Pressure' },
      { word: 'Boundary', domain: 'Career/Pressure' },
      { word: 'Desk', domain: 'Career/Pressure' },
      { word: 'Trap', domain: 'Career/Pressure' },
      { word: 'Compromise', domain: 'Relationships' },
      { word: 'Forgive', domain: 'Relationships' },
      { word: 'Secret', domain: 'Relationships' },
      { word: 'Wedding', domain: 'Relationships' },
      { word: 'Father', domain: 'Relationships' },
      { word: 'Fear', domain: 'Inner Self' },
      { word: 'Freedom', domain: 'Inner Self' },
      { word: 'Regret', domain: 'Inner Self' },
      { word: 'Mirror', domain: 'Inner Self' },
      { word: 'Tomorrow', domain: 'Inner Self' }
    ]
  },
  {
    id: 'jungian',
    name: "The Jungian Shadow",
    description: "Deep Psychological Triggers. Detects core emotional complexes and hidden vulnerabilities.",
    baselines: ['Table', 'Window', 'Tree', 'Book', 'Spoon', 'Stone', 'Cloud', 'Carpet', 'Lamp', 'Shirt', 'Apple', 'Door'],
    triggers: [
      { word: 'Inadequate', domain: 'Vulnerability' },
      { word: 'Naked', domain: 'Vulnerability' },
      { word: 'Shame', domain: 'Vulnerability' },
      { word: 'Cry', domain: 'Vulnerability' },
      { word: 'Hide', domain: 'Vulnerability' },
      { word: 'Blood', domain: 'Conflict/Anger' },
      { word: 'Strike', domain: 'Conflict/Anger' },
      { word: 'Knife', domain: 'Conflict/Anger' },
      { word: 'Unjust', domain: 'Conflict/Anger' },
      { word: 'Hate', domain: 'Conflict/Anger' },
      { word: 'Control', domain: 'Ego/Power' },
      { word: 'Failure', domain: 'Ego/Power' },
      { word: 'Pride', domain: 'Ego/Power' },
      { word: 'Weak', domain: 'Ego/Power' },
      { word: 'Judgement', domain: 'Ego/Power' }
    ]
  },
  {
    id: 'anxiety',
    name: "Modern Anxiety & Grind",
    description: "Burnout & Isolation. Targets young adults dealing with routine, social media, and modern life.",
    baselines: ['Coffee', 'Screen', 'Keypad', 'Train', 'Rain', 'Bus', 'Ticket', 'Street', 'Music', 'Store', 'Pen', 'Wallet'],
    triggers: [
      { word: 'Exhausted', domain: 'Burnout' },
      { word: 'Deadline', domain: 'Burnout' },
      { word: 'Sleep', domain: 'Burnout' },
      { word: 'Endless', domain: 'Burnout' },
      { word: 'Routine', domain: 'Burnout' },
      { word: 'Alone', domain: 'Isolation' },
      { word: 'Unseen', domain: 'Isolation' },
      { word: 'Notification', domain: 'Isolation' },
      { word: 'Mask', domain: 'Isolation' },
      { word: 'Crowd', domain: 'Isolation' },
      { word: 'Lost', domain: 'Future Panic' },
      { word: 'Stability', domain: 'Future Panic' },
      { word: 'Growth', domain: 'Future Panic' },
      { word: 'Age', domain: 'Future Panic' },
      { word: 'Illusion', domain: 'Future Panic' }
    ]
  },
  {
    id: 'childhood',
    name: "Childhood & Nostalgia",
    description: "Core Memories & Family. Unlocks early emotional coding and formative dynamics.",
    baselines: ['Grass', 'Bicycle', 'Toy', 'Milk', 'Blanket', 'Sand', 'Swing', 'Crayon', 'Juice', 'Cookie', 'Cartoon', 'Soap'],
    triggers: [
      { word: 'Home', domain: 'Safety' },
      { word: 'Dark', domain: 'Safety' },
      { word: 'Monster', domain: 'Safety' },
      { word: 'Safe', domain: 'Safety' },
      { word: 'Locked', domain: 'Safety' },
      { word: 'Mother', domain: 'Family Dynamics' },
      { word: 'Brother', domain: 'Family Dynamics' },
      { word: 'Dinner', domain: 'Family Dynamics' },
      { word: 'Tears', domain: 'Family Dynamics' },
      { word: 'Scold', domain: 'Family Dynamics' },
      { word: 'Grown', domain: 'Loss of Innocence' },
      { word: 'Forgotten', domain: 'Loss of Innocence' },
      { word: 'Playground', domain: 'Loss of Innocence' },
      { word: 'Promise', domain: 'Loss of Innocence' },
      { word: 'Hurt', domain: 'Loss of Innocence' }
    ]
  }
];

export const generateSequence = (deckId) => {
  const deck = DECKS.find(d => d.id === deckId);
  if (!deck) return [];

  // Pick 5 random triggers to keep the test concise but impactful
  const shuffledTriggers = [...deck.triggers].sort(() => 0.5 - Math.random()).slice(0, 5);
  
  const sequence = [];
  let baselinePool = [...deck.baselines].sort(() => 0.5 - Math.random());
  
  const getBaseline = () => {
    if (baselinePool.length === 0) {
       baselinePool = [...deck.baselines].sort(() => 0.5 - Math.random());
    }
    return { word: baselinePool.pop(), domain: 'Baseline', isTrigger: false };
  };

  // Weave them: Baseline -> Baseline -> Trigger
  for (let trigger of shuffledTriggers) {
    sequence.push(getBaseline());
    sequence.push(getBaseline());
    sequence.push({ ...trigger, isTrigger: true });
  }

  return sequence;
};
