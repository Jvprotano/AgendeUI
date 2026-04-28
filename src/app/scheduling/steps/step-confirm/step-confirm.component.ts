import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ServiceOffered } from '../../models/service_offered';
import { CompanyEmployee } from '../../../company/models/company-employee';
import { Company } from '../../../company/models/company';
import { CurrencyFormatPipe } from '../../../utils/currency-format.pipe';

@Component({
  selector: 'app-step-confirm',
  standalone: true,
  imports: [CommonModule, TranslateModule, CurrencyFormatPipe],
  templateUrl: './step-confirm.component.html',
  styleUrl: './step-confirm.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepConfirmComponent {
  @Input() company: Company | null = null;
  @Input() service: ServiceOffered | null = null;
  @Input() professional: CompanyEmployee | null = null;
  @Input() noPreference = false;
  @Input() date: string | null = null;
  @Input() time: string | null = null;
  @Input() isSubmitting = false;
  @Input() isLoggedIn = false;
  @Input() skipProfessionalStep = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() loginRequested = new EventEmitter<void>();
  @Output() editStep = new EventEmitter<number>();

  get formattedDate(): string {
    if (!this.date) return '';
    const [year, month, day] = this.date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  onConfirm() {
    this.confirmed.emit();
  }

  onLogin() {
    this.loginRequested.emit();
  }

  onEditStep(step: number) {
    this.editStep.emit(step);
  }
}
