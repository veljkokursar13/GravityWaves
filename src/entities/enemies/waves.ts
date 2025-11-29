export const WAVES = [
    { id: 1, baseSpeed: 2, hpMultiplier: 1, enemies: [
      { kind: "drone", pattern: "zigzag", count: 10 }
    ]},
  
    { id: 2, baseSpeed: 2, hpMultiplier: 1, enemies: [
      { kind: "drone", pattern: "sCurve", count: 12 }
    ]},
  
    { id: 3, baseSpeed: 2, hpMultiplier: 1, enemies: [
      { kind: "drone", pattern: "vFormation", count: 10 }
    ]},
    { id: 4, baseSpeed: 2.4, hpMultiplier: 1.3, enemies: [
      { kind: 'rogue', pattern: 'roguePath', count: 1 }
    ]},
    {id:5, baseSpeed: 2, hpMultiplier: 1, enemies: [
      { kind: 'armoredDrone', pattern: 'armoredDronePath', count: 1 }
    ]},
    {id:6, baseSpeed: 2, hpMultiplier: 1, enemies: [
      { kind: 'kamikaze', pattern: 'kamikazePath', count: 1 }
    ]},
  ];
  