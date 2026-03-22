import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppUser } from '../models/user';
import { UserService } from '../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { StringUtils } from '../../utils/string-utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  ngOnInit(): void {

    this.userService.getProfile().subscribe(
      user => {
        this.user = user;
        this.profileForm.patchValue({
          id: this.user.id,
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          phoneNumber: this.user.phoneNumber,
          email: this.user.email,
          birthDate: this.user.birthDate,
          imageUrl: this.user.imageUrl
        });
      }
    );
  }

  profileForm!: FormGroup;
  user!: AppUser;

  rand: number = Math.floor(Math.random() * 1000);

  constructor(private fb: FormBuilder, private userService: UserService, private toast: ToastrService) {
    this.profileForm = this.fb.group({
      id: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      birthDate: ['', Validators.required],
      phoneNumber: [''],
      imageBase64: [''],
      imageUrl: [''],
      // password: ['', Validators.required],
      // confirmPassword: ['', Validators.required],
    });
  }

  onFileChange(event: any) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.profileForm.patchValue({
          imageBase64: reader.result as string,
          imageUrl: reader.result as string
        });
      };
    }
  }

  onSubmit() {
    this.user = this.profileForm.value;

    this.userService.updateUser(this.user).subscribe(
      {
        next: () => {
          this.toast.success('Perfil atualizado com sucesso!');
        },
        error: () => {
          this.toast.error('Erro ao atualizar perfil!');
        }
      }
    );
  }

  hasImage() {
    var teste = !StringUtils.isNullOrEmpty(this.profileForm.get('imageBase64')?.value) || !StringUtils.isNullOrEmpty(this.profileForm.get('imageUrl')?.value);
    return teste;
  }
  removeImage() {
    this.profileForm.patchValue({
      imageBase64: '',
      imageUrl: ''
    });
  }
}
