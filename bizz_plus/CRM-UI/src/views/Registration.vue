<template>
  <div class="registration-page">
    <div class="page-header">
      <h1>New Lead Registration</h1>
      <p>Register a new lead in the system</p>
    </div>

    <!-- Lead Category Toggle -->
    <div class="lead-category-section">
      <h2>Lead Category</h2>
      <div class="category-toggle">
        <button 
          class="category-btn"
          :class="{ active: leadCategory === 'manufacturer' }"
          @click="leadCategory = 'manufacturer'"
        >
          <span class="category-icon">🏭</span>
          <span>Manufacturer</span>
        </button>
        <button 
          class="category-btn"
          :class="{ active: leadCategory === 'super-stockist' }"
          @click="leadCategory = 'super-stockist'"
        >
          <span class="category-icon">📦</span>
          <span>Super Stockist</span>
        </button>
        <button 
          class="category-btn"
          :class="{ active: leadCategory === 'distributor' }"
          @click="leadCategory = 'distributor'"
        >
          <span class="category-icon">🏪</span>
          <span>Distributor</span>
        </button>
      </div>
    </div>

    <!-- Registration Form -->
    <form @submit.prevent="submitForm" class="registration-form">
      
      <!-- Manufacturer Form -->
      <div v-if="leadCategory === 'manufacturer'" class="form-section manufacturer-form">
        
        <!-- Contact Info -->
        <div class="section-card">
          <h3>Contact Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Salutation</label>
              <input 
                type="text" 
                v-model="manufacturerForm.salutation" 
                placeholder="Enter salutations"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Designation</label>
              <input 
                type="text" 
                v-model="manufacturerForm.designation" 
                placeholder="Enter designation"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Phone 2</label>
              <input 
                type="tel" 
                v-model="manufacturerForm.phone2" 
                placeholder="Enter phone number"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Name *</label>
              <input 
                type="text" 
                v-model="manufacturerForm.name" 
                placeholder="Enter name"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label>Mobile No.</label>
              <input 
                type="tel" 
                v-model="manufacturerForm.mobile" 
                placeholder="Enter mobile"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                v-model="manufacturerForm.email" 
                placeholder="Enter email"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- Company Profile -->
        <div class="section-card">
          <h3>Company Profile</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Company Name *</label>
              <input 
                type="text" 
                v-model="manufacturerForm.companyName" 
                placeholder="Enter company name as per GST"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label>Staff Strength</label>
              <select v-model="manufacturerForm.staffStrength" class="form-select">
                <option value="">Select</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-100">51-100</option>
                <option value="100+">100+</option>
              </select>
            </div>
            <div class="form-group">
              <label>Brand Name</label>
              <input 
                type="text" 
                v-model="manufacturerForm.brandName1" 
                placeholder="Enter Brand Name"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Inspirational</label>
              <textarea 
                v-model="manufacturerForm.inspirational" 
                placeholder="Anything unique or interesting about this company"
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Brand Name 2</label>
              <input 
                type="text" 
                v-model="manufacturerForm.brandName2" 
                placeholder="Enter Brand Name"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Brand Name 3</label>
              <input 
                type="text" 
                v-model="manufacturerForm.brandName3" 
                placeholder="Enter Brand Name"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- Address Section -->
        <div class="section-card">
          <h3>Address</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Address</label>
              <textarea 
                v-model="addressForm.streetAddress" 
                placeholder="Enter Door No. and Area Name"
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Pincode *</label>
              <input 
                type="text" 
                v-model="addressForm.pincode" 
                @blur="fetchLocationData"
                placeholder="Enter Pincode"
                class="form-input"
                maxlength="6"
                required
              />
            </div>
            <div class="form-group">
              <label>City</label>
              <input 
                type="text" 
                v-model="addressForm.city" 
                placeholder="Enter City"
                class="form-input"
                :readonly="isLocationAutoFilled"
              />
            </div>
            <div class="form-group">
              <label>District</label>
              <input 
                type="text" 
                v-model="addressForm.district" 
                placeholder="Enter District"
                class="form-input"
                :readonly="isLocationAutoFilled"
              />
            </div>
            <div class="form-group">
              <label>State</label>
              <input 
                type="text" 
                v-model="addressForm.state" 
                placeholder="Enter State"
                class="form-input"
                :readonly="isLocationAutoFilled"
              />
            </div>
          </div>
        </div>

        <!-- Presence -->
        <div class="section-card">
          <h3>Presence</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Category</label>
              <ModernMultiSelect 
                :options="filterOptions.categories"
                :selected="manufacturerForm.categories"
                placeholder="Select categories..."
                @update:selected="(val) => updateManufacturerCategories(val)"
              />
            </div>
            <div class="form-group">
              <label>Sub Category</label>
              <ModernMultiSelect 
                :options="availableManufacturerSubCategories"
                :selected="manufacturerForm.subCategories"
                placeholder="Select sub-categories..."
                @update:selected="(val) => manufacturerForm.subCategories = val"
              />
            </div>
            <div class="form-group">
              <label>Exporting?</label>
              <select v-model="manufacturerForm.exporting" class="form-select">
                <option value="">Select Yes or No</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div class="form-group">
              <label>Catalogue</label>
              <input 
                type="file" 
                @change="handleFileUpload"
                class="form-file"
                accept=".pdf,.doc,.docx"
              />
            </div>
            <div class="form-group">
              <label>No. of current distributors</label>
              <input 
                type="number" 
                v-model="manufacturerForm.currentDistributors" 
                placeholder="Enter the number of distributors"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Presence in states</label>
              <ModernMultiSelect 
                :options="filterOptions.states"
                :selected="manufacturerForm.presenceStates"
                placeholder="Select states..."
                @update:selected="(val) => updateManufacturerPresenceStates(val)"
              />
            </div>
            <div class="form-group">
              <label>Presence in districts</label>
              <ModernMultiSelect 
                :options="availableManufacturerPresenceDistricts"
                :selected="manufacturerForm.presenceDistricts"
                placeholder="Select districts..."
                @update:selected="(val) => manufacturerForm.presenceDistricts = val"
              />
            </div>
          </div>
        </div>

        <!-- Financial Stance -->
        <div class="section-card">
          <h3>Financial Stance</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Annual Revenue</label>
              <input 
                type="text"
                v-model="manufacturerForm.annualRevenue" 
                placeholder="Figures in Crs"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Listed?</label>
              <select v-model="manufacturerForm.listed" class="form-select">
                <option value="">Select Yes or No</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Expansion Appetite -->
        <div class="section-card">
          <h3>Expansion Appetite</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>No. of distributors needed</label>
              <select v-model="manufacturerForm.distributorsNeeded" class="form-select">
                <option value="">Select</option>
                <option value="1-5">1-5</option>
                <option value="6-10">6-10</option>
                <option value="11-20">11-20</option>
                <option value="20+">20+</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Distributor needed in districts</label>
              <ModernMultiSelect 
                :options="availableManufacturerDistricts"
                :selected="manufacturerForm.distributorNeededDistricts"
                placeholder="Select districts..."
                @update:selected="(val) => manufacturerForm.distributorNeededDistricts = val"
              />
            </div>
            <div class="form-group full-width">
              <label>Distributor needed in states</label>
              <ModernMultiSelect 
                :options="filterOptions.states"
                :selected="manufacturerForm.distributorNeededStates"
                placeholder="Select states..."
                @update:selected="(val) => updateManufacturerStates(val)"
              />
            </div>
          </div>
        </div>

        <!-- Desired Distributor Profile -->
        <div class="section-card">
          <h3>Desired Distributor Profile</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Minimum Order Value</label>
              <input 
                type="text" 
                v-model="manufacturerForm.minimumOrderValue" 
                placeholder="Figures in lakhs"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Margin for the distributor</label>
              <input 
                type="text" 
                v-model="manufacturerForm.distributorMargin" 
                placeholder="Enter margin percent"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Logistics</label>
              <select v-model="manufacturerForm.logistics" class="form-select">
                <option value="">Select logistics</option>
                <option value="self">Self Managed</option>
                <option value="third-party">Third Party</option>
                <option value="distributor">Distributor Managed</option>
              </select>
            </div>
            <div class="form-group">
              <label>Margin Range</label>
              <input 
                type="text" 
                v-model="manufacturerForm.marginRange" 
                placeholder="Enter margin range __% to __%"
                class="form-input"
              />
            </div>
            <div class="form-group full-width">
              <label>Warehouse space needs</label>
              <input 
                type="text" 
                v-model="manufacturerForm.warehouseSpace" 
                placeholder="Enter Space in Sq Ft."
                class="form-input"
              />
            </div>
          </div>
        </div>

      </div>

      <!-- Super Stockist / Distributor Form -->
      <div v-else class="form-section distributor-form">
        
        <!-- Contact Info -->
        <div class="section-card">
          <h3>Contact Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Salutation</label>
              <input 
                type="text" 
                v-model="distributorForm.salutation" 
                placeholder="Enter salutations"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Designation</label>
              <input 
                type="text" 
                v-model="distributorForm.designation" 
                placeholder="Enter designation"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Phone 2</label>
              <input 
                type="tel" 
                v-model="distributorForm.phone2" 
                placeholder="Enter phone number"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Name *</label>
              <input 
                type="text" 
                v-model="distributorForm.name" 
                placeholder="Enter name"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label>Mobile No.</label>
              <input 
                type="tel" 
                v-model="distributorForm.mobile" 
                placeholder="Enter mobile number"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                v-model="distributorForm.email" 
                placeholder="Enter email"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Middle Name</label>
              <input 
                type="text" 
                v-model="distributorForm.middleName" 
                placeholder="Enter middle name"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Source</label>
              <input 
                type="text" 
                v-model="distributorForm.source" 
                placeholder="Lead source"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Lead Owner</label>
              <input 
                type="text" 
                v-model="distributorForm.leadOwner" 
                placeholder="Lead owner"
                class="form-input"
                readonly
              />
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input 
                type="text" 
                v-model="distributorForm.lastName" 
                placeholder="Enter last name"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Status *</label>
              <select v-model="distributorForm.status" class="form-select" required>
                <option value="">Select Status</option>
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Company Profile -->
        <div class="section-card">
          <h3>Company Profile</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>{{ leadCategory === 'super-stockist' ? 'Super Stockist' : 'Distributor' }}? *</label>
              <select v-model="distributorForm.type" class="form-select" required>
                <option value="">Select</option>
                <option value="super-stockist">Super Stockist</option>
                <option value="distributor">Distributor</option>
              </select>
            </div>
            <div class="form-group">
              <label>Staff Strength</label>
              <select v-model="distributorForm.staffStrength" class="form-select">
                <option value="">Select</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-100">51-100</option>
                <option value="100+">100+</option>
              </select>
            </div>
            <div class="form-group">
              <label>Company Name *</label>
              <input 
                type="text" 
                v-model="distributorForm.companyName" 
                placeholder="Enter company name as per GST"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label>No. of brands dealing with currently</label>
              <select v-model="distributorForm.brandsCount" class="form-select">
                <option value="">Select</option>
                <option value="1-5">1-5</option>
                <option value="6-10">6-10</option>
                <option value="11-20">11-20</option>
                <option value="20+">20+</option>
              </select>
            </div>
            <div class="form-group">
              <label>Website</label>
              <input 
                type="url" 
                v-model="distributorForm.website" 
                placeholder="Enter website"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Manufacturer's States</label>
              <input 
                type="text" 
                v-model="distributorForm.manufacturerStates" 
                placeholder="Select the states from where your are currently sourcing"
                class="form-input"
              />
            </div>
            <div class="form-group full-width">
              <label>Category</label>
              <ModernMultiSelect 
                :options="filterOptions.categories"
                :selected="distributorForm.categories"
                placeholder="Select categories..."
                @update:selected="(val) => updateDistributorCategories(val)"
              />
            </div>
            <div class="form-group full-width">
              <label>Sub Category</label>
              <ModernMultiSelect 
                :options="availableDistributorSubCategories"
                :selected="distributorForm.subCategories"
                placeholder="Select sub-categories..."
                @update:selected="(val) => distributorForm.subCategories = val"
              />
            </div>
            <div class="form-group full-width">
              <label>Manufacturer's Districts</label>
              <input 
                type="text" 
                v-model="distributorForm.manufacturerDistricts" 
                placeholder="Enter districts"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- Address Section -->
        <div class="section-card">
          <h3>Address</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Address</label>
              <textarea 
                v-model="addressForm.streetAddress" 
                placeholder="Enter Door No. and Area Name"
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Pincode *</label>
              <input 
                type="text" 
                v-model="addressForm.pincode" 
                @blur="fetchLocationData"
                placeholder="Enter Pincode"
                class="form-input"
                maxlength="6"
                required
              />
            </div>
            <div class="form-group">
              <label>City</label>
              <input 
                type="text" 
                v-model="addressForm.city" 
                placeholder="Enter City"
                class="form-input"
                :readonly="isLocationAutoFilled"
              />
            </div>
            <div class="form-group">
              <label>District</label>
              <input 
                type="text" 
                v-model="addressForm.district" 
                placeholder="Enter District"
                class="form-input"
                :readonly="isLocationAutoFilled"
              />
            </div>
            <div class="form-group">
              <label>State</label>
              <input 
                type="text" 
                v-model="addressForm.state" 
                placeholder="Enter State"
                class="form-input"
                :readonly="isLocationAutoFilled"
              />
            </div>
          </div>
        </div>

        <!-- Operational Information -->
        <div class="section-card">
          <h3>Operational Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Which accounting system you are using?</label>
              <input 
                type="text" 
                v-model="distributorForm.accountingSystem" 
                placeholder="Enter accounting system"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Willingness to bear logistics</label>
              <select v-model="distributorForm.logisticsWillingness" class="form-select">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div class="form-group">
              <label>Which app you are using for SFA?</label>
              <input 
                type="text" 
                v-model="distributorForm.sfaApp" 
                placeholder="Enter SFA app"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>No. of warehouses you have</label>
              <select v-model="distributorForm.warehouseCount" class="form-select">
                <option value="">Select</option>
                <option value="1">1</option>
                <option value="2-5">2-5</option>
                <option value="6-10">6-10</option>
                <option value="10+">10+</option>
              </select>
            </div>
            <div class="form-group">
              <label>Which app you are using for DMS?</label>
              <input 
                type="text" 
                v-model="distributorForm.dmsApp" 
                placeholder="Enter DMS app"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Total space in Sq ft.</label>
              <input 
                type="text" 
                v-model="distributorForm.totalSpace" 
                placeholder="Enter total space"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Which Warehouse management system you are using?</label>
              <input 
                type="text" 
                v-model="distributorForm.warehouseManagementSystem" 
                placeholder="Enter warehouse management system"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Count of field sales force</label>
              <select v-model="distributorForm.salesForceCount" class="form-select">
                <option value="">Select</option>
                <option value="1-5">1-5</option>
                <option value="6-10">6-10</option>
                <option value="11-20">11-20</option>
                <option value="20+">20+</option>
              </select>
            </div>
            <div class="form-group">
              <label>Do you have your own sales force?</label>
              <select v-model="distributorForm.ownSalesForce" class="form-select">
                <option value="">Select Yes or No</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Expansion Appetite -->
        <div class="section-card">
          <h3>Expansion Appetite</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Categories interested in</label>
              <ModernMultiSelect 
                :options="filterOptions.categories"
                :selected="distributorForm.categoriesInterested"
                placeholder="Select categories..."
                @update:selected="(val) => distributorForm.categoriesInterested = val"
              />
            </div>
            <div class="form-group">
              <label>Need manufacturers from States</label>
              <ModernMultiSelect 
                :options="filterOptions.states"
                :selected="distributorForm.needManufacturerStates"
                placeholder="Select states..."
                @update:selected="(val) => updateDistributorNeededStates(val)"
              />
            </div>
            <div class="form-group">
              <label>Interested in dealing in how many new brands</label>
              <select v-model="distributorForm.newBrandsInterest" class="form-select">
                <option value="">Select</option>
                <option value="1-2">1-2</option>
                <option value="3-5">3-5</option>
                <option value="6-10">6-10</option>
                <option value="10+">10+</option>
              </select>
            </div>
            <div class="form-group">
              <label>Need manufacturers from Districts</label>
              <ModernMultiSelect 
                :options="availableDistributorNeededDistricts"
                :selected="distributorForm.needManufacturerDistricts"
                placeholder="Select districts..."
                @update:selected="(val) => distributorForm.needManufacturerDistricts = val"
              />
            </div>
          </div>
        </div>

        <!-- Financial Stance -->
        <div class="section-card">
          <h3>Financial Stance</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Distributor Annual Revenue</label>
              <input 
                type="text" 
                v-model="distributorForm.annualRevenue" 
                placeholder="Figures in Lakhs"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Margin % range from current brands</label>
              <input 
                type="text" 
                v-model="distributorForm.marginRange" 
                placeholder="Enter Min__ and Max__"
                class="form-input"
              />
            </div>
          </div>
        </div>

      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn-navigate" @click="navigateToDashboard">
          Go to Dashboard
        </button>
        <button type="button" class="btn-secondary" @click="resetForm">
          Reset Form
        </button>
        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Saving...' : 'Save Lead' }}
        </button>
      </div>

    </form>

    <!-- Loading Overlay -->
    <div v-if="isLoadingLocation" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Fetching location data...</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBusinessLogic } from '../composables/useBusinessLogic'
