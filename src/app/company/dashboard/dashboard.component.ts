import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin, take } from 'rxjs';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { CompanyService } from '../services/company.service';
import { DashboardService } from '../services/dashboard.service';
import {
  DashboardInsights,
  DashboardOverview,
  DashboardPerformance,
} from '../models/dashboard';

interface KpiCard {
  label: string;
  value: string;
  helper: string;
  icon: string;
}

interface WeekPoint {
  day: string;
  bookings: number;
  date: string;
}

interface ServiceShare {
  name: string;
  value: number;
  total: number;
  color: string;
}

interface UpcomingItem {
  time: string;
  customer: string;
  service: string;
  professional: string;
  status: string;
  statusType: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'other';
}

interface TeamHighlight {
  professional: string;
  completed: number;
}

interface OccupancyPoint {
  hour: string;
  occupancy: number;
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
  isLoading = true;
  referenceDate = '';

  overview: DashboardOverview = {
    weekSchedule: 0,
    estimatedInvoicing: 0,
    ocupation: 0,
    cancellations: 0,
  };

  weekPerformance: WeekPoint[] = [];
  serviceShare: ServiceShare[] = [];
  upcomingAppointments: UpcomingItem[] = [];
  teamHighlights: TeamHighlight[] = [];
  occupancyByHour: OccupancyPoint[] = [];

  private readonly serviceColors = [
    '#14b8a6',
    '#0ea5e9',
    '#f59e0b',
    '#a855f7',
    '#22c55e',
    '#ef4444',
  ];

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.referenceDate = this.getLocalIsoDate(new Date());
    this.loadDashboardData();
  }

  get kpis(): KpiCard[] {
    return [
      {
        label: 'Agendamentos da Semana',
        value: String(this.overview.weekSchedule ?? 0),
        helper: `Semana de referencia: ${this.referenceDate}`,
        icon: 'bi-calendar2-check',
      },
      {
        label: 'Faturamento Estimado',
        value: this.formatCurrency(this.overview.estimatedInvoicing ?? 0),
        helper: 'Soma dos servicos agendados na semana',
        icon: 'bi-cash-stack',
      },
      {
        label: 'Taxa de Ocupacao',
        value: `${this.formatNumber(this.overview.ocupation ?? 0)}%`,
        helper: 'Minutos agendados x minutos disponiveis',
        icon: 'bi-speedometer2',
      },
      {
        label: 'Cancelamentos',
        value: String(this.overview.cancellations ?? 0),
        helper: 'Cancelamentos na semana de referencia',
        icon: 'bi-x-circle',
      },
    ];
  }

  get maxWeekBookings(): number {
    return Math.max(...this.weekPerformance.map((item) => item.bookings), 1);
  }

  get statusSummary(): string {
    const confirmed = this.upcomingAppointments.filter(
      (item) => item.statusType === 'confirmed',
    ).length;
    return `${confirmed} confirmados de ${this.upcomingAppointments.length} proximos atendimentos`;
  }

  trackByDay(_: number, item: WeekPoint): string {
    return `${item.date}-${item.day}`;
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

  trackByHour(_: number, item: OccupancyPoint): string {
    return item.hour;
  }

  private loadDashboardData(): void {
    if (!this.companyId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    forkJoin({
      company: this.companyService.getById(this.companyId),
      overview: this.dashboardService.getOverview(this.companyId, this.referenceDate),
      insights: this.dashboardService.getInsights(this.companyId, this.referenceDate),
      performance: this.dashboardService.getPerformance(this.companyId, this.referenceDate, 60),
    })
      .pipe(take(1))
      .subscribe({
        next: ({ company, overview, insights, performance }) => {
          this.companyName = company?.name || 'Minha Empresa';
          this.applyOverview(overview);
          this.applyInsights(insights);
          this.applyPerformance(performance);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  private applyOverview(overview: DashboardOverview | null | undefined): void {
    if (!overview) {
      return;
    }

    this.overview = {
      weekSchedule: overview.weekSchedule ?? 0,
      estimatedInvoicing: overview.estimatedInvoicing ?? 0,
      ocupation: overview.ocupation ?? 0,
      cancellations: overview.cancellations ?? 0,
    };
  }

  private applyInsights(insights: DashboardInsights | null | undefined): void {
    const scheduleByDays = insights?.scheduleByDays ?? [];
    const services = insights?.services ?? [];
    const nextSchedules = insights?.nextSchedules ?? [];

    this.weekPerformance = scheduleByDays.map((item) => ({
      day: item.day,
      date: item.date,
      bookings: item.total,
    }));

    this.serviceShare = services.map((item, index) => ({
      name: item.name,
      total: item.total,
      value: this.clampPercent(item.percentage),
      color: this.serviceColors[index % this.serviceColors.length],
    }));

    this.upcomingAppointments = nextSchedules.map((item) => {
      const statusType = this.mapStatusType(item.status);

      return {
        time: item.time,
        customer: item.clientName,
        service: item.serviceName,
        professional: item.employeeName,
        status: this.mapStatusLabel(statusType, item.status),
        statusType,
      };
    });
  }

  private applyPerformance(performance: DashboardPerformance | null | undefined): void {
    const teamRanking = performance?.teamRanking ?? [];
    const timeOcupation = performance?.timeOcupation ?? [];

    this.teamHighlights = teamRanking.map((item) => ({
      professional: item.employeeName,
      completed: item.appointments,
    }));

    this.occupancyByHour = timeOcupation.map((item) => ({
      hour: item.time,
      occupancy: this.clampPercent(item.ocupation),
    }));
  }

  private mapStatusType(status: string): UpcomingItem['statusType'] {
    const normalized = (status || '').toLowerCase();

    if (normalized === 'active' || normalized === 'confirmed') {
      return 'confirmed';
    }
    if (normalized === 'pending') {
      return 'pending';
    }
    if (normalized === 'cancelled' || normalized === 'canceled') {
      return 'cancelled';
    }
    if (normalized === 'completed' || normalized === 'done') {
      return 'completed';
    }

    return 'other';
  }

  private mapStatusLabel(
    statusType: UpcomingItem['statusType'],
    fallback: string,
  ): string {
    switch (statusType) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluido';
      default:
        return fallback || '-';
    }
  }

  private clampPercent(value: number): number {
    if (Number.isNaN(value)) {
      return 0;
    }

    return Math.max(0, Math.min(100, value));
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(value);
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  }

  private getLocalIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
