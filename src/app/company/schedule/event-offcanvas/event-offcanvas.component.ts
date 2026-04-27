import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  description?: string;
}

@Component({
  selector: 'app-event-offcanvas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './event-offcanvas.component.html',
  styleUrl: './event-offcanvas.component.css'
})
export class EventOffcanvasComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() selectedDate: Date | null = null;
  @Input() selectedEvent: CalendarEvent | null = null;
  @Input() mode: 'view' | 'create' | 'edit' = 'create';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CalendarEvent>();
  @Output() delete = new EventEmitter<CalendarEvent>();
  @Output() edit = new EventEmitter<CalendarEvent>();

  eventForm!: FormGroup;
  services = [
    { id: 1, name: 'Cabelo', color: '#ffc107' },
    { id: 2, name: 'Barba', color: '#0d6efd' },
    { id: 3, name: 'Manicure', color: '#198754' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(): void {
    if (this.mode === 'view' && this.selectedEvent) {
      this.populateForm(this.selectedEvent);
    } else if (this.mode === 'create' && this.selectedDate) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      service: ['', Validators.required],
      date: [this.selectedDate ? this.formatDate(this.selectedDate) : '', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      description: [''],
      color: ['blue']
    });
  }

  private populateForm(event: CalendarEvent): void {
    this.eventForm = this.fb.group({
      title: [event.title, Validators.required],
      service: [event.title, Validators.required],
      date: [this.formatDate(event.start), Validators.required],
      startTime: [this.formatTime(event.start), Validators.required],
      endTime: [this.formatTime(event.end), Validators.required],
      description: [event.description || ''],
      color: [event.color || 'blue']
    });
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  private formatTime(date: Date): string {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.eventForm.valid) {
      const formValue = this.eventForm.value;
      const event: CalendarEvent = {
        id: this.selectedEvent?.id || Math.random().toString(),
        title: formValue.title,
        start: new Date(`${formValue.date}T${formValue.startTime}`),
        end: new Date(`${formValue.date}T${formValue.endTime}`),
        color: formValue.color,
        description: formValue.description
      };
      this.save.emit(event);
    }
  }

  onEdit(): void {
    if (this.selectedEvent) {
      this.edit.emit(this.selectedEvent);
    }
  }

  onDelete(): void {
    if (this.selectedEvent && confirm('Tem certeza que deseja deletar este agendamento?')) {
      this.delete.emit(this.selectedEvent);
    }
  }

  getServiceColor(serviceName: string): string {
    const service = this.services.find(s => s.name === serviceName);
    return service?.color || '#0d6efd';
  }
}

