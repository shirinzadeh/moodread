import { useToast } from 'vue-toast-notification';

const toast = useToast();

export function showToastSuccess(message: string) {
	toast.success(message, {
		position: 'top-right',
		duration: 3000, // Customize duration if needed
	});
}

export function showToastError(message: string) {
	toast.error(message, {
		position: 'top-right',
		duration: 3000, // Customize duration if needed
	});
}

export function showToastInfo(message: string) {
	toast.info(message, {
		position: 'top-right',
		duration: 3000, // Customize duration if needed
	});
}

export function showToastWarning(message: string) {
	toast.warning(message, {
		position: 'top-right',
		duration: 3000, // Customize duration if needed
	});
}
