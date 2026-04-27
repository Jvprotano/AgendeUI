import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Professional } from '../professionals.component';

@Component({
  selector: 'app-professional-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule, FormsModule],
  templateUrl: './professional-form.component.html',
  styleUrls: ['./professional-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfessionalFormComponent implements OnInit {
  @Input() professional: Professional | null = null;

  form!: FormGroup;
  specialtyInput = '';
  availableSpecialties = ['Corte', 'Barba', 'Manicure', 'Pedicure', 'Massagem', 'Limpeza de Pele'];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    if (!this.professional) {
      this.professional = {
        id: '',
        name: '',
        email: '',
        phone: '',
        specialties: [],
        active: true
      };
    }

    this.form = this.fb.group({
      name: [this.professional.name || '', [Validators.required, Validators.minLength(3)]],
      email: [this.professional.email || '', [Validators.required, Validators.email]],
      phone: [this.professional.phone || '', [Validators.required]],
      active: [this.professional.active ?? true]
    });
  }

  addSpecialty(specialty: string): void {
    if (this.professional && specialty && !this.professional.specialties.includes(specialty)) {
      this.professional.specialties.push(specialty);
      this.specialtyInput = '';
    }
  }

  removeSpecialty(specialty: string): void {
    if (this.professional) {
      const index = this.professional.specialties.indexOf(specialty);
      if (index > -1) {
        this.professional.specialties.splice(index, 1);
      }
    }
  }

  onSubmit(): void {
    if (this.form.valid && this.professional) {
      const formValue = this.form.value;
      const result: Professional = {
        ...this.professional,
        ...formValue
      };
      this.activeModal.close(result);
    }
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }
}

