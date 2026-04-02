import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { BasicInfoComponent } from '../../user/companies/create/basic-info/basic-info.component';
import { BusinessSectorComponent } from '../../user/companies/create/business-sector/business-sector.component';
import { CompanyService } from '../services/company.service';
import { Company } from '../models/company';
import { DaySchedule } from '../models/business-hours';
import { openingHoursToSchedule, scheduleToOpeningHours } from '../models/schedule-mapper';
import { buildScheduleFormArray } from '../models/schedule-form.helper';

@Component({
  selector: 'app-company-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    BasicInfoComponent,
    BusinessSectorComponent,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './company-edit.component.html',
  styleUrl: './company-edit.component.css',
})
export class CompanyEditComponent implements OnInit {
  form!: FormGroup;
  company: Company | null = null;
  companyId = '';
  isLoading = true;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.loadCompany();
  }

  private loadCompany(): void {
    this.companyService
      .getById(this.companyId)
      .pipe(take(1))
      .subscribe({
        next: (company) => {
          this.company = company;
          this.buildForm(company);
          this.isLoading = false;
        },
        error: () => {
          this.toastr.error('Erro ao carregar dados da empresa.');
          this.isLoading = false;
        },
      });
  }

  private buildForm(company: Company): void {
    const schedule = openingHoursToSchedule(company.openingHours ?? []);

    this.form = this.fb.group({
      image: [company.image ?? ''],
      cnpj: [company.cnpj ?? ''],
      name: [company.name ?? '', Validators.required],
      schedulingUrl: [company.schedulingUrl ?? ''],
      timeZoneId: [company.timeZoneId ?? 'America/Sao_Paulo'],
      schedule: buildScheduleFormArray(this.fb, schedule),
    });
  }

  goBack(): void {
    this.router.navigate(['/company', this.companyId, 'schedule']);
  }

  onSubmit(): void {
    if (!this.form.valid || !this.company) return;
    this.isSaving = true;

    const formValue = this.form.value;
    const filteredSchedule: DaySchedule[] = (formValue.schedule ?? []).filter(
      (day: DaySchedule) => day.isOpen,
    );

    const companyInfo = {
      name: formValue.name,
      description: this.company.description,
      schedulingUrl: formValue.schedulingUrl,
      cnpj: formValue.cnpj,
      image: formValue.image,
      ...(formValue.timeZoneId && formValue.timeZoneId !== this.company.timeZoneId
        ? { timeZoneId: formValue.timeZoneId as string }
        : {}),
    };

    const openingHours = scheduleToOpeningHours(filteredSchedule);

    forkJoin([
      this.companyService.update(this.companyId, companyInfo),
      this.companyService.updateOpeningHours(this.companyId, openingHours),
    ])
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastr.success('Empresa atualizada com sucesso!');
          this.isSaving = false;
        },
        error: () => {
          this.toastr.error('Erro ao atualizar empresa.');
          this.isSaving = false;
        },
      });
  }
}
