import { reactive } from 'vue';
const alertState = reactive({
    isVisible: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false,
    closeOnOverlayClick: true
});
let resolvePromise = null;
export const useAlert = () => {
    const showAlert = (options) => {
        return new Promise((resolve) => {
            resolvePromise = resolve;
            // Update alert state
            alertState.isVisible = true;
            alertState.type = options.type || 'info';
            alertState.title = options.title || getDefaultTitle(options.type || 'info');
            alertState.message = options.message;
            alertState.confirmText = options.confirmText || 'OK';
            alertState.cancelText = options.cancelText || 'Cancel';
            alertState.showCancel = options.showCancel || false;
            alertState.closeOnOverlayClick = options.closeOnOverlayClick !== false;
        });
    };
    const hideAlert = () => {
        alertState.isVisible = false;
    };
    const handleConfirm = () => {
        hideAlert();
        resolvePromise?.(true);
        resolvePromise = null;
    };
    const handleCancel = () => {
        hideAlert();
        resolvePromise?.(false);
        resolvePromise = null;
    };
    // Convenience methods
    const showSuccess = (message, title) => {
        return showAlert({
            type: 'success',
            title: title || 'Success',
            message,
            confirmText: 'OK'
        });
    };
    const showError = (message, title) => {
        return showAlert({
            type: 'error',
            title: title || 'Error',
            message,
            confirmText: 'OK'
        });
    };
    const showWarning = (message, title) => {
        return showAlert({
            type: 'warning',
            title: title || 'Warning',
            message,
            confirmText: 'OK'
        });
    };
    const showInfo = (message, title) => {
        return showAlert({
            type: 'info',
            title: title || 'Information',
            message,
            confirmText: 'OK'
        });
    };
    const showConfirm = (message, title) => {
        return showAlert({
            type: 'warning',
            title: title || 'Confirm',
            message,
            confirmText: 'Yes',
            cancelText: 'No',
            showCancel: true
        });
    };
    return {
        alertState,
        showAlert,
        hideAlert,
        handleConfirm,
        handleCancel,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm
    };
};
const getDefaultTitle = (type) => {
    switch (type) {
        case 'success': return 'Success';
        case 'error': return 'Error';
        case 'warning': return 'Warning';
        case 'info': return 'Information';
        default: return 'Alert';
    }
};
