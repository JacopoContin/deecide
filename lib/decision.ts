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
  tone: "negative" | "neutral" | "positive";
};

// How well an option performs on a criterion
export const SCORE_SCALE: ScoreLevel[] = [
  { value: -1, label: "Detrimental", description: "Works against this criterion", tone: "negative" },
  { value: 0, label: "Neutral", description: "No real impact either way", tone: "neutral" },
  { value: 1, label: "Positive", description: "Helps with this criterion", tone: "positive" },
  { value: 2, label: "Very positive", description: "Excels at this criterion", tone: "positive" },
];

export const MIN_SCORE = -1;
export const MAX_SCORE = 2;

// How much a criterion matters
export const MIN_WEIGHT = 1;
export const MAX_WEIGHT = 5;
export const DEFAULT_WEIGHT = 3;

export type WeightLevel = {
  value: number;
  label: string;
  description: string;
};

export const WEIGHT_SCALE: WeightLevel[] = [
  { value: 1, label: "Not", description: "Not important" },
  { value: 2, label: "Low", description: "Slightly important" },
  { value: 3, label: "Medium", description: "Moderately important" },
  { value: 4, label: "High", description: "Very important" },
  { value: 5, label: "Critical", description: "Extremely important" },
];

export const getScoreLevel = (score: number | undefined) =>
  SCORE_SCALE.find((level) => level.value === score);

export const formatSigned = (value: number) => (value > 0 ? `+${value}` : `${value}`);
