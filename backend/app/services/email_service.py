import os

import resend
from dotenv import load_dotenv
from pathlib import Path


# Load .env from backend folder
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)


RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv(
    "RESEND_FROM_EMAIL",
    "onboarding@resend.dev"
)


def send_welcome_email(to_email: str, name: str):
    """
    Send welcome email using Resend.
    """

    if not RESEND_API_KEY:
        print("ERROR: RESEND_API_KEY is missing in .env")
        return False

    try:
        resend.api_key = RESEND_API_KEY

        params = {
            "from": RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": "Welcome to ATS Resume Checker 🚀",
            "html": f"""
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
                background: #f8fafc;
                color: #1e293b;
            ">

                <div style="
                    background: #111827;
                    color: white;
                    padding: 20px;
                    border-radius: 12px 12px 0 0;
                ">
                    <h2 style="margin: 0;">
                        ATS Resume Checker 🚀
                    </h2>
                </div>

                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 0 0 12px 12px;
                ">

                    <h2>Hi {name}, 👋</h2>

                    <p>
                        Welcome to <strong>ATS Resume Checker</strong>!
                    </p>

                    <p>
                        We're excited to have you with us.
                    </p>

                    <p>
                        Your profile has been successfully created.
                        You can now analyze your resume and improve it
                        according to your target job role.
                    </p>

                    <h3>What you can do:</h3>

                    <ul>
                        <li>Analyze your resume</li>
                        <li>Get an ATS compatibility score</li>
                        <li>Find missing or weak areas</li>
                        <li>Get personalized suggestions</li>
                        <li>Optimize your resume for your target role</li>
                    </ul>

                    <p>
                        Your next opportunity could start with a better resume. 🚀
                    </p>

                    <p>
                        Thank you for using
                        <strong>ATS Resume Checker</strong>.
                    </p>

                    <br>

                    <p>
                        Best regards,<br>
                        <strong>ATS Resume Checker Team</strong>
                    </p>

                </div>

            </div>
            """,
        }

        response = resend.Emails.send(params)

        print(
            f"Welcome email sent successfully to: {to_email}"
        )

        print(f"Resend response: {response}")

        return True

    except Exception as e:
        print(f"Email sending failed: {e}")
        return False