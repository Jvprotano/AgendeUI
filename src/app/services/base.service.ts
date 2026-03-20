import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../environments/environment.development";
import { LocalStorageUtils } from "../utils/localstorage";
import { inject } from "@angular/core";
import { ApiResponse } from "../shared/interfaces/api-response.interface";
import { ErrorHandlingService } from "../shared/services/error-handling.service";

export abstract class BaseService {
    protected httpClient: HttpClient;
    protected errorHandler: ErrorHandlingService;

    constructor() {
        this.httpClient = inject(HttpClient);
        this.errorHandler = inject(ErrorHandlingService);
    }

    protected readonly apiUrl: string = environment.apiUrl;
    public localStorage = new LocalStorageUtils();

    protected getHeaderJson(): { headers: HttpHeaders } {
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
    }

    protected getAuthHeaderJson(): { headers: HttpHeaders } {
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.localStorage.getUserToken()}`
            })
        };
    }

    protected get<T>(route: string, authenticated: boolean = true): Observable<T> {
        return this.httpClient
            .get<ApiResponse<T>>(`${this.apiUrl}${route}`, authenticated ? this.getAuthHeaderJson() : this.getHeaderJson())
            .pipe(
                map(this.extractData),
                catchError(error => this.errorHandler.handleError(error))
            );
    }

    protected post<T>(route: string, data: unknown, authenticated: boolean = true): Observable<T> {
        return this.httpClient
            .post<ApiResponse<T>>(`${this.apiUrl}${route}`, data, authenticated ? this.getAuthHeaderJson() : this.getHeaderJson())
            .pipe(
                map(this.extractData),
                catchError(error => this.errorHandler.handleError(error))
            );
    }

    protected put<T>(route: string, data: unknown, authenticated: boolean = true): Observable<T> {
        return this.httpClient
            .put<ApiResponse<T>>(`${this.apiUrl}${route}`, data, authenticated ? this.getAuthHeaderJson() : this.getHeaderJson())
            .pipe(
                map(this.extractData),
                catchError(error => this.errorHandler.handleError(error))
            );
    }

    protected delete<T>(route: string, authenticated: boolean = true): Observable<T> {
        return this.httpClient
            .delete<ApiResponse<T>>(`${this.apiUrl}${route}`, authenticated ? this.getAuthHeaderJson() : this.getHeaderJson())
            .pipe(
                map(this.extractData),
                catchError(error => this.errorHandler.handleError(error))
            );
    }

    protected patch<T>(route: string, data: unknown, authenticated: boolean = true): Observable<T> {
        return this.httpClient
            .patch<ApiResponse<T>>(`${this.apiUrl}${route}`, data, authenticated ? this.getAuthHeaderJson() : this.getHeaderJson())
            .pipe(
                map(this.extractData),
                catchError(error => this.errorHandler.handleError(error))
            );
    }

    protected extractData<T>(response: ApiResponse<T>): T {
        return response.data;
    }
}