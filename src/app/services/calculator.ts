import { Injectable } from '@angular/core';
import { State } from '../models/state.model';
import { TuringMachine } from './turing-machine';

@Injectable({
  providedIn: 'root',
})
export class CalculatorService {

  constructor(private tm: TuringMachine) {}

  setupSubtracaoBinaria(w: string): void {
    if (!w) w = '0-0=';
    if (!w.endsWith('=')) w += '=';

    console.log(`[Calc] Configurando Subtração Binária para: ${w}`);

    // --- Definição dos Estados ---
    const q0 = new State('q0', false);
    const q_start_c0 = new State('q_start_c0', false); // c0 = Sem 'Borrow'
    const q_start_c1 = new State('q_start_c1', false); // c1 = Com 'Borrow'

    // Estados de Travessia
    const q_cross_0_c0 = new State('q_cross_0_c0', false);
    const q_cross_1_c0 = new State('q_cross_1_c0', false);
    const q_cross_0_c1 = new State('q_cross_0_c1', false);
    const q_cross_1_c1 = new State('q_cross_1_c1', false);

    // Estados de Busca no Op1
    const q_seek_op1_0_c0 = new State('q_seek_op1_0_c0', false);
    const q_seek_op1_1_c0 = new State('q_seek_op1_1_c0', false);
    const q_seek_op1_0_c1 = new State('q_seek_op1_0_c1', false);
    const q_seek_op1_1_c1 = new State('q_seek_op1_1_c1', false);

    // Estados Flush
    const q_flush_op1_c0 = new State('q_flush_op1_c0', false);
    const q_flush_op1_c1 = new State('q_flush_op1_c1', false);

    // Estados de Escrita
    const q_write_0_c0 = new State('q_write_0_c0', false);
    const q_write_1_c0 = new State('q_write_1_c0', false);
    const q_write_0_c1 = new State('q_write_0_c1', false);
    const q_write_1_c1 = new State('q_write_1_c1', false);

    // Estados de Retorno
    const q_return_c0 = new State('q_return_c0', false);
    const q_return_c1 = new State('q_return_c1', false);

    const qFim = new State('qFim', true);

    // --- 1. Inicialização ---
    q0.addTransition(q0, '0', '0', 'D');
    q0.addTransition(q0, '1', '1', 'D');
    q0.addTransition(q0, '-', '-', 'D');
    q0.addTransition(q_start_c0, '=', '=', 'E');

    // --- 2. Ciclo de Leitura (Op2) ---
    // Pula marcados
    [q_start_c0, q_start_c1].forEach(s => {
      s.addTransition(s, 'x', 'x', 'E');
      s.addTransition(s, 'y', 'y', 'E');
    });

    // Lê dígito e marca
    q_start_c0.addTransition(q_cross_0_c0, '0', 'x', 'E');
    q_start_c0.addTransition(q_cross_1_c0, '1', 'y', 'E');
    q_start_c1.addTransition(q_cross_0_c1, '0', 'x', 'E');
    q_start_c1.addTransition(q_cross_1_c1, '1', 'y', 'E');

    // Se bater no '-', Op2 acabou
    q_start_c0.addTransition(q_flush_op1_c0, '-', '-', 'E');
    q_start_c1.addTransition(q_flush_op1_c1, '-', '-', 'E');

    // --- 3. Travessia (Ignora tudo até '-') ---
    const crossStates = [q_cross_0_c0, q_cross_1_c0, q_cross_0_c1, q_cross_1_c1];
    crossStates.forEach(s => {
      ['0', '1', 'x', 'y'].forEach(c => s.addTransition(s, c, c, 'E'));
    });

    // Sai da travessia ao achar '-'
    q_cross_0_c0.addTransition(q_seek_op1_0_c0, '-', '-', 'E');
    q_cross_1_c0.addTransition(q_seek_op1_1_c0, '-', '-', 'E');
    q_cross_0_c1.addTransition(q_seek_op1_0_c1, '-', '-', 'E');
    q_cross_1_c1.addTransition(q_seek_op1_1_c1, '-', '-', 'E');

    // --- 4. Busca Op1 e Cálculo ---
    const seekStates = [q_seek_op1_0_c0, q_seek_op1_1_c0, q_seek_op1_0_c1, q_seek_op1_1_c1];
    seekStates.forEach(s => {
      s.addTransition(s, 'x', 'x', 'E');
      s.addTransition(s, 'y', 'y', 'E');
    });

    // LÓGICA DE SUBTRAÇÃO (A - B - C)
    // Grupo A: B=0, C=0 -> A-0
    q_seek_op1_0_c0.addTransition(q_write_0_c0, '0', 'x', 'D'); // 0-0=0
    q_seek_op1_0_c0.addTransition(q_write_1_c0, '1', 'y', 'D'); // 1-0=1
    q_seek_op1_0_c0.addTransition(q_write_0_c0, '_', '_', 'D'); // 0-0=0

    // Grupo B: B=1, C=0 -> A-1
    q_seek_op1_1_c0.addTransition(q_write_1_c1, '0', 'x', 'D'); // 0-1=1, c1
    q_seek_op1_1_c0.addTransition(q_write_0_c0, '1', 'y', 'D'); // 1-1=0, c0
    q_seek_op1_1_c0.addTransition(q_write_1_c1, '_', '_', 'D'); // 0-1=1, c1

    // Grupo C: B=0, C=1 -> A-1
    q_seek_op1_0_c1.addTransition(q_write_1_c1, '0', 'x', 'D'); // 0-1=1, c1
    q_seek_op1_0_c1.addTransition(q_write_0_c0, '1', 'y', 'D'); // 1-1=0, c0
    q_seek_op1_0_c1.addTransition(q_write_1_c1, '_', '_', 'D'); // 0-1=1, c1

    // Grupo D: B=1, C=1 -> A-2
    q_seek_op1_1_c1.addTransition(q_write_0_c1, '0', 'x', 'D'); // 0-2 -> Res:0, c1
    q_seek_op1_1_c1.addTransition(q_write_1_c1, '1', 'y', 'D'); // 1-2 -> Res:1, c1
    q_seek_op1_1_c1.addTransition(q_write_0_c1, '_', '_', 'D'); // 0-2 -> Res:0, c1

    // --- 5. Flush Op1 ---
    [q_flush_op1_c0, q_flush_op1_c1].forEach(s => {
      s.addTransition(s, 'x', 'x', 'E');
      s.addTransition(s, 'y', 'y', 'E');
    });

    // Borrow 0 (Copia o resto)
    q_flush_op1_c0.addTransition(q_write_0_c0, '0', 'x', 'D');
    q_flush_op1_c0.addTransition(q_write_1_c0, '1', 'y', 'D');
    q_flush_op1_c0.addTransition(qFim, '_', '_', 'D');

    // Borrow 1 (Subtrai 1 do resto)
    q_flush_op1_c1.addTransition(q_write_1_c1, '0', 'x', 'D'); // 0-1=1, c1
    q_flush_op1_c1.addTransition(q_write_0_c0, '1', 'y', 'D'); // 1-1=0, c0 (Empréstimo pago!)

    // CORREÇÃO DO LOOP INFINITO:
    // Se a fita acabou (_) mas ainda temos Borrow (c1), é um número negativo (Underflow).
    // Paramos a máquina aqui para evitar o loop.
    q_flush_op1_c1.addTransition(qFim, '_', '_', 'D');

    // --- 6. Escrita ---
    const writeStates = [q_write_0_c0, q_write_1_c0, q_write_0_c1, q_write_1_c1];
    writeStates.forEach(s => {
      ['0', '1', 'x', 'y', '-', '='].forEach(c => s.addTransition(s, c, c, 'D'));
    });

    q_write_0_c0.addTransition(q_return_c0, '_', '0', 'E');
    q_write_1_c0.addTransition(q_return_c0, '_', '1', 'E');
    q_write_0_c1.addTransition(q_return_c1, '_', '0', 'E');
    q_write_1_c1.addTransition(q_return_c1, '_', '1', 'E');

    // --- 7. Retorno ---
    [q_return_c0, q_return_c1].forEach(s => {
      ['0', '1'].forEach(c => s.addTransition(s, c, c, 'E'));
    });
    q_return_c0.addTransition(q_start_c0, '=', '=', 'E');
    q_return_c1.addTransition(q_start_c1, '=', '=', 'E');

    // Inicializa TM
    this.tm.initialize(q0, w, 20);
  }

