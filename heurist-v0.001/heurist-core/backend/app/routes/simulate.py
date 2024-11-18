from fastapi import APIRouter, HTTPException
from app.services.watsonx_service import initiate_conversation, collect_input, simulate_decision

router = APIRouter(prefix="/simulate", tags=["Simulation"])

@router.post("/initiate/")
def initiate():
    """
    Endpoint para iniciar uma nova conversa.
    """
    return initiate_conversation()

@router.post("/collect/")
def collect(user_input: dict):
    """
    Endpoint para coletar dados do usuário (decisão e variáveis).
    """
    try:
        response = collect_input(user_input)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/")
def simulate():
    """
    Endpoint para simular cenários com base nos dados coletados.
    """
    try:
        response = simulate_decision()
        if "error" in response:
            raise HTTPException(status_code=400, detail=response["error"])
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
