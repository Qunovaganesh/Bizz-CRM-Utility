// API service for CRM operations
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface LeadData {
  leadCategory: 'manufacturer' | 'super-stockist' | 'distributor';
  contactInfo: {
    salutation?: string;
    name: string;
    designation?: string;
    mobile?: string;
    email?: string;
    phone2?: string;
    middleName?: string;
    lastName?: string;
  };
  companyInfo: {
    companyName: string;
    staffStrength?: string;
    website?: string;
    type?: string;
    status?: string;
    source?: string;
    leadOwner?: string;
  };
  address: {
    streetAddress?: string;
    pincode: string;
    city: string;
    district: string;
    state: string;
  };
  businessInfo: {
    categories: string[];
    subCategories: string[];
    // Manufacturer specific
    brandNames?: string[];
    exporting?: string;
    currentDistributors?: string;
    presenceStates?: string[];
    presenceDistricts?: string[];
    annualRevenue?: string;
    listed?: string;
    distributorsNeeded?: string;
    distributorNeededStates?: string[];
    distributorNeededDistricts?: string[];
    minimumOrderValue?: string;
    distributorMargin?: string;
    logistics?: string;
    marginRange?: string;
    warehouseSpace?: string;
    inspirational?: string;
    // Distributor specific
    brandsCount?: string;
    manufacturerStates?: string;
    manufacturerDistricts?: string;
    accountingSystem?: string;
    logisticsWillingness?: string;
    sfaApp?: string;
    warehouseCount?: string;
    dmsApp?: string;
    totalSpace?: string;
    warehouseManagementSystem?: string;
    salesForceCount?: string;
    ownSalesForce?: string;
    categoriesInterested?: string[];
    needManufacturerStates?: string[];
    needManufacturerDistricts?: string[];
    newBrandsInterest?: string;
  };
}

class ApiService {
  private baseUrl: string;

  constructor() {
    // Set your API base URL here
    this.baseUrl = '/api/method/bizz_plus.api';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`,
          errors: data.errors || [`Request failed with status ${response.status}`],
        };
      }

      return {
        success: true,
        data: data.message || data,
        message: data.message || 'Success',
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: 'Network error occurred',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // Save lead data
  async saveLead(leadData: LeadData): Promise<ApiResponse> {
    return this.makeRequest('/save_lead', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  // Get lead by ID
  async getLead(leadId: string): Promise<ApiResponse> {
    return this.makeRequest(`/get_lead?lead_id=${leadId}`, {
      method: 'GET',
    });
  }

  // Update lead
  async updateLead(leadId: string, leadData: Partial<LeadData>): Promise<ApiResponse> {
    return this.makeRequest('/update_lead', {
      method: 'PUT',
      body: JSON.stringify({ lead_id: leadId, ...leadData }),
    });
  }

  // Get all leads with filters
  async getLeads(filters?: Record<string, any>): Promise<ApiResponse> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.makeRequest(`/get_leads${queryParams}`, {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