  setupSomaBinaria(w: string): void {
    // Tratamento de segurança para a string
    if (!w || w.trim() === '') w = '0+0=';
    if (!w.endsWith('=')) w += '=';

    console.log(`[Calc] Configurando Soma Binária para: ${w}`);

    // --- CRIAÇÃO DOS ESTADOS ---
    const q0 = new State('q0', false);

    const q_start_c0 = new State('q_start_c0', false);
    const q_start_c1 = new State('q_start_c1', false);

    const q_cross_0_c0 = new State('q_cross_0_c0', false);
    const q_cross_1_c0 = new State('q_cross_1_c0', false);
    const q_cross_0_c1 = new State('q_cross_0_c1', false);
    const q_cross_1_c1 = new State('q_cross_1_c1', false);

    const q_seek_op1_0_c0 = new State('q_seek_op1_0_c0', false);
    const q_seek_op1_1_c0 = new State('q_seek_op1_1_c0', false);
    const q_seek_op1_0_c1 = new State('q_seek_op1_0_c1', false);
    const q_seek_op1_1_c1 = new State('q_seek_op1_1_c1', false);

    const q_flush_op1_c0 = new State('q_flush_op1_c0', false);
    const q_flush_op1_c1 = new State('q_flush_op1_c1', false);

    const q_write_0_c0 = new State('q_write_0_c0', false);
    const q_write_1_c0 = new State('q_write_1_c0', false);
    const q_write_0_c1 = new State('q_write_0_c1', false);
    const q_write_1_c1 = new State('q_write_1_c1', false);

    const q_return_c0 = new State('q_return_c0', false);
    const q_return_c1 = new State('q_return_c1', false);

    const qFim = new State('qFim', true);

    // --- TRANSIÇÕES ---
    // Inicialização
    q0.addTransition(q0, '0', '0', 'D');
    q0.addTransition(q0, '1', '1', 'D');
    q0.addTransition(q0, '+', '+', 'D');
    q0.addTransition(q_start_c0, '=', '=', 'E');

    // Leitura Op2
    [q_start_c0, q_start_c1].forEach(s => {
        s.addTransition(s, 'x', 'x', 'E');
        s.addTransition(s, 'y', 'y', 'E');
    });
    q_start_c0.addTransition(q_cross_0_c0, '0', 'x', 'E');
    q_start_c0.addTransition(q_cross_1_c0, '1', 'y', 'E');
    q_start_c1.addTransition(q_cross_0_c1, '0', 'x', 'E');
    q_start_c1.addTransition(q_cross_1_c1, '1', 'y', 'E');
    q_start_c0.addTransition(q_flush_op1_c0, '+', '+', 'E');
    q_start_c1.addTransition(q_flush_op1_c1, '+', '+', 'E');

    // Travessia (Ignora tudo até +)
    [q_cross_0_c0, q_cross_1_c0, q_cross_0_c1, q_cross_1_c1].forEach(s => {
        ['0', '1', 'x', 'y'].forEach(c => s.addTransition(s, c, c, 'E'));
    });
    q_cross_0_c0.addTransition(q_seek_op1_0_c0, '+', '+', 'E');
    q_cross_1_c0.addTransition(q_seek_op1_1_c0, '+', '+', 'E');
    q_cross_0_c1.addTransition(q_seek_op1_0_c1, '+', '+', 'E');
    q_cross_1_c1.addTransition(q_seek_op1_1_c1, '+', '+', 'E');

    // Busca Op1
    [q_seek_op1_0_c0, q_seek_op1_1_c0, q_seek_op1_0_c1, q_seek_op1_1_c1].forEach(s => {
        s.addTransition(s, 'x', 'x', 'E');
        s.addTransition(s, 'y', 'y', 'E');
    });

    // SOMA
    // Op2=0, C=0
    q_seek_op1_0_c0.addTransition(q_write_0_c0, '0', 'x', 'D');
    q_seek_op1_0_c0.addTransition(q_write_1_c0, '1', 'y', 'D');
    q_seek_op1_0_c0.addTransition(q_write_0_c0, '_', '_', 'D');

    // Op2=1, C=0
    q_seek_op1_1_c0.addTransition(q_write_1_c0, '0', 'x', 'D');
    q_seek_op1_1_c0.addTransition(q_write_0_c1, '1', 'y', 'D');
    q_seek_op1_1_c0.addTransition(q_write_1_c0, '_', '_', 'D');

    // Op2=0, C=1
    q_seek_op1_0_c1.addTransition(q_write_1_c0, '0', 'x', 'D');
    q_seek_op1_0_c1.addTransition(q_write_0_c1, '1', 'y', 'D');
    q_seek_op1_0_c1.addTransition(q_write_1_c0, '_', '_', 'D');

    // Op2=1, C=1
    q_seek_op1_1_c1.addTransition(q_write_0_c1, '0', 'x', 'D');
    q_seek_op1_1_c1.addTransition(q_write_1_c1, '1', 'y', 'D');
    q_seek_op1_1_c1.addTransition(q_write_0_c1, '_', '_', 'D');

    // Flush
    [q_flush_op1_c0, q_flush_op1_c1].forEach(s => {
        s.addTransition(s, 'x', 'x', 'E');
        s.addTransition(s, 'y', 'y', 'E');
    });
    // Flush C0
    q_flush_op1_c0.addTransition(q_write_0_c0, '0', 'x', 'D');
    q_flush_op1_c0.addTransition(q_write_1_c0, '1', 'y', 'D');
    q_flush_op1_c0.addTransition(qFim, '_', '_', 'D');
    // Flush C1
    q_flush_op1_c1.addTransition(q_write_1_c0, '0', 'x', 'D');
    q_flush_op1_c1.addTransition(q_write_0_c1, '1', 'y', 'D');
    q_flush_op1_c1.addTransition(q_write_1_c0, '_', '_', 'D');

    // Escrita
    [q_write_0_c0, q_write_1_c0, q_write_0_c1, q_write_1_c1].forEach(s => {
        ['0', '1', 'x', 'y', '+', '='].forEach(c => s.addTransition(s, c, c, 'D'));
    });

    q_write_0_c0.addTransition(q_return_c0, '_', '0', 'E');
    q_write_1_c0.addTransition(q_return_c0, '_', '1', 'E');
    q_write_0_c1.addTransition(q_return_c1, '_', '0', 'E');
    q_write_1_c1.addTransition(q_return_c1, '_', '1', 'E');

    // Retorno
    [q_return_c0, q_return_c1].forEach(s => {
        s.addTransition(s, '0', '0', 'E');
        s.addTransition(s, '1', '1', 'E');
    });
    q_return_c0.addTransition(q_start_c0, '=', '=', 'E');
    q_return_c1.addTransition(q_start_c1, '=', '=', 'E');

    // Inicializa TM
    this.tm.initialize(q0, w, 20);
  }

