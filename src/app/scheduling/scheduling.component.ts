import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { SchedulingService } from './services/scheduling.service';
import { Scheduling } from './models/scheduling';
import { ServiceOffered } from './models/service_offered';
import { CompanyEmployee } from '../company/models/company-employee';

import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CompanyService } from '../company/services/company.service';
import { CurrencyFormatPipe } from '../utils/currency-format.pipe';
import { AccountService } from '../account/services/account.service';
import { RedirectService } from '../services/redirect.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from '../account/login/login.component';
import { Company } from '../company/models/company';

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    CurrencyFormatPipe,
  ],
  templateUrl: './scheduling.component.html',
  styleUrl: './scheduling.component.css',
})
export class SchedulingComponent implements OnInit {
  serviceSelected?: ServiceOffered;
  professionalSelected?: CompanyEmployee;
  timesAvailable: string[] = [];
  timeSelected: string = '';
  companyName: string = '';

  schedulingForm!: FormGroup;
  Scheduling!: Scheduling;
  companyId: string = '';
  companyUrl: string = '';
  countSteps = 1;
  services: ServiceOffered[] = [];
  professionals: CompanyEmployee[] = [];
  isLoadingTimes = false;

  constructor(
    private fb: FormBuilder,
    private schedulingService: SchedulingService,
    private companyService: CompanyService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private accountService: AccountService,
    private redirectService: RedirectService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    if (!this.accountService.isLoggedUser()) {
      this.openLoginModal();
    }

    this.spinner.show();

    this.companyUrl = this.route.snapshot.params['id'];

    this.companyService.getBySchedulingUrl(this.companyUrl).subscribe({
      next: (result) => {
        this.companyName = result.name;
        this.companyUrl = result.id;

        if (result.id == null) {
          this.router.navigate(['/']).then(() => {
            this.toastr.error('Empresa não encontrada.');
          });
        }

        this.loadCompanyInformation(result);
      },
      error: () => this.toastr.error('Empresa não encontrada!'),
    });

    this.schedulingForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [''],
      email: [''],
      date: ['', Validators.required],
      professionalId: [''],
      serviceId: [''],
      time: [''],
    });

    this.spinner.hide();
  }

  loadCompanyInformation(companyResult: Company) {
    this.services = companyResult.servicesOffered ?? [];
    this.professionals = companyResult.employeers ?? [];
  }

  openLoginModal(): void {
    this.redirectService.setReturnRoute(this.router.url);

    const modalRef = this.modalService.open(LoginComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.result.then(
      () => {},
      () => {},
    );
  }

  atualizarProfissionais() {}

  checkProfessionalAndServiceAreSelected() {
    if (this.serviceSelected && this.professionalSelected) {
      const continueButton = document.getElementById('continueButton');
      if (continueButton) {
        continueButton.scrollIntoView({ behavior: 'smooth' });
        this.schedulingForm
          .get('professionalId')
          ?.setValue(this.professionalSelected.userId);
        this.schedulingForm.get('serviceId')?.setValue(this.serviceSelected.id);
      }
    }
  }

  selecionarProfissional(professional: CompanyEmployee) {
    if (this.professionalSelected == professional) {
      this.professionalSelected = undefined;
      return;
    }

    this.professionalSelected = professional;
    this.checkProfessionalAndServiceAreSelected();
  }

  selectService(service: ServiceOffered) {
    if (this.serviceSelected == service) {
      this.serviceSelected = undefined;
      return;
    }
    this.serviceSelected = service;
    this.checkProfessionalAndServiceAreSelected();
  }

  selectTime(time: string) {
    if (this.timeSelected == time) {
      this.timeSelected = '';
      return;
    }
    this.timeSelected = time;
  }

  isStepValid() {
    if (this.countSteps == 1) {
      return !!(this.professionalSelected && this.serviceSelected);
    }
    if (this.countSteps == 2) {
      return !!(this.hasDateSelected() && this.timeSelected);
    }
    return false;
  }

  updateTimesAvailable() {
    const date = this.schedulingForm.get('date')?.value;
    if (!date) return;

    this.isLoadingTimes = true;
    this.timesAvailable = [];

    this.schedulingService
      .getAvailableTimes(
        date,
        this.professionalSelected?.id ?? '',
        this.companyUrl,
        this.serviceSelected?.id ?? '',
      )
      .subscribe({
        next: (result) => {
          this.timesAvailable = Array.isArray(result) ? result : [];
          this.isLoadingTimes = false;
        },
        error: () => {
          this.toastr.error('Erro ao obter os horários disponíveis');
          this.timesAvailable = [];
          this.isLoadingTimes = false;
        },
      });
  }

  agendar() {
    if (!this.schedulingForm.valid) {
      this.toastr.warning('Preencha todos os campos obrigatórios.');
      return;
    }

    const scheduling: Scheduling = {
      companyId: this.companyUrl,
      serviceId: this.serviceSelected?.id ?? '',
      professionalId: this.professionalSelected?.userId,
      date: this.schedulingForm.get('date')?.value,
      time: this.timeSelected + ':00',
    };

    this.schedulingService.schedule(scheduling).subscribe({
      next: () => {
        this.processarSucesso();
      },
      error: (err) => {
        this.processarFalha(err);
      },
    });
  }

  processarFalha(response: any) {
    if (response.error) this.toastr.error(response.error, 'Opa :(');
    else this.toastr.error('Ocorreu um erro!', 'Opa :(');
  }

  processarSucesso() {
    this.router.navigate(['scheduling/success']).then(() => {
      this.toastr.success(
        'Agendamento realizado com sucesso!',
        'Você será notificado em breve com informações sobre o agendamento.',
      );
    });
  }

  goToNextStep() {
    this.countSteps++;
  }

  goToPreviousStep() {
    this.countSteps--;
  }

  hasDateSelected(): boolean {
    return this.schedulingForm.get('date')?.value;
  }
}
