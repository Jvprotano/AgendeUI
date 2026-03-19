import { Observable, catchError, map } from "rxjs";
import { BaseService } from "../../services/base.service";
import { Company, ScheduleStatus } from "../models/company";
import { StringUtils } from "../../utils/string-utils";

export class CompanyService extends BaseService {

    getAll(): Observable<Company[]> {
        return this.get('company/getByUserId/', true);
    }

    getById(id: string): Observable<Company> {
        return this.get(`company/${id}`);
    }
    
    getBySchedulingUrl(url: string): Observable<Company> {
        return this.get(`company/getbyschedulingurl?schedulingUrl=${url}`);
    }

    checkUrlIsValid(id: string | "", url: string): Observable<boolean> {
        let formatUrl = `company/checkurlisvalid?${!StringUtils.isNullOrEmpty(url) ? `schedulingUrl=${url}` : ''}${!StringUtils.isNullOrEmpty(id) ? `&id=${id}` : ''}`
        return this.get(formatUrl);
    }

    getServicesOffered(id: string){
        return this.get(`company/getServicesOferred?companyId=${id}`);
    }

    getProfessionals(id: string){
        return this.get(`company/getProfessionals?companyId=${id}`);
    }

    create(company: Company): Observable<Company> {
        return this.post('company', company);
    }

    updateScheduleStatus(id: string, scheduleStatus: ScheduleStatus): Observable<void> {
        return this.put(`company/${id}/schedule-status`, { scheduleStatus });
    }

    protected extractDataUrlIsValid(response: boolean) {
        let isValid = response === true;
        return isValid;
    }
}
