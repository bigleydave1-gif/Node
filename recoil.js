const recoilState = {};

function getRecoil(shooterId, weapon, shotIndex) {

  const pattern = weapon.recoilPattern;

  const step = shotIndex % pattern.length;

  const r = pattern[step];

  return {
    x: r.x,
    y: r.y
  };
}

module.exports = { getRecoil };