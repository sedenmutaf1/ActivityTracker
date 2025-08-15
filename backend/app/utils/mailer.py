import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
import os

load_dotenv()

company_email = os.environ.get("COMPANY_EMAIL")
email_password = os.environ.get("EMAIL_PASSWORD")

def send_password_reset_email(email: str, token: str):
    msg = EmailMessage()
    msg["Subject"] = "Reset Your Password"
    msg["From"] = company_email
    msg["To"] = email

    reset_link = f"http://localhost:3000/reset-password?token={token}"

    
    msg.set_content(f"Click the link to reset your password: {reset_link}")

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #555;">We received a request to reset your password. Click the button below to reset it:</p>
          <a href="{reset_link}" style="display: inline-block; padding: 12px 20px; margin: 10px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 12px;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
    """
    msg.add_alternative(html_content, subtype="html")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(company_email, email_password)
        try:
            smtp.send_message(msg)
        except smtplib.SMTPRecipientsRefused:
            raise ValueError(f"Recipient email address '{email}' was refused by the SMTP server.")
        except smtplib.SMTPException as e:
            raise RuntimeError(f"Failed to send email: {e}")
