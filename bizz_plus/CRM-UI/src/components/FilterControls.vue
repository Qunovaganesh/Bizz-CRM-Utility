<template>
  <div class="filter-controls">
    <div class="entity-toggle">
      <h3>Select Entity Type</h3>
      <div class="radio-group">
        <label>
          <input 
            type="radio" 
            :value="'manufacturer'" 
            v-model="internalSelectedEntity"
          >
          Manufacturer
        </label>
        <label>
          <input 
            type="radio" 
            :value="'distributor'" 
            v-model="internalSelectedEntity"
          >
          Distributor
        </label>
      </div>
    </div>

    <div class="filters-grid">
      <div class="filter-group">
        <label>State</label>
        <div class="multiselect-container">
          <select 
            multiple 
            :value="internalFilters.state" 
            @change="onLocationFilterChange('state', Array.from(($event.target as HTMLSelectElement).selectedOptions).map(option => option.value))"
            class="multiselect"
          >
            <option v-for="state in availableStates" :key="state" :value="state">
              {{ state }}
            </option>
          </select>
          <div class="selected-tags" v-if="internalFilters.state.length">
            <span v-for="state in internalFilters.state" :key="state" class="tag">
              {{ state }}
              <button @click="removeFilter('state', state)" class="tag-remove">×</button>
            </span>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <label>District</label>
        <div class="multiselect-container">
          <select 
            multiple 
            :value="internalFilters.district" 
            @change="onLocationFilterChange('district', Array.from(($event.target as HTMLSelectElement).selectedOptions).map(option => option.value))"
            class="multiselect"
          >
            <option v-for="district in availableDistricts" :key="district" :value="district">
              {{ district }}
            </option>
          </select>
          <div class="selected-tags" v-if="internalFilters.district.length">
            <span v-for="district in internalFilters.district" :key="district" class="tag">
              {{ district }}
              <button @click="removeFilter('district', district)" class="tag-remove">×</button>
            </span>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <label>City</label>
        <div class="multiselect-container">
          <select 
            multiple 
            :value="internalFilters.city" 
            @change="onLocationFilterChange('city', Array.from(($event.target as HTMLSelectElement).selectedOptions).map(option => option.value))"
            class="multiselect"
          >
            <option v-for="city in availableCities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
          <div class="selected-tags" v-if="internalFilters.city.length">
            <span v-for="city in internalFilters.city" :key="city" class="tag">
              {{ city }}
              <button @click="removeFilter('city', city)" class="tag-remove">×</button>
            </span>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <label>Category</label>
        <div class="multiselect-container">
          <select 
            multiple 
            :value="internalFilters.category" 
            @change="onCategoryFilterChange('category', Array.from(($event.target as HTMLSelectElement).selectedOptions).map(option => option.value))"
            class="multiselect"
          >
            <option v-for="category in availableCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          <div class="selected-tags" v-if="internalFilters.category.length">
            <span v-for="category in internalFilters.category" :key="category" class="tag">
              {{ category }}
              <button @click="removeFilter('category', category)" class="tag-remove">×</button>
            </span>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <label>Sub Category</label>
        <div class="multiselect-container">
          <select 
            multiple 
            :value="internalFilters.subCategory" 
            @change="onCategoryFilterChange('subCategory', Array.from(($event.target as HTMLSelectElement).selectedOptions).map(option => option.value))"
            class="multiselect"
          >
            <option v-for="subCategory in availableSubCategories" :key="subCategory" :value="subCategory">
              {{ subCategory }}
            </option>
          </select>
          <div class="selected-tags" v-if="internalFilters.subCategory.length">
            <span v-for="subCategory in internalFilters.subCategory" :key="subCategory" class="tag">
              {{ subCategory }}
              <button @click="removeFilter('subCategory', subCategory)" class="tag-remove">×</button>
            </span>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <label>Status</label>
        <div class="multiselect-container">
          <select 
            multiple 
            :value="internalFilters.status" 
            @change="internalFilters.status = Array.from(($event.target as HTMLSelectElement).selectedOptions).map(option => option.value); onFilterChange()"
            class="multiselect"
          >
            <option v-for="status in filterOptions.statuses" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
          <div class="selected-tags" v-if="internalFilters.status.length">
            <span v-for="status in internalFilters.status" :key="status" class="tag">
              {{ status }}
              <button @click="removeFilter('status', status)" class="tag-remove">×</button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="filter-actions">
      <button type="button" class="btn-clear" @click="clearAllFilters">
        Clear All Filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { filterOptions, locationMapping, categoryToSubCategoryMapping } from '../data/mockData';

const props = defineProps<{
  selectedEntity: 'manufacturer' | 'distributor';
  filters: any;
}>();

const emit = defineEmits<{
  'update:selectedEntity': [value: 'manufacturer' | 'distributor'];
  'update:filters': [filters: any];
  'entity-change': [];
  'filter-change': [];
  'clear-filters': [];
  'location-filter-change': [type: 'city' | 'district' | 'state', values: string[]];
  'category-filter-change': [type: 'category' | 'subCategory', values: string[]];
}>();

const internalSelectedEntity = computed({
  get() {
    return props.selectedEntity;
  },
  set(value: 'manufacturer' | 'distributor') {
    emit('update:selectedEntity', value);
    emit('entity-change');
  }
});

const internalFilters = computed({
  get() {
    return props.filters;
  },
  set(value: any) {
    emit('update:filters', value);
  }
});

