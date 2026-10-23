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
    // The riddle and hints leave the year out: it's the password.
    riddle: [
      "Before all the rest, I was first on the hill:",
      "one building, whole campus, yet I'm here still.",
      "Wrote the charter? Yeah, it's all Taylor-made.",
      "Find the spot where Bucknell's very first brick was laid.",
    ],
    hints: [
      "Named for Stephen W. Taylor, who wrote the university's charter.",
      "It's the building the judges are standing in.",
    ],
    // No game for the first stop: its bonus hint is free.
    game: null,
    bonusHint: "On the house: you might be standing in it right now. Step outside and look up. The first building on the hill is still the oldest one here.",
    // Password: a year shown at the stop. Players are never told it's a year.
    // TODO: confirm on site which years are visible, the clues, and the sign.
    code: ["1849"],
    clues: [
      "This one's about when it all got started.",
      "Look for it carved in stone. Four characters, no letters.",
    ],
    photo: "Get the building's sign in the shot.",
    token: "k7q2",
    // From OpenStreetMap's footprint. Wide radius: players check in from indoors.
    geo: { lat: 40.95721, lng: -76.88295, r: 60 },
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

  // Ported from GAME-PLAN. Memories aren't written yet; the card back tells each story.
  {
    id: "bucknell", n: 2, act: 1, name: "Bucknell Hall", token: "gztn",
    riddle: [
      "The school was running on fumes till the Gas King filled it up.",
      "Fifty thousand bucks. Now you know where we got the \"Buck.\"",
      "His first gift was a chapel. Now the poets spit bars.",
      "Find the hall wearing his name, where the verses are the stars.",
    ],
    hints: [
      "On Loomis Street, home of the Stadler Center for Poetry & Literary Arts.",
    ],
    code: ["1886"], // Dedicated 1886. Unconfirmed on site.
    clues: [
      "This one's about when the doors first opened.",
      "Look on the stonework out front. Four characters, no letters.",
    ],
    photo: "Get the building's sign in the shot.",
    geo: { lat: 40.95876, lng: -76.88251, r: 40 }, // From OpenStreetMap. Confirm on site.
    game: "tank",
    bonusHint: "It started out as a chapel, the first gift from the man this school is named after. These days, it's where the poets read, on Loomis Street.",
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
    id: "hunt", n: 3, act: 2, name: "Hunt Hall", token: "6w5p",
    riddle: [
      "You're on a hunt, so it's only right you pull up to Hunt.",
      "Lights cut out, tools go missing. Custodians say it's no stunt.",
      "There's perfume in the hallway when nobody's there.",
      "Spooky season. Find the haunted hall, if you dare.",
    ],
    hints: [
      "A residence hall just west of Bucknell Hall. Look for the porch and steps.",
    ],
    code: ["1928", "1927"], // Opened 1928, dug 1927. Unconfirmed on site.
    clues: [
      "When did the first residents move in?",
      "Look on the building's stonework. Four characters, no letters.",
    ],
    photo: "Get the porch and steps in the shot.",
    geo: { lat: 40.9589, lng: -76.88349, r: 40 }, // From OpenStreetMap. Confirm on site.
    game: "lights",
    bonusHint: "It's a residence hall with a porch and steps out front. In 1933, those steps were the stage for Commencement. Look outside; don't go wandering the halls.",
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
    id: "oldart", n: 4, act: 2, name: "Old Art Building", token: "s3x4",
    riddle: [
      "Built on top of Miller Run, I've been going with the flow.",
      "Chem kids joked their waste had a shortcut down below.",
      "Then the creek rose up, and I turned into a dam.",
      "The music took a hit. Now tell me who I am.",
    ],
    hints: [
      "The old Art Building on Walker Street, where it bridges Miller Run.",
    ],
    code: ["1889", "1920"], // Built 1889, extended over the creek 1920. Unconfirmed on site.
    clues: [
      "When did this place go up, long before the creek got involved?",
      "Look on the building itself. Four characters, no letters.",
    ],
    photo: "Get the creek and the building over it in the shot.",
    geo: { lat: 40.95811, lng: -76.88379, r: 40 }, // From OpenStreetMap. Confirm on site.
    game: "pipes",
    bonusHint: "Find the creek on Walker Street and follow it. The building you want sits right on top of the water.",
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
    id: "roberts", n: 5, act: 2, name: "Roberts Hall", token: "v7ja",
    riddle: [
      "August '32, the place got a little too lit:",
      "fire took my middle, and my records went with it.",
      "Rebuilt with a new name, but the old one still remains.",
      "Climb the hill and find the dorm that used to be Old Main.",
    ],
    hints: [
      "The oldest residence hall on campus, on the north side of the old quad, renamed for trustee Daniel C. Roberts.",
    ],
    code: ["1858", "1937", "1932"], // Old Main 1858, fire 1932, rebuilt 1937. Unconfirmed on site.
    clues: [
      "Think about when it rose, or when it rose again.",
      "Look for it in stone. Four characters, no letters.",
    ],
    photo: "Get the building's sign in the shot.",
    geo: { lat: 40.95673, lng: -76.88149, r: 50 }, // From OpenStreetMap. Confirm on site.
    game: "records",
    bonusHint: "Climb the hill. It's on the north side of the old quad, it's the oldest residence hall on campus, and it used to go by another name.",
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
    id: "carnegie", n: 6, act: 2, name: "Carnegie Building", token: "9f2j",
    riddle: [
      "Steel money built me, and the sun was my only light.",
      "They slid my books down wooden chutes when the new kid took the mic.",
      "They almost tore me down for a lawn. Now they call me a gem.",
      "Find the library before the library. Hidden gem? I'm one of them.",
    ],
    hints: [
      "Just south of Roberts Hall, paid for by Andrew Carnegie in 1904.",
    ],
    code: ["1904", "1905"], // Cornerstone 1904, opened 1905. Unconfirmed on site.
    clues: [
      "When did the steel money show up?",
      "Check the cornerstone. Four characters, no letters.",
    ],
    photo: "Get the building's sign in the shot.",
    geo: { lat: 40.95622, lng: -76.88173, r: 40 }, // From OpenStreetMap. Confirm on site.
    game: "books",
    bonusHint: "A 1904 building paid for with steel money, just south of the oldest residence hall on campus. Before Bertrand opened, this was the library.",
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
    id: "cells", n: 7, act: 2, name: "The Cells", token: "rytx",
    riddle: [
      "Row of cells in the library where thesis writers get booked.",
      "They're serving sentences, the written kind, and they're hooked.",
      "Finals week it's a full house. Nobody's making parole.",
      "Find the cell block. Shh. Keep the volume on low.",
    ],
    hints: [
      "Bertrand Library's private study rooms. Be quiet; people are serving their sentences.",
    ],
    code: ["1951"], // Bertrand's cornerstone, 1951. Unconfirmed on site.
    clues: [
      "When did the new library lay its first stone?",
      "Find the library's cornerstone. Four characters, no letters.",
    ],
    photo: "Get the row of study rooms in the shot. Quietly.",
    geo: { lat: 40.9544, lng: -76.88261, r: 70 }, // From OpenStreetMap. Confirm on site.
    game: "lock",
    bonusHint: "Go inside Bertrand Library and look for the row of private study rooms that thesis writers book during finals. Keep your voice down.",
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
    id: "flyson", n: 8, act: 3, name: "The Flyson", token: "n9b7",
    riddle: [
      "I'm a bison that flies, but I never leave the ground.",
      "Midnight nacho tots, and the line wraps all around.",
      "Weekdays I'm parked out, pouring coffee by the books.",
      "Find the bison that can fly. It's not as hard as it looks.",
    ],
    hints: [
      "The Flying Bison food truck. On weekdays it's parked outside Hildreth-Mirza Hall, a minute from Bertrand.",
    ],
    code: null, // A food truck: no fixed year to read. Check-in and photo only.
    photo: "Get the truck in the shot, or its spot if it's out.",
    geo: { lat: 40.95466, lng: -76.88212, r: 50 }, // From OpenStreetMap. Confirm on site.
    game: "orders",
    bonusHint: "On weekdays, it parks outside Hildreth-Mirza Hall, about a minute from Bertrand. Late at night, just look for the line.",
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
    id: "malesardi", n: 9, act: 3, name: "Malesardi Quad", token: "j7xj",
    riddle: [
      "First-years light their candles here before day one;",
      "four years later, caps and gowns, sitting in the sun.",
      "They call the ending \"Commencement,\" and that word means \"start.\"",
      "Find the lawn where every class begins: the campus heart.",
    ],
    hints: [
      "Malesardi Quadrangle. Bertrand Library stands at its east end.",
    ],
    code: null, // The quad's plaques show only its name. Check-in and photo only.
    photo: "Get the lawn and the library behind it in the shot.",
    geo: { lat: 40.9547, lng: -76.8837, r: 70 }, // The lawn between Bertrand's front and Freas Hall; not mapped in OpenStreetMap. Confirm on site.
    game: "flame",
    bonusHint: "It's a big lawn with Bertrand Library standing at its east end. Every class gathers here at convocation and comes back for Commencement.",
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
    id: "bucky", n: 10, act: 3, name: "Bucky (KLARC)", token: "9v5x",
    riddle: [
      "Fifteen hundred pounds, eight feet tall. No bull.",
      "Posted at the gym 24/7, never skipping pull.",
      "You've heard of the herd? I'm the biggest you'll see.",
      "Strike a pose with the big guy. Your photo needs me.",
    ],
    hints: [
      "The bison statue outside the Kenneth Langone Athletics & Recreation Center (KLARC).",
    ],
    code: ["1975", "2017"], // Class of 1975 gift, installed 2017. Unconfirmed on site.
    clues: [
      "Who gave him to campus? Their class says it all.",
      "Check his plaque. Four characters, no letters.",
    ],
    photo: "Strike a pose with the big guy and get him in the shot.",
    geo: { lat: 40.95609, lng: -76.88792, r: 150 }, // The whole KLARC; the statue isn't mapped. Confirm on site.
    game: "herd",
    bonusHint: "Head for the Kenneth Langone Athletics & Recreation Center. The one you want is right outside: 1,500 pounds, eight feet tall, never skips a workout.",
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
    id: "rooke", n: 11, act: 4, name: "Rooke Chapel", token: "2f5c",
    riddle: [
      "Most buildings flex their names in stone. I carved a question instead.",
      "Thirty-two eighty-eight pipes. Yeah, I've got pipes, 'nuff said.",
      "Skip me and that's a Rooke-ie mistake this close to the end.",
      "Find the chapel asking a question, and answer it, friend.",
    ],
    hints: [
      "Rooke Chapel on Dent Drive, a short walk from the gates. Read the words carved on the outside.",
    ],
    code: ["1964"], // Dedicated 1964. Unconfirmed on site.
    clues: [
      "When did the services stop wandering?",
      "Look near the carved question. Four characters, no letters.",
    ],
    photo: "Get the carved question in the shot.",
    geo: { lat: 40.95461, lng: -76.88617, r: 50 }, // From OpenStreetMap. Confirm on site.
    game: "organ",
    bonusHint: "It's on Dent Drive, a short walk from the gates by the stadium. Look for the building with a question carved into its wall.",
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
    id: "gates", n: 12, act: 4, name: "Mathewson Gates", token: "4jzx",
    riddle: [
      "Every first-year walks in through me. Every senior walks out.",
      "Baseball built me for Big Six, the arm the whole league talked about.",
      "His best pitch was the fadeaway, but you're not fading yet.",
      "Walk through one last time. The last bar's the one you won't forget.",
    ],
    hints: [
      "The brick-and-iron gateway on Moore Avenue/Dent Drive, by the stadium.",
    ],
    code: ["1928", "1898", "1901"], // Plaque: June 5, 1928; marker: 1898-1901 at Bucknell.
    clues: [
      "When did baseball give him this gateway?",
      "Read the plaque on the gateway. Four characters, no letters.",
    ],
    photo: "Get the gateway in the shot.",
    geo: { lat: 40.95333, lng: -76.88694, r: 40 }, // From OpenStreetMap. Confirm on site.
    game: "zone",
    bonusHint: "Head toward the stadium, near Moore Avenue and Dent Drive. It's a brick-and-iron gateway, and every senior walks out through it.",
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
