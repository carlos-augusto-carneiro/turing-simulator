import { State } from './state.model';
import { Edge } from './edge.model';

export class Transition {
  constructor(
    public state: State,
    public edge: Edge
  ) {}

  getState(): State { return this.state; }
  getEdge(): Edge { return this.edge; }
}
