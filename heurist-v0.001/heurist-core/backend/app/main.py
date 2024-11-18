from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.services.watsonx_service import initiate_conversation, collect_input, simulate_decision, initiate_universe_chat, continue_universe_chat
from app.routes import simulate
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Instância do FastAPI
app = FastAPI()

# Inclui rotas específicas
app.include_router(simulate.router)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens (troque "*" por um domínio específico se necessário)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos HTTP (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

@app.get("/")
def read_root():
    """
    Endpoint de saúde para verificar se o servidor está funcionando.
    """
    return {"message": "Bem-vindo ao HyperLearn AI - Multiverse Decision Platform"}

@app.post("/initiate/")
def start_conversation():
    """
    Inicia a conversa com o usuário.
    """
    try:
        response = initiate_conversation()
        logger.info("Conversa iniciada com sucesso.")
        return response
    except Exception as e:
        logger.error(f"Erro ao iniciar conversa: {e}")
        raise HTTPException(status_code=500, detail="Erro ao iniciar a conversa.")

@app.post("/collect/")
def handle_user_input(user_input: dict):
    """
    Recebe entrada do usuário e atualiza o estado da conversa.
    """
    if not user_input or not isinstance(user_input, dict):
        logger.error("Entrada inválida para coleta de dados do usuário.")
        raise HTTPException(status_code=400, detail="Entrada inválida.")
    try:
        response = collect_input(user_input)
        logger.info(f"Entrada do usuário processada: {response}")
        return response
    except Exception as e:
        logger.error(f"Erro ao coletar entrada do usuário: {e}")
        raise HTTPException(status_code=500, detail="Erro ao processar entrada do usuário.")

@app.post("/simulate/")
def handle_simulation():
    """
    Executa a simulação com os dados fornecidos.
    """
    try:
        response = simulate_decision()
        logger.info("Simulação concluída com sucesso.")
        return response
    except Exception as e:
        logger.error(f"Erro ao executar simulação: {e}")
        raise HTTPException(status_code=500, detail="Erro ao executar a simulação.")

@app.post("/universe/chat/initiate/")
def start_universe_chat(chat_input: dict):
    """
    Inicia uma conversa baseada em um universo específico.
    """
    universe_title = chat_input.get("universe_title")
    if not universe_title:
        logger.error("Título do universo não fornecido.")
        raise HTTPException(status_code=400, detail="Título do universo é obrigatório.")

    try:
        response = initiate_universe_chat(universe_title)
        logger.info(f"Contexto do universo '{universe_title}' iniciado com sucesso.")
        return response
    except ValueError as ve:
        logger.error(f"Erro de validação ao iniciar universo: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Erro ao iniciar universo: {e}")
        raise HTTPException(status_code=500, detail="Erro ao iniciar o universo.")

@app.post("/universe/chat/continue/")
def continue_chat(chat_input: dict):
    """
    Continua a conversa em um universo específico.
    """
    context = chat_input.get("context")
    user_message = chat_input.get("message")

    if not context or not user_message:
        logger.error("Faltam dados obrigatórios para continuar o chat.")
        raise HTTPException(status_code=400, detail="Contexto e mensagem são obrigatórios.")

    try:
        response = continue_universe_chat(context, user_message)
        logger.info("Conversa continuada com sucesso.")
        return response
    except Exception as e:
        logger.error(f"Erro ao continuar conversa: {e}")
        raise HTTPException(status_code=500, detail="Erro ao continuar a conversa.")