const availableStates = computed(() => {
  if (internalFilters.value.city.length > 0 || internalFilters.value.district.length > 0) {
    // If cities or districts are selected, show only related states
    const relatedStates = new Set<string>();
    
    if (internalFilters.value.city.length > 0) {
      Object.entries(locationMapping).forEach(([state, mapping]) => {
        if (mapping.cities.some(city => internalFilters.value.city.includes(city))) {
          relatedStates.add(state);
        }
      });
    }
    
    if (internalFilters.value.district.length > 0) {
      Object.entries(locationMapping).forEach(([state, mapping]) => {
        if (mapping.districts.some(district => internalFilters.value.district.includes(district))) {
          relatedStates.add(state);
        }
      });
    }
    
    return Array.from(relatedStates);
  }
  return filterOptions.states;
});

const availableDistricts = computed(() => {
  if (internalFilters.value.state.length > 0) {
    const relatedDistricts = new Set<string>();
    (Array.isArray(internalFilters.value.state) ? internalFilters.value.state : []).forEach((state: string) => {
      const mapping = locationMapping[state as keyof typeof locationMapping];
      if (mapping) {
        mapping.districts.forEach((district: string) => relatedDistricts.add(district));
      }
    });
    return Array.from(relatedDistricts);
  }
  return filterOptions.districts;
});

const availableCities = computed(() => {
  if (internalFilters.value.state.length > 0) {
    const relatedCities = new Set<string>();
    (Array.isArray(internalFilters.value.state) ? internalFilters.value.state : []).forEach((state: string) => {
      const mapping = locationMapping[state as keyof typeof locationMapping];
      if (mapping) {
        mapping.cities.forEach((city: string) => relatedCities.add(city));
      }
    });
    return Array.from(relatedCities);
  }
  return filterOptions.cities;
});

const availableCategories = computed(() => {
  if (internalFilters.value.subCategory.length > 0) {
    const relatedCategories = new Set<string>();
    (Array.isArray(internalFilters.value.subCategory) ? internalFilters.value.subCategory : []).forEach((subCategory: string) => {
      Object.entries(categoryToSubCategoryMapping).forEach(([category, subCategories]) => {
        if (subCategories.includes(subCategory)) {
          relatedCategories.add(category);
        }
      });
    });
    return Array.from(relatedCategories);
  }
  return filterOptions.categories;
});

const availableSubCategories = computed(() => {
  if (internalFilters.value.category.length > 0) {
    const relatedSubCategories = new Set<string>();
    (Array.isArray(internalFilters.value.category) ? internalFilters.value.category : []).forEach((category: string) => {
      const subCategories = categoryToSubCategoryMapping[category];
      if (subCategories) {
        subCategories.forEach(subCategory => relatedSubCategories.add(subCategory));
      }
    });
    return Array.from(relatedSubCategories);
  }
  return filterOptions.subCategories;
});

const onFilterChange = () => {
  emit('filter-change');
};

const onLocationFilterChange = (type: 'city' | 'district' | 'state', values: string[]) => {
  emit('location-filter-change', type, values);
  emit('filter-change');
};

const onCategoryFilterChange = (type: 'category' | 'subCategory', values: string[]) => {
  emit('category-filter-change', type, values);
  emit('filter-change');
};

const removeFilter = (type: string, value: string) => {
  const currentValues = internalFilters.value[type] as string[];
  const newValues = currentValues.filter(v => v !== value);
  
  if (type === 'city' || type === 'district' || type === 'state') {
    emit('location-filter-change', type as 'city' | 'district' | 'state', newValues);
  } else if (type === 'category' || type === 'subCategory') {
    emit('category-filter-change', type as 'category' | 'subCategory', newValues);
  } else {
    internalFilters.value[type] = newValues;
  }
  
  emit('filter-change');
};

const clearAllFilters = () => {
  emit('clear-filters');
};
</script>

<style scoped>
.filter-controls {
  background: #ffffff;
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.entity-toggle {
  margin-bottom: 24px;
}

.entity-toggle h3 {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.radio-group {
  display: flex;
  gap: 24px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #374151;
  font-weight: 500;
  transition: color 0.2s ease;
}

.radio-group label:hover {
  color: #1f2937;
}

.radio-group input[type="radio"] {
  accent-color: #6b7280;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  align-items: start;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}

.filter-group label {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  letter-spacing: -0.025em;
  min-height: 20px;
  display: flex;
  align-items: center;
}

.multiselect-container {
  position: relative;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.multiselect {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  width: 100%;
  height: 80px;
  min-height: 80px;
  max-height: 80px;
  overflow-y: auto;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.multiselect:focus {
  outline: none;
  border-color: #6b7280;
  box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
}

.multiselect option {
  padding: 8px;
  border-radius: 4px;
  margin: 2px 0;
  color: #374151;
}

.multiselect option:checked {
  background: #6b7280;
  color: white;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  min-height: 40px;
  padding: 4px 0;
  flex: 1;
  align-content: flex-start;
}

.tag {
  background: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #d1d5db;
  white-space: nowrap;
  height: fit-content;
}

.tag-remove {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.tag-remove:hover {
  background: #6b7280;
  color: white;
}

.filter-actions {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.btn-clear {
  padding: 12px 24px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.025em;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-clear:hover {
  background: #4b5563;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-controls {
    padding: 20px;
  }
  
  .multiselect-container {
    min-height: 120px;
  }
  
  .multiselect {
    height: 60px;
    min-height: 60px;
    max-height: 60px;
  }
}
</style>