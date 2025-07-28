import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const props = defineProps();
const leadStatus = ref('Verified'); // Default to 'Registration', will be updated based on interactions
const selectedEntityData = ref(null); // Main selected entity from Dashboard
const associatedEntityData = ref(null); // Associated entity clicked from table
const apiInteractions = ref([]); // API interactions data
const isLoadingInteractions = ref(false);
const isSubmittingInteraction = ref(false);
const currentLeadMapping = ref(null); // Current lead mapping record
const showNotesModal = ref(false);
const selectedInteraction = ref(null);
const isMobile = ref(false);
const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
};
const userOptions = ref([]);
const newInteraction = ref({
    interactedBy: 'Current User',
    dateInteracted: new Date().toISOString().split('T')[0],
    mode: '',
    notes: '',
    hasReminder: false,
    reminderDate: new Date().toISOString().split('T')[0],
    attachments: [],
    assignedTo: ''
});
const manufacturerData = computed(() => {
    // If we have actual entity data, use it
    if (selectedEntityData.value) {
        // Check if selected entity is a manufacturer
        if (selectedEntityData.value.custom_lead_category === 'Manufacturer Lead') {
            return {
                id: selectedEntityData.value.name,
                name: selectedEntityData.value.company_name || selectedEntityData.value.name,
                category: selectedEntityData.value.custom_categories || '',
                subCategory: '',
                city: selectedEntityData.value.custom_cities || '',
                district: selectedEntityData.value.custom_districts || '',
                state: selectedEntityData.value.custom_states || '',
                status: selectedEntityData.value.custom_new_status || '',
                registrationDate: selectedEntityData.value.creation ? new Date(selectedEntityData.value.creation).toISOString().split('T')[0] : '',
                daysSinceStatus: 0
            };
        }
    }
    // If associated entity is a manufacturer
    if (associatedEntityData.value && associatedEntityData.value.custom_lead_category === 'Manufacturer Lead') {
        return {
            id: associatedEntityData.value.name,
            name: associatedEntityData.value.company_name || associatedEntityData.value.name,
            category: associatedEntityData.value.custom_categories || '',
            subCategory: '',
            city: associatedEntityData.value.custom_cities || '',
            district: associatedEntityData.value.custom_districts || '',
            state: associatedEntityData.value.custom_states || '',
            status: associatedEntityData.value.custom_new_status || '',
            registrationDate: associatedEntityData.value.creation ? new Date(associatedEntityData.value.creation).toISOString().split('T')[0] : '',
            daysSinceStatus: 0
        };
    }
    // Default fallback
    return {
        id: '',
        name: 'Select Manufacturer',
        category: '',
        subCategory: '',
        city: '',
        district: '',
        state: '',
        status: '',
        registrationDate: '',
        daysSinceStatus: 0
    };
});
const distributorData = computed(() => {
    // If we have actual entity data, use it
    if (selectedEntityData.value) {
        // Check if selected entity is a distributor
        if (selectedEntityData.value.custom_lead_category === 'SS / Distributor Lead') {
            return {
                id: selectedEntityData.value.name,
                name: selectedEntityData.value.company_name || selectedEntityData.value.name,
                category: selectedEntityData.value.custom_categories || '',
                subCategory: '',
                city: selectedEntityData.value.custom_cities || '',
                district: selectedEntityData.value.custom_districts || '',
                state: selectedEntityData.value.custom_states || '',
                status: selectedEntityData.value.custom_new_status || '',
                registrationDate: selectedEntityData.value.creation ? new Date(selectedEntityData.value.creation).toISOString().split('T')[0] : '',
                daysSinceStatus: 0
            };
        }
    }
    // If associated entity is a distributor
    if (associatedEntityData.value && associatedEntityData.value.custom_lead_category === 'SS / Distributor Lead') {
        return {
            id: associatedEntityData.value.name,
            name: associatedEntityData.value.company_name || associatedEntityData.value.name,
            category: associatedEntityData.value.custom_categories || '',
            subCategory: '',
            city: associatedEntityData.value.custom_cities || '',
            district: associatedEntityData.value.custom_districts || '',
            state: associatedEntityData.value.custom_states || '',
            status: associatedEntityData.value.custom_new_status || '',
            registrationDate: associatedEntityData.value.creation ? new Date(associatedEntityData.value.creation).toISOString().split('T')[0] : '',
            daysSinceStatus: 0
        };
    }
    // Default fallback
    return {
        id: '',
        name: 'Select Distributor',
        category: '',
        subCategory: '',
        city: '',
        district: '',
        state: '',
        status: '',
        registrationDate: '',
        daysSinceStatus: 0
    };
});
const isManufacturerLead = computed(() => {
    // Determine based on the selected entity or associated entity
    if (selectedEntityData.value) {
        return selectedEntityData.value.custom_lead_category === 'Manufacturer Lead';
    }
    if (associatedEntityData.value) {
        return associatedEntityData.value.custom_lead_category === 'Manufacturer Lead';
    }
    return false;
});
const manufacturerName = computed(() => manufacturerData.value.name);
const distributorName = computed(() => distributorData.value.name);
// API function to fetch interactions
const fetchInteractions = async () => {
    if (isLoadingInteractions.value)
        return;
    isLoadingInteractions.value = true;
    try {
        // Build the API URL with filters
        let url = '/api/resource/Lead Interaction?fields=["name","interaction_mode","interaction_notes","reminder_date","parent_lead","mapped_lead","creation","owner", "assigned_to_name", "lead_owner_name"]';
        // Add filters based on current lead IDs
        const filters = {};
        if (props.id) {
            filters.mapped_lead = props.id;
        }
        if (props.parentId) {
            filters.parent_lead = props.parentId;
        }
        if (selectedEntityData.value.custom_lead_category === 'SS / Distributor Lead') {
            filters.parent_lead = props.id;
            filters.mapped_lead = props.parentId;
        }
        if (Object.keys(filters).length > 0) {
            url += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
        }
        console.log('Fetching interactions with URL:', url);
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            console.log('Interactions API response:', data);
            if (data && data.data) {
                apiInteractions.value = data.data;
                // Do not update status based on interactions here
                // Status should only be updated when first interaction is posted
            }
        }
        else {
            console.error('Error fetching interactions:', response.statusText);
        }
    }
    catch (error) {
        console.error('Error fetching interactions:', error);
    }
    finally {
        isLoadingInteractions.value = false;
    }
};
// Function to fetch current Lead Mapping
const fetchLeadMapping = async () => {
    try {
        const filters = {};
        if (props.id) {
            filters.mapped_lead = props.id;
        }
        if (props.parentId) {
            filters.parent_lead = props.parentId;
        }
        if (selectedEntityData.value.custom_lead_category === 'SS / Distributor Lead') {
            filters.parent_lead = props.id;
            filters.mapped_lead = props.parentId;
        }
        if (Object.keys(filters).length > 0) {
            const url = `/api/resource/Lead Mapping?fields=["name","parent_lead","mapped_lead","status","last_status_change"]&filters=${encodeURIComponent(JSON.stringify(filters))}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data && data.data && data.data.length > 0) {
                    currentLeadMapping.value = data.data[0];
                    leadStatus.value = currentLeadMapping.value.status;
                }
            }
        }
    }
    catch (error) {
        console.error('Error fetching lead mapping:', error);
    }
};
function formatDateTime(date) {
    const pad = (n) => n < 10 ? '0' + n : n;
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // months are 0-indexed
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
// Function to update or create Lead Mapping
const updateLeadMapping = async (status) => {
    const res = await fetch('/api/method/frappe.auth.get_logged_user');
    const data = await res.json();
    const formatted = formatDateTime(new Date());
    let parent = props.parentId;
    let mapped = props.id;
    if (selectedEntityData.value.custom_lead_category === 'SS / Distributor Lead') {
        parent = props.id;
        mapped = props.parentId;
    }
    try {
        const mappingData = {
            parent_lead: parent,
            mapped_lead: mapped,
            status: status,
            last_status_change: new Date().toISOString().split('T')[0],
            lead_owner: data.message,
            lead_date: formatted
        };
        let response;
        response = await fetch(`/api/resource/Lead Mapping/${currentLeadMapping.value.name}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mappingData)
        });
        if (response.ok) {
            const result = await response.json();
            console.log('Lead Mapping updated/created:', result);
            currentLeadMapping.value = result.data;
        }
        else {
            console.error('Error updating lead mapping:', response.statusText);
        }
    }
    catch (error) {
        console.error('Error updating lead mapping:', error);
    }
};
const today = computed(() => {
    return new Date().toISOString().split('T')[0];
});
const formatDate = (dateString) => {
    if (!dateString)
        return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
const getTimeElapsed = (creationDate) => {
    if (!creationDate)
        return '';
    const now = new Date();
    const created = new Date(creationDate);
    const diffInMs = now.getTime() - created.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths > 0) {
        return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'}`;
    }
    else if (diffInDays > 0) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'}`;
    }
    else {
        return 'Today';
    }
};
const getModeClass = (mode) => {
    return mode === 'Phone' ? 'mode-phone' : 'mode-face';
};
// const getReminderClass = (hasReminder: boolean) => {
//   return hasReminder ? 'reminder-yes' : 'reminder-no';
// };
const getStatusBadgeClass = (status) => {
    const baseClass = 'status-badge';
    switch (status) {
        case 'Verified':
            return `${baseClass} status-registration`;
        case 'Lead':
            return `${baseClass} status-lead`;
        case 'Prospect':
            return `${baseClass} status-prospect`;
        case 'Customer':
            return `${baseClass} status-customer`;
        case 'View':
            return `${baseClass} status-view`;
        default:
            return `${baseClass} status-registration`;
    }
};
const viewNotes = (interaction) => {
    selectedInteraction.value = {
        id: interaction.name,
        interactedBy: interaction.lead_owner_name || 'Unknown',
        dateInteracted: interaction.creation,
        mode: interaction.interaction_mode,
        notes: interaction.interaction_notes || '',
        hasReminder: !!interaction.reminder_date,
        reminderDate: interaction.reminder_date || '',
        timeElapsed: getTimeElapsed(interaction.creation),
        attachments: [],
        assignedTo: interaction.assigned_to_name || 'Unknown'
    };
    showNotesModal.value = true;
};
const closeModal = () => {
    showNotesModal.value = false;
    selectedInteraction.value = null;
};
const handleFileUpload = (event) => {
    const target = event.target;
    if (target.files) {
        newInteraction.value.attachments = Array.from(target.files).map(file => file.name);
    }
};
const submitNotes = async () => {
    if (!newInteraction.value.mode || !newInteraction.value.notes) {
        console.error('Please fill in all required fields');
        return;
    }
    isSubmittingInteraction.value = true;
    const res = await fetch('/api/method/frappe.auth.get_logged_user');
    const data = await res.json();
    let parent = props.parentId;
    let mapped = props.id;
    if (selectedEntityData.value.custom_lead_category === 'SS / Distributor Lead') {
        parent = props.id;
        mapped = props.parentId;
    }
    try {
        const interactionData = {
            interaction_mode: newInteraction.value.mode,
            interaction_notes: newInteraction.value.notes,
            reminder_date: newInteraction.value.reminderDate,
            parent_lead: parent,
            mapped_lead: mapped,
            lead_owner: data.message,
            assigned_to: newInteraction.value.assignedTo
        };
        console.log('Submitting interaction:', interactionData);
        const response = await fetch('/api/resource/Lead Interaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(interactionData)
        });
        if (response.ok) {
            const result = await response.json();
            console.log('Interaction created:', result);
            // Check if this is the first interaction
            const isFirstInteraction = apiInteractions.value.length === 0;
            // Refresh the interactions list
            await fetchInteractions();
            // If this was the first interaction, update status to 'Lead'
            if (isFirstInteraction) {
                leadStatus.value = 'Lead';
                await updateLeadMapping('Lead');
                console.log('First interaction added - status updated to Lead');
            }
            // Reset form
            resetForm();
            if (isFirstInteraction) {
                console.log('First interaction added successfully! Status updated to Lead.');
            }
            else {
                console.log('Interaction added successfully!');
            }
        }
        else {
            const error = await response.json();
            console.error('Error creating interaction:', error);
        }
    }
    catch (error) {
        console.error('Error submitting interaction:', error);
    }
    finally {
        isSubmittingInteraction.value = false;
    }
};
const resetForm = () => {
    newInteraction.value = {
        interactedBy: 'Current User',
        dateInteracted: new Date().toISOString().split('T')[0],
        mode: '',
        notes: '',
        hasReminder: false,
        reminderDate: new Date().toISOString().split('T')[0],
        attachments: [],
        assignedTo: ''
    };
};
// Function to navigate to prospect page
const navigateToProspect = () => {
    router.push({
        name: 'Prospect',
        params: {
            id: props.id,
            parentId: props.parentId || ''
        }
    });
};
onMounted(async () => {
    console.log('Loading lead data for ID:', props.id, 'ParentID:', props.parentId);
    try {
        const res = await fetch('/api/method/bizz_plus.api.api.get_users');
        const data = await res.json();
        userOptions.value = data.message;
    }
    catch (err) {
        console.error("Failed to fetch users", err);
    }
    try {
        // Fetch the associated entity (clicked from table)
        const associatedResponse = await fetch(`/api/resource/Lead/${props.id}?fields=["name","custom_lead_category","company_name","custom_new_status","custom_states","custom_districts","custom_categories","custom_cities","creation"]`);
        if (associatedResponse.ok) {
            const associatedData = await associatedResponse.json();
            if (associatedData.data) {
                associatedEntityData.value = associatedData.data;
            }
        }
        // Fetch the selected entity (main entity from Dashboard) if parentId is provided
        if (props.parentId) {
            const selectedResponse = await fetch(`/api/resource/Lead/${props.parentId}?fields=["name","custom_lead_category","company_name","custom_new_status","custom_states","custom_districts","custom_categories","custom_cities","creation"]`);
            if (selectedResponse.ok) {
                const selectedData = await selectedResponse.json();
                if (selectedData.data) {
                    selectedEntityData.value = selectedData.data;
                }
            }
        }
        console.log('Selected Entity Data:', selectedEntityData.value);
        console.log('Associated Entity Data:', associatedEntityData.value);
        // Fetch current Lead Mapping to get the current status
        await fetchLeadMapping();
        // Fetch interactions after loading entity data
        await fetchInteractions();
    }
    catch (error) {
        console.error('Error fetching lead data:', error);
        // Keep default values if API calls fail
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
});
onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['btn-floating-back']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-floating-promote']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-action-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-table']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-table']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-action-small']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-text']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-input']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-select']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-file-input']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-custom']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-custom']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-row']} */ ;
/** @type {__VLS_StyleScopedClasses['card-row']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-promote-button']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['lead-page']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-floating-promote']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-back-button']} */ ;
/** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['entity-type']} */ ;
/** @type {__VLS_StyleScopedClasses['entity-type-mob']} */ ;
/** @type {__VLS_StyleScopedClasses['relationship-header']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['relationship-info']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-header']} */ ;
/** @type {__VLS_StyleScopedClasses['relationship-description']} */ ;
/** @type {__VLS_StyleScopedClasses['lead-content']} */ ;
/** @type {__VLS_StyleScopedClasses['interactions-section']} */ ;
/** @type {__VLS_StyleScopedClasses['notes-section']} */ ;
/** @type {__VLS_StyleScopedClasses['associated-section']} */ ;
/** @type {__VLS_StyleScopedClasses['potential-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-table']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-table']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-back-button']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-floating-promote']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-promote-button']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['lead-page']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-row']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['card-row']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['lead-content']} */ ;
/** @type {__VLS_StyleScopedClasses['interactions-section']} */ ;
/** @type {__VLS_StyleScopedClasses['notes-section']} */ ;
/** @type {__VLS_StyleScopedClasses['associated-section']} */ ;
/** @type {__VLS_StyleScopedClasses['potential-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-table']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-table']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "lead-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "floating-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "relationship-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "relationship-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: (__VLS_ctx.isManufacturerLead ? 'manufacturer' : 'manufacturer') },
    ...{ class: "flex " },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "entity-type" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
(__VLS_ctx.manufacturerName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "entity-type-mob" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
(__VLS_ctx.manufacturerName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "connector" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: (!__VLS_ctx.isManufacturerLead ? 'distributor' : 'distributor') },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "entity-type" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
(__VLS_ctx.distributorName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "entity-type-mob" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
(__VLS_ctx.distributorName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: (__VLS_ctx.getStatusBadgeClass(__VLS_ctx.leadStatus)) },
    ...{ class: "header-status" },
});
(__VLS_ctx.leadStatus);
if (__VLS_ctx.currentLeadMapping?.last_status_change) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "status-date" },
    });
    (__VLS_ctx.formatDate(__VLS_ctx.currentLeadMapping.last_status_change));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "floating-back-button" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$router.go(-1);
        } },
    ...{ class: "btn-floating-back" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "interactions-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-stats" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "stat-badge" },
});
(__VLS_ctx.apiInteractions.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "table-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
    ...{ class: "modern-table" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
if (__VLS_ctx.isLoadingInteractions) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
        colspan: "7",
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
else if (__VLS_ctx.apiInteractions.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({
        colspan: "7",
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
else {
    for (const [interaction] of __VLS_getVForSourceType((__VLS_ctx.apiInteractions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
            key: (interaction.name),
            ...{ class: "table-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "user-cell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "user-avatar" },
        });
        ((interaction.lead_owner_name || 'U').charAt(0));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "user-name" },
        });
        (interaction.lead_owner_name || 'Unknown');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "user-cell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "user-avatar" },
        });
        ((interaction.assigned_to_name || 'U').charAt(0));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "user-name" },
        });
        (interaction.assigned_to_name || 'Unknown');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "date-cell" },
        });
        (__VLS_ctx.formatDate(interaction.creation));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "time-elapsed" },
        });
        (__VLS_ctx.getTimeElapsed(interaction.creation));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: (__VLS_ctx.getModeClass(interaction.interaction_mode)) },
            ...{ class: "mode-badge" },
        });
        (interaction.interaction_mode);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "reminder-date-cell" },
        });
        (interaction.reminder_date ? __VLS_ctx.formatDate(interaction.reminder_date) : '—');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoadingInteractions))
                        return;
                    if (!!(__VLS_ctx.apiInteractions.length === 0))
                        return;
                    __VLS_ctx.viewNotes(interaction);
                } },
            ...{ class: "btn-action-small" },
        });
    }
}
if (__VLS_ctx.isMobile && __VLS_ctx.apiInteractions.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mobile-cards" },
    });
    for (const [row, index] of __VLS_getVForSourceType((__VLS_ctx.apiInteractions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (row.id || index),
            ...{ class: "mobile-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "serial-badge" },
        });
        (index + 1);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        (row.lead_owner_name ? row.lead_owner_name : 'Unknown');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "value" },
        });
        (row.assigned_to_name ? row.assigned_to_name : 'Unknown');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "value" },
        });
        (__VLS_ctx.formatDate(row.creation));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "value" },
        });
        (__VLS_ctx.getTimeElapsed(row.creation));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: (__VLS_ctx.getModeClass(row.interaction_mode)) },
            ...{ class: "mode-badge" },
        });
        (row.interaction_mode);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "value" },
        });
        (row.reminder_date ? 'Yes' : 'No');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "value" },
        });
        (__VLS_ctx.formatDate(row.reminder_date));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isMobile && __VLS_ctx.apiInteractions.length))
                        return;
                    __VLS_ctx.viewNotes(row);
                } },
            ...{ class: "btn-action-small mobile-action-btn" },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "notes-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "interaction-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
    ...{ onSubmit: (__VLS_ctx.submitNotes) },
    ...{ class: "modern-form" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.newInteraction.mode),
    required: true,
    ...{ class: "modern-select" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "Phone",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "Face to Face",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    type: "date",
    min: (__VLS_ctx.today),
    ...{ class: "modern-input" },
    required: true,
});
(__VLS_ctx.newInteraction.reminderDate);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.handleFileUpload) },
    type: "file",
    multiple: true,
    accept: ".pdf,.doc,.docx,.jpg,.png",
    ...{ class: "modern-file-input" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.newInteraction.assignedTo),
    ...{ class: "modern-input" },
    required: true,
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
    disabled: true,
});
for (const [user] of __VLS_getVForSourceType((__VLS_ctx.userOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (user.name),
        value: (user.name),
    });
    (user.name);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-group full-width" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.newInteraction.notes),
    rows: "4",
    placeholder: "Enter detailed interaction notes...",
    required: true,
    ...{ class: "modern-textarea" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.resetForm) },
    type: "button",
    ...{ class: "btn-secondary" },
    disabled: (__VLS_ctx.isSubmittingInteraction),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    type: "submit",
    ...{ class: "btn-primary" },
    disabled: (__VLS_ctx.isSubmittingInteraction),
});
(__VLS_ctx.isSubmittingInteraction ? 'Saving...' : 'Save Interaction');
if (__VLS_ctx.apiInteractions.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "floating-promote-button" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.navigateToProspect) },
        ...{ class: "btn-floating-promote" },
    });
}
if (__VLS_ctx.showNotesModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "modal-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeModal) },
        ...{ class: "btn-close" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "interaction-details" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-value" },
    });
    (__VLS_ctx.formatDate(__VLS_ctx.selectedInteraction?.dateInteracted));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-value" },
    });
    (__VLS_ctx.selectedInteraction?.interactedBy);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-value" },
    });
    (__VLS_ctx.selectedInteraction?.assignedTo);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-value" },
    });
    (__VLS_ctx.selectedInteraction?.mode);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-notes" },
    });
    (__VLS_ctx.selectedInteraction?.notes);
    if (__VLS_ctx.selectedInteraction?.hasReminder) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "detail-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "detail-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "detail-value" },
        });
        (__VLS_ctx.formatDate(__VLS_ctx.selectedInteraction?.reminderDate));
    }
}
/** @type {__VLS_StyleScopedClasses['lead-page']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-header']} */ ;
/** @type {__VLS_StyleScopedClasses['relationship-header']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['relationship-info']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['entity-type']} */ ;
/** @type {__VLS_StyleScopedClasses['entity-type-mob']} */ ;
/** @type {__VLS_StyleScopedClasses['connector']} */ ;
/** @type {__VLS_StyleScopedClasses['entity-type']} */ ;
/** @type {__VLS_StyleScopedClasses['entity-type-mob']} */ ;
/** @type {__VLS_StyleScopedClasses['header-status']} */ ;
/** @type {__VLS_StyleScopedClasses['status-date']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-back-button']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-floating-back']} */ ;
/** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['interactions-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-table']} */ ;
/** @type {__VLS_StyleScopedClasses['table-row']} */ ;
/** @type {__VLS_StyleScopedClasses['user-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['user-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['date-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['time-elapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['reminder-date-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-action-small']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['serial-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['card-content']} */ ;
/** @type {__VLS_StyleScopedClasses['card-row']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['card-row']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['card-row']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['card-row']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['card-row']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['card-row']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-action-small']} */ ;
/** @type {__VLS_StyleScopedClasses['mobile-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['notes-section']} */ ;
/** @type {__VLS_StyleScopedClasses['interaction-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-select']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-file-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-input']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['form-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-promote-button']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-floating-promote']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['interaction-details']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-notes']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-row']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            leadStatus: leadStatus,
            apiInteractions: apiInteractions,
            isLoadingInteractions: isLoadingInteractions,
            isSubmittingInteraction: isSubmittingInteraction,
            currentLeadMapping: currentLeadMapping,
            showNotesModal: showNotesModal,
            selectedInteraction: selectedInteraction,
            isMobile: isMobile,
            userOptions: userOptions,
            newInteraction: newInteraction,
            isManufacturerLead: isManufacturerLead,
            manufacturerName: manufacturerName,
            distributorName: distributorName,
            today: today,
            formatDate: formatDate,
            getTimeElapsed: getTimeElapsed,
            getModeClass: getModeClass,
            getStatusBadgeClass: getStatusBadgeClass,
            viewNotes: viewNotes,
            closeModal: closeModal,
            handleFileUpload: handleFileUpload,
            submitNotes: submitNotes,
            resetForm: resetForm,
            navigateToProspect: navigateToProspect,
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
