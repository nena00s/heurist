# app/services/watsonx_service.py

from langchain_ibm import ChatWatsonx
from app.config import Config
from app.database import save_universe, get_universe_by_title
import json
import logging

# Configura o logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializa o cliente Watsonx
chat = ChatWatsonx(
    model_id="meta-llama/llama-3-70b-instruct",
    url=Config.WATSONX_URL,
    project_id=Config.WATSONX_PROJECT_ID,
    params={"temperature": 0.7, "max_tokens": 2000},
)

# Estado temporário da conversa
conversation_state = {"decision": None, "variables": {}, "context": None}


def initiate_conversation():
    """Inicia uma nova conversa e coleta a decisão inicial."""
    return {
        "message": "Bem-vindo! Qual decisão você gostaria de explorar? Por favor, descreva sua decisão inicial."
    }

def validate_input(parameter: str, parameter_name: str):
    """
    Valida se o parâmetro fornecido não está vazio ou nulo.
    """
    if not parameter or not parameter.strip():
        raise ValueError(f"O parâmetro '{parameter_name}' não pode estar vazio.")



def detect_context(decision_text: str) -> str:
    """
    Detecta o contexto da decisão com base no texto fornecido.
    """
    try:
        messages = [
            ("system", "Você é um assistente que analisa o tipo de decisão do usuário."),
            ("human", f"Com base no texto '{decision_text}', identifique se é uma decisão pessoal, empresarial, educacional, de saúde ou outro tipo.")
        ]
        response = chat.invoke(messages)
        context = response.content.strip().lower()
        logger.info(f"Contexto detectado: {context}")
        return context if context in ["pessoal", "empresarial", "educacional", "saúde", "viagens"] else "outro"
    except Exception as e:
        logger.error(f"Erro ao detectar contexto: {str(e)}")
        return "outro"  # Fallback para evitar falhas


def collect_variables(context: str) -> dict:
    """
    Retorna as variáveis relevantes com base no contexto.
    """
    contexts = {
        "empresarial": {
            "budget": "Qual é o orçamento disponível?",
            "timeline": "Qual é o prazo estimado (em dias)?",
            "target_audience": "Quem é o público-alvo dessa decisão?",
            "resources": "Quais recursos humanos ou materiais estão disponíveis?",
            "risks": "Quais são os possíveis riscos?",
            "expected_roi": "Qual é a expectativa de retorno sobre investimento (ROI)?",
        },
        "pessoal": {
            "personal_budget": "Quanto você pode gastar?",
            "available_time": "Quanto tempo você tem disponível?",
            "priorities": "Quais são suas prioridades pessoais?",
            "location": "Onde você pretende implementar essa decisão?",
            "emotional_impact": "Qual seria o impacto emocional dessa decisão?",
            "long_term_consequences": "Quais são as consequências futuras esperadas?",
        },
        "educacional": {
            "goal": "Qual é o objetivo do curso ou aprendizado?",
            "cost": "Qual é o custo estimado?",
            "duration": "Quanto tempo você pode dedicar?",
            "flexibility": "Quão flexíveis são os horários?",
            "format": "A preferência é presencial ou online?",
            "career_impact": "Qual é o impacto esperado na sua carreira?",
        },
        "saúde": {
            "current_condition": "Qual é sua condição de saúde atual?",
            "cost": "Qual é o custo estimado do tratamento?",
            "duration": "Quanto tempo você pode dedicar ao cuidado?",
            "impact_on_life": "Como isso afetará sua qualidade de vida?",
            "risks": "Existem riscos associados?",
        },
        "viagens": {
            "budget": "Qual é o orçamento da viagem?",
            "destination": "Qual é o destino pretendido?",
            "duration": "Quantos dias você pretende viajar?",
            "purpose": "Qual é o objetivo da viagem (lazer, negócios, cultura)?",
            "risks": "Existem riscos, como condições climáticas ou restrições?",
        },
    }
    variables = contexts.get(context, {"general_details": "Please provide more details about your decision."})
    logger.info(f"Variáveis para o contexto '{context}': {variables}")
    return variables


def collect_input(user_input: dict):
    """
    Coleta a entrada do usuário e atualiza o estado da conversa.
    """
    decision_text = user_input.get("decision", "")
    details = user_input.get("details", {})

    # Reinicia o estado se uma nova decisão for fornecida
    if decision_text and decision_text != conversation_state.get("decision"):
        conversation_state["decision"] = decision_text
        conversation_state["variables"] = {}
        context = detect_context(decision_text)
        conversation_state["context"] = context

        variables_questions = collect_variables(context)
        return {
            "message": "Entendido. Por favor, forneça as seguintes informações:",
            "questions": variables_questions,
        }

    # Coleta variáveis se elas ainda não estiverem definidas
    if not conversation_state["variables"]:
        if not details:
            return {"message": "Por favor, insira as variáveis solicitadas."}

        conversation_state["variables"] = details
        return {
            "message": "Obrigado! Dados completos. Pronto para iniciar a simulação.",
            "state": conversation_state,
        }

    # Caso os dados já tenham sido coletados
    return {"message": "Todos os dados já foram coletados. Pronto para simular."}




