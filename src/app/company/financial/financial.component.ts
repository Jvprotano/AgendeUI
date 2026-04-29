import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CompanyService } from '../services/company.service';

interface FinancialKpi {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: string;
}

interface MonthlyFlow {
  month: string;
  income: number;
  expense: number;
}

interface ExpenseCategory {
  name: string;
  percent: number;
  amount: string;
  color: string;
}

interface TransactionItem {
  date: string;
  description: string;
  category: string;
  amount: string;
  type: 'in' | 'out';
  status: 'Pago' | 'Pendente' | 'Recebido';
}

interface DueItem {
  title: string;
  dueDate: string;
  amount: string;
  type: 'receivable' | 'payable';
}

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './financial.component.html',
  styleUrl: './financial.component.css',
})
export class FinancialComponent implements OnInit {
  companyId = '';
  companyName = 'Minha Empresa';

  readonly kpis: FinancialKpi[] = [
    { label: 'Receita do mês', value: 'R$ 24.860', delta: '+12%', positive: true, icon: 'bi-graph-up-arrow' },
    { label: 'Despesas do mês', value: 'R$ 9.740', delta: '-4%', positive: true, icon: 'bi-wallet2' },
    { label: 'Lucro operacional', value: 'R$ 15.120', delta: '+16%', positive: true, icon: 'bi-piggy-bank' },
    { label: 'Ticket médio', value: 'R$ 98,30', delta: '+5%', positive: true, icon: 'bi-receipt' },
  ];

  readonly monthlyFlow: MonthlyFlow[] = [
    { month: 'Jan', income: 18600, expense: 9100 },
    { month: 'Fev', income: 19800, expense: 9600 },
    { month: 'Mar', income: 20500, expense: 9300 },
    { month: 'Abr', income: 22100, expense: 9800 },
    { month: 'Mai', income: 23800, expense: 10150 },
    { month: 'Jun', income: 24860, expense: 9740 },
  ];

  readonly expenseCategories: ExpenseCategory[] = [
    { name: 'Folha de pagamento', percent: 41, amount: 'R$ 3.993', color: '#14b8a6' },
    { name: 'Aluguel e condomínio', percent: 24, amount: 'R$ 2.338', color: '#0ea5e9' },
    { name: 'Produtos e insumos', percent: 19, amount: 'R$ 1.851', color: '#f59e0b' },
    { name: 'Marketing', percent: 9, amount: 'R$ 876', color: '#a855f7' },
    { name: 'Outros', percent: 7, amount: 'R$ 682', color: '#64748b' },
  ];

  readonly recentTransactions: TransactionItem[] = [
    { date: '28/04', description: 'Pacote premium - João Lima', category: 'Serviço', amount: 'R$ 180,00', type: 'in', status: 'Recebido' },
    { date: '27/04', description: 'Compra de produtos capilares', category: 'Insumos', amount: 'R$ 520,00', type: 'out', status: 'Pago' },
    { date: '27/04', description: 'Serviço de barba - Diego', category: 'Serviço', amount: 'R$ 65,00', type: 'in', status: 'Recebido' },
    { date: '26/04', description: 'Campanha anúncios locais', category: 'Marketing', amount: 'R$ 280,00', type: 'out', status: 'Pago' },
    { date: '26/04', description: 'Assinatura sistema', category: 'Software', amount: 'R$ 99,00', type: 'out', status: 'Pendente' },
  ];

  readonly dueItems: DueItem[] = [
    { title: 'Repasse mensal de convênio', dueDate: '30/04', amount: 'R$ 1.340,00', type: 'receivable' },
    { title: 'Pagamento fornecedor hair care', dueDate: '02/05', amount: 'R$ 780,00', type: 'payable' },
    { title: 'Fatura internet e energia', dueDate: '04/05', amount: 'R$ 460,00', type: 'payable' },
    { title: 'Plano corporativo anual', dueDate: '06/05', amount: 'R$ 920,00', type: 'receivable' },
  ];

  readonly projection = [
    { label: 'Próximos 7 dias', balance: 'R$ 14.920', trend: '+2.1%' },
    { label: 'Próximos 15 dias', balance: 'R$ 16.100', trend: '+6.0%' },
    { label: 'Próximos 30 dias', balance: 'R$ 18.450', trend: '+11.8%' },
  ];

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService,
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.loadCompanyName();
  }

  get maxFlowValue(): number {
    const values = this.monthlyFlow.flatMap((item) => [item.income, item.expense]);
    return Math.max(...values, 1);
  }

  get donutStyle(): string {
    let start = 0;
    const parts = this.expenseCategories.map((item) => {
      const end = start + item.percent;
      const chunk = `${item.color} ${start}% ${end}%`;
      start = end;
      return chunk;
    });

    return `conic-gradient(${parts.join(', ')})`;
  }

  trackByMonth(_: number, item: MonthlyFlow): string {
    return item.month;
  }

  trackByCategory(_: number, item: ExpenseCategory): string {
    return item.name;
  }

  trackByTx(_: number, item: TransactionItem): string {
    return `${item.date}-${item.description}`;
  }

  trackByDue(_: number, item: DueItem): string {
    return `${item.title}-${item.dueDate}`;
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
