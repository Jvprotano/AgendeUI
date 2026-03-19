import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '../../../../company/services/location.service';
import { StringUtils } from '../../../../utils/string-utils';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { CompanyService } from '../../../../company/services/company.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-basic-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
  ],
  providers: [LocationService, provideNgxMask(), CompanyService],
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.css',
})
export class BasicInfoComponent implements OnInit {
  @Output() next: EventEmitter<any> = new EventEmitter();

  @Input() form!: FormGroup;
  name: string = '';
  cnpj: string = '';
  email: string = '';
  image: string = '';
  schedulingUrl: string = '';

  prefix!: string;
  urlToCheck!: string;
  urlErrorMessage: string | undefined;
  urlSuccessMessage: string | undefined;
  isCheckingUrl: boolean = false;
  private urlSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.prefix = 'agende.com/';

    // Set up URL validation with debounce
    this.urlSubject.pipe(
      debounceTime(500), // Wait 500ms after the last change
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(url => {
      this.validateUrl(url);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasImage(): boolean {
    return !StringUtils.isNullOrEmpty(this.image);
  }

  removeImage(): void {
    this.image = '';
  }

  onFileChange(event: any) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.image = reader.result as string;

        this.form.patchValue({
          image: this.image,
        });
      };
    }
  }

  // updateForm(dados: any): void {
  //   // this.createForm.patchValue({
  //   //   city: dados.localidade,
  //   //   street: dados.logradouro,
  //   //   state: dados.uf,
  //   //   neighborhood: dados.bairro,
  //   // });
  // }

  checkUrlIsValid() {
    const url = this.form.get('schedulingUrl')?.value;
    this.urlSubject.next(url);
  }

  private validateUrl(url: string) {
    this.urlErrorMessage = undefined;
    this.urlSuccessMessage = undefined;
    this.isCheckingUrl = true;

    if (url.length <= 2) {
      this.urlErrorMessage = 'A URL deve ter ao menos 3 caracteres';
      this.isCheckingUrl = false;
      return;
    }

    this.companyService.checkUrlIsValid('', url).subscribe({
      next: (result: boolean) => {
        if (result === true) {
          this.urlSuccessMessage = '✓ URL disponível para uso';
        } else {
          this.urlErrorMessage = '✗ URL já está sendo utilizada';
        }
        this.isCheckingUrl = false;
      },
      error: () => {
        this.urlErrorMessage = 'Erro ao verificar a URL';
        this.isCheckingUrl = false;
      },
    });
  }
}
