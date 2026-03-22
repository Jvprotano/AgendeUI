import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { CompanyService } from '../services/company.service';
import { ServiceOffered } from '../../scheduling/models/service_offered';
import { CurrencyFormatPipe } from '../../utils/currency-format.pipe';
import { ServiceFormComponent, ServiceFormData } from './service-form/service-form.component';

@Component({
  selector: 'app-services-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    TranslateModule,
    MatProgressSpinnerModule,
    CurrencyFormatPipe,
  ],
  templateUrl: './services-management.component.html',
  styleUrl: './services-management.component.scss',
})
export class ServicesManagementComponent implements OnInit {
  companyId = '';
  services: ServiceOffered[] = [];
  filteredServices: ServiceOffered[] = [];
  searchTerm = '';
  isLoading = true;

  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private modal: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.loadServices();
  }

  get showFilter(): boolean {
    return this.services.length > 5;
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredServices = term
      ? this.services.filter(s => s.name.toLowerCase().includes(term))
      : [...this.services];
  }

  openCreateModal(): void {
    const modalRef = this.modal.open(ServiceFormComponent, { centered: true, size: 'md' });
    const data: ServiceFormData = { companyId: this.companyId };
    modalRef.componentInstance.data = data;

    modalRef.result.then(
      (result) => {
        if (result?.action === 'created' && result.service) {
          this.services = [...this.services, result.service];
          this.onSearch();
          this.cdr.markForCheck();
          this.toastr.success(this.translate.instant('COMPANY.SERVICES.CREATE_SUCCESS'));
        }
      },
      () => {},
    );
  }

  openEditModal(service: ServiceOffered): void {
    const modalRef = this.modal.open(ServiceFormComponent, { centered: true, size: 'md' });
    const data: ServiceFormData = { companyId: this.companyId, service };
    modalRef.componentInstance.data = data;

    modalRef.result.then(
      (result) => {
        if (result?.action === 'updated' && result.service) {
          this.services = this.services.map(s => s.id === result.service.id ? result.service : s);
          this.onSearch();
          this.cdr.markForCheck();
          this.toastr.success(this.translate.instant('COMPANY.SERVICES.UPDATE_SUCCESS'));
        }
      },
      () => {},
    );
  }

  confirmDelete(service: ServiceOffered): void {
    const msg = this.translate.instant('COMPANY.SERVICES.DELETE_CONFIRM', { name: service.name });
    if (!confirm(msg)) return;

    const originalServices = [...this.services];
    this.services = this.services.filter(s => s.id !== service.id);
    this.onSearch();
    this.cdr.markForCheck();

    this.companyService
      .removeService(this.companyId, service.id!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('COMPANY.SERVICES.DELETE_SUCCESS'));
        },
        error: () => {
          this.services = originalServices;
          this.onSearch();
          this.cdr.markForCheck();
        },
      });
  }

  formatDuration(duration?: string): string {
    if (!duration) return '—';
    const parts = duration.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (hours > 0 && minutes > 0) return `${hours}h${minutes}min`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    return '—';
  }

  private loadServices(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.companyService
      .getServicesOffered(this.companyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (services) => {
          this.services = Array.isArray(services) ? services : [];
          this.filteredServices = [...this.services];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.services = [];
          this.filteredServices = [];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }
}
