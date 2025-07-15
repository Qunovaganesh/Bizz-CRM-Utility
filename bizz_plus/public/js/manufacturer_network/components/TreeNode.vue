<template>
  <div class="tree-node">
    <div 
      class="tree-node-header"
      :class="{ 'tree-node-selected': isSelected }"
    >
      <div class="tree-node-left">
        <button
          v-if="hasChildren"
          @click="toggleExpansion"
          class="expand-btn"
        >
          <ChevronRight 
            :size="16" 
            class="chevron"
            :class="{ 'rotate-90': isExpanded }"
          />
        </button>
        <div v-else class="placeholder-icon"></div>
        
        <div class="node-label">
          <component :is="getIcon()" :size="18" class="node-icon" />
          <span class="node-name">{{ name }}</span>
          <span 
            v-if="childCount > 0" 
            class="node-badge"
          >
            {{ childCount }}
          </span>
        </div>
      </div>

      <div class="tree-node-actions">
        <button
          @click="onAdd"
          class="action-btn add"
          :title="`Add ${getChildType()}`"
        >
          <Plus :size="14" />
        </button>
        <button
          @click="onEdit"
          class="action-btn edit"
          title="Edit"
        >
          <Edit2 :size="14" />
        </button>
        <button
          @click="onDelete"
          class="action-btn delete"
          title="Delete"
        >
          <Trash2 :size="14" />
        </button>
      </div>
    </div>

    <div 
      v-if="hasChildren && isExpanded"
      class="tree-node-children"
    >
      <slot />
    </div>
  </div>
</template>


<script setup lang="ts">
import { ChevronRight, Plus, Edit2, Trash2, MapPin, Building2, Map, Store } from 'lucide-vue-next';
import type { EntityType } from '../types/business';

interface Props {
  name: string;
  type: EntityType;
  hasChildren: boolean;
  isExpanded: boolean;
  isSelected?: boolean;
  childCount: number;
}

interface Emits {
  (e: 'toggle'): void;
  (e: 'add'): void;
  (e: 'edit'): void;
  (e: 'delete'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const toggleExpansion = () => emit('toggle');
const onAdd = () => emit('add');
const onEdit = () => emit('edit');
const onDelete = () => emit('delete');

const getIcon = () => {
  switch (props.type) {
    case 'zone': return MapPin;
    case 'distributor': return Building2;
    case 'area': return Map;
    case 'outlet': return Store;
    default: return Building2;
  }
};

const getChildType = () => {
  switch (props.type) {
    case 'zone': return 'Distributor';
    case 'distributor': return 'Area';
    case 'area': return 'Outlet';
    default: return 'Item';
  }
};
</script>

<style scoped>
.tree-node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.tree-node-header:hover {
  background-color: #f9fafb;
}

.tree-node-selected {
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
}

.tree-node-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.expand-btn {
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
}

.expand-btn:hover {
  background-color: #e5e7eb;
}

.chevron {
  transition: transform 0.2s ease;
}

.rotate-90 {
  transform: rotate(90deg);
}

.placeholder-icon {
  width: 1.5rem;
}

.node-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.node-icon {
  color: #4b5563;
}

.node-name {
  font-weight: 500;
  color: #111827;
}

.node-badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border-radius: 9999px;
}

.tree-node-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-node-header:hover .tree-node-actions {
  opacity: 1;
}

.action-btn {
  padding: 0.375rem;
  border-radius: 0.375rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn.add {
  color: #2563eb;
}

.action-btn.add:hover {
  background-color: #dbeafe;
}

.action-btn.edit {
  color: #4b5563;
}

.action-btn.edit:hover {
  background-color: #e5e7eb;
}

.action-btn.delete {
  color: #dc2626;
}

.action-btn.delete:hover {
  background-color: #fee2e2;
}

.tree-node-children {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  padding-left: 1rem;
  border-left: 2px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>

