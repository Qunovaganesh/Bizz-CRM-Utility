<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>Manufacturer-Distributor Management</h1>
      <p>Manage your business relationships and workflow processes</p>
      <div class="header-actions">
        <button class="btn-add-new" @click="$router.push('/')">
          <span>➕</span> Add New Lead
        </button>
      </div>
    </div>

    <!-- Modern Entity Type Selection -->
    <div class="entity-type-selection">
      <div class="entity-toggle-container">
        <button 
          class="entity-toggle-btn"
          :class="{ active: selectedEntity === 'manufacturer' }"
          @click="onEntityChange('manufacturer')"
        >
          <span class="entity-icon">🏭</span>
          <span>Manufacturers</span>
          <span class="entity-count">{{ displayManufacturerCount }}</span>
        </button>
        <button 
          class="entity-toggle-btn"
          :class="{ active: selectedEntity === 'distributor' }"
          @click="onEntityChange('distributor')"
        >
          <span class="entity-icon">🏪</span>
          <span>Distributors</span>
          <span class="entity-count">{{ displayDistributorCount }}</span>
        </button>
      </div>
    </div>

    <!-- Modern Filters (shown when no entity selected) -->
    <div class="modern-filters" v-if="!selectedEntityItem">
      <div class="filters-header">
        <h3>Filter {{ selectedEntity === 'manufacturer' ? 'Manufacturers' : 'Distributors' }}</h3>
        <button class="btn-clear-all" @click="clearAllFilters" v-if="hasActiveFilters">
          <span>✕</span> Clear All
        </button>
      </div>

      <div class="filters-grid">
        <!-- Geography Section -->
        <div class="filter-card">
          <div class="filter-card-header">
            <span class="filter-icon">🌍</span>
            <h4>Geography</h4>
          </div>
          <div class="filter-card-content">
            <div class="filter-row">
              <label>State</label>
              <ModernMultiSelect 
                :options="availableStates"
                :selected="filters.state"
                :placeholder="isLoadingStates ? 'Loading states...' : 'Select states...'"
                @update:selected="(val) => updateLocationFilters('state', val)"
                @dropdown-opened="onStatesDropdownOpened"
              />
            </div>
            <div class="filter-row">
              <label>District</label>
              <ModernMultiSelect 
                :options="availableDistricts"
                :selected="filters.district"
                :placeholder="isLoadingDistricts ? 'Loading districts...' : 'Select districts...'"
                @update:selected="(val) => updateLocationFilters('district', val)"
                @dropdown-opened="onDistrictsDropdownOpened"
              />
            </div>
            <div class="filter-row">
              <label>City</label>
              <ModernMultiSelect 
                :options="availableCities"
                :selected="filters.city"
                :placeholder="isLoadingCities ? 'Loading cities...' : 'Select cities...'"
                @update:selected="(val) => updateLocationFilters('city', val)"
                @dropdown-opened="onCitiesDropdownOpened"
              />
            </div>
          </div>
        </div>

        <!-- Category Section -->
        <div class="filter-card">
          <div class="filter-card-header">
            <span class="filter-icon">📦</span>
            <h4>Category</h4>
          </div>
          <div class="filter-card-content">
            <div class="filter-row">
              <label>Category</label>
              <ModernMultiSelect 
                :options="availableCategories"
                :selected="filters.category"
                :placeholder="isLoadingCategories ? 'Loading categories...' : 'Select categories...'"
                @update:selected="(val) => updateCategoryFilters('category', val)"
                @dropdown-opened="onCategoriesDropdownOpened"
              />
            </div>
            <div class="filter-row">
              <label>Sub Category</label>
              <ModernMultiSelect 
                :options="availableSubCategories"
                :selected="filters.subCategory"
                placeholder="Select sub-categories..."
                @update:selected="(val) => updateCategoryFilters('subCategory', val)"
              />
            </div>
          </div>
        </div>

        <!-- Status Section -->
        <div class="filter-card">
          <div class="filter-card-header">
            <span class="filter-icon">📊</span>
            <h4>Status</h4>
          </div>
          <div class="filter-card-content">
            <div class="filter-row">
              <label>Status</label>
              <ModernMultiSelect 
                :options="filterOptions.statuses"
                :selected="filters.status"
                placeholder="Select statuses..."
                @update:selected="(val) => onFilterChange({ status: val })"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Active Filters Display -->
      <div class="active-filters" v-if="hasActiveFilters">
        <h4>Active Filters:</h4>
        <div class="filter-tags">
          <div v-for="(values, key) in activeFilterTags" :key="key" class="filter-tag-group">
            <span class="filter-tag-label">{{ getFilterLabel(key) }}:</span>
            <span 
              v-for="value in values" 
              :key="value" 
              class="filter-tag"
            >
              {{ value }}
              <button @click="removeFilterValue(key, value)" class="tag-remove">×</button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Entity Selection -->
    <div class="entity-selection" v-if="!selectedEntityItem">
      <div class="selection-card">
        <h3>
          <span class="selection-icon">{{ selectedEntity === 'manufacturer' ? '🏭' : '🏪' }}</span>
          Select {{ selectedEntity === 'manufacturer' ? 'Manufacturer' : 'Distributor' }}
        </h3>
        <div class="entity-dropdown-container">
          <select v-model="selectedEntityId" @change="onEntitySelect" class="modern-select">
            <option value="">Choose {{ selectedEntity === 'manufacturer' ? 'a Manufacturer' : 'a Distributor' }}</option>
            <option v-for="entity in currentEntityList" :key="entity.id" :value="entity.id">
              {{ entity.name }}
            </option>
          </select>
          <div class="selection-stats">
            <span class="stat-item">
              <strong>{{ currentEntityList.length }}</strong> {{ selectedEntity === 'manufacturer' ? 'manufacturers' : 'distributors' }} available
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Entity Display -->
    <div v-if="selectedEntityItem" class="selected-entity-section">
      <div class="selected-entity-header">
        <div class="entity-info-card">
          <div class="entity-avatar">
            {{ selectedEntityItem?.name?.charAt(0) || '?' }}
          </div>
          <div class="entity-details">
            <h3>{{ selectedEntityItem?.name || 'Unknown' }}</h3>
            <p class="entity-location">📍 {{ selectedEntityItem?.district || 'Unknown' }}, {{ selectedEntityItem?.state || 'Unknown' }}</p>
            <p class="entity-category">📦 {{ selectedEntityItem?.category || 'Unknown' }}</p>
            <span :class="getStatusBadgeClass(selectedEntityItem?.status || 'unknown')">
              {{ selectedEntityItem?.status || 'Unknown' }}
            </span>
          </div>
          
          <!-- Lead Mapping Statistics Cards -->
          <div class="mapping-stats-cards">
            <div class="stats-card total">
              <div class="stats-icon">📊</div>
              <div class="stats-content">
                <div class="stats-number">{{ mappingStats.total }}</div>
                <div class="stats-label">Total Mappings</div>
              </div>
            </div>
            
            <div class="stats-card lead">
              <div class="stats-icon">🎯</div>
              <div class="stats-content">
                <div class="stats-number">{{ mappingStats.lead }}</div>
                <div class="stats-label">Lead Status</div>
              </div>
            </div>
            
            <div class="stats-card prospect">
              <div class="stats-icon">🔍</div>
              <div class="stats-content">
                <div class="stats-number">{{ mappingStats.prospect }}</div>
                <div class="stats-label">Prospect Status</div>
              </div>
            </div>
            
            <div class="stats-card customer">
              <div class="stats-icon">✅</div>
              <div class="stats-content">
                <div class="stats-number">{{ mappingStats.customer }}</div>
                <div class="stats-label">Customer Status</div>
              </div>
            </div>
          </div>
          
          <button class="btn-change-selection" @click="clearSelection">
            <span>🔄</span> Change Selection
          </button>
        </div>
      </div>

      <!-- Associated Entity Filters -->
      <div class="associated-filters">
        <div class="filters-header">
          <h3>Filter {{ selectedEntity === 'manufacturer' ? 'Distributors' : 'Manufacturers' }}</h3>
          <button class="btn-clear-all" @click="clearAssociatedFilters" v-if="hasActiveAssociatedFilters">
            <span>✕</span> Clear All
          </button>
        </div>

        <div class="filters-grid">
          <!-- Geography Section -->
          <div class="filter-card">
            <div class="filter-card-header">
              <span class="filter-icon">🌍</span>
              <h4>Geography</h4>
            </div>
            <div class="filter-card-content">
              <div class="filter-row">
                <label>State</label>
                <ModernMultiSelect 
                  :options="availableAssociatedStates"
                  :selected="associatedFilters.state"
                  :placeholder="isLoadingStates ? 'Loading states...' : 'Select states...'"
                  @update:selected="(val) => updateAssociatedLocationFilters('state', val)"
                  @dropdown-opened="onAssociatedStatesDropdownOpened"
                />
              </div>
              <div class="filter-row">
                <label>District</label>
                <ModernMultiSelect 
                  :options="availableAssociatedDistricts"
                  :selected="associatedFilters.district"
                  :placeholder="isLoadingDistricts ? 'Loading districts...' : 'Select districts...'"
                  @update:selected="(val) => updateAssociatedLocationFilters('district', val)"
                  @dropdown-opened="onAssociatedDistrictsDropdownOpened"
                />
              </div>
              <div class="filter-row">
                <label>City</label>
                <ModernMultiSelect 
                  :options="availableAssociatedCities"
                  :selected="associatedFilters.city"
                  :placeholder="isLoadingCities ? 'Loading cities...' : 'Select cities...'"
                  @update:selected="(val) => updateAssociatedLocationFilters('city', val)"
                  @dropdown-opened="onAssociatedCitiesDropdownOpened"
                />
              </div>
            </div>
          </div>

          <!-- Category Section -->
          <div class="filter-card">
            <div class="filter-card-header">
              <span class="filter-icon">📦</span>
              <h4>Category</h4>
            </div>
            <div class="filter-card-content">
              <div class="filter-row">
                <label>Category</label>
                <ModernMultiSelect 
                  :options="availableAssociatedCategories"
                  :selected="associatedFilters.category"
                  :placeholder="isLoadingCategories ? 'Loading categories...' : 'Select categories...'"
                  @update:selected="(val) => updateAssociatedCategoryFilters('category', val)"
                  @dropdown-opened="onAssociatedCategoriesDropdownOpened"
                />
              </div>
              <div class="filter-row">
                <label>Sub Category</label>
                <ModernMultiSelect 
                  :options="availableAssociatedSubCategories"
                  :selected="associatedFilters.subCategory"
                  placeholder="Select sub-categories..."
                  @update:selected="(val) => updateAssociatedCategoryFilters('subCategory', val)"
                />
              </div>
            </div>
          </div>

          <!-- Status Section -->
          <div class="filter-card">
            <div class="filter-card-header">
              <span class="filter-icon">📊</span>
              <h4>Status</h4>
            </div>
            <div class="filter-card-content">
              <div class="filter-row">
                <label>Status</label>
                <ModernMultiSelect 
                  :options="filterOptions.statuses"
                  :selected="associatedFilters.status"
                  placeholder="Select statuses..."
                  @update:selected="(val) => onAssociatedFilterChange('status', val)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Active Associated Filters Display -->
        <div class="active-filters" v-if="hasActiveAssociatedFilters">
          <h4>Active Filters:</h4>
          <div class="filter-tags">
            <div v-for="(values, key) in activeAssociatedFilterTags" :key="key" class="filter-tag-group">
              <span class="filter-tag-label">{{ getFilterLabel(key) }}:</span>
              <span 
                v-for="value in values" 
                :key="value" 
                class="filter-tag"
              >
                {{ value }}
                <button @click="removeAssociatedFilterValue(key, value)" class="tag-remove">×</button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <DataTable
        :title="tableTitle"
        :columns="tableColumns"
        :data="filteredPairedList"
        @action-click="handleActionClick"
        @view-click="handleViewClick"
      >
        <template #actions>
          <div class="table-summary">
            <span class="summary-count">{{ filteredPairedList.length }}</span>
            <span class="summary-text">{{ selectedEntity === 'manufacturer' ? 'distributors' : 'manufacturers' }} found</span>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '../components/DataTable.vue'
