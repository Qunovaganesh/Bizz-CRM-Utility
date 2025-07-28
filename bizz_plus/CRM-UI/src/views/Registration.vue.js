import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBusinessLogic } from '../composables/useBusinessLogic';
import { useAlert } from '../composables/useAlert';
import ModernMultiSelect from '../components/ModernMultiSelect.vue';
import CustomAlert from '../components/CustomAlert.vue';
import { filterOptions, locationMapping, industryToCategoryMapping } from '../data/mockData';
import { apiService } from '../services/api';
import eventBus from '../eventBus';
const router = useRouter();
const { manufacturers, distributors } = useBusinessLogic();
const { alertState, showError, showSuccess, handleConfirm, handleCancel } = useAlert();
const selectedDistributorFile = ref(null);
const selectedManufacturerFile = ref(null);
// Form state
const leadCategory = ref('manufacturer');
const isSubmitting = ref(false);
const isLoadingLocation = ref(false);
const isLocationAutoFilled = ref(false);
const props = defineProps();
// Categories state
const categories = ref([]);
const isLoadingCategories = ref(false);
// Fetch categories from Category doctype
const fetchCategories = async () => {
    try {
        isLoadingCategories.value = true;
        const response = await fetch('/api/resource/Category?fields=["name","category_name"]');
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        // Transform the response to extract category names
        categories.value = data.data.map((cat) => cat.category_name || cat.name);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to static categories if API fails
        categories.value = filterOptions.categories;
    }
    finally {
        isLoadingCategories.value = false;
    }
};
const handleInteract = () => {
    let type = null;
    let id = null;
    let lead_name = null;
    let status = null;
    if (manufacturerForm.id) {
        type = 'manufacturer';
        id = manufacturerForm.id;
        lead_name = manufacturerForm.companyName;
        status = manufacturerForm.status;
    }
    else {
        type = 'distributor';
        id = distributorForm.id;
        lead_name = distributorForm.name;
        status = distributorForm.status;
    }
    router.push({
        name: 'Interaction',
        params: {
            id: id,
            name: lead_name,
            category: type,
            status: status
        }
    });
};
// Address form (common across all types)
const addressForm = reactive({
    streetAddress: '',
    pincode: '',
    city: '',
    district: '',
    state: ''
});
// Manufacturer form
const manufacturerForm = reactive({
    id: '',
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
    categories: [],
    subCategories: [],
    exporting: '',
    currentDistributors: '',
    presenceStates: [],
    presenceDistricts: [],
    annualRevenue: '',
    listed: '',
    distributorsNeeded: '',
    distributorNeededDistricts: [],
    distributorNeededStates: [],
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
    agreement: null,
    status: 'Open',
    fileUploaded: false
});
// Distributor/Super Stockist form
const distributorForm = reactive({
    id: '',
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
    agreement: null,
    gstNumber: '',
    type: leadCategory,
    staffStrength: '',
    companyName: '',
    brandsCount: '',
    website: '',
    manufacturerStates: '',
    categories: [],
    subCategories: [],
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
    categoriesInterested: [],
    needManufacturerStates: [],
    newBrandsInterest: '',
    needManufacturerDistricts: [],
    annualRevenue: '',
    marginRange: '',
    maxMarginRange: '',
    investmentCapacityMin: '',
    investmentCapacityMax: '',
    creditPeriodRequired: '',
    salesSupport: '',
    fileUploaded: false
});
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
        const relatedSubCategories = new Set();
        manufacturerForm.categories.forEach(category => {
            const subCategories = industryToCategoryMapping[category];
            if (subCategories) {
                subCategories.forEach(subCategory => relatedSubCategories.add(subCategory));
            }
        });
        return Array.from(relatedSubCategories);
    }
    return filterOptions.subCategories;
});
const availableManufacturerDistricts = computed(() => {
    if (manufacturerForm.distributorNeededStates.length > 0) {
        const relatedDistricts = new Set();
        manufacturerForm.distributorNeededStates.forEach((state) => {
            const mapping = locationMapping[state];
            if (mapping) {
                mapping.districts.forEach((district) => relatedDistricts.add(district));
            }
        });
        return Array.from(relatedDistricts);
    }
    return filterOptions.districts;
});
const availableManufacturerPresenceDistricts = computed(() => {
    if (manufacturerForm.presenceStates.length > 0) {
        const relatedDistricts = new Set();
        manufacturerForm.presenceStates.forEach((state) => {
            const mapping = locationMapping[state];
            if (mapping) {
                mapping.districts.forEach((district) => relatedDistricts.add(district));
            }
        });
        return Array.from(relatedDistricts);
    }
    return filterOptions.districts;
});
const availableDistributorSubCategories = computed(() => {
    if (distributorForm.categories.length > 0) {
        const relatedSubCategories = new Set();
        distributorForm.categories.forEach(category => {
            const subCategories = industryToCategoryMapping[category];
            if (subCategories) {
                subCategories.forEach(subCategory => relatedSubCategories.add(subCategory));
            }
        });
        return Array.from(relatedSubCategories);
    }
    return filterOptions.subCategories;
});
const availableDistributorNeededDistricts = computed(() => {
    if (distributorForm.needManufacturerStates.length > 0) {
        const relatedDistricts = new Set();
        distributorForm.needManufacturerStates.forEach((state) => {
            const mapping = locationMapping[state];
            if (mapping) {
                mapping.districts.forEach((district) => relatedDistricts.add(district));
            }
        });
        return Array.from(relatedDistricts);
    }
    return filterOptions.districts;
});
// Methods for handling dependent updates
const updateManufacturerCategories = (categories) => {
    manufacturerForm.categories = categories;
    // Clear sub-categories when categories change
    manufacturerForm.subCategories = [];
};
const updateManufacturerStates = (states) => {
    manufacturerForm.distributorNeededStates = states;
    // Clear districts when states change
    manufacturerForm.distributorNeededDistricts = [];
};
const updateManufacturerPresenceStates = (states) => {
    manufacturerForm.presenceStates = states;
    // Clear districts when states change
    manufacturerForm.presenceDistricts = [];
};
const updateDistributorCategories = (categories) => {
    distributorForm.categories = categories;
    // Clear sub-categories when categories change
    distributorForm.subCategories = [];
};
const updateDistributorNeededStates = (states) => {
    distributorForm.needManufacturerStates = states;
    // Clear districts when states change
    distributorForm.needManufacturerDistricts = [];
};
// Methods
const fetchLocationData = async () => {
    const pincode = addressForm.pincode.trim();
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
        return;
    }
    isLoadingLocation.value = true;
    isLocationAutoFilled.value = false;
    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
            const postOffice = data[0].PostOffice[0];
            addressForm.city = postOffice.Name || postOffice.Block || '';
            addressForm.district = postOffice.District || '';
            addressForm.state = postOffice.State || '';
            isLocationAutoFilled.value = true;
        }
        else {
            // Reset fields if no data found
            addressForm.city = '';
            addressForm.district = '';
            addressForm.state = '';
            showError('Invalid pincode or location data not found');
        }
    }
    catch (error) {
        console.error('Error fetching location data:', error);
        showError('Error fetching location data. Please enter manually.');
    }
    finally {
        isLoadingLocation.value = false;
    }
};
const handleFileUpload = (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
        // Handle file upload logic here
        console.log('File uploaded:', target.files[0].name);
    }
};
const handleManufacturerFileUpload = (event) => {
    const target = event.target;
    if (target.files && target.files[0]) {
        selectedManufacturerFile.value = target.files[0];
        // We'll handle the file upload separately in the uploadDocument function
    }
};
const handleDistributorFileUpload = (event) => {
    const target = event.target;
    if (target.files && target.files[0]) {
        selectedDistributorFile.value = target.files[0];
        // We'll handle the file upload separately in the uploadDocument function
    }
};
const resetForm = () => {
    // Reset address form
    Object.keys(addressForm).forEach(key => {
        addressForm[key] = '';
    });
    // Reset manufacturer form
    Object.keys(manufacturerForm).forEach(key => {
        if (Array.isArray(manufacturerForm[key])) {
            manufacturerForm[key] = [];
        }
        else {
            manufacturerForm[key] = '';
        }
    });
    // Reset distributor form
    Object.keys(distributorForm).forEach(key => {
        if (key === 'leadOwner') {
            distributorForm[key] = 'ganesh.t@qunovatec.com';
        }
        else if (Array.isArray(distributorForm[key])) {
            distributorForm[key] = [];
        }
        else {
            distributorForm[key] = '';
        }
    });
    isLocationAutoFilled.value = false;
};
const navigateToDashboard = () => {
    router.push('/dashboard');
};
// Form validation helper
const validateForm = () => {
    const errors = [];
    // Common validations
    if (!addressForm.pincode || addressForm.pincode.length !== 6) {
        errors.push('Valid 6-digit pincode is required');
    }
    if (!addressForm.city.trim()) {
        errors.push('City is required');
    }
    if (!addressForm.state.trim()) {
        errors.push('State is required');
    }
    if (leadCategory.value === 'manufacturer') {
        if (!manufacturerForm.name.trim()) {
            errors.push('Contact name is required');
        }
        if (!manufacturerForm.companyName.trim()) {
            errors.push('Company name is required');
        }
        if (manufacturerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manufacturerForm.email)) {
            errors.push('Valid email address is required');
        }
        if (manufacturerForm.mobile && !/^[6-9]\d{9}$/.test(manufacturerForm.mobile)) {
            errors.push('Valid 10-digit mobile number is required');
        }
    }
    else {
        if (!distributorForm.name.trim()) {
            errors.push('Contact name is required');
        }
        if (!distributorForm.companyName.trim()) {
            errors.push('Company name is required');
        }
        if (!distributorForm.type) {
            errors.push('Distributor type is required');
        }
        if (distributorForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(distributorForm.email)) {
            errors.push('Valid email address is required');
        }
        if (distributorForm.mobile && !/^[6-9]\d{9}$/.test(distributorForm.mobile)) {
            errors.push('Valid 10-digit mobile number is required');
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
const uploadFileToFrappe = async (file) => {
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
    await fetch('/api/resource/States', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "state_name": addressForm.state
        })
    });
    await fetch('/api/resource/Districts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "district_name": addressForm.district,
            "state": addressForm.state
        })
    });
    let fileUrl;
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
            };
        }
        else {
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
            };
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
    }
    else {
        isSubmitting.value = true;
        try {
            // Validate required fields
            const { isValid, errors } = validateForm();
            if (!isValid) {
                showError(`Please fix the following errors:\n\n${errors.map(err => `• ${err}`).join('\n')}`, 'Validation Error');
                return;
            }
            // Prepare lead data for API
            const leadData = {
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
                        distStatus: distributorForm.status,
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
            };
            const erpLeadObj = {
                // =======
                // Manufacturer
                // =======
                // Contact Details
                agreement: fileUrl,
                custom_new_status: leadCategory.value === 'manufacturer' ? manufacturerForm.status : distributorForm.status,
                custom_lead_category: leadCategory.value == 'manufacturer' ? 'Manufacturer Lead' : 'SS / Distributor Lead',
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
                custom_investment_capacity_min: leadCategory.value === 'manufacturer' ? manufacturerForm.investmentCapacityMin : distributorForm.investmentCapacityMin,
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
            };
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
            console.log('Submitting lead data:', leadData);
            // Send ERP Lead Object to Frappe backend
            try {
                const response = await fetch('/api/resource/Lead', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Frappe-CSRF-Token': window.frappe?.csrf_token || ''
                    },
                    body: JSON.stringify(erpLeadObj)
                });
                const data = await response.json();
                console.info('ERP Lead API response:', data);
                // Check for successful response
                if (data && data.data && !data.exc) {
                    router.push('/dashboard');
                    return;
                }
                // Handle specific errors
                if (response.status === 417 && data.exc_type === 'UniqueValidationError') {
                    // Check if it's a duplicate title/name error
                    if (data.exception && data.exception.includes("Duplicate entry") && data.exception.includes("for key 'title'")) {
                        showError('Name or Company Name already exists', 'Duplicate Entry');
                        return;
                    }
                }
                // Handle other errors
                if (data.exc || data.exception) {
                    const errorMessage = data._server_messages ?
                        JSON.parse(data._server_messages)[0]?.message || 'An error occurred' :
                        'An error occurred while saving the lead';
                    showError(errorMessage, 'Save Error');
                    return;
                }
            }
            catch (err) {
                console.error('Error posting ERP Lead:', err);
                showError('Network error occurred. Please check your connection and try again.', 'Network Error');
                return;
            }
            return;
            // Make API call to save lead
            const response = await apiService.saveLead(leadData);
            if (response.success) {
                // Success - show success message and redirect
                showSuccess(`${leadCategory.value === 'manufacturer' ? 'Manufacturer' : 'Distributor'} lead saved successfully!`, 'Success')
                    .then(() => {
                    // Reset form and redirect after user clicks OK
                    resetForm();
                    router.push('/dashboard');
                });
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
                        status: 'Verified',
                        registrationDate: new Date().toISOString(),
                        daysSinceStatus: 0,
                    };
                    manufacturers.value.push(newManufacturer);
                }
                else {
                    const newDistributor = {
                        id: response.data?.id || `D${Date.now()}`,
                        name: distributorForm.companyName || distributorForm.name,
                        city: addressForm.city,
                        district: addressForm.district,
                        state: addressForm.state,
                        category: distributorForm.categories[0] || 'General',
                        subCategory: distributorForm.subCategories[0] || 'General',
                        status: 'Verified',
                        registrationDate: new Date().toISOString(),
                        daysSinceStatus: 0,
                    };
                    distributors.value.push(newDistributor);
                }
                // Reset form and redirect
                resetForm();
                router.push('/dashboard');
            }
            else {
                // Error - show error message
                const errorMessage = response.message || 'Failed to save lead';
                const errors = response.errors?.join(', ') || '';
                showError(`Error: ${errorMessage}${errors ? `\nDetails: ${errors}` : ''}`);
                console.error('API Error:', response);
            }
        }
        catch (error) {
            console.error('Error submitting form:', error);
            showError('Network error occurred. Please check your connection and try again.');
        }
        finally {
            isSubmitting.value = false;
        }
    }
};
// Fetch categories on component mount
onMounted(async () => {
    eventBus.value.$emit('show-toast', "hi", // message
    'success', // color
    'mdi-alert-circle', // icon
    3000);
    if (props.lead) {
        try {
            const response = await fetch(`/api/resource/Lead/${props.lead}?fields=["*"]`);
            const data = await response.json();
            if (data.data.custom_lead_category == "SS / Distributor Lead") {
                leadCategory.value = "distributor";
                distributorForm.id = data.data.name;
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
                distributorForm.type = data.data.custom_super_stockiest_or_distributor == "Distributor" ? "distributor" : "super-stockist";
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
            }
            else {
                leadCategory.value = "manufacturer";
                manufacturerForm.id = data.data.name;
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
        }
        catch {
            console.log("Error while fetching lead");
        }
    }
    fetchCategories();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['btn-interact']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add-new']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['lead-category-section']} */ ;
/** @type {__VLS_StyleScopedClasses['category-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['category-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['form-file']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-interact']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-navigate']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-navigate']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-interact']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['registration-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['category-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['category-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['registration-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['registration-page']} */ ;
/** @type {__VLS_StyleScopedClasses['lead-category-section']} */ ;
/** @type {__VLS_StyleScopedClasses['registration-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['category-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-navigate']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-interact']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "registration-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
(props.lead ? "Update Lead" : "New Lead Registration");
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(props.lead ? "Update the lead in the system" : "Register a new lead in the system");
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/dashboard');
        } },
    ...{ class: "btn-add-new" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lead-category-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "category-toggle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.leadCategory = 'manufacturer';
        } },
    ...{ class: "category-btn" },
    ...{ class: ({ active: __VLS_ctx.leadCategory === 'manufacturer' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "category-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.leadCategory = 'super-stockist';
        } },
    ...{ class: "category-btn" },
    ...{ class: ({ active: __VLS_ctx.leadCategory === 'super-stockist' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "category-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.leadCategory = 'distributor';
        } },
    ...{ class: "category-btn" },
    ...{ class: ({ active: __VLS_ctx.leadCategory === 'distributor' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "category-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.submitForm) },
    ...{ class: "registration-form" },
});
if (__VLS_ctx.leadCategory === 'manufacturer') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-section manufacturer-form" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.manufacturerForm.custom_salutations),
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Mr.",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Mrs.",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Miss",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Dr.",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Prof.",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.manufacturerForm.designation),
        placeholder: "Enter designation",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.manufacturerForm.name),
        placeholder: "Enter name",
        ...{ class: "form-input" },
        required: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "tel",
        placeholder: "Enter mobile",
        ...{ class: "form-input" },
    });
    (__VLS_ctx.manufacturerForm.mobile);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "tel",
        placeholder: "Enter PAN number",
        ...{ class: "form-input" },
    });
    (__VLS_ctx.manufacturerForm.phone2);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "email",
        placeholder: "Enter email",
        ...{ class: "form-input" },
    });
    (__VLS_ctx.manufacturerForm.email);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.manufacturerForm.companyName),
        placeholder: "Enter company name as per GST",
        ...{ class: "form-input" },
        required: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.manufacturerForm.staffStrength),
        ...{ class: "form-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "1-10",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "11-50",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "51-200",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "201-500",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "501-1000",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "1000+",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.manufacturerForm.brandName1),
        placeholder: "Enter Brand Name",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        value: (__VLS_ctx.manufacturerForm.inspirational),
        placeholder: "Anything unique or interesting about this company",
        ...{ class: "form-textarea" },
        rows: "3",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.manufacturerForm.brandName2),
        placeholder: "Enter Website Link",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.manufacturerForm.brandName3),
        placeholder: "Enter GST Number",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        placeholder: "Enter minimum investment amount",
        ...{ class: "form-input" },
        min: "0",
    });
    (__VLS_ctx.manufacturerForm.investmentCapacityMin);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        placeholder: "Enter maximum investment amount",
        ...{ class: "form-input" },
        min: "0",
    });
    (__VLS_ctx.manufacturerForm.investmentCapacityMax);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        placeholder: "Enter credit period required",
        ...{ class: "form-input" },
        min: "0",
    });
    (__VLS_ctx.manufacturerForm.creditPeriodRequired);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.manufacturerForm.salesSupport),
        ...{ class: "form-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Yes",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "No",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Partial",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group full-width" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        value: (__VLS_ctx.addressForm.streetAddress),
        placeholder: "Enter Door No. and Area Name",
        ...{ class: "form-textarea" },
        rows: "3",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onBlur: (__VLS_ctx.fetchLocationData) },
        type: "text",
        value: (__VLS_ctx.addressForm.pincode),
        placeholder: "Enter Pincode",
        ...{ class: "form-input" },
        maxlength: "6",
        required: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.addressForm.city),
        placeholder: "Enter City",
        ...{ class: "form-input" },
        readonly: (__VLS_ctx.isLocationAutoFilled),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.addressForm.district),
        placeholder: "Enter District",
        ...{ class: "form-input" },
        readonly: (__VLS_ctx.isLocationAutoFilled),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.addressForm.state),
        placeholder: "Enter State",
        ...{ class: "form-input" },
        readonly: (__VLS_ctx.isLocationAutoFilled),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    /** @type {[typeof ModernMultiSelect, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(ModernMultiSelect, new ModernMultiSelect({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.categories),
        selected: (__VLS_ctx.manufacturerForm.categories),
        placeholder: "Select categories...",
    }));
    const __VLS_1 = __VLS_0({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.categories),
        selected: (__VLS_ctx.manufacturerForm.categories),
        placeholder: "Select categories...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    let __VLS_3;
    let __VLS_4;
    let __VLS_5;
    const __VLS_6 = {
        'onUpdate:selected': ((val) => __VLS_ctx.updateManufacturerCategories(val))
    };
    var __VLS_2;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    /** @type {[typeof ModernMultiSelect, ]} */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(ModernMultiSelect, new ModernMultiSelect({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.availableManufacturerSubCategories),
        selected: (__VLS_ctx.manufacturerForm.subCategories),
        placeholder: "Select sub-categories...",
    }));
    const __VLS_8 = __VLS_7({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.availableManufacturerSubCategories),
        selected: (__VLS_ctx.manufacturerForm.subCategories),
        placeholder: "Select sub-categories...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_10;
    let __VLS_11;
    let __VLS_12;
    const __VLS_13 = {
        'onUpdate:selected': ((val) => __VLS_ctx.manufacturerForm.subCategories = val)
    };
    var __VLS_9;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.manufacturerForm.exporting),
        ...{ class: "form-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Yes",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "No",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onChange: (__VLS_ctx.handleFileUpload) },
        type: "file",
        ...{ class: "form-file" },
        accept: ".pdf,.doc,.docx",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        placeholder: "Enter the number of distributors",
        ...{ class: "form-input" },
    });
    (__VLS_ctx.manufacturerForm.currentDistributors);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    /** @type {[typeof ModernMultiSelect, ]} */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(ModernMultiSelect, new ModernMultiSelect({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.filterOptions.states),
        selected: (__VLS_ctx.manufacturerForm.presenceStates),
        placeholder: "Select states...",
    }));
    const __VLS_15 = __VLS_14({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.filterOptions.states),
        selected: (__VLS_ctx.manufacturerForm.presenceStates),
        placeholder: "Select states...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_17;
    let __VLS_18;
    let __VLS_19;
    const __VLS_20 = {
        'onUpdate:selected': ((val) => __VLS_ctx.updateManufacturerPresenceStates(val))
    };
    var __VLS_16;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    /** @type {[typeof ModernMultiSelect, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(ModernMultiSelect, new ModernMultiSelect({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.availableManufacturerPresenceDistricts),
        selected: (__VLS_ctx.manufacturerForm.presenceDistricts),
        placeholder: "Select districts...",
    }));
    const __VLS_22 = __VLS_21({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.availableManufacturerPresenceDistricts),
        selected: (__VLS_ctx.manufacturerForm.presenceDistricts),
        placeholder: "Select districts...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_24;
    let __VLS_25;
    let __VLS_26;
    const __VLS_27 = {
        'onUpdate:selected': ((val) => __VLS_ctx.manufacturerForm.presenceDistricts = val)
    };
    var __VLS_23;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.manufacturerForm.annualRevenue),
        placeholder: "Figures in Crs",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.manufacturerForm.listed),
        ...{ class: "form-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Yes",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "No",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.manufacturerForm.distributorsNeeded),
        ...{ class: "form-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "1",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "2",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "3",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "4",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "5",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "6",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "7",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "8",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "9",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "10",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group full-width" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    /** @type {[typeof ModernMultiSelect, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(ModernMultiSelect, new ModernMultiSelect({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.availableManufacturerDistricts),
        selected: (__VLS_ctx.manufacturerForm.distributorNeededDistricts),
        placeholder: "Select districts...",
    }));
    const __VLS_29 = __VLS_28({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.availableManufacturerDistricts),
        selected: (__VLS_ctx.manufacturerForm.distributorNeededDistricts),
        placeholder: "Select districts...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    let __VLS_31;
    let __VLS_32;
    let __VLS_33;
    const __VLS_34 = {
        'onUpdate:selected': ((val) => __VLS_ctx.manufacturerForm.distributorNeededDistricts = val)
    };
    var __VLS_30;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group full-width" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    /** @type {[typeof ModernMultiSelect, ]} */ ;
    // @ts-ignore
    const __VLS_35 = __VLS_asFunctionalComponent(ModernMultiSelect, new ModernMultiSelect({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.filterOptions.states),
        selected: (__VLS_ctx.manufacturerForm.distributorNeededStates),
        placeholder: "Select states...",
    }));
    const __VLS_36 = __VLS_35({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.filterOptions.states),
        selected: (__VLS_ctx.manufacturerForm.distributorNeededStates),
        placeholder: "Select states...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    let __VLS_38;
    let __VLS_39;
    let __VLS_40;
    const __VLS_41 = {
        'onUpdate:selected': ((val) => __VLS_ctx.updateManufacturerStates(val))
    };
    var __VLS_37;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.manufacturerForm.minimumOrderValue),
        placeholder: "Figures in lakhs",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.manufacturerForm.distributorMargin),
        placeholder: "Enter margin percent",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.manufacturerForm.logistics),
        ...{ class: "form-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Borne by us",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Borne by distributor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.manufacturerForm.marginRange),
        placeholder: "Enter  Minimum margin ",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        placeholder: "Enter maximum margin",
        ...{ class: "form-input" },
    });
    (__VLS_ctx.manufacturerForm.maxMarginRange);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group full-width" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.manufacturerForm.warehouseSpace),
        placeholder: "Enter Space in Sq Ft.",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid two-cols" },
    });
    if (__VLS_ctx.leadCategory === 'manufacturer') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-group" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: (__VLS_ctx.manufacturerForm.status),
            ...{ class: "form-select" },
            required: true,
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: "",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: "Open",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: "Replied",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: "Opportunity",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: "Verified",
        });
    }
    if (__VLS_ctx.manufacturerForm.status == 'Verified' && !__VLS_ctx.manufacturerForm.fileUploaded) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-group" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "file-upload-area" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            ...{ onChange: (__VLS_ctx.handleManufacturerFileUpload) },
            type: "file",
            accept: ".pdf,.jpg,.png",
            required: (!__VLS_ctx.manufacturerForm.fileUploaded),
            ...{ class: "file-input-hidden" },
            id: "document-upload",
        });
        if (__VLS_ctx.selectedManufacturerFile) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "selected-file" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "file-name" },
            });
            (__VLS_ctx.selectedManufacturerFile.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.leadCategory === 'manufacturer'))
                            return;
                        if (!(__VLS_ctx.manufacturerForm.status == 'Verified' && !__VLS_ctx.manufacturerForm.fileUploaded))
                            return;
                        if (!(__VLS_ctx.selectedManufacturerFile))
                            return;
                        __VLS_ctx.selectedManufacturerFile = null;
                    } },
                ...{ class: "btn-remove-file" },
            });
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-section distributor-form" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.distributorForm.custom_salutations),
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Mr.",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Mrs.",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Miss",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Dr.",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Prof.",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.name),
        placeholder: "Enter name",
        ...{ class: "form-input" },
        required: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.designation),
        placeholder: "Enter designation",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "tel",
        placeholder: "Enter phone number",
        ...{ class: "form-input" },
    });
    (__VLS_ctx.distributorForm.phone2);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "tel",
        placeholder: "Enter mobile number",
        ...{ class: "form-input" },
    });
    (__VLS_ctx.distributorForm.mobile);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "email",
        placeholder: "Enter email",
        ...{ class: "form-input" },
    });
    (__VLS_ctx.distributorForm.email);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.middleName),
        placeholder: "Enter middle name",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.source),
        placeholder: "Lead source",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.leadOwner),
        placeholder: "Lead owner",
        ...{ class: "form-input" },
        readonly: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.lastName),
        placeholder: "Enter last name",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    (__VLS_ctx.leadCategory === 'super-stockist' ? 'Super Stockist' : 'Distributor');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.distributorForm.type),
        ...{ class: "form-select" },
        required: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "super-stockist",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "distributor",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.distributorForm.staffStrength),
        ...{ class: "form-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "1-10",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "11-50",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "51-200",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "201-500",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "501-1000",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "1000+",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.companyName),
        placeholder: "Enter company name as per GST",
        ...{ class: "form-input" },
        required: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.distributorForm.brandsCount),
        ...{ class: "form-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "1-5",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "6-10",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "11-20",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "20+",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "url",
        placeholder: "Enter website",
        ...{ class: "form-input" },
    });
    (__VLS_ctx.distributorForm.website);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.gstNumber),
        placeholder: "Enter GST Number",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.manufacturerStates),
        placeholder: "Select the states from where your are currently sourcing",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group full-width" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    /** @type {[typeof ModernMultiSelect, ]} */ ;
    // @ts-ignore
    const __VLS_42 = __VLS_asFunctionalComponent(ModernMultiSelect, new ModernMultiSelect({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.categories),
        selected: (__VLS_ctx.distributorForm.categories),
        placeholder: "Select categories...",
    }));
    const __VLS_43 = __VLS_42({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.categories),
        selected: (__VLS_ctx.distributorForm.categories),
        placeholder: "Select categories...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_42));
    let __VLS_45;
    let __VLS_46;
    let __VLS_47;
    const __VLS_48 = {
        'onUpdate:selected': ((val) => __VLS_ctx.updateDistributorCategories(val))
    };
    var __VLS_44;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group full-width" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    /** @type {[typeof ModernMultiSelect, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(ModernMultiSelect, new ModernMultiSelect({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.availableDistributorSubCategories),
        selected: (__VLS_ctx.distributorForm.subCategories),
        placeholder: "Select sub-categories...",
    }));
    const __VLS_50 = __VLS_49({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.availableDistributorSubCategories),
        selected: (__VLS_ctx.distributorForm.subCategories),
        placeholder: "Select sub-categories...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    let __VLS_52;
    let __VLS_53;
    let __VLS_54;
    const __VLS_55 = {
        'onUpdate:selected': ((val) => __VLS_ctx.distributorForm.subCategories = val)
    };
    var __VLS_51;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group full-width" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.manufacturerDistricts),
        placeholder: "Enter districts",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        placeholder: "Enter minimum investment amount",
        ...{ class: "form-input" },
        min: "0",
    });
    (__VLS_ctx.distributorForm.investmentCapacityMin);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        min: "0",
        placeholder: "Enter maximum investment amount",
        ...{ class: "form-input" },
    });
    (__VLS_ctx.distributorForm.investmentCapacityMax);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        min: "0",
        placeholder: "e.g., 30",
        ...{ class: "form-input" },
    });
    (__VLS_ctx.distributorForm.creditPeriodRequired);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.distributorForm.salesSupport),
        ...{ class: "form-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Yes",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "No",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Partial",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group full-width" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        value: (__VLS_ctx.addressForm.streetAddress),
        placeholder: "Enter Door No. and Area Name",
        ...{ class: "form-textarea" },
        rows: "3",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onBlur: (__VLS_ctx.fetchLocationData) },
        type: "text",
        value: (__VLS_ctx.addressForm.pincode),
        placeholder: "Enter Pincode",
        ...{ class: "form-input" },
        maxlength: "6",
        required: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.addressForm.city),
        placeholder: "Enter City",
        ...{ class: "form-input" },
        readonly: (__VLS_ctx.isLocationAutoFilled),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.addressForm.district),
        placeholder: "Enter District",
        ...{ class: "form-input" },
        readonly: (__VLS_ctx.isLocationAutoFilled),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.addressForm.state),
        placeholder: "Enter State",
        ...{ class: "form-input" },
        readonly: (__VLS_ctx.isLocationAutoFilled),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.accountingSystem),
        placeholder: "Enter accounting system",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.distributorForm.logisticsWillingness),
        ...{ class: "form-select" },
        placeholder: "Willingness to bear logistics?",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Yes",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "No",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.sfaApp),
        placeholder: "Enter SFA app",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.distributorForm.warehouseCount),
        ...{ class: "form-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "1",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "2",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "3",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "4",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "5",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "More than 5",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.dmsApp),
        placeholder: "Enter DMS app",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.totalSpace),
        placeholder: "Enter total space",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.warehouseManagementSystem),
        placeholder: "Enter warehouse management system",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.distributorForm.salesForceCount),
        ...{ class: "form-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "1-5",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "6-10",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "11-20",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "20+",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.distributorForm.ownSalesForce),
        ...{ class: "form-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Yes",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "No",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    /** @type {[typeof ModernMultiSelect, ]} */ ;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(ModernMultiSelect, new ModernMultiSelect({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.categories),
        selected: (__VLS_ctx.distributorForm.categoriesInterested),
        placeholder: "Select categories...",
    }));
    const __VLS_57 = __VLS_56({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.categories),
        selected: (__VLS_ctx.distributorForm.categoriesInterested),
        placeholder: "Select categories...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    let __VLS_59;
    let __VLS_60;
    let __VLS_61;
    const __VLS_62 = {
        'onUpdate:selected': ((val) => __VLS_ctx.distributorForm.categoriesInterested = val)
    };
    var __VLS_58;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    /** @type {[typeof ModernMultiSelect, ]} */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(ModernMultiSelect, new ModernMultiSelect({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.filterOptions.states),
        selected: (__VLS_ctx.distributorForm.needManufacturerStates),
        placeholder: "Select states...",
    }));
    const __VLS_64 = __VLS_63({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.filterOptions.states),
        selected: (__VLS_ctx.distributorForm.needManufacturerStates),
        placeholder: "Select states...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    let __VLS_66;
    let __VLS_67;
    let __VLS_68;
    const __VLS_69 = {
        'onUpdate:selected': ((val) => __VLS_ctx.updateDistributorNeededStates(val))
    };
    var __VLS_65;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.distributorForm.newBrandsInterest),
        ...{ class: "form-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "1-2",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "3-5",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "6-10",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "10+",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    /** @type {[typeof ModernMultiSelect, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(ModernMultiSelect, new ModernMultiSelect({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.availableDistributorNeededDistricts),
        selected: (__VLS_ctx.distributorForm.needManufacturerDistricts),
        placeholder: "Select districts...",
    }));
    const __VLS_71 = __VLS_70({
        ...{ 'onUpdate:selected': {} },
        options: (__VLS_ctx.availableDistributorNeededDistricts),
        selected: (__VLS_ctx.distributorForm.needManufacturerDistricts),
        placeholder: "Select districts...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    let __VLS_73;
    let __VLS_74;
    let __VLS_75;
    const __VLS_76 = {
        'onUpdate:selected': ((val) => __VLS_ctx.distributorForm.needManufacturerDistricts = val)
    };
    var __VLS_72;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.annualRevenue),
        placeholder: "Figures in Lakhs",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "text",
        value: (__VLS_ctx.distributorForm.marginRange),
        placeholder: "Enter Min__ and Max__",
        ...{ class: "form-input" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "number",
        placeholder: "Enter maximum margin %",
        ...{ class: "form-input" },
    });
    (__VLS_ctx.distributorForm.maxMarginRange);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid two-cols" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.distributorForm.status),
        ...{ class: "form-select" },
        required: true,
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Open",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Replied",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Opportunity",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "Verified",
    });
    if (__VLS_ctx.distributorForm.status == 'Verified' && !__VLS_ctx.distributorForm.fileUploaded) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "form-group" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "file-upload-area" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            ...{ onChange: (__VLS_ctx.handleDistributorFileUpload) },
            type: "file",
            accept: ".pdf,.jpg,.png",
            required: (!__VLS_ctx.distributorForm.fileUploaded),
            ...{ class: "file-input-hidden" },
            id: "document-upload",
        });
        if (__VLS_ctx.selectedDistributorFile) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "selected-file" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "file-name" },
            });
            (__VLS_ctx.selectedDistributorFile.name);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.leadCategory === 'manufacturer'))
                            return;
                        if (!(__VLS_ctx.distributorForm.status == 'Verified' && !__VLS_ctx.distributorForm.fileUploaded))
                            return;
                        if (!(__VLS_ctx.selectedDistributorFile))
                            return;
                        __VLS_ctx.selectedDistributorFile = null;
                    } },
                ...{ class: "btn-remove-file" },
            });
        }
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-actions" },
});
if (__VLS_ctx.manufacturerForm.id || __VLS_ctx.distributorForm.id) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.handleInteract) },
        type: "button",
        ...{ class: "btn-interact" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.navigateToDashboard) },
    type: "button",
    ...{ class: "btn-navigate" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.resetForm) },
    type: "button",
    ...{ class: "btn-secondary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
    ...{ class: "btn-primary" },
    disabled: (__VLS_ctx.isSubmitting),
});
(props.lead ? "Update" : "Register");
if (__VLS_ctx.isLoadingLocation) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-spinner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
/** @type {[typeof CustomAlert, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(CustomAlert, new CustomAlert({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    isVisible: (__VLS_ctx.alertState.isVisible),
    type: (__VLS_ctx.alertState.type),
    title: (__VLS_ctx.alertState.title),
    message: (__VLS_ctx.alertState.message),
    confirmText: (__VLS_ctx.alertState.confirmText),
    cancelText: (__VLS_ctx.alertState.cancelText),
    showCancel: (__VLS_ctx.alertState.showCancel),
    closeOnOverlayClick: (__VLS_ctx.alertState.closeOnOverlayClick),
}));
const __VLS_78 = __VLS_77({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    isVisible: (__VLS_ctx.alertState.isVisible),
    type: (__VLS_ctx.alertState.type),
    title: (__VLS_ctx.alertState.title),
    message: (__VLS_ctx.alertState.message),
    confirmText: (__VLS_ctx.alertState.confirmText),
    cancelText: (__VLS_ctx.alertState.cancelText),
    showCancel: (__VLS_ctx.alertState.showCancel),
    closeOnOverlayClick: (__VLS_ctx.alertState.closeOnOverlayClick),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_80;
let __VLS_81;
let __VLS_82;
const __VLS_83 = {
    onConfirm: (__VLS_ctx.handleConfirm)
};
const __VLS_84 = {
    onCancel: (__VLS_ctx.handleCancel)
};
var __VLS_79;
/** @type {__VLS_StyleScopedClasses['registration-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add-new']} */ ;
/** @type {__VLS_StyleScopedClasses['lead-category-section']} */ ;
/** @type {__VLS_StyleScopedClasses['category-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['category-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['category-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['category-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['category-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['category-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['category-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['registration-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['manufacturer-form']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-file']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['two-cols']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['file-upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['file-input-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-file']} */ ;
/** @type {__VLS_StyleScopedClasses['file-name']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-remove-file']} */ ;
/** @type {__VLS_StyleScopedClasses['form-section']} */ ;
/** @type {__VLS_StyleScopedClasses['distributor-form']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['form-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-input']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['two-cols']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['file-upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['file-input-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-file']} */ ;
/** @type {__VLS_StyleScopedClasses['file-name']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-remove-file']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-interact']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-navigate']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-spinner']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ModernMultiSelect: ModernMultiSelect,
            CustomAlert: CustomAlert,
            filterOptions: filterOptions,
            alertState: alertState,
            handleConfirm: handleConfirm,
            handleCancel: handleCancel,
            selectedDistributorFile: selectedDistributorFile,
            selectedManufacturerFile: selectedManufacturerFile,
            leadCategory: leadCategory,
            isSubmitting: isSubmitting,
            isLoadingLocation: isLoadingLocation,
            isLocationAutoFilled: isLocationAutoFilled,
            categories: categories,
            handleInteract: handleInteract,
            addressForm: addressForm,
            manufacturerForm: manufacturerForm,
            distributorForm: distributorForm,
            availableManufacturerSubCategories: availableManufacturerSubCategories,
            availableManufacturerDistricts: availableManufacturerDistricts,
            availableManufacturerPresenceDistricts: availableManufacturerPresenceDistricts,
            availableDistributorSubCategories: availableDistributorSubCategories,
            availableDistributorNeededDistricts: availableDistributorNeededDistricts,
            updateManufacturerCategories: updateManufacturerCategories,
            updateManufacturerStates: updateManufacturerStates,
            updateManufacturerPresenceStates: updateManufacturerPresenceStates,
            updateDistributorCategories: updateDistributorCategories,
            updateDistributorNeededStates: updateDistributorNeededStates,
            fetchLocationData: fetchLocationData,
            handleFileUpload: handleFileUpload,
            handleManufacturerFileUpload: handleManufacturerFileUpload,
            handleDistributorFileUpload: handleDistributorFileUpload,
            resetForm: resetForm,
            navigateToDashboard: navigateToDashboard,
            submitForm: submitForm,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
