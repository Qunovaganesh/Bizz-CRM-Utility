import { ref, computed, onMounted, onUnmounted } from 'vue';
const props = defineProps();
const getStatusBadgeClass = (status) => {
    const baseClass = 'status-badge';
    switch (status) {
        case 'Open':
            return `${baseClass} status-registration`;
        case 'Replied':
            return `${baseClass} status-lead`;
        case 'Opportunity':
            return `${baseClass} status-prospect`;
        case 'Verified':
            return `${baseClass} status-customer`;
        case 'View':
            return `${baseClass} status-view`;
        default:
            return `${baseClass} status-registration`;
    }
};
// const leadStatus = ref('Verified'); // Default to 'Registration', will be updated based on interactions
// const selectedEntityData = ref<any>(null); // Main selected entity from Dashboard
// const associatedEntityData = ref<any>(null); // Associated entity clicked from table
const apiInteractions = ref([]); // API interactions data
const isLoadingInteractions = ref(false);
const isSubmittingInteraction = ref(false);
// const currentLeadMapping = ref<any>(null); // Current lead mapping record
const showNotesModal = ref(false);
const selectedInteraction = ref(null);
const isMobile = ref(false);
const userOptions = ref([]);
const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
};
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
onMounted(async () => {
    fetchInteractions();
    try {
        const res = await fetch('/api/method/bizz_plus.api.api.get_users');
        const data = await res.json();
        userOptions.value = data.message;
    }
    catch (err) {
        console.error("Failed to fetch users", err);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
});
onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
});
const viewNotes = (interaction) => {
    selectedInteraction.value = {
        id: interaction.name,
        interactedBy: interaction.assigned_by_name || 'Unknown',
        dateInteracted: interaction.posting_date,
        mode: interaction.interaction_mode,
        notes: interaction.notes || '',
        hasReminder: !!interaction.reminder_date,
        reminderDate: interaction.reminder_date || '',
        timeElapsed: getTimeElapsed(interaction.posting_date),
        attachments: [],
        assignedTo: interaction.assigned_to_name || 'Unknown'
    };
    showNotesModal.value = true;
};
const submitNotes = async () => {
    const res = await fetch('/api/method/frappe.auth.get_logged_user');
    const data = await res.json();
    try {
        const interactionData = {
            interaction_mode: newInteraction.value.mode,
            notes: newInteraction.value.notes,
            reminder_date: newInteraction.value.reminderDate,
            lead: props.id,
            assigned_by: data.message,
            assigned_to: newInteraction.value.assignedTo
        };
        const response = await fetch('/api/resource/Bizz Interaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(interactionData)
        });
        if (response.ok) {
            console.log(response.ok);
            await fetchInteractions();
            // Reset form
            resetForm();
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
const handleFileUpload = (event) => {
    const target = event.target;
    if (target.files) {
        newInteraction.value.attachments = Array.from(target.files).map(file => file.name);
    }
};
const today = computed(() => {
    return new Date().toISOString().split('T')[0];
});
const closeModal = () => {
    showNotesModal.value = false;
    selectedInteraction.value = null;
};
const fetchInteractions = async () => {
    if (isLoadingInteractions.value)
        return;
    isLoadingInteractions.value = true;
    try {
        // Build the API URL with filters
        let url = '/api/resource/Bizz Interaction?fields=["name","interaction_mode","notes","reminder_date", "lead","posting_date","owner", "assigned_to_name", "assigned_by_name"]';
        // Add filters based on current lead IDs
        const filters = {};
        filters.lead = props.id;
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
/** @type {__VLS_StyleScopedClasses['floating-header']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-promote-button']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['lead-page']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-floating-promote']} */ ;
/** @type {__VLS_StyleScopedClasses['floating-back-button']} */ ;
/** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['lead-content']} */ ;
/** @type {__VLS_StyleScopedClasses['interactions-section']} */ ;
/** @type {__VLS_StyleScopedClasses['notes-section']} */ ;
/** @type {__VLS_StyleScopedClasses['associated-section']} */ ;
/** @type {__VLS_StyleScopedClasses['potential-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['relationship-info']} */ ;
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
/** @type {__VLS_StyleScopedClasses['relationship-header']} */ ;
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "relationship-info" },
});
if (__VLS_ctx.category == 'manufacturer') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: (__VLS_ctx.category == 'manufacturer' ? 'manufacturer selected-entity' : 'manufacturer') },
    });
    (props.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "entity-type" },
    });
}
if (__VLS_ctx.category == 'distributor') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: (__VLS_ctx.category == 'distributor' ? 'distributor selected-entity' : 'distributor') },
    });
    (props.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "entity-type" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: (__VLS_ctx.getStatusBadgeClass(props.status)) },
});
(props.status);
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
        ((interaction.assigned_by_name || 'U').charAt(0));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "user-name" },
        });
        (interaction.assigned_by_name || 'Unknown');
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
        (__VLS_ctx.formatDate(interaction.posting_date));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "time-elapsed" },
        });
        (__VLS_ctx.getTimeElapsed(interaction.posting_date));
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
        (row.assigned_by_name ? row.assigned_by_name : 'Unknown');
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
        (__VLS_ctx.formatDate(row.posting_date));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "value" },
        });
        (__VLS_ctx.getTimeElapsed(row.posting_date));
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
/** @type {__VLS_StyleScopedClasses['relationship-info']} */ ;
/** @type {__VLS_StyleScopedClasses['entity-type']} */ ;
/** @type {__VLS_StyleScopedClasses['entity-type']} */ ;
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
            getStatusBadgeClass: getStatusBadgeClass,
            apiInteractions: apiInteractions,
            isLoadingInteractions: isLoadingInteractions,
            isSubmittingInteraction: isSubmittingInteraction,
            showNotesModal: showNotesModal,
            selectedInteraction: selectedInteraction,
            isMobile: isMobile,
            userOptions: userOptions,
            newInteraction: newInteraction,
            formatDate: formatDate,
            getTimeElapsed: getTimeElapsed,
            getModeClass: getModeClass,
            viewNotes: viewNotes,
            submitNotes: submitNotes,
            resetForm: resetForm,
            handleFileUpload: handleFileUpload,
            today: today,
            closeModal: closeModal,
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