import ModernMultiSelect from '../components/ModernMultiSelect.vue'
import { filterOptions, locationMapping, industryToCategoryMapping } from '../data/mockData'
import { apiService, type LeadData } from '../services/api'

const router = useRouter()
const { manufacturers, distributors } = useBusinessLogic()

// Form state
const leadCategory = ref<'manufacturer' | 'super-stockist' | 'distributor'>('manufacturer')
const isSubmitting = ref(false)
const isLoadingLocation = ref(false)
const isLocationAutoFilled = ref(false)

// Address form (common across all types)
const addressForm = reactive({
  streetAddress: '',
  pincode: '',
  city: '',
  district: '',
  state: ''
})

// Manufacturer form
const manufacturerForm = reactive({
  salutation: '',
  designation: '',
  phone2: '',
  name: '',
  mobile: '',
  email: '',
  companyName: '',
  staffStrength: '',
  brandName1: '',
  inspirational: '',
  brandName2: '',
  brandName3: '',
  categories: [] as string[],
  subCategories: [] as string[],
  exporting: '',
  currentDistributors: '',
  presenceStates: [] as string[],
  presenceDistricts: [] as string[],
  annualRevenue: '',
  listed: '',
  distributorsNeeded: '',
  distributorNeededDistricts: [] as string[],
  distributorNeededStates: [] as string[],
  minimumOrderValue: '',
  distributorMargin: '',
  logistics: '',
  marginRange: '',
  warehouseSpace: ''
})

