import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { CompanyService } from '../services/company.service';
import { CompanyEmployee } from '../models/company-employee';
import { ServiceOffered } from '../../scheduling/models/service_offered';
import {
  EmployeeFormComponent,
  EmployeeFormData,
} from './employee-form/employee-form.component';

@Component({
  selector: 'app-employees-management',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    TranslateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './employees-management.component.html',
  styleUrl: './employees-management.component.scss',
})
export class EmployeesManagementComponent implements OnInit {
  companyId = '';
  employees: CompanyEmployee[] = [];
  filteredEmployees: CompanyEmployee[] = [];
  services: ServiceOffered[] = [];
  searchTerm = '';
  isLoading = true;

  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private modal: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.loadData();
  }

  get showFilter(): boolean {
    return this.employees.length > 5;
  }

  get canCreateEmployee(): boolean {
    return this.services.length > 0;
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredEmployees = term
      ? this.employees.filter((employee) =>
          [employee.userName, employee.userEmail, employee.description]
            .filter((value): value is string => !!value)
            .some((value) => value.toLowerCase().includes(term)),
        )
      : [...this.employees];
  }

  openCreateModal(): void {
    if (!this.canCreateEmployee) {
      this.toastr.info(this.translate.instant('COMPANY.EMPLOYEES.ADD_DISABLED'));
      return;
    }

    const modalRef = this.modal.open(EmployeeFormComponent, {
      centered: true,
      size: 'lg',
    });

    const data: EmployeeFormData = {
      companyId: this.companyId,
      services: this.services,
    };

    modalRef.componentInstance.data = data;

    modalRef.result.then(
      (result) => {
        if (result?.action === 'created' && result.employee) {
          this.employees = [...this.employees, result.employee];
          this.onSearch();
          this.cdr.markForCheck();
          this.toastr.success(
            this.translate.instant('COMPANY.EMPLOYEES.CREATE_SUCCESS'),
          );
        }
      },
      () => {},
    );
  }

  openEditModal(employee: CompanyEmployee): void {
    const modalRef = this.modal.open(EmployeeFormComponent, {
      centered: true,
      size: 'lg',
    });

    const data: EmployeeFormData = {
      companyId: this.companyId,
      employee,
      services: this.services,
    };

    modalRef.componentInstance.data = data;

    modalRef.result.then(
      (result) => {
        if (result?.action === 'updated' && result.employee) {
          this.employees = this.employees.map((item) =>
            item.userId === result.employee.userId ? result.employee : item,
          );
          this.onSearch();
          this.cdr.markForCheck();
          this.toastr.success(
            this.translate.instant('COMPANY.EMPLOYEES.UPDATE_SUCCESS'),
          );
        }
      },
      () => {},
    );
  }

  confirmDelete(employee: CompanyEmployee): void {
    const name = employee.userName || employee.userEmail || '';
    const msg = this.translate.instant('COMPANY.EMPLOYEES.DELETE_CONFIRM', {
      name,
    });

    if (!confirm(msg)) return;

    const originalEmployees = [...this.employees];
    this.employees = this.employees.filter((item) => item.userId !== employee.userId);
    this.onSearch();
    this.cdr.markForCheck();

    this.companyService
      .removeEmployee(this.companyId, employee.userId!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastr.success(
            this.translate.instant('COMPANY.EMPLOYEES.DELETE_SUCCESS'),
          );
        },
        error: () => {
          this.employees = originalEmployees;
          this.onSearch();
          this.cdr.markForCheck();
        },
      });
  }

  goToServices(): void {
    this.router.navigate(['/company', this.companyId, 'services']);
  }

  getEmployeeServiceCount(employee: CompanyEmployee): number {
    return employee.services?.length ?? 0;
  }

  private loadData(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    forkJoin({
      employees: this.companyService.getEmployees(this.companyId),
      services: this.companyService.getServicesOffered(this.companyId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ employees, services }) => {
          this.employees = Array.isArray(employees) ? employees : [];
          this.filteredEmployees = [...this.employees];
          this.services = Array.isArray(services) ? services : [];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.employees = [];
          this.filteredEmployees = [];
          this.services = [];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }
}
