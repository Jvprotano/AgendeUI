export interface Appointment {
  id: string;
  companyId: string;
  date: string;
  time: string;
  customerName?: string;
  professionalName?: string;
  serviceName?: string;
  status: SchedulingStatus;
}

export enum SchedulingStatus {
  Pending = 0,
  Confirmed = 1,
  Cancelled = 2,
  Completed = 3,
}
