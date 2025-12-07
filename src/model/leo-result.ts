import { Pair } from "./pair";

export class LeoResult {
  subst?: Pair[] | null;
  verb?: Pair[] | null;
  adjadv?: Pair[] | null;
  praep?: Pair[] | null;
  definition?: Pair[] | null;
  phrase?: Pair[] | null;
  example?: Pair[] | null;
  base?: string[] | null;
  sim?: string[] | null;
}