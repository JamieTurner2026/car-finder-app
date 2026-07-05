const QUOTES = [
  "The journey of a thousand miles begins with the right set of wheels.",
  "Every great road trip starts with a single search.",
  "Your next car is out there — let's go find it.",
  "Drive your ambition. Find your ride.",
  "Good things come to those who keep searching.",
  "The best view comes after the hardest search.",
  "Patience finds the perfect deal.",
  "Adventure is calling — answer it on four wheels.",
];

export function randomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
