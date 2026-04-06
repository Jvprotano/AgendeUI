import { ServiceOffered } from '../../scheduling/models/service_offered';

export interface CompanyEmployee {
  id?: string;
  companyId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userImageUrl?: string;
  description?: string;
  isOwner?: boolean;
  services?: ServiceOffered[];
}

export interface CompanyEmployeeRequest {
  userId?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  description?: string;
  image?: string;
  isOwner?: boolean;
  serviceIds?: string[] | null;
}

export interface UpdateEmployeeServicesRequest {
  serviceIds?: string[] | null;
}
