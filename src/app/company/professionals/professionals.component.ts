import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ProfessionalFormComponent } from './professional-form/professional-form.component';
import { ProfessionalCardComponent } from './professional-card/professional-card.component';

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  photo?: string;
  active: boolean;
}

@Component({
  selector: 'app-professionals',
  standalone: true,
  imports: [CommonModule, NgbModule, ProfessionalFormComponent, ProfessionalCardComponent, NgxSpinnerModule],
  templateUrl: './professionals.component.html',
  styleUrls: ['./professionals.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfessionalsComponent implements OnInit {
  professionals: Professional[] = [];
  selectedProfessional: Professional | null = null;
  isLoading = false;

  constructor(
    private modal: NgbModal,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfessionals();
  }

  loadProfessionals(): void {
    this.isLoading = true;
    this.spinner.show();

    // Mock data - será substituído por chamada real ao backend
    setTimeout(() => {
      this.professionals = [
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '(11) 98765-4321',
          specialties: ['Corte', 'Barba'],
          active: true
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria@example.com',
          phone: '(11) 98765-4322',
          specialties: ['Manicure', 'Pedicure'],
          active: true
        }
      ];
      this.isLoading = false;
      this.spinner.hide();
      this.cdr.markForCheck();
    }, 500);
  }

  openFormModal(professional: Professional | null = null): void {
    this.selectedProfessional = professional;
    const modalRef = this.modal.open(ProfessionalFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.professional = professional;
    modalRef.result.then(
      (result) => {
        if (result) {
          if (professional) {
            // Editar
            const index = this.professionals.findIndex(p => p.id === professional.id);
            if (index > -1) {
              this.professionals[index] = result;
              this.toastr.success('Profissional atualizado com sucesso!');
            }
          } else {
            // Adicionar
            result.id = Math.random().toString();
            this.professionals.push(result);
            this.toastr.success('Profissional adicionado com sucesso!');
          }
          this.cdr.markForCheck();
        }
      },
      () => {}
    );
  }

  deleteProfessional(professional: Professional): void {
    if (confirm(`Tem certeza que deseja deletar ${professional.name}?`)) {
      const index = this.professionals.findIndex(p => p.id === professional.id);
      if (index > -1) {
        this.professionals.splice(index, 1);
        this.toastr.success('Profissional deletado com sucesso!');
        this.cdr.markForCheck();
      }
    }
  }

  toggleActive(professional: Professional): void {
    professional.active = !professional.active;
    this.toastr.info(`Profissional ${professional.active ? 'ativado' : 'desativado'}`);
    this.cdr.markForCheck();
  }
}

