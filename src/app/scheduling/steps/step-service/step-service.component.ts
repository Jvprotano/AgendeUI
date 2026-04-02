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
import { CurrencyFormatPipe } from '../../../utils/currency-format.pipe';

@Component({
  selector: 'app-step-service',
  standalone: true,
  imports: [CommonModule, TranslateModule, CurrencyFormatPipe],
  templateUrl: './step-service.component.html',
  styleUrl: './step-service.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepServiceComponent {
  @Input() services: ServiceOffered[] = [];
  @Input() selectedService: ServiceOffered | null = null;
  @Output() serviceSelected = new EventEmitter<ServiceOffered>();

  selectService(service: ServiceOffered) {
    this.serviceSelected.emit(service);
  }

  isSelected(service: ServiceOffered): boolean {
    return this.selectedService?.id === service.id;
  }

  formatDuration(duration?: string): string {
    if (!duration) return '';
    const parts = duration.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (hours > 0 && minutes > 0) return `${hours}h${minutes}min`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    return '';
  }
}
