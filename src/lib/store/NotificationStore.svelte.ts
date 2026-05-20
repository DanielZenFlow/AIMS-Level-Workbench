import { getContext, setContext } from 'svelte';

const NOTIFICATION_KEY = 'notification';

class NotificationStore {
	title = $state('Something needs attention');
	message = $state('');
	timeoutId: number | undefined;

	showError(message: string, title = 'Something needs attention') {
		this.title = title;
		this.message = message;
		if (this.timeoutId) window.clearTimeout(this.timeoutId);
		this.timeoutId = window.setTimeout(() => this.clear(), 9000);
	}

	clear() {
		this.title = 'Something needs attention';
		this.message = '';
		if (this.timeoutId) window.clearTimeout(this.timeoutId);
		this.timeoutId = undefined;
	}
}

const setNotification = () => setContext(NOTIFICATION_KEY, new NotificationStore());
const getNotification = () => getContext(NOTIFICATION_KEY) as NotificationStore;

export { setNotification, getNotification };
