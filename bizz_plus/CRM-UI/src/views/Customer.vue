<template>
  <div class="customer-page">
    <!-- Floating Header -->
    <div class="floating-header">
      <div class="relationship-header">
        <h1>Customer Management</h1>
        <div class="relationship-info">
          <span :class="isManufacturerCustomer ? 'manufacturer selected-entity' : 'manufacturer'">
            {{ manufacturerName }}
          </span>
          <span class="connector">↔</span>
          <span :class="!isManufacturerCustomer ? 'distributor selected-entity' : 'distributor'">
            {{ distributorName }}
          </span>
          <span :class="getStatusBadgeClass(customerStatus)">{{ customerStatus }}</span>
          <span v-if="currentLeadMapping?.last_status_change" class="status-date">
            Since {{ formatDate(currentLeadMapping.last_status_change) }}
          </span>
        </div>
      </div>
      <p>Manage invoices, payments, and customer validation</p>
    </div>

    <!-- Floating Back Button -->
    <div class="floating-back-button">
      <button class="btn-floating-back" @click="router.go(-1)">
        ← Back
      </button>
    </div>

    <div class="content-wrapper">
      <div class="customer-content">
        <div class="invoice-section">
          <div class="section-header">
            <h2>Invoice Management</h2>
            <div class="section-icon">📄</div>
          </div>
          
          <div class="invoice-form-card">
            <div class="form-header">
              <h3>{{ uploadType === 'taxinvoice' ? '🧾 Upload Tax Invoice' : '💳 Upload Payment' }}</h3>
              <div class="type-toggle">
                <button 
                  :class="{ active: uploadType === 'taxinvoice' }"
                  @click="uploadType = 'taxinvoice'; resetForm()"
                  class="toggle-btn"
                >
                  Tax Invoice
                </button>
                <button 
                  :class="{ active: uploadType === 'payment' }"
                  @click="uploadType = 'payment'; resetForm()"
                  class="toggle-btn"
                >
                  Payment
                </button>
              </div>
            </div>

            <form @submit.prevent="uploadDocument" class="modern-form">
              <div class="form-grid">
                <!-- Tax Invoice Fields -->
                <template v-if="uploadType === 'taxinvoice'">
                  <div class="form-group">
                    <label>Invoice Number</label>
                    <input 
                      type="text" 
                      v-model="newDocument.invoice_number" 
                      placeholder="Enter invoice number"
                      required
                      class="modern-input"
                    >
                  </div>

                  <div class="form-group">
                    <label>Invoice Amount (₹)</label>
                    <input 
                      type="number" 
                      v-model="newDocument.amount" 
                      @input="calculateCommission"
                      placeholder="Enter invoice amount"
                      required
                      class="modern-input"
                    >
                  </div>

                  <div class="form-group">
                    <label>Commission (%)</label>
                    <input 
                      type="number" 
                      v-model="newDocument.commission_percent" 
                      @input="calculateCommission"
                      placeholder="Enter commission percentage"
                      step="0.01"
                      class="modern-input"
                    >
                  </div>

                  <div class="form-group">
                    <label>Commission Amount (₹)</label>
                    <input 
                      type="number" 
                      v-model="newDocument.commission_amount" 
                      readonly
                      placeholder="Auto-calculated"
                      class="modern-input readonly"
                    >
                  </div>
                </template>

                <!-- Payment Fields -->
                <template v-else>
                  <div class="form-group">
                    <label>Payment Reference</label>
                    <input 
                      type="text" 
                      v-model="newDocument.payment_reference_number" 
                      placeholder="Enter payment reference"
                      required
                      class="modern-input"
                    >
                  </div>

                  <div class="form-group">
                    <label>Payment Amount (₹)</label>
                    <input 
                      type="number" 
                      v-model="newDocument.payment_amount" 
                      @input="calculateCommission"
                      placeholder="Enter payment amount"
                      required
                      class="modern-input"
                    >
                  </div>

                  <div class="form-group">
                    <label>Commission (%)</label>
                    <input 
                      type="number" 
                      v-model="newDocument.commission_percent" 
                      @input="calculateCommission"
                      placeholder="Enter commission percentage"
                      step="0.01"
                      min="0"
                      max="100"
                      class="modern-input"
                    >
                  </div>

                  <div class="form-group">
                    <label>Commission Amount (₹)</label>
                    <input 
                      type="number" 
                      v-model="newDocument.commission_amount" 
                      readonly
                      placeholder="Auto-calculated"
                      class="modern-input readonly"
                    >
                  </div>

                  <div class="form-group">
                    <label>Payment Method</label>
                    <select v-model="newDocument.payment_method" class="modern-select">
                      <option value="">Select payment method</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                      <option value="Online Payment">Online Payment</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Payment Date</label>
                    <input 
                      type="date" 
                      v-model="newDocument.payment_date" 
                      class="modern-input"
                    >
                  </div>

                  <div class="form-group full-width">
                    <label>Remarks</label>
                    <textarea 
                      v-model="newDocument.remarks" 
                      placeholder="Enter remarks"
                      class="modern-textarea"
                      rows="3"
                    ></textarea>
                  </div>
                </template>

                <div class="form-group full-width">
                  <label>Upload {{ uploadType === 'taxinvoice' ? 'Invoice' : 'Payment' }} File</label>
                  <div class="file-upload-area">
                    <input 
                      type="file" 
                      @change="handleFileUpload"
                      accept=".pdf,.jpg,.png"
                      required
                      class="file-input-hidden"
                      id="document-upload"
                    >
                    <label for="document-upload" class="file-upload-label">
                      <div class="upload-icon">📎</div>
                      <div class="upload-text">
                        <span>Click to upload {{ uploadType === 'taxinvoice' ? 'invoice' : 'payment receipt' }}</span>
                        <small>PDF, JPG, or PNG files</small>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" @click="resetForm">
                  Reset
                </button>
                <button type="submit" class="btn-primary" :disabled="isLoading">
                  {{ isLoading ? 'Uploading...' : `📤 Upload ${uploadType === 'taxinvoice' ? 'Invoice' : 'Payment'}` }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="invoice-list">
          <div class="history-tabs">
            <button 
              :class="['tab-button', { active: activeHistoryTab === 'tax-invoices' }]"
              @click="activeHistoryTab = 'tax-invoices'"
            >
              Tax Invoices
            </button>
            <button 
              :class="['tab-button', { active: activeHistoryTab === 'payments' }]"
              @click="activeHistoryTab = 'payments'"
            >
              Payments
            </button>
          </div>

          <!-- Tax Invoice History Tab -->
          <div v-if="activeHistoryTab === 'tax-invoices'" class="history-content">
            <div class="section-header">
              <h2>Tax Invoice History</h2>
            </div>

            <div class="invoice-summary">
              <div class="summary-cards">
                <div class="summary-card">
                  <div class="summary-icon">📊</div>
                  <div class="summary-content">
                    <h4>Total Invoices</h4>
                    <p class="summary-value">{{ filteredTaxInvoices.length }}</p>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">💰</div>
                  <div class="summary-content">
                    <h4>Total Amount</h4>
                    <p class="summary-value">₹{{ totalInvoiceAmount.toLocaleString() }}</p>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">💸</div>
                  <div class="summary-content">
                    <h4>Total Commission</h4>
                    <p class="summary-value">₹{{ totalCommissionAmount.toLocaleString() }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="table-container">
              <div class="table-wrapper">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Amount</th>
                      <th>Commission %</th>
                      <th>Commission Amount</th>
                      <th>Upload Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="invoice in filteredTaxInvoices" :key="invoice.name" class="table-row">
                      <td class="invoice-number">{{ invoice.invoice_number }}</td>
                      <td class="amount">₹{{ (invoice.amount || 0).toLocaleString() }}</td>
                      <td class="commission-percent">{{ invoice.commission_percent }}%</td>
                      <td class="commission">₹{{ (invoice.commission_amount || 0).toLocaleString() }}</td>
                      <td class="date">{{ formatDate(invoice.creation) }}</td>
                      <td>
                        <span class="status-pending">Pending</span>
                      </td>
                      <td>
                        <button class="btn-action-small" @click="viewInvoice(invoice)">
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="!filteredTaxInvoices.length" class="no-invoices">
              <div class="no-data-content">
                <div class="no-data-icon">📄</div>
                <h4>No tax invoices found</h4>
                <p>No tax invoices found for the selected period</p>
              </div>
            </div>
          </div>

          <!-- Payment History Tab -->
          <div v-if="activeHistoryTab === 'payments'" class="history-content">
            <div class="section-header">
              <h2>Payment History</h2>
            </div>

            <div class="invoice-summary">
              <div class="summary-cards">
                <div class="summary-card">
                  <div class="summary-icon">💵</div>
                  <div class="summary-content">
                    <h4>Total Payments</h4>
                    <p class="summary-value">{{ paymentHistory.length }}</p>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">💰</div>
                  <div class="summary-content">
                    <h4>Total Amount</h4>
                    <p class="summary-value">₹{{ totalPaymentAmount.toLocaleString() }}</p>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">📊</div>
                  <div class="summary-content">
                    <h4>Average Payment</h4>
                    <p class="summary-value">₹{{ paymentHistory.length > 0 ? Math.round(totalPaymentAmount / paymentHistory.length).toLocaleString() : '0' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="table-container">
              <div class="table-wrapper">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th>Payment Reference</th>
                      <th>Amount</th>
                      <th>Commission %</th>
                      <th>Commission Amount</th>
                      <th>Method</th>
                      <th>Date</th>
                      <th>Remarks</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="payment in paymentHistory" :key="payment.name" class="table-row">
                      <td class="payment-reference">{{ payment.payment_reference_number }}</td>
                      <td class="amount">₹{{ (payment.amount || 0).toLocaleString() }}</td>
                      <td class="commission-percent">{{ payment.commission_percent }}%</td>
                      <td class="commission">₹{{ (payment.commission_amount || 0).toLocaleString() }}</td>
                      <td class="method">{{ payment.payment_method }}</td>
                      <td class="date">{{ formatDate(payment.payment_date) }}</td>
                      <td class="remarks">{{ payment.remarks || '-' }}</td>
                      <td>
                        <span class="status-completed">Completed</span>
                      </td>
                      <td>
                        <button class="btn-action-small" @click="viewInvoice(payment)">
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="!paymentHistory.length" class="no-invoices">
              <div class="no-data-content">
                <div class="no-data-icon">�</div>
                <h4>No payments found</h4>
                <p>No payments have been recorded yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="customer-actions">
  <div class="section-header">
    <h2>Customer Actions</h2>
    <div class="section-icon">⚡</div>
  </div>
  <div class="action-grid">

    <!-- 1. Submit to Compliance -->
    <button class="action-card" @click="submitToCompliance" v-if="!showValidateButton && !showConvertButton">
      <div class="action-icon">📋</div>
      <div class="action-content">
        <h4>Submit to Compliance</h4>
        <p>Send for compliance review</p>
      </div>
    </button>

    <!-- 2. Validate Customer -->
    <button class="action-card" @click="validateCustomer" v-if="showValidateButton">
      <div class="action-icon">✅</div>
      <div class="action-content">
        <h4>Validate Customer</h4>
        <p>Approve customer status</p>
      </div>
    </button>

    <!-- 3. Finalize Customer Status -->
    <button class="action-card convert-customer" @click="finalizeCustomer" v-if="showConvertButton">
      <div class="action-icon">🎯</div>
      <div class="action-content">
        <h4>Finalize Customer</h4>
        <p>Complete customer onboarding</p>
      </div>
    </button>

  </div>      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  id: string;
  parentId?: string;
}>();

const router = useRouter();

// State Management
const uploadType = ref<'taxinvoice' | 'payment'>('taxinvoice');
const activeHistoryTab = ref<'tax-invoices' | 'payments'>('tax-invoices');
const showValidateButton = ref(false);
const showConvertButton = ref(false);
const isLoading = ref(false);
const uploadProgress = ref(0);
const selectedFile = ref<File | null>(null);

// Data State
const taxInvoiceHistory = ref<any[]>([]);
const paymentHistory = ref<any[]>([]);
const leadData = ref<any>(null);

// API data state (matching Prospect.vue)
const selectedEntityData = ref<any>(null); // Main selected entity from Dashboard
const associatedEntityData = ref<any>(null); // Associated entity clicked from table
const currentLeadMapping = ref<any>(null); // Current lead mapping record
const customerStatus = ref('Customer'); // Default status

// Form State
const newDocument = ref<any>({
  // Common fields
  lead: '',
  attachment: '',
  parent: null,
  parenttype: 'Lead Mapping',
  
  // Tax Invoice specific fields
  invoice_number: '',
  amount: 0,
  commission_percent: 0,
  commission_amount: 0,
  
  // Payment specific fields
  payment_reference_number: '',
  payment_amount: 0,
  payment_method: '',
  payment_date: new Date().toISOString().split('T')[0],
  remarks: ''
});

// Computed Properties (matching Prospect.vue logic)
const distributorData = computed(() => {
  // First check if selectedEntityData is a distributor
  if (selectedEntityData.value && selectedEntityData.value.custom_lead_category === 'SS / Distributor Lead') {
    return {
      id: selectedEntityData.value.name,
      name: selectedEntityData.value.company_name || selectedEntityData.value.name,
      category: selectedEntityData.value.custom_categories || '',
      subCategory: '',
      city: selectedEntityData.value.custom_cities || '',
      district: selectedEntityData.value.custom_districts || '',
      state: selectedEntityData.value.custom_states || '',
      status: customerStatus.value,
      registrationDate: selectedEntityData.value.creation ? new Date(selectedEntityData.value.creation).toISOString().split('T')[0] : '',
      daysSinceStatus: 0
    };
  }
  
  // Then check if associatedEntityData is a distributor
  if (associatedEntityData.value && associatedEntityData.value.custom_lead_category === 'SS / Distributor Lead') {
    return {
      id: associatedEntityData.value.name,
      name: associatedEntityData.value.company_name || associatedEntityData.value.name,
      category: associatedEntityData.value.custom_categories || '',
      subCategory: '',
      city: associatedEntityData.value.custom_cities || '',
      district: associatedEntityData.value.custom_districts || '',
      state: associatedEntityData.value.custom_states || '',
      status: customerStatus.value,
      registrationDate: associatedEntityData.value.creation ? new Date(associatedEntityData.value.creation).toISOString().split('T')[0] : '',
      daysSinceStatus: 0
    };
  }
  
  // Default empty distributor if neither is a distributor
  return {
    id: 'unknown',
    name: 'No Distributor Data',
    category: '',
    subCategory: '',
    city: '',
    district: '',
    state: '',
    status: 'Unknown',
    registrationDate: '',
    daysSinceStatus: 0
  };
});

const manufacturerData = computed(() => {
  // First check if selectedEntityData is a manufacturer
  if (selectedEntityData.value && selectedEntityData.value.custom_lead_category === 'Manufacturer Lead') {
    return {
      id: selectedEntityData.value.name,
      name: selectedEntityData.value.company_name || selectedEntityData.value.name,
      category: selectedEntityData.value.custom_categories || '',
      subCategory: '',
      city: selectedEntityData.value.custom_cities || '',
      district: selectedEntityData.value.custom_districts || '',
      state: selectedEntityData.value.custom_states || '',
      status: customerStatus.value,
      registrationDate: selectedEntityData.value.creation ? new Date(selectedEntityData.value.creation).toISOString().split('T')[0] : '',
      daysSinceStatus: 0
    };
  }
  
  // Then check if associatedEntityData is a manufacturer
  if (associatedEntityData.value && associatedEntityData.value.custom_lead_category === 'Manufacturer Lead') {
    return {
      id: associatedEntityData.value.name,
      name: associatedEntityData.value.company_name || associatedEntityData.value.name,
      category: associatedEntityData.value.custom_categories || '',
      subCategory: '',
      city: associatedEntityData.value.custom_cities || '',
      district: associatedEntityData.value.custom_districts || '',
      state: associatedEntityData.value.custom_states || '',
      status: customerStatus.value,
      registrationDate: associatedEntityData.value.creation ? new Date(associatedEntityData.value.creation).toISOString().split('T')[0] : '',
      daysSinceStatus: 0
    };
  }
  
  // Default empty manufacturer if neither is a manufacturer
  return {
    id: 'unknown',
    name: 'No Manufacturer Data',
    category: '',
    subCategory: '',
    city: '',
    district: '',
    state: '',
    status: 'Unknown',
    registrationDate: '',
    daysSinceStatus: 0
  };
});

const distributorName = computed(() => distributorData.value.name);
const isManufacturerCustomer = computed(() => {
  // Check if the associated entity (clicked from table) is a manufacturer
  if (associatedEntityData.value && associatedEntityData.value.custom_lead_category === 'Manufacturer Lead') {
    return true;
  }
  // Check if the selected entity (from Dashboard) is a manufacturer
  if (selectedEntityData.value && selectedEntityData.value.custom_lead_category === 'Manufacturer Lead') {
    return true;
  }
  // Default to false if we don't have clear manufacturer data
  return false;
});
const manufacturerName = computed(() => manufacturerData.value.name);

const leadName = computed(() => leadData.value?.name || props.id);

// Navigation computed properties
// API Helper Functions
const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
  console.log('Making API call to:', endpoint, 'with options:', options);
  
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    console.log('API response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

const uploadFileToFrappe = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('is_private', '1');
  
  const response = await fetch('/api/method/upload_file', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('File upload failed');
  }
  
  const result = await response.json();
  return result.message.file_url;
};

// Data Fetching Functions
const fetchLeadData = async () => {
  try {
    console.log('Fetching lead data for ID:', props.id);
    const response = await makeApiCall(`/api/resource/Lead/${props.id}`);
    console.log('Lead data response:', response);
    leadData.value = response.data;
  } catch (error) {
    console.error('Error fetching lead data:', error);
    // Fallback: set basic data if API fails
    leadData.value = {
      name: props.id,
      manufacturer_name: `Entity ${props.id}`,
      distributor_name: `Entity ${props.id}`,
      lead_type: 'Unknown'
    };
  }
};

const fetchTaxInvoiceHistory = async () => {
  try {
    console.log('Fetching tax invoice history from Lead Mapping...');
    
    if (!currentLeadMapping.value?.name) {
      console.log('No Lead Mapping found, skipping tax invoice history fetch');
      taxInvoiceHistory.value = [];
      return;
    }

    // Get tax invoices from Lead Mapping record
    const leadMappingId = currentLeadMapping.value.name;
    const detailUrl = `/api/resource/Lead Mapping/${encodeURIComponent(leadMappingId)}`;
    const detailParams = new URLSearchParams({
      fields: JSON.stringify(["tax_invoices"])
    });
    
    const response = await fetch(`${detailUrl}?${detailParams}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Lead Mapping tax invoice response:', data);
      
      // Extract tax_invoices from Lead Mapping
      const taxInvoices = data.data?.tax_invoices || [];
      taxInvoiceHistory.value = taxInvoices;
      console.log('Tax invoices from Lead Mapping:', taxInvoices);
    } else {
      console.error('Failed to fetch tax invoices:', response.status, response.statusText);
      taxInvoiceHistory.value = [];
    }
  } catch (error) {
    console.error('Error fetching tax invoice history:', error);
    taxInvoiceHistory.value = [];
  }
};

const fetchPaymentHistory = async () => {
  try {
    console.log('Fetching payment history from Lead Mapping...');
    
    if (!currentLeadMapping.value?.name) {
      console.log('No Lead Mapping found, skipping payment history fetch');
      paymentHistory.value = [];
      return;
    }

    // Get payments from Lead Mapping record
    const leadMappingId = currentLeadMapping.value.name;
    const detailUrl = `/api/resource/Lead Mapping/${encodeURIComponent(leadMappingId)}`;
    const detailParams = new URLSearchParams({
      fields: JSON.stringify(["payments"])
    });
    
    const response = await fetch(`${detailUrl}?${detailParams}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Lead Mapping payment response:', data);
      
      // Extract payments from Lead Mapping
      const payments = data.data?.payments || [];
      paymentHistory.value = payments;
      console.log('Payments from Lead Mapping:', payments);
    } else {
      console.error('Failed to fetch payments:', response.status, response.statusText);
      paymentHistory.value = [];
    }
  } catch (error) {
    console.error('Error fetching payment history:', error);
    paymentHistory.value = [];
  }
};

// Computed Properties for Filtering and Totals
const filteredTaxInvoices = computed(() => {
  return taxInvoiceHistory.value;
});

const totalInvoiceAmount = computed(() => {
  return filteredTaxInvoices.value.reduce((sum: number, invoice: any) => sum + (invoice.amount || 0), 0);
});

const totalCommissionAmount = computed(() => {
  return filteredTaxInvoices.value.reduce((sum: number, invoice: any) => sum + (invoice.commission_amount || 0), 0);
});

const totalPaymentAmount = computed(() => {
  return paymentHistory.value.reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
});

// Form Handlers
const calculateCommission = () => {
  if (uploadType.value === 'taxinvoice') {
    newDocument.value.commission_amount = 
      (newDocument.value.amount * newDocument.value.commission_percent) / 100;
  } else {
    newDocument.value.commission_amount = 
      (newDocument.value.payment_amount * newDocument.value.commission_percent) / 100;
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    // We'll handle the file upload separately in the uploadDocument function
  }
};

// Document Upload Functions
const uploadDocument = async () => {
  if (!selectedFile.value) {
    console.error('No file selected');
    return;
  }

  if (!currentLeadMapping.value?.name) {
    console.error('Lead Mapping ID not found. Cannot upload document.');
    alert('Error: Lead Mapping not found. Please refresh the page and try again.');
    return;
  }

  // Validate required fields based on upload type
  if (uploadType.value === 'taxinvoice') {
    if (!newDocument.value.invoice_number || !newDocument.value.amount) {
      alert('Please fill in all required fields: Invoice Number and Invoice Amount');
      return;
    }
  } else {
    if (!newDocument.value.payment_reference_number || !newDocument.value.payment_amount) {
      alert('Please fill in all required fields: Payment Reference and Payment Amount');
      return;
    }
  }

  try {
    isLoading.value = true;
    uploadProgress.value = 0;

    // Upload file to Frappe
    const fileUrl = await uploadFileToFrappe(selectedFile.value);
    console.log('File uploaded successfully, URL:', fileUrl);
    
    // Get current child table data from Lead Mapping
    const currentChildData = uploadType.value === 'taxinvoice' 
      ? currentLeadMapping.value.tax_invoices || []
      : currentLeadMapping.value.payments || [];

    // Prepare new document data following the same pattern as terms and conditions
    const newDocumentEntry: any = {
      docstatus: 0,
      doctype: uploadType.value === 'taxinvoice' ? "Lead Mapping Tax Invoice" : "Lead Mapping Payment",
      owner: "Administrator",
      parent: currentLeadMapping.value.name,
      parentfield: uploadType.value === 'taxinvoice' ? "tax_invoices" : "payments",
      parenttype: "Lead Mapping",
      idx: currentChildData.length + 1,
      lead: leadName.value,
      attachment: fileUrl,
      __islocal: 1,
      __unsaved: 1,
      __unedited: false
    };

    // Add specific fields based on upload type
    if (uploadType.value === 'taxinvoice') {
      newDocumentEntry.invoice_number = newDocument.value.invoice_number;
      newDocumentEntry.amount = newDocument.value.amount;
      newDocumentEntry.commission_percent = newDocument.value.commission_percent || 0;
      newDocumentEntry.commission_amount = newDocument.value.commission_amount || 0;
      newDocumentEntry.remarks = newDocument.value.remarks || '';
    } else {
      newDocumentEntry.payment_reference_number = newDocument.value.payment_reference_number;
      newDocumentEntry.amount = newDocument.value.payment_amount;
      newDocumentEntry.commission_percent = newDocument.value.commission_percent || 0;
      newDocumentEntry.commission_amount = newDocument.value.commission_amount || 0;
      newDocumentEntry.payment_method = newDocument.value.payment_method || '';
      newDocumentEntry.payment_date = newDocument.value.payment_date || new Date().toISOString().split('T')[0];
      newDocumentEntry.remarks = newDocument.value.remarks || '';
    }

    // Combine existing and new data
    const updatedChildData = [...currentChildData, newDocumentEntry];

    // Prepare request data for PUT API call
    const requestData = uploadType.value === 'taxinvoice' 
      ? { tax_invoices: updatedChildData }
      : { payments: updatedChildData };

    console.log('Uploading document to Lead Mapping:', currentLeadMapping.value.name);
    console.log('Upload type:', uploadType.value);
    console.log('New document entry:', newDocumentEntry);
    console.log('Updated child data:', updatedChildData);
    console.log('Request data:', requestData);

    // Use PUT API to update Lead Mapping with new child table data
    const response = await fetch(`/api/resource/Lead Mapping/${currentLeadMapping.value.name}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload API Error:', response.status, response.statusText, errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Document uploaded successfully:', result);
    
    // Refresh the Lead Mapping data to get updated tax_invoices and payments
    await fetchLeadMapping();
    
    // Then refresh the respective history from the updated Lead Mapping
    if (uploadType.value === 'taxinvoice') {
      await fetchTaxInvoiceHistory();
    } else {
      await fetchPaymentHistory();
    }
    
    // Reset form
    resetForm();
    
    // Show success feedback
    uploadProgress.value = 100;
    setTimeout(() => {
      isLoading.value = false;
      uploadProgress.value = 0;
    }, 500);

  } catch (error) {
    console.error('Error uploading document:', error);
    isLoading.value = false;
    uploadProgress.value = 0;
  }
};

const resetForm = () => {
  newDocument.value = {
    lead: leadName.value,
    attachment: null,
    parent: currentLeadMapping.value?.name || null,
    parenttype: 'Lead Mapping',
    invoice_number: '',
    amount: 0,
    commission_percent: 0,
    commission_amount: 0,
    payment_reference_number: '',
    payment_amount: 0,
    payment_method: '',
    payment_date: new Date().toISOString().split('T')[0],
    remarks: ''
  };
  selectedFile.value = null;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Function to fetch Lead Mapping (matching Prospect.vue)
const fetchLeadMapping = async () => {
  try {
    const filters: any = {};
    
    if (props.id) {
      filters.mapped_lead = props.id;
    }
    
    if (props.parentId) {
      filters.parent_lead = props.parentId;
    }
    
    if (Object.keys(filters).length > 0) {
      // First get the Lead Mapping to find the ID
      const filterUrl = `/api/resource/Lead Mapping`;
      const filterParams = new URLSearchParams({
        fields: JSON.stringify(["name"]),
        filters: JSON.stringify(filters)
      });
      
      const filterResponse = await fetch(`${filterUrl}?${filterParams}`);
      if (filterResponse.ok) {
        const filterData = await filterResponse.json();
        console.log('Lead Mapping filter response:', filterData);
        
        if (filterData && filterData.data && filterData.data.length > 0) {
          const leadMappingId = filterData.data[0].name;
          console.log('Found Lead Mapping ID:', leadMappingId);
          
          // Now fetch the complete Lead Mapping with all fields including tax_invoices and payments
          const detailUrl = `/api/resource/Lead Mapping/${encodeURIComponent(leadMappingId)}`;
          const detailParams = new URLSearchParams({
            fields: JSON.stringify(["*"])
          });
          
          const detailResponse = await fetch(`${detailUrl}?${detailParams}`);
          
          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            console.log('Lead Mapping detail response:', detailData);
            
            if (detailData && detailData.data) {
              currentLeadMapping.value = detailData.data;
              customerStatus.value = currentLeadMapping.value.status || 'Customer';
              console.log('Current Lead Mapping:', currentLeadMapping.value);
              console.log('Tax Invoices:', currentLeadMapping.value.tax_invoices);
              console.log('Payments:', currentLeadMapping.value.payments);
            }
          } else {
            console.error('Failed to fetch Lead Mapping details:', detailResponse.status, detailResponse.statusText);
          }
        } else {
          // No mapping found, keep default status
          customerStatus.value = 'Customer';
        }
      } else {
        console.error('Failed to fetch Lead Mapping list:', filterResponse.status, filterResponse.statusText);
      }
    }
  } catch (error) {
    console.error('Error fetching lead mapping:', error);
    customerStatus.value = 'Customer';
  }
};

const viewInvoice = (document: any) => {
  console.log('Viewing document:', document);
  console.log('Document attachment field:', document.attachment);
  
  if (document.attachment) {
    const fileUrl = document.attachment;
    console.log('Opening file URL:', fileUrl);
    // Open PDF in new tab
    window.open(fileUrl, '_blank');
  } else {
    console.error('No attachment found in document:', document);
    alert('No attachment found for this document');
  }
};

const submitToCompliance = () => {
  console.log('Submitting to compliance team for review...');
  showValidateButton.value = true;
  showConvertButton.value = false;
  console.log('Submitted to compliance - showing Validate Customer button');
};

const validateCustomer = () => {
  console.log('Validating customer...');
  showValidateButton.value = false;
  showConvertButton.value = true;
  console.log('Customer validated - showing Finalize Customer button');
};

const finalizeCustomer = async () => {
  try {
    console.log('Finalizing customer status...');
    
    // Update Lead Mapping status to "Customer"
    if (currentLeadMapping.value?.name) {
      const response = await makeApiCall(`/api/resource/Lead Mapping/${currentLeadMapping.value.name}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'Customer'
        })
      });
      
      if (response) {
        customerStatus.value = 'Customer';
        showValidateButton.value = false;
        showConvertButton.value = false;
        console.log('Customer status finalized successfully!');
        alert('Customer onboarding completed successfully!');
        
        // Refresh the Lead Mapping data
        await fetchLeadMapping();
      }
    }
  } catch (error) {
    console.error('Error finalizing customer:', error);
    alert('Error finalizing customer. Please try again.');
  }
};

