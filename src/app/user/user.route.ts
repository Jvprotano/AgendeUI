import { Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { ProfileComponent } from './profile/profile.component';
import { CompaniesComponent } from './companies/companies.component';

export const userRoutes: Routes = [
    { path: '', component: UserComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'companies', component: CompaniesComponent }
];