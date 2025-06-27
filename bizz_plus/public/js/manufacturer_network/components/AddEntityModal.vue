<template>
  <div 
    v-if="isOpen"
    class="modal-overlay"
    @click="onClose"
  >
    <div 
      class="modal-container"
      @click.stop
    >
      <div class="modal-header">
        <h3 class="modal-title">
          Add {{ entityType.charAt(0).toUpperCase() + entityType.slice(1) }}
        </h3>
        <button
          @click="onClose"
          class="modal-close-btn"
        >
          <X :size="20" />
        </button>
      </div>

      <form @submit.prevent="onSubmit">
        <div class="modal-field">
          <label class="modal-label">
            {{ entityType.charAt(0).toUpperCase() + entityType.slice(1) }} Name
          </label>
          <input
            v-model="name"
            type="text"
            required
            class="modal-input"
            :placeholder="`Enter ${entityType} name`"
            autofocus
          />
        </div>

        <div class="modal-footer">
          <button
            type="button"
            @click="onClose"
            class="modal-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="modal-submit-btn"
          >
            Add {{ entityType.charAt(0).toUpperCase() + entityType.slice(1) }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import type { EntityType } from '../types/business';

interface Props {
  isOpen: boolean;
  entityType: EntityType;
}

interface Emits {
  (e: 'close'): void;
  (e: 'add', name: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const name = ref('');

const onClose = () => {
  name.value = '';
  emit('close');
};

const onSubmit = () => {
  if (name.value.trim()) {
    emit('add', name.value.trim());
    onClose();
  }
};

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    name.value = '';
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-container {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 28rem;
  margin: 0 1rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-close-btn {
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}

.modal-close-btn:hover {
  background-color: #f3f4f6;
}

.modal-field {
  margin-bottom: 1rem;
}

.modal-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.modal-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  outline: none;
  transition: box-shadow 0.2s ease;
}

.modal-input:focus {
  border-color: transparent;
  box-shadow: 0 0 0 2px #3b82f6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.modal-cancel-btn {
  padding: 0.5rem 1rem;
  color: #4b5563;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
  background-color: transparent;
  border: none;
}

.modal-cancel-btn:hover {
  background-color: #f3f4f6;
}

.modal-submit-btn {
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
  border: none;
}

.modal-submit-btn:hover {
  background-color: #1d4ed8;
}
</style>
