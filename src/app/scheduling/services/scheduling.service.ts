import { Injectable } from "@angular/core";
import { BaseService } from "../../services/base.service";
import { Observable } from "rxjs";
import { Scheduling } from "../models/scheduling";
import { ServiceOffered } from "../models/service_offered";
import { Appointment } from "../models/appointment";

@Injectable()
export class SchedulingService extends BaseService {
    
    getServices(): Observable<ServiceOffered[]> {
        return this.get<ServiceOffered[]>('services');
    }
    
    getAvailableTimes(date: string, professionalId: string, companyId: string, serviceId: string): Observable<string[]> {
        return this.get<string[]>(`scheduling/getavailabletimeslots?date=${date}&professionalId=${professionalId}&companyId=${companyId}&serviceId=${serviceId}`);
    }
    
    schedule(scheduling: Scheduling): Observable<any> {
        return this.post('scheduling', scheduling);
    }

    getByCompanyId(companyId: string, startDate: string, endDate: string): Observable<Appointment[]> {
        return this.get<Appointment[]>(`scheduling/getbycompanyid?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`);
    }
}