  setupMultiplicacaoPor3(value: string): void {
    const q0 = new State('q0', true);
    const q1 = new State('q1', false);
    const q2 = new State('q2', false);

    q0.addTransition(q0, '0', 'a', 'D')
    q0.addTransition(q1, '1', 'b', 'D')

    q1.addTransition(q0, '1', 'a', 'D')
    q1.addTransition(q2, '0', 'b', 'D')

    q2.addTransition(q2, '1', 'b', 'D')
    q2.addTransition(q1, '0', 'a', 'D')
    this.tm.initialize(q0, value, 20);
  }

  setupGramaticaRegular(value: string): void {
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

    this.tm.initialize(q0, value, 20);

  }

  setupGramaticaSensivelAoContexto(value: string): void {
    if (!value) value = 'abc';
    // Nota: Para este algoritmo não usamos '=' no final, ele para no vazio '_'

    console.log(`[Calc] Configurando a^n b^n c^n para: ${value}`);

    const q0 = new State('q0', false);
    const q1 = new State('q1', false);
    const q2 = new State('q2', false);
    const q3 = new State('q3', false);
    const q4 = new State('q4', false);
    const qFim = new State('qFim', true);


    q0.addTransition(q1, 'a', 'A', 'D');
    q0.addTransition(q4, 'B', 'B', 'D');

    q1.addTransition(q1, 'a', 'a', 'D');
    q1.addTransition(q1, 'B', 'B', 'D');
    q1.addTransition(q2, 'b', 'B', 'D');

    q2.addTransition(q2, 'b', 'b', 'D');
    q2.addTransition(q2, 'C', 'C', 'D');
    q2.addTransition(q3, 'c', 'C', 'E');

    ['a', 'b', 'B', 'C'].forEach(char => {
        q3.addTransition(q3, char, char, 'E');
    });
    q3.addTransition(q0, 'A', 'A', 'D');

    q4.addTransition(q4, 'B', 'B', 'D');
    q4.addTransition(q4, 'C', 'C', 'D');
    q4.addTransition(qFim, '_', '_', 'D');

    this.tm.initialize(q0, value, 20);

  }

