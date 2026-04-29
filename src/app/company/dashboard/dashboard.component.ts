import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CompanyService } from '../services/company.service';
import { take } from 'rxjs';

interface KpiCard {
  label: string;
  value: string;
  delta: string;
  trendUp: boolean;
  icon: string;
}

interface WeekPoint {
  day: string;
  bookings: number;
}

interface ServiceShare {
  name: string;
  value: number;
  color: string;
}

interface UpcomingItem {
  time: string;
  customer: string;
  service: string;
  professional: string;
  status: 'Confirmado' | 'Pendente';
}

interface TeamHighlight {
  professional: string;
  completed: number;
  rating: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  companyId = '';
  companyName = 'Minha Empresa';

  readonly kpis: KpiCard[] = [
    { label: 'Agendamentos da Semana', value: '126', delta: '+14%', trendUp: true, icon: 'bi-calendar2-check' },
    { label: 'Faturamento Estimado', value: 'R$ 7.840', delta: '+9%', trendUp: true, icon: 'bi-cash-stack' },
    { label: 'Taxa de Ocupação', value: '78%', delta: '+5 pts', trendUp: true, icon: 'bi-speedometer2' },
    { label: 'Cancelamentos', value: '6', delta: '-2', trendUp: true, icon: 'bi-x-circle' },
  ];

  readonly weekPerformance: WeekPoint[] = [
    { day: 'Seg', bookings: 12 },
    { day: 'Ter', bookings: 18 },
    { day: 'Qua', bookings: 22 },
    { day: 'Qui', bookings: 20 },
    { day: 'Sex', bookings: 24 },
    { day: 'Sáb', bookings: 19 },
    { day: 'Dom', bookings: 11 },
  ];

  readonly serviceShare: ServiceShare[] = [
    { name: 'Corte', value: 42, color: '#14b8a6' },
    { name: 'Barba', value: 24, color: '#0ea5e9' },
    { name: 'Hidratação', value: 19, color: '#f59e0b' },
    { name: 'Sobrancelha', value: 15, color: '#a855f7' },
  ];

  readonly upcomingAppointments: UpcomingItem[] = [
    { time: '09:30', customer: 'João Lucas', service: 'Corte + Barba', professional: 'Rafael', status: 'Confirmado' },
    { time: '10:10', customer: 'Carlos Souza', service: 'Corte', professional: 'Marcos', status: 'Pendente' },
    { time: '11:00', customer: 'Bruno Dias', service: 'Hidratação', professional: 'Rafael', status: 'Confirmado' },
    { time: '14:20', customer: 'Pedro Melo', service: 'Corte', professional: 'Ana', status: 'Confirmado' },
    { time: '15:40', customer: 'Thiago Alves', service: 'Barba', professional: 'Marcos', status: 'Pendente' },
  ];

  readonly teamHighlights: TeamHighlight[] = [
    { professional: 'Rafael', completed: 34, rating: 4.9 },
    { professional: 'Marcos', completed: 29, rating: 4.8 },
    { professional: 'Ana', completed: 21, rating: 4.7 },
  ];

  readonly occupancyByHour = [
    { hour: '08h', occupancy: 45 },
    { hour: '10h', occupancy: 88 },
    { hour: '12h', occupancy: 62 },
    { hour: '14h', occupancy: 91 },
    { hour: '16h', occupancy: 74 },
    { hour: '18h', occupancy: 52 },
  ];

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.loadCompanyName();
  }

  get maxWeekBookings(): number {
    return Math.max(...this.weekPerformance.map((item) => item.bookings), 1);
  }

  get statusSummary(): string {
    const confirmed = this.upcomingAppointments.filter((item) => item.status === 'Confirmado').length;
    return `${confirmed} confirmados de ${this.upcomingAppointments.length} próximos atendimentos`;
  }

  trackByDay(_: number, item: WeekPoint): string {
    return item.day;
  }

  trackByService(_: number, item: ServiceShare): string {
    return item.name;
  }

  trackByAppointment(_: number, item: UpcomingItem): string {
    return `${item.time}-${item.customer}`;
  }

  trackByProfessional(_: number, item: TeamHighlight): string {
    return item.professional;
  }

  private loadCompanyName(): void {
    this.companyService
      .getById(this.companyId)
      .pipe(take(1))
      .subscribe({
        next: (company) => {
          this.companyName = company?.name || 'Minha Empresa';
        },
      });
  }
}
