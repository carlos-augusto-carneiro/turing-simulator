import { TuringMachine } from '../../services/turing-machine';
import { State } from '../../models/state.model';
import { CommonModule } from '@angular/common';
import { CalculatorService } from '../../services/calculator';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-tape-visualizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tape-visualizer.html',
  styleUrls: ['./tape-visualizer.css'],
})
export class TapeVisualizer implements OnInit {
  isRunning = false;
  private cellSize: number = 64;
  resultMessage: string | null = null;
  velocidadeMs: number = 300;
  inputVelocidade: boolean = false;
  inputAlgoritmo: boolean = false;
  algoritmoTexto: string = '';
  sliderValue: number = 50;

  activeMachine: 'default' | 'soma' | 'subtracao' | 'sensivel' | 'regular' | 'multi3' | 'palindromo' | 'custom' = 'default' ;
  constructor(public tmService: TuringMachine,
              private calculatorService: CalculatorService,
              private NgZone: NgZone,
              private cdr: ChangeDetectorRef) {
  }

  getOffset(): number {
    return -(this.tmService.headPosition * 64) + 100;
  }
  ngOnInit(): void {
    this.reset();
  }
  step(): void {
    this.stop();
    const continuou = this.tmService.step();
    if(!continuou) this.checkResult();
  }

  isError(): boolean {
    if (!this.resultMessage) {return false};
    return this.resultMessage.startsWith('REJEITADO: A cadeia não é válida.') || this.resultMessage.startsWith('Erro');
  }

  getTransform() {
    const headCenter = 320 + 96;
    return `translateX(${headCenter - this.tmService.headPosition * 64}px)`;
  }

  carregarSoma(valorDoInput: string): void {
    this.stop();
    this.inputVelocidade = false;
    this.activeMachine = 'soma';
    this.resultMessage = null;
    const input = valorDoInput && valorDoInput.trim() !== '' ? valorDoInput : '101+11=';
    this.calculatorService.setupSomaBinaria(input);
  }

  carregarSubtracao(valorDoInput: string): void {
    this.stop();
    this.inputVelocidade = false;
    this.activeMachine = 'subtracao';
    this.resultMessage = null;
    const input = valorDoInput && valorDoInput.trim() !== '' ? valorDoInput : '101-11=';
    this.calculatorService.setupSubtracaoBinaria(input);
  }

  carregarMulti3(valorDoInput: string): void {
    this.stop();
    this.inputVelocidade = false;
    this.activeMachine = 'multi3';
    this.resultMessage = null;
    const input = valorDoInput && valorDoInput.trim() !== '' ? valorDoInput : '11';
    this.calculatorService.setupMultiplicacaoPor3(input);
  }

  carregarSensivel(valorDoInput: string): void {
    this.stop();
    this.inputVelocidade = false;
    this.activeMachine = 'sensivel';
    this.resultMessage = null;
    const input = valorDoInput && valorDoInput.trim() !== '' ? valorDoInput : 'aaaabbbbcccc';
    this.calculatorService.setupGramaticaSensivelAoContexto(input);
  }

  carregarRegular(valorDoInput: string): void {
    this.stop();
    this.inputVelocidade = false;
    this.activeMachine = 'regular';
    this.resultMessage = null;
    const input = valorDoInput && valorDoInput.trim() !== '' ? valorDoInput : 'aaaabbbb';
    this.calculatorService.setupGramaticaRegular(input);
  }

  carregarPalindromo(valorDoInput: string): void {
    this.stop();
    this.inputVelocidade = false;
    this.activeMachine = 'palindromo';
    this.resultMessage = null;
    const input = valorDoInput && valorDoInput.trim() !== '' ? valorDoInput : 'abba';
    this.calculatorService.setupPalindromo(input);
  }

  onInputChange(value: string): void {
    this.stop();
    if (!value) return;

    if (this.activeMachine === 'soma') {
      this.carregarSoma(value);
    } else if (this.activeMachine === 'subtracao') {
      this.carregarSubtracao(value);
    } else {
      this.loadDefaultMachine(value);
    }
  }

  atualizarVelocidade(valor: number): void {
    this.sliderValue = valor;
    this.velocidadeMs = 1050 - (valor * 10);

    console.log(`Slider: ${valor}, Delay: ${this.velocidadeMs}ms`);
  }

  run(): void {
    if (this.isRunning) return;

    this.resultMessage = null;
    this.isRunning = true;

    this.NgZone.runOutsideAngular(() => {
      this.loop();
    });
  }

  private loop(): void {
    if (!this.isRunning) return;

    const continuou = this.tmService.step();
    this.cdr.markForCheck();
    console.log(continuou);

    if (!continuou) {
      this.NgZone.run(() => {
        this.isRunning = false;
        this.checkResultCDR();
        this.cdr.markForCheck();
      });
      return;
    }

    setTimeout(() => this.loop(), this.velocidadeMs);
  }


  stop(): void {
    this.isRunning = false;
  }