  setupPalindromo(value: string): void {
    console.log(`[Calc] Configurando Palíndromo para: ${value}`);

    this.savedInput = value;

    const q0 = new State('q0', false); // Estado Inicial (Lê esquerda)
    const q1 = new State('q1', false); // Vai p/ direita procurando par do '0'
    const q2 = new State('q2', false); // Vai p/ direita procurando par do '1'
    const q3 = new State('q3', false); // Verifica par do '0'
    const q4 = new State('q4', false); // Verifica par do '1'
    const q5 = new State('q5', false); // Volta p/ esquerda (Backtrack)
    const qFim = new State('qFim', true); // Aceita


    q0.addTransition(q1, '0', '_', 'D');
    q0.addTransition(q1, 'a', '_', 'D');
    q0.addTransition(q2, '1', '_', 'D');
    q0.addTransition(q2, 'b', '_', 'D');
    q0.addTransition(qFim, '_', '_', 'D');

    q1.addTransition(q1, '0', '0', 'D');
    q1.addTransition(q1, 'a', 'a', 'D');
    q1.addTransition(q1, '1', '1', 'D');
    q1.addTransition(q1, 'b', 'b', 'D');
    q1.addTransition(q3, '_', '_', 'E');

    q2.addTransition(q2, '0', '0', 'D');
    q2.addTransition(q2, 'a', 'a', 'D');
    q2.addTransition(q2, '1', '1', 'D');
    q2.addTransition(q2, 'b', 'b', 'D');
    q2.addTransition(q4, '_', '_', 'E');

    q3.addTransition(q5, '0', '_', 'E');
    q3.addTransition(q5, 'a', '_', 'E');
    q3.addTransition(qFim, '_', '_', 'D');

    q4.addTransition(q5, '1', '_', 'E');
    q4.addTransition(q5, 'b', '_', 'E');
    q4.addTransition(qFim, '_', '_', 'D');

    q5.addTransition(q5, '0', '0', 'E');
    q5.addTransition(q5, 'a', 'a', 'E');
    q5.addTransition(q5, '1', '1', 'E');
    q5.addTransition(q5, 'b', 'b', 'E');
    q5.addTransition(q0, '_', '_', 'D');

    this.tm.initialize(q0, value, 20);
  }
  private savedInput: string = '';

  extractResult(tape: string[], isFinalState: boolean, machineType: string): string {

    if (machineType === 'soma' || machineType === 'subtracao') {
        const indexIgual = tape.indexOf('=');
        if (indexIgual === -1) return 'Erro: "=" não encontrado';

        let binaryReverse = '';
        for (let i = indexIgual + 1; i < tape.length; i++) {
            const char = tape[i];
            if (char === '_' || char === undefined) break;
            binaryReverse += char;
        }

        if (!binaryReverse) return '0';

        const binaryNormal = binaryReverse.split('').reverse().join('');
        const decimal = parseInt(binaryNormal, 2);

        return `Binário: ${binaryNormal} | Decimal: ${decimal}`;
    }
    else if (machineType === 'palindromo' ) {
        if (isFinalState) {
            return `ACEITO: A cadeia '${this.savedInput}' é um palíndromo.`;
        } else {
            return `REJEITADO: A cadeia '${this.savedInput}' não é um palíndromo.`;
        }
    }
    else {
        if (isFinalState) {
            return "ACEITO: A cadeia pertence à linguagem.";
        } else {
            return "REJEITADO: A cadeia não é válida.";
        }
    }
  }

}
