import { Routes } from '@angular/router';
import { SchedulingComponent } from './scheduling.component';
import { SuccessComponent } from './success/success.component';

export const schedulingRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'success', component: SuccessComponent },
  { path: ':id', component: SchedulingComponent }
];