import ModernMultiSelect from '../components/ModernMultiSelect.vue'
import { useBusinessLogic } from '../composables/useBusinessLogic'
import type { Manufacturer, Distributor } from '../types'

const router = useRouter()
const {
  selectedEntity,
  selectedEntityId,
  filters,
  associatedFilters,
  manufacturers,
  distributors,
  filteredManufacturers,
  filteredDistributors,
  setSelectedEntity,
  setSelectedEntityId,
  setSelectedManufacturer,
  setSelectedDistributor,
  clearFilters,
  clearAssociatedFilters,
  updateLocationFilters,
  updateCategoryFilters,
  locationMapping,
  industryToCategoryMapping
} = useBusinessLogic()

// Import filter options
import { filterOptions } from '../data/mockData'

// Local state
const selectedEntityItem = ref<Manufacturer | Distributor | null>(null)

// API data state
const statesData = ref<string[]>([])
const districtsData = ref<string[]>([])
const citiesData = ref<string[]>([])
const categoriesData = ref<string[]>([])
const leadsData = ref<any[]>([])
const associatedLeadsData = ref<any[]>([]) // For associated entities
const hasApiData = ref(false) // Flag to track if we have fetched API data
const isLoadingStates = ref(false)
const isLoadingDistricts = ref(false)
const isLoadingCities = ref(false)
const isLoadingCategories = ref(false)
const isLoadingLeads = ref(false)
const isLoadingAssociatedLeads = ref(false)

