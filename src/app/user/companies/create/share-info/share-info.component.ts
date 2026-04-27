import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompanyService } from '../../../../company/services/company.service';

@Component({
  selector: 'app-share-info',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [CompanyService],
  templateUrl: './share-info.component.html',
  styleUrl: './share-info.component.css'
})
export class ShareInfoComponent implements OnInit {
  @Input() form!: FormGroup;
  @Output() previous: EventEmitter<any> = new EventEmitter();

  /**
   *
   */
  constructor(private companyService: CompanyService) {

  }

  prefix!: string;
  urlToCheck!: string;
  urlErrorMessage: string | undefined;
  urlSuccessMessage: string | undefined;

  ngOnInit(): void {
    this.prefix = 'agende.com/'
    this.prefillUrlFromCompanyName();
  }

  private prefillUrlFromCompanyName(): void {
    const companyName = this.form.get('name')?.value;
    if (companyName && !this.form.get('schedulingUrl')?.value) {
      const urlFriendlyName = this.convertToUrlFormat(companyName);
      this.form.patchValue({ schedulingUrl: urlFriendlyName });
    }
  }

  private convertToUrlFormat(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '')
      .replace(/\-+/g, '-')
      .replace(/^\-+|\-+$/g, '');
  }

  checkUrlIsValid() {
    this.urlErrorMessage = undefined;
    this.urlSuccessMessage = undefined;

    this.urlToCheck = this.form.get('schedulingUrl')?.value;

    if (this.urlToCheck.length <= 1) {
      this.urlErrorMessage = "Url deve ter ao menos 2 letras"
      return
    }

    let testeUrl = false;

    this.companyService.checkUrlIsValid("", this.urlToCheck)
      .subscribe({
        next: (result: boolean) => {
          if (result === true)
            this.urlSuccessMessage = "Url válido."
          else
            this.urlErrorMessage = "Url inválido ou já utilizado."
        },
        error(err) {
          console.log(err)
          testeUrl = false
          return false;
        },
      })
  }

  onPrevious() {
    this.previous.emit();
  }
}
