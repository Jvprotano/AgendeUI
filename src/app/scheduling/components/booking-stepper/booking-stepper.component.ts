import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export interface StepDefinition {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-booking-stepper',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './booking-stepper.component.html',
  styleUrl: './booking-stepper.component.scss',
})
export class BookingStepperComponent {
  @Input() steps: StepDefinition[] = [];
  @Input() currentStep = 0;
  @Output() stepClicked = new EventEmitter<number>();

  onStepClick(index: number) {
    if (index < this.currentStep) {
      this.stepClicked.emit(index);
    }
  }
}
