import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { HttpClientModule } from '@angular/common/http';
import { LocationService } from '../../../company/services/location.service';
import { StringUtils } from '../../../utils/string-utils';

@Component({
  selector: 'app-edit',
  standalone: true,
  providers: [LocationService],
  imports: [
    FormsModule,
    NgxSpinnerModule,
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css',
})
export class EditComponent {
  editForm: FormGroup;

  locationService: LocationService = inject(LocationService);

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
  ) {
    this.editForm = this.fb.group({
      cep: ['', Validators.required],
      city: [''],
      street: [''],
      state: [''],
      neighborhood: [''],
      complement: [''],
      number: [''],
      isPhysicalCompany: true,
      image: [''],
      cnpj: [''],
      name: [''],
      email: [''],
    });
  }

  searchCEP(): void {
    var cep = this.editForm.get('cep')?.value;

    cep = StringUtils.onlyNumbers(cep);

    if (cep?.length !== 8) {
      return;
    }

    this.locationService.obterDadosCep(cep).subscribe(
      (dados: any) => this.updateLocationForm(dados),
      // (error: any) => console.error('Erro ao obter dados do CEP', error)
    );
  }

  onFileChange(event: any) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.editForm.patchValue({
          image: reader.result as string,
        });
      };
    }
  }

  hasImage(): boolean {
    return !StringUtils.isNullOrEmpty(this.editForm.get('image')?.value);
  }

  removeImage(): void {
    this.editForm.patchValue({
      image: '',
    });
  }

  updateLocationForm(dados: any): void {
    this.editForm.patchValue({
      city: dados.localidade,
      street: dados.logradouro,
      state: dados.uf,
      neighborhood: dados.bairro,
    });
  }

  onSubmit() {}
}
