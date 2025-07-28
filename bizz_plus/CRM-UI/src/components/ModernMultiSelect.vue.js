import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
const props = withDefaults(defineProps(), {
    placeholder: 'Select options...',
    searchable: true
});
const emit = defineEmits();
const dropdown = ref();
const panel = ref();
const searchInput = ref();
const optionsList = ref();
const isOpen = ref(false);
const searchTerm = ref('');
const localSelected = ref([]);
const panelStyles = ref({});
const filteredOptions = computed(() => {
    if (!searchTerm.value)
        return props.options;
    return props.options.filter(option => option.toLowerCase().includes(searchTerm.value.toLowerCase()));
});
const isSelected = (option) => {
    return localSelected.value.includes(option);
};
const toggleOption = (option, event) => {
    // Prevent default behavior and scrolling
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const index = localSelected.value.indexOf(option);
    let newSelected;
    if (index > -1) {
        newSelected = localSelected.value.filter(item => item !== option);
    }
    else {
        newSelected = [...localSelected.value, option];
    }
    localSelected.value = newSelected;
    // Emit immediately to prevent reactivity issues in production
    emit('update:selected', newSelected);
};
const toggleDropdown = (event) => {
    // Prevent default behavior and scrolling
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (isOpen.value) {
        closeDropdown();
    }
    else {
        openDropdown();
    }
};
const openDropdown = () => {
    // Prevent page scroll when opening dropdown
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    isOpen.value = true;
    searchTerm.value = '';
    // Emit dropdown opened event for lazy loading
    emit('dropdown-opened');
    // Add body class to prevent scrolling (optional, but helpful for mobile)
    document.body.style.setProperty('--scroll-y', `${currentScrollPosition}px`);
    nextTick(() => {
        positionDropdown();
        // Ensure page doesn't scroll
        window.scrollTo(0, currentScrollPosition);
        // Focus search input if searchable, but prevent scroll
        if (props.searchable && searchInput.value) {
            searchInput.value.focus({ preventScroll: true });
        }
    });
};
const closeDropdown = () => {
    isOpen.value = false;
    searchTerm.value = '';
    panelStyles.value = {};
    // Restore scrolling capability
    document.body.style.removeProperty('--scroll-y');
};
const positionDropdown = () => {
    if (!dropdown.value || !panel.value)
        return;
    try {
        const triggerRect = dropdown.value.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        // Calculate available space
        const spaceBelow = viewportHeight - triggerRect.bottom - 10;
        const spaceAbove = triggerRect.top - 10;
        const maxPanelHeight = 320;
        const minPanelHeight = 200;
        let top = 0;
        let maxHeight = maxPanelHeight;
        // Determine if dropdown should open above or below
        if (spaceBelow >= minPanelHeight || spaceBelow >= spaceAbove) {
            // Position below
            top = triggerRect.bottom + 4;
            maxHeight = Math.min(maxPanelHeight, spaceBelow - 10);
        }
        else {
            // Position above
            top = triggerRect.top - Math.min(maxPanelHeight, spaceAbove - 10) - 4;
            maxHeight = Math.min(maxPanelHeight, spaceAbove - 10);
        }
        // Ensure minimum height
        maxHeight = Math.max(maxHeight, 150);
        // Calculate horizontal position
        let left = triggerRect.left;
        const panelWidth = triggerRect.width;
        // Ensure panel doesn't go off screen horizontally
        if (left + panelWidth > viewportWidth - 10) {
            left = viewportWidth - panelWidth - 10;
        }
        if (left < 10) {
            left = 10;
        }
        panelStyles.value = {
            position: 'fixed',
            top: `${top}px`,
            left: `${left}px`,
            width: `${triggerRect.width}px`,
            maxHeight: `${maxHeight}px`,
            zIndex: '999999',
            transform: 'none'
        };
    }
    catch (error) {
        console.warn('Error positioning dropdown:', error);
        // Fallback positioning
        panelStyles.value = {
            position: 'fixed',
            top: '100px',
            left: '50px',
            width: '200px',
            maxHeight: '300px',
            zIndex: '999999',
            transform: 'none'
        };
    }
};
const selectAll = (event) => {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const newSelected = [...new Set([...localSelected.value, ...filteredOptions.value])];
    localSelected.value = newSelected;
    emit('update:selected', newSelected);
};
const clearAll = (event) => {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    localSelected.value = [];
    emit('update:selected', []);
};
const handleClickOutside = (event) => {
    try {
        if (dropdown.value && !dropdown.value.contains(event.target) &&
            panel.value && !panel.value.contains(event.target)) {
            closeDropdown();
        }
    }
    catch (error) {
        console.warn('Error in click outside handler:', error);
    }
};
let resizeTimeout = null;
const handleResize = () => {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    resizeTimeout = window.setTimeout(() => {
        if (isOpen.value) {
            positionDropdown();
        }
    }, 100);
};
let scrollTimeout = null;
const handleScroll = () => {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = window.setTimeout(() => {
        if (isOpen.value) {
            positionDropdown();
        }
    }, 50);
};
// Watch for prop changes
watch(() => props.selected, (newVal) => {
    // Only update if the values are actually different to prevent loops
    if (JSON.stringify(newVal) !== JSON.stringify(localSelected.value)) {
        localSelected.value = [...newVal];
    }
}, { immediate: true });
// Remove the deep watcher that can cause infinite loops in production
// Instead, emit directly in the methods above
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', handleResize);
    document.addEventListener('scroll', handleScroll, true);
});
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('scroll', handleScroll, true);
    // Clean up timeouts
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    placeholder: 'Select options...',
    searchable: true
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['multiselect-trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect-trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect-trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['trigger-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['select-all-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['select-all-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-all-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-all-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-custom']} */ ;
/** @type {__VLS_StyleScopedClasses['no-options']} */ ;
/** @type {__VLS_StyleScopedClasses['no-options']} */ ;
/** @type {__VLS_StyleScopedClasses['options-list']} */ ;
/** @type {__VLS_StyleScopedClasses['options-list']} */ ;
/** @type {__VLS_StyleScopedClasses['options-list']} */ ;
/** @type {__VLS_StyleScopedClasses['options-list']} */ ;
/** @type {__VLS_StyleScopedClasses['options-list']} */ ;
/** @type {__VLS_StyleScopedClasses['options-list']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect-trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['option-text']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-custom']} */ ;
/** @type {__VLS_StyleScopedClasses['check-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['options-header']} */ ;
/** @type {__VLS_StyleScopedClasses['select-all-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-all-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect-trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['option-text']} */ ;
/** @type {__VLS_StyleScopedClasses['search-container']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-count']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modern-multiselect" },
    ref: "dropdown",
});
/** @type {typeof __VLS_ctx.dropdown} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.toggleDropdown) },
    ...{ onMousedown: () => { } },
    ...{ class: "multiselect-trigger" },
    ...{ class: ({
            open: __VLS_ctx.isOpen,
            'has-selections': __VLS_ctx.selected.length > 0
        }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trigger-content" },
});
if (__VLS_ctx.selected.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "placeholder" },
    });
    (__VLS_ctx.placeholder);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "selected-display" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "selected-count" },
    });
    (__VLS_ctx.selected.length);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "trigger-icon" },
    ...{ class: ({ rotated: __VLS_ctx.isOpen }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "currentColor",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M2.5 4.5L6 8L9.5 4.5",
    stroke: "currentColor",
    'stroke-width': "1.5",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    fill: "none",
});
if (__VLS_ctx.isOpen) {
    const __VLS_0 = {}.Teleport;
    /** @type {[typeof __VLS_components.Teleport, typeof __VLS_components.Teleport, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: "body",
        disabled: (false),
    }));
    const __VLS_2 = __VLS_1({
        to: "body",
        disabled: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: () => { } },
        ...{ onClick: () => { } },
        ...{ onWheel: () => { } },
        ...{ onTouchmove: () => { } },
        ...{ class: "dropdown-panel" },
        ref: "panel",
        ...{ style: (__VLS_ctx.panelStyles) },
    });
    /** @type {typeof __VLS_ctx.panel} */ ;
    if (__VLS_ctx.searchable) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "search-container" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "search-input-wrapper" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            ...{ class: "search-icon" },
            width: "14",
            height: "14",
            viewBox: "0 0 14 14",
            fill: "currentColor",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            d: "M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onMousedown: () => { } },
            ...{ onClick: () => { } },
            type: "text",
            value: (__VLS_ctx.searchTerm),
            placeholder: "Search options...",
            ...{ class: "search-input" },
            ref: "searchInput",
        });
        /** @type {typeof __VLS_ctx.searchInput} */ ;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "options-container" },
    });
    if (__VLS_ctx.filteredOptions.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "options-header" },
        });
        if (__VLS_ctx.filteredOptions.length > __VLS_ctx.selected.length) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onMousedown: () => { } },
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.isOpen))
                            return;
                        if (!(__VLS_ctx.filteredOptions.length > 0))
                            return;
                        if (!(__VLS_ctx.filteredOptions.length > __VLS_ctx.selected.length))
                            return;
                        __VLS_ctx.selectAll($event);
                    } },
                ...{ class: "select-all-btn" },
            });
            (__VLS_ctx.filteredOptions.length);
        }
        if (__VLS_ctx.selected.length > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onMousedown: () => { } },
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.isOpen))
                            return;
                        if (!(__VLS_ctx.filteredOptions.length > 0))
                            return;
                        if (!(__VLS_ctx.selected.length > 0))
                            return;
                        __VLS_ctx.clearAll($event);
                    } },
                ...{ class: "clear-all-btn" },
            });
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "options-list" },
        ref: "optionsList",
    });
    /** @type {typeof __VLS_ctx.optionsList} */ ;
    for (const [option] of __VLS_getVForSourceType((__VLS_ctx.filteredOptions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onMousedown: () => { } },
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isOpen))
                        return;
                    __VLS_ctx.toggleOption(option, $event);
                } },
            key: (option),
            ...{ class: "option-item" },
            ...{ class: ({ selected: __VLS_ctx.isSelected(option) }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "option-checkbox" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "checkbox-custom" },
            ...{ class: ({ checked: __VLS_ctx.isSelected(option) }) },
        });
        if (__VLS_ctx.isSelected(option)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
                ...{ class: "check-icon" },
                width: "12",
                height: "12",
                viewBox: "0 0 12 12",
                fill: "none",
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
                d: "M10 3L4.5 8.5L2 6",
                stroke: "currentColor",
                'stroke-width': "2",
                'stroke-linecap': "round",
                'stroke-linejoin': "round",
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "option-text" },
        });
        (option);
    }
    if (__VLS_ctx.filteredOptions.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "no-options" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "no-options-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        if (__VLS_ctx.searchTerm) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        }
    }
    if (__VLS_ctx.selected.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "dropdown-footer" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "selected-summary" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "summary-text" },
        });
        (__VLS_ctx.selected.length);
        (__VLS_ctx.selected.length !== 1 ? 's' : '');
    }
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['modern-multiselect']} */ ;
/** @type {__VLS_StyleScopedClasses['multiselect-trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['has-selections']} */ ;
/** @type {__VLS_StyleScopedClasses['trigger-content']} */ ;
/** @type {__VLS_StyleScopedClasses['placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-display']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-count']} */ ;
/** @type {__VLS_StyleScopedClasses['trigger-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['rotated']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['search-container']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['search-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['options-container']} */ ;
/** @type {__VLS_StyleScopedClasses['options-header']} */ ;
/** @type {__VLS_StyleScopedClasses['select-all-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-all-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['options-list']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
/** @type {__VLS_StyleScopedClasses['option-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['checkbox-custom']} */ ;
/** @type {__VLS_StyleScopedClasses['checked']} */ ;
/** @type {__VLS_StyleScopedClasses['check-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['option-text']} */ ;
/** @type {__VLS_StyleScopedClasses['no-options']} */ ;
/** @type {__VLS_StyleScopedClasses['no-options-content']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            dropdown: dropdown,
            panel: panel,
            searchInput: searchInput,
            optionsList: optionsList,
            isOpen: isOpen,
            searchTerm: searchTerm,
            panelStyles: panelStyles,
            filteredOptions: filteredOptions,
            isSelected: isSelected,
            toggleOption: toggleOption,
            toggleDropdown: toggleDropdown,
            selectAll: selectAll,
            clearAll: clearAll,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
