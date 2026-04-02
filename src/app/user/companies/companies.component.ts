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
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css'],
})
export class CompaniesComponent implements OnInit {
  constructor(
    private companyService: CompanyService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  showCreateModal = false;
  isLoading = true;
  companies: Company[] = [];

  loadCompanies(): void {
    this.companyService
      .getAll()
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.companies = Array.isArray(result?.items) ? result.items : [];
          this.isLoading = false;
        },
        error: () => {
          this.companies = [];
          this.isLoading = false;
        },
      });
  }

  statusStripClass(item: Company): string {
    return item.scheduleStatus === ScheduleStatus.OPEN ? 'strip-active' : 'strip-closed';
  }

  statusBadgeClass(item: Company): string {
    return item.scheduleStatus === ScheduleStatus.OPEN ? 'badge-active' : 'badge-closed';
  }

  statusLabel(item: Company): string {
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
          const label = newStatus === ScheduleStatus.OPEN ? 'aberta' : 'fechada';
          this.toastr.success(`Agenda ${label} com sucesso!`);
        },
        error: () => {
          // ErrorHandlingService already displays the server message via toast
        },
      });
  }

  deleteCompany(id: string): void {
    this.companyService
      .remove(id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.companies = this.companies.filter((c) => c.id !== id);
          this.toastr.success('Empresa removida com sucesso!');
        },
        error: () => {
          // ErrorHandlingService already displays the error via toast
        },
      });
  }

  reactivateCompany(id: string): void {
    this.companyService
      .reactivate(id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastr.success('Empresa reativada com sucesso!');
          this.loadCompanies();
        },
        error: () => {
          // ErrorHandlingService already displays the error via toast
        },
      });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  onModalClosed(): void {
    this.showCreateModal = false;
    this.loadCompanies();
  }
}
