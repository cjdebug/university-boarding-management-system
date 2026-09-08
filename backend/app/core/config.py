import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME = "University Boarding Management System API"
    APP_VERSION = "1.0.0"

    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )


settings = Settings()