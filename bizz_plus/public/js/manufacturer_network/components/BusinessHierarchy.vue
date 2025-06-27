<template>
  <div class="business-hierarchy-container">
    <div class="business-hierarchy-wrapper">
      
      <!-- Header -->
      <div class="hierarchy-header">
        <div class="hierarchy-header-content">
          <div>
            <h1 class="hierarchy-title">Business Hierarchy</h1>
            <p class="hierarchy-subtitle">Manage zones, distributors, areas and outlets</p>
          </div>
          <button @click="showAddModal('zone')" class="hierarchy-add-btn">
            <Plus :size="20" />
            <span>Add Zone</span>
          </button>
        </div>
      </div>

      <!-- Search and Stats -->
      <div class="hierarchy-search-stats">
        <div class="search-container">
          <Search :size="20" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search hierarchy..."
            class="search-input"
          />
        </div>

        <div class="stats-grid">
          <div class="stats-box blue">
            <div class="stats-count">{{ data.zones.length }}</div>
            <div class="stats-label">Zones</div>
          </div>
          <div class="stats-box green">
            <div class="stats-count">{{ data.distributors.length }}</div>
            <div class="stats-label">Distributors</div>
          </div>
          <div class="stats-box yellow">
            <div class="stats-count">{{ data.areas.length }}</div>
            <div class="stats-label">Areas</div>
          </div>
          <div class="stats-box purple">
            <div class="stats-count">{{ data.outlets.length }}</div>
            <div class="stats-label">Outlets</div>
          </div>
        </div>
      </div>

      <!-- Tree Structure -->
      <div class="hierarchy-tree">
        <div class="tree-nodes">
          <TreeNode
            v-for="zone in filteredZones"
            :key="zone.id"
            :name="zone.name"
            type="zone"
            :has-children="getDistributorsByZone(zone.id).length > 0"
            :is-expanded="isExpanded(zone.id)"
            :child-count="getDistributorsByZone(zone.id).length"
            @toggle="toggleNode(zone.id)"
            @add="showAddModal('distributor', zone.id)"
            @edit="editEntity('zone', zone.id, zone.name)"
            @delete="deleteEntity('zone', zone.id)"
          >
            <TreeNode
              v-for="distributor in getDistributorsByZone(zone.id)"
              :key="distributor.id"
              :name="distributor.name"
              type="distributor"
              :has-children="getAreasByDistributor(distributor.id).length > 0"
              :is-expanded="isExpanded(distributor.id)"
              :child-count="getAreasByDistributor(distributor.id).length"
              @toggle="toggleNode(distributor.id)"
              @add="showAddModal('area', distributor.id)"
              @edit="editEntity('distributor', distributor.id, distributor.name)"
              @delete="deleteEntity('distributor', distributor.id)"
            >
              <TreeNode
                v-for="area in getAreasByDistributor(distributor.id)"
                :key="area.id"
                :name="area.name"
                type="area"
                :has-children="getOutletsByArea(area.id).length > 0"
                :is-expanded="isExpanded(area.id)"
                :child-count="getOutletsByArea(area.id).length"
                @toggle="toggleNode(area.id)"
                @add="showAddModal('outlet', area.id)"
                @edit="editEntity('area', area.id, area.name)"
                @delete="deleteEntity('area', area.id)"
              >
                <TreeNode
                  v-for="outlet in getOutletsByArea(area.id)"
                  :key="outlet.id"
                  :name="outlet.name"
                  type="outlet"
                  :has-children="false"
                  :is-expanded="false"
                  :child-count="0"
                  @edit="editEntity('outlet', outlet.id, outlet.name)"
                  @delete="deleteEntity('outlet', outlet.id)"
                />
              </TreeNode>
            </TreeNode>
          </TreeNode>
        </div>

        <div v-if="filteredZones.length === 0" class="no-zones">
          <Building2 :size="48" class="no-zones-icon" />
          <h3 class="no-zones-title">No zones found</h3>
          <p class="no-zones-description">
            {{ searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first zone' }}
          </p>
          <button
            v-if="!searchQuery"
            @click="showAddModal('zone')"
            class="no-zones-add-btn"
          >
            Add Your First Zone
          </button>
        </div>
      </div>
    </div>

    <AddEntityModal
      :is-open="isAddModalOpen"
      :entity-type="currentEntityType"
      @close="closeAddModal"
      @add="handleAddEntity"
    />
  </div>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, Search, Building2 } from 'lucide-vue-next';
import TreeNode from './TreeNode.vue';
import AddEntityModal from './AddEntityModal.vue';
import { useBusinessData } from '../composables/useBusinessData';
import type { EntityType } from '../types/business';

const {
  data,
  isExpanded,
  toggleNode,
  addEntity,
  removeEntity,
  getDistributorsByZone,
  getAreasByDistributor,
  getOutletsByArea,
} = useBusinessData();

const searchQuery = ref('');
const isAddModalOpen = ref(false);
const currentEntityType = ref<EntityType>('zone');
const currentParentId = ref<string | undefined>();

const filteredZones = computed(() => {
  if (!searchQuery.value) return data.value.zones;
  
  const query = searchQuery.value.toLowerCase();
  return data.value.zones.filter(zone => 
    zone.name.toLowerCase().includes(query) ||
    getDistributorsByZone(zone.id).some(d => d.name.toLowerCase().includes(query)) ||
    getDistributorsByZone(zone.id).some(d => 
      getAreasByDistributor(d.id).some(a => a.name.toLowerCase().includes(query))
    ) ||
    getDistributorsByZone(zone.id).some(d => 
      getAreasByDistributor(d.id).some(a => 
        getOutletsByArea(a.id).some(o => o.name.toLowerCase().includes(query))
      )
    )
  );
});

const showAddModal = (type: EntityType, parentId?: string) => {
  currentEntityType.value = type;
  currentParentId.value = parentId;
  isAddModalOpen.value = true;
};

const closeAddModal = () => {
  isAddModalOpen.value = false;
  currentParentId.value = undefined;
};

const handleAddEntity = (name: string) => {
  addEntity(currentEntityType.value, name, currentParentId.value);
};

const editEntity = (type: EntityType, id: string, currentName: string) => {
  const newName = prompt(`Edit ${type} name:`, currentName);
  if (newName && newName.trim() && newName !== currentName) {
    // Update the entity name
    switch (type) {
      case 'zone':
        const zone = data.value.zones.find(z => z.id === id);
        if (zone) zone.name = newName.trim();
        break;
      case 'distributor':
        const distributor = data.value.distributors.find(d => d.id === id);
        if (distributor) distributor.name = newName.trim();
        break;
      case 'area':
        const area = data.value.areas.find(a => a.id === id);
        if (area) area.name = newName.trim();
        break;
      case 'outlet':
        const outlet = data.value.outlets.find(o => o.id === id);
        if (outlet) outlet.name = newName.trim();
        break;
    }
  }
};

const deleteEntity = (type: EntityType, id: string) => {
  if (confirm(`Are you sure you want to delete this ${type}?`)) {
    removeEntity(type, id);
  }
};
</script>


<style scoped>
.business-hierarchy-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 1.5rem;
}

