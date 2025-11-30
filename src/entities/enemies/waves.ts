export const WAVES = [
    { id: 1, baseSpeed: 2, hpMultiplier: 1, enemies: [
      { kind: "drone", pattern: "zigzag", count: 5 }
    ]},
  
    { id: 2, baseSpeed: 2, hpMultiplier: 1, enemies: [
      { kind: "drone", pattern: "sCurve", count: 6 }
    ]},
  
    { id: 3, baseSpeed: 2, hpMultiplier: 1, enemies: [
      { kind: "drone", pattern: "vFormation", count: 7 }
    ]},
    { id: 4, baseSpeed: 2.4, hpMultiplier: 2.0, enemies: [
      { kind: 'rogue', pattern: 'roguePath', count: 3 }
    ]},
    {id:5, baseSpeed: 2, hpMultiplier: 10, enemies: [
      { kind: 'armoredDrone', pattern: 'armoredDronePath', count: 1 }
    ]},
    {id:6, baseSpeed: 2, hpMultiplier: 1, enemies: [
      { kind: 'kamikaze', pattern: 'kamikazePath', count: 4 }
    ]},
    {id:7, baseSpeed: 2, hpMultiplier: 12, enemies: [
      { kind: 'armoredDrone', pattern: 'armoredDronePath', count: 2 }
    ]},
    { id: 8, baseSpeed: 2.5, hpMultiplier: 1.4, enemies: [
      { kind: 'rogue', pattern: 'roguePath', count: 5 }
    ]},
    {id:9, baseSpeed: 2, hpMultiplier: 1, enemies: [
      { kind: 'kamikaze', pattern: 'kamikazePath', count: 4 }
    ]},
    {id:10, baseSpeed: 2, hpMultiplier: 20, enemies: [
      { kind: 'boss', pattern: 'bossPath', count: 1 }
    ]},

  ];
  