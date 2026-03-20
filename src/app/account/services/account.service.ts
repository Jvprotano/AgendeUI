import { Injectable, NgZone, OnDestroy } from "@angular/core";
import { AppUser } from "../../user/models/user";
import { BaseService } from "../../services/base.service";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { Login } from "../models/login";
import { LocalStorageUtils } from "../../utils/localstorage";
import { decodeToken, getTimeUntilExpiration, isTokenExpired, TokenPayload } from '../../utils/token.utils';
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import { RedirectService } from "../../services/redirect.service";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AccountService extends BaseService implements OnDestroy {

  private loggedIn = new BehaviorSubject<boolean>(false);
  private expirationTimerId: ReturnType<typeof setTimeout> | null = null;
  private readonly EXPIRATION_WARNING_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    private localStorageUtils: LocalStorageUtils,
    private toastr: ToastrService,
    private translate: TranslateService,
    private redirectService: RedirectService,
    private router: Router,
    private ngZone: NgZone
  ) {
    super();
    const token = this.localStorageUtils.getUserToken();
    const isLogged = !!token && !isTokenExpired(token);
    this.loggedIn.next(isLogged);

    if (isLogged && token) {
      this.scheduleExpirationWarning(token);
    }
  }

  registerUser(user: AppUser): Observable<AppUser> {
    return this.post('register', user, false);
  }

  get userIsLoggedObs(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  isLoggedUser(): boolean {
    const token = this.localStorageUtils.getUserToken();
    return !!token && !isTokenExpired(token);
  }

  getUser(): TokenPayload | null {
    const token = this.localStorageUtils.getUserToken();
    if (!token || isTokenExpired(token)) {
      return null;
    }
    return decodeToken(token);
  }

  getUserName(): string {
    const user = this.getUser();
    return user?.name ?? '';
  }

  login(user: Login): Observable<any> {
    return this.post('login', user, false).pipe(
      tap(response => {
        if (response) {
          this.localStorageUtils.saveUserLocalData(response, user.rememberMe);
          this.loggedIn.next(true);

          const token = this.localStorageUtils.getUserToken();
          if (token) {
            this.scheduleExpirationWarning(token);
          }
        }
      })
    );
  }

  logout() {
    this.clearExpirationTimer();
    this.localStorageUtils.clearUserLocalData();
    this.loggedIn.next(false);
    this.redirectService.clearReturnRoute();
  }

  handleSessionExpired() {
    this.clearExpirationTimer();
    this.redirectService.setReturnRoute(this.router.url);
    this.localStorageUtils.clearUserLocalData();
    this.loggedIn.next(false);
  }

  private scheduleExpirationWarning(token: string) {
    this.clearExpirationTimer();

    const timeUntilExp = getTimeUntilExpiration(token);
    if (timeUntilExp <= 0) {
      return;
    }

    const timeUntilWarning = timeUntilExp - this.EXPIRATION_WARNING_MS;

    if (timeUntilWarning <= 0) {
      // Already within the warning window — show immediately
      this.showExpirationWarning();
    } else {
      this.ngZone.runOutsideAngular(() => {
        this.expirationTimerId = setTimeout(() => {
          this.ngZone.run(() => this.showExpirationWarning());
        }, timeUntilWarning);
      });
    }
  }

  private showExpirationWarning() {
    this.translate.get('AUTH.SESSION_EXPIRING').subscribe(msg => {
      this.toastr.warning(msg, '', {
        timeOut: 0,
        extendedTimeOut: 0,
        closeButton: true,
        positionClass: 'toast-top-center'
      });
    });
  }

  private clearExpirationTimer() {
    if (this.expirationTimerId !== null) {
      clearTimeout(this.expirationTimerId);
      this.expirationTimerId = null;
    }
  }

  ngOnDestroy() {
    this.clearExpirationTimer();
  }
}
