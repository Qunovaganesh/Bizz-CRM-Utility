<template>
  <div class="lead-page">
    <!-- Floating Header -->
    <div class="floating-header">
      <div class="relationship-header">
        <h1>Lead Management</h1>
        <div class="relationship-info">
          <span :class="isManufacturerLead ? 'manufacturer selected-entity' : 'manufacturer'">
            {{ manufacturerName }}
          </span>
          <span class="connector">↔</span>
          <span :class="!isManufacturerLead ? 'distributor selected-entity' : 'distributor'">
            {{ distributorName }}
          </span>
          <span :class="getStatusBadgeClass(leadStatus)">{{ leadStatus }}</span>
          <span v-if="currentLeadMapping?.last_status_change" class="status-date">
            Since {{ formatDate(currentLeadMapping.last_status_change) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Floating Back Button -->
    <div class="floating-back-button">
      <button class="btn-floating-back" @click="$router.go(-1)">
        ← Back
      </button>
    </div>

    <!-- Floating Promote to Prospect Button (shown when there's at least one interaction) -->
    <div class="floating-promote-button" v-if="apiInteractions.length > 0">
      <button class="btn-floating-promote" @click="navigateToProspect">
        Promote to Prospect →
      </button>
    </div>

    <div class="content-wrapper">
      <div class="lead-content">
        <div class="interactions-section">
          <div class="section-header">
            <h2>Past Interactions</h2>
            <div class="section-stats">
              <span class="stat-badge">{{ apiInteractions.length }} interactions</span>
            </div>
          </div>
          
          <div class="table-container">
            <div class="table-wrapper">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Interacted By</th>
                    <th>Date</th>
                    <th>Time Elapsed</th>
                    <th>Mode</th>
                    <th>Reminder</th>
                    <th>Reminder Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="isLoadingInteractions">
                    <td colspan="7" style="text-align: center; padding: 20px;">
                      <span>Loading interactions...</span>
                    </td>
                  </tr>
                  <tr v-else-if="apiInteractions.length === 0">
                    <td colspan="7" style="text-align: center; padding: 20px;">
                      <span>No interactions found</span>
                    </td>
                  </tr>
                  <tr v-else v-for="interaction in apiInteractions" :key="interaction.name" class="table-row">
                    <td>
                      <div class="user-cell">
                        <div class="user-avatar">{{ (interaction.owner || 'U').charAt(0) }}</div>
                        <span class="user-name">{{ interaction.owner || 'Unknown' }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="date-cell">{{ formatDate(interaction.creation) }}</span>
                    </td>
                    <td>
                      <span class="time-elapsed">{{ getTimeElapsed(interaction.creation) }}</span>
                    </td>
                    <td>
                      <span :class="getModeClass(interaction.interaction_mode)" class="mode-badge">
                        {{ interaction.interaction_mode }}
                      </span>
                    </td>
                    <td>
                      <span :class="getReminderClass(!!interaction.reminder_date)" class="reminder-badge">
                        {{ interaction.reminder_date ? 'Yes' : 'No' }}
                      </span>
                    </td>
                    <td>
                      <span class="reminder-date-cell">
                        {{ interaction.reminder_date ? formatDate(interaction.reminder_date) : '—' }}
                      </span>
                    </td>
                    <td>
                      <button class="btn-action-small" @click="viewNotes(interaction)">
                        View Notes
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="notes-section">
          <div class="section-header">
            <h2>Add New Interaction</h2>
            <div class="section-icon">💬</div>
          </div>
          
          <form @submit.prevent="submitNotes" class="modern-form">
            
            <div class="form-grid">
              <div class="form-group">
                <label>Interaction Mode</label>
                <select v-model="newInteraction.mode" required class="modern-select">
                  <option value="">Select Mode</option>
                  <option value="Phone">📞 Phone</option>
                  <option value="Face to Face">🤝 Face to Face</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label>Interaction Notes</label>
                <textarea 
                  v-model="newInteraction.notes" 
                  rows="4" 
                  placeholder="Enter detailed interaction notes..."
                  required
                  class="modern-textarea"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Attachments</label>
                <input 
                  type="file" 
                  multiple 
                  @change="handleFileUpload"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  class="modern-file-input"
                >
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="newInteraction.hasReminder"
                    class="modern-checkbox"
                  >
                  <span class="checkbox-custom"></span>
                  Add Reminder
                </label>
              </div>

              <div class="form-group" v-if="newInteraction.hasReminder">
                <label>Reminder Date</label>
                <input 
                  type="date" 
                  v-model="newInteraction.reminderDate"
                  :min="today"
                  class="modern-input"
                >
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="resetForm" :disabled="isSubmittingInteraction">
                Reset
              </button>
              <button type="submit" class="btn-primary" :disabled="isSubmittingInteraction">
                {{ isSubmittingInteraction ? 'Saving...' : 'Save Interaction' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Notes Modal -->
    <div v-if="showNotesModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Interaction Details</h3>
          <button class="btn-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="interaction-details">
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">{{ formatDate(selectedInteraction?.dateInteracted) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">By:</span>
              <span class="detail-value">{{ selectedInteraction?.interactedBy }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Mode:</span>
              <span class="detail-value">{{ selectedInteraction?.mode }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Notes:</span>
              <div class="detail-notes">{{ selectedInteraction?.notes }}</div>
            </div>
            <div class="detail-row" v-if="selectedInteraction?.hasReminder">
              <span class="detail-label">Reminder Date:</span>
              <span class="detail-value">{{ formatDate(selectedInteraction?.reminderDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Interaction } from '../types';

const router = useRouter();

const props = defineProps<{
  id: string;
  parentId?: string;
}>();

const leadStatus = ref('Registration'); // Default to 'Registration', will be updated based on interactions
const selectedEntityData = ref<any>(null); // Main selected entity from Dashboard
const associatedEntityData = ref<any>(null); // Associated entity clicked from table
const apiInteractions = ref<any[]>([]); // API interactions data
const isLoadingInteractions = ref(false);
const isSubmittingInteraction = ref(false);
const currentLeadMapping = ref<any>(null); // Current lead mapping record

const showNotesModal = ref(false);
const selectedInteraction = ref<Interaction | null>(null);

const newInteraction = ref({
  interactedBy: 'Current User',
  dateInteracted: new Date().toISOString().split('T')[0],
  mode: '' as 'Phone' | 'Face to Face' | '',
  notes: '',
  hasReminder: false,
  reminderDate: '',
  attachments: [] as string[]
});

const manufacturerData = computed(() => {
  // If we have actual entity data, use it
  if (selectedEntityData.value) {
    // Check if selected entity is a manufacturer
    if (selectedEntityData.value.custom_lead_category === 'Manufacturer Lead') {
      return {
        id: selectedEntityData.value.name,
        name: selectedEntityData.value.company_name || selectedEntityData.value.name,
        category: selectedEntityData.value.custom_categories || '',
        subCategory: '',
        city: selectedEntityData.value.custom_cities || '',
        district: selectedEntityData.value.custom_districts || '',
        state: selectedEntityData.value.custom_states || '',
        status: selectedEntityData.value.custom_new_status || '',
        registrationDate: selectedEntityData.value.creation ? new Date(selectedEntityData.value.creation).toISOString().split('T')[0] : '',
        daysSinceStatus: 0
      };
    }
  }
  
  // If associated entity is a manufacturer
  if (associatedEntityData.value && associatedEntityData.value.custom_lead_category === 'Manufacturer Lead') {
    return {
      id: associatedEntityData.value.name,
      name: associatedEntityData.value.company_name || associatedEntityData.value.name,
      category: associatedEntityData.value.custom_categories || '',
      subCategory: '',
      city: associatedEntityData.value.custom_cities || '',
      district: associatedEntityData.value.custom_districts || '',
      state: associatedEntityData.value.custom_states || '',
      status: associatedEntityData.value.custom_new_status || '',
      registrationDate: associatedEntityData.value.creation ? new Date(associatedEntityData.value.creation).toISOString().split('T')[0] : '',
      daysSinceStatus: 0
    };
  }
  
  // Default fallback
  return {
    id: '',
    name: 'Select Manufacturer',
    category: '',
    subCategory: '',
    city: '',
    district: '',
    state: '',
    status: '',
    registrationDate: '',
    daysSinceStatus: 0
  };
});

const distributorData = computed(() => {
  // If we have actual entity data, use it
  if (selectedEntityData.value) {
    // Check if selected entity is a distributor
    if (selectedEntityData.value.custom_lead_category === 'SS / Distributor Lead') {
      return {
        id: selectedEntityData.value.name,
        name: selectedEntityData.value.company_name || selectedEntityData.value.name,
        category: selectedEntityData.value.custom_categories || '',
        subCategory: '',
        city: selectedEntityData.value.custom_cities || '',
        district: selectedEntityData.value.custom_districts || '',
        state: selectedEntityData.value.custom_states || '',
        status: selectedEntityData.value.custom_new_status || '',
        registrationDate: selectedEntityData.value.creation ? new Date(selectedEntityData.value.creation).toISOString().split('T')[0] : '',
        daysSinceStatus: 0
      };
    }
  }
  
  // If associated entity is a distributor
  if (associatedEntityData.value && associatedEntityData.value.custom_lead_category === 'SS / Distributor Lead') {
    return {
      id: associatedEntityData.value.name,
      name: associatedEntityData.value.company_name || associatedEntityData.value.name,
      category: associatedEntityData.value.custom_categories || '',
      subCategory: '',
      city: associatedEntityData.value.custom_cities || '',
      district: associatedEntityData.value.custom_districts || '',
      state: associatedEntityData.value.custom_states || '',
      status: associatedEntityData.value.custom_new_status || '',
      registrationDate: associatedEntityData.value.creation ? new Date(associatedEntityData.value.creation).toISOString().split('T')[0] : '',
      daysSinceStatus: 0
    };
  }
  
  // Default fallback
  return {
    id: '',
    name: 'Select Distributor',
    category: '',
    subCategory: '',
    city: '',
    district: '',
    state: '',
    status: '',
    registrationDate: '',
    daysSinceStatus: 0
  };
});

const isManufacturerLead = computed(() => {
  // Determine based on the selected entity or associated entity
  if (selectedEntityData.value) {
    return selectedEntityData.value.custom_lead_category === 'Manufacturer Lead';
  }
  if (associatedEntityData.value) {
    return associatedEntityData.value.custom_lead_category === 'Manufacturer Lead';
  }
  return false;
});

const manufacturerName = computed(() => manufacturerData.value.name);
const distributorName = computed(() => distributorData.value.name);

// API function to fetch interactions
const fetchInteractions = async () => {
  if (isLoadingInteractions.value) return;
  
  isLoadingInteractions.value = true;
  
  try {
    // Build the API URL with filters
    let url = '/api/resource/Lead Interaction?fields=["name","interaction_mode","interaction_notes","reminder_date","parent_lead","mapped_lead","creation","owner"]';
    
    // Add filters based on current lead IDs
    const filters: any = {};
    
    if (props.id) {
      filters.mapped_lead = props.id;
    }
    
    if (props.parentId) {
      filters.parent_lead = props.parentId;
    }
    
    if (Object.keys(filters).length > 0) {
      url += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
    }
    
    console.log('Fetching interactions with URL:', url);
    
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log('Interactions API response:', data);
      
      if (data && data.data) {
        apiInteractions.value = data.data;
        
        // Do not update status based on interactions here
        // Status should only be updated when first interaction is posted
      }
    } else {
      console.error('Error fetching interactions:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching interactions:', error);
  } finally {
    isLoadingInteractions.value = false;
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
      const url = `/api/resource/Lead Mapping?fields=["name","parent_lead","mapped_lead","status","last_status_change"]&filters=${encodeURIComponent(JSON.stringify(filters))}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
          currentLeadMapping.value = data.data[0];
          leadStatus.value = currentLeadMapping.value.status;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching lead mapping:', error);
  }
};

// Function to update or create Lead Mapping
const updateLeadMapping = async (status: string) => {
  try {
    const mappingData = {
      parent_lead: props.parentId || null,
      mapped_lead: props.id,
      status: status,
      last_status_change: new Date().toISOString().split('T')[0]
    };
    
    let response;
    
    if (currentLeadMapping.value) {
      // Update existing mapping
      response = await fetch(`/api/resource/Lead Mapping/${currentLeadMapping.value.name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingData)
      });
    } else {
      // Create new mapping
      response = await fetch('/api/resource/Lead Mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingData)
      });
    }
    
    if (response.ok) {
      const result = await response.json();
      console.log('Lead Mapping updated/created:', result);
      currentLeadMapping.value = result.data;
    } else {
      console.error('Error updating lead mapping:', response.statusText);
    }
  } catch (error) {
    console.error('Error updating lead mapping:', error);
  }
};

const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getTimeElapsed = (creationDate: string | undefined) => {
  if (!creationDate) return '';
  const now = new Date();
  const created = new Date(creationDate);
  const diffInMs = now.getTime() - created.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInMonths = Math.floor(diffInDays / 30);
  
  if (diffInMonths > 0) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'}`;
  } else if (diffInDays > 0) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'}`;
  } else {
    return 'Today';
  }
};

const getModeClass = (mode: string) => {
  return mode === 'Phone' ? 'mode-phone' : 'mode-face';
};

const getReminderClass = (hasReminder: boolean) => {
  return hasReminder ? 'reminder-yes' : 'reminder-no';
};

const getStatusBadgeClass = (status: string) => {
  const baseClass = 'status-badge';
  switch (status) {
    case 'Registration':
      return `${baseClass} status-registration`;
    case 'Lead':
      return `${baseClass} status-lead`;
    case 'Prospect':
      return `${baseClass} status-prospect`;
    case 'Customer':
      return `${baseClass} status-customer`;
    case 'View':
      return `${baseClass} status-view`;
    default:
      return `${baseClass} status-registration`;
  }
};

const viewNotes = (interaction: any) => {
  selectedInteraction.value = {
    id: interaction.name,
    interactedBy: interaction.owner || 'Unknown',
    dateInteracted: interaction.creation,
    mode: interaction.interaction_mode,
    notes: interaction.interaction_notes || '',
    hasReminder: !!interaction.reminder_date,
    reminderDate: interaction.reminder_date || '',
    timeElapsed: getTimeElapsed(interaction.creation),
    attachments: []
  };
  showNotesModal.value = true;
};

const closeModal = () => {
  showNotesModal.value = false;
  selectedInteraction.value = null;
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    newInteraction.value.attachments = Array.from(target.files).map(file => file.name);
  }
};

const submitNotes = async () => {
  if (!newInteraction.value.mode || !newInteraction.value.notes) {
    console.error('Please fill in all required fields');
    return;
  }

  isSubmittingInteraction.value = true;
  
  try {
    const interactionData = {
      interaction_mode: newInteraction.value.mode,
      interaction_notes: newInteraction.value.notes,
      reminder_date: newInteraction.value.hasReminder ? newInteraction.value.reminderDate : null,
      parent_lead: props.parentId || null,
      mapped_lead: props.id
    };

    console.log('Submitting interaction:', interactionData);

    const response = await fetch('/api/resource/Lead Interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interactionData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Interaction created:', result);
      
      // Check if this is the first interaction
      const isFirstInteraction = apiInteractions.value.length === 0;
      
      // Refresh the interactions list
      await fetchInteractions();
      
      // If this was the first interaction, update status to 'Lead'
      if (isFirstInteraction) {
        leadStatus.value = 'Lead';
        await updateLeadMapping('Lead');
        console.log('First interaction added - status updated to Lead');
      }
      
      // Reset form
      resetForm();
      
      if (isFirstInteraction) {
        console.log('First interaction added successfully! Status updated to Lead.');
      } else {
        console.log('Interaction added successfully!');
      }
    } else {
      const error = await response.json();
      console.error('Error creating interaction:', error);
    }
  } catch (error) {
    console.error('Error submitting interaction:', error);
  } finally {
    isSubmittingInteraction.value = false;
  }
};

const resetForm = () => {
  newInteraction.value = {
    interactedBy: 'Current User',
    dateInteracted: new Date().toISOString().split('T')[0],
    mode: '',
    notes: '',
    hasReminder: false,
    reminderDate: '',
    attachments: []
  };
};

// Function to navigate to prospect page
const navigateToProspect = () => {
  router.push({ 
    name: 'Prospect', 
    params: { 
      id: props.id,
      parentId: props.parentId || ''
    }
  });
};

onMounted(async () => {
  console.log('Loading lead data for ID:', props.id, 'ParentID:', props.parentId);
  
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
    
    // Fetch current Lead Mapping to get the current status
    await fetchLeadMapping();
    
    // Fetch interactions after loading entity data
    await fetchInteractions();
    
  } catch (error) {
    console.error('Error fetching lead data:', error);
    // Keep default values if API calls fail
  }
});
</script>

<style scoped>
.lead-page {
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
  margin-top: 120px;
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

.floating-promote-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.btn-floating-promote {
  background: #020006;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.3);
  transition: all 0.3s ease;
}

.btn-floating-promote:hover {
  background: #0056CC;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 122, 255, 0.4);
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
  background: #e3f2fd;
  color: #1565c0;
  border: 1px solid #90caf9;
}

.status-lead {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-prospect {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.status-customer {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #ce93d8;
}

.status-view {
  background: #f5f5f5;
  color: #616161;
  border: 1px solid #e0e0e0;
}

.category-manufacturer {
  background: #e3f2fd;
  color: #1565c0;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-distributor {
  background: #fff3cd;
  color: #856404;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.entity-name {
  font-weight: 600;
  color: #1d1d1f;
}

.entity-location {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entity-category-sub {
  color: #86868b;
  font-size: 12px;
  font-weight: 500;
}

.btn-action-primary {
  background: #007aff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-action-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.status-date {
  font-size: 11px;
  color: #86868b;
  background: #f5f5f7;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 500;
}

.selected-entity {
  border: 2px solid #1c1c1e !important;
  box-shadow: 0 0 0 2px rgba(28, 28, 30, 0.2);
}

.lead-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  grid-template-rows: auto auto auto;
}

.associated-section,
.potential-section {
  grid-column: span 2;
  background: white;
  border: 1px solid #d2d2d7;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.interactions-section {
  grid-column: span 1;
  background: white;
  border: 1px solid #d2d2d7;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.notes-section {
  grid-column: span 1;
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

.stat-badge {
  background: #f5f5f7;
  color: #86868b;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-container {
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #f2f2f7;
  max-height: 400px;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  max-height: 400px;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  position: relative;
}

.modern-table th {
  background: #fafafa;
  font-weight: 600;
  color: #1d1d1f;
  text-align: left;
  padding: 16px 20px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f2f2f7;
  white-space: nowrap;
}

.modern-table td {
  box-shadow: 0 1px 0 0 #f2f2f7;
  padding: 16px 20px;
  border-bottom: 1px solid #f8f8f8;
  color: #1d1d1f;
  font-size: 14px;
  vertical-align: middle;
}

.table-row:hover {
  background: #fafafa;
}

/* Enhanced scrollbar styling for webkit browsers */
.table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f8f8f8;
  border-radius: 4px;
  margin: 4px 0;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #c7c7cc;
  border-radius: 4px;
  border: 1px solid #f8f8f8;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #aeaeb2;
}

.table-wrapper::-webkit-scrollbar-thumb:active {
  background: #8e8e93;
}

.table-wrapper::-webkit-scrollbar-corner {
  background: #f8f8f8;
}

/* Firefox scrollbar */
.table-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #c7c7cc #f8f8f8;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1c1c1e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  font-weight: 500;
  color: #1d1d1f;
}

.date-cell {
  color: #86868b;
  font-weight: 500;
}

.time-elapsed {
  color: #86868b;
  font-style: italic;
}

.reminder-date-cell {
  color: #6b7280;
  font-weight: 500;
  font-size: 13px;
}

.mode-badge,
.reminder-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mode-phone {
  background: #e8f4fd;
  color: #1e40af;
}

.mode-face {
  background: #d1fae5;
  color: #065f46;
}

.reminder-yes {
  background: #fef3c7;
  color: #92400e;
}

.reminder-no {
  background: #f3f4f6;
  color: #86868b;
}

.btn-action-small {
  background: #1c1c1e;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-action-small:hover {
  background: #000000;
  transform: translateY(-1px);
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.status-change-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 12px;
  margin-bottom: 8px;
}

.notice-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notice-text {
  color: #1565c0;
  font-size: 14px;
  line-height: 1.4;
}

.notice-text strong {
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #1d1d1f;
  font-size: 14px;
}

.modern-input,
.modern-select,
.modern-textarea {
  padding: 12px 16px;
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 400;
  color: #1d1d1f;
  background: white;
  transition: all 0.2s ease;
  font-family: inherit;
}

.modern-input:focus,
.modern-select:focus,
.modern-textarea:focus {
  outline: none;
  border-color: #1c1c1e;
  box-shadow: 0 0 0 3px rgba(28, 28, 30, 0.1);
}

.modern-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.modern-file-input {
  padding: 12px 16px;
  border: 2px dashed #d2d2d7;
  border-radius: 12px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.modern-file-input:hover {
  border-color: #1c1c1e;
  background: #f5f5f7;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 500;
  color: #1d1d1f;
}

.modern-checkbox {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #d2d2d7;
  border-radius: 6px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.modern-checkbox:checked + .checkbox-custom {
  background: #1c1c1e;
  border-color: #1c1c1e;
}

.modern-checkbox:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #f2f2f7;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
}

.btn-primary {
  background: #1c1c1e;
  color: white;
}

.btn-primary:hover {
  background: #000000;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f5f5f7;
  color: #1d1d1f;
  border: 1px solid #d2d2d7;
}

.btn-secondary:hover {
  background: #e8e8ed;
  transform: translateY(-1px);
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

.interaction-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-weight: 600;
  color: #86868b;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #1d1d1f;
  font-weight: 500;
}

.detail-notes {
  color: #1d1d1f;
  line-height: 1.5;
  background: #fafafa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f2f2f7;
}

@media (max-width: 768px) {
  .lead-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .table-container {
    max-height: 300px;
  }
  
  .table-wrapper {
    max-height: 300px;
  }
  
  .content-wrapper {
    margin-top: 140px;
    padding: 16px;
  }
  
  .relationship-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .modern-table th,
  .modern-table td {
    padding: 12px 16px;
    font-size: 12px;
  }
  
  .interactions-section,
  .notes-section {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 12px;
  }
  
  .table-container {
    max-height: 250px;
  }
  
  .table-wrapper {
    max-height: 250px;
  }
  
  .interactions-section,
  .notes-section {
    padding: 16px;
    border-radius: 12px;
  }
  
  .section-header h2 {
    font-size: 18px;
  }
  
  .modern-table th,
  .modern-table td {
    padding: 8px 12px;
    font-size: 11px;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 10px 20px;
    font-size: 13px;
  }
}
</style>