import { createAdminMessage, getAdminMessages, type AdminMessage } from "../../utils/bookings";

export const sendMessage = createAdminMessage;
export { createAdminMessage };
export const getUserMessages = getAdminMessages;
export { getAdminMessages };
export type AdminMessageRecord = AdminMessage;

const MESSAGES_KEY = "nest.admin-messages";
const readStoredMessages = (): AdminMessageRecord[] => {
	try {
		const value = localStorage.getItem(MESSAGES_KEY);
		const parsed = value ? JSON.parse(value) : [];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};
const writeStoredMessages = (messages: AdminMessageRecord[]) =>
	localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

export const markMessageAsRead = (messageId: string): boolean => {
	const messages = readStoredMessages();
	if (!messages.some((message) => message.messageId === messageId)) return false;
	writeStoredMessages(messages.map((message) => message.messageId === messageId ? { ...message, read: true } : message));
	return true;
};

export const deleteMessage = (messageId: string): boolean => {
	const messages = readStoredMessages();
	const next = messages.filter((message) => message.messageId !== messageId);
	if (next.length === messages.length) return false;
	writeStoredMessages(next);
	return true;
};
