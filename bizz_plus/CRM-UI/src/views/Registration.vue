<template>
  <div class="registration-page">
    <div class="page-header">
      <h1>{{ props.lead ? "Update Lead" : "New Lead Registration" }}</h1>
      <p>{{ props.lead ? "Update the lead in the system" : "Register a new lead in the system" }}</p>
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
              <select 
                v-model="manufacturerForm.custom_salutations" 
                class="form-input"
              >
                <option value="">Select</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Miss">Miss</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
              </select>
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
              <label>PAN Number</label>
              <input 
                type="tel" 
                v-model="manufacturerForm.phone2" 
                placeholder="Enter PAN number"
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
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1000+">1000+</option>
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
              <label>Website Link</label>
              <input 
                type="text" 
                v-model="manufacturerForm.brandName2" 
                placeholder="Enter Website Link"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>GST</label>
              <input 
                type="text" 
                v-model="manufacturerForm.brandName3" 
                placeholder="Enter GST Number"
                class="form-input"
              />
            </div>
            <div class="form-group">
  <label>Minimum Investment Capacity (₹)</label>
  <input 
    type="number" 
    v-model="manufacturerForm.investmentCapacityMin" 
    placeholder="Enter minimum investment amount"
    class="form-input"
    min="0"
  />
</div>

<!-- Investment Capacity Max -->
<div class="form-group">
  <label>Maximum Investment Capacity (₹)</label>
  <input 
    type="number" 
    v-model="manufacturerForm.investmentCapacityMax" 
    placeholder="Enter maximum investment amount"
    class="form-input"
    min="0"
  />
</div>

<!-- Credit Period Required -->
<div class="form-group">
  <label>Credit Period Required (days)</label>
  <input 
    type="number" 
    v-model="manufacturerForm.creditPeriodRequired" 
    placeholder="Enter credit period required"
    class="form-input"
    min="0"
  />
</div>
            <div class="form-group">
  <label>Sales Support Provided</label>
  <select v-model="manufacturerForm.salesSupport" class="form-select">
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
    <option value="Partial">Partial</option>
  </select>
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
                :options="categories"
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
                <option value="Yes">Yes</option>
                <option value="No">No</option>
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
                <option value="Yes">Yes</option>
                <option value="No">No</option>
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
                <option value="1">1</option>
                 <option value="2">2</option>
                  <option value="3">3</option>
                   <option value="4">4</option>
                    <option value="5">5</option>
                     <option value="6">6</option>
                      <option value="7">7</option>
                       <option value="8">8</option>
                        <option value="9">9</option>
                         <option value="10">10</option>

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
                <option value="Borne by us">Borne by us</option>
                <option value="Borne by distributor">Borne by distributor</option>
              </select>
            </div>
            <div class="form-group">
              <label> Minimum Margin Range(%)</label>
              <input 
                type="text" 
                v-model="manufacturerForm.marginRange" 
                placeholder="Enter  Minimum margin "
                class="form-input"
              />
            </div>
            <div class="form-group">
  <label>Maximum Margin Range (%)</label>
  <input 
    type="number"
    v-model="manufacturerForm.maxMarginRange"
    placeholder="Enter maximum margin"
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
 
            <div class="section-card">

  <div class="form-grid two-cols">
    <!-- Status Dropdown -->
    <div class="form-group" v-if="leadCategory === 'manufacturer'">
      <label>Status *</label>
      <select v-model="manufacturerForm.status" class="form-select" required>
        <option value="">Select Status</option>
        <option value="Open">Open</option>
        <option value="Replied">Replied</option>
        <option value="Opportunity">Opportunity</option>
        <option value="Verified">Verified</option>
      </select>
    </div>

    <!-- File Upload
    <div class="form-group">
      <label>Upload Agreement</label>
      <input 
        type="file"
        class="form-file"
        accept=".pdf,.doc,.docx"
        @change="handleAgreementUpload"
      />
    </div> -->
      <div class="form-group" v-if="manufacturerForm.status == 'Verified' && !manufacturerForm.fileUploaded">
      <label>Agreement *</label>
      <div class="file-upload-area">
        <input 
          type="file" 
          @change="handleManufacturerFileUpload"
          accept=".pdf,.jpg,.png"
          
          :required="!manufacturerForm.fileUploaded"
          class="file-input-hidden"
          id="document-upload"
          
        >
      </div>
      <div v-if="selectedManufacturerFile" class="selected-file">
        <span class="file-name">{{ selectedManufacturerFile.name }}</span>
        <button @click="selectedManufacturerFile = null" class="btn-remove-file">×</button>
      </div>

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
          <select 
            v-model="distributorForm.custom_salutations" 
            class="form-input"
          >
            <option value="">Select</option>
            <option value="Mr.">Mr.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Miss">Miss</option>
            <option value="Dr.">Dr.</option>
            <option value="Prof.">Prof.</option>
          </select>
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
            <!-- <div class="form-group">
              <label>Status *</label>
              <select v-model="distributorForm.status" class="form-select" required>
                <option value="">Select Status</option>
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="customer">Customer</option>
              </select>
            </div> -->
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
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1000+">1000+</option>
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
  <label>GST</label>
  <input 
    type="text" 
    v-model="distributorForm.gstNumber" 
    placeholder="Enter GST Number"
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
                :options="categories"
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
            <div class="form-group">
  <label>Minimum Investment Capacity (in ₹)</label>
  <input 
    type="number" 
    v-model="distributorForm.investmentCapacityMin" 
    placeholder="Enter minimum investment amount"
    class="form-input"
    min="0"
  />
</div>
<div class="form-group">
  <label>Maximum Investment Capacity (₹)</label>
  <input 
    type="number"
    min="0"
    v-model="distributorForm.investmentCapacityMax"
    placeholder="Enter maximum investment amount"
    class="form-input"
  />
</div>
<div class="form-group">
  <label>Credit Period Required (in days)</label>
  <input 
    type="number"
    min="0"
    v-model="distributorForm.creditPeriodRequired"
    placeholder="e.g., 30"
    class="form-input"
  />
</div>
<div class="form-group">
  <label>Sales Support Provided</label>
  <select v-model="distributorForm.salesSupport" class="form-select">
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
    <option value="Partial">Partial</option>
  </select>
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
              <select v-model="distributorForm.logisticsWillingness" class="form-select" placeholder="Willingness to bear logistics?">
                 <option value="">Select Yes or No</option>
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
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="More than 5">More than 5</option>
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
                <option value="Yes">Yes</option>
                <option value="No">No</option>
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
                :options="categories"
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
              <label> Minimum Margin % range from current brands</label>
              <input 
                type="text" 
                v-model="distributorForm.marginRange" 
                placeholder="Enter Min__ and Max__"
                class="form-input"
              />
            </div>
            <div class="form-group">
  <label>Maximum Margin % from Current Brands</label>
  <input 
    type="number" 
    v-model="distributorForm.maxMarginRange" 
    placeholder="Enter maximum margin %" 
    class="form-input"
  />
</div>
          </div>
        </div>
        <div class="section-card">

  <div class="form-grid two-cols">
    
    <!-- Status Dropdown -->
    <div class="form-group">
      <label>Status *</label>
       <select v-model="distributorForm.status" class="form-select" required>
        <option value="">Select Status</option>
        <option value="Open">Open</option>
        <option value="Replied">Replied</option>
        <option value="Opportunity">Opportunity</option>
        <option value="Verified">Verified</option>
      </select>
    </div>

    <!-- Agreement Upload -->
    <div class="form-group" v-if="distributorForm.status == 'Verified' && !distributorForm.fileUploaded">
      <label>Agreement *</label>
      <div class="file-upload-area">
        <input 
          type="file" 
          @change="handleDistributorFileUpload"
          accept=".pdf,.jpg,.png"
          
          :required="!distributorForm.fileUploaded"
          class="file-input-hidden"
          id="document-upload"
          
        >
      </div>
      <div v-if="selectedDistributorFile" class="selected-file">
        <span class="file-name">{{ selectedDistributorFile.name }}</span>
        <button @click="selectedDistributorFile = null" class="btn-remove-file">×</button>
      </div>

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
          {{ props.lead ? "Update" : "Register" }}
        </button>
      </div>

    </form>

    <!-- Loading Overlay -->
    <div v-if="isLoadingLocation" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Fetching location data...</p>
    </div>

    <!-- Custom Alert -->
    <CustomAlert
      :isVisible="alertState.isVisible"
      :type="alertState.type"
      :title="alertState.title"
      :message="alertState.message"
      :confirmText="alertState.confirmText"
      :cancelText="alertState.cancelText"
      :showCancel="alertState.showCancel"
      :closeOnOverlayClick="alertState.closeOnOverlayClick"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBusinessLogic } from '../composables/useBusinessLogic'
import { useAlert } from '../composables/useAlert'
import ModernMultiSelect from '../components/ModernMultiSelect.vue'
import CustomAlert from '../components/CustomAlert.vue'
import { filterOptions, locationMapping, industryToCategoryMapping } from '../data/mockData'
import { apiService, type LeadData } from '../services/api'

const router = useRouter()
const { manufacturers, distributors } = useBusinessLogic()
const { alertState, showError, showSuccess, handleConfirm, handleCancel } = useAlert()
const selectedDistributorFile = ref<File | null>(null);
const selectedManufacturerFile = ref<File | null>(null);

// Form state
const leadCategory = ref<'manufacturer' | 'super-stockist' | 'distributor'>('manufacturer')
const isSubmitting = ref(false)
const isLoadingLocation = ref(false)
const isLocationAutoFilled = ref(false)

const props = defineProps<{
  lead: string;
}>();

// Categories state
const categories = ref<string[]>([])
const isLoadingCategories = ref(false)

// Fetch categories from Category doctype
const fetchCategories = async () => {
  try {
    isLoadingCategories.value = true
    const response = await fetch('/api/resource/Category?fields=["name","category_name"]')
    if (!response.ok) {
      throw new Error('Failed to fetch categories')
    }
    const data = await response.json()
    // Transform the response to extract category names
    categories.value = data.data.map((cat: any) => cat.category_name || cat.name)
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Fallback to static categories if API fails
    categories.value = filterOptions.categories
  } finally {
    isLoadingCategories.value = false
  }
}

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
  custom_salutations: '',
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
   maxMarginRange: '',
  warehouseSpace: '',
  salesSupport: '', 
  investmentCapacityMin: '',
  investmentCapacityMax: '',
  creditPeriodRequired: '',
   agreement: null as File | null,
   status: 'Open',
   fileUploaded: false
})

// Distributor/Super Stockist form
const distributorForm = reactive({
  custom_salutations: '',
  designation: '',
  phone2: '',
  name: '',
  mobile: '',
  email: '',
  middleName: '',
  source: '',
  leadOwner: '',
  lastName: '',
  status: 'Open',
  agreement: null as File | null,
 gstNumber:'',
  type: leadCategory,
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
  marginRange: '',
  maxMarginRange: '',
  investmentCapacityMin: '',
  investmentCapacityMax: '',
  creditPeriodRequired: '',
  salesSupport :'',
  fileUploaded: false
})
// const handleAgreementUpload = (event: Event) => {
//   const target = event.target as HTMLInputElement
//   const file = target.files?.[0] || null

//   if (file) {
//     manufacturerForm.agreement = file  // ✅ Only set for manufacturer
//     console.log('Manufacturer Agreement selected:', file.name)
//   }
// }
// const handleDistributorAgreementUpload = (event: Event) => {
//   const target = event.target as HTMLInputElement
//   const file = target.files?.[0] || null

//   if (file) {
//     distributorForm.agreement = file
//     console.log('Distributor Agreement selected:', file.name)
//   }
// }



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
      showError('Invalid pincode or location data not found')
    }
  } catch (error) {
    console.error('Error fetching location data:', error)
    showError('Error fetching location data. Please enter manually.')
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

const handleManufacturerFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedManufacturerFile.value = target.files[0];
    // We'll handle the file upload separately in the uploadDocument function
  }
};

const handleDistributorFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedDistributorFile.value = target.files[0];
    // We'll handle the file upload separately in the uploadDocument function
  }
};

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

const uploadFileToFrappe = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('is_private', '1');
  
  const response = await fetch('/api/method/upload_file', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('File upload failed');
  }
  
  const result = await response.json();
  return result.message.file_url;
};

// Submit form
const submitForm = async () => {

  let fileUrl: any;
  if (selectedDistributorFile.value) {
    fileUrl = await uploadFileToFrappe(selectedDistributorFile.value);
    distributorForm.fileUploaded = true;
  }
  
  if (selectedManufacturerFile.value) {
    fileUrl = await uploadFileToFrappe(selectedManufacturerFile.value);
    manufacturerForm.fileUploaded = true;
  }

  let mappingData = {};
  if (props.lead) {
    if (leadCategory.value == "distributor") {
      mappingData = {
        salutation: distributorForm.custom_salutations,
        job_title: distributorForm.designation,
        phone: distributorForm.phone2,
        custom_distributor_company_name: distributorForm.name,
        mobile_no: distributorForm.mobile,
        email_id: distributorForm.email,
        middle_name: distributorForm.middleName,
        source: distributorForm.source,
        lead_owner: distributorForm.leadOwner,
        last_name: distributorForm.lastName,
        custom_new_status: distributorForm.status,
        custom_gst: distributorForm.gstNumber,
        custom_super_stockiest_or_distributor: distributorForm.type == "distributor" ? "Distributor" : "Super Stockist",
        custom_staff_strength_copy: distributorForm.staffStrength,
        website: distributorForm.website,
        custom_no_of_brands_dealing_with_currently: distributorForm.brandsCount,
        custom_manufacturer_states: distributorForm.manufacturerStates,
        custom_which_accounting_system_you_are_using: distributorForm.accountingSystem,
        custom_ready_to_bear_logistics: distributorForm.logisticsWillingness,
        custom_which_app_you_are_using_for_sfa: distributorForm.sfaApp,
        custom_no_of_warehouses_you_have: distributorForm.warehouseCount,
        custom_which_app_you_are_using_for_dms: distributorForm.dmsApp,
        custom_total_space_in_sq_ft: distributorForm.totalSpace,
        custom_which_warehouse_management_system_you_are_using_: distributorForm.warehouseManagementSystem,
        custom_count_of_field_sales_force: distributorForm.salesForceCount,
        custom_do_you_have_your_own_sales_force: distributorForm.ownSalesForce,
        custom_interested_in_dealing_in_how_many_new_brands: distributorForm.newBrandsInterest,
        custom_distributor_annual_revenue: distributorForm.annualRevenue,
        custom_margin__range_from_current_brands: distributorForm.marginRange,
        custom_maximum_margin__from_current_brands: distributorForm.maxMarginRange,
        custom_investment_capacity_min: distributorForm.investmentCapacityMin,
        custom_maximum_investment_capacity: distributorForm.investmentCapacityMax,
        custom_credit_period_required: distributorForm.creditPeriodRequired,
        custom_sales_support_provided: distributorForm.salesSupport,
        agreement: fileUrl,
        custom_file_uploaded: distributorForm.fileUploaded,

        // Address Form
        custom_dist_address: addressForm.streetAddress,
        custom_dist_pincode: addressForm.pincode,
        custom_dist_city: addressForm.city,
        custom_dist_district0: addressForm.district,
        custom_dist_state: addressForm.state,
      }
    } else {
      mappingData = {
        salutation: manufacturerForm.custom_salutations,
        job_title: manufacturerForm.designation,
        phone: manufacturerForm.phone2,
        company_name: manufacturerForm.name,
        mobile_no: manufacturerForm.mobile,
        email_id: manufacturerForm.email,
        no_of_employees: manufacturerForm.staffStrength,
        custom_brand_name: manufacturerForm.brandName1,
        custom_inspirational: manufacturerForm.inspirational,
        custom_brand_name_2: manufacturerForm.brandName2,
        custom_brand_name_3: manufacturerForm.brandName3,
        custom_exporting: manufacturerForm.exporting,
        custom_no_of_current_distributors: manufacturerForm.currentDistributors,
        annual_revenue: manufacturerForm.annualRevenue,
        custom_listed: manufacturerForm.listed,
        custom_no_of_distributors_needed: manufacturerForm.distributorsNeeded,
        custom_minimum_order_value: manufacturerForm.minimumOrderValue,
        custom_margin_for_the_distributor: manufacturerForm.distributorMargin,
        custom_logistics: manufacturerForm.logistics,
        custom_margin_range: manufacturerForm.marginRange,
        custom_max_margin_range_: manufacturerForm.maxMarginRange,
        custom_warehouse_needs: manufacturerForm.warehouseSpace,
        custom_sales_support_provided: manufacturerForm.salesSupport,
        custom_investment_capacity_min: manufacturerForm.investmentCapacityMin,
        custom_maximum_investment_capacity: manufacturerForm.investmentCapacityMax,
        custom_credit_period_required: manufacturerForm.creditPeriodRequired,
        custom_new_status: manufacturerForm.status,
        agreement: fileUrl,
        custom_file_uploaded: distributorForm.fileUploaded,

        // Address fields
        custom_address: addressForm.streetAddress,
        custom_pincode: addressForm.pincode,
        city: addressForm.city,
        custom_districts: addressForm.district,
        custom_states: addressForm.state,
      }
    }
    
    let response = await fetch(`/api/resource/Lead/${props.lead}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappingData)
    });
    
    if (response.ok) {
      router.push('/dashboard');
    }

  } else {
    isSubmitting.value = true
  
    try {
      // Validate required fields
      const { isValid, errors } = validateForm()
      if (!isValid) {
        showError(`Please fix the following errors:\n\n${errors.map(err => `• ${err}`).join('\n')}`, 'Validation Error')
        return
      }

      // Prepare lead data for API
      const leadData: LeadData = {
        leadCategory: leadCategory.value,
        contactInfo: {
          custom_salutations: leadCategory.value === 'manufacturer' ? manufacturerForm.custom_salutations : distributorForm.custom_salutations,
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
            // status: distributorForm.status,
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
            maxMarginRange: manufacturerForm.maxMarginRange,
            investmentCapacityMin: distributorForm.investmentCapacityMin,
            investmentCapacityMax: distributorForm.investmentCapacityMax,
            creditPeriodRequired: distributorForm.creditPeriodRequired,
            warehouseSpace: manufacturerForm.warehouseSpace,
            inspirational: manufacturerForm.inspirational,
            salesSupport: manufacturerForm.salesSupport, 
            status: manufacturerForm.status,
            distStatus:distributorForm.status,
            
            maxMarginCurrentBrands: distributorForm.maxMarginRange || '',
            minMarginRange: distributorForm.marginRange || '',
            
            
              
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
            investmentCapacityMin: distributorForm.investmentCapacityMin, 
          investmentCapacityMax: distributorForm.investmentCapacityMax,
          creditPeriodRequired: distributorForm.creditPeriodRequired  
          }),
        },
      }

      const erpLeadObj: any = {
        // =======
        // Manufacturer
        // =======

        // Contact Details
        agreement: fileUrl,
        custom_new_status: leadCategory.value === 'manufacturer' ? manufacturerForm.status : distributorForm.status,
        custom_lead_category: leadCategory.value == 'manufacturer' ? 'Manufacturer Lead': 'SS / Distributor Lead',
        custom_salutations: leadData.contactInfo.custom_salutations,
        job_title: leadData.contactInfo.designation,
        custom_pan_number: leadData.contactInfo.phone2,
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
        custom_no_of_current_distributors: leadCategory.value === 'manufacturer' ? manufacturerForm.currentDistributors : '',
        custom_exporting: leadCategory.value === 'manufacturer' ? manufacturerForm.exporting : '',
        
    

        // Financial Stance
        annual_revenue: leadCategory.value === 'manufacturer' ? manufacturerForm.annualRevenue : distributorForm.annualRevenue,
        custom_listed: leadCategory.value === 'manufacturer' ? manufacturerForm.listed : '',

        // Expansion Appetite
        custom_no_of_distributors_needed: leadCategory.value === 'manufacturer' ? manufacturerForm.distributorsNeeded : '',

        // Desired Distributor Profile
        custom_minimum_order_value: leadCategory.value === 'manufacturer' ? manufacturerForm.minimumOrderValue : '',
        custom_logistics: leadCategory.value === 'manufacturer' ? manufacturerForm.logistics : '',
        custom_warehouse_needs: leadCategory.value === 'manufacturer' ? manufacturerForm.warehouseSpace : '',
        custom_margin_for_the_distributor: leadCategory.value === 'manufacturer' ? manufacturerForm.distributorMargin : '',
        custom_margin_range: leadCategory.value === 'manufacturer' ? manufacturerForm.marginRange : '',
      custom_max_margin_range_: leadCategory.value === 'manufacturer' ? manufacturerForm.maxMarginRange : '',
        // custom_investment_capacity_min: leadCategory.value !== 'manufacturer' ? distributorForm.investmentCapacityMin : '',
        // custom_maximum_investment_capacity: leadCategory.value !== 'manufacturer' ? distributorForm.investmentCapacityMax : '',
        // custom_credit_period_required: leadCategory.value !== 'manufacturer' ? distributorForm.creditPeriodRequired : '',
        // custom_sales_support_provided: leadCategory.value === 'manufacturer' ? manufacturerForm.salesSupport : '',
        custom_investment_capacity_min: leadCategory.value === 'manufacturer' ? manufacturerForm.investmentCapacityMin  : distributorForm.investmentCapacityMin,

  custom_maximum_investment_capacity: leadCategory.value === 'manufacturer' ? manufacturerForm.investmentCapacityMax : distributorForm.investmentCapacityMax,

  custom_credit_period_required: leadCategory.value === 'manufacturer' ? manufacturerForm.creditPeriodRequired : distributorForm.creditPeriodRequired,

  custom_sales_support_provided: leadCategory.value === 'manufacturer' ? manufacturerForm.salesSupport : distributorForm.salesSupport || '',
  custom_mfg_sales_support_provided: leadCategory.value === 'manufacturer' ? manufacturerForm.salesSupport : '',
  custom_manufacurer_status: leadCategory.value === 'manufacturer' ? manufacturerForm.status : '',
  custom_distributor_status: leadCategory.value === 'distributor' ? distributorForm.status : '',







        
        // =======
        // Distributor
        // =======

        // Contact Info
        middle_name: leadData.contactInfo.middleName || '',
        last_name: leadData.contactInfo.lastName || '',
        source: distributorForm.source || '',

        // Company Profile 
        custom_super_stockiest_or_distributor: leadCategory.value === 'super-stockist' ? 'Super Stockist' : leadCategory.value === 'distributor' ? 'Distributor' : '',
        custom_staff_strength_copy: leadData.companyInfo.staffStrength,
        custom_distributor_company_name: leadData.companyInfo.companyName,
        custom_no_of_brands_dealing_with_currently: distributorForm.brandsCount,
        website: leadData.companyInfo.website || '',
        custom_gst: distributorForm.gstNumber || '',
        
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
        //Expansion Appetite
        // custom_maximum_margin__from_current_brands:
        custom_maximum_margin__from_current_brands: leadCategory.value === 'distributor'
    ? distributorForm.maxMarginRange || ''
    : '',
        custom_margin__range_from_current_brands: leadCategory.value === 'distributor'
    ? distributorForm.marginRange || ''
    : '',
  custom_distributor_annual_revenue: leadCategory.value === 'distributor'
      ? distributorForm.annualRevenue || ''
      : '',
    
      }

      // Add categories as child doctype entries
      const selectedCategories = leadCategory.value === 'manufacturer' ? manufacturerForm.categories : distributorForm.categories;
      if (selectedCategories && selectedCategories.length > 0) {
        erpLeadObj.custom_category_presence = selectedCategories.map((category, index) => ({
          docstatus: 0,
          doctype: "Lead Category Presence",
          // owner: "Administrator",
          // parent: "", // Will be set to the Lead name after creation
          parentfield: "custom_category_presence",
          parenttype: "Lead",
          idx: index + 1,
          category: category,
          __islocal: 1,
          __unsaved: 1,
          __unedited: false
        }));
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
        
        // Check for successful response
        if (data && data.data && !data.exc) {
          router.push('/dashboard')
          return
        }
        
        // Handle specific errors
        if (response.status === 417 && data.exc_type === 'UniqueValidationError') {
          // Check if it's a duplicate title/name error
          if (data.exception && data.exception.includes("Duplicate entry") && data.exception.includes("for key 'title'")) {
            showError('Name or Company Name already exists', 'Duplicate Entry')
            return
          }
        }
        
        // Handle other errors
        if (data.exc || data.exception) {
          const errorMessage = data._server_messages ? 
            JSON.parse(data._server_messages)[0]?.message || 'An error occurred' : 
            'An error occurred while saving the lead'
          showError(errorMessage, 'Save Error')
          return
        }
        
      } catch (err) {
        console.error('Error posting ERP Lead:', err)
        showError('Network error occurred. Please check your connection and try again.', 'Network Error')
        return
      }

      return
      // Make API call to save lead
      const response = await apiService.saveLead(leadData)

      if (response.success) {
        // Success - show success message and redirect
        showSuccess(`${leadCategory.value === 'manufacturer' ? 'Manufacturer' : 'Distributor'} lead saved successfully!`, 'Success')
        .then(() => {
          // Reset form and redirect after user clicks OK
          resetForm()
          router.push('/dashboard')
        })
        

        
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
        showError(`Error: ${errorMessage}${errors ? `\nDetails: ${errors}` : ''}`)
        console.error('API Error:', response)
      }
      
    } catch (error) {
      console.error('Error submitting form:', error)
      showError('Network error occurred. Please check your connection and try again.')
    } finally {
      isSubmitting.value = false
    }
  }
}

// Fetch categories on component mount
onMounted(async () => {

  if (props.lead) {
    try {
      const response = await fetch(`/api/resource/Lead/${props.lead}?fields=["*"]`);
      const data = await response.json();
      
      if (data.data.custom_lead_category == "SS / Distributor Lead") {
        leadCategory.value = "distributor";
        distributorForm.custom_salutations = data.data.salutation;
        distributorForm.designation = data.data.job_title;
        distributorForm.phone2 = data.data.phone;
        distributorForm.name = data.data.custom_distributor_company_name;
        distributorForm.mobile = data.data.mobile_no;
        distributorForm.email = data.data.email_id;
        distributorForm.middleName = data.data.middle_name;
        distributorForm.source = data.data.source;
        distributorForm.leadOwner = data.data.lead_owner;
        distributorForm.lastName = data.data.last_name;
        distributorForm.status = data.data.custom_new_status;
        distributorForm.gstNumber = data.data.custom_gst;
        distributorForm.type = data.data.custom_super_stockiest_or_distributor == "Distributor" ? "distributor" : "super-stockist" ;
        distributorForm.staffStrength = data.data.custom_staff_strength_copy;
        distributorForm.companyName = data.data.custom_distributor_company_name;
        distributorForm.brandsCount = data.data.custom_no_of_brands_dealing_with_currently;
        distributorForm.website = data.data.website;
        distributorForm.manufacturerStates = data.data.custom_manufacturer_states;
        // distributorForm.categories = [] as string[];
        // distributorForm.subCategories = [] as string[];
        // distributorForm.manufacturerDistricts = '';
        distributorForm.accountingSystem = data.data.custom_which_accounting_system_you_are_using;
        distributorForm.logisticsWillingness = data.data.custom_ready_to_bear_logistics;
        distributorForm.sfaApp = data.data.custom_which_app_you_are_using_for_sfa;
        distributorForm.warehouseCount = data.data.custom_no_of_warehouses_you_have;
        distributorForm.dmsApp = data.data.custom_which_app_you_are_using_for_dms;
        distributorForm.totalSpace = data.data.custom_total_space_in_sq_ft;
        distributorForm.warehouseManagementSystem = data.data.custom_which_warehouse_management_system_you_are_using_;
        distributorForm.salesForceCount = data.data.custom_count_of_field_sales_force;
        distributorForm.ownSalesForce = data.data.custom_do_you_have_your_own_sales_force;
        // distributorForm.categoriesInterested = [] as string[];
        // distributorForm.needManufacturerStates = [] as string[];
        distributorForm.newBrandsInterest = data.data.custom_interested_in_dealing_in_how_many_new_brands;
        // distributorForm.needManufacturerDistricts = [] as string[];
        distributorForm.annualRevenue = data.data.custom_distributor_annual_revenue;
        distributorForm.marginRange = data.data.custom_margin__range_from_current_brands;
        distributorForm.maxMarginRange = data.data.custom_maximum_margin__from_current_brands;
        distributorForm.investmentCapacityMin = data.data.custom_investment_capacity_min;
        distributorForm.investmentCapacityMax = data.data.custom_maximum_investment_capacity;
        distributorForm.creditPeriodRequired = data.data.custom_credit_period_required;
        distributorForm.salesSupport = data.data.custom_sales_support_provided;
        distributorForm.fileUploaded = data.data.custom_file_uploaded;
        addressForm.streetAddress = data.data.custom_dist_address;
        addressForm.pincode = data.data.custom_dist_pincode;
        addressForm.city = data.data.custom_dist_city;
        addressForm.district = data.data.custom_dist_district0;
        addressForm.state = data.data.custom_dist_state;
      } else {
        leadCategory.value = "manufacturer";
        manufacturerForm.custom_salutations = data.data.salutation;
        manufacturerForm.designation = data.data.job_title;
        manufacturerForm.phone2 = data.data.phone;
        manufacturerForm.name = data.data.company_name;
        manufacturerForm.mobile = data.data.mobile_no;
        manufacturerForm.email = data.data.email_id;
        manufacturerForm.companyName = data.data.company_name;
        manufacturerForm.staffStrength = data.data.no_of_employees;
        manufacturerForm.brandName1 = data.data.custom_brand_name;
        manufacturerForm.inspirational = data.data.custom_inspirational;
        manufacturerForm.brandName2 = data.data.custom_brand_name_2;
        manufacturerForm.brandName3 = data.data.custom_brand_name_3;
        // manufacturerForm.categories = [] as string[];
        // manufacturerForm.subCategories = [] as string[];
        manufacturerForm.exporting = data.data.custom_exporting;
        manufacturerForm.currentDistributors = data.data.custom_no_of_current_distributors;
        // manufacturerForm.presenceStates = [] as string[];
        // manufacturerForm.presenceDistricts = [] as string[];
        manufacturerForm.annualRevenue = data.data.annual_revenue;
        manufacturerForm.listed = data.data.custom_listed;
        manufacturerForm.distributorsNeeded = data.data.custom_no_of_distributors_needed;
        // manufacturerForm.distributorNeededDistricts = [] as string[];
        // manufacturerForm.distributorNeededStates = [] as string[];
        manufacturerForm.minimumOrderValue = data.data.custom_minimum_order_value;
        manufacturerForm.distributorMargin = data.data.custom_margin_for_the_distributor;
        manufacturerForm.logistics = data.data.custom_logistics;
        manufacturerForm.marginRange = data.data.custom_margin_range;
        manufacturerForm.maxMarginRange = data.data.custom_max_margin_range_;
        manufacturerForm.warehouseSpace = data.data.custom_warehouse_needs;
        manufacturerForm.salesSupport = data.data.custom_sales_support_provided;
        manufacturerForm.investmentCapacityMin = data.data.custom_investment_capacity_min;
        manufacturerForm.investmentCapacityMax = data.data.custom_maximum_investment_capacity;
        manufacturerForm.creditPeriodRequired = data.data.custom_credit_period_required;
        // manufacturerForm.agreement = null as File | null;
        manufacturerForm.status = data.data.custom_new_status;
        manufacturerForm.fileUploaded = data.data.custom_file_uploaded;
        addressForm.streetAddress = data.data.custom_address;
        addressForm.pincode = data.data.custom_pincode;
        addressForm.city = data.data.city;
        addressForm.district = data.data.custom_districts;
        addressForm.state = data.data.custom_states;
      }
    } catch {
      console.log("Error while fetching lead")
    }
  }

  fetchCategories()
})
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