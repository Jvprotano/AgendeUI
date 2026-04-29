import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../../services/base.service';
import { Company, ScheduleStatus } from '../models/company';
import { ServiceOffered } from '../../scheduling/models/service_offered';
import {
  CompanyEmployee,
  CompanyEmployeeRequest,
  UpdateEmployeeServicesRequest,
} from '../models/company-employee';
import { OpeningHours } from '../models/opening_hours';
import { PaginatedResult } from '../../shared/interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class CompanyService extends BaseService {
  getAll(
    page: number = 1,
    pageSize: number = 20,
  ): Observable<PaginatedResult<Company>> {
    return this.get(`company/by-user?page=${page}&pageSize=${pageSize}`);
  }

  getById(id: string): Observable<Company> {
    return this.get(`company/${id}`);
  }

  getBySchedulingUrl(url: string): Observable<Company> {
    return this.get(`company/by-url?schedulingUrl=${url}`);
  }

  checkUrlIsValid(url: string, id?: string): Observable<boolean> {
    let route = `company/check-url?schedulingUrl=${url}`;
    if (id) route += `&id=${id}`;
    return this.get(route);
  }

  getServicesOffered(companyId: string): Observable<ServiceOffered[]> {
    return this.get(`company/${companyId}/services`);
  }

  getEmployees(companyId: string): Observable<CompanyEmployee[]> {
    return this.get(`company/${companyId}/employees`);
  }

  create(company: Partial<Company>): Observable<Partial<Company> | void> {
    return this.post('company', company);
  }

  update(id: string, company: Pick<Company, 'name' | 'description' | 'schedulingUrl' | 'cnpj' | 'image'> & { timeZoneId?: string }): Observable<void> {
    return this.put(`company/${id}`, company);
  }

  updateOpeningHours(id: string, openingHours: OpeningHours[]): Observable<void> {
    return this.put(`company/${id}/opening-hours`, { openingHours });
  }

  remove(id: string): Observable<void> {
    return this.delete(`company/${id}`);
  }

  reactivate(id: string): Observable<void> {
    return this.patch(`company/${id}/reactive`, {});
  }

  updateScheduleStatus(
    id: string,
    scheduleStatus: ScheduleStatus,
  ): Observable<void> {
    return this.put(`company/${id}/schedule-status`, { scheduleStatus });
  }

  addEmployee(
    companyId: string,
    employee: CompanyEmployeeRequest,
  ): Observable<CompanyEmployee> {
    return this.post(`company/${companyId}/employees`, employee);
  }

  removeEmployee(companyId: string, userId: string): Observable<void> {
    return this.delete(`company/${companyId}/employees/${userId}`);
  }

  getEmployeeServices(
    companyId: string,
    userId: string,
  ): Observable<ServiceOffered[]> {
    return this.get(`company/${companyId}/employees/${userId}/services`);
  }

  updateEmployeeServices(
    companyId: string,
    userId: string,
    payload: UpdateEmployeeServicesRequest,
  ): Observable<void> {
    return this.put(`company/${companyId}/employees/${userId}/services`, payload);
  }

  addService(
    companyId: string,
    service: ServiceOffered,
  ): Observable<ServiceOffered> {
    return this.post(`company/${companyId}/services`, service);
  }

  updateService(
    companyId: string,
    serviceId: string,
    service: ServiceOffered,
  ): Observable<void> {
    return this.put(`company/${companyId}/services/${serviceId}`, service);
  }

  removeService(companyId: string, serviceId: string): Observable<void> {
    return this.delete(`company/${companyId}/services/${serviceId}`);
  }
}