// Distributor/Super Stockist form
const distributorForm = reactive({
  salutation: '',
  designation: '',
  phone2: '',
  name: '',
  mobile: '',
  email: '',
  middleName: '',
  source: '',
  leadOwner: 'ganesh.t@qunovatec.com',
  lastName: '',
  status: '',
  type: '',
  staffStrength: '',
  companyName: '',
  brandsCount: '',
  website: '',
  manufacturerStates: '',
  categories: [] as string[],
  subCategories: [] as string[],
  manufacturerDistricts: '',
  accountingSystem: '',
  logisticsWillingness: '',
  sfaApp: '',
  warehouseCount: '',
  dmsApp: '',
  totalSpace: '',
  warehouseManagementSystem: '',
  salesForceCount: '',
  ownSalesForce: '',
  categoriesInterested: [] as string[],
  needManufacturerStates: [] as string[],
  newBrandsInterest: '',
  needManufacturerDistricts: [] as string[],
  annualRevenue: '',
  marginRange: ''
})

// Computed properties for dependent dropdowns
const availableManufacturerSubCategories = computed(() => {
  if (manufacturerForm.categories.length > 0) {
    const relatedSubCategories = new Set<string>()
    manufacturerForm.categories.forEach(category => {
      const subCategories = industryToCategoryMapping[category]
      if (subCategories) {
        subCategories.forEach(subCategory => relatedSubCategories.add(subCategory))
      }
    })
    return Array.from(relatedSubCategories)
  }
  return filterOptions.subCategories
})

