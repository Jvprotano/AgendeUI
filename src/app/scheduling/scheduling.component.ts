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
import { switchMap, throwError } from 'rxjs';

import { SchedulingService } from './services/scheduling.service';
import { CompanyService } from '../company/services/company.service';
import { AccountService } from '../account/services/account.service';
import { RedirectService } from '../services/redirect.service';
import { LoginComponent } from '../account/login/login.component';

import { Company, normalizeScheduleStatus, ScheduleStatus } from '../company/models/company';
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
  skipProfessionalStep = false;

  // Route params
  private companySlug = '';
  companyId = '';

  // Stepper config
  steps: StepDefinition[] = [];

  private allSteps: StepDefinition[] = [
    { label: 'SCHEDULING.STEPPER.SERVICE', icon: 'bi-tag' },
    { label: 'SCHEDULING.STEPPER.PROFESSIONAL', icon: 'bi-person' },
    { label: 'SCHEDULING.STEPPER.DATETIME', icon: 'bi-calendar3' },
    { label: 'SCHEDULING.STEPPER.CONFIRM', icon: 'bi-check-circle' },
  ];

  // Maps logical step (0-3) to display step index
  private stepMap: number[] = [];
  // Maps display step index back to logical step
  private reverseStepMap: number[] = [];

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

  get displayStep(): number {
    return this.stepMap[this.currentStep] ?? 0;
  }

  get progressPercent(): number {
    if (!this.steps.length) {
      return 0;
    }

    if (this.currentStep === 3) {
      return 100;
    }

    const maxIndex = Math.max(this.steps.length - 1, 1);
    return Math.round((this.displayStep / maxIndex) * 100);
  }

  get selectedDateLabel(): string {
    if (!this.selectedDate) {
      return '-';
    }

    const date = new Date(`${this.selectedDate}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? this.selectedDate
      : new Intl.DateTimeFormat('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        }).format(date);
  }

  get selectedDurationLabel(): string {
    const durationRaw = this.selectedService?.duration;
    const duration = Number(durationRaw);
    if (!duration || Number.isNaN(duration) || duration <= 0) {
      return '-';
    }

    if (duration < 60) {
      return `${duration} min`;
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    return minutes > 0
      ? `${hours}h ${minutes}min`
      : `${hours}h`;
  }

  // ─── Step navigation ───

  goToStep(displayIndex: number) {
    if (this.scheduleClosed) {
      return;
    }

    const logicalStep = this.reverseStepMap[displayIndex];
    if (logicalStep < this.currentStep || this.canAdvance()) {
      this.currentStep = logicalStep;
    }
  }

  goToNextStep() {
    if (this.scheduleClosed) {
      return;
    }

    if (this.canAdvance()) {
      const nextDisplay = this.displayStep + 1;
      if (nextDisplay < this.steps.length) {
        this.currentStep = this.reverseStepMap[nextDisplay];
      }
    }
  }

  goToPreviousStep() {
    if (this.scheduleClosed) {
      return;
    }

    if (this.displayStep > 0) {
      const prevDisplay = this.displayStep - 1;
      this.currentStep = this.reverseStepMap[prevDisplay];
    }
  }

  canAdvance(): boolean {
    if (this.scheduleClosed) {
      return false;
    }

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
    if (this.scheduleClosed) {
      return;
    }

    if (this.selectedService?.id === service.id) {
      this.selectedService = null;
    } else {
      this.selectedService = service;
    }

    this.syncProfessionalStepState();
    this.selectedDate = null;
    this.selectedTime = null;
  }

  // ─── Step 1: Professional selection ───

  onProfessionalSelected(professional: CompanyEmployee | null) {
    if (this.scheduleClosed) {
      return;
    }

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
    if (this.scheduleClosed) {
      return;
    }

    this.selectedDate = selection.date;
    this.selectedTime = selection.time;
  }

  // ─── Step 3: Confirm ───

  onConfirmed() {
    if (this.scheduleClosed) {
      this.toastr.warning(this.translate.instant('SCHEDULING.CLOSED.MESSAGE'));
      return;
    }

    if (!this.isLoggedIn) {
      this.openLoginModal();
      return;
    }
    this.submitBooking();
  }

  onLoginRequested() {
    if (this.scheduleClosed) {
      return;
    }

    this.openLoginModal();
  }

  onEditStep(step: number) {
    if (this.scheduleClosed) {
      return;
    }

    this.currentStep = step;
  }

  // ─── Step map ───

  private buildStepMap() {
    // Logical steps: 0=Service, 1=Professional, 2=DateTime, 3=Confirm
    const logicalSteps = this.skipProfessionalStep
      ? [0, 2, 3]
      : [0, 1, 2, 3];

    this.steps = logicalSteps.map(i => this.allSteps[i]);

    // stepMap: logicalStep → displayIndex
    this.stepMap = [0, 0, 0, 0];
    // reverseStepMap: displayIndex → logicalStep
    this.reverseStepMap = [];

    logicalSteps.forEach((logical, display) => {
      this.stepMap[logical] = display;
      this.reverseStepMap[display] = logical;
    });
  }

  get availableProfessionals(): CompanyEmployee[] {
    if (!this.selectedService?.id) {
      return this.professionals;
    }

    const linkedProfessionals = this.professionals.filter((professional) =>
      professional.services?.some((service) => service.id === this.selectedService?.id),
    );

    return linkedProfessionals.length > 0
      ? linkedProfessionals
      : this.professionals;
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
          this.scheduleClosed = normalizeScheduleStatus(result.scheduleStatus) === ScheduleStatus.CLOSED;
          this.services = result.servicesOffered ?? [];
          this.professionals = result.employeers ?? [];
          this.openingHours = result.openingHours ?? [];

          this.syncProfessionalStepState();
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
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    const scheduling: Scheduling = {
      companyId: this.companyId,
      serviceId: this.selectedService?.id ?? '',
      professionalId: this.noPreferenceSelected
        ? undefined
        : this.selectedProfessional?.userId,
      date: this.selectedDate!,
      time: this.toApiTime(this.selectedTime!),
    };

    this.companyService
      .getBySchedulingUrl(this.companySlug)
      .pipe(
        switchMap((company) => {
          if (!company?.id) {
            return throwError(() => ({ code: 'COMPANY_NOT_FOUND' }));
          }

          this.company = company;
          this.scheduleClosed =
            normalizeScheduleStatus(company.scheduleStatus) === ScheduleStatus.CLOSED;

          if (this.scheduleClosed) {
            return throwError(() => ({ code: 'SCHEDULE_CLOSED' }));
          }

          return this.schedulingService.getAvailableTimes(
            scheduling.date,
            scheduling.professionalId ?? '',
            scheduling.companyId,
            scheduling.serviceId,
          );
        }),
        switchMap((availableTimes) => {
          const normalizedSelectedTime = scheduling.time.substring(0, 5);
          const slotStillAvailable = (availableTimes ?? []).some(
            (time) => time.substring(0, 5) === normalizedSelectedTime,
          );

          if (!slotStillAvailable) {
            return throwError(() => ({ code: 'SLOT_UNAVAILABLE' }));
          }

          return this.schedulingService.schedule(scheduling);
        }),
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
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
          this.showBookingError(err);
        },
        complete: () => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        },
      });
  }

  private syncProfessionalStepState(): void {
    const availableProfessionals = this.availableProfessionals;

    if (availableProfessionals.length === 1) {
      this.selectedProfessional = availableProfessionals[0];
      this.noPreferenceSelected = false;
    } else if (
      this.selectedProfessional &&
      !availableProfessionals.some(
        (professional) => professional.userId === this.selectedProfessional?.userId,
      )
    ) {
      this.selectedProfessional = null;
    }

    this.skipProfessionalStep = availableProfessionals.length === 1;

    if (this.skipProfessionalStep && this.currentStep === 1) {
      this.currentStep = 2;
    }

    this.buildStepMap();
  }

  private showBookingError(err: any): void {
    if (err?.code === 'SCHEDULE_CLOSED') {
      this.toastr.warning(this.translate.instant('SCHEDULING.CLOSED.MESSAGE'));
      return;
    }

    if (err?.code === 'SLOT_UNAVAILABLE') {
      this.selectedTime = null;
      this.cdr.markForCheck();
      this.toastr.warning(this.translate.instant('ERROR.CODES.SLOT_UNAVAILABLE'));
      return;
    }

    const msg =
      err?.error ??
      err?.message ??
      this.translate.instant('SCHEDULING.ERRORS.BOOKING_FAILED');
    this.toastr.error(msg);
  }

  private toApiTime(time: string): string {
    return time.length === 5 ? `${time}:00` : time;
  }

  // ─── Login modal ───

  private openLoginModal(): void {
    this.redirectService.setReturnRoute(this.router.url);

    const modalRef = this.modalService.open(LoginComponent, {
      centered: true,
      backdrop: true,
      keyboard: true,
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
        // Modal dismissed without authentication - do not submit.
        this.cdr.markForCheck();
      },
    );
  }
}
