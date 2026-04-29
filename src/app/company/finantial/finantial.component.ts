import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin, take } from 'rxjs';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { CompanyService } from '../services/company.service';
import { FinancialService } from '../services/financial.service';
import {
  FinancialDueItem,
  FinancialExpenseCategoryItem,
  FinancialMonthlyFlowItem,
  FinancialOverviewData,
  FinancialProjectionItem,
  FinancialRecentTransactionItem,
} from '../models/financial';

interface FinancialKpiView {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: string;
}

@Component({
  selector: 'app-finantial',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './finantial.component.html',
  styleUrl: './finantial.component.css',
})
export class FinantialComponent implements OnInit {
  companyId = '';
  companyName = 'Minha Empresa';
  periodLabel = '-';
  isLoading = true;

  referenceDate = '';
  months = 6;
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';

  kpis: FinancialKpiView[] = [];
  monthlyFlow: FinancialMonthlyFlowItem[] = [];
  expenseCategories: FinancialExpenseCategoryItem[] = [];
  recentTransactions: FinancialRecentTransactionItem[] = [];
  dueItems: FinancialDueItem[] = [];
  projection: FinancialProjectionItem[] = [];

  readonly expenseColors = ['#14b8a6', '#0ea5e9', '#f59e0b', '#a855f7', '#64748b', '#22c55e', '#ef4444'];

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private financialService: FinancialService,
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.referenceDate = this.getLocalIsoDate(new Date());
    this.loadFinancialData();
  }

  get maxFlowValue(): number {
    const values = this.monthlyFlow.flatMap((item) => [item.income, item.expense]);
    return Math.max(...values, 1);
  }

  get donutStyle(): string {
    let start = 0;
    const parts = this.expenseCategories.map((item) => {
      const percent = this.clampPercent(item.percent);
      const end = start + percent;
      const color = this.getCategoryColor(item.name);
      const chunk = `${color} ${start}% ${end}%`;
      start = end;
      return chunk;
    });

    return parts.length ? `conic-gradient(${parts.join(', ')})` : 'conic-gradient(#64748b 0% 100%)';
  }

  trackByMonth(_: number, item: FinancialMonthlyFlowItem): string {
    return item.month;
  }

  trackByCategory(_: number, item: FinancialExpenseCategoryItem): string {
    return item.name;
  }

  trackByTx(_: number, item: FinancialRecentTransactionItem): string {
    return `${item.date}-${item.description}`;
  }

  trackByDue(_: number, item: FinancialDueItem): string {
    return `${item.title}-${item.dueDate}`;
  }

  trackByProjection(_: number, item: FinancialProjectionItem): string {
    return item.label;
  }

  getCategoryColor(name: string): string {
    const index = this.expenseCategories.findIndex((item) => item.name === name);
    return this.expenseColors[(index >= 0 ? index : 0) % this.expenseColors.length];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  }

  formatDate(dateIso: string): string {
    if (!dateIso) {
      return '-';
    }

    const [year, month, day] = dateIso.split('-');
    if (!year || !month || !day) {
      return dateIso;
    }

    return `${day}/${month}`;
  }

  formatTrend(trendPercent: number): string {
    const sign = trendPercent >= 0 ? '+' : '';
    return `${sign}${this.formatPercent(trendPercent)}%`;
  }

  private loadFinancialData(): void {
    if (!this.companyId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    forkJoin({
      company: this.companyService.getById(this.companyId),
      overview: this.financialService.getOverview(
        this.companyId,
        this.referenceDate,
        this.months,
        this.timezone,
      ),
    })
      .pipe(take(1))
      .subscribe({
        next: ({ company, overview }) => {
          this.companyName = company?.name || 'Minha Empresa';
          this.applyOverview(overview);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  private applyOverview(overview: FinancialOverviewData | null | undefined): void {
    if (!overview) {
      return;
    }

    this.periodLabel = overview.periodLabel || '-';
    this.monthlyFlow = overview.monthlyFlow ?? [];
    this.expenseCategories = overview.expenseCategories ?? [];
    this.recentTransactions = overview.recentTransactions ?? [];
    this.dueItems = overview.dueItems ?? [];
    this.projection = overview.projection ?? [];
    this.kpis = this.mapKpis(overview);
  }

  private mapKpis(overview: FinancialOverviewData): FinancialKpiView[] {
    const source = overview.kpis;

    return [
      {
        label: 'Receita do mes',
        value: this.formatCurrency(source?.monthRevenue ?? 0),
        delta: `${this.formatSignedPercent(source?.monthRevenueDeltaPercent ?? 0)} vs. mes anterior`,
        positive: (source?.monthRevenueDeltaPercent ?? 0) >= 0,
        icon: 'bi-graph-up-arrow',
      },
      {
        label: 'Despesas do mes',
        value: this.formatCurrency(source?.monthExpense ?? 0),
        delta: `${this.formatSignedPercent(source?.monthExpenseDeltaPercent ?? 0)} vs. mes anterior`,
        positive: (source?.monthExpenseDeltaPercent ?? 0) <= 0,
        icon: 'bi-wallet2',
      },
      {
        label: 'Lucro operacional',
        value: this.formatCurrency(source?.operationalProfit ?? 0),
        delta: `${this.formatSignedPercent(source?.operationalProfitDeltaPercent ?? 0)} vs. mes anterior`,
        positive: (source?.operationalProfitDeltaPercent ?? 0) >= 0,
        icon: 'bi-piggy-bank',
      },
      {
        label: 'Ticket medio',
        value: this.formatCurrency(source?.averageTicket ?? 0),
        delta: `${this.formatSignedPercent(source?.averageTicketDeltaPercent ?? 0)} vs. mes anterior`,
        positive: (source?.averageTicketDeltaPercent ?? 0) >= 0,
        icon: 'bi-receipt',
      },
    ];
  }

  private formatSignedPercent(value: number): string {
    const safeValue = Number.isFinite(value) ? value : 0;
    const sign = safeValue > 0 ? '+' : '';
    return `${sign}${this.formatPercent(safeValue)}%`;
  }

  private formatPercent(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
  }

  private clampPercent(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.min(100, value));
  }

  private getLocalIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
