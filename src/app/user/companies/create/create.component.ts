import { Component, Input, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BusinessSectorComponent } from './business-sector/business-sector.component';
import { LocationService } from '../../../company/services/location.service';
import { Company } from '../../../company/models/company';
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

@Component({
  selector: 'app-create',
  standalone: true,
  providers: [LocationService, CompanyService],
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
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
export class CreateComponent {
  createForm!: FormGroup;
  @Input() companyToEdit: Company | null = null;
  @Output() closed = new EventEmitter<void>();

  @ViewChild('modalContent', { static: true })
  modalContent!: TemplateRef<any>;

  currentStep = 0;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private companyService: CompanyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.initFormValidation(this.companyToEdit);
    this.openModal();
    this.spinner.hide();
  }

  onNextStep(data: any) {
    this.createForm.patchValue(data);
    this.currentStep++;
  }

  onPreviousStep() {
    this.currentStep--;
  }

  initFormValidation(company: Company | null) {
    this.createForm = this.fb.group({
      image: [company?.image],
      cnpj: [''],
      name: [company?.name],
      schedulingUrl: [company?.schedulingUrl],
    });
  }

  openModal() {
    const ref = this.modalService.open(this.modalContent, { size: 'lg', centered: true });
    ref.result.finally(() => this.closed.emit());
  }

  onSubmit(): void {
    let request = this.createForm.value as Company;
    request.schedule = request.schedule.filter((day: any) => day.isOpen);

    request.schedule.forEach((day: DaySchedule) => {
      day.intervals.forEach((interval) => {
        if (interval.start.length === 5)
          interval.start = interval.start + ':00';

        if (interval.end.length === 5)
          interval.end = interval.end + ':00';
      });
    });

    this.companyService
      .create(request)
      .pipe(take(1))
      .subscribe((result) => {
        this.modalService.dismissAll();
        this.router.navigate(['/company', result.id, 'schedule']);
      });
  }
}
