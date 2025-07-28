import { ref, onMounted } from 'vue';
import eventBus from '../../eventBus';
const toast = ref({
    show: false,
    message: '',
    color: '',
    timeout: 3000,
    icon: ''
});
onMounted(() => {
    // Listen for 'show-toast' events
    eventBus.value.$on('show-toast', (message, color, icon, timeout) => {
        toast.value.message = message;
        toast.value.color = color;
        toast.value.timeout = timeout;
        toast.value.icon = icon;
        toast.value.show = true;
        setTimeout(() => {
            toast.value.show = false;
        }, timeout);
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.VSnackbar;
/** @type {[typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, typeof __VLS_components.VSnackbar, typeof __VLS_components.vSnackbar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.toast.show),
    color: (__VLS_ctx.toast.color),
    timeout: (__VLS_ctx.toast.timeout),
    location: "top right",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.toast.show),
    color: (__VLS_ctx.toast.color),
    timeout: (__VLS_ctx.toast.timeout),
    location: "top right",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "d-flex align-items-center" },
});
const __VLS_5 = {}.VIcon;
/** @type {[typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, typeof __VLS_components.VIcon, typeof __VLS_components.vIcon, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    dark: true,
    large: true,
    ...{ class: "mr-2" },
}));
const __VLS_7 = __VLS_6({
    dark: true,
    large: true,
    ...{ class: "mr-2" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
(__VLS_ctx.toast.icon);
var __VLS_8;
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
    ...{ class: "ml-2" },
});
(__VLS_ctx.toast.message);
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['d-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['align-items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            toast: toast,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
