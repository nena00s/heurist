# app/config.py
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

class Config:
    # Configurações do MongoDB
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

    # Configurações do IBM Watsonx
    WATSONX_APIKEY = os.getenv("WATSONX_APIKEY")
    WATSONX_URL = os.getenv("WATSONX_URL")
    WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")
