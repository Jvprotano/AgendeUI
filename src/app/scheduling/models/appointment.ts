export interface Appointment {
  id: string;
  companyId: string;
  date: string;
  time: string;
  customerName?: string;
  professionalName?: string;
  serviceName?: string;
  status: SchedulingStatusValue;
}

export enum SchedulingStatus {
  Pending = 0,
  Confirmed = 1,
  Cancelled = 2,
  Completed = 3,
}

export type SchedulingStatusValue = SchedulingStatus | string | number;

const STATUS_NAME_MAP: Record<string, SchedulingStatus> = {
  pending: SchedulingStatus.Pending,
  pendent: SchedulingStatus.Pending,
  pendente: SchedulingStatus.Pending,
  scheduled: SchedulingStatus.Pending,
  confirmed: SchedulingStatus.Confirmed,
  confirmada: SchedulingStatus.Confirmed,
  confirmado: SchedulingStatus.Confirmed,
  cancelled: SchedulingStatus.Cancelled,
  canceled: SchedulingStatus.Cancelled,
  cancelada: SchedulingStatus.Cancelled,
  cancelado: SchedulingStatus.Cancelled,
  completed: SchedulingStatus.Completed,
  complete: SchedulingStatus.Completed,
  concluida: SchedulingStatus.Completed,
  concluido: SchedulingStatus.Completed,
};

export function normalizeSchedulingStatus(
  status: SchedulingStatusValue | null | undefined,
): SchedulingStatus {
  if (typeof status === 'number') {
    return isKnownStatus(status) ? status : SchedulingStatus.Pending;
  }

  if (typeof status === 'string') {
    const numeric = Number(status);
    if (!Number.isNaN(numeric) && isKnownStatus(numeric)) {
      return numeric;
    }

    const normalized = status.trim().toLowerCase();
    return STATUS_NAME_MAP[normalized] ?? SchedulingStatus.Pending;
  }

  return SchedulingStatus.Pending;
}

function isKnownStatus(status: number): status is SchedulingStatus {
  return [
    SchedulingStatus.Pending,
    SchedulingStatus.Confirmed,
    SchedulingStatus.Cancelled,
    SchedulingStatus.Completed,
  ].includes(status);
}
