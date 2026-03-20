import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormControlName, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, fromEvent, merge } from 'rxjs';
import { AppUser } from '../../user/models/user';
import { AccountService } from '../services/account.service';
import { ValidationMessages, GenericValidator, DisplayMessage } from '../../utils/generic-form-validation';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PasswordMatcher } from '../../utils/password-matcher';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
})
export class RegisterComponent implements OnInit, AfterViewInit {

  @ViewChildren(FormControlName, { read: ElementRef })
  formInputElements!: ElementRef[];

  errors: any[] = [];

  registerForm!: FormGroup;
  usuario!: AppUser;
  showPassword: boolean = false;

  validationMessages: ValidationMessages;
  genericValidator: GenericValidator;
  displayMessage: DisplayMessage = {};

  unsavedChanges: boolean = true;

  constructor(private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {

    this.validationMessages = {
      email: {
        required: translate.instant('REGISTER.FORM.EMAIL.REQUIRED'),
        email: translate.instant('REGISTER.FORM.EMAIL.INVALID')
      },
      password: {
        required: translate.instant('REGISTER.FORM.PASSWORD.REQUIRED'),
        minlength: translate.instant('REGISTER.FORM.PASSWORD.MIN_LENGTH'),
        maxlength: translate.instant('REGISTER.FORM.PASSWORD.MAX_LENGTH'),
        pattern: translate.instant('REGISTER.FORM.PASSWORD.PATTERN')
      },
      confirmPassword: {
        required: translate.instant('REGISTER.FORM.CONFIRM_PASSWORD.REQUIRED'),
        minlength: translate.instant('REGISTER.FORM.PASSWORD.MIN_LENGTH'),
        maxlength: translate.instant('REGISTER.FORM.PASSWORD.MAX_LENGTH'),
        pattern: translate.instant('REGISTER.FORM.PASSWORD.PATTERN'),
        match: translate.instant('REGISTER.FORM.CONFIRM_PASSWORD.NOT_MATCHING')
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit(): void {
    // Password must contain:
    // - At least 8 characters
    // - Maximum 30 characters
    // - At least one uppercase letter
    // - At least one lowercase letter
    // - At least one number
    // - At least one special character (@$!%*?&)
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;

    const passwordValidators = [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(30),
      Validators.pattern(passwordPattern)
    ];

    let passwordValidate = new FormControl('', passwordValidators);
    let confirmPasswordValidate = new FormControl('', passwordValidators);

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: passwordValidate,
      confirmPassword: confirmPasswordValidate,
      phone: null,
      birthDate: null
    }, { validator: PasswordMatcher.match });
  }

  ngAfterViewInit(): void {
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

    merge(...controlBlurs).subscribe(() => {
      this.displayMessage = this.genericValidator.processMessages(this.registerForm);
    });

  }

  addAccount() {
    if (this.registerForm.dirty && this.registerForm.valid) {
      this.usuario = Object.assign({}, this.usuario, this.registerForm.value);

      this.accountService.registerUser(this.usuario).subscribe({
        next: (result) => {
          this.processarSucesso(result);
        }, error: err => { this.processarFalha(err) }
      })
    } else {
      // ensure validation messages are shown
      this.displayMessage = this.genericValidator.processMessages(this.registerForm);
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  processarFalha(response: any) {
    if (response.error) {
      this.toastr.error(response.error, this.translate.instant('REGISTER.ERRORS.GENERIC'));
    } else {
      this.toastr.error(
        this.translate.instant('REGISTER.ERRORS.UNKNOWN'),
        this.translate.instant('REGISTER.ERRORS.GENERIC')
      );
    }
  }

  processarSucesso(response: any) {
    this.registerForm.reset();
    this.errors = [];

    this.router.navigate(['account/login']).then(() => {
      this.toastr.success(
        this.translate.instant('REGISTER.SUCCESS.MESSAGE'),
        this.translate.instant('REGISTER.SUCCESS.TITLE')
      );
    });
  }
}