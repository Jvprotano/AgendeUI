import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../../services/base.service';
import {
  DashboardInsights,
  DashboardOverview,
  DashboardPerformance,
} from '../models/dashboard';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseService {
  getOverview(companyId: string, referenceDate: string): Observable<DashboardOverview> {
    return this.get(
      `dashboard/overview?companyId=${encodeURIComponent(companyId)}&referenceDate=${encodeURIComponent(referenceDate)}`,
    );
  }

  getInsights(companyId: string, referenceDate: string): Observable<DashboardInsights> {
    return this.get(
      `dashboard/insights?companyId=${encodeURIComponent(companyId)}&referenceDate=${encodeURIComponent(referenceDate)}`,
    );
  }

  getPerformance(
    companyId: string,
    date: string,
    slotMinutes: number,
  ): Observable<DashboardPerformance> {
    return this.get(
      `dashboard/performance?companyId=${encodeURIComponent(companyId)}&date=${encodeURIComponent(date)}&slotMinutes=${slotMinutes}`,
    );
  }
}
