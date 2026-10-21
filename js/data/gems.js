// All game content. Add new stops here
// More information in https://techmoocher.github.io/raydar.docs/#content

export const ACTS = {
  1: "BEFORE RAY HAD A NAME",
  2: "RAY'S GHOSTS AND SCARS",
  3: "RAY'S BUCKNELL",
  4: "FINALE",
};

export const GEMS = [
  {
    id: "taylor",
    n: 1,
    act: 1,
    name: "Taylor Hall",
    riddle: [
      "Eighteen forty-nine, I was first on the hill:",
      "one building, whole campus, yet I'm here still.",
      "Wrote the charter? Yeah, it's all Taylor-made.",
      "Find the spot where Bucknell's very first brick was laid.",
    ],
    hints: [
      "Built in 1849 and named for Stephen W. Taylor, who wrote the university's charter.",
      "It's the building the judges are standing in.",
    ],
    code: "CHARTER",
    token: "k7q2",
    geo: null,
    memory: [
      { text: "This was once the whole university. One building, 1849.", mood: "wistful" },
      { text: "They called it the University at Lewisburg.", mood: "wistful" },
      { text: "Yet, many students have to pull out Google Maps whenever they want to get here.", mood: "happy" },
    ],
    bonus: null,
    cardBack:
      "You made it. In 1849, this was everything: classrooms, dreams, a lot of mud. They didn't call it Bucknell yet. Give them 37 years.",
  },

  // Stubs: content not ported yet.
  { id: "bucknell", n: 2, act: 1, name: "Bucknell Hall", code: "GASKING", stub: true },
  { id: "hunt", n: 3, act: 2, name: "Hunt Hall", code: "PERFUME", stub: true },
  { id: "oldart", n: 4, act: 2, name: "Old Art Building", code: "MILLRUN", stub: true },
  { id: "roberts", n: 5, act: 2, name: "Roberts Hall", code: "OLDMAIN", stub: true },
  { id: "carnegie", n: 6, act: 2, name: "Carnegie Building", code: "CHUTES", stub: true },
  { id: "cells", n: 7, act: 2, name: "The Cells", code: "PAROLE", stub: true },
  { id: "flyson", n: 8, act: 3, name: "The Flyson", code: "NACHOTOTS", stub: true },
  { id: "malesardi", n: 9, act: 3, name: "Malesardi Quad", code: "CANDLE", stub: true },
  { id: "bucky", n: 10, act: 3, name: "Bucky (KLARC)", code: "NOBULL", stub: true },
  { id: "rooke", n: 11, act: 4, name: "Rooke Chapel", code: "MICAH", stub: true },
  { id: "gates", n: 12, act: 4, name: "Mathewson Gates", code: "BIGSIX", stub: true },
];

export const byId = (id) => GEMS.find((g) => g.id === id);
