export interface DashboardOverview {
  weekSchedule: number;
  estimatedInvoicing: number;
  ocupation: number;
  cancellations: number;
}

export interface DashboardScheduleByDay {
  day: string;
  date: string;
  total: number;
}

export interface DashboardServiceDistribution {
  name: string;
  total: number;
  percentage: number;
}

export interface DashboardNextSchedule {
  time: string;
  date: string;
  clientName: string;
  employeeName: string;
  serviceName: string;
  status: string;
}

export interface DashboardInsights {
  scheduleByDays: DashboardScheduleByDay[];
  services: DashboardServiceDistribution[];
  nextSchedules: DashboardNextSchedule[];
}

export interface DashboardTeamRankingItem {
  employeeName: string;
  appointments: number;
}

export interface DashboardTimeOcupationItem {
  time: string;
  ocupation: number;
}

export interface DashboardPerformance {
  teamRanking: DashboardTeamRankingItem[];
  timeOcupation: DashboardTimeOcupationItem[];
}
