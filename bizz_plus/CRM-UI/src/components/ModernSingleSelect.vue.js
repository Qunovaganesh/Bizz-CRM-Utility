import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
const props = defineProps();
const emit = defineEmits();
const dropdown = ref();
const panel = ref();
const isOpen = ref(false);
const panelStyles = ref({});
const selectedLabel = computed(() => {
    return props.selected || props.placeholder || 'Select...';
});
const toggleDropdown = () => {
    if (isOpen.value) {
        closeDropdown();
    }
    else {
        openDropdown();
    }
};
const openDropdown = () => {
    isOpen.value = true;
    nextTick(() => {
        positionDropdown();
    });
};
const closeDropdown = () => {
    isOpen.value = false;
    panelStyles.value = {};
};
const selectOption = (option) => {
    emit('update:selected', option);
    closeDropdown();
};
const positionDropdown = () => {
    if (!dropdown.value || !panel.value)
        return;
    const rect = dropdown.value.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const top = rect.bottom + 4;
    let left = rect.left;
    const width = rect.width;
    // Adjust if dropdown goes beyond viewport width
    if (left + width > viewportWidth - 10) {
        left = viewportWidth - width - 10;
    }
    if (left < 10) {
        left = 10;
    }
    panelStyles.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        maxHeight: '300px',
        overflowY: 'auto',
        zIndex: '9999',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '6px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    };
};
const onClickOutside = (event) => {
    if (dropdown.value && !dropdown.value.contains(event.target) &&
        panel.value && !panel.value.contains(event.target)) {
        closeDropdown();
    }
};
onMounted(() => {
    document.addEventListener('click', onClickOutside);
});
onUnmounted(() => {
    document.removeEventListener('click', onClickOutside);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['select-trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['select-trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['select-trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "modern-select" },
    ref: "dropdown",
});
/** @type {typeof __VLS_ctx.dropdown} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (__VLS_ctx.toggleDropdown) },
    ...{ onBlur: (__VLS_ctx.closeDropdown) },
    ...{ class: "select-trigger" },
    ...{ class: ({ open: __VLS_ctx.isOpen }) },
    tabindex: "0",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "selected-text" },
});
(__VLS_ctx.selectedLabel);
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    ...{ class: "dropdown-icon" },
    viewBox: "0 0 24 24",
    width: "20",
    height: "20",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M7 10l5 5 5-5H7z",
    fill: "currentColor",
});
if (__VLS_ctx.isOpen) {
    const __VLS_0 = {}.Teleport;
    /** @type {[typeof __VLS_components.Teleport, typeof __VLS_components.Teleport, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        to: "body",
    }));
    const __VLS_2 = __VLS_1({
        to: "body",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: () => { } },
        ...{ onClick: () => { } },
        ...{ class: "dropdown-panel" },
        ...{ style: (__VLS_ctx.panelStyles) },
        ref: "panel",
    });
    /** @type {typeof __VLS_ctx.panel} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "options-list" },
    });
    for (const [option] of __VLS_getVForSourceType((__VLS_ctx.options))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isOpen))
                        return;
                    __VLS_ctx.selectOption(option);
                } },
            key: (option),
            ...{ class: "option-item" },
            ...{ class: ({ selected: option === __VLS_ctx.selected }) },
        });
        (option);
    }
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['modern-select']} */ ;
/** @type {__VLS_StyleScopedClasses['select-trigger']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-text']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['dropdown-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['options-list']} */ ;
/** @type {__VLS_StyleScopedClasses['option-item']} */ ;
/** @type {__VLS_StyleScopedClasses['selected']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            dropdown: dropdown,
            panel: panel,
            isOpen: isOpen,
            panelStyles: panelStyles,
            selectedLabel: selectedLabel,
            toggleDropdown: toggleDropdown,
            closeDropdown: closeDropdown,
            selectOption: selectOption,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