.business-hierarchy-wrapper {
  max-width: 96rem;
  margin: 0 auto;
}

.hierarchy-header,
.hierarchy-search-stats,
.hierarchy-tree {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.hierarchy-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hierarchy-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
}

.hierarchy-subtitle {
  color: #4b5563;
}

.hierarchy-add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  border: none;
}

.hierarchy-add-btn:hover {
  background-color: #1d4ed8;
}

.search-container {
  position: relative;
  max-width: 28rem;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
}

.search-input:focus {
  border-color: transparent;
  box-shadow: 0 0 0 2px #3b82f6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stats-box {
  text-align: center;
  padding: 1rem;
  border-radius: 0.5rem;
}

.stats-box.blue {
  background-color: #eff6ff;
  color: #2563eb;
}

.stats-box.green {
  background-color: #ecfdf5;
  color: #10b981;
}

.stats-box.yellow {
  background-color: #fefce8;
  color: #f59e0b;
}

.stats-box.purple {
  background-color: #f5f3ff;
  color: #8b5cf6;
}

.stats-count {
  font-size: 1.5rem;
  font-weight: bold;
}

.stats-label {
  font-size: 0.875rem;
}

.tree-nodes {
  margin-top: 1rem;
}

.no-zones {
  text-align: center;
  padding: 3rem 0;
  color: #9ca3af;
}

.no-zones-icon {
  margin: 0 auto 1rem;
}

.no-zones-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.no-zones-description {
  color: #6b7280;
  margin-bottom: 1rem;
}

.no-zones-add-btn {
  padding: 0.5rem 1rem;
  background-color: #2563eb;
  color: white;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  border: none;
}

.no-zones-add-btn:hover {
  background-color: #1d4ed8;
}
</style>


