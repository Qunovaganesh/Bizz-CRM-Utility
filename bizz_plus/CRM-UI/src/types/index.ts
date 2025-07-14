export interface Manufacturer {
  id: string;
  name: string;
  city: string;
  district: string;
  state: string;
  category: string;
  subCategory: string;
  status: 'Registration' | 'Lead' | 'Prospect' | 'Customer' | 'View';
  registrationDate: string;
  daysSinceStatus: number;
  [key: string]: any;
}

export interface Distributor {
  id: string;
  name: string;
  city: string;
  district: string;
  state: string;
  category: string;
  subCategory: string;
  status: 'Registration' | 'Lead' | 'Prospect' | 'Customer' | 'View';
  registrationDate: string;
  daysSinceStatus: number;
  [key: string]: any;
}

export interface Interaction {
  id: string;
  interactedBy: string;
  dateInteracted: string;
  timeElapsed: string;
  notes: string;
  mode: 'Phone' | 'FtoF';
  hasReminder: boolean;
  reminderDate?: string;
  attachments?: string[];
}

export interface Agreement {
  id: string;
  version: number;
  terms: TermsCondition[];
  status: 'Draft' | 'Generated' | 'Signed';
  createdDate: string;
  signedDate?: string;
}

export interface TermsCondition {
  id: string;
  clause: string;
  response: string;
  originalData?: any; // Store original term data from API
}

export interface Invoice {
  id: string;
  type: 'Proforma' | 'Tax';
  invoiceNo: string;
  amount: number;
  commissionPercent: number;
  commissionAmount: number;
  uploadedBy: string;
  uploadDate: string;
  durationBetween?: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: string;
  date: string;
  fileName: string;
  status: string;
}

export interface FilterOptions {
  cities: string[];
  districts: string[];
  states: string[];
  categories: string[];
  subCategories: string[];
  statuses: string[];
}

export interface TermsOptions {
  clauses: string[];
  responses: Record<string, string[]>;
}

export interface LocationMapping {
  districts: string[];
  cities: string[];
}

export interface LocationMappingData {
  [key: string]: LocationMapping;
}