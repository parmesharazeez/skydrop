const building = (x, z, w, h, d) => ({ x, z, w, h, d });
const outskirts = [
  building(-28, -23, 7, 12, 8),
  building(26, -24, 8, 18, 7),
  building(-27, 24, 9, 10, 7),
  building(27, 22, 7, 15, 8),
];
export const levels = [
  {
    id: 1,
    name: 'Rookie Delivery',
    district: 'THE OUTER ISLANDS',
    description: 'Clear skies. One package. Make your first delivery.',
    time: 120,
    radius: 4,
    bonus: 0,
    spawn: [0, 3, 16],
    routes: [{ pickup: [0, 0, 14], target: [0, 0, -14] }],
    buildings: [...outskirts, building(15, 0, 6, 8, 7)],
  },
  {
    id: 2,
    name: 'Urban Courier',
    district: 'NEON DISTRICT',
    description: 'Two deliveries through the city. Watch your clearance.',
    time: 100,
    radius: 3,
    bonus: 25,
    spawn: [0, 3, 20],
    routes: [
      { pickup: [0, 0, 18], target: [-18, 0, -15] },
      { pickup: [18, 0, -17], target: [-17, 0, 18] },
    ],
    buildings: [
      ...outskirts,
      building(-8, 0, 6, 12, 9),
      building(8, 2, 6, 16, 8),
      building(0, -22, 7, 9, 5),
    ],
  },
  {
    id: 3,
    name: 'Extreme Delivery',
    district: 'THE HIGHLINE',
    description: 'Three packages. Elevated pads. Precision under pressure.',
    time: 90,
    radius: 2.2,
    bonus: 50,
    spawn: [0, 4, 22],
    routes: [
      { pickup: [0, 0, 20], target: [-19, 6, -15] },
      { pickup: [18, 4, -18], target: [-19, 0, 18] },
      { pickup: [20, 0, 17], target: [0, 9, -22] },
    ],
    buildings: [
      ...outskirts,
      building(-9, -4, 6, 15, 13),
      building(7, 2, 6, 20, 12),
      building(19, -4, 5, 12, 7),
    ],
  },
];
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
