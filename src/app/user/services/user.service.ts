import { Observable } from "rxjs";
import { BaseService } from "../../services/base.service";
import { AppUser } from "../models/user";
import { Injectable } from "@angular/core";

@Injectable()
export class UserService extends BaseService {

    constructor() { super() }

    getProfile(): Observable<AppUser> {
        return this.get('user/profile', true);
    }

    getById(id: string): Observable<AppUser> {
        return this.get(`user/${id}`, true);
    }

    updateUser(user: AppUser): Observable<AppUser> {
        return this.put('user', user, true);
    }
}
