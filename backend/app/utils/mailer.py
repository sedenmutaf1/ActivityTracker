import smtplib
from email.message import EmailMessage

def send_password_reset_email(email: str, token: str):
    msg = EmailMessage()
    msg["Subject"] = "Reset Your Password"
    msg["From"] = "activitytracker95@gmail.com"
    msg["To"] = email
    msg.set_content(f"Click to reset: http://localhost:3000/reset-password?token={token}")

    # For example, using Gmail
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login("activitytracker95@gmail.com", "magd izrd iqzx mthj")
        try:
            smtp.send_message(msg)
        except smtplib.SMTPRecipientsRefused:
            raise ValueError(f"Recipient email address '{email}' was refused by the SMTP server.")
        except smtplib.SMTPException as e:
            raise RuntimeError(f"Failed to send email: {e}")
