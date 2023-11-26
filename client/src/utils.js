export const setMatchSurfacePath = (surface) => {
  switch (surface) {
    case "Grass":
      return "/src/assets/imgs/grass-tennis-court.png";
    case "Clay":
      return "/src/assets/imgs/clay-tennis-court.png";
    case "Hard":
      return "/src/assets/imgs/hard-tennis-court.png";
    case "Carpet":
      return "/src/assets/imgs/carpet-tennis-court.png";
    default:
      return "/src/assets/imgs/carpet-tennis-court.png";
  }
};

export const defineRound = (round) => {
  switch (round) {
    case "R32":
      return "Round of 32";
    case "R16":
      return "Round of 16";
    case "QF":
      return "Quarter-final";
    case "SF":
      return "Semi-final";
    case "F":
      return "Final";
    case "R64":
      return "Round of 64";
    case "CR":
      return "Consolation Round";
    case "PR":
      return "Play-off Round";
    case "R128":
      return "Round of 128";
    case "RR":
      return "Round Robin";
    case "BR":
      return "Bronze Medal Match";
    case "ER":
      return "Early Rounds";
    case "Q1":
    case "Q2":
    case "Q3":
    case "Q4":
      return "Qualifying Round";
    default:
      return "Match";
  }
};
