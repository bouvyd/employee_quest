import { Score, ScoreBoard } from '../interfaces/score';

// Function to add a new score
export function addScore(newScore: Score): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['scoreBoard'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const scoreBoard: ScoreBoard = result.scoreBoard || { scores: [], average: 0, num_scores: 0 };
      scoreBoard.scores.push(newScore);
      scoreBoard.num_scores = scoreBoard.scores.length;
      scoreBoard.average = calculateAverage(scoreBoard.scores);

      chrome.storage.local.set({ scoreBoard }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  });
}

// Function to retrieve the scoreboard
export function getScoreBoard(): Promise<ScoreBoard> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['scoreBoard'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        console.log(result.scoreBoard)
        resolve(result.scoreBoard || { scores: [], average: 0, num_scores: 0 });
      }
    });
  });
}

export function clearScoreBoard(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(['scoreBoard'], () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}
// Helper function to calculate average score
function calculateAverage(scores: Score[]): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((acc, curr) => acc + curr.score, 0);
  return parseFloat((total / scores.length).toFixed(2));
}