// Dynamic counts based on filtered leads
const dynamicManufacturerCount = ref(0)
const dynamicDistributorCount = ref(0)

// Lead Mapping Statistics
const leadMappingsData = ref<any[]>([])
const isLoadingMappingStats = ref(false)

// API functions
const fetchStates = async () => {
  if (isLoadingStates.value) return // Prevent multiple concurrent requests
  
  isLoadingStates.value = true
  try {
    const response = await fetch('/api/resource/States')
    const data = await response.json()
    
    if (data && data.data) {
      statesData.value = data.data.map((item: { name: string }) => item.name)
    }
  } catch (error) {
    console.error('Error fetching states:', error)
    // Fallback to mock data
    statesData.value = filterOptions.states
  } finally {
    isLoadingStates.value = false
  }
}

const fetchDistricts = async (stateNames?: string[]) => {
  if (isLoadingDistricts.value) return []
  
  isLoadingDistricts.value = true
  try {
    let url = '/api/resource/Districts'
    if (stateNames && stateNames.length > 0) {
      // Create filter for multiple states: {"state":["in",["State1","State2"]]}
      const filters = {
        "state": ["in", stateNames]
      }
      url += `?filters=${encodeURIComponent(JSON.stringify(filters))}`
    }
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data && data.data) {
      return data.data.map((item: { name: string }) => item.name)
    }
    return []
  } catch (error) {
    console.error('Error fetching districts:', error)
    // Fallback to mock data
    return filterOptions.districts
  } finally {
    isLoadingDistricts.value = false
  }
}

const fetchCities = async (districtNames?: string[]) => {
  if (isLoadingCities.value) return []
  
  isLoadingCities.value = true
  try {
    let url = '/api/resource/Cities'
    if (districtNames && districtNames.length > 0) {
      // Create filter for multiple districts: {"district":["in",["District1","District2"]]}
      const filters = {
        "district": ["in", districtNames]
      }
      url += `?filters=${encodeURIComponent(JSON.stringify(filters))}`
    }
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data && data.data) {
      return data.data.map((item: { name: string }) => item.name)
    }
    return []
  } catch (error) {
    console.error('Error fetching cities:', error)
    // Fallback to mock data
    return filterOptions.cities
  } finally {
    isLoadingCities.value = false
  }
}

const fetchCategories = async () => {
  if (isLoadingCategories.value) return // Prevent multiple concurrent requests
  
  isLoadingCategories.value = true
  try {
    const response = await fetch('/api/resource/Category')
    const data = await response.json()
    
    if (data && data.data) {
      categoriesData.value = data.data.map((item: { name: string }) => item.name)
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Fallback to mock data
    categoriesData.value = filterOptions.categories
  } finally {
    isLoadingCategories.value = false
  }
}

const fetchLeads = async () => {
  if (isLoadingLeads.value) return
  
  isLoadingLeads.value = true
  try {
    let url = '/api/resource/Lead?fields=["name","custom_lead_category","company_name","custom_new_status","custom_states","custom_districts","custom_categories"]'
    
    // Build filters based on selected states, districts, and categories
    const apiFilters: any = {}
    
    if (filters.state?.length > 0) {
      apiFilters.custom_states = ["in", filters.state]
    }
    
    if (filters.district?.length > 0) {
      apiFilters.custom_districts = ["in", filters.district]
    }
    
    if (filters.category?.length > 0) {
      apiFilters.custom_categories = ["in", filters.category]
    }
    
    if (filters.status?.length > 0) {
      apiFilters.custom_new_status = ["in", filters.status]
    }
    
    // Add filters to URL if any exist
    if (Object.keys(apiFilters).length > 0) {
      url += `&filters=${encodeURIComponent(JSON.stringify(apiFilters))}`
    }
    
    console.log('Fetching leads with URL:', url)
    
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('Leads API response:', data)
    
    if (data && data.data) {
      leadsData.value = data.data
      
      // Count manufacturers and distributors
      let manufacturerCount = 0
      let distributorCount = 0
      
      data.data.forEach((lead: any) => {
        if (lead.custom_lead_category === "Manufacturer Lead") {
          manufacturerCount++
        } else if (lead.custom_lead_category === "SS / Distributor Lead") {
          distributorCount++
        }
      })
      
      console.log(`Found ${manufacturerCount} manufacturers, ${distributorCount} distributors`)
      
      dynamicManufacturerCount.value = manufacturerCount
      dynamicDistributorCount.value = distributorCount
      hasApiData.value = true // Set flag to indicate we have API data
    }
  } catch (error) {
    console.error('Error fetching leads:', error)
    // Reset counts on error
    dynamicManufacturerCount.value = manufacturers.value.length
    dynamicDistributorCount.value = distributors.value.length
  } finally {
    isLoadingLeads.value = false
  }
}

const fetchInitialCounts = async () => {
  // Fetch initial lead counts without any filters
  if (isLoadingLeads.value) return
  
  isLoadingLeads.value = true
  try {
    const url = '/api/resource/Lead?fields=["name","custom_lead_category","company_name","custom_new_status","custom_states","custom_districts","custom_categories"]'
    
    console.log('Fetching initial lead counts with URL:', url)
    
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('Initial leads API response:', data)
    
    // Log the structure of the first lead to see what fields are available
    if (data && data.data && data.data.length > 0) {
      console.log('First lead structure:', data.data[0])
      console.log('Available fields:', Object.keys(data.data[0]))
    }
    
    if (data && data.data) {
      leadsData.value = data.data
      
      // Count manufacturers and distributors
      let manufacturerCount = 0
      let distributorCount = 0
      
      data.data.forEach((lead: any) => {
        if (lead.custom_lead_category === "Manufacturer Lead") {
          manufacturerCount++
        } else if (lead.custom_lead_category === "SS / Distributor Lead") {
          distributorCount++
        }
      })
      
      console.log(`Initial counts: ${manufacturerCount} manufacturers, ${distributorCount} distributors`)
      
      dynamicManufacturerCount.value = manufacturerCount
      dynamicDistributorCount.value = distributorCount
      
      // Force update of currentEntityList by setting a flag to indicate we have API data
      hasApiData.value = true
    }
  } catch (error) {
    console.error('Error fetching initial lead counts:', error)
    // Fallback to mock data counts on error
    dynamicManufacturerCount.value = manufacturers.value.length
    dynamicDistributorCount.value = distributors.value.length
    hasApiData.value = false
  } finally {
    isLoadingLeads.value = false
  }
}

// Fetch Lead Mapping Statistics for selected entity
const fetchLeadMappingStats = async () => {
  try {
    isLoadingMappingStats.value = true
    console.log('Fetching Lead Mapping statistics for selected entity...')
    
    // Only fetch if we have a selected entity
    if (!selectedEntityItem.value?.id) {
      console.log('No selected entity, clearing mapping stats')
      leadMappingsData.value = []
      return
    }
    
    const parentLeadId = selectedEntityItem.value.id
    const response = await fetch(`/api/resource/Lead%20Mapping?fields=["name","status","parent_lead"]&filters={"parent_lead":"${parentLeadId}"}&limit_page_length=500`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    leadMappingsData.value = data.data || []
    
    console.log('Lead Mapping statistics fetched successfully for', parentLeadId, ':', leadMappingsData.value.length, 'records')
  } catch (error) {
    console.error('Error fetching Lead Mapping statistics:', error)
    leadMappingsData.value = []
  } finally {
    isLoadingMappingStats.value = false
  }
}

// Computed properties
const currentEntityList = computed(() => {
  // If we have API leads data, use it to generate the entity list (with or without filters)
  if (leadsData.value.length > 0) {
    const filteredLeads = leadsData.value.filter((lead: any) => {
      const isManufacturer = lead.custom_lead_category === "Manufacturer Lead"
      const isDistributor = lead.custom_lead_category === "SS / Distributor Lead"
      
      if (selectedEntity.value === 'manufacturer') {
        return isManufacturer
      } else {
        return isDistributor
      }
    })
    
    // Convert leads to entity format for the dropdown
    // We need to determine the actual field names from the API response
    return filteredLeads.map((lead: any) => ({
      id: lead.name,
      name: lead.company_name || lead.name, // Use company_name if available, fallback to name
      city: 'Unknown', // City is not in the API response yet
      district: lead.custom_districts || 'Unknown',
      state: lead.custom_states || 'Unknown',
      category: lead.custom_categories || (selectedEntity.value === 'manufacturer' ? 'Manufacturer' : 'Distributor'),
      subCategory: 'Unknown',
      status: lead.custom_new_status || 'Lead',
      registrationDate: new Date().toISOString().split('T')[0],
      daysSinceStatus: 0
    }))
  }
  
  // Fallback to original filtered data when no API data is available
  return selectedEntity.value === 'manufacturer' 
    ? filteredManufacturers.value 
    : filteredDistributors.value
})

// Dynamic counts based on filters
const displayManufacturerCount = computed(() => {
  // Use API data if available, otherwise fallback to mock data
  return hasApiData.value ? dynamicManufacturerCount.value : manufacturers.value.length
})

const displayDistributorCount = computed(() => {
  // Use API data if available, otherwise fallback to mock data
  return hasApiData.value ? dynamicDistributorCount.value : distributors.value.length
})

const filteredPairedList = computed(() => {
  if (!selectedEntityItem.value) return []
  
  // If we have API data for associated leads, use it
  if (associatedLeadsData.value.length > 0) {
    return associatedLeadsData.value.map((lead: any) => ({
      id: lead.name,
      name: lead.company_name || lead.name,
      city: 'Unknown', // City not in API response yet
      district: lead.custom_districts || 'Unknown',
      state: lead.custom_states || 'Unknown',
      category: lead.custom_categories || (selectedEntity.value === 'manufacturer' ? 'Distributor' : 'Manufacturer'),
      subCategory: 'Unknown',
      status: lead.finalStatus || 'Registration', // Use finalStatus from Lead Mapping or default to Registration
      registrationDate: new Date().toISOString().split('T')[0],
      daysSinceStatus: 0
    }))
  }
  
  // Fallback to original mock data logic
  let list = selectedEntity.value === 'manufacturer' 
    ? distributors.value 
    : manufacturers.value
    
  // Filter by matching category and subcategory
  list = list.filter(item =>
    item.category === selectedEntityItem.value?.category &&
    item.subCategory === selectedEntityItem.value?.subCategory
  )
  
  // Apply associated filters
  return list.filter(item => {
    // Safety check: ensure item exists before accessing properties
    if (!item) return false
    
    return (!associatedFilters.city.length || associatedFilters.city.includes(item.city)) &&
           (!associatedFilters.district.length || associatedFilters.district.includes(item.district)) &&
           (!associatedFilters.state.length || associatedFilters.state.includes(item.state)) &&
           (!associatedFilters.category.length || associatedFilters.category.includes(item.category)) &&
           (!associatedFilters.subCategory.length || associatedFilters.subCategory.includes(item.subCategory)) &&
           (!associatedFilters.status.length || associatedFilters.status.includes(item.status))
  })
})

const tableTitle = computed(() => {
  if (!selectedEntityItem.value) return ''
  return `Associated ${selectedEntity.value === 'manufacturer' ? 'Distributors' : 'Manufacturers'} for ${selectedEntityItem.value.name}`
})

const tableColumns = computed(() => [
  { key: 'serialNumber', label: 'Sl. No' },
  { key: 'name', label: 'Name' },
  { key: 'city', label: 'City' },
  { key: 'district', label: 'District' },
  { key: 'state', label: 'State' },
  { key: 'category', label: 'Category' },
  { key: 'subCategory', label: 'Sub Category' },
  { key: 'status', label: 'Status' },
  { key: 'daysSinceStatus', label: 'Days Since Status' },
  { key: 'registrationDate', label: 'Registration Date' },
  { key: 'action', label: 'Action' },
  { key: 'view', label: 'View' }
])

// Filter availability computed properties
const availableStates = computed(() => {
  // If we have API data, use it; otherwise fallback to mock data
  const statesList = statesData.value.length > 0 ? statesData.value : filterOptions.states
  
  if (filters.city.length > 0 || filters.district.length > 0) {
    const relatedStates = new Set<string>()
    
    if (filters.city.length > 0) {
      Object.entries(locationMapping).forEach(([state, mapping]) => {
        if (mapping.cities.some(city => filters.city.includes(city))) {
          relatedStates.add(state)
        }
      })
    }
    
    if (filters.district.length > 0) {
      Object.entries(locationMapping).forEach(([state, mapping]) => {
        if (mapping.districts.some(district => filters.district.includes(district))) {
          relatedStates.add(state)
        }
      })
    }
    
    // Filter the API data based on related states
    return statesList.filter(state => relatedStates.has(state))
  }
  
  return statesList
})

const availableDistricts = computed(() => {
  // Always prioritize API data when available
  if (districtsData.value.length > 0) {
    return districtsData.value
  }
  
  // Fallback to mock data mapping when no API data is available
  if (filters.state.length > 0) {
    const relatedDistricts = new Set<string>()
    filters.state.forEach((state: string) => {
      const mapping = locationMapping[state as keyof typeof locationMapping]
      if (mapping) {
        mapping.districts.forEach((district: string) => relatedDistricts.add(district))
      }
    })
    return Array.from(relatedDistricts)
  }
  
  // Final fallback to all mock districts
  return filterOptions.districts
})

const availableCities = computed(() => {
  // Always prioritize API data when available
  if (citiesData.value.length > 0) {
    return citiesData.value
  }
  
  // Fallback to mock data mapping when no API data is available
  if (filters.state.length > 0) {
    const relatedCities = new Set<string>()
    filters.state.forEach((state: string) => {
      const mapping = locationMapping[state as keyof typeof locationMapping]
      if (mapping) {
        mapping.cities.forEach((city: string) => relatedCities.add(city))
      }
    })
    return Array.from(relatedCities)
  }
  
  // Final fallback to all mock cities
  return filterOptions.cities
})

const availableCategories = computed(() => {
  if (filters.subCategory.length > 0) {
    const relatedCategories = new Set<string>()
    filters.subCategory.forEach((subCategory: string) => {
      Object.entries(industryToCategoryMapping).forEach(([category, subCategories]) => {
        if (subCategories.includes(subCategory)) {
          relatedCategories.add(category)
        }
      })
    })
    return Array.from(relatedCategories)
  }
  // Use API data if available, otherwise fallback to mock data
  return categoriesData.value.length > 0 ? categoriesData.value : filterOptions.categories
})

const availableSubCategories = computed(() => {
  if (filters.category.length > 0) {
    const relatedSubCategories = new Set<string>()
    filters.category.forEach((category: string) => {
      const subCategories = industryToCategoryMapping[category as keyof typeof industryToCategoryMapping]
      if (subCategories) {
        subCategories.forEach((subCategory: string) => relatedSubCategories.add(subCategory))
      }
    })
    return Array.from(relatedSubCategories)
  }
  return filterOptions.subCategories
})

// Associated filters availability
const availableAssociatedStates = computed(() => {
  // Use API data or fallback to mock data
  const statesList = statesData.value.length > 0 ? statesData.value : filterOptions.states
  
  if (associatedFilters.city.length > 0 || associatedFilters.district.length > 0) {
    const relatedStates = new Set<string>()
    
    if (associatedFilters.city.length > 0) {
      Object.entries(locationMapping).forEach(([state, mapping]) => {
        if (mapping.cities.some(city => associatedFilters.city.includes(city))) {
          relatedStates.add(state)
        }
      })
    }
    
    if (associatedFilters.district.length > 0) {
      Object.entries(locationMapping).forEach(([state, mapping]) => {
        if (mapping.districts.some(district => associatedFilters.district.includes(district))) {
          relatedStates.add(state)
        }
      })
    }
    
    return statesList.filter(state => relatedStates.has(state))
  }
  return statesList
})

const availableAssociatedDistricts = computed(() => {
  if (associatedFilters.state.length > 0) {
    const relatedDistricts = new Set<string>()
    associatedFilters.state.forEach((state: string) => {
      const mapping = locationMapping[state as keyof typeof locationMapping]
      if (mapping) {
        mapping.districts.forEach((district: string) => relatedDistricts.add(district))
      }
    })
    return Array.from(relatedDistricts)
  }
  return districtsData.value.length > 0 ? districtsData.value : filterOptions.districts
})

const availableAssociatedCities = computed(() => {
  if (associatedFilters.state.length > 0) {
    const relatedCities = new Set<string>()
    associatedFilters.state.forEach((state: string) => {
      const mapping = locationMapping[state as keyof typeof locationMapping]
      if (mapping) {
        mapping.cities.forEach((city: string) => relatedCities.add(city))
      }
    })
    return Array.from(relatedCities)
  }
  return citiesData.value.length > 0 ? citiesData.value : filterOptions.cities
})

const availableAssociatedCategories = computed(() => {
  if (associatedFilters.subCategory.length > 0) {
    const relatedCategories = new Set<string>()
    associatedFilters.subCategory.forEach((subCategory: string) => {
      Object.entries(industryToCategoryMapping).forEach(([category, subCategories]) => {
        if (subCategories.includes(subCategory)) {
          relatedCategories.add(category)
        }
      })
    })
    return Array.from(relatedCategories)
  }
  // Use API data if available, otherwise fallback to mock data
  return categoriesData.value.length > 0 ? categoriesData.value : filterOptions.categories
})

const availableAssociatedSubCategories = computed(() => {
  if (associatedFilters.category.length > 0) {
    const relatedSubCategories = new Set<string>()
    associatedFilters.category.forEach((category: string) => {
      const subCategories = industryToCategoryMapping[category as keyof typeof industryToCategoryMapping]
      if (subCategories) {
        subCategories.forEach((subCategory: string) => relatedSubCategories.add(subCategory))
      }
    })
    return Array.from(relatedSubCategories)
  }
  return filterOptions.subCategories
})

// Active filters
const hasActiveFilters = computed(() => {
  return Object.values(filters).some((arr: unknown) => Array.isArray(arr) && arr.length > 0)
})

const hasActiveAssociatedFilters = computed(() => {
  return Object.values(associatedFilters).some((arr: unknown) => Array.isArray(arr) && arr.length > 0)
})

// Lead Mapping Statistics computed properties
const totalMappings = computed(() => {
  return leadMappingsData.value.length
})

const leadStatusCount = computed(() => {
  return leadMappingsData.value.filter(mapping => mapping.status === 'Lead').length
})

const prospectStatusCount = computed(() => {
  return leadMappingsData.value.filter(mapping => mapping.status === 'Prospect').length
})

const customerStatusCount = computed(() => {
  return leadMappingsData.value.filter(mapping => mapping.status === 'Customer').length
})

// Combined mapping stats object for template
const mappingStats = computed(() => {
  return {
    total: totalMappings.value,
    lead: leadStatusCount.value,
    prospect: prospectStatusCount.value,
    customer: customerStatusCount.value
  }
})

const activeFilterTags = computed(() => {
  const tags: Record<string, unknown> = {}
  Object.entries(filters).forEach(([key, values]) => {
    if (Array.isArray(values) && values.length > 0) {
      tags[key] = values
    }
  })
  return tags
})

const activeAssociatedFilterTags = computed(() => {
  const tags: Record<string, unknown> = {}
  Object.entries(associatedFilters).forEach(([key, values]) => {
    if (Array.isArray(values) && values.length > 0) {
      tags[key] = values
    }
  })
  return tags
})

// Methods
const clearAllFilters = () => {
  // Clear all filter arrays
  filters.state = []
  filters.district = []
  filters.city = []
  filters.category = []
  filters.subCategory = []
  filters.status = []
  
  // Fetch initial counts (without filters) when clearing all filters
  fetchInitialCounts()
  
  // Call the composable's clear function
  clearFilters()
}

const onEntitySelect = () => {
  selectedEntityItem.value = currentEntityList.value.find(e => e.id === selectedEntityId.value) || null
  if (selectedEntityItem.value) {
    if (selectedEntity.value === 'manufacturer') {
      setSelectedManufacturer(selectedEntityItem.value)
    } else {
      setSelectedDistributor(selectedEntityItem.value)
    }
    // Fetch associated leads when entity is selected
    fetchAssociatedLeads()
  }
  clearAssociatedFilters()
}

const clearSelection = () => {
  setSelectedEntityId('')
  selectedEntityItem.value = null
  setSelectedManufacturer(null)
  setSelectedDistributor(null)
  associatedLeadsData.value = [] // Clear associated data
  clearAssociatedFilters()
}

const onEntityChange = (newEntity: 'manufacturer' | 'distributor') => {
  setSelectedEntity(newEntity)
  clearSelection()
  // Don't clear filters - just clear the selection
  // The filters should remain the same for both manufacturers and distributors
}

const onFilterChange = (updated: Record<string, unknown>) => {
  Object.assign(filters, updated)
  if (selectedEntityItem.value) {
    const exists = currentEntityList.value.some(e => e.id === selectedEntityItem.value?.id)
    if (!exists) clearSelection()
  }
}

const onAssociatedFilterChange = (type: string, values: string[]) => {
  (associatedFilters as any)[type] = values
  // Fetch updated associated leads when filters change
  if (selectedEntityItem.value) {
    fetchAssociatedLeads()
  }
}

const updateAssociatedLocationFilters = (type: string, values: string[]) => {
  (associatedFilters as any)[type] = values
  // Fetch updated associated leads when filters change
  if (selectedEntityItem.value) {
    fetchAssociatedLeads()
  }
}

const updateAssociatedCategoryFilters = (type: string, values: string[]) => {
  (associatedFilters as any)[type] = values
  // Fetch updated associated leads when filters change
  if (selectedEntityItem.value) {
    fetchAssociatedLeads()
  }
}

const removeFilterValue = (filterType: string, value: string) => {
  const currentValues = (filters as any)[filterType]
  const newValues = currentValues.filter((v: string) => v !== value)
  
  if (filterType === 'city' || filterType === 'district' || filterType === 'state') {
    updateLocationFilters(filterType, newValues)
  } else if (filterType === 'category' || filterType === 'subCategory') {
    updateCategoryFilters(filterType, newValues)
  } else {
    onFilterChange({ [filterType]: newValues })
  }
}

const removeAssociatedFilterValue = (filterType: string, value: string) => {
  const currentValues = (associatedFilters as any)[filterType]
  const newValues = currentValues.filter((v: string) => v !== value)
  
  if (filterType === 'city' || filterType === 'district' || filterType === 'state') {
    updateAssociatedLocationFilters(filterType, newValues)
  } else if (filterType === 'category' || filterType === 'subCategory') {
    updateAssociatedCategoryFilters(filterType, newValues)
  } else {
    onAssociatedFilterChange(filterType, newValues)
  }
}

const getFilterLabel = (key: string) => {
  const labels: Record<string, string> = {
    state: 'State',
    district: 'District', 
    city: 'City',
    category: 'Category',
    subCategory: 'Sub Category',
    status: 'Status'
  }
  return labels[key] || key
}

const handleActionClick = (row: Manufacturer | Distributor) => {
  const routeName = getRouteNameFromStatus(row.status)
  if (routeName) {
    // Same routing logic for both Lead and Prospect pages
    // Pass the clicked row as main id and selected entity as parentId
    console.log('Navigation:', {
      clickedRow: row,
      selectedEntity: selectedEntityItem.value,
      route: routeName
    })
    
    router.push({ 
      name: routeName, 
      params: { 
        id: row.id,  // The clicked row (associated entity)
        parentId: selectedEntityItem.value?.id || ''  // The selected entity (parent)
      }
    })
  }
}

const handleViewClick = (row: Manufacturer | Distributor) => {
  console.log('View clicked for:', row)
  console.log('Selected entity (parent):', selectedEntityItem.value)
  
  // Navigate to ViewOnly page with parent-child routing
  // Parent ID = selected entity, Child ID = clicked row
  router.push({ 
    name: 'ViewOnly', 
    params: { 
      id: selectedEntityItem.value?.id || '',  // Parent ID (selected entity)
      parentId: row.id  // Child ID (clicked row)
    }
  })
}

const getRouteNameFromStatus = (status: string) => {
  switch (status) {
    case 'Registration': return 'Lead' // Process registration as lead
    case 'Lead': return 'Lead'
    case 'Prospect': return 'Prospect'
    case 'Customer': return 'Customer'
    case 'View': return 'ViewOnly'
    default: return 'ViewOnly'
  }
}

const getStatusBadgeClass = (status: string) => {
  const base = 'status-badge'
  return `${base} ${{
    Registration: 'status-registration',
    Lead: 'status-lead',
    Prospect: 'status-prospect',
    Customer: 'status-customer',
    View: 'status-view'
  }[status] || ''}`
}

// Dropdown event handlers for lazy loading
const onStatesDropdownOpened = () => {
  if (statesData.value.length === 0) {
    fetchStates()
  }
}

const onDistrictsDropdownOpened = () => {
  // Fetch districts if we have selected states but no district data
  if (filters.state.length > 0) {
    fetchDistricts(filters.state)
      .then(districts => {
        districtsData.value = districts
      })
      .catch(error => console.error('Error fetching districts:', error))
  }
}

const onCitiesDropdownOpened = () => {
  // Fetch cities if we have selected districts but no city data
  if (filters.district.length > 0) {
    fetchCities(filters.district)
      .then(cities => {
        citiesData.value = cities
      })
      .catch(error => console.error('Error fetching cities:', error))
  }
}

const onCategoriesDropdownOpened = () => {
  // Fetch categories if not already loaded
  if (categoriesData.value.length === 0) {
    fetchCategories()
  }
}

// Associated filters dropdown handlers
const onAssociatedStatesDropdownOpened = () => {
  if (statesData.value.length === 0) {
    fetchStates()
  }
}

const onAssociatedDistrictsDropdownOpened = () => {
  // Fetch districts if we have selected states but no district data
  if (associatedFilters.state.length > 0) {
    fetchDistricts(associatedFilters.state)
      .then(districts => {
        districtsData.value = districts
      })
      .catch(error => console.error('Error fetching districts:', error))
  }
}

const onAssociatedCitiesDropdownOpened = () => {
  // Fetch cities if we have selected districts but no city data
  if (associatedFilters.district.length > 0) {
    fetchCities(associatedFilters.district)
      .then(cities => {
        citiesData.value = cities
      })
      .catch(error => console.error('Error fetching cities:', error))
  }
}

const onAssociatedCategoriesDropdownOpened = () => {
  // Fetch categories if not already loaded
  if (categoriesData.value.length === 0) {
    fetchCategories()
  }
}

// Lifecycle hooks
onMounted(() => {
  // Initialize dynamic counts with default values
  dynamicManufacturerCount.value = manufacturers.value.length
  dynamicDistributorCount.value = distributors.value.length
  
  // Fetch initial lead counts from API
  fetchInitialCounts()
  
  // Don't fetch mapping stats on mount since no entity is selected
  // Stats will be fetched when entity is selected
  
  // Reset entity selection when returning to Dashboard
  clearSelection()
})

watch(selectedEntityId, (newId) => {
  selectedEntityItem.value = currentEntityList.value.find(e => e.id === newId) || null
})

// Watch for filter changes to update lead counts
watch([
  () => filters.state,
  () => filters.district, 
  () => filters.category,
  () => filters.status
], () => {
  // Fetch leads when location, category, or status filters change
  if (filters.state.length > 0 || filters.district.length > 0 || filters.category.length > 0 || filters.status.length > 0) {
    fetchLeads()
  } else {
    // Fetch initial counts when no filters are applied
    fetchInitialCounts()
  }
}, { deep: true })

// Watch for state filter changes to clear related data when states are removed
watch(() => filters.state, (newStates) => {
  if (newStates.length === 0) {
    // Clear districts and cities when no states are selected
    districtsData.value = []
    filters.district = []
    citiesData.value = []
    filters.city = []
  }
}, { deep: true })

// Watch for district filter changes to clear related data when districts are removed
watch(() => filters.district, (newDistricts) => {
  if (newDistricts.length === 0) {
    // Clear cities when no districts are selected
    citiesData.value = []
    filters.city = []
  }
}, { deep: true })

// Function to fetch all Lead Mappings for a parent lead
const fetchLeadMappings = async (parentLeadId: string) => {
  try {
    const url = `/api/resource/Lead Mapping?filters={"parent_lead":"${parentLeadId}"}&fields=["name","status","mapped_lead","parent_lead"]`
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('Lead Mapping API response for parent:', parentLeadId, data)
    
    if (data && data.data && data.data.length > 0) {
      // Create a mapping object: { mappedLeadId: status }
      const mappingStatus: Record<string, string> = {}
      data.data.forEach((mapping: any) => {
        if (mapping.mapped_lead) {
          mappingStatus[mapping.mapped_lead] = mapping.status
        }
      })
      return mappingStatus
    }
    return {} // No mappings found
  } catch (error) {
    console.error('Error fetching lead mappings:', error)
    return {}
  }
}

// New API function to fetch associated leads (distributors for manufacturer and vice versa)
const fetchAssociatedLeads = async () => {
  if (isLoadingAssociatedLeads.value || !selectedEntityItem.value) return
  
  isLoadingAssociatedLeads.value = true
  try {
    // Determine the opposite entity type
    const oppositeEntityType = selectedEntity.value === 'manufacturer' ? 'SS / Distributor Lead' : 'Manufacturer Lead'
    
    let url = `/api/resource/Lead?fields=["name","custom_lead_category","company_name","custom_new_status","custom_states","custom_districts","custom_categories"]`
    
    // Build filters for opposite entity type
    const apiFilters: any = {
      custom_lead_category: oppositeEntityType
    }
    
    // Apply associated filters if any
    if (associatedFilters.state?.length > 0) {
      apiFilters.custom_states = ["in", associatedFilters.state]
    }
    
    if (associatedFilters.district?.length > 0) {
      apiFilters.custom_districts = ["in", associatedFilters.district]
    }
    
    if (associatedFilters.category?.length > 0) {
      apiFilters.custom_categories = ["in", associatedFilters.category]
    }
    
    if (associatedFilters.status?.length > 0) {
      apiFilters.custom_new_status = ["in", associatedFilters.status]
    }
    
    // Add filters to URL
    url += `&filters=${encodeURIComponent(JSON.stringify(apiFilters))}`
    
    console.log('Fetching associated leads with URL:', url)
    
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('Associated leads API response:', data)
    
    if (data && data.data) {
      // Fetch all Lead Mappings for the selected parent lead (only once!)
      const leadMappings = await fetchLeadMappings(selectedEntityItem.value?.id || '')
      
      // Apply mapping status to each lead
      const leadsWithMappingStatus = data.data.map((lead: any) => {
        // Check if this lead has a mapping status
        const mappingStatus = leadMappings[lead.name] // lead.name is the lead ID
        
        return {
          ...lead,
          // If mapping exists, use mapping status, otherwise use "Registration"
          finalStatus: mappingStatus || 'Registration'
        }
      })
      
      console.log('Leads with mapping status:', leadsWithMappingStatus)
      
      associatedLeadsData.value = leadsWithMappingStatus
    }
  } catch (error) {
    console.error('Error fetching associated leads:', error)
    associatedLeadsData.value = []
  } finally {
    isLoadingAssociatedLeads.value = false
  }
}

// Watch for changes to selectedEntityItem to refetch associated leads
watch(selectedEntityItem, (newItem, oldItem) => {
  if (newItem && newItem !== oldItem) {
    fetchAssociatedLeads()
    // Fetch mapping stats for the selected entity
    fetchLeadMappingStats()
  } else if (!newItem) {
    // Clear mapping stats when no entity is selected
    leadMappingsData.value = []
  }
})
</script>

<style scoped>
.dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background: #f5f5f7;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
  position: relative;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  color: #1d1d1f;
}

.page-header p {
  color: #86868b;
  font-size: 18px;
  font-weight: 300;
}

.header-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 12px;
}

.btn-add-new {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #1c1c1e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-add-new:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(28, 28, 30, 0.3);
}

.entity-type-selection {
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
}

.entity-toggle-container {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #d2d2d7;
}

.entity-toggle-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #86868b;
  transition: all 0.3s ease;
  position: relative;
}

.entity-toggle-btn:hover {
  background: #f5f5f7;
  color: #1d1d1f;
}

.entity-toggle-btn.active {
  background: #1c1c1e;
  color: white;
  box-shadow: 0 2px 8px rgba(28, 28, 30, 0.3);
}

.entity-icon {
  display: none;
}

.entity-count {
  background: rgba(255, 255, 255, 0.25);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.entity-toggle-btn.active .entity-count {
  background: rgba(255, 255, 255, 0.25);
}

.modern-filters,
.associated-filters {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #d2d2d7;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #d2d2d7;
}

.filters-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
}

.btn-clear-all {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #1c1c1e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-clear-all:hover {
  background: #000000;
  transform: translateY(-1px);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.filter-card {
  background: #f5f5f7;
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.filter-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.filter-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #ffffff;
  color: #1d1d1f;
  border-bottom: 1px solid #f2f2f7;
}

.filter-icon {
  display: none;
}

.filter-card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.filter-card-content {
  padding: 20px;
}

.filter-row {
  margin-bottom: 16px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-row label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1d1d1f;
  font-size: 14px;
}

.active-filters {
  background: #f5f5f7;
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  padding: 16px;
  margin-top: 24px;
}

.active-filters h4 {
  margin: 0 0 12px 0;
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 600;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-tag-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tag-label {
  font-weight: 600;
  color: #1d1d1f;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #1c1c1e;
  color: white;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  height: 28px;
  box-sizing: border-box;
  white-space: nowrap;
}

.tag-remove {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  padding: 0;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  line-height: 1;
  flex-shrink: 0;
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.5);
}

.entity-selection {
  margin-bottom: 32px;
}

.selection-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #d2d2d7;
}

.selection-card h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 20px 0;
}

.selection-icon {
  display: none;
}

.entity-dropdown-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modern-select {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modern-select:focus {
  outline: none;
  border-color: #1c1c1e;
  box-shadow: 0 0 0 3px rgba(28, 28, 30, 0.1);
}

.selection-stats {
  display: flex;
  justify-content: center;
  padding: 12px;
  background: #f5f5f7;
  border-radius: 8px;
}

.stat-item {
  color: #86868b;
  font-size: 14px;
}

.stat-item strong {
  color: #1d1d1f;
  font-weight: 600;
}

.selected-entity-section {
  margin-bottom: 32px;
}

.selected-entity-header {
  margin-bottom: 32px;
}

.entity-info-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #d2d2d7;
}

.mapping-stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-left: auto;
  margin-right: 16px;
}

.stats-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f5f5f7;
  border-radius: 8px;
  border: 1px solid #d2d2d7;
  transition: all 0.2s ease;
  min-width: 120px;
}

.stats-card:hover {
  background: #e8e8ed;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-card.total {
  border-left: 4px solid #1c1c1e;
}

.stats-card.lead {
  border-left: 4px solid #007aff;
}

.stats-card.prospect {
  border-left: 4px solid #ff9500;
}

.stats-card.customer {
  border-left: 4px solid #34c759;
}

.stats-icon {
  font-size: 18px;
  opacity: 0.8;
}

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  line-height: 1.2;
}

.stats-label {
  font-size: 10px;
  color: #86868b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.entity-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #1c1c1e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  flex-shrink: 0;
}

.entity-details {
  flex: 1;
}

.entity-details h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px 0;
}

.entity-location,
.entity-category {
  color: #86868b;
  font-size: 14px;
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 8px;
}

.status-lead {
  background: #f2f2f7;
  color: #8e8e93;
}

.status-prospect {
  background: #e5e5ea;
  color: #1c1c1e;
}

.status-customer {
  background: #d1d1d6;
  color: #1c1c1e;
}

.status-view {
  background: #f5f5f7;
  color: #8e8e93;
}

.status-registration {
  background: #ede9fe;
  color: #7c3aed;
}

.btn-change-selection {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f5f5f7;
  color: #1d1d1f;
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-change-selection:hover {
  background: #e8e8ed;
  transform: translateY(-1px);
}

.table-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f5f5f7;
  border-radius: 8px;
}

.summary-count {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.summary-text {
  color: #86868b;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }
  
  .page-header {
    text-align: left;
  }
  
  .header-actions {
    position: static;
    margin-top: 16px;
    justify-content: center;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .page-header p {
    font-size: 16px;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .entity-toggle-container {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }
  
  .entity-toggle-btn {
    justify-content: center;
    padding: 16px 20px;
  }
  
  .entity-info-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .mapping-stats-cards {
    grid-template-columns: repeat(2, 1fr);
    margin: 16px 0;
    width: 100%;
  }
  
  .stats-card {
    min-width: auto;
  }
  
  .filter-tags {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-tag-group {
    width: 100%;
  }
  
  .modern-filters,
  .associated-filters {
    padding: 16px;
  }
  
  .filters-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .filter-card {
    border-radius: 8px;
  }
  
  .filter-card-content {
    padding: 16px;
  }
}
@media (max-width: 480px) {
  .dashboard {
    padding: 12px;
  }
  
  .page-header {
    margin-bottom: 24px;
  }
  
  .page-header h1 {
    font-size: 20px;
  }
  
  .page-header p {
    font-size: 14px;
  }
  
  .entity-toggle-btn {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .modern-filters,
  .associated-filters {
    padding: 12px;
    margin-bottom: 20px;
  }
  
  .filters-header h3 {
    font-size: 18px;
  }
  
  .filter-card-content {
    padding: 12px;
  }
  
  .filter-row {
    margin-bottom: 12px;
  }
  
  .active-filters {
    padding: 12px;
  }
  
  .filter-tag {
    font-size: 11px;
    padding: 3px 6px;
  }
  
  .selection-card {
    padding: 16px;
  }
  
  .entity-info-card {
    padding: 16px;
  }
  
  .entity-avatar {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
  
  .btn-change-selection {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>