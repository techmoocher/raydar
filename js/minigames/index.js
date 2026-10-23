// One small game per stop. A stop picks its game with `game` in gems.js.
//
// A game is { title, how, intro, win, lose, mount(stage, { win, lose, status }) }.
// mount() builds the board inside stage, calls win() or lose(line?) once, and
// may return a cleanup function. intro/win/lose are Ray's lines.

import tank from "./tank.js";
import lights from "./lights.js";
import pipes from "./pipes.js";
import records from "./records.js";
import books from "./books.js";
import lock from "./lock.js";
import orders from "./orders.js";
import flame from "./flame.js";
import herd from "./herd.js";
import organ from "./organ.js";
import zone from "./zone.js";

export const GAMES = { tank, lights, pipes, records, books, lock, orders, flame, herd, organ, zone };
