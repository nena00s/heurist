import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from crewai import LLM, Agent, Task, Crew, Process
from fastapi.responses import FileResponse
from fpdf import FPDF
import os

# Carregar variáveis de ambiente
load_dotenv()



# Configurações do Watsonx
WATSONX_URL = os.getenv("WATSONX_URL")
WATSONX_API_KEY = os.getenv("WATSONX_API_KEY")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID")
WATSONX_MODEL_ID = os.getenv("WATSONX_MODEL_ID")
SERPER_API_KEY = os.getenv("SERPER_API_KEY")

# Configuração do LLM
llm = LLM(
    model=WATSONX_MODEL_ID,
    base_url=WATSONX_URL,
    project_id=WATSONX_PROJECT_ID,
    max_tokens=2000,
    temperature=0.7,
)

# Inicialização do FastAPI
app = FastAPI()

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens (troque "*" por um domínio específico se necessário)
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos HTTP (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

# Modelos de entrada
class AnalysisRequest(BaseModel):
    theme: str

# Agentes
analyst_agent = Agent(
    role="General Analyst",
    goal="Analyze the provided theme and generate a detailed report.",
    backstory="Expert analyst specializing in detailed contextual reports.",
    llm=llm,
    verbose=True,
)

thinker_agent = Agent(
    role="Thinker",
    goal="Generate innovative ideas and insights based on the provided theme.",
    backstory="Creative thinker who provides fresh and insightful perspectives.",
    llm=llm,
    verbose=True,
)

research_agent = Agent(
    role="Researcher",
    goal="Search for relevant information and summarize findings.",
    backstory="Skilled researcher specializing in gathering high-quality information.",
    llm=llm,
    verbose=True,
)

# Endpoints
@app.get("/")
def read_root():
    return {"message": "Agents Service is running on port 9000!"}

@app.post("/analyze/")
def analyze(request: AnalysisRequest):
    if not request.theme:
        raise HTTPException(status_code=400, detail="Theme is required.")
    
    # Definir a tarefa
    task = Task(
        description=f"Analyze the theme '{request.theme}' and provide a detailed report.",
        expected_output="A detailed report including positives, challenges, and solutions.",
        agent=analyst_agent,
    )

    # Criar uma Crew para gerenciar a execução
    crew = Crew(
        agents=[analyst_agent],
        tasks=[task],
        process=Process.sequential,  # Execução sequencial
    )
    
    # Executar a Crew
    try:
        crew.kickoff(inputs={"theme": request.theme})
        return {
            "message": "Analysis completed.",
            "result": task.output.raw  # Obter o resultado da tarefa
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/think/")
def think(request: AnalysisRequest):
    if not request.theme:
        raise HTTPException(status_code=400, detail="Theme is required.")
    
    task = Task(
        description=f"Consider the theme '{request.theme}' and provide 5 creative ideas or insights.",
        expected_output="5 innovative ideas or insights.",
        agent=thinker_agent,
    )
    
    crew = Crew(
        agents=[thinker_agent],
        tasks=[task],
        process=Process.sequential,
    )
    
    try:
        crew.kickoff(inputs={"theme": request.theme})
        return {
            "message": "Thinking completed.",
            "result": task.output.raw
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/research/")
def research(request: AnalysisRequest):
    if not request.theme:
        raise HTTPException(status_code=400, detail="Theme is required.")
    
    task = Task(
        description=f"Research the theme '{request.theme}' and provide a summary of the most relevant information.",
        expected_output="A summary of relevant information with reliable sources.",
        agent=research_agent,
    )
    
    crew = Crew(
        agents=[research_agent],
        tasks=[task],
        process=Process.sequential,
    )
    
    try:
        crew.kickoff(inputs={"theme": request.theme})
        return {
            "message": "Research completed.",
            "result": task.output.raw
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    




# Criar diretório para arquivos gerados, se não existir
os.makedirs("generated_files", exist_ok=True)

# Montar arquivos estáticos
app.mount("/generated_files", StaticFiles(directory="generated_files"), name="generated_files")

# Modelo para requisição
class ChatSummaryRequest(BaseModel):
    theme: str
    messages: list[str]

@app.post("/summarize-and-generate-pdf/")
async def summarize_and_generate_pdf(data: ChatSummaryRequest):
    try:
        # Preparar dados
        theme = data.theme
        messages = data.messages

        # Resumo simulado (substitua pela lógica real de Watson e CrewAI)
        summary = f"Resume: {theme}\n\n"
        summary += "\n".join([f"- {msg}" for msg in messages])

        # Gerar PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.multi_cell(0, 10, txt=summary)

        # Salvar PDF
        pdf_filename = "summary_report.pdf"
        pdf_path = os.path.join("generated_files", pdf_filename)
        pdf.output(pdf_path)

        # Retornar link para download
        return {"download_url": f"http://localhost:9001/generated_files/{pdf_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")