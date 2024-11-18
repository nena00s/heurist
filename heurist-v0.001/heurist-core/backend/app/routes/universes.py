# app/routes/universes.py

from fastapi import APIRouter, HTTPException
from app.database import save_universe, get_universe_by_title

router = APIRouter()

@router.post("/universes/save/")
async def save_universes(universes: list):
    """
    Salva os universos no banco de dados.
    """
    try:
        for universe in universes:
            save_universe(universe)
        return {"message": "Universos salvos com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar universos: {str(e)}")


@router.get("/universes/{universe_title}/")
async def fetch_universe(universe_title: str):
    """
    Busca o contexto de um universo pelo título.
    """
    try:
        universe = get_universe_by_title(universe_title)
        if not universe:
            raise HTTPException(status_code=404, detail="Universo não encontrado")
        return universe
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar universo: {str(e)}")
