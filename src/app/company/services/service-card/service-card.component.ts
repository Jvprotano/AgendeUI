import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service } from '../services.component';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceCardComponent {
  @Input() service!: Service;
  @Output() edit = new EventEmitter<Service>();
  @Output() delete = new EventEmitter<Service>();
  @Output() toggleActive = new EventEmitter<Service>();

  onEdit(): void {
    this.edit.emit(this.service);
  }

  onDelete(): void {
    this.delete.emit(this.service);
  }

  onToggleActive(): void {
    this.toggleActive.emit(this.service);
  }
}

