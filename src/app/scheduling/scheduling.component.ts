import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SchedulingService } from './services/scheduling.service';
import { CompanyService } from '../company/services/company.service';
import { AccountService } from '../account/services/account.service';
import { RedirectService } from '../services/redirect.service';
import { LoginComponent } from '../account/login/login.component';

import { Company, ScheduleStatus } from '../company/models/company';
import { ServiceOffered } from './models/service_offered';
import { CompanyEmployee } from '../company/models/company-employee';
import { Scheduling } from './models/scheduling';
import { OpeningHours } from '../company/models/opening_hours';

import { BookingStepperComponent, StepDefinition } from './components/booking-stepper/booking-stepper.component';
import { StepServiceComponent } from './steps/step-service/step-service.component';
import { StepProfessionalComponent } from './steps/step-professional/step-professional.component';
import { StepDatetimeComponent, DateTimeSelection } from './steps/step-datetime/step-datetime.component';
import { StepConfirmComponent } from './steps/step-confirm/step-confirm.component';

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    BookingStepperComponent,
    StepServiceComponent,
    StepProfessionalComponent,
    StepDatetimeComponent,
    StepConfirmComponent,
  ],
  templateUrl: './scheduling.component.html',
  styleUrl: './scheduling.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchedulingComponent implements OnInit {
  // Company data
  company: Company | null = null;
  services: ServiceOffered[] = [];
  professionals: CompanyEmployee[] = [];
  openingHours: OpeningHours[] = [];

  // Selections
  selectedService: ServiceOffered | null = null;
  selectedProfessional: CompanyEmployee | null = null;
  noPreferenceSelected = false;
  selectedDate: string | null = null;
  selectedTime: string | null = null;

  // UI state
  currentStep = 0;
  isLoading = true;
  isSubmitting = false;
  companyNotFound = false;
  scheduleClosed = false;

  // Route params
  private companySlug = '';
  companyId = '';

  // Stepper config
  steps: StepDefinition[] = [
    { label: 'SCHEDULING.STEPPER.SERVICE', icon: 'bi-tag' },
    { label: 'SCHEDULING.STEPPER.PROFESSIONAL', icon: 'bi-person' },
    { label: 'SCHEDULING.STEPPER.DATETIME', icon: 'bi-calendar3' },
    { label: 'SCHEDULING.STEPPER.CONFIRM', icon: 'bi-check-circle' },
  ];

  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private schedulingService: SchedulingService,
    private companyService: CompanyService,
    private accountService: AccountService,
    private redirectService: RedirectService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.companySlug = this.route.snapshot.params['id'];
    this.loadCompany();
  }

  get isLoggedIn(): boolean {
    return this.accountService.isLoggedUser();
  }

  // ─── Step navigation ───

  goToStep(step: number) {
    if (step < this.currentStep || this.canAdvance()) {
      this.currentStep = step;
    }
  }

  goToNextStep() {
    if (this.canAdvance()) {
      this.currentStep++;
    }
  }

  goToPreviousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  canAdvance(): boolean {
    switch (this.currentStep) {
      case 0: return !!this.selectedService;
      case 1: return !!this.selectedProfessional || this.noPreferenceSelected;
      case 2: return !!this.selectedDate && !!this.selectedTime;
      case 3: return false;
      default: return false;
    }
  }

  // ─── Step 0: Service selection ───

  onServiceSelected(service: ServiceOffered) {
    if (this.selectedService?.id === service.id) {
      this.selectedService = null;
    } else {
      this.selectedService = service;
    }
  }

  // ─── Step 1: Professional selection ───

  onProfessionalSelected(professional: CompanyEmployee | null) {
    if (professional === null) {
      // "No preference" toggle
      if (this.noPreferenceSelected) {
        this.noPreferenceSelected = false;
        this.selectedProfessional = null;
      } else {
        this.noPreferenceSelected = true;
        this.selectedProfessional = null;
      }
    } else {
      if (this.selectedProfessional?.id === professional.id && !this.noPreferenceSelected) {
        this.selectedProfessional = null;
      } else {
        this.noPreferenceSelected = false;
        this.selectedProfessional = professional;
      }
    }
    // Reset datetime when professional changes (affects availability)
    this.selectedDate = null;
    this.selectedTime = null;
  }

  // ─── Step 2: Date & Time selection ───

  onDateTimeSelected(selection: DateTimeSelection) {
    this.selectedDate = selection.date;
    this.selectedTime = selection.time;
  }

  // ─── Step 3: Confirm ───

  onConfirmed() {
    if (!this.isLoggedIn) {
      this.openLoginModal();
      return;
    }
    this.submitBooking();
  }

  onGuestConfirmed() {
    this.submitBooking();
  }

  onLoginRequested() {
    this.openLoginModal();
  }

  onEditStep(step: number) {
    this.currentStep = step;
  }

  // ─── Data loading ───

  private loadCompany() {
    this.isLoading = true;
    this.companyService
      .getBySchedulingUrl(this.companySlug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (!result || !result.id) {
            this.companyNotFound = true;
            this.isLoading = false;
            this.cdr.markForCheck();
            this.router.navigate(['/']).then(() => {
              this.toastr.error(
                this.translate.instant('SCHEDULING.ERRORS.COMPANY_NOT_FOUND'),
              );
            });
            return;
          }

          this.company = result;
          this.companyId = result.id;
          this.scheduleClosed = result.scheduleStatus === ScheduleStatus.CLOSED;
          this.services = result.servicesOffered ?? [];
          this.professionals = result.employeers ?? [];
          this.openingHours = result.openingHours ?? [];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.toastr.error(
            this.translate.instant('SCHEDULING.ERRORS.COMPANY_NOT_FOUND'),
          );
          this.companyNotFound = true;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  // ─── Booking submission ───

  private submitBooking() {
    this.isSubmitting = true;
    this.cdr.markForCheck();

    const scheduling: Scheduling = {
      companyId: this.companyId,
      serviceId: this.selectedService?.id ?? '',
      professionalId: this.noPreferenceSelected
        ? undefined
        : this.selectedProfessional?.userId,
      date: this.selectedDate!,
      time: this.selectedTime + ':00',
    };

    this.schedulingService
      .schedule(scheduling)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['scheduling/success']).then(() => {
            this.toastr.success(
              this.translate.instant('SCHEDULING.SUCCESS.MESSAGE'),
              this.translate.instant('SCHEDULING.SUCCESS.TITLE'),
            );
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
          const msg = err?.error
            ?? this.translate.instant('SCHEDULING.ERRORS.BOOKING_FAILED');
          this.toastr.error(msg);
        },
      });
  }

  // ─── Login modal ───

  private openLoginModal(): void {
    this.redirectService.setReturnRoute(this.router.url);

    const modalRef = this.modalService.open(LoginComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.result.then(
      () => {
        // Modal closed after successful login — submit the booking
        if (this.isLoggedIn) {
          this.submitBooking();
        }
        this.cdr.markForCheck();
      },
      () => {
        // Modal dismissed (guest login)
        this.submitBooking();
        this.cdr.markForCheck();
      },
    );
  }
}