const availableManufacturerDistricts = computed(() => {
  if (manufacturerForm.distributorNeededStates.length > 0) {
    const relatedDistricts = new Set<string>()
    manufacturerForm.distributorNeededStates.forEach((state: string) => {
      const mapping = locationMapping[state as keyof typeof locationMapping]
      if (mapping) {
        mapping.districts.forEach((district: string) => relatedDistricts.add(district))
      }
    })
    return Array.from(relatedDistricts)
  }
  return filterOptions.districts
})

const availableManufacturerPresenceDistricts = computed(() => {
  if (manufacturerForm.presenceStates.length > 0) {
    const relatedDistricts = new Set<string>()
    manufacturerForm.presenceStates.forEach((state: string) => {
      const mapping = locationMapping[state as keyof typeof locationMapping]
      if (mapping) {
        mapping.districts.forEach((district: string) => relatedDistricts.add(district))
      }
    })
    return Array.from(relatedDistricts)
  }
  return filterOptions.districts
})

const availableDistributorSubCategories = computed(() => {
  if (distributorForm.categories.length > 0) {
    const relatedSubCategories = new Set<string>()
    distributorForm.categories.forEach(category => {
      const subCategories = industryToCategoryMapping[category]
      if (subCategories) {
        subCategories.forEach(subCategory => relatedSubCategories.add(subCategory))
      }
    })
    return Array.from(relatedSubCategories)
  }
  return filterOptions.subCategories
})

