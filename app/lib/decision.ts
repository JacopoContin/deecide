export type Score = {
  optionIndex: number;
  criterionIndex: number;
  score: number;
};

export type Weight = {
  criterionIndex: number;
  weight: number;
};

export type ScoreLevel = {
  value: number;
  label: string;
  description: string;
  color: "red" | "gray" | "green" | "grass";
};

// How well an option performs on a criterion
export const SCORE_SCALE: ScoreLevel[] = [
  { value: -1, label: "Detrimental", description: "Works against this criterion", color: "red" },
  { value: 0, label: "Neutral", description: "No real impact either way", color: "gray" },
  { value: 1, label: "Positive", description: "Helps with this criterion", color: "green" },
  { value: 2, label: "Very positive", description: "Excels at this criterion", color: "grass" },
];

export const MIN_SCORE = -1;
export const MAX_SCORE = 2;

// How much a criterion matters
export const MIN_WEIGHT = 1;
export const MAX_WEIGHT = 5;
export const DEFAULT_WEIGHT = 3;

export const getScoreLevel = (score: number | undefined) =>
  SCORE_SCALE.find((level) => level.value === score);

export const formatSigned = (value: number) => (value > 0 ? `+${value}` : `${value}`);
