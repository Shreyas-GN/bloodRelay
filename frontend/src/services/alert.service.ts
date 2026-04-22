export class AlertService {
    static async sendSMS(to: string, message: string) {
        try {
            const response = await fetch('/api/alerts/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to, message, type: 'SMS' })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to send SMS:', error);
        }
    }

    static async sendPushNotification(userId: string, title: string, body: string) {
        try {
            // Future implementation for OneSignal / FCM
            const response = await fetch('/api/alerts/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: userId, message: `${title}: ${body}`, type: 'PUSH' })
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to send Push:', error);
        }
    }
}
