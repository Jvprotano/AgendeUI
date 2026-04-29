import { CompanyEmployee } from "./company-employee";
import { ServiceOffered } from "../../scheduling/models/service_offered";
import { DaySchedule } from "./business-hours";
import { OpeningHours } from "./opening_hours";

export interface Company {
    id: string;
    name: string;
    email?: string;
    description?: string;
    cnpj?: string;
    address?: string;
    addressNumber?: string;
    postalCode?: string;
    isVirtual?: boolean;
    image?: string;
    status?: number;
    scheduleStatus: ScheduleStatusValue;
    schedulingUrl?: string;
    timeZoneId: string;
    servicesOffered?: ServiceOffered[];
    employeers?: CompanyEmployee[];
    openingHours?: OpeningHours[];
    schedule?: DaySchedule[];
}

export const enum ScheduleStatus {
    CLOSED = 0,
    OPEN = 1,
}

export type ScheduleStatusValue = ScheduleStatus | string | number;

export function normalizeScheduleStatus(status: ScheduleStatusValue | null | undefined): ScheduleStatus {
    if (typeof status === 'number') {
        return status === ScheduleStatus.OPEN ? ScheduleStatus.OPEN : ScheduleStatus.CLOSED;
    }

    if (typeof status === 'string') {
        const normalized = status.trim().toLowerCase();
        if (normalized === '1' || normalized === 'open' || normalized === 'opened' || normalized === 'active') {
            return ScheduleStatus.OPEN;
        }
        return ScheduleStatus.CLOSED;
    }

    return ScheduleStatus.CLOSED;
}
