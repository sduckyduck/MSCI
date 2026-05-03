// First-pass MSCI balance multipliers based on the 2026-05-03 100,000-run simulation.
// Baseline problem: magician and cleric were both about 52%, while pirate was about 0.10% in China mode.

export const msciBalanceMultipliers = {
  first: {
    magician: 0.82,
    warrior: 0.96,
    thief: 0.97,
    archer: 1.1,
    pirate: 1.5,
  },
  second: {
    cleric: 0.32,
    crossbowman: 0.85,
    bandit: 0.88,
    page: 0.9,
    assassin: 0.95,
    spearman: 1,
    fighter: 1.21,
    brawler: 1.24,
    gunslinger: 1.31,
    hunter: 2.28,
    firePoison: 2.82,
    iceLightning: 3.75,
  },
};
