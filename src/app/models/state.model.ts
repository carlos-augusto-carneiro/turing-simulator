import { Edge } from "./edge.model";
import { Transition } from "./transition.model";

export class State {
  public transitions: Transition[] = [];

  constructor(
    public name: string,
    public isFinal: boolean = false
  ) {}

  getName(): string { return this.name; }

  getIsFinal(): boolean { return this.isFinal; }

  setFinal(value: boolean = true): void {
    this.isFinal = value;
  }

  addTransition(target_state: State, read_c: string, write_c: string, direction: string): Transition {
    const edge = Edge.instance(read_c, write_c, direction);
    const transition = new Transition(target_state, edge);
    this.transitions.push(transition);
    return transition;
  }

  transition(char_lido: string): Transition | null {
    for (const t of this.transitions) {
      const edge = t.getEdge();
      const leituraEsperada = edge.getRead();

      if (leituraEsperada === char_lido) {
        return t;
      }
    }
    return null;
  }
}
