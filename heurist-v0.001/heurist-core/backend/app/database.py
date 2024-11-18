# app/database.py

from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["decision_platform"]

def save_universe(universe):
    """
    Salva um universo no banco de dados.
    """
    db.universes.insert_one(universe)


def get_universe_by_title(title):
    """
    Busca um universo pelo título de um cenário no banco de dados.
    """
    return db.universes.find_one({"scenarios.title": title})


