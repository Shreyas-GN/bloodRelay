export class TelegramService {
  /**
   * Sends a broadcast message to the configured Telegram channel/user.
   */
  static async sendMessage(message: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!token || !chatId) {
        console.warn("[TELEGRAM] Missing Bot Token or Chat ID in .env");
        return;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      const result = await response.json();
      if (!result.ok) {
        console.error("[TELEGRAM] API Error:", result.description);
      }
    } catch (e) {
      console.error("[TELEGRAM] Network/Fetch Error:", e);
    }
  }
}
