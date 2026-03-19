import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { Company, ScheduleStatus } from '../../company/models/company';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CreateComponent } from './create/create.component';
import { CompanyService } from '../../company/services/company.service';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterModule,
    CreateComponent,
    NgbDropdownModule,
  ],
  providers: [CompanyService],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css'],
})
export class CompaniesComponent implements OnInit {
  constructor(
    private companyService: CompanyService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.companyService
      .getAll()
      .pipe(take(1))
      .subscribe({
        next: (companies) => {
          this.companies = Array.isArray(companies) ? companies : [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  companyToEdit: Company | null = null;
  clickedEdit = false;
  isLoading = true;
  companies: Company[] = [];

  statusStripClass(item: Company): string {
    if (item.status !== 1) return 'strip-inactive';
    return item.scheduleStatus === ScheduleStatus.OPEN ? 'strip-active' : 'strip-closed';
  }

  statusBadgeClass(item: Company): string {
    if (item.status !== 1) return 'badge-inactive';
    return item.scheduleStatus === ScheduleStatus.OPEN ? 'badge-active' : 'badge-closed';
  }

  statusLabel(item: Company): string {
    if (item.status !== 1) return 'Inativa';
    return item.scheduleStatus === ScheduleStatus.OPEN ? 'Aberta' : 'Fechada';
  }

  copyLink(item: Company): void {
    const url = `agende.com/${item.schedulingUrl}`;
    navigator.clipboard.writeText(url).then(() => {
      this.toastr.success('Link copiado!');
    });
  }

  openCloseSchedule(id: string): void {
    const company = this.companies.find((c) => c.id === id);
    if (!company) return;

    const newStatus =
      company.scheduleStatus === ScheduleStatus.CLOSED
        ? ScheduleStatus.OPEN
        : ScheduleStatus.CLOSED;

    this.companyService
      .updateScheduleStatus(id, newStatus)
      .pipe(take(1))
      .subscribe({
        next: () => {
          company.scheduleStatus = newStatus;
        },
        error: () => {},
      });
  }

  deleteCompany(id: string): void {
    const company = this.companies.find((c) => c.id === id);
    if (company) company.status = 0;
  }

  activeCompany(id: string): void {
    const company = this.companies.find((c) => c.id === id);
    if (company) company.status = 1;
  }

  editCompany(company: Company | null): void {
    this.companyToEdit = company;
    this.clickedEdit = true;
  }

  onModalClosed(): void {
    this.clickedEdit = false;
    this.companyToEdit = null;
  }
}