const availableDistributorNeededDistricts = computed(() => {
  if (distributorForm.needManufacturerStates.length > 0) {
    const relatedDistricts = new Set<string>()
    distributorForm.needManufacturerStates.forEach((state: string) => {
      const mapping = locationMapping[state as keyof typeof locationMapping]
      if (mapping) {
        mapping.districts.forEach((district: string) => relatedDistricts.add(district))
      }
    })
    return Array.from(relatedDistricts)
  }
  return filterOptions.districts
})

// Methods for handling dependent updates
const updateManufacturerCategories = (categories: string[]) => {
  manufacturerForm.categories = categories
  // Clear sub-categories when categories change
  manufacturerForm.subCategories = []
}

const updateManufacturerStates = (states: string[]) => {
  manufacturerForm.distributorNeededStates = states
  // Clear districts when states change
  manufacturerForm.distributorNeededDistricts = []
}

const updateManufacturerPresenceStates = (states: string[]) => {
  manufacturerForm.presenceStates = states
  // Clear districts when states change
  manufacturerForm.presenceDistricts = []
}

const updateDistributorCategories = (categories: string[]) => {
  distributorForm.categories = categories
  // Clear sub-categories when categories change
  distributorForm.subCategories = []
}

const updateDistributorNeededStates = (states: string[]) => {
  distributorForm.needManufacturerStates = states
  // Clear districts when states change
  distributorForm.needManufacturerDistricts = []
}

// Methods
const fetchLocationData = async () => {
  const pincode = addressForm.pincode.trim()
  
  if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return
  }

  isLoadingLocation.value = true
  isLocationAutoFilled.value = false

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    const data = await response.json()
    
    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
      const postOffice = data[0].PostOffice[0]
      
      addressForm.city = postOffice.Name || postOffice.Block || ''
      addressForm.district = postOffice.District || ''
      addressForm.state = postOffice.State || ''
      
      isLocationAutoFilled.value = true
    } else {
      // Reset fields if no data found
      addressForm.city = ''
      addressForm.district = ''
      addressForm.state = ''
      alert('Invalid pincode or location data not found')
    }
  } catch (error) {
    console.error('Error fetching location data:', error)
    alert('Error fetching location data. Please enter manually.')
  } finally {
    isLoadingLocation.value = false
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    // Handle file upload logic here
    console.log('File uploaded:', target.files[0].name)
  }
}

const resetForm = () => {
  // Reset address form
  Object.keys(addressForm).forEach(key => {
    (addressForm as any)[key] = ''
  })
  
  // Reset manufacturer form
  Object.keys(manufacturerForm).forEach(key => {
    if (Array.isArray((manufacturerForm as any)[key])) {
      (manufacturerForm as any)[key] = []
    } else {
      (manufacturerForm as any)[key] = ''
    }
  })
  
  // Reset distributor form
  Object.keys(distributorForm).forEach(key => {
    if (key === 'leadOwner') {
      (distributorForm as any)[key] = 'ganesh.t@qunovatec.com'
    } else if (Array.isArray((distributorForm as any)[key])) {
      (distributorForm as any)[key] = []
    } else {
      (distributorForm as any)[key] = ''
    }
  })
  
  isLocationAutoFilled.value = false
}

