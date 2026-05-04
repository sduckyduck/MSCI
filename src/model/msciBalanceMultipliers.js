// MSCI balance multipliers based on repeated 100,000-run simulations.
// Goal: keep first-job results roughly even and make second-job results balanced within each first-job group.

export const msciBalanceMultipliers = {
  first: {
    magician: 0.82,
    warrior: 0.96,
    thief: 0.97,
    archer: 1.1,
    pirate: 1.5,
  },
  second: {
    // Warrior group
    fighter: 0.86,
    page: 1.13,
    spearman: 1.28,

    // Magician group
    iceLightning: 2.6,
    firePoison: 4.05,
    cleric: 0.37,

    // Thief group
    assassin: 0.98,
    bandit: 0.86,

    // Archer group
    hunter: 1.95,
    crossbowman: 1.03,

    // Pirate group
    brawler: 1.1,
    gunslinger: 1.52,
  },
};
