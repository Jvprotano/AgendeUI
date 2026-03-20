import { Injectable } from "@angular/core";
import { BaseService } from "../../services/base.service";
import { Observable } from "rxjs";
import { Scheduling } from "../models/scheduling";
import { Appointment } from "../models/appointment";
import { PaginatedResult } from "../../shared/interfaces/api-response.interface";

@Injectable()
export class SchedulingService extends BaseService {

    getAvailableTimes(date: string, professionalId: string, companyId: string, serviceId: string): Observable<string[]> {
        let route = `scheduling/available-times?companyId=${companyId}&serviceId=${serviceId}&date=${date}`;
        if (professionalId) route += `&professionalId=${professionalId}`;
        return this.get<string[]>(route);
    }

    schedule(scheduling: Scheduling): Observable<any> {
        return this.post('scheduling', scheduling);
    }

    getById(id: string): Observable<Appointment> {
        return this.get<Appointment>(`scheduling/${id}`);
    }

    getByCompany(companyId: string, from: string, to: string, page: number = 1, pageSize: number = 100): Observable<PaginatedResult<Appointment>> {
        return this.get<PaginatedResult<Appointment>>(
            `scheduling/by-company?companyId=${companyId}&from=${from}&to=${to}&page=${page}&pageSize=${pageSize}`
        );
    }

    cancel(id: string): Observable<void> {
        return this.patch<void>(`scheduling/${id}/cancel`, {});
    }
}
