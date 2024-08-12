import { useToast } from 'vue-toast-notification';

const toast = useToast();

export function showSuccess(message: string) {
  toast.success(message, {
    position: 'top-right',
    duration: 3000, // Customize duration if needed
  });
}

export function showError(message: string) {
  toast.error(message, {
    position: 'top-right',
    duration: 3000, // Customize duration if needed
  });
}

export function showInfo(message: string) {
  toast.info(message, {
    position: 'top-right',
    duration: 3000, // Customize duration if needed
  });
}

export function showWarning(message: string) {
  toast.warning(message, {
    position: 'top-right',
    duration: 3000, // Customize duration if needed
  });
}
