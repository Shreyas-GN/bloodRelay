export class AlertService {
    static async sendSMS(to: string, message: string) {
        try {
            const response = await fetch('/api/alerts/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to, message })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to send SMS:', error);
            throw error;
        }
    }

    static async sendPushNotification(fcmTokens: string[], title: string, body: string, data?: any) {
        try {
            const response = await fetch('/api/alerts/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokens: fcmTokens, title, body, data })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to send Push:', error);
            throw error;
        }
    }

    static async triggerEscalation(requestId: string) {
        try {
            const response = await fetch('/api/alerts/escalate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to trigger escalation:', error);
            throw error;
        }
    }
}
