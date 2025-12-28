import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal } from './modal/modal';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, FormsModule, Modal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('stockmaster-client');
}
