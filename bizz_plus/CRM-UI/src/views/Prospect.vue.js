import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBusinessLogic } from '../composables/useBusinessLogic';
const props = defineProps();
const router = useRouter();
const { agreement, updateAgreement } = useBusinessLogic();
const editMode = ref(false);
const showPreviewModal = ref(false);
const showUploadModal = ref(false);
const selectedFile = ref(null);
const fileInput = ref(null);
// API data state
const selectedEntityData = ref(null); // Main selected entity from Dashboard
const associatedEntityData = ref(null); // Associated entity clicked from table
const currentLeadMapping = ref(null); // Current lead mapping record
const prospectStatus = ref('Prospect'); // Default status
const clauseData = ref([]); // Clause data from API
const distributorData = computed(() => {
    // First check if selectedEntityData is a distributor
    if (selectedEntityData.value && selectedEntityData.value.custom_lead_category === 'SS / Distributor Lead') {
        return {
            id: selectedEntityData.value.name,
            name: selectedEntityData.value.company_name || selectedEntityData.value.name,
            category: selectedEntityData.value.custom_categories || '',
            subCategory: '',
            city: selectedEntityData.value.custom_cities || '',
            district: selectedEntityData.value.custom_districts || '',
            state: selectedEntityData.value.custom_states || '',
            status: prospectStatus.value,
            registrationDate: selectedEntityData.value.creation ? new Date(selectedEntityData.value.creation).toISOString().split('T')[0] : '',
            daysSinceStatus: 0
        };
    }
    // Then check if associatedEntityData is a distributor
    if (associatedEntityData.value && associatedEntityData.value.custom_lead_category === 'SS / Distributor Lead') {
        return {
            id: associatedEntityData.value.name,
            name: associatedEntityData.value.company_name || associatedEntityData.value.name,
            category: associatedEntityData.value.custom_categories || '',
            subCategory: '',
            city: associatedEntityData.value.custom_cities || '',
            district: associatedEntityData.value.custom_districts || '',
            state: associatedEntityData.value.custom_states || '',
            status: prospectStatus.value,
            registrationDate: associatedEntityData.value.creation ? new Date(associatedEntityData.value.creation).toISOString().split('T')[0] : '',
            daysSinceStatus: 0
        };
    }
    // Default empty distributor if neither is a distributor
    return {
        id: 'unknown',
        name: 'No Distributor Data',
        category: '',
        subCategory: '',
        city: '',
        district: '',
        state: '',
        status: 'Unknown',
        registrationDate: '',
        daysSinceStatus: 0
    };
});
const manufacturerData = computed(() => {
    // First check if selectedEntityData is a manufacturer
    if (selectedEntityData.value && selectedEntityData.value.custom_lead_category === 'Manufacturer Lead') {
        return {
            id: selectedEntityData.value.name,
            name: selectedEntityData.value.company_name || selectedEntityData.value.name,
            category: selectedEntityData.value.custom_categories || '',
            subCategory: '',
            city: selectedEntityData.value.custom_cities || '',
            district: selectedEntityData.value.custom_districts || '',
            state: selectedEntityData.value.custom_states || '',
            status: prospectStatus.value,
            registrationDate: selectedEntityData.value.creation ? new Date(selectedEntityData.value.creation).toISOString().split('T')[0] : '',
            daysSinceStatus: 0
        };
    }
    // Then check if associatedEntityData is a manufacturer
    if (associatedEntityData.value && associatedEntityData.value.custom_lead_category === 'Manufacturer Lead') {
        return {
            id: associatedEntityData.value.name,
            name: associatedEntityData.value.company_name || associatedEntityData.value.name,
            category: associatedEntityData.value.custom_categories || '',
            subCategory: '',
            city: associatedEntityData.value.custom_cities || '',
            district: associatedEntityData.value.custom_districts || '',
            state: associatedEntityData.value.custom_states || '',
            status: prospectStatus.value,
            registrationDate: associatedEntityData.value.creation ? new Date(associatedEntityData.value.creation).toISOString().split('T')[0] : '',
            daysSinceStatus: 0
        };
    }
    // Default empty manufacturer if neither is a manufacturer
    return {
        id: 'unknown',
        name: 'No Manufacturer Data',
        category: '',
        subCategory: '',
        city: '',
        district: '',
        state: '',
        status: 'Unknown',
        registrationDate: '',
        daysSinceStatus: 0
    };
});
const distributorName = computed(() => distributorData.value.name);
const isManufacturerProspect = computed(() => {
    // Check if the associated entity (clicked from table) is a manufacturer
    if (associatedEntityData.value && associatedEntityData.value.custom_lead_category === 'Manufacturer Lead') {
        return true;
    }
    // Check if the selected entity (from Dashboard) is a manufacturer
    if (selectedEntityData.value && selectedEntityData.value.custom_lead_category === 'Manufacturer Lead') {
        return true;
    }
    // Default to false if we don't have clear manufacturer data
    return false;
});
const manufacturerName = computed(() => manufacturerData.value.name);
// Check if signed agreement is available for customer conversion
const canConvertToCustomer = computed(() => {
    return agreement.value.status === 'Signed' || (currentLeadMapping.value?.signed_agreement);
});
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
const getStatusClass = (status) => {
    switch (status) {
        case 'Draft':
            return 'status-draft';
        case 'Generated':
            return 'status-generated';
        case 'Signed':
            return 'status-signed';
        default:
            return '';
    }
};
const addTerm = () => {
    const newTerm = {
        id: `T${Date.now()}`,
        clause: '',
        response: ''
        // No originalData for new terms
    };
    agreement.value.terms.push(newTerm);
};
const removeTerm = (termId) => {
    const index = agreement.value.terms.findIndex(term => term.id === termId);
    if (index > -1 && agreement.value.terms.length > 1) {
        agreement.value.terms.splice(index, 1);
    }
};
const onClauseChange = (term) => {
    term.response = '';
};
const getResponseOptions = (clause) => {
    console.log('Getting response options for clause:', clause);
    console.log('Available clauseData:', clauseData.value);
    const clauseItem = clauseData.value.find(item => item.clause === clause);
    console.log('Found clause item:', clauseItem);
    if (clauseItem && clauseItem.responses) {
        // Split responses by newline and filter out empty lines
        const responses = clauseItem.responses.split('\n').filter((response) => response.trim() !== '');
        console.log('Extracted responses:', responses);
        return responses;
    }
    console.log('No responses found for clause:', clause);
    return [];
};
// Helper function to check if a response is valid for a clause
const isValidResponse = (clause, response) => {
    const validResponses = getResponseOptions(clause);
    return validResponses.includes(response);
};
// Function to save terms and conditions to API
const saveTermsAndConditions = async () => {
    try {
        if (!currentLeadMapping.value || !currentLeadMapping.value.name) {
            console.error('No Lead Mapping found to save terms');
            return;
        }
        // Prepare terms data in the required format
        const termsData = agreement.value.terms.map((term, index) => {
            // Find the clause data to get the clause ID
            const clauseItem = clauseData.value.find(item => item.clause === term.clause);
            const termData = {
                docstatus: 0,
                doctype: "Lead Mapping TnC",
                owner: "Administrator",
                parent: currentLeadMapping.value.name,
                parentfield: "terms_and_conditions",
                parenttype: "Lead Mapping",
                idx: index + 1,
                clause_text: term.clause,
                clause: clauseItem ? clauseItem.name : "",
                response: term.response
            };
            // If term has originalData, it's an existing term
            if (term.originalData) {
                termData.name = term.originalData.name;
                termData.creation = term.originalData.creation;
                termData.modified = term.originalData.modified;
                termData.modified_by = term.originalData.modified_by;
            }
            else {
                // For new terms, add the __islocal and __unsaved flags
                termData.__islocal = 1;
                termData.__unsaved = 1;
                termData.__unedited = false;
            }
            return termData;
        });
        const requestData = {
            terms_and_conditions: termsData
        };
        console.log('Saving terms to Lead Mapping:', currentLeadMapping.value.name);
        console.log('Current agreement terms:', agreement.value.terms);
        console.log('Prepared terms data:', termsData);
        console.log('Request data:', requestData);
        const response = await fetch(`/api/resource/Lead Mapping/${currentLeadMapping.value.name}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        if (response.ok) {
            const data = await response.json();
            console.log('Terms saved successfully:', data);
            // Reload the Lead Mapping data to get updated terms
            await fetchLeadMapping();
            // Update the agreement state
            updateAgreement(agreement.value);
        }
        else {
            const errorData = await response.json();
            console.error('Failed to save terms:', errorData);
        }
    }
    catch (error) {
        console.error('Error saving terms and conditions:', error);
    }
};
const toggleEditMode = async () => {
    if (editMode.value) {
        // Save terms & conditions to API
        await saveTermsAndConditions();
    }
    editMode.value = !editMode.value;
};
const generateAgreement = () => {
    showPreviewModal.value = true;
};
const closePreview = () => {
    showPreviewModal.value = false;
};
const confirmGeneration = () => {
    const updatedAgreement = {
        ...agreement.value,
        status: 'Generated',
        version: agreement.value.version + 1,
        createdDate: new Date().toISOString()
    };
    updateAgreement(updatedAgreement);
    showPreviewModal.value = false;
    console.log('Agreement generated successfully');
};
const downloadAgreement = () => {
    if (!currentLeadMapping.value || !currentLeadMapping.value.name) {
        console.error('Error: No Lead Mapping found to download agreement');
        return;
    }
    const link = document.createElement('a');
    link.href = `/api/method/frappe.utils.print_format.download_pdf?doctype=Lead%20Mapping&name=${currentLeadMapping.value.name}&format=Lead%20Mapping%20Agreement&no_letterhead=1&letterhead=No%20Letterhead&settings=%7B%7D&_lang=en`;
    link.download = `Agreement_${manufacturerName.value}_${distributorName.value}_v${agreement.value.version}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('Agreement download initiated');
};
const uploadSigned = () => {
    showUploadModal.value = true;
};
const closeUpload = () => {
    showUploadModal.value = false;
    selectedFile.value = null;
};
const handleFileUpload = (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
        selectedFile.value = target.files[0];
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
const submitUpload = async () => {
    if (selectedFile.value) {
        try {
            if (!currentLeadMapping.value || !currentLeadMapping.value.name) {
                console.error('Error: No Lead Mapping found to upload signed agreement');
                return;
            }
            const res = await fetch('/api/method/frappe.auth.get_logged_user');
            const data = await res.json();
            const formatted = formatDateTime(new Date());
            // Create form data for file upload
            const formData = new FormData();
            formData.append('file', selectedFile.value);
            formData.append('doctype', 'Lead Mapping');
            formData.append('docname', currentLeadMapping.value.name);
            formData.append('fieldname', 'signed_agreement');
            formData.append('is_private', '0');
            // Upload file to Frappe
            const uploadResponse = await fetch('/api/method/upload_file', {
                method: 'POST',
                body: formData
            });
            if (uploadResponse.ok) {
                const uploadData = await uploadResponse.json();
                console.log('File uploaded successfully:', uploadData);
                // Update the Lead Mapping with both file and status in one API call
                const updateData = {
                    signed_agreement: uploadData.message.file_url,
                    status: 'Prospect',
                    prospect_owner: data.message,
                    prospect_date: formatted
                };
                const updateResponse = await fetch(`/api/resource/Lead Mapping/${currentLeadMapping.value.name}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData)
                });
                if (updateResponse.ok) {
                    const updatedAgreement = {
                        ...agreement.value,
                        status: 'Signed',
                        signedDate: new Date().toISOString()
                    };
                    updateAgreement(updatedAgreement);
                    showUploadModal.value = false;
                    selectedFile.value = null;
                    // Refresh the lead mapping data
                    await fetchLeadMapping();
                    console.log('Signed agreement uploaded successfully! Status updated to Prospect.');
                }
                else {
                    const errorData = await updateResponse.json();
                    console.error('Failed to update Lead Mapping:', errorData);
                }
            }
            else {
                const errorData = await uploadResponse.json();
                console.error('Failed to upload file:', errorData);
            }
        }
        catch (error) {
            console.error('Error uploading signed agreement:', error);
        }
    }
};
const convertToCustomer = () => {
    // Note: This function should be updated to use proper API calls
    // For now, we'll just redirect to the customer page
    console.log('Redirecting to customer conversion...');
    // Navigate to Customer page with both id and parentId (if available)
    const params = { id: props.id };
    if (props.parentId) {
        params.parentId = props.parentId;
    }
    router.push({ name: 'Customer', params });
};
// Function to fetch clause data from API
const fetchClauseData = async () => {
    try {
        const response = await fetch('/api/resource/Lead%20Mapping%20TnC%20Master?fields=["name","clause","responses"]');
        if (response.ok) {
            const data = await response.json();
            console.log('Clause data API response:', data);
            if (data && data.data && data.data.length > 0) {
                clauseData.value = data.data;
                console.log('Loaded clause data:', clauseData.value);
                console.log('First clause example:', clauseData.value[0]);
            }
            else {
                console.warn('No clause data found');
                clauseData.value = [];
            }
        }
        else {
            console.error('Failed to fetch clause data:', response.status);
            clauseData.value = [];
        }
    }
    catch (error) {
        console.error('Error fetching clause data:', error);
        clauseData.value = [];
    }
};
// Function to load existing terms & conditions
const loadExistingTerms = async (existingTerms) => {
    try {
        console.log('Loading existing terms:', existingTerms);
        console.log('Available clause data:', clauseData.value);
        // Clear current terms
        agreement.value.terms = [];
        // Convert existing terms to our format and store original data
        const loadedTerms = existingTerms.map((term, index) => {
            // Find the matching clause from clauseData to get the correct clause text
            let matchingClause = clauseData.value.find(clause => clause.name === term.clause);
            let clauseText = '';
            if (matchingClause) {
                clauseText = matchingClause.clause;
                console.log(`Term ${index}: Found exact match by ID - clause="${clauseText}"`);
            }
            else {
                // Fallback: try to match by clause_text
                matchingClause = clauseData.value.find(clause => clause.clause === term.clause_text);
                if (matchingClause) {
                    clauseText = matchingClause.clause;
                    console.log(`Term ${index}: Found match by text - clause="${clauseText}"`);
                }
                else {
                    // Last fallback: use clause_text as is
                    clauseText = term.clause_text || '';
                    console.log(`Term ${index}: No match found, using clause_text="${clauseText}"`);
                }
            }
            console.log(`Term ${index}: API clause_text="${term.clause_text}", API clause="${term.clause}", final clause="${clauseText}"`);
            console.log(`Term ${index}: Response="${term.response}"`);
            return {
                id: term.name || `T${Date.now()}-${index}`, // Use original name as ID
                clause: clauseText, // Use the clause text that matches dropdown options
                response: term.response || '',
                originalData: term // Store original term data for updates
            };
        });
        // Update agreement with loaded terms
        agreement.value.terms = loadedTerms;
        console.log('Final loaded terms into agreement:', loadedTerms);
        console.log('All clause options available:', clauseData.value.map(c => c.clause));
        // Update the agreement state
        updateAgreement(agreement.value);
    }
    catch (error) {
        console.error('Error loading existing terms:', error);
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
            // First get the Lead Mapping to find the ID
            const filterUrl = `/api/resource/Lead Mapping?fields=["name"]&filters=${encodeURIComponent(JSON.stringify(filters))}`;
            const filterResponse = await fetch(filterUrl);
            if (filterResponse.ok) {
                const filterData = await filterResponse.json();
                console.log('Lead Mapping filter response:', filterData);
                if (filterData && filterData.data && filterData.data.length > 0) {
                    const leadMappingId = filterData.data[0].name;
                    console.log('Found Lead Mapping ID:', leadMappingId);
                    // Now fetch the complete Lead Mapping with all fields
                    const detailUrl = `/api/resource/Lead Mapping/${leadMappingId}`;
                    const detailResponse = await fetch(detailUrl);
                    if (detailResponse.ok) {
                        const detailData = await detailResponse.json();
                        console.log('Lead Mapping detail response:', detailData);
                        if (detailData && detailData.data) {
                            currentLeadMapping.value = detailData.data;
                            prospectStatus.value = currentLeadMapping.value.status || 'Prospect';
                            console.log('Current Lead Mapping:', currentLeadMapping.value);
                            // Load existing terms & conditions if available
                            if (currentLeadMapping.value.terms_and_conditions && currentLeadMapping.value.terms_and_conditions.length > 0) {
                                await loadExistingTerms(currentLeadMapping.value.terms_and_conditions);
                            }
                        }
                    }
                }
                else {
                    // No mapping found, keep default status
                    prospectStatus.value = 'Prospect';
                }
            }
        }
    }
    catch (error) {
        console.error('Error fetching lead mapping:', error);
        prospectStatus.value = 'Prospect';
    }
};
// Function to get status badge class
const getStatusBadgeClass = (status) => {
    const base = 'status-badge';
    return `${base} ${{
        Verified: 'status-registration',
        Lead: 'status-lead',
        Prospect: 'status-prospect',
        Customer: 'status-customer',
        View: 'status-view'
    }[status] || 'status-prospect'}`;
};
onMounted(async () => {
    console.log('Loading prospect data for ID:', props.id, 'ParentID:', props.parentId);
    try {
        // Fetch clause data first - this is crucial for term mapping
        await fetchClauseData();
        console.log('Clause data loaded, now fetching entities...');
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
        console.log('Manufacturer Data:', manufacturerData.value);
        console.log('Distributor Data:', distributorData.value);
        console.log('Is Manufacturer Prospect:', isManufacturerProspect.value);
        // Fetch current Lead Mapping to get the current status - this will trigger loadExistingTerms
        console.log('Now fetching Lead Mapping...');
        await fetchLeadMapping();
    }
    catch (error) {
        console.error('Error fetching prospect data:', error);
        // Keep default values if API calls fail
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['btn-floating-back']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-edit']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-edit']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
/** @type {__VLS_StyleScopedClasses['term-field']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-select']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-select']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-delete']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-delete']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add-term']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add-term']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save-changes']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save-changes']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-text']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-remove-file']} */ ;
/** @type {__VLS_StyleScopedClasses['prospect-content']} */ ;
/** @type {__VLS_StyleScopedClasses['term-content']} */ ;
/** @type {__VLS_StyleScopedClasses['terms-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['terms-container']} */ ;
/** @type {__VLS_StyleScopedClasses['entity-type']} */ ;
/** @type {__VLS_StyleScopedClasses['entity-type-mob']} */ ;
/** @type {__VLS_StyleScopedClasses['relationship-header']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['relationship-info']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-header']} */ ;
/** @type {__VLS_StyleScopedClasses['relationship-description']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-back-button']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['terms-section']} */ ;
/** @type {__VLS_StyleScopedClasses['agreement-section']} */ ;
/** @type {__VLS_StyleScopedClasses['table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['term-card']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add-term']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save-changes']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "prospect-page" },
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
    ...{ class: (__VLS_ctx.isManufacturerProspect ? 'manufacturer' : 'manufacturer') },
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
    ...{ class: (!__VLS_ctx.isManufacturerProspect ? 'distributor' : 'distributor') },
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
    ...{ class: (__VLS_ctx.getStatusBadgeClass(__VLS_ctx.prospectStatus)) },
    ...{ class: "header-status" },
});
(__VLS_ctx.prospectStatus);
if (__VLS_ctx.currentLeadMapping?.last_status_change) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "status-date" },
    });
    (__VLS_ctx.formatDate(__VLS_ctx.currentLeadMapping.last_status_change));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "relationship-description" },
});
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
    ...{ class: "prospect-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "terms-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.editMode = !__VLS_ctx.editMode;
        } },
    type: "button",
    ...{ class: "btn-edit" },
});
(__VLS_ctx.editMode ? 'Cancel' : 'Edit Terms');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "terms-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "terms-list" },
});
for (const [term] of __VLS_getVForSourceType((__VLS_ctx.agreement.terms))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (term.id),
        ...{ class: "term-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "term-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "term-field" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        ...{ onChange: (...[$event]) => {
                __VLS_ctx.onClauseChange(term);
            } },
        value: (term.clause),
        disabled: (!__VLS_ctx.editMode),
        ...{ class: "modern-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    for (const [clause] of __VLS_getVForSourceType((__VLS_ctx.clauseData))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: (clause.name),
            value: (clause.clause),
        });
        (clause.clause);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "term-field" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (term.response),
        disabled: (!__VLS_ctx.editMode || !term.clause),
        ...{ class: "modern-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "",
    });
    if (term.response && !__VLS_ctx.isValidResponse(term.clause, term.response)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: (term.response),
            ...{ style: {} },
        });
        (term.response);
    }
    for (const [response] of __VLS_getVForSourceType((__VLS_ctx.getResponseOptions(term.clause)))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            key: (response),
            value: (response),
        });
        (response);
    }
    if (__VLS_ctx.editMode) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "term-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.editMode))
                        return;
                    __VLS_ctx.removeTerm(term.id);
                } },
            type: "button",
            ...{ class: "btn-delete" },
            disabled: (__VLS_ctx.agreement.terms.length <= 1),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            width: "14",
            height: "14",
            viewBox: "0 0 14 14",
            fill: "none",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5",
            stroke: "currentColor",
            'stroke-width': "1.5",
            'stroke-linecap': "round",
            'stroke-linejoin': "round",
        });
    }
}
if (__VLS_ctx.editMode) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "terms-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.addTerm) },
        type: "button",
        ...{ class: "btn-add-term" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        width: "14",
        height: "14",
        viewBox: "0 0 14 14",
        fill: "none",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M7 3.5V10.5M3.5 7H10.5",
        stroke: "currentColor",
        'stroke-width': "1.5",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleEditMode) },
        type: "button",
        ...{ class: "btn-save-changes" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        width: "14",
        height: "14",
        viewBox: "0 0 14 14",
        fill: "none",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
        d: "M11.667 3.5L5.25 9.917L2.333 7",
        stroke: "currentColor",
        'stroke-width': "1.5",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "agreement-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "section-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "agreement-info-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "info-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: (__VLS_ctx.getStatusClass(__VLS_ctx.agreement.status)) },
    ...{ class: "status-indicator" },
});
(__VLS_ctx.agreement.status);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "info-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "info-value" },
});
(__VLS_ctx.agreement.version);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "info-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "info-value" },
});
(__VLS_ctx.formatDate(__VLS_ctx.agreement.createdDate));
if (__VLS_ctx.agreement.signedDate) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-value" },
    });
    (__VLS_ctx.formatDate(__VLS_ctx.agreement.signedDate));
}
if (__VLS_ctx.currentLeadMapping?.signed_agreement) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-value" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "agreement-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.generateAgreement) },
    ...{ class: "btn-primary" },
    disabled: (__VLS_ctx.agreement.status === 'Signed'),
});
(__VLS_ctx.agreement.status === 'Draft' ? '📄 Generate Agreement' : '🔄 Regenerate Agreement');
if (__VLS_ctx.agreement.status !== 'Draft') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.downloadAgreement) },
        ...{ class: "btn-secondary" },
    });
}
if (__VLS_ctx.agreement.status === 'Generated') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.uploadSigned) },
        ...{ class: "btn-secondary" },
    });
}
if (__VLS_ctx.canConvertToCustomer) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.convertToCustomer) },
        ...{ class: "btn-success" },
    });
}
if (__VLS_ctx.showPreviewModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closePreview) },
        ...{ class: "modal-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: () => { } },
        ...{ class: "modal-content large-modal" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closePreview) },
        ...{ class: "btn-close" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "agreement-preview" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "preview-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.manufacturerName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.distributorName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.agreement.version);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.formatDate(__VLS_ctx.agreement.createdDate));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "terms-preview" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "terms-preview-list" },
    });
    for (const [term] of __VLS_getVForSourceType((__VLS_ctx.agreement.terms))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (term.id),
            ...{ class: "term-preview-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "term-preview-clause" },
        });
        (term.clause);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "term-preview-response" },
        });
        (term.response);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closePreview) },
        ...{ class: "btn-secondary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.confirmGeneration) },
        ...{ class: "btn-primary" },
    });
}
if (__VLS_ctx.showUploadModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closeUpload) },
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
        ...{ onClick: (__VLS_ctx.closeUpload) },
        ...{ class: "btn-close" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "upload-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "upload-area" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        ...{ onChange: (__VLS_ctx.handleFileUpload) },
        type: "file",
        ref: "fileInput",
        accept: ".pdf,.doc,.docx",
        ...{ class: "file-input-hidden" },
        id: "file-upload",
    });
    /** @type {typeof __VLS_ctx.fileInput} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: "file-upload",
        ...{ class: "upload-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "upload-icon" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "upload-text" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    if (__VLS_ctx.selectedFile) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "selected-file" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "file-name" },
        });
        (__VLS_ctx.selectedFile.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.showUploadModal))
                        return;
                    if (!(__VLS_ctx.selectedFile))
                        return;
                    __VLS_ctx.selectedFile = null;
                } },
            ...{ class: "btn-remove-file" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "modal-footer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeUpload) },
        ...{ class: "btn-secondary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.submitUpload) },
        ...{ class: "btn-primary" },
        disabled: (!__VLS_ctx.selectedFile),
    });
}
/** @type {__VLS_StyleScopedClasses['prospect-page']} */ ;
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
/** @type {__VLS_StyleScopedClasses['relationship-description']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-back-button']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-floating-back']} */ ;
/** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['prospect-content']} */ ;
/** @type {__VLS_StyleScopedClasses['terms-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-edit']} */ ;
/** @type {__VLS_StyleScopedClasses['terms-container']} */ ;
/** @type {__VLS_StyleScopedClasses['terms-list']} */ ;
/** @type {__VLS_StyleScopedClasses['term-card']} */ ;
/** @type {__VLS_StyleScopedClasses['term-content']} */ ;
/** @type {__VLS_StyleScopedClasses['term-field']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-select']} */ ;
/** @type {__VLS_StyleScopedClasses['term-field']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-select']} */ ;
/** @type {__VLS_StyleScopedClasses['term-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-delete']} */ ;
/** @type {__VLS_StyleScopedClasses['terms-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add-term']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-save-changes']} */ ;
/** @type {__VLS_StyleScopedClasses['agreement-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['agreement-info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['status-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['agreement-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-success']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['large-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['agreement-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-header']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['terms-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['terms-preview-list']} */ ;
/** @type {__VLS_StyleScopedClasses['term-preview-item']} */ ;
/** @type {__VLS_StyleScopedClasses['term-preview-clause']} */ ;
/** @type {__VLS_StyleScopedClasses['term-preview-response']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-close']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-section']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['file-input-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-label']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-text']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-file']} */ ;
/** @type {__VLS_StyleScopedClasses['file-name']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-remove-file']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            agreement: agreement,
            editMode: editMode,
            showPreviewModal: showPreviewModal,
            showUploadModal: showUploadModal,
            selectedFile: selectedFile,
            fileInput: fileInput,
            currentLeadMapping: currentLeadMapping,
            prospectStatus: prospectStatus,
            clauseData: clauseData,
            distributorName: distributorName,
            isManufacturerProspect: isManufacturerProspect,
            manufacturerName: manufacturerName,
            canConvertToCustomer: canConvertToCustomer,
            formatDate: formatDate,
            getStatusClass: getStatusClass,
            addTerm: addTerm,
            removeTerm: removeTerm,
            onClauseChange: onClauseChange,
            getResponseOptions: getResponseOptions,
            isValidResponse: isValidResponse,
            toggleEditMode: toggleEditMode,
            generateAgreement: generateAgreement,
            closePreview: closePreview,
            confirmGeneration: confirmGeneration,
            downloadAgreement: downloadAgreement,
            uploadSigned: uploadSigned,
            closeUpload: closeUpload,
            handleFileUpload: handleFileUpload,
            submitUpload: submitUpload,
            convertToCustomer: convertToCustomer,
            getStatusBadgeClass: getStatusBadgeClass,
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
