<template>
  <div class="prospect-page">
    <!-- Floating Header -->
    <div class="floating-header">
      <div class="relationship-header">
        <h1>Prospect Management</h1>
        <div class="relationship-info">
          <span :class="isManufacturerProspect ? 'manufacturer selected-entity' : 'manufacturer'">
            {{ manufacturerName }}
          </span>
          <span class="connector">↔</span>
          <span :class="!isManufacturerProspect ? 'distributor selected-entity' : 'distributor'">
            {{ distributorName }}
          </span>
          <span :class="getStatusBadgeClass(prospectStatus)">{{ prospectStatus }}</span>
          <span v-if="currentLeadMapping?.last_status_change" class="status-date">
            Since {{ formatDate(currentLeadMapping.last_status_change) }}
          </span>
        </div>
      </div>
      <p>Manage terms & conditions and agreement generation</p>
    </div>

    <!-- Floating Back Button -->
    <div class="floating-back-button">
      <button class="btn-floating-back" @click="$router.go(-1)">
        ← Back
      </button>
    </div>

    <div class="content-wrapper">
      <div class="prospect-content">
        <div class="terms-section">
          <div class="section-header">
            <h2>Terms & Conditions</h2>
            <div class="section-actions">
              <button 
                type="button" 
                class="btn-edit"
                @click="editMode = !editMode"
              >
                {{ editMode ? 'Cancel' : 'Edit Terms' }}
              </button>
            </div>
          </div>
          
          <div class="terms-container">
            <div class="terms-list">
              <div v-for="term in agreement.terms" :key="term.id" class="term-card">
                <div class="term-content">
                  <div class="term-field">
                    <label>Clause</label>
                    <select 
                      v-model="term.clause" 
                      :disabled="!editMode"
                      @change="onClauseChange(term)"
                      class="modern-select"
                    >
                      <option value="">Select Clause</option>
                      <option v-for="clause in clauseData" :key="clause.name" :value="clause.clause">
                        {{ clause.clause }}
                      </option>
                    </select>
                  </div>
                  <div class="term-field">
                    <label>Response</label>
                    <select 
                      v-model="term.response" 
                      :disabled="!editMode || !term.clause"
                      class="modern-select"
                    >
                      <option value="">Select Response</option>
                      <!-- Show current response if it doesn't match predefined options -->
                      <option 
                        v-if="term.response && !isValidResponse(term.clause, term.response)"
                        :value="term.response"
                        style="color: #ff6b35; font-style: italic;"
                      >
                        {{ term.response }} (Custom)
                      </option>
                      <!-- Show predefined options -->
                      <option 
                        v-for="response in getResponseOptions(term.clause)" 
                        :key="response" 
                        :value="response"
                      >
                        {{ response }}
                      </option>
                    </select>
                  </div>
                  <div class="term-actions" v-if="editMode">
                    <button 
                      type="button" 
                      class="btn-delete" 
                      @click="removeTerm(term.id)"
                      :disabled="agreement.terms.length <= 1"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Action buttons at bottom of terms container -->
            <div class="terms-actions" v-if="editMode">
              <button 
                type="button" 
                class="btn-add-term" 
                @click="addTerm"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 3.5V10.5M3.5 7H10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Add Term
              </button>
              <button 
                type="button" 
                class="btn-save-changes"
                @click="toggleEditMode"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11.667 3.5L5.25 9.917L2.333 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div class="agreement-section">
          <div class="section-header">
            <h2>Agreement Management</h2>
            <div class="section-icon">📋</div>
          </div>
          
          <div class="agreement-info-card">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Status</span>
                <span :class="getStatusClass(agreement.status)" class="status-indicator">
                  {{ agreement.status }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Version</span>
                <span class="info-value">v{{ agreement.version }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Created</span>
                <span class="info-value">{{ formatDate(agreement.createdDate) }}</span>
              </div>
              <div class="info-item" v-if="agreement.signedDate">
                <span class="info-label">Signed</span>
                <span class="info-value">{{ formatDate(agreement.signedDate) }}</span>
              </div>
              <div class="info-item" v-if="currentLeadMapping?.signed_agreement">
                <span class="info-label">Signed File</span>
                <span class="info-value">✅ Uploaded</span>
              </div>
            </div>
          </div>

          <div class="agreement-actions">
            <button 
              class="btn-primary" 
              @click="generateAgreement"
              :disabled="agreement.status === 'Signed'"
            >
              {{ agreement.status === 'Draft' ? '📄 Generate Agreement' : '🔄 Regenerate Agreement' }}
            </button>
            
            <button 
              class="btn-secondary" 
              @click="downloadAgreement"
              v-if="agreement.status !== 'Draft'"
            >
              📥 Download PDF
            </button>
            
            <button 
              class="btn-secondary" 
              @click="uploadSigned"
              v-if="agreement.status === 'Generated'"
            >
              📤 Upload Signed Copy
            </button>
            
            <button 
              class="btn-success" 
              @click="convertToCustomer"
              v-if="canConvertToCustomer"
            >
              ✅ Proceed to Customer Conversion
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Agreement Preview Modal -->
    <div v-if="showPreviewModal" class="modal-overlay" @click="closePreview">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>Agreement Preview</h3>
          <button class="btn-close" @click="closePreview">×</button>
        </div>
        <div class="modal-body">
          <div class="agreement-preview">
            <div class="preview-header">
              <h4>Distribution Agreement</h4>
              <div class="preview-meta">
                <p><strong>Manufacturer:</strong> {{ manufacturerName }}</p>
                <p><strong>Distributor:</strong> {{ distributorName }}</p>
                <p><strong>Version:</strong> {{ agreement.version }}</p>
                <p><strong>Date:</strong> {{ formatDate(agreement.createdDate) }}</p>
              </div>
            </div>
            
            <div class="terms-preview">
              <h5>Terms & Conditions</h5>
              <div class="terms-preview-list">
                <div v-for="term in agreement.terms" :key="term.id" class="term-preview-item">
                  <div class="term-preview-clause">{{ term.clause }}</div>
                  <div class="term-preview-response">{{ term.response }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closePreview">Cancel</button>
          <button class="btn-primary" @click="confirmGeneration">Confirm Generation</button>
        </div>
      </div>
    </div>

    <!-- File Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click="closeUpload">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Upload Signed Agreement</h3>
          <button class="btn-close" @click="closeUpload">×</button>
        </div>
        <div class="modal-body">
          <div class="upload-section">
            <div class="upload-area">
              <input 
                type="file" 
                ref="fileInput"
                @change="handleFileUpload"
                accept=".pdf,.doc,.docx"
                class="file-input-hidden"
                id="file-upload"
              >
              <label for="file-upload" class="upload-label">
                <div class="upload-icon">📄</div>
                <div class="upload-text">
                  <p>Click to upload signed agreement</p>
                  <span>PDF, DOC, or DOCX files only</span>
                </div>
              </label>
            </div>
            <div v-if="selectedFile" class="selected-file">
              <span class="file-name">{{ selectedFile.name }}</span>
              <button @click="selectedFile = null" class="btn-remove-file">×</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeUpload">Cancel</button>
          <button class="btn-primary" @click="submitUpload" :disabled="!selectedFile">
            Upload Agreement
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBusinessLogic } from '../composables/useBusinessLogic';
import type { TermsCondition } from '../types';

const props = defineProps<{
  id: string;
  parentId?: string;
}>();

const router = useRouter();
const { agreement, updateAgreement } = useBusinessLogic();

const editMode = ref(false);
const showPreviewModal = ref(false);
const showUploadModal = ref(false);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// API data state
const selectedEntityData = ref<any>(null); // Main selected entity from Dashboard
const associatedEntityData = ref<any>(null); // Associated entity clicked from table
const currentLeadMapping = ref<any>(null); // Current lead mapping record
const prospectStatus = ref('Prospect'); // Default status
const clauseData = ref<any[]>([]); // Clause data from API

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
      status: prospectStatus.value,
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
      status: prospectStatus.value,
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
      status: prospectStatus.value,
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
      status: prospectStatus.value,
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
const isManufacturerProspect = computed(() => {
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

// Check if signed agreement is available for customer conversion
const canConvertToCustomer = computed(() => {
  return agreement.value.status === 'Signed' || (currentLeadMapping.value?.signed_agreement);
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Draft':
      return 'status-draft';
    case 'Generated':
      return 'status-generated';
    case 'Signed':
      return 'status-signed';
    default:
      return '';
  }
};

const addTerm = () => {
  const newTerm: TermsCondition = {
    id: `T${Date.now()}`,
    clause: '',
    response: ''
    // No originalData for new terms
  };
  agreement.value.terms.push(newTerm);
};

const removeTerm = (termId: string) => {
  const index = agreement.value.terms.findIndex(term => term.id === termId);
  if (index > -1 && agreement.value.terms.length > 1) {
    agreement.value.terms.splice(index, 1);
  }
};

const onClauseChange = (term: TermsCondition) => {
  term.response = '';
};

const getResponseOptions = (clause: string) => {
  console.log('Getting response options for clause:', clause);
  console.log('Available clauseData:', clauseData.value);
  
  const clauseItem = clauseData.value.find(item => item.clause === clause);
  console.log('Found clause item:', clauseItem);
  
  if (clauseItem && clauseItem.responses) {
    // Split responses by newline and filter out empty lines
    const responses = clauseItem.responses.split('\n').filter((response: string) => response.trim() !== '');
    console.log('Extracted responses:', responses);
    return responses;
  }
  console.log('No responses found for clause:', clause);
  return [];
};

// Helper function to check if a response is valid for a clause
const isValidResponse = (clause: string, response: string) => {
  const validResponses = getResponseOptions(clause);
  return validResponses.includes(response);
};

// Function to save terms and conditions to API
const saveTermsAndConditions = async () => {
  try {
    if (!currentLeadMapping.value || !currentLeadMapping.value.name) {
      console.error('No Lead Mapping found to save terms');
      return;
    }

    // Prepare terms data in the required format
    const termsData = agreement.value.terms.map((term, index) => {
      // Find the clause data to get the clause ID
      const clauseItem = clauseData.value.find(item => item.clause === term.clause);
      
      const termData: any = {
        docstatus: 0,
        doctype: "Lead Mapping TnC",
        owner: "Administrator",
        parent: currentLeadMapping.value.name,
        parentfield: "terms_and_conditions",
        parenttype: "Lead Mapping",
        idx: index + 1,
        clause_text: term.clause,
        clause: clauseItem ? clauseItem.name : "",
        response: term.response
      };
      
      // If term has originalData, it's an existing term
      if (term.originalData) {
        termData.name = term.originalData.name;
        termData.creation = term.originalData.creation;
        termData.modified = term.originalData.modified;
        termData.modified_by = term.originalData.modified_by;
      } else {
        // For new terms, add the __islocal and __unsaved flags
        termData.__islocal = 1;
        termData.__unsaved = 1;
        termData.__unedited = false;
      }
      
      return termData;
    });

    const requestData = {
      terms_and_conditions: termsData
    };

    console.log('Saving terms to Lead Mapping:', currentLeadMapping.value.name);
    console.log('Current agreement terms:', agreement.value.terms);
    console.log('Prepared terms data:', termsData);
    console.log('Request data:', requestData);

    const response = await fetch(`/api/resource/Lead Mapping/${currentLeadMapping.value.name}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Terms saved successfully:', data);
      
      // Reload the Lead Mapping data to get updated terms
      await fetchLeadMapping();
      
      // Update the agreement state
      updateAgreement(agreement.value);
    } else {
      const errorData = await response.json();
      console.error('Failed to save terms:', errorData);
    }
  } catch (error) {
    console.error('Error saving terms and conditions:', error);
  }
};

const toggleEditMode = async () => {
  if (editMode.value) {
    // Save terms & conditions to API
    await saveTermsAndConditions();
  }
  editMode.value = !editMode.value;
};

const generateAgreement = () => {
  showPreviewModal.value = true;
};

const closePreview = () => {
  showPreviewModal.value = false;
};

const confirmGeneration = () => {
  const updatedAgreement = {
    ...agreement.value,
    status: 'Generated' as const,
    version: agreement.value.version + 1,
    createdDate: new Date().toISOString()
  };
  
  updateAgreement(updatedAgreement);
  showPreviewModal.value = false;
  console.log('Agreement generated successfully');
};

const downloadAgreement = () => {
  if (!currentLeadMapping.value || !currentLeadMapping.value.name) {
    console.error('Error: No Lead Mapping found to download agreement');
    return;
  }

  const link = document.createElement('a');
  link.href = `/api/method/frappe.utils.print_format.download_pdf?doctype=Lead%20Mapping&name=${currentLeadMapping.value.name}&format=Lead%20Mapping%20Agreement&no_letterhead=1&letterhead=No%20Letterhead&settings=%7B%7D&_lang=en`;
  link.download = `Agreement_${manufacturerName.value}_${distributorName.value}_v${agreement.value.version}.pdf`;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log('Agreement download initiated');
};

const uploadSigned = () => {
  showUploadModal.value = true;
};

const closeUpload = () => {
  showUploadModal.value = false;
  selectedFile.value = null;
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  }
};

const submitUpload = async () => {
  if (selectedFile.value) {
    try {
      if (!currentLeadMapping.value || !currentLeadMapping.value.name) {
        console.error('Error: No Lead Mapping found to upload signed agreement');
        return;
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', selectedFile.value);
      formData.append('doctype', 'Lead Mapping');
      formData.append('docname', currentLeadMapping.value.name);
      formData.append('fieldname', 'signed_agreement');
      formData.append('is_private', '0');

      // Upload file to Frappe
      const uploadResponse = await fetch('/api/method/upload_file', {
        method: 'POST',
        body: formData
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        console.log('File uploaded successfully:', uploadData);

        // Update the Lead Mapping with both file and status in one API call
        const updateData = {
          signed_agreement: uploadData.message.file_url,
          status: 'Prospect'
        };

        const updateResponse = await fetch(`/api/resource/Lead Mapping/${currentLeadMapping.value.name}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
          const updatedAgreement = {
            ...agreement.value,
            status: 'Signed' as const,
            signedDate: new Date().toISOString()
          };
          
          updateAgreement(updatedAgreement);
          showUploadModal.value = false;
          selectedFile.value = null;
          
          // Refresh the lead mapping data
          await fetchLeadMapping();
          
          console.log('Signed agreement uploaded successfully! Status updated to Prospect.');
        } else {
          const errorData = await updateResponse.json();
          console.error('Failed to update Lead Mapping:', errorData);
        }
      } else {
        const errorData = await uploadResponse.json();
        console.error('Failed to upload file:', errorData);
      }
    } catch (error) {
      console.error('Error uploading signed agreement:', error);
    }
  }
};

const convertToCustomer = () => {
  // Note: This function should be updated to use proper API calls
  // For now, we'll just redirect to the customer page
  console.log('Redirecting to customer conversion...');
  
  // Navigate to Customer page with both id and parentId (if available)
  const params: any = { id: props.id };
  if (props.parentId) {
    params.parentId = props.parentId;
  }
  
  router.push({ name: 'Customer', params });
};

// Function to fetch clause data from API
const fetchClauseData = async () => {
  try {
    const response = await fetch('/api/resource/Lead%20Mapping%20TnC%20Master?fields=["name","clause","responses"]');
    if (response.ok) {
      const data = await response.json();
      console.log('Clause data API response:', data);
      
      if (data && data.data && data.data.length > 0) {
        clauseData.value = data.data;
        console.log('Loaded clause data:', clauseData.value);
        console.log('First clause example:', clauseData.value[0]);
      } else {
        console.warn('No clause data found');
        clauseData.value = [];
      }
    } else {
      console.error('Failed to fetch clause data:', response.status);
      clauseData.value = [];
    }
  } catch (error) {
    console.error('Error fetching clause data:', error);
    clauseData.value = [];
  }
};

// Function to load existing terms & conditions
const loadExistingTerms = async (existingTerms: any[]) => {
  try {
    console.log('Loading existing terms:', existingTerms);
    console.log('Available clause data:', clauseData.value);
    
    // Clear current terms
    agreement.value.terms = [];
    
    // Convert existing terms to our format and store original data
    const loadedTerms = existingTerms.map((term, index) => {
      // Find the matching clause from clauseData to get the correct clause text
      let matchingClause = clauseData.value.find(clause => clause.name === term.clause);
      let clauseText = '';
      
      if (matchingClause) {
        clauseText = matchingClause.clause;
        console.log(`Term ${index}: Found exact match by ID - clause="${clauseText}"`);
      } else {
        // Fallback: try to match by clause_text
        matchingClause = clauseData.value.find(clause => clause.clause === term.clause_text);
        if (matchingClause) {
          clauseText = matchingClause.clause;
          console.log(`Term ${index}: Found match by text - clause="${clauseText}"`);
        } else {
          // Last fallback: use clause_text as is
          clauseText = term.clause_text || '';
          console.log(`Term ${index}: No match found, using clause_text="${clauseText}"`);
        }
      }
      
      console.log(`Term ${index}: API clause_text="${term.clause_text}", API clause="${term.clause}", final clause="${clauseText}"`);
      console.log(`Term ${index}: Response="${term.response}"`);
      
      return {
        id: term.name || `T${Date.now()}-${index}`, // Use original name as ID
        clause: clauseText, // Use the clause text that matches dropdown options
        response: term.response || '',
        originalData: term // Store original term data for updates
      };
    });
    
    // Update agreement with loaded terms
    agreement.value.terms = loadedTerms;
    
    console.log('Final loaded terms into agreement:', loadedTerms);
    console.log('All clause options available:', clauseData.value.map(c => c.clause));
    
    // Update the agreement state
    updateAgreement(agreement.value);
    
  } catch (error) {
    console.error('Error loading existing terms:', error);
  }
};

// Function to fetch current Lead Mapping
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
      const filterUrl = `/api/resource/Lead Mapping?fields=["name"]&filters=${encodeURIComponent(JSON.stringify(filters))}`;
      
      const filterResponse = await fetch(filterUrl);
      if (filterResponse.ok) {
        const filterData = await filterResponse.json();
        console.log('Lead Mapping filter response:', filterData);
        
        if (filterData && filterData.data && filterData.data.length > 0) {
          const leadMappingId = filterData.data[0].name;
          console.log('Found Lead Mapping ID:', leadMappingId);
          
          // Now fetch the complete Lead Mapping with all fields
          const detailUrl = `/api/resource/Lead Mapping/${leadMappingId}`;
          const detailResponse = await fetch(detailUrl);
          
          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            console.log('Lead Mapping detail response:', detailData);
            
            if (detailData && detailData.data) {
              currentLeadMapping.value = detailData.data;
              prospectStatus.value = currentLeadMapping.value.status || 'Prospect';
              console.log('Current Lead Mapping:', currentLeadMapping.value);
              
              // Load existing terms & conditions if available
              if (currentLeadMapping.value.terms_and_conditions && currentLeadMapping.value.terms_and_conditions.length > 0) {
                await loadExistingTerms(currentLeadMapping.value.terms_and_conditions);
              }
            }
          }
        } else {
          // No mapping found, keep default status
          prospectStatus.value = 'Prospect';
        }
      }
    }
  } catch (error) {
    console.error('Error fetching lead mapping:', error);
    prospectStatus.value = 'Prospect';
  }
};

// Function to get status badge class
const getStatusBadgeClass = (status: string) => {
  const base = 'status-badge';
  return `${base} ${{
    Registration: 'status-registration',
    Lead: 'status-lead',
    Prospect: 'status-prospect',
    Customer: 'status-customer',
    View: 'status-view'
  }[status] || 'status-prospect'}`;
};

onMounted(async () => {
  console.log('Loading prospect data for ID:', props.id, 'ParentID:', props.parentId);
  
  try {
    // Fetch clause data first - this is crucial for term mapping
    await fetchClauseData();
    console.log('Clause data loaded, now fetching entities...');
    
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
    console.log('Is Manufacturer Prospect:', isManufacturerProspect.value);
    
    // Fetch current Lead Mapping to get the current status - this will trigger loadExistingTerms
    console.log('Now fetching Lead Mapping...');
    await fetchLeadMapping();
    
  } catch (error) {
    console.error('Error fetching prospect data:', error);
    // Keep default values if API calls fail
  }
});
</script>

<style scoped>
.prospect-page {
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

.status-registration {
  background: #ede9fe;
  color: #7c3aed;
  border: 1px solid #c4b5fd;
}

.status-lead {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fcd34d;
}

.status-prospect {
  background: #e8f4fd;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.status-customer {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #86efac;
}

.status-view {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.status-date {
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
  margin-left: 8px;
}

.selected-entity {
  border: 2px solid #1c1c1e !important;
  box-shadow: 0 0 0 2px rgba(28, 28, 30, 0.2);
}

.prospect-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.terms-section,
.agreement-section {
  background: white;
  border: 1px solid #d2d2d7;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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

.section-actions {
  display: flex;
  gap: 12px;
}

.btn-edit,
.btn-add {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-edit {
  background: #1c1c1e;
  color: white;
}

.btn-edit:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(28, 28, 30, 0.3);
}

.btn-add {
  background: #ffffff;
  color: #1d1d1f;
  border: 1px solid #c7c7cc;
}

.btn-add:hover {
  background: #f2f2f7;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.terms-container {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #f2f2f7;
  border-radius: 12px;
  background: #fafafa;
  padding: 16px 16px 0 16px;
}

.terms-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.term-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #f2f2f7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.term-content {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  align-items: end;
}

.term-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.term-field label {
  font-weight: 600;
  color: #1d1d1f;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modern-select {
  padding: 10px 12px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
  color: #1d1d1f;
  background: white;
  transition: all 0.2s ease;
}

.modern-select:disabled {
  background: #f5f5f7;
  color: #86868b;
  cursor: not-allowed;
}

.modern-select:focus {
  outline: none;
  border-color: #1c1c1e;
  box-shadow: 0 0 0 3px rgba(28, 28, 30, 0.1);
}

.term-actions {
  display: flex;
  align-items: center;
}

.btn-delete {
  background: #620c08;
  color: white;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(255, 59, 48, 0.2);
}

.btn-delete:hover:not(:disabled) {
  background: #970a27;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(255, 59, 48, 0.4);
}

.btn-delete:disabled {
  background: #d1d1d6;
  cursor: not-allowed;
  transform: none;
  opacity: 0.6;
  box-shadow: none;
}

.terms-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #f2f2f7;
  background: #fafafa;
  border-radius: 0 0 12px 12px;
  margin: 16px -16px 0 -16px;
}

.btn-add-term,
.btn-save-changes {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-height: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-add-term {
  background: #ffffff;
  color: #1d1d1f;
  border: 1px solid #c7c7cc;
}

.btn-add-term:hover {
  background: #f2f2f7;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.btn-save-changes {
  background: #1c1c1e;
  color: white;
}

.btn-save-changes:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(28, 28, 30, 0.4);
}

.agreement-info-card {
  background: #fafafa;
  border: 1px solid #f2f2f7;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-weight: 600;
  color: #86868b;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  color: #1d1d1f;
  font-weight: 500;
  font-size: 14px;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.status-draft {
  background: #fff3cd;
  color: #856404;
}

.status-generated {
  background: #e8f4fd;
  color: #1e40af;
}

.status-signed {
  background: #d1fae5;
  color: #065f46;
}

.agreement-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary,
.btn-secondary,
.btn-success {
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-align: center;
}

.btn-primary {
  background: #1c1c1e;
  color: white;
  box-shadow: 0 1px 3px rgba(28, 28, 30, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(28, 28, 30, 0.3);
}

.btn-primary:disabled {
  background: #d1d1d6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.6;
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
  background: #1c1c1e;
  color: white;
  box-shadow: 0 1px 3px rgba(28, 28, 30, 0.2);
}

.btn-success:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(28, 28, 30, 0.4);
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
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.large-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
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
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #f2f2f7;
}

.agreement-preview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-header h4 {
  color: #1d1d1f;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
}

.preview-meta {
  background: #fafafa;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #f2f2f7;
}

.preview-meta p {
  margin: 4px 0;
  color: #1d1d1f;
  font-size: 14px;
}

.terms-preview h5 {
  color: #1d1d1f;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.terms-preview-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.term-preview-item {
  background: #fafafa;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #f2f2f7;
}

.term-preview-clause {
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.term-preview-response {
  color: #86868b;
  font-size: 14px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-area {
  border: 2px dashed #d2d2d7;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #1c1c1e;
  background: #fafafa;
}

.file-input-hidden {
  display: none;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.upload-icon {
  font-size: 48px;
  opacity: 0.6;
}

.upload-text p {
  margin: 0;
  color: #1d1d1f;
  font-weight: 500;
  font-size: 16px;
}

.upload-text span {
  color: #86868b;
  font-size: 14px;
}

.selected-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f5f7;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #d2d2d7;
}

.file-name {
  color: #1d1d1f;
  font-weight: 500;
}

.btn-remove-file {
  background: none;
  border: none;
  color: #86868b;
  cursor: pointer;
  font-size: 18px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-remove-file:hover {
  background: #e8e8ed;
  color: #1d1d1f;
}

@media (max-width: 768px) {
  .prospect-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .term-content {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .terms-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .content-wrapper {
    margin-top: 160px;
    padding: 16px;
  }
  
  .terms-container {
    max-height: 400px;
  }
  
  .relationship-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .section-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .terms-section,
  .agreement-section {
    padding: 16px;
  }
  
  .term-card {
    padding: 16px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
  
  .btn-add-term,
  .btn-save-changes {
    justify-content: center;
  }
  
  .upload-area {
    padding: 24px;
  }
  
  .upload-icon {
    font-size: 36px;
  }
}
</style>