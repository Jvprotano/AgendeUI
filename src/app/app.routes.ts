import { Routes } from '@angular/router';
import { HomeComponent } from './navegation/home/home.component';
import { NotFoundComponent } from './navegation/not-found/not-found.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    {
        path: 'scheduling',
        loadChildren: () => import('./scheduling/scheduling.routes').then(m => m.schedulingRoutes)
    },
    {
        path: 'account',
        loadChildren: () => import('./account/account.route').then(m => m.accountRoutes)
    },
    {
        path: 'user',
        loadChildren: () => import('./user/user.route').then(m => m.userRoutes)
    },
    {
        path: 'company',
        loadChildren: () => import('./company/company.routes').then(m => m.companyRoutes)
    },
    { path: 'not-found', component: NotFoundComponent },
    { path: '**', component: NotFoundComponent }
];


