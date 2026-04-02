import { Component, Output, EventEmitter, TemplateRef, ViewChild, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BusinessSectorComponent } from './business-sector/business-sector.component';
import { BasicInfoComponent } from './basic-info/basic-info.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CompanyService } from '../../../company/services/company.service';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { DaySchedule } from '../../../company/models/business-hours';
import { ToastrService } from 'ngx-toastr';
import { buildScheduleFormArray } from '../../../company/models/schedule-form.helper';
import { scheduleToOpeningHours } from '../../../company/models/schedule-mapper';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgxSpinnerModule,
    CommonModule,
    FormsModule,
    NgbModalModule,
    MatProgressBarModule,
    BasicInfoComponent,
    BusinessSectorComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css',
})
export class CreateComponent implements OnInit {
  form!: FormGroup;
  @Output() closed = new EventEmitter<void>();

  @ViewChild('modalContent', { static: true })
  modalContent!: TemplateRef<any>;

  currentStep = 0;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private companyService: CompanyService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.openModal();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      image: [''],
      cnpj: [''],
      name: ['', Validators.required],
      schedulingUrl: ['', Validators.required],
      timeZoneId: ['America/Sao_Paulo'],
      schedule: buildScheduleFormArray(this.fb, []),
    });
  }

  onNextStep(): void {
    const name = this.form.get('name');
    const url = this.form.get('schedulingUrl');

    name?.markAsTouched();
    url?.markAsTouched();

    if (name?.invalid || url?.invalid) return;

    this.currentStep++;
  }

  onPreviousStep(): void {
    this.currentStep--;
  }

  openModal(): void {
    const ref = this.modalService.open(this.modalContent, {
      size: 'lg',
      centered: true,
    });
    ref.result.finally(() => this.closed.emit());
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const formValue = this.form.value;
    const filteredSchedule: DaySchedule[] = (formValue.schedule ?? []).filter(
      (day: DaySchedule) => day.isOpen,
    );

    const request = {
      ...formValue,
      openingHours: scheduleToOpeningHours(filteredSchedule),
    };
    delete request.schedule;

    this.companyService
      .create(request)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.modalService.dismissAll();
          this.router.navigate(['/company', result.id, 'schedule']);
        },
        error: () => {
          this.toastr.error('Erro ao criar empresa.');
        },
      });
  }
}
