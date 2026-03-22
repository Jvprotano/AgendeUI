import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CompanyService } from '../../services/company.service';
import { ServiceOffered } from '../../../scheduling/models/service_offered';

export interface ServiceFormData {
  service?: ServiceOffered;
  companyId: string;
}

export const DURATION_PRESETS = [
  { label: '15min', value: '00:15:00' },
  { label: '30min', value: '00:30:00' },
  { label: '45min', value: '00:45:00' },
  { label: '1h', value: '01:00:00' },
  { label: '1h30', value: '01:30:00' },
  { label: '2h', value: '02:00:00' },
];

@Component({
  selector: 'app-service-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './service-form.component.html',
  styleUrl: './service-form.component.scss',
})
export class ServiceFormComponent implements OnInit {
  data!: ServiceFormData;
  form!: FormGroup;
  isSubmitting = false;

  readonly durationPresets = DURATION_PRESETS;

  private destroyRef = inject(DestroyRef);

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private companyService: CompanyService,
    private cdr: ChangeDetectorRef,
  ) {}

  get isEditMode(): boolean {
    return !!this.data?.service?.id;
  }

  ngOnInit(): void {
    const s = this.data?.service;
    this.form = this.fb.group({
      name: [s?.name || '', [Validators.required, Validators.maxLength(100)]],
      price: [s?.price ?? null, [Validators.required, Validators.min(0)]],
      duration: [s?.duration || ''],
      description: [s?.description || '', [Validators.maxLength(500)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const formValue = this.form.getRawValue();
    const payload: ServiceOffered = {
      name: formValue.name.trim(),
      price: formValue.price,
      duration: formValue.duration || undefined,
      description: formValue.description?.trim() || undefined,
      companyId: this.data.companyId,
    };

    if (this.isEditMode) {
      payload.id = this.data.service!.id;
      this.companyService
        .updateService(this.data.companyId, this.data.service!.id!, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.activeModal.close({ action: 'updated', service: { ...this.data.service, ...payload } });
          },
          error: () => {
            this.isSubmitting = false;
            this.cdr.markForCheck();
          },
        });
    } else {
      this.companyService
        .addService(this.data.companyId, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (created) => {
            this.activeModal.close({ action: 'created', service: created });
          },
          error: () => {
            this.isSubmitting = false;
            this.cdr.markForCheck();
          },
        });
    }
  }
}
