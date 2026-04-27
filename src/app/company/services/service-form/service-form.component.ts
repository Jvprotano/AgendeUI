import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Service } from '../services.component';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceFormComponent implements OnInit {
  @Input() service: Service | null = null;

  form!: FormGroup;
  availableIcons = ['briefcase', 'scissors', 'hand-index', 'heart', 'star', 'gift'];

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    if (!this.service) {
      this.service = {
        id: '',
        name: '',
        description: '',
        price: 0,
        duration: 30,
        icon: 'briefcase',
        active: true
      };
    }

    this.form = this.fb.group({
      name: [this.service.name || '', [Validators.required, Validators.minLength(3)]],
      description: [this.service.description || '', [Validators.required]],
      price: [this.service.price || 0, [Validators.required, Validators.min(0)]],
      duration: [this.service.duration || 30, [Validators.required, Validators.min(5)]],
      icon: [this.service.icon || 'briefcase'],
      active: [this.service.active ?? true]
    });
  }

  onSubmit(): void {
    if (this.form.valid && this.service) {
      const formValue = this.form.value;
      const result: Service = {
        ...this.service,
        ...formValue
      };
      this.activeModal.close(result);
    }
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }
}

