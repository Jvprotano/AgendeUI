import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CompanyService } from '../../services/company.service';
import {
  CompanyEmployee,
  CompanyEmployeeRequest,
} from '../../models/company-employee';
import { ServiceOffered } from '../../../scheduling/models/service_offered';

export interface EmployeeFormData {
  companyId: string;
  services: ServiceOffered[];
  employee?: CompanyEmployee;
}

function requireAtLeastOneService(
  control: AbstractControl,
): ValidationErrors | null {
  const serviceIds = control.value as string[] | null | undefined;
  return Array.isArray(serviceIds) && serviceIds.length > 0
    ? null
    : { required: true };
}

@Component({
  selector: 'app-employee-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
})
export class EmployeeFormComponent implements OnInit {
  data!: EmployeeFormData;
  form!: FormGroup;
  isSubmitting = false;

  private destroyRef = inject(DestroyRef);

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private companyService: CompanyService,
    private cdr: ChangeDetectorRef,
  ) {}

  get isEditMode(): boolean {
    return !!this.data?.employee?.userId;
  }

  get services(): ServiceOffered[] {
    return this.data?.services ?? [];
  }

  ngOnInit(): void {
    const employee = this.data.employee;
    const selectedServiceIds = (employee?.services ?? [])
      .map((service) => service.id)
      .filter((serviceId): serviceId is string => !!serviceId);

    this.form = this.fb.group({
      email: [
        employee?.userEmail ?? '',
        this.isEditMode
          ? []
          : [Validators.required, Validators.email, Validators.maxLength(150)],
      ],
      firstName: [this.extractFirstName(employee?.userName), [Validators.maxLength(100)]],
      lastName: [this.extractLastName(employee?.userName), [Validators.maxLength(100)]],
      description: [employee?.description ?? '', [Validators.maxLength(500)]],
      serviceIds: [selectedServiceIds, [requireAtLeastOneService]],
    });

    if (this.isEditMode) {
      this.form.get('email')?.disable();
      this.form.get('firstName')?.disable();
      this.form.get('lastName')?.disable();
      this.form.get('description')?.disable();
    }
  }

  isServiceSelected(serviceId?: string): boolean {
    if (!serviceId) return false;
    return (this.form.get('serviceIds')?.value as string[]).includes(serviceId);
  }

  toggleService(serviceId?: string): void {
    if (!serviceId || this.isSubmitting) return;

    const currentValues = [...(this.form.get('serviceIds')?.value as string[])];
    const nextValues = currentValues.includes(serviceId)
      ? currentValues.filter((id) => id !== serviceId)
      : [...currentValues, serviceId];

    this.form.get('serviceIds')?.setValue(nextValues);
    this.form.get('serviceIds')?.markAsTouched();
    this.form.get('serviceIds')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    if (this.isEditMode) {
      const serviceIds = this.getSelectedServiceIds();

      this.companyService
        .updateEmployeeServices(this.data.companyId, this.data.employee!.userId!, {
          serviceIds,
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.activeModal.close({
              action: 'updated',
              employee: {
                ...this.data.employee,
                services: this.getSelectedServices(serviceIds),
              },
            });
          },
          error: () => {
            this.isSubmitting = false;
            this.cdr.markForCheck();
          },
        });

      return;
    }

    const formValue = this.form.getRawValue();
    const payload: CompanyEmployeeRequest = {
      userId: null,
      firstName: this.normalizeOptionalText(formValue.firstName),
      lastName: this.normalizeOptionalText(formValue.lastName),
      email: formValue.email.trim().toLowerCase(),
      description: this.normalizeOptionalText(formValue.description),
      isOwner: false,
      serviceIds: this.getSelectedServiceIds(),
    };

    this.companyService
      .addEmployee(this.data.companyId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (employee) => {
          this.activeModal.close({
            action: 'created',
            employee,
          });
        },
        error: () => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        },
      });
  }

  private getSelectedServiceIds(): string[] {
    return [...(this.form.get('serviceIds')?.value as string[])];
  }

  private getSelectedServices(serviceIds: string[]): ServiceOffered[] {
    return this.services.filter(
      (service) => service.id && serviceIds.includes(service.id),
    );
  }

  private normalizeOptionalText(value?: string): string | undefined {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  }

  private extractFirstName(fullName?: string): string {
    if (!fullName) return '';
    const [firstName] = fullName.trim().split(/\s+/);
    return firstName ?? '';
  }

  private extractLastName(fullName?: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    return parts.slice(1).join(' ');
  }
}
