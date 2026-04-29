import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../../services/base.service';
import { FinancialOverviewData } from '../models/financial';

@Injectable({
  providedIn: 'root',
})
export class FinancialService extends BaseService {
  getOverview(
    companyId: string,
    referenceDate: string,
    months: number = 6,
    timezone: string = 'America/Sao_Paulo',
  ): Observable<FinancialOverviewData> {
    return this.get(
      `financial/overview?companyId=${encodeURIComponent(companyId)}&referenceDate=${encodeURIComponent(referenceDate)}&months=${months}&timezone=${encodeURIComponent(timezone)}`,
    );
  }
}
