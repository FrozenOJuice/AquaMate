import logging
import threading
from typing import Callable, Optional

from app.models.user import User

logger = logging.getLogger(__name__)


class ResetNotifier:
    """
    Responsible for dispatching reset tokens via configured channels.
    """

    def __init__(self, settings, send_email_fn: Optional[Callable[[str, str, str], None]] = None):
        self.settings = settings
        self._send_email_fn = send_email_fn or self._send_email

    def dispatch(self, user: User, token: str) -> None:
        contact = user.email or user.username
        logger.info("Dispatching password reset token for user_id=%s to %s", user.id, contact)
        channel = "email" if "@" in contact else "sms"
        message = f"Use this code to reset your AquaMate password: {token}"

        def _deliver():
            try:
                logger.info("Sending password reset token via %s to %s", channel, contact)
                if channel == "email":
                    self._send_email_fn(contact, "Reset your AquaMate password", message)
                else:
                    logger.warning("SMS delivery not configured; unable to send reset token to %s", contact)
            except Exception:
                logger.exception("Failed to dispatch reset token for user_id=%s", user.id)

        threading.Thread(target=_deliver, name=f"reset-token-{user.id}", daemon=True).start()

    def _send_email(self, recipient: str, subject: str, body: str) -> None:
        if not self.settings.smtp_host:
            logger.warning("SMTP not configured; unable to send email to %s", recipient)
            return
        import smtplib
        from email.message import EmailMessage

        message = EmailMessage()
        message["From"] = self.settings.smtp_sender
        message["To"] = recipient
        message["Subject"] = subject
        message.set_content(body)
        try:
            with smtplib.SMTP(self.settings.smtp_host, self.settings.smtp_port, timeout=10) as server:
                if self.settings.smtp_use_tls:
                    server.starttls()
                if self.settings.smtp_username and self.settings.smtp_password:
                    server.login(self.settings.smtp_username, self.settings.smtp_password)
                server.send_message(message)
        except Exception:
            logger.exception("Failed to send email to %s", recipient)
