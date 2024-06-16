export type GitRollResult = {
  imageUrl: string;
  devType: string;
  overallScore: number;
  overallScoreCDF: number;
  overallRatingLetter: string;
  isContributor: boolean;
  scores: scoreList;
  regionRank: rank;
  schoolRank: rank;
};

export const UNKNOWN_RESULT: GitRollResult = {
  imageUrl: "",
  devType: "Unknown",
  overallScore: 0,
  overallScoreCDF: 0,
  overallRatingLetter: "E",
  isContributor: false,
  scores: {
    reliability: 0,
    security: 0,
    maintainability: 0
  },
  regionRank: {
    percentile: 100,
    location: "Unknown"
  },
  schoolRank: {
    percentile: 100,
    location: "Unknown"
  }
};

export type rank = {
  percentile: number;
  location: string;
};

export type scoreList = {
  reliability: number;
  security: number;
  maintainability: number;
};

export type userScan = {
  id: string;
  path: string;
  existing: boolean;
  profileId: string;
};