const navigateToDashboard = () => {
  router.push('/dashboard')
}

// Form validation helper
const validateForm = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Common validations
  if (!addressForm.pincode || addressForm.pincode.length !== 6) {
    errors.push('Valid 6-digit pincode is required')
  }

  if (!addressForm.city.trim()) {
    errors.push('City is required')
  }

  if (!addressForm.state.trim()) {
    errors.push('State is required')
  }

  if (leadCategory.value === 'manufacturer') {
    if (!manufacturerForm.name.trim()) {
      errors.push('Contact name is required')
    }
    if (!manufacturerForm.companyName.trim()) {
      errors.push('Company name is required')
    }
    if (manufacturerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manufacturerForm.email)) {
      errors.push('Valid email address is required')
    }
    if (manufacturerForm.mobile && !/^[6-9]\d{9}$/.test(manufacturerForm.mobile)) {
      errors.push('Valid 10-digit mobile number is required')
    }
  } else {
    if (!distributorForm.name.trim()) {
      errors.push('Contact name is required')
    }
    if (!distributorForm.companyName.trim()) {
      errors.push('Company name is required')
    }
    if (!distributorForm.status) {
      errors.push('Status is required')
    }
    if (!distributorForm.type) {
      errors.push('Distributor type is required')
    }
    if (distributorForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(distributorForm.email)) {
      errors.push('Valid email address is required')
    }
    if (distributorForm.mobile && !/^[6-9]\d{9}$/.test(distributorForm.mobile)) {
      errors.push('Valid 10-digit mobile number is required')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Submit form
const submitForm = async () => {
  isSubmitting.value = true
  
  try {
    // Validate required fields
    const { isValid, errors } = validateForm()
    if (!isValid) {
      alert(`Please fix the following errors:\n- ${errors.join('\n- ')}`)
      return
    }

    // Prepare lead data for API
    const leadData: LeadData = {
      leadCategory: leadCategory.value,
      contactInfo: {
        salutation: leadCategory.value === 'manufacturer' ? manufacturerForm.salutation : distributorForm.salutation,
        name: leadCategory.value === 'manufacturer' ? manufacturerForm.name : distributorForm.name,
        designation: leadCategory.value === 'manufacturer' ? manufacturerForm.designation : distributorForm.designation,
        mobile: leadCategory.value === 'manufacturer' ? manufacturerForm.mobile : distributorForm.mobile,
        email: leadCategory.value === 'manufacturer' ? manufacturerForm.email : distributorForm.email,
        phone2: leadCategory.value === 'manufacturer' ? manufacturerForm.phone2 : distributorForm.phone2,
        ...(leadCategory.value !== 'manufacturer' && {
          middleName: distributorForm.middleName,
          lastName: distributorForm.lastName,
        }),
      },
      companyInfo: {
        companyName: leadCategory.value === 'manufacturer' ? manufacturerForm.companyName : distributorForm.companyName,
        staffStrength: leadCategory.value === 'manufacturer' ? manufacturerForm.staffStrength : distributorForm.staffStrength,
        ...(leadCategory.value !== 'manufacturer' && {
          website: distributorForm.website,
          type: distributorForm.type,
          status: distributorForm.status,
          source: distributorForm.source,
          leadOwner: distributorForm.leadOwner,
        }),
      },
      address: {
        streetAddress: addressForm.streetAddress,
        pincode: addressForm.pincode,
        city: addressForm.city,
        district: addressForm.district,
        state: addressForm.state,
      },
      businessInfo: {
        categories: leadCategory.value === 'manufacturer' ? manufacturerForm.categories : distributorForm.categories,
        subCategories: leadCategory.value === 'manufacturer' ? manufacturerForm.subCategories : distributorForm.subCategories,
        ...(leadCategory.value === 'manufacturer' ? {
          // Manufacturer specific fields
          brandNames: [manufacturerForm.brandName1, manufacturerForm.brandName2, manufacturerForm.brandName3].filter(Boolean),
          exporting: manufacturerForm.exporting,
          currentDistributors: manufacturerForm.currentDistributors,
          presenceStates: manufacturerForm.presenceStates,
          presenceDistricts: manufacturerForm.presenceDistricts,
          annualRevenue: manufacturerForm.annualRevenue,
          listed: manufacturerForm.listed,
          distributorsNeeded: manufacturerForm.distributorsNeeded,
          distributorNeededStates: manufacturerForm.distributorNeededStates,
          distributorNeededDistricts: manufacturerForm.distributorNeededDistricts,
          minimumOrderValue: manufacturerForm.minimumOrderValue,
          distributorMargin: manufacturerForm.distributorMargin,
          logistics: manufacturerForm.logistics,
          marginRange: manufacturerForm.marginRange,
          warehouseSpace: manufacturerForm.warehouseSpace,
          inspirational: manufacturerForm.inspirational,
        } : {
          // Distributor specific fields
          brandsCount: distributorForm.brandsCount,
          manufacturerStates: distributorForm.manufacturerStates,
          manufacturerDistricts: distributorForm.manufacturerDistricts,
          accountingSystem: distributorForm.accountingSystem,
          logisticsWillingness: distributorForm.logisticsWillingness,
          sfaApp: distributorForm.sfaApp,
          warehouseCount: distributorForm.warehouseCount,
          dmsApp: distributorForm.dmsApp,
          totalSpace: distributorForm.totalSpace,
          warehouseManagementSystem: distributorForm.warehouseManagementSystem,
          salesForceCount: distributorForm.salesForceCount,
          ownSalesForce: distributorForm.ownSalesForce,
          categoriesInterested: distributorForm.categoriesInterested,
          needManufacturerStates: distributorForm.needManufacturerStates,
          needManufacturerDistricts: distributorForm.needManufacturerDistricts,
          newBrandsInterest: distributorForm.newBrandsInterest,
        }),
      },
    }

    const erpLeadObj = {
      // =======
      // Manufacturer
      // =======

      // Contact Details
      custom_lead_category: leadCategory.value == 'manufacturer' ? 'Manufacturer Lead': 'SS / Distributor Lead',
      salutation: leadData.contactInfo.salutation,
      job_title: leadData.contactInfo.designation,
      phone: leadData.contactInfo.phone2,
      first_name: leadData.contactInfo.name,
      mobile_no: leadData.contactInfo.mobile,
      email_id: leadData.contactInfo.email,

      // Company profile
      company_name: leadData.companyInfo.companyName,
      no_of_employees: leadData.companyInfo.staffStrength,
      custom_brand_name: leadCategory.value === 'manufacturer' ? manufacturerForm.companyName : distributorForm.companyName,
      custom_brand_name_2: leadCategory.value === 'manufacturer' ? manufacturerForm.brandName2 : '',
      custom_brand_name_3: leadCategory.value === 'manufacturer' ? manufacturerForm.brandName3 : '',
      custom_inspirational: leadCategory.value === 'manufacturer' ? manufacturerForm.inspirational : '',

      // Address
      custom_address: leadData.address.streetAddress,
      custom_pincode: leadData.address.pincode,
      city: leadData.address.city,
      custom_districts: leadData.address.district,
      custom_states: leadData.address.state,

      // Presense

      // Financial Stance
      annual_revenue: leadCategory.value === 'manufacturer' ? manufacturerForm.annualRevenue : distributorForm.annualRevenue,
      custom_listed: leadCategory.value === 'manufacturer' ? manufacturerForm.listed : '',

      // Expansion Appetite

      // Desired Distributor Profile
      custom_minimum_order_value: leadCategory.value === 'manufacturer' ? manufacturerForm.minimumOrderValue : '',
      custom_logistics: leadCategory.value === 'manufacturer' ? manufacturerForm.logistics : '',
      custom_warehouse_needs: leadCategory.value === 'manufacturer' ? manufacturerForm.warehouseSpace : '',
      custom_margin_for_the_distributor: leadCategory.value === 'manufacturer' ? manufacturerForm.distributorMargin : '',
      custom_margin_range: leadCategory.value === 'manufacturer' ? manufacturerForm.marginRange : '',
      
      // =======
      // Distributor
      // =======

      // Contact Info
      middle_name: leadData.contactInfo.middleName || '',
      last_name: leadData.contactInfo.lastName || '',
      source: distributorForm.source || '',

      // Company Profile
      custom_super_stockiest_or_distributor: leadCategory.value === 'super-stockist' ? 'Super Stockiest' : leadCategory.value === 'distributor' ? 'Distributor' : '',
      custom_staff_strength_copy: leadData.companyInfo.staffStrength,
      custom_distributor_company_name: leadData.companyInfo.companyName,
      custom_no_of_brands_dealing_with_currently: distributorForm.brandsCount,
      website: leadData.companyInfo.website || '',
      // ignoring manufacturerStates, category, district for distributor

      // Operational Information
      custom_which_accounting_system_you_are_using: leadData.businessInfo.accountingSystem || '',
      custom_which_app_you_are_using_for_sfa: leadData.businessInfo.sfaApp || '',
      custom_which_app_you_are_using_for_dms: leadData.businessInfo.dmsApp || '',
      custom_which_warehouse_management_system_you_are_using_: leadData.businessInfo.warehouseManagementSystem || '',
      custom_do_you_have_your_own_sales_force: leadData.businessInfo.ownSalesForce || '',
      custom_ready_to_bear_logistics: leadData.businessInfo.logisticsWillingness || '',
      custom_no_of_warehouses_you_have: leadData.businessInfo.warehouseCount || '',
      custom_total_space_in_sq_ft: leadData.businessInfo.totalSpace || '',
      custom_count_of_field_sales_force: leadData.businessInfo.salesForceCount || '',
    }

    console.log('Submitting lead data:', leadData)
    // Send ERP Lead Object to Frappe backend
    try {
      const response = await fetch('/api/resource/Lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Frappe-CSRF-Token': (window as any).frappe?.csrf_token || ''
      },
      body: JSON.stringify(erpLeadObj)
      })
      const data = await response.json()
      console.info('ERP Lead API response:', data)
      if (data && data.data && !data.exc) {
      router.push('/dashboard')
      return
      }
    } catch (err) {
      console.error('Error posting ERP Lead:', err)
    }

    return
    // Make API call to save lead
    const response = await apiService.saveLead(leadData)

    if (response.success) {
      // Success - show success message and redirect
      alert(`${leadCategory.value === 'manufacturer' ? 'Manufacturer' : 'Distributor'} lead saved successfully!`)
      
      // Optionally update local state for immediate UI updates
      if (leadCategory.value === 'manufacturer') {
        const newManufacturer = {
          id: response.data?.id || `M${Date.now()}`,
          name: manufacturerForm.companyName || manufacturerForm.name,
          city: addressForm.city,
          district: addressForm.district,
          state: addressForm.state,
          category: manufacturerForm.categories[0] || 'General',
          subCategory: manufacturerForm.subCategories[0] || 'General',
          status: 'Registration' as const,
          registrationDate: new Date().toISOString(),
          daysSinceStatus: 0,
        }
        manufacturers.value.push(newManufacturer)
      } else {
        const newDistributor = {
          id: response.data?.id || `D${Date.now()}`,
          name: distributorForm.companyName || distributorForm.name,
          city: addressForm.city,
          district: addressForm.district,
          state: addressForm.state,
          category: distributorForm.categories[0] || 'General',
          subCategory: distributorForm.subCategories[0] || 'General',
          status: 'Registration' as const,
          registrationDate: new Date().toISOString(),
          daysSinceStatus: 0,
        }
        distributors.value.push(newDistributor)
      }
      
      // Reset form and redirect
      resetForm()
      router.push('/dashboard')
      
    } else {
      // Error - show error message
      const errorMessage = response.message || 'Failed to save lead'
      const errors = response.errors?.join(', ') || ''
      alert(`Error: ${errorMessage}${errors ? `\nDetails: ${errors}` : ''}`)
      console.error('API Error:', response)
    }
    
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('Network error occurred. Please check your connection and try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.registration-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background: #f5f5f7;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.page-header p {
  color: #86868b;
  font-size: 18px;
  font-weight: 300;
}

.lead-category-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #d2d2d7;
}

.lead-category-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 20px 0;
}

.category-toggle {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #f5f5f7;
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  transition: all 0.3s ease;
  min-width: 160px;
  justify-content: center;
  min-height: 40px;
}

.category-btn:hover {
  background: #e8e8ed;
  transform: translateY(-2px);
}

.category-btn.active {
  background: #1c1c1e;
  color: white;
  border-color: #1c1c1e;
  box-shadow: 0 4px 12px rgba(28, 28, 30, 0.3);
}

.category-icon {
  font-size: 18px;
}

.registration-form {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #d2d2d7;
}

.section-card {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f2f2f7;
}

.section-card:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f5f5f7;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
  margin-bottom: 4px;
}

.form-input,
.form-select,
.form-textarea {
  padding: 6px 10px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  color: #1d1d1f;
  background: white;
  transition: all 0.2s ease;
  font-family: inherit;
  min-height: 32px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #1c1c1e;
  box-shadow: 0 0 0 3px rgba(28, 28, 30, 0.1);
}

.form-input:readonly {
  background: #f5f5f7;
  color: #86868b;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
  line-height: 1.4;
}

.form-file {
  padding: 4px 8px;
  border: 2px dashed #d2d2d7;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 32px;
  display: flex;
  align-items: center;
}

.form-file:hover {
  border-color: #1c1c1e;
  background: #f5f5f7;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f2f2f7;
}

.btn-primary,
.btn-secondary,
.btn-navigate {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 100px;
  min-height: 36px;
}

.btn-primary {
  background: #1c1c1e;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #000000;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #86868b;
  cursor: not-allowed;
  transform: none;
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

.btn-navigate {
  background: #1c1c1e;
  color: white;
}

.btn-navigate:hover {
  background: #000000;
  transform: translateY(-1px);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  font-size: 16px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .registration-page {
    padding: 16px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .page-header p {
    font-size: 16px;
  }
  
  .category-toggle {
    flex-direction: column;
    gap: 8px;
  }
  
  .category-btn {
    min-width: auto;
    width: 100%;
  }
  
  .registration-form {
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
  
  .section-card {
    margin-bottom: 24px;
  }
  
  .section-card h3 {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .registration-page {
    padding: 12px;
  }
  
  .lead-category-section,
  .registration-form {
    padding: 16px;
  }
  
  .form-input,
  .form-select,
  .form-textarea {
    font-size: 14px;
    padding: 6px 10px;
    min-height: 32px;
  }
  
  .category-btn {
    padding: 8px 14px;
    font-size: 14px;
    min-height: 36px;
  }
  
  .btn-primary,
  .btn-secondary,
  .btn-navigate {
    padding: 6px 16px;
    font-size: 14px;
    min-height: 32px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>