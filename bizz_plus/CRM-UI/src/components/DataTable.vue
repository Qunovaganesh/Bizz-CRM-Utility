<template>
  <div class="data-table">
    <div class="table-header">
      <h3>{{ title }}</h3>
      <div class="table-actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="table-container">
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th v-for="column in visibleColumns" :key="column.key" :class="getColumnClass(column.key)">
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in data" :key="row.id || index" class="table-row">
              <td v-for="column in visibleColumns" :key="column.key" :class="getColumnClass(column.key)">
                <div class="cell-content">
                  <template v-if="column.key === 'serialNumber'">
                    <span class="serial-number">{{ index + 1 }}</span>
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <button 
                      v-if="getActionButton(row)"
                      :class="getActionButtonClass(row)"
                      @click="$emit('action-click', row)"
                      class="action-btn"
                    >
                      {{ getActionButton(row) }}
                    </button>
                  </template>
                  <template v-else-if="column.key === 'view'">
                    <button 
                      @click="$emit('view-click', row)"
                      class="view-btn"
                    >
                      👁️ View
                    </button>
                  </template>
                  <template v-else-if="column.key === 'status'">
                    <span :class="getStatusClass(row[column.key])" class="status-badge">
                      {{ row[column.key] }}
                    </span>
                  </template>
                  <template v-else-if="column.key === 'registrationDate'">
                    <span class="date-cell">{{ formatDate(row[column.key]) }}</span>
                  </template>
                  <template v-else-if="column.key === 'name'">
                    <div class="name-cell">
                      <span class="name-primary">{{ row[column.key] }}</span>
                      <span class="name-secondary" v-if="isMobile">{{ row.city }}, {{ row.state }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <span class="cell-text">{{ row[column.key] }}</span>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Card View -->
    <div v-if="isMobile && data.length" class="mobile-cards">
      <div v-for="(row, index) in data" :key="row.id || index" class="mobile-card">
        <div class="card-header">
          <div class="card-title">
            <span class="serial-badge">{{ index + 1 }}</span>
            <h4>{{ row.name }}</h4>
          </div>
          <span :class="getStatusClass(row.status)" class="status-badge">
            {{ row.status }}
          </span>
        </div>
        
        <div class="card-content">
          <div class="card-row">
            <span class="label">Location:</span>
            <span class="value">{{ row.city }}, {{ row.district }}, {{ row.state }}</span>
          </div>
          <div class="card-row">
            <span class="label">Category:</span>
            <span class="value">{{ row.category }} - {{ row.subCategory }}</span>
          </div>
          <div class="card-row">
            <span class="label">Days Since Status:</span>
            <span class="value">{{ row.daysSinceStatus }} days</span>
          </div>
          <div class="card-row">
            <span class="label">Registration:</span>
            <span class="value">{{ formatDate(row.registrationDate) }}</span>
          </div>
        </div>
        
        <div class="card-actions">
          <button 
            v-if="getActionButton(row)"
            :class="getActionButtonClass(row)"
            @click="$emit('action-click', row)"
            class="action-btn mobile-action-btn"
          >
            {{ getActionButton(row) }}
          </button>
          <button 
            @click="$emit('view-click', row)"
            class="view-btn mobile-view-btn"
          >
            👁️ View
          </button>
        </div>
      </div>
    </div>

    <div v-if="!data.length" class="no-data">
      <div class="no-data-content">
        <div class="no-data-icon">📊</div>
        <h4>No data available</h4>
        <p>Try adjusting your filters or check back later</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Manufacturer, Distributor } from '../types'

interface Column {
  key: string;
  label: string;
}

const props = defineProps<{
  title: string;
  columns: Column[];
  data: (Manufacturer | Distributor)[];
}>();

defineEmits<{
  'action-click': [row: any];
  'view-click': [row: any];
}>();

const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const visibleColumns = computed(() => {
  if (isMobile.value) {
    // Show only essential columns on mobile table view
    return [
      { key: 'serialNumber', label: '#' },
      { key: 'name', label: 'Name & Location' },
      { key: 'status', label: 'Status' },
      { key: 'action', label: 'Action' }
    ]
  }
  return props.columns
})

const getColumnClass = (key: string) => {
  const classes = [`col-${key}`]
  
  if (key === 'serialNumber') classes.push('col-narrow')
  if (key === 'action') classes.push('col-action')
  if (key === 'status') classes.push('col-status')
  if (key === 'name' && isMobile.value) classes.push('col-name-mobile')
  
  return classes.join(' ')
}

const getActionButton = (row: any) => {
  if ('status' in row) {
    if (row.status === 'Registration') return 'Process Lead';
    if (row.status === 'Lead') return 'Manage Lead';
    if (row.status === 'Prospect') return 'Manage Prospect';
    if (row.status === 'Customer') return 'Manage Customer';
    if (row.status === 'View') return 'View Details';
  }
  return 'View Details';
};

