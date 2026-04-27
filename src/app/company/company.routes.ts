import { Routes } from '@angular/router';
import { CompanyComponent } from './company.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { FinantialComponent } from './finantial/finantial.component';
import { ProfessionalsComponent } from './professionals/professionals.component';
import { ServicesComponent } from './services/services.component';

export const companyRoutes: Routes = [
  {
    path: '',
    component: CompanyComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: ':id/dashboard', component: DashboardComponent },
      { path: ':id/schedule', component: ScheduleComponent },
      { path: ':id/professionals', component: ProfessionalsComponent },
      { path: ':id/services', component: ServicesComponent },
      { path: ':id/financial', component: FinantialComponent }
    ]
  }
];

