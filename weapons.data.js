module.exports = {
  AK47: {
    fireRate: 600,        // RPM
    damage: 30,
    headMult: 4,
    recoilPattern: [
      {x: 0, y: 0},
      {x: 0.1, y: 0.2},
      {x: -0.1, y: 0.4},
      {x: 0.2, y: 0.6},
      {x: -0.2, y: 0.8}
    ]
  },

  M4: {
    fireRate: 750,
    damage: 24,
    headMult: 3.5,
    recoilPattern: [
      {x: 0, y: 0},
      {x: 0.05, y: 0.15},
      {x: -0.05, y: 0.3}
    ]
  }
};