import os
import json
import uuid

import httpx
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")


def _db():
    from app.core.database import SessionLocal
    return SessionLocal()


def _insert_in_app_notification(donor_id: str, request_id, title: str, message: str):
    db = _db()
    try:
        db.execute(text("""
            INSERT INTO notifications (id, user_id, request_id, title, message, type, status, sent_at)
            VALUES (:id, :user_id, :request_id, :title, :message, 'emergency_request', 'unread', now())
        """), {
            "id": str(uuid.uuid4()),
            "user_id": donor_id,
            "request_id": request_id,
            "title": title,
            "message": message,
        })
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[NOTIFIER] In-app notification insert failed for {donor_id}: {e}")
    finally:
        db.close()


def _log_delivery(request_id: str, donor_id, channel: str, status: str, metadata: dict):
    db = _db()
    try:
        db.execute(text("""
            INSERT INTO notification_logs (id, request_id, donor_id, channel, status, metadata, created_at)
            VALUES (:id, :request_id, :donor_id, :channel::notification_channel, :status::notification_log_status, :metadata::jsonb, now())
        """), {
            "id": str(uuid.uuid4()),
            "request_id": request_id,
            "donor_id": donor_id,
            "channel": channel,
            "status": status,
            "metadata": json.dumps(metadata),
        })
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[NOTIFIER] Log insert failed: {e}")
    finally:
        db.close()


async def send_push_notification(donor_id: str, title: str, body: str, request_id: str = None):
    """Insert in-app inbox notification for a donor."""
    try:
        _insert_in_app_notification(donor_id, request_id, title, body)
        if request_id:
            _log_delivery(request_id, donor_id, "PUSH", "SENT", {"title": title, "body": body})
        print(f"[NOTIFIER] In-app notification sent: donor={donor_id}")
    except Exception as e:
        print(f"[NOTIFIER] send_push_notification failed for {donor_id}: {e}")


async def send_telegram_broadcast(message: str, request_id: str = None):
    """Broadcast to the configured Telegram channel."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("[NOTIFIER] Telegram not configured — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID")
        return

    sent = False
    error_desc = None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                json={
                    "chat_id": TELEGRAM_CHAT_ID,
                    "text": message,
                    "parse_mode": "Markdown",
                },
            )
            result = resp.json()
            sent = result.get("ok", False)
            if sent:
                print("[NOTIFIER] Telegram broadcast sent")
            else:
                error_desc = result.get("description", "unknown error")
                print(f"[NOTIFIER] Telegram API error: {error_desc}")
    except Exception as e:
        error_desc = str(e)
        print(f"[NOTIFIER] Telegram broadcast failed: {e}")

    if request_id:
        metadata = {"channel": "telegram"}
        if error_desc:
            metadata["error"] = error_desc
        _log_delivery(request_id, None, "PUSH", "SENT" if sent else "FAILED", metadata)


async def send_sms(phone: str, message: str, donor_id: str = None, request_id: str = None):
    """SMS delivery — log attempt as FAILED until an SMS provider is configured."""
    print(f"[NOTIFIER] SMS provider not configured. Skipping: {phone}")
    if request_id:
        _log_delivery(request_id, donor_id, "SMS", "FAILED", {
            "phone": phone,
            "message": message,
            "reason": "SMS provider not configured",
        })