const getActionButtonClass = (row: any) => {
  const baseClass = 'btn-action';
  if ('status' in row) {
    if (row.status === 'Registration') return `${baseClass} btn-registration`;
    if (row.status === 'Lead') return `${baseClass} btn-lead`;
    if (row.status === 'Prospect') return `${baseClass} btn-prospect`;
    if (row.status === 'Customer') return `${baseClass} btn-customer`;
    if (row.status === 'View') return `${baseClass} btn-view`;
  }
  return `${baseClass} btn-view`;
};

const getStatusClass = (status: string) => {
  const baseClass = 'status-badge';
  if (status === 'Registration') return `${baseClass} status-registration`;
  if (status === 'Lead') return `${baseClass} status-lead`;
  if (status === 'Prospect') return `${baseClass} status-prospect`;
  if (status === 'Customer') return `${baseClass} status-customer`;
  if (status === 'View') return `${baseClass} status-view`;
  return baseClass;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.data-table {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #d1d5db;
}

.table-header h3 {
  margin: 0;
  color: #374151;
  font-size: 18px;
  font-weight: 600;
}

.table-container {
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.table th,
.table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table td {
  color: #4b5563;
  font-size: 14px;
}

.table-row:hover {
  background: #f9fafb;
}

.cell-content {
  display: flex;
  align-items: center;
  min-height: 24px;
}

.col-narrow {
  width: 60px;
  text-align: center;
}

.col-action {
  width: 140px;
  text-align: center;
}

.col-status {
  width: 120px;
}

.col-name-mobile {
  min-width: 200px;
}

.serial-number {
  font-weight: 600;
  color: #6b7280;
}

.name-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name-primary {
  font-weight: 600;
  color: #1f2937;
}

.name-secondary {
  font-size: 12px;
  color: #6b7280;
}

.date-cell {
  white-space: nowrap;
}

.cell-text {
  word-break: break-word;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  min-height: 36px;
  white-space: nowrap;
}

.view-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  background: #1c1c1e;
  color: white;
  min-height: 32px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
}

.view-btn:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(28, 28, 30, 0.3);
}

.btn-action {
  background: #6b7280;
  color: white;
}

.btn-action:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.btn-lead {
  background: #020006;
  color: white;
}

.btn-lead:hover {
  background: #020006;
}

.btn-prospect {
  background: #020006;
  color: white;
}

.btn-prospect:hover {
  background: #020006;
}

.btn-customer {
  background: #020006;
  color: white;
}

.btn-customer:hover {
  background: #020006;
}

.btn-view {
  background: #6b7280;
  color: white;
}

.btn-view:hover {
  background: #4b5563;
}

.btn-registration {
  background: #020006;
  color: white;
}

.btn-registration:hover {
  background: #020006;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  display: inline-block;
}

.status-lead {
  background: #fef3c7;
  color: #92400e;
}

.status-prospect {
  background: #dbeafe;
  color: #1e40af;
}

.status-customer {
  background: #d1fae5;
  color: #065f46;
}

.status-view {
  background: #f3f4f6;
  color: #374151;
}

.status-registration {
  background: #ede9fe;
  color: #7c3aed;
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

.mobile-view-btn {
  padding: 8px 16px;
  font-size: 12px;
  min-height: 36px;
  margin-left: 8px;
}

.no-data {
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
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

.no-data h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.no-data p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

/* Mobile Responsive */
@media (max-width: 767px) {
  .table-header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .table-header h3 {
    font-size: 16px;
  }
  
  .table-container {
    display: none;
  }
  
  .mobile-cards {
    display: flex;
  }
  
  .table th,
  .table td {
    padding: 12px 16px;
    font-size: 13px;
  }
  
  .action-btn {
    padding: 6px 12px;
    font-size: 11px;
    min-height: 32px;
  }
}

@media (max-width: 480px) {
  .table-header {
    padding: 12px 16px;
  }
  
  .mobile-cards {
    padding: 12px;
    gap: 12px;
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
    padding: 8px 16px;
    font-size: 12px;
    min-height: 36px;
  }
  
  .no-data {
    padding: 40px 16px;
  }
  
  .no-data-icon {
    font-size: 36px;
  }
  
  .no-data h4 {
    font-size: 16px;
  }
  
  .no-data p {
    font-size: 13px;
  }
}

/* Tablet view */
@media (min-width: 768px) and (max-width: 1023px) {
  .table {
    min-width: 700px;
  }
  
  .table th,
  .table td {
    padding: 14px 18px;
  }
  
  .table-header {
    padding: 18px 22px;
  }
}

/* Large screens */
@media (min-width: 1024px) {
  .table {
    min-width: 900px;
  }
  
  .table th,
  .table td {
    padding: 18px 24px;
  }
  
  .table-header {
    padding: 24px 28px;
  }
  
  .table-header h3 {
    font-size: 20px;
  }
}

/* Touch devices */
@media (hover: none) and (pointer: coarse) {
  .table-row:hover {
    background: transparent;
  }
  
  .mobile-card:hover {
    transform: none;
  }
  
  .action-btn:hover {
    transform: none;
  }
  
  .action-btn:active {
    transform: scale(0.95);
  }
}
</style>