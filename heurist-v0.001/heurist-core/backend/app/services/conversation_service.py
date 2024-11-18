#app/services/conversation_service.py


from app.services.watsonx_service import query_watsonx

conversation_state = {
    "step": 0,
    "data": {}
}

def initiate_conversation() -> str:
    """Inicia a conversa com o usuário."""
    conversation_state["step"] = 1
    return "Qual é a decisão principal que você deseja analisar? (ex: 'Aumentar o orçamento de marketing em 20%')"

def collect_input(user_input: dict) -> str:
    """Coleta as informações do usuário com base no estado atual."""
    step = conversation_state["step"]
    
    if step == 1:
        # Armazena a decisão principal
        conversation_state["data"]["decision"] = user_input.get("decision", "")
        conversation_state["step"] = 2
        return "Quais são as variáveis relevantes para essa decisão? (ex: 'budget: 50000, timeline: 6 meses, target_market: Jovens adultos')"
    
    elif step == 2:
        # Armazena as variáveis
        conversation_state["data"]["variables"] = user_input.get("variables", {})
        conversation_state["step"] = 3
        return "Ótimo! Vamos gerar cenários baseados nesses dados. Confirme se podemos continuar."

    elif step == 3:
        # Finaliza a coleta e inicia a simulação
        return "Dados coletados. Por favor, envie uma solicitação para a rota '/simulate/' para gerar os cenários."

    else:
        return "Conversa já finalizada. Reinicie se necessário."

def simulate_decision(input_data: dict) -> list:
    """Simula cenários usando Watsonx."""
    decision = conversation_state["data"].get("decision", "")
    variables = conversation_state["data"].get("variables", {})
    response = query_watsonx(decision, variables)
    return response
