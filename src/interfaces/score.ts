export interface Score {
    score: number;
    date: string;
    description: string;
}

export interface ScoreBoard {
    scores: Score[];
    average: number;
    num_scores: number;
}