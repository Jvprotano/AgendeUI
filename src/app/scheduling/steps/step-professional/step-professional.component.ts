import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CompanyEmployee } from '../../../company/models/company-employee';

@Component({
  selector: 'app-step-professional',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './step-professional.component.html',
  styleUrl: './step-professional.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepProfessionalComponent {
  @Input() professionals: CompanyEmployee[] = [];
  @Input() selectedProfessional: CompanyEmployee | null = null;
  @Input() noPreferenceSelected = false;
  @Output() professionalSelected = new EventEmitter<CompanyEmployee | null>();

  selectProfessional(professional: CompanyEmployee | null) {
    this.professionalSelected.emit(professional);
  }

  isSelected(professional: CompanyEmployee): boolean {
    return this.selectedProfessional?.id === professional.id && !this.noPreferenceSelected;
  }
}