def simulate_decision(num_scenarios=9):
    """
    Simula múltiplos cenários com base nos dados coletados.
    """
    decision = conversation_state.get("decision")
    variables = conversation_state.get("variables")
    context = conversation_state.get("context", "outro")

    if not decision or not variables:
        return {"error": "Dados insuficientes para simulação. Certifique-se de fornecer a decisão e as variáveis."}

    try:
        variable_text = "\n".join([f"{key}: {value}" for key, value in variables.items()])
        prompt = (
            f"Baseado na decisão '{decision}' e nas seguintes variáveis:\n{variable_text}\n"
            f"Crie {num_scenarios} cenários únicos no contexto '{context}'. Para cada cenário:\n"
            "- Inicie com o título do cenário.\n"
            "- Apresente uma narrativa detalhada e completa.\n"
            "- Destaque benefícios específicos e realistas (prefixo: 'Benefícios:').\n"
            "- Descreva desafios claros (prefixo: 'Desafios:').\n"
            "- Inclua recomendações práticas (prefixo: 'Recomendações:').\n"
            "Separe claramente cada cenário com a palavra 'CENÁRIO' seguida de um número."
        )

        messages = [
            ("system", "Você é um assistente que cria cenários detalhados baseados em decisões."),
            ("human", prompt)
        ]

        response = chat.invoke(messages)
        raw_response = response.content.strip()

        scenarios_raw = raw_response.split("\nCENÁRIO ")
        scenarios = []

        for i, scenario_text in enumerate(scenarios_raw):
            if i == 0:
                continue  # Ignorar introdução
            scenario_parts = scenario_text.split("\n", 1)
            scenario_title = scenario_parts[0].strip()
            scenario_details = scenario_parts[1].strip() if len(scenario_parts) > 1 else ""

            scenarios.append({
                "universe": f"Universo {i}",
                "title": scenario_title,
                "narrative": scenario_details
            })

        # Salvar no banco de dados
        universe_data = {
            "decision": decision,
            "context": context,
            "variables": variables,
            "scenarios": scenarios,
        }
        save_universe(universe_data)

        return {
            "message": "Simulação concluída com sucesso!",
            "scenarios": scenarios
        }

    except Exception as e:
        logger.error(f"Erro ao simular cenários: {str(e)}")
        return {"error": f"Erro ao simular cenários: {str(e)}"}
    



def initiate_universe_chat(universe_title: str):
    """
    Inicia uma conversa com o LLM baseada no contexto de um universo.
    """
    try:
        validate_input(universe_title, "universe_title")
        
        # Recupera o universo do banco
        universe_data = get_universe_by_title(universe_title)
        if not universe_data:
            raise ValueError(f"Universo '{universe_title}' não encontrado no banco de dados.")

        # Busca o cenário correto no array
        scenario = next(
            (s for s in universe_data.get("scenarios", []) if s["title"] == universe_title),
            None,
        )
        if not scenario:
            raise ValueError(f"Narrativa para o título '{universe_title}' não encontrada.")

        narrative = scenario["narrative"]
        variables = universe_data.get("variables", {})
        variable_text = "\n".join([f"{key}: {value}" for key, value in variables.items()])

        messages = [
            ("system",
             "Você é um assistente especializado em ajudar usuários a explorar cenários simulados para tomada de decisões."),
            ("human",
             f"Contexto do universo '{universe_title}': {narrative}.\n"
             f"Variáveis:\n{variable_text}\n"
             "Este universo foi criado com base em uma decisão do usuário. Por favor, forneça informações úteis e específicas para este universo.")
        ]

        response = chat.invoke(messages)
        bot_response = response.content.strip()

        if not bot_response:
            raise ValueError("Resposta vazia do LLM ao iniciar o contexto do universo.")

        return {"message": "Conversa iniciada com sucesso.", "response": bot_response}

    except ValueError as ve:
        logger.error(f"Erro de validação: {str(ve)}")
        return {"error": str(ve)}
    except Exception as e:
        logger.error(f"Erro ao iniciar conversa com o universo: {str(e)}")
        return {"error": f"Erro ao iniciar conversa com o universo: {str(e)}"}


def continue_universe_chat(context: str, user_message: str) -> dict:
    """
    Continua o chat com base no contexto do universo e na mensagem do usuário.
    """
    try:
        validate_input(context, "context")
        validate_input(user_message, "user_message")

        # Cria o prompt com o contexto do universo
        prompt = (
            "Você é um assistente especializado em explorar cenários simulados ('universos') criados pela plataforma "
            "para ajudar usuários a tomar decisões informadas. A palavra 'universo' não se refere ao espaço ou astronomia. "
            "Cada universo representa um cenário específico baseado na decisão e nas informações fornecidas pelo usuário.\n\n"
            f"Contexto do universo: {context}\n\n"
            "Instruções:\n"
            "- Responda exclusivamente com base no contexto acima.\n"
            "- Forneça conselhos práticos e específicos para explorar desafios, benefícios e recomendações do universo.\n"
            "- Use uma linguagem clara e objetiva.\n"
            "- Evite informações fora de escopo ou alucinações.\n\n"
            f"Pergunta do usuário: {user_message}\n\n"
        )

        # Envia a mensagem para o modelo
        messages = [("system", prompt), ("human", user_message)]
        response = chat.invoke(messages)
        bot_response = response.content.strip()

        if not bot_response:
            raise ValueError("Resposta vazia do LLM ao continuar o chat.")

        return {"response": bot_response}

    except ValueError as ve:
        logger.error(f"Erro de validação: {str(ve)}")
        return {"error": str(ve)}
    except Exception as e:
        logger.error(f"Erro ao continuar o chat: {str(e)}")
        return {"error": "Não foi possível continuar a conversa. Tente novamente mais tarde."}








