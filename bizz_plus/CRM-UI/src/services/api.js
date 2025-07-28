class ApiService {
    baseUrl;
    constructor() {
        // Set your API base URL here
        this.baseUrl = '/api/method/bizz_plus.api';
    }
    async makeRequest(endpoint, options = {}) {
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
        }
        catch (error) {
            console.error('API request failed:', error);
            return {
                success: false,
                message: 'Network error occurred',
                errors: [error instanceof Error ? error.message : 'Unknown error'],
            };
        }
    }
    // Save lead data
    async saveLead(leadData) {
        return this.makeRequest('/save_lead', {
            method: 'POST',
            body: JSON.stringify(leadData),
        });
    }
    // Get lead by ID
    async getLead(leadId) {
        return this.makeRequest(`/get_lead?lead_id=${leadId}`, {
            method: 'GET',
        });
    }
    // Update lead
    async updateLead(leadId, leadData) {
        return this.makeRequest('/update_lead', {
            method: 'PUT',
            body: JSON.stringify({ lead_id: leadId, ...leadData }),
        });
    }
    // Get all leads with filters
    async getLeads(filters) {
        const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
        return this.makeRequest(`/get_leads${queryParams}`, {
            method: 'GET',
        });
    }
}
export const apiService = new ApiService();
export default apiService;
