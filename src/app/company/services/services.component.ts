import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ServiceFormComponent } from './service-form/service-form.component';
import { ServiceCardComponent } from './service-card/service-card.component';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // em minutos
  icon?: string;
  active: boolean;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, NgbModule, ServiceFormComponent, ServiceCardComponent, NgxSpinnerModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  selectedService: Service | null = null;
  isLoading = false;

  constructor(
    private modal: NgbModal,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.spinner.show();

    // Mock data - será substituído por chamada real ao backend
    setTimeout(() => {
      this.services = [
        {
          id: '1',
          name: 'Corte de Cabelo',
          description: 'Corte profissional com acabamento perfeito',
          price: 50,
          duration: 30,
          icon: 'scissors',
          active: true
        },
        {
          id: '2',
          name: 'Barba',
          description: 'Aparação e design de barba',
          price: 35,
          duration: 20,
          icon: 'scissors',
          active: true
        },
        {
          id: '3',
          name: 'Manicure',
          description: 'Cuidado completo das unhas',
          price: 40,
          duration: 45,
          icon: 'hand-index',
          active: true
        }
      ];
      this.isLoading = false;
      this.spinner.hide();
      this.cdr.markForCheck();
    }, 500);
  }

  openFormModal(service: Service | null = null): void {
    this.selectedService = service;
    const modalRef = this.modal.open(ServiceFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.service = service;
    modalRef.result.then(
      (result) => {
        if (result) {
          if (service) {
            // Editar
            const index = this.services.findIndex(s => s.id === service.id);
            if (index > -1) {
              this.services[index] = result;
              this.toastr.success('Serviço atualizado com sucesso!');
            }
          } else {
            // Adicionar
            result.id = Math.random().toString();
            this.services.push(result);
            this.toastr.success('Serviço adicionado com sucesso!');
          }
          this.cdr.markForCheck();
        }
      },
      () => {}
    );
  }

  deleteService(service: Service): void {
    if (confirm(`Tem certeza que deseja deletar ${service.name}?`)) {
      const index = this.services.findIndex(s => s.id === service.id);
      if (index > -1) {
        this.services.splice(index, 1);
        this.toastr.success('Serviço deletado com sucesso!');
        this.cdr.markForCheck();
      }
    }
  }

  toggleActive(service: Service): void {
    service.active = !service.active;
    this.toastr.info(`Serviço ${service.active ? 'ativado' : 'desativado'}`);
    this.cdr.markForCheck();
  }
}

