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
    scheduleStatus: ScheduleStatus;
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
