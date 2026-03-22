import { Observable } from "rxjs";
import { BaseService } from "../../services/base.service";
import { AppUser } from "../models/user";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class UserService extends BaseService {

    getProfile(): Observable<AppUser> {
        return this.get('user/profile');
    }

    getById(id: string): Observable<AppUser> {
        return this.get(`user/${id}`);
    }

    updateUser(user: AppUser): Observable<AppUser> {
        return this.put('user', user);
    }
}
