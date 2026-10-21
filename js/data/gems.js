// All game content. Add new stops here
// More information in https://techmoocher.github.io/raydar.docs/#content

export const ACTS = {
  1: "BEFORE RAY HAD A NAME",
  2: "GHOSTS AND SCARS",
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
      { text: "In 1849, this one building *was* the university.", mood: "wistful" },
      { text: "Back then it wasn't even Bucknell.| Everyone called it the University at Lewisburg.", mood: "wistful" },
      { text: "First building on the hill...| and half of campus still needs Google Maps to find it.", mood: "happy" },
    ],
    bonus: null,
    cardBack: [
      "You made it.| First card, first building, first brick.",
      "In 1849, this was everything: classrooms, big dreams, a lot of mud.",
      "Stephen W. Taylor wrote the charter that let this school exist, so the first building got his name.",
      "Nobody called it Bucknell yet. It was the University at Lewisburg, one building on a hill.| ~Give it 37 years.~",
      "Every hall you'll pass today came after this one.",
      "Put me back where you found me.| Someone else is about to start, too.",
    ],
  },

  // Stubs: content not ported yet.
  {
    id: "bucknell", n: 2, act: 1, name: "Bucknell Hall", code: "GASKING", token: "gztn", stub: true,
    cardBack: [
      "So.| About my name.",
      "Not long after this school opened, it was running on fumes. The money was gone, and closing was a real possibility.",
      "Then William Bucknell stepped in. People called him the Gas King, and he filled the tank: fifty thousand dollars.",
      "In 1886, the university took his name to say thanks.| ~That's where the “Buck” comes from. Mine too.~",
      "This hall was his first gift, built as a chapel. Now it's the Stadler Center for Poetry & Literary Arts.",
      "Hymns then, poetry readings now.| Still a place where people come to hear good words.",
    ],
  },
  {
    id: "hunt", n: 3, act: 2, name: "Hunt Hall", code: "PERFUME", token: "6w5p", stub: true,
    bonus: "In 1933, Hunt Hall's porch and steps were the stage for an outdoor Commencement. And Bucknell once ranked #5 on a list of the most haunted US campuses.",
    cardBack: [
      { text: "Okay, don't freak out.| This hall is haunted.", mood: "spooky" },
      { text: "At least, the custodians think so. Tools go missing. Lights switch off with nobody near them.", mood: "spooky" },
      { text: "And then there's the perfume.| It drifts down the empty hallway, mostly in summer, after the students go home.", mood: "spooky" },
      "The hall's named for President Emory W. Hunt. Whoever wears that perfume never left a name.",
      { text: "Get your photo from the porch...| and maybe don't stay until dark.", mood: "spooky" },
    ],
  },
  {
    id: "oldart", n: 4, act: 2, name: "Old Art Building", code: "MILLRUN", token: "s3x4", stub: true,
    cardBack: [
      "Look down.| There's a creek under this building.",
      "It's called Miller Run, and somebody decided to build right on top of it. ~Bold choice.~",
      "Chemists used to joke that a creek underneath made waste disposal very easy. Just a rumor.| Probably.",
      "Then one day Miller Run had enough. The creek rose, the water piled up against the walls, and the whole building turned into a dam.",
      "It was the music building at the time, and the instruments took the hit. ~Worst concert ever.~",
      "Most people walk past and never know the creek is down there.| Now you're one of the few who do.",
    ],
  },
  {
    id: "roberts", n: 5, act: 2, name: "Roberts Hall", code: "OLDMAIN", token: "v7ja", stub: true,
    cardBack: [
      "August 1932.| A local kid walked through this building and watched the custodians polish the oiled wooden floors.",
      "The next morning, the fire alarm woke him up.",
      "The fire took the middle of the building, and a lot of the university's records went with it.",
      "This was Old Main. They rebuilt it and renamed it for trustee Daniel C. Roberts.",
      "Now it's the oldest residence hall on campus. People sleep, study and complain about the hill right where the flames were.",
      "New name, same hilltop.| Old Main never really left.",
    ],
  },
  {
    id: "carnegie", n: 6, act: 2, name: "Carnegie Building", code: "CHUTES", token: "9f2j", stub: true,
    cardBack: [
      "Before Bertrand, this was the library.",
      "Andrew Carnegie paid for it with steel money in 1904. It opened with no artificial lighting, so you read by the sun.",
      "When the new library opened, the books didn't get carried over. They rode down wooden chutes. ~Best day of their lives.~",
      "In 1997 and '98, there was talk of tearing it down for a lawn.",
      "Bucknell kept it instead and called it a gem.| ~I'd know. I collect them.~",
      "Not many students think of it as a study spot these days.| Their loss. Your secret.",
    ],
  },
  {
    id: "cells", n: 7, act: 2, name: "The Cells", code: "PAROLE", token: "rytx", stub: true,
    bonus: "On Christmas Eve 1960, the library's roof and clock tower caught fire. Not one book was lost.",
    cardBack: [
      "Welcome to the cell block.| Keep it down. People are serving their sentences.",
      "These are the study carrels. Every finals week they fill up, and thesis writers get first pick.",
      "Students book a cell, lock themselves in, and don't come out until the paper's done.| ~Nobody makes parole early.~",
      "Insider tip: the first floor is for gossip. Lower Level 2 is for real work.",
      "Good luck with your sentence.| See you on the outside.",
    ],
  },
  {
    id: "flyson", n: 8, act: 3, name: "The Flyson", code: "NACHOTOTS", token: "n9b7", stub: true,
    cardBack: [
      "If you've been here at midnight, you already know.| The line wraps around, and everyone's there for the nacho tots.",
      "The Flying Bison is a food truck: a bison that flies but never leaves the ground. ~Relatable.~",
      "On weekdays it parks outside Hildreth-Mirza, a minute from the library, pouring coffee for people who swore they'd sleep early.",
      "Strangers in that line at half past midnight are friends by the time the tots show up.",
      "Ask an alum what they miss most.| Somewhere in the answer, there's a nacho tot.",
      "Truck not here right now? Don't worry.| It always comes back.",
    ],
  },
  {
    id: "malesardi", n: 9, act: 3, name: "Malesardi Quad", code: "CANDLE", token: "j7xj", stub: true,
    cardBack: [
      "This lawn sees every class twice.",
      "The first time, you're a first-year at convocation, holding a candle and trying not to drip wax on your shoes.",
      "The last time, you're in a cap and gown, sitting in the sun at Commencement, waiting for your name.",
      "Funny thing: “commencement” means “beginning.”| They save it for the day you leave.",
      "In between, there are a lot of sunsets out here. Catch a few. ~They're free.~",
      "Bertrand watches from the east end.| It's seen a lot of tassels turn.",
    ],
  },
  {
    id: "bucky", n: 10, act: 3, name: "Bucky (KLARC)", code: "NOBULL", token: "9v5x", stub: true,
    cardBack: [
      "Meet the big guy.| Fifteen hundred pounds, eight feet tall, and he never skips a day at the gym.",
      "Bison have been in this family a long time. In 1946, there was a live one.",
      "In 1990, Becky joined the herd.",
      "Then there was the mini Bucky who ran away for nine months and sent postcards home from a Hotmail account.| ~We don't talk about that.~| Okay, we talk about it a lot.",
      "Every bison on this campus is a little bit me.| ~Or maybe I'm a little bit all of them.~",
      "Go strike a pose with him.| Your photo needs me.",
    ],
  },
  {
    id: "rooke", n: 11, act: 4, name: "Rooke Chapel", code: "MICAH", token: "2f5c", stub: true,
    bonus: "Rooke lived to 103. For his 100th birthday, his grandchildren added trumpet pipes to the organ. It has 3,288 pipes in all.",
    cardBack: [
      { text: "Before 1964, services here wandered from Bucknell Hall to churches in town to a theatre stage.", mood: "wistful" },
      { text: "Then came Robert Rooke, Class of 1913. He grew up four miles downriver in Winfield and went to a one-room schoolhouse.", mood: "wistful" },
      { text: "At his 50th Reunion, he announced this chapel as his gift.", mood: "wistful" },
      { text: "Most buildings carve a name in stone. He picked a question instead, because a question keeps you learning.", mood: "wistful" },
      "Go find it on the wall.| Then answer it. I'll wait.",
    ],
  },
  {
    id: "gates", n: 12, act: 4, name: "Mathewson Gates", code: "BIGSIX", token: "4jzx", stub: true,
    cardBack: [
      "Every first-year walks in through these gates. Every senior walks out.",
      "They're named for Christy Mathewson, Big Six, a Bucknell student before he became one of baseball's greatest pitchers.",
      "His signature pitch was the fadeaway. You're not fading anywhere.| Not today.",
      "You found all twelve: the ghost, the creek, the cells, the tots, every one.",
      { text: "Walk through one more time.| I'll be right here, cheering.| ~I always am.~", mood: "wistful" },
    ],
  },
];

export const byId = (id) => GEMS.find((g) => g.id === id);

// Card back as dialogue lines, signed on the last one.
export function cardBackLines(g) {
  const lines = [].concat(g.cardBack || []).map((l) =>
    typeof l === "string" ? { text: l, mood: "proud" } : { mood: "proud", ...l }
  );
  if (lines.length) lines[lines.length - 1].text += " — Ray";
  return lines;
}
