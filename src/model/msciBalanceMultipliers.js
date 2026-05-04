// MSCI balance multipliers based on repeated 100,000-run simulations.
// Third pass: tune second jobs by their own first-job group, not by a flat 12-job target.

export const msciBalanceMultipliers = {
  first: {
    magician: 0.82,
    warrior: 0.96,
    thief: 0.97,
    archer: 1.1,
    pirate: 1.5,
  },
  second: {
    // Warrior group target: fighter/page/spearman should split the warrior pool more evenly.
    fighter: 1.09,
    page: 0.97,
    spearman: 1.11,

    // Magician group target: avoid cleric dominance while keeping ice/fire/cleric all viable.
    iceLightning: 3.18,
    firePoison: 3.37,
    cleric: 0.35,

    // Thief group target: assassin and bandit should stay close.
    assassin: 0.96,
    bandit: 0.88,

    // Archer group target: hunter and crossbowman should split the archer pool.
    hunter: 2.18,
    crossbowman: 0.9,

    // Pirate group target: brawler and gunslinger should split the pirate pool.
    brawler: 1.2,
    gunslinger: 1.37,
  },
};