// Navigation Functions
const navigateToLead = () => {
  router.push({ 
    name: 'Lead', 
    params: { 
      id: props.id,
      parentId: props.parentId || ''
    }
  });
};

const navigateToProspect = () => {
  router.push({ 
    name: 'Prospect', 
    params: { 
      id: props.id,
      parentId: props.parentId || ''
    }
  });
};

// Status management functions
const getStatusBadgeClass = (status: string) => {
  const base = 'status-badge';
  return `${base} ${{
    Registration: 'status-registration',
    Lead: 'status-lead',
    Prospect: 'status-prospect',
    Customer: 'status-customer',
    View: 'status-view'
  }[status] || 'status-customer'}`;
};

// Lifecycle
let handleKeyPress: (event: KeyboardEvent) => void;

onMounted(async () => {
  console.log('Customer component mounted for ID:', props.id, 'ParentID:', props.parentId);
  
  try {
    // Fetch the associated entity (clicked from table)
    const associatedResponse = await fetch(`/api/resource/Lead/${props.id}?fields=["name","custom_lead_category","company_name","custom_new_status","custom_states","custom_districts","custom_categories","custom_cities","creation"]`);
    if (associatedResponse.ok) {
      const associatedData = await associatedResponse.json();
      if (associatedData.data) {
        associatedEntityData.value = associatedData.data;
      }
    }
    
    // Fetch the selected entity (main entity from Dashboard) if parentId is provided
    if (props.parentId) {
      const selectedResponse = await fetch(`/api/resource/Lead/${props.parentId}?fields=["name","custom_lead_category","company_name","custom_new_status","custom_states","custom_districts","custom_categories","custom_cities","creation"]`);
      if (selectedResponse.ok) {
        const selectedData = await selectedResponse.json();
        if (selectedData.data) {
          selectedEntityData.value = selectedData.data;
        }
      }
    }
    
    console.log('Selected Entity Data:', selectedEntityData.value);
    console.log('Associated Entity Data:', associatedEntityData.value);
    console.log('Manufacturer Data:', manufacturerData.value);
    console.log('Distributor Data:', distributorData.value);
    console.log('Is Manufacturer Customer:', isManufacturerCustomer.value);
    
    // Fetch current Lead Mapping to get the current status
    console.log('Now fetching Lead Mapping...');
    await fetchLeadMapping();
    
    // Initialize workflow state based on current status
    if (currentLeadMapping.value?.status) {
      const status = currentLeadMapping.value.status;
      console.log('Current Lead Mapping status:', status);
      
      if (status === 'Submit to Compliance') {
        showValidateButton.value = true;
        showConvertButton.value = false;
      } else if (status === 'Validate Customer') {
        showValidateButton.value = false;
        showConvertButton.value = true;
      } else if (status === 'Customer') {
        showValidateButton.value = false;
        showConvertButton.value = false;
      } else {
        // Default state - show Submit to Compliance
        showValidateButton.value = false;
        showConvertButton.value = false;
      }
    } else {
      // Default state if no status found
      showValidateButton.value = false;
      showConvertButton.value = false;
    }
    
    console.log('Workflow state initialized:', {
      showValidateButton: showValidateButton.value,
      showConvertButton: showConvertButton.value,
      customerStatus: customerStatus.value
    });
    
    // Load legacy lead data for fallback
    await fetchLeadData();
    
    // Then set lead name and parent in form
    newDocument.value.lead = leadName.value;
    newDocument.value.parent = currentLeadMapping.value?.name || null;
    newDocument.value.parenttype = 'Lead Mapping';
    
    console.log('Form initialized with Lead Mapping parent:', newDocument.value.parent);
    
    // Load history data AFTER Lead Mapping is loaded (these can run in parallel)
    await Promise.all([
      fetchTaxInvoiceHistory(),
      fetchPaymentHistory()
    ]);
    
    console.log('All data loaded successfully');
  } catch (error) {
    console.error('Error during component initialization:', error);
  }
  
  // Add keyboard shortcuts
  handleKeyPress = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'b':
          event.preventDefault();
          router.go(-1);
          break;
        case 'p':
          event.preventDefault();
          navigateToProspect();
          break;
        case 'l':
          event.preventDefault();
          navigateToLead();
          break;
      }
    }
  };
  
  document.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  if (handleKeyPress) {
    document.removeEventListener('keydown', handleKeyPress);
  }
});
</script>

