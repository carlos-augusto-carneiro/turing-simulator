import { Injectable } from '@angular/core';
import { State } from '../models/state.model';

@Injectable({
  providedIn: 'root',
})
export class TuringMachine {
  public tape: string[] = [];
  public headPosition: number = 0;
  public state: State | null = null;
  public currentState: State | null = null;
  public history: string[] = [];
  private range: number = 20;

  initialize(initialState: State, input: string, range: number = 20) {
    this.currentState = initialState;
    this.range = range;
    this.tape = [];
    this.history = [];

    for(let i=0; i < range*2 + input.length; i++) {
        this.tape.push('_');
    }

    this.headPosition = range;
    for(let i=0; i < input.length; i++) {
        this.tape[this.headPosition + i] = input[i];
    }

    this.log(`Início: Estado ${initialState.getName()}`);
  }

  step(): boolean {
    if (!this.currentState) return false;

    const charLido = this.tape[this.headPosition] || '_';
    const transition = this.currentState.transition(charLido);

    if (!transition) {
      this.log(`FIM: Sem transição em ${this.currentState.getName()} lendo '${charLido}'`);
      return false;
    }

    const edge = transition.getEdge();
    const nextState = transition.getState();

    this.tape[this.headPosition] = edge.getWrite();

    this.log(`${this.currentState.getName()}: Leu '${charLido}' -> Escreveu '${edge.getWrite()}', Moveu ${edge.getDirection()}`);

    if (edge.getDirection() === 'D') this.headPosition++;
    else if (edge.getDirection() === 'E') this.headPosition--;

    this.currentState = nextState;

    return true;
  }

  private log(msg: string) {
    this.history.unshift(msg);
  }
}
