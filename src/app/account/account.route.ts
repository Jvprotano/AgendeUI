import { Routes } from "@angular/router";
import { AccountAppComponent } from "./account-app.component";
import { RegisterComponent } from "./register/register.component";
import { LoginComponent } from "./login/login.component";
import { authGuard } from "./services/auth.guard";

export const accountRoutes: Routes = [
    {
        path: '',
        component: AccountAppComponent,
        children: [
            { path: 'login', component: LoginComponent, canActivate: [authGuard] },
            { path: 'register', component: RegisterComponent, canActivate: [authGuard] }
        ]
    }
];