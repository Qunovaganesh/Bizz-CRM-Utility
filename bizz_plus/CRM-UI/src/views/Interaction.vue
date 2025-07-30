<template>
    <div class="lead-page">
      <!-- Floating Header -->
      <div class="floating-header">
        <div class="relationship-header">
          <h1>Lead Interaction</h1>
          <div class="relationship-info">
            <span :class="category == 'manufacturer' ? 'manufacturer selected-entity' : 'manufacturer'" v-if="category == 'manufacturer'">
            {{ props.name }}
            <span class="entity-type">🏭 Manufacturer</span>
          </span>
          <!-- <span class="connector">⇄</span> -->
          <span :class="category == 'distributor' ? 'distributor selected-entity' : 'distributor'" v-if="category == 'distributor'">
            {{ props.name }}
            <span class="entity-type">🏪 Distributor</span>
          </span>
          <span :class="getStatusBadgeClass(props.status)">{{ props.status }}</span>
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
     
  
      <div class="content-wrapper">
        
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
                      <th>Assigned To</th>
                      <th>Date</th>
                      <th>Days Elapsed</th>
                      <th>Mode</th>
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
                          <div class="user-avatar">{{ (interaction.assigned_by_name || 'U').charAt(0) }}</div>
                          <span class="user-name">{{ interaction.assigned_by_name || 'Unknown' }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="user-cell">
                          <div class="user-avatar">{{ (interaction.assigned_to_name || 'U').charAt(0) }}</div>
                          <span class="user-name">{{ interaction.assigned_to_name || 'Unknown' }}</span>
                        </div>
                      </td>
                      <td>
                        <span class="date-cell">{{ formatDate(interaction.posting_date) }}</span>
                      </td>
                      <td>
                        <span class="time-elapsed">{{ getTimeElapsed(interaction.posting_date) }}</span>
                      </td>
                      <td>
                        <span :class="getModeClass(interaction.interaction_mode)" class="mode-badge">
                          {{ interaction.interaction_mode }}
                        </span>
                      </td>
                      <!-- <td>
                        <span :class="getReminderClass(!!interaction.reminder_date)" class="reminder-badge">
                          {{ interaction.reminder_date ? 'Yes' : 'No' }}
                        </span>
                      </td> -->
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
            <!-- Mobile Card View -->
            <div v-if="isMobile && apiInteractions.length" class="mobile-cards">
              <div v-for="(row, index) in apiInteractions" :key="row.id || index" class="mobile-card">
                <div class="card-header">
                  <div class="card-title">
                    <span class="serial-badge">{{ index + 1 }}</span>
                    <h4>{{ row.assigned_by_name ? row.assigned_by_name : 'Unknown' }}</h4>
                  </div>
                  <!-- <span :class="getStatusClass(row.status)" class="status-badge">
                    {{ row.status }}
                  </span> -->
                </div>
                
                <div class="card-content">
                  <div class="card-row">
                    <span class="label">Assigned To:</span>
                    <span class="value">{{ row.assigned_to_name ? row.assigned_to_name : 'Unknown' }}</span>
                  </div>
                  <div class="card-row">
                    <span class="label">Date:</span>
                    <span class="value">{{ formatDate(row.posting_date) }}</span>
                  </div>
                  <div class="card-row">
                    <span class="label">Days Elapsed:</span>
                    <span class="value">{{ getTimeElapsed(row.posting_date) }}</span>
                  </div>
                  <div class="card-row">
                    <span class="label">Mode:</span>
                    <span :class="getModeClass(row.interaction_mode)" class="mode-badge">
                      {{ row.interaction_mode }}
                    </span>
                  </div>
                  <div class="card-row">
                    <span class="label">Reminder:</span>
                    <span class="value">{{ row.reminder_date ? 'Yes' : 'No' }}</span>
                  </div>
                  <div class="card-row">
                    <span class="label">Reminder Date:</span>
                    <span class="value">{{ formatDate(row.reminder_date) }}</span>
                  </div>
                </div>
                
                <div class="card-actions">
                  <button class="btn-action-small mobile-action-btn" @click="viewNotes(row)">
                    View Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
  
    <div class="notes-section">
            <!-- <div class="section-header">
              <h2>Add New Interaction</h2>
              <div class="section-icon">💬</div>
            </div> -->
            
  
              
              <div class="interaction-wrapper"> <!-- New wrapper div -->
   
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
  
          <div class="form-group">
            <label>Reminder Date <span style="color: red;">*</span></label>
            <input 
              type="date" 
              v-model="newInteraction.reminderDate"
              :min="today"
              class="modern-input"
              required
            >
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
            <label>Follow Up <span style="color: red;">*</span></label>
            <select 
              v-model="newInteraction.assignedTo"
              class="modern-input"
              required
            >
              <option value="" disabled>Select a user</option>
              <option 
                v-for="user in userOptions" 
                :key="user.name" 
                :value="user.name"
              >
                {{ user.name }}
              </option>
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
        <!-- </div> -->
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
                <span class="detail-label">Assigned To:</span>
                <span class="detail-value">{{ selectedInteraction?.assignedTo }}</span>
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
    
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
// import { useRouter } from 'vue-router';
import type { Interaction } from '../types';

// const router = useRouter();

const props = defineProps<{
  id: string;
  name: string;
  category: string;
  status: string;
}>();

const getStatusBadgeClass = (status: string) => {
  const baseClass = 'status-badge';
  switch (status) {
    case 'Open':
      return `${baseClass} status-registration`;
    case 'Replied':
      return `${baseClass} status-lead`;
    case 'Opportunity':
      return `${baseClass} status-prospect`;
    case 'Verified':
      return `${baseClass} status-customer`;
    case 'View':
      return `${baseClass} status-view`;
    default:
      return `${baseClass} status-registration`;
  }
};

// const leadStatus = ref('Verified'); // Default to 'Registration', will be updated based on interactions
// const selectedEntityData = ref<any>(null); // Main selected entity from Dashboard
// const associatedEntityData = ref<any>(null); // Associated entity clicked from table
const apiInteractions = ref<any[]>([]); // API interactions data
const isLoadingInteractions = ref(false);
const isSubmittingInteraction = ref(false);
// const currentLeadMapping = ref<any>(null); // Current lead mapping record

const showNotesModal = ref(false);
const selectedInteraction = ref<Interaction | null>(null);
const isMobile = ref(false);
const userOptions = ref<{ name: string }[]>([]);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const newInteraction = ref({
  interactedBy: 'Current User',
  dateInteracted: new Date().toISOString().split('T')[0],
  mode: '' as 'Phone' | 'Face to Face' | '',
  notes: '',
  hasReminder: false,
  reminderDate: new Date().toISOString().split('T')[0],
  attachments: [] as string[],
  assignedTo: ''
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

onMounted(async () => {

  fetchInteractions();

  try {
    const res = await fetch('/api/method/bizz_plus.api.api.get_users')
    const data = await res.json()
    userOptions.value = data.message
  } catch (err) {
    console.error("Failed to fetch users", err)
  }

  checkMobile();
  window.addEventListener('resize', checkMobile);
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
})

const viewNotes = (interaction: any) => {
  selectedInteraction.value = {
    id: interaction.name,
    interactedBy: interaction.assigned_by_name || 'Unknown',
    dateInteracted: interaction.posting_date,
    mode: interaction.interaction_mode,
    notes: interaction.notes || '',
    hasReminder: !!interaction.reminder_date,
    reminderDate: interaction.reminder_date || '',
    timeElapsed: getTimeElapsed(interaction.posting_date),
    attachments: [],
    assignedTo: interaction.assigned_to_name || 'Unknown'
  };
  showNotesModal.value = true;
};

const submitNotes = async () => {
  const res = await fetch('/api/method/frappe.auth.get_logged_user')
  const data = await res.json();
  
  try {
    const interactionData = {
      interaction_mode: newInteraction.value.mode,
      notes: newInteraction.value.notes,
      reminder_date: newInteraction.value.reminderDate,
      lead: props.id,
      assigned_by: data.message,
      assigned_to: newInteraction.value.assignedTo
    };

    const response = await fetch('/api/resource/Bizz Interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interactionData)
    });

    if (response.ok) {
      console.log(response.ok)
      
      await fetchInteractions();
      
      // Reset form
      resetForm();
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
    reminderDate: new Date().toISOString().split('T')[0],
    attachments: [],
    assignedTo: ''
  };
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    newInteraction.value.attachments = Array.from(target.files).map(file => file.name);
  }
};

const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const closeModal = () => {
  showNotesModal.value = false;
  selectedInteraction.value = null;
};

const fetchInteractions = async () => {
  if (isLoadingInteractions.value) return;
  
  isLoadingInteractions.value = true;
  
  try {
    // Build the API URL with filters
    let url = '/api/resource/Bizz Interaction?fields=["name","interaction_mode","notes","reminder_date", "lead","posting_date","owner", "assigned_to_name", "assigned_by_name"]';
    
    // Add filters based on current lead IDs
    const filters: any = {};
    filters.lead = props.id;
    
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

</script>

<style scoped>
.lead-page {
  max-width: 1200px;
  margin: 0 auto;
  background: #f5f5f7;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin-bottom: 10px;
  padding: 24px;
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
  font-size: 15px;
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
  background: black;
  color: white;
  border: none;
  max-height: 50px;;
  border-radius: 25px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;

 
  transition: all 0.3s ease;
 
    padding: 10px 16px;
  
}

.btn-floating-promote:hover {
  background: black;
  transform: translateY(-2px);

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
background-color: #f4e3d7;      /* Light tan background */
  color: #3e2723;                 /* Deep espresso brown text */
  border: 1px solid #5d4037;
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
  margin-top: 10px;
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
  /* color: #1d1d1f;
  font-size: 20px;
  font-weight: 600;
  margin: 0; */
   margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
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
  padding: 10px;
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
/* Mobile Cards */
.mobile-cards {
  display: none;
  padding: 16px;
  gap: 16px;
  flex-direction: column;
}

.mobile-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.mobile-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.serial-badge {
  background: #f3f4f6;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.card-title h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  word-break: break-word;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.card-row .label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  min-width: 80px;
}

.card-row .value {
  font-size: 14px;
  color: #374151;
  text-align: right;
  word-break: break-word;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.mobile-action-btn {
  padding: 10px 20px;
  font-size: 13px;
  min-height: 40px;
}


@media (max-width: 768px) {
  .floating-header
   {
  /* position: static !important; 
  width: 100%;
  margin: 12px 0;
  padding: 0 8px; */
     position: static;
    width: 100%;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    
}
.floating-promote-button {
  
     position: static;
    width: 100%;
    margin-bottom: 12px;
   
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
    border-radius: 5px;
    
    border: 1px solid #e5e7eb;
    margin-top: 12px;
    transition: box-shadow 0.2s ease;
      padding: 10px 16px !important;
  font-size: 13px !important;
  min-height: 25px !important;
    
      
}

.form-group{
  padding: 10px;
}

.lead-page{
   padding: 10px;
  
}
/* Promote button styling */

    
.btn-floating-promote {
  font-size: 13px !important;
  padding: 8px 10px !important;
  min-height: 36px !important;
  border-radius: 12px;
  font-weight: 600;
  background: #1c1c1e;
  color: white;
  width: 100%;
   border: 1px solid #d2d2d7;
}




   .floating-back-button {
    top: 10px;
    right: 15px;
    font-size: 12px;
  }
  .content-wrapper {
    margin-top: 0;
    padding: 12px;
  }
  .lead-content {
    grid-template-columns: 1fr !important;
    gap: 16px;
  }
  .interactions-section,
  .notes-section,
  .associated-section,
  .potential-section {
    padding: 12px;
    border-radius: 10px;
    margin-top: 25px;
  }
  .section-header {
    /* flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding-bottom: 8px;
    margin-bottom: 12px; */
  
      /* flex-direction: column;
    gap: 12px;
    align-items: flex-start; */
      display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #d2d2d7;
  }
  .section-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1d1d1f;
    margin: 0;
  }
  .relationship-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    word-break: break-word;
  }
  .modern-table th,
  .modern-table td {
    padding: 8px 8px;
    font-size: 12px;
    min-width: 90px;
  }
  .table-container {
    max-height: 220px;
    border-radius: 8px;
  }
  .table-wrapper {
    min-width: 600px;
    max-height: 220px;
  }
  .form-grid {
    grid-template-columns: 1fr !important;
    gap: 12px;
  }
  .form-actions {
    flex-direction: column;
    gap: 8px;
    padding-top: 12px;
  }
  .btn-primary,
  .btn-secondary {
    min-width: 100px;
    font-size: 13px;
    padding: 10px 16px;
  }
  .user-avatar {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }
  .modal-content {
    padding: 8px;
    border-radius: 10px;
    max-width: 98vw;
  }
  .modal-header,
  .modal-body {
    padding: 12px;
  }
   .relationship-header h1 {
    font-size: 24px;
    margin-bottom: 8px;
  }
}

@media (max-width: 480px) {
  .table-container {
    display: none;
  }
   .floating-back-button {
    top: 10px;
    right: 10px;
  }
  .btn-floating-promote {
  font-size: 13px !important;
  padding: 8px 10px !important;
  min-height: 36px !important;
  border-radius: 12px;
  font-weight: 600;
  background: #1c1c1e;
  color: white;
  width: 100%;
}
.floating-promote-button{
  border-radius: 10px;
   border: 1px solid #d2d2d7;
}
  .mobile-cards {
    display: flex;
    padding: 12px;
    gap: 12px;
  }
  .lead-page{
   
    padding: 5px;
  
  }
  
  .mobile-card {
    padding: 12px;
  }
  .card-title h4 {
    font-size: 14px;
  }
  
  .card-row .label {
    font-size: 11px;
    min-width: 70px;
  }
  
  .card-row .value {
    font-size: 13px;
  }
  
  .mobile-action-btn {
    /* padding: 8px 16px;
    font-size: 12px; */
    min-height: 36px;
       min-width: 100px;
    font-size: 13px;
    padding: 10px 16px;
  }
  .content-wrapper {
    padding: 6px;
  }
  .lead-content {
    gap: 8px;
  }
  .interactions-section,
  .notes-section,
  .associated-section,
  .potential-section {
    padding: 6px;
    border-radius: 6px;
  }
  .section-header h2 {
    font-size: 18px;
  }
   
  .modern-table th,
  .modern-table td {
    padding: 6px 4px;
    font-size: 10px;
    min-width: 70px;
  }
  .user-avatar {
    width: 20px;
    height: 20px;
    font-size: 9px;
  }
  .btn-primary,
  .btn-secondary {
    font-size: 13px;
    padding: 8px 10px;
    min-height: 36px;
  }
  .modal-content {
    border-radius: 6px;
    max-width: 100vw;
  }
  .modal-header,
  .modal-body {
    padding: 8px;
  }
}
</style>