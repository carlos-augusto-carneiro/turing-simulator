import { Component, signal } from '@angular/core';
import { TapeVisualizer } from './components/tape-visualizer/tape-visualizer';

@Component({
  selector: 'app-root',
  imports: [TapeVisualizer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
