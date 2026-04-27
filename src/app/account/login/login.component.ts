import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DisplayMessage } from '../../utils/generic-form-validation';
import { AccountService } from '../services/account.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Login } from '../models/login';
import { RedirectService } from '../../services/redirect.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup = new FormGroup({});
  user!: Login;
  name: string = '';
  errors = [];
  displayMessage: DisplayMessage = {};
  formSubmited: boolean = false;
  textInterval: any;
  @ViewChild('textLogin') textLogin!: HTMLElement;
  isDisabledLogin: boolean = false;
  isDisabledGuest: boolean = false;
  isScheduling: boolean = false;
  showPassword: boolean = false;

  // Rate limiting
  failedAttempts: number = 0;
  lockoutSeconds: number = 0;
  private lockoutTimer: ReturnType<typeof setInterval> | null = null;
  private readonly MAX_ATTEMPTS = 3;
  private readonly LOCKOUT_DURATION = 30;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private accountService: AccountService,
    private eventService: EventService,
    private redirectService: RedirectService,
    private modalService: NgbModal,
    public translate: TranslateService,
  ) {
    translate.setDefaultLang('pt');
    translate.use('pt');
  }

  ngOnInit() {
    this.isScheduling =
      this.redirectService.getReturnRoute()?.includes('scheduling') ?? false;

    this.eventService.broadcast('hide-header', true);

    this.loginForm = this.fb.group({
      emailOrPhone: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  get form() {
    return this.loginForm.controls;
  }

  get isLockedOut(): boolean {
    return this.lockoutSeconds > 0;
  }

  guestLogin() {
    this.isDisabledGuest = true;

    this.modalService.dismissAll();
  }

  login() {
    this.formSubmited = true;

    if (this.isLockedOut) {
      return;
    }

    this.isDisabledLogin = true;

    if (this.loginForm.valid) {
      this.user = Object.assign({}, this.user, this.loginForm.value);

      this.accountService.login(this.user).subscribe({
        next: (result) => {
          this.failedAttempts = 0;
          this.success(result);
          this.formSubmited = false;
          this.isDisabledLogin = false;
        },
        error: (err) => {
          this.failedAttempts++;
          if (this.failedAttempts >= this.MAX_ATTEMPTS) {
            this.startLockout();
          }
          this.errorResponse(err);
        },
        complete: () => {
          // Safety net: ensures loading state is reset for streams that complete
          // without emitting error/next (e.g., interceptor returning EMPTY).
          this.isDisabledLogin = false;
        },
      });
    } else {
      this.isDisabledLogin = false;
    }
  }

  success(result: any) {
    this.isDisabledLogin = false;
    this.errors = [];

    if (this.isScheduling) {
      this.modalService.dismissAll();
      return;
    }

    // Use redirect service for post-login navigation
    const returnRoute = this.redirectService.getReturnRoute();
    if (returnRoute) {
      this.redirectService.redirectToReturnRoute();
    } else {
      this.router.navigate(['/user/companies']);
    }

    this.translate
      .get(['LOGIN.SUCCESS', 'LOGIN.WELCOME'])
      .subscribe((translations) => {
        this.toastr.success(
          translations['LOGIN.SUCCESS'],
          translations['LOGIN.WELCOME'],
          { positionClass: 'toast-top-center' },
        );
      });

    this.modalService.dismissAll();
  }

  errorResponse(_: any) {
    // Toast message is handled by ErrorHandlingService.
    this.isDisabledLogin = false;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private startLockout() {
    this.lockoutSeconds = this.LOCKOUT_DURATION;
    this.isDisabledLogin = true;

    this.lockoutTimer = setInterval(() => {
      this.lockoutSeconds--;
      if (this.lockoutSeconds <= 0) {
        this.clearLockout();
      }
    }, 1000);
  }

  private clearLockout() {
    if (this.lockoutTimer) {
      clearInterval(this.lockoutTimer);
      this.lockoutTimer = null;
    }
    this.lockoutSeconds = 0;
    this.failedAttempts = 0;
    this.isDisabledLogin = false;
  }

  ngOnDestroy(): void {
    this.eventService.broadcast('hide-header', false);
    this.clearLockout();
  }
}
