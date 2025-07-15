<template>
  <Teleport to="body">
    <div v-if="isVisible" class="alert-overlay" @click="handleOverlayClick">
      <div class="alert-container" :class="alertTypeClass">
        <div class="alert-content">
          <!-- Alert Icon -->
          <div class="alert-icon">
            <component :is="alertIcon" />
          </div>
          
          <!-- Alert Message -->
          <div class="alert-message">
            <h3 class="alert-title">{{ title }}</h3>
            <p class="alert-text">{{ message }}</p>
          </div>
          
          <!-- Alert Actions -->
          <div class="alert-actions">
            <button 
              v-if="showCancel" 
              @click="handleCancel" 
              class="btn-cancel"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="handleConfirm" 
              class="btn-confirm"
              :class="confirmButtonClass"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

export interface AlertProps {
  isVisible: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  onConfirm?: () => void
  onCancel?: () => void
  closeOnOverlayClick?: boolean
}

const props = withDefaults(defineProps<AlertProps>(), {
  type: 'info',
  title: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
  showCancel: false,
  closeOnOverlayClick: true
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

// Computed properties for styling
const alertTypeClass = computed(() => `alert-${props.type}`)

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'success': return 'btn-success'
    case 'error': return 'btn-error'
    case 'warning': return 'btn-warning'
    default: return 'btn-info'
  }
})

const alertIcon = computed(() => {
  switch (props.type) {
    case 'success': return 'CheckCircleIcon'
    case 'error': return 'XCircleIcon'
    case 'warning': return 'ExclamationTriangleIcon'
    default: return 'InformationCircleIcon'
  }
})

// Event handlers
const handleConfirm = () => {
  props.onConfirm?.()
  emit('confirm')
}

const handleCancel = () => {
  props.onCancel?.()
  emit('cancel')
}

const handleOverlayClick = (event: Event) => {
  if (props.closeOnOverlayClick && event.target === event.currentTarget) {
    handleCancel()
  }
}

// Keyboard handling
const handleKeydown = (event: KeyboardEvent) => {
  if (props.isVisible) {
    if (event.key === 'Escape') {
      handleCancel()
    } else if (event.key === 'Enter') {
      handleConfirm()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<script lang="ts">
// Icon components
const CheckCircleIcon = {
  template: `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `
}

const XCircleIcon = {
  template: `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `
}

const ExclamationTriangleIcon = {
  template: `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
    </svg>
  `
}

const InformationCircleIcon = {
  template: `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `
}

export default {
  components: {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
  }
}
</script>

<style scoped>
.alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.alert-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
  border: 1px solid #e5e7eb;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.alert-content {
  padding: 24px;
}

.alert-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  border-radius: 50%;
  font-size: 24px;
}

.alert-success .alert-icon {
  background: #dcfce7;
  color: #16a34a;
}

.alert-error .alert-icon {
  background: #fef2f2;
  color: #dc2626;
}

.alert-warning .alert-icon {
  background: #fef3c7;
  color: #d97706;
}

.alert-info .alert-icon {
  background: #e0f2fe;
  color: #0284c7;
}

.alert-message {
  text-align: center;
  margin-bottom: 24px;
}

.alert-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.alert-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
}

.alert-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 80px;
  min-height: 40px;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn-confirm {
  color: white;
  font-weight: 600;
}

.btn-success {
  background: #16a34a;
}

.btn-success:hover {
  background: #15803d;
  transform: translateY(-1px);
}

.btn-error {
  background: #dc2626;
}

.btn-error:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

.btn-warning {
  background: #d97706;
}

.btn-warning:hover {
  background: #b45309;
  transform: translateY(-1px);
}

.btn-info {
  background: #0284c7;
}

.btn-info:hover {
  background: #0369a1;
  transform: translateY(-1px);
}

.w-6 {
  width: 24px;
}

.h-6 {
  height: 24px;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .alert-overlay {
    padding: 16px;
  }
  
  .alert-container {
    border-radius: 12px;
  }
  
  .alert-content {
    padding: 20px;
  }
  
  .alert-icon {
    width: 56px;
    height: 56px;
    margin-bottom: 16px;
  }
  
  .alert-title {
    font-size: 16px;
  }
  
  .alert-text {
    font-size: 14px;
  }
  
  .alert-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .btn-cancel,
  .btn-confirm {
    width: 100%;
    padding: 12px 24px;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .alert-overlay,
  .alert-container,
  .btn-cancel,
  .btn-confirm {
    animation: none;
    transition: none;
  }
}
</style>
