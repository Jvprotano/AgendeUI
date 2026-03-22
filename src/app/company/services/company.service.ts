import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../../services/base.service';
import { Company, ScheduleStatus } from '../models/company';
import { ServiceOffered } from '../../scheduling/models/service_offered';
import { CompanyEmployee } from '../models/company-employee';
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

  create(company: Company): Observable<Company> {
    return this.post('company', company);
  }

  update(id: string, company: Company): Observable<void> {
    return this.put(`company/${id}`, company);
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

  addEmployee(companyId: string, employee: CompanyEmployee): Observable<void> {
    return this.post(`company/${companyId}/employees`, employee);
  }

  removeEmployee(companyId: string, userId: string): Observable<void> {
    return this.delete(`company/${companyId}/employees/${userId}`);
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