<style scoped>
.customer-page {
  max-width: 1200px;
  margin: 0 auto;
  background: #f5f5f7;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.floating-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #d2d2d7;
  padding: 20px;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.content-wrapper {
  margin-top: 140px;
  padding: 24px;
}

.floating-back-button {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.btn-floating-back {
  background: #1c1c1e;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(28, 28, 30, 0.3);
  transition: all 0.3s ease;
}

.btn-floating-back:hover {
  background: #000000;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(28, 28, 30, 0.4);
}

.relationship-header h1 {
  color: #1d1d1f;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.relationship-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.manufacturer {
  background: #e8f4fd;
  color: #1e40af;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  border: 1px solid #bfdbfe;
}

.distributor {
  background: #fef3c7;
  color: #92400e;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  border: 1px solid #fde68a;
}

.connector {
  color: #86868b;
  font-size: 18px;
  font-weight: bold;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-customer {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-date {
  background: #f3f4f6;
  color: #6b7280;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e5e7eb;
}

.selected-entity {
  border: 2px solid #1c1c1e !important;
  box-shadow: 0 0 0 2px rgba(28, 28, 30, 0.2);
}

.customer-content {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.invoice-section,
.invoice-list {
  background: white;
  border: 1px solid #d2d2d7;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-width: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f2f2f7;
}

.section-header h2 {
  color: #1d1d1f;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.section-icon {
  font-size: 24px;
  opacity: 0.6;
}

.invoice-form-card {
  background: #fafafa;
  border: 1px solid #f2f2f7;
  border-radius: 12px;
  padding: 24px;
  min-width: 500px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-header h3 {
  color: #1d1d1f;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.type-toggle {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 2px;
  border: 1px solid #d2d2d7;
}

.toggle-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s ease;
  background: transparent;
  color: #86868b;
  min-height: 28px;
  box-sizing: border-box;
}

.toggle-btn.active {
  background: #1c1c1e;
  color: white;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
  min-width: 450px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #1d1d1f;
  font-size: 14px;
  white-space: nowrap;
}

.modern-input,
.modern-select,
.modern-textarea {
  padding: 8px 12px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
  color: #1d1d1f;
  background: white;
  transition: all 0.2s ease;
  min-height: 36px;
  width: 100%;
  box-sizing: border-box;
}

.modern-input:focus,
.modern-select:focus {
  outline: none;
  border-color: #1c1c1e;
  box-shadow: 0 0 0 3px rgba(28, 28, 30, 0.1);
}

.modern-input.readonly {
  background: #f5f5f7;
  color: #86868b;
  cursor: not-allowed;
}

.modern-textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.file-upload-area {
  border: 2px dashed #d2d2d7;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-upload-area:hover {
  border-color: #1c1c1e;
  background: #fafafa;
}

.file-input-hidden {
  display: none;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 100%;
}

.upload-icon {
  font-size: 32px;
  opacity: 0.6;
}

.upload-text span {
  color: #1d1d1f;
  font-weight: 500;
  display: block;
  font-size: 16px;
}

.upload-text small {
  color: #86868b;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f2f2f7;
}

.btn-primary,
.btn-secondary {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-height: 36px;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: #1c1c1e;
  color: white;
  box-shadow: 0 1px 3px rgba(28, 28, 30, 0.2);
}

.btn-primary:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(28, 28, 30, 0.3);
}

.btn-secondary {
  background: #ffffff;
  color: #1d1d1f;
  border: 1px solid #c7c7cc;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: #f2f2f7;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.btn-success {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-height: 36px;
  min-width: 100px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #1c1c1e;
  color: white;
}

.btn-success:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(28, 28, 30, 0.3);
}

.filter-controls {
  display: flex;
  align-items: center;
}

.invoice-summary {
  margin-bottom: 24px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.summary-card {
  background: #fafafa;
  border: 1px solid #f2f2f7;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  font-size: 20px;
  opacity: 0.7;
}

.summary-content h4 {
  color: #86868b;
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  color: #1d1d1f;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.table-container {
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #f2f2f7;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.modern-table th {
  background: #fafafa;
  font-weight: 600;
  color: #1d1d1f;
  text-align: left;
  padding: 10px 14px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f2f2f7;
  white-space: nowrap;
}

.modern-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f8f8f8;
  color: #1d1d1f;
  font-size: 14px;
  vertical-align: middle;
}

.table-row:hover {
  background: #fafafa;
}

.type-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-proforma {
  background: #fff3cd;
  color: #856404;
}

.type-tax {
  background: #d1fae5;
  color: #065f46;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-action-small {
  background: #1c1c1e;
  color: white;
  border: none;
  padding: 3px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-height: 24px;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(28, 28, 30, 0.2);
}

.btn-action-small:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(28, 28, 30, 0.3);
}

.no-invoices {
  padding: 40px 20px;
  text-align: center;
}

.no-data-content {
  max-width: 300px;
  margin: 0 auto;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-data-content h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.no-data-content p {
  margin: 0;
  font-size: 14px;
  color: #86868b;
}

.customer-actions {
  background: white;
  border: 1px solid #d2d2d7;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-card {
  background: #1c1c1e;
  color: white;
  border: 1px solid #1c1c1e;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  box-shadow: 0 2px 8px rgba(28, 28, 30, 0.2);
}

.action-card:hover {
  background: #000000;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(28, 28, 30, 0.3);
}

.action-card.success {
  background: #1c1c1e;
  border-color: #1c1c1e;
}

.action-card.success:hover {
  background: #000000;
  box-shadow: 0 4px 16px rgba(28, 28, 30, 0.4);
}

.action-card.convert-customer {
  background: #1c1c1e;
  border-color: #1c1c1e;
  position: relative;
}

.action-card.convert-customer::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #1c1c1e, #000000, #1c1c1e);
  border-radius: 14px;
  z-index: -1;
  opacity: 0.8;
}

.action-card.convert-customer:hover {
  background: #000000;
  box-shadow: 0 4px 20px rgba(28, 28, 30, 0.5);
}

.action-icon {
  font-size: 32px;
  opacity: 0.9;
}

.action-content h4 {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.action-content p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f2f2f7;
}

.modal-header h3 {
  margin: 0;
  color: #1d1d1f;
  font-size: 18px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #86868b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: #f5f5f7;
  color: #1d1d1f;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #f2f2f7;
}

.modal-footer .btn-primary,
.modal-footer .btn-secondary {
  min-width: 80px;
  min-height: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modal-footer .btn-primary:hover,
.modal-footer .btn-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Tab Styles */
.history-tabs {
  display: flex;
  border-bottom: 1px solid #d2d2d7;
  margin-bottom: 24px;
}

.tab-button {
  flex: 1;
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #86868b;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #1c1c1e;
  background: #f8f9fa;
}

.tab-button.active {
  color: #1c1c1e;
  border-bottom-color: #1c1c1e;
}

.history-content {
  min-height: 400px;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.payment-reference {
  font-weight: 600;
  color: #1c1c1e;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #1c1c1e;
  font-size: 14px;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #1c1c1e;
}

.form-control[readonly] {
  background: #f5f5f7;
  color: #86868b;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .customer-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .invoice-form-card {
    min-width: auto;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    min-width: auto;
  }
  
  .form-group {
    min-width: auto;
  }
  
  .content-wrapper {
    margin-top: 160px;
    padding: 16px;
  }
  
  .relationship-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-details {
    grid-template-columns: 1fr;
  }

  .history-tabs {
    flex-direction: column;
  }
  
  .tab-button {
    border-bottom: 1px solid #d2d2d7;
    border-right: none;
  }
  
  .tab-button.active {
    border-bottom-color: #1c1c1e;
  }
  
  .floating-back-button {
    top: 10px;
    right: 10px;
  }
  
  .content-wrapper {
    margin-top: 180px;
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .invoice-section,
  .invoice-list,
  .customer-actions,
  .payment-history {
    padding: 14px;
  }
  
  .invoice-form-card {
    padding: 14px;
  }
  
  .modern-table th,
  .modern-table td {
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .action-card {
    padding: 12px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .action-icon {
    font-size: 20px;
  }
  
  .btn-primary,
  .btn-secondary,
  .btn-success {
    min-width: 80px;
    min-height: 32px;
    width: 100%;
  }
  
  .relationship-header h1 {
    font-size: 24px;
    margin-bottom: 8px;
  }
}
</style>