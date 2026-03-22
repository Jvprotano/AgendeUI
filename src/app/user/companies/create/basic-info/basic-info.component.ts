import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
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
  providers: [provideNgxMask()],
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.css',
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() isEditing = false;
  @Input() companyId?: string;
  @Input() showCard = true;

  prefix = 'agende.com/';
  urlErrorMessage: string | undefined;
  urlSuccessMessage: string | undefined;
  isCheckingUrl = false;

  private urlSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.urlSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((url) => this.validateUrl(url));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get imageValue(): string {
    return this.form.get('image')?.value || '';
  }

  hasImage(): boolean {
    return !!this.imageValue;
  }

  removeImage(): void {
    this.form.patchValue({ image: '' });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const reader = new FileReader();
    reader.readAsDataURL(input.files[0]);
    reader.onload = () => {
      this.form.patchValue({ image: reader.result as string });
    };
  }

  checkUrlIsValid(): void {
    const url = this.form.get('schedulingUrl')?.value;
    this.urlSubject.next(url);
  }

  private validateUrl(url: string): void {
    this.urlErrorMessage = undefined;
    this.urlSuccessMessage = undefined;
    this.isCheckingUrl = true;

    if (!url || url.length <= 2) {
      this.urlErrorMessage = 'A URL deve ter ao menos 3 caracteres';
      this.isCheckingUrl = false;
      return;
    }

    this.companyService.checkUrlIsValid(url, this.companyId).subscribe({
      next: (result: boolean) => {
        if (result) {
          this.urlSuccessMessage = 'URL disponivel para uso';
        } else {
          this.urlErrorMessage = 'URL ja esta sendo utilizada';
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