  private checkResult(): void {
    const isFinal = this.tmService.currentState?.getIsFinal() || false;
    const maquinasComResultado = ['soma', 'subtracao', 'sensivel', 'regular', 'multi3', 'palindromo', 'custom'];

    if (maquinasComResultado.includes(this.activeMachine) && this.tmService.currentState?.getIsFinal()) {
      this.resultMessage = this.calculatorService.extractResult(this.tmService.tape, isFinal, this.activeMachine);
    }
    else {
        this.resultMessage = "REJEITADO: A cadeia não é válida.";
      }

  }

  private checkResultCDR(): void {

    this.NgZone.run(() => {
      const isFinal = this.tmService.currentState?.getIsFinal() || false;
      const maquinasComResultado = ['soma', 'subtracao', 'sensivel', 'regular', 'multi3', 'palindromo', 'custom'];
      if (maquinasComResultado.includes(this.activeMachine) && this.tmService.currentState?.getIsFinal()) {
        this.resultMessage = this.calculatorService.extractResult(this.tmService.tape, isFinal, this.activeMachine);
        this.cdr.detectChanges();
      } else {
        this.resultMessage = "REJEITADO: A cadeia não é válida.";
        this.cdr.detectChanges();
      }
    });
  }

  reset(): void {
    this.stop();
    this.inputVelocidade = false;
    this.resultMessage = null;
    const q0 = new State('q0', false);
    const qFim = new State('qFim', true);

    q0.addTransition(q0, '0', '1', 'D');
    q0.addTransition(q0, '1', '0', 'D');
    q0.addTransition(qFim, '_', '_', 'D');

    this.tmService.initialize(q0, '10110', 20);
  }

  private loadDefaultMachine(w: string): void {
    this.stop();
    this.activeMachine = 'default';

    const q0 = new State('q0', false);
    const q1 = new State('q1', false);
    const q2 = new State('q2', false);
    const q3 = new State('q3', false);
    const q4 = new State('q4', false);
    const qFim = new State('qFim', true);

    q0.addTransition(q1, 'a', 'A', 'D')
    q0.addTransition(q3, '_', '_', 'E')
    q0.addTransition(q4, 'B', 'B', 'D')

    q1.addTransition(q1, 'a', 'a', 'D')
    q1.addTransition(q1, 'B', 'B', 'D')
    q1.addTransition(q2, 'b', 'B', 'E')

    q2.addTransition(q2, 'a', 'a', 'E')
    q2.addTransition(q2, 'B', 'B', 'E')
    q2.addTransition(q0, 'A', 'A', 'D')

    q4.addTransition(q4, 'B', 'B', 'D')
    q4.addTransition(q3, '_', '_', 'E')

    q3.addTransition(q3, 'A', 'A', 'E')
    q3.addTransition(q3, 'B', 'B', 'E')
    q3.addTransition(qFim, '_', '_', 'D')

    w = 'aaaabbbb'


    this.tmService.initialize(q0, w, 20);
  }
  carregarAlgoritmoPersonalizado(): void {
    this.stop();
    this.activeMachine = 'custom';
    this.resultMessage = null;

    if (!this.algoritmoTexto || this.algoritmoTexto.trim() === '') {
      alert('Por favor, digite o algoritmo na caixa de texto.');
      return;
    }

    const linhas = this.algoritmoTexto.split('\n');
    const estados = new Map<string, State>();

    const getState = (name: string): State => {
      const n = name.trim();
      if (!estados.has(n)) {
        estados.set(n, new State(n, false));
      }
      return estados.get(n)!;
    };

    let estadoInicial: State | null = null;
    let fitaInicial: string = '';

    try {
      for (const linha of linhas) {
        const l = linha.trim();
        if (!l || l.startsWith('#') || l.startsWith('//') || l.startsWith('@')) continue;

        if (l.toLowerCase().startsWith('fita ')) {
          fitaInicial = l.substring(5).trim();
          continue;
        }

        if (l.toLowerCase().startsWith('init ')) {
          const nome = l.split(/\s+/)[1];
          if (nome) estadoInicial = getState(nome);
          continue;
        }

        if (l.toLowerCase().startsWith('accept ')) {
          const nome = l.split(/\s+/)[1];
          if (nome) getState(nome).setFinal(true);
          continue;
        }

        const partes = l.split(',');
        if (partes.length >= 5) {
          const qAtual = getState(partes[0]);
          const ler = partes[1].trim();
          const qProx = getState(partes[2]);
          const escrever = partes[3].trim();
          let dir = partes[4].trim().toUpperCase();

          if (dir === '>' || dir === 'R') dir = 'D';
          if (dir === '<' || dir === 'L') dir = 'E';

          qAtual.addTransition(qProx, ler, escrever, dir);

          if (!estadoInicial) estadoInicial = qAtual;
        }
      }

      if (estadoInicial) {
        const input = fitaInicial || '10110';

        const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (inputElement) inputElement.value = input;

        this.tmService.initialize(estadoInicial, input, 20);
        this.inputAlgoritmo = false; // Fecha a caixa
        console.log('Algoritmo carregado com sucesso! Fita:', input);
      } else {
        alert('Erro: Não foi possível identificar o estado inicial (init).');
      }

    } catch (e) {
      console.error(e);
      alert('Erro ao processar o algoritmo. Verifique a sintaxe.');
    }
  }
}
