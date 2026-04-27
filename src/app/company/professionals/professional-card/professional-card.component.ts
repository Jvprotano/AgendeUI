import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Professional } from '../professionals.component';

@Component({
  selector: 'app-professional-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professional-card.component.html',
  styleUrls: ['./professional-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfessionalCardComponent {
  @Input() professional!: Professional;
  @Output() edit = new EventEmitter<Professional>();
  @Output() delete = new EventEmitter<Professional>();
  @Output() toggleActive = new EventEmitter<Professional>();

  onEdit(): void {
    this.edit.emit(this.professional);
  }

  onDelete(): void {
    this.delete.emit(this.professional);
  }

  onToggleActive(): void {
    this.toggleActive.emit(this.professional);
  }
}

