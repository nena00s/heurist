"use client";
import React, { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar"; // Sidebar atualizada
import Modal from "./components/Modal";
import ResultCard from "./components/ResultCard";
import Footer from "./components/Footer";
import ChatModal from "./components/ChatModal";
import FloatingButton from "./components/FloatingButton";
import UniverseModal from "./components/UniverseModal";
import "./loader.css";
import axios from "axios";

export default function Page() {
  const [isSplashVisible, setSplashVisible] = useState(true); // Controle da splash screen
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Sidebar modal
  const [decisions, setDecisions] = useState([]); // Armazena decisões criadas
  const [outcomes, setOutcomes] = useState([]);
  const [activeDecision, setActiveDecision] = useState(""); // Decisão ativa
  const [isModalVisible, setModalVisible] = useState(true);
  const [isVariableModalVisible, setVariableModalVisible] = useState(false);
  const [isLoaderVisible, setLoaderVisible] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [isUniverseModalVisible, setUniverseModalVisible] = useState(false);
  const [currentDecision, setCurrentDecision] = useState("");
  const [currentVariables, setCurrentVariables] = useState({});
  const [variableQuestions, setVariableQuestions] = useState([]);
  const [selectedUniverse, setSelectedUniverse] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const resetFrontendState = () => {
    setCurrentDecision("");
    setCurrentVariables({});
    setVariableQuestions([]);
    setOutcomes([]);
    setModalVisible(true);
    setVariableModalVisible(false);
    setLoaderVisible(false);
    setUniverseModalVisible(false);
    setSelectedUniverse({});
    setActiveDecision("");
    setErrorMessage("");
  };

  const resetBackendState = async () => {
    try {
      await axios.post(`${BACKEND_URL}/initiate/`);
    } catch (error) {
      console.error("Erro ao reiniciar o estado no backend:", error);
    }
  };

  const startNewDecision = async () => {
    resetFrontendState();
    await resetBackendState();
  };

  const handleDecisionInput = async () => {
    if (!currentDecision.trim()) {
      setErrorMessage("Please enter a valid decision.");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/collect/`, {
        decision: currentDecision,
      });

      // Caso existam perguntas adicionais
      if (response.data.questions) {
        setVariableQuestions(Object.entries(response.data.questions));
        setModalVisible(false); // Fecha o primeiro modal
        setVariableModalVisible(true); // Abre o segundo modal
        setErrorMessage(""); // Limpa mensagens de erro
        setActiveDecision(currentDecision); // Define a decisão ativa
      }
      // Caso contrário, ativa o Loader
      else if (response.data.message.includes("Pronto para simular")) {
        setModalVisible(false);
        setLoaderVisible(true); // Ativa o Loader
        generateOutcomes(); // Inicia a geração de cenários
      } else {
        setErrorMessage("Erro ao carregar as variáveis. Tente novamente.");
      }
    } catch (error) {
      setErrorMessage("Erro ao enviar a decisão. Tente novamente.");
      console.error(error);
    }
  };

  const handleVariableInput = async () => {
    if (Object.keys(currentVariables).length === 0) {
      setErrorMessage("Por favor, preencha as variáveis.");
      return;
    }

    try {
      setVariableModalVisible(false); // Fecha o segundo modal
      setLoaderVisible(true); // Ativa o Loader
      const response = await axios.post(`${BACKEND_URL}/collect/`, {
        details: currentVariables,
      });

      if (response.data.message.includes("Pronto para iniciar a simulação")) {
        generateOutcomes(); // Inicia a geração de resultados
      } else {
        setErrorMessage("Erro ao processar as variáveis. Tente novamente.");
        setLoaderVisible(false); // Desativa o Loader em caso de erro
      }
    } catch (error) {
      setErrorMessage("Erro ao enviar as variáveis. Tente novamente.");
      console.error(error);
      setLoaderVisible(false); // Desativa o Loader em caso de erro
    }
  };

  const generateOutcomes = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/simulate/`);
      if (response.data.scenarios) {
        const newDecision = {
          title: currentDecision,
          universes: response.data.scenarios,
        };
        setDecisions((prev) => [...prev, newDecision]);
        setOutcomes(response.data.scenarios);
        setLoaderVisible(false);
      } else {
        setErrorMessage("Erro ao gerar cenários. Tente novamente.");
        setLoaderVisible(false);
      }
    } catch (error) {
      setErrorMessage("Erro ao gerar cenários. Tente novamente.");
      console.error(error);
      setLoaderVisible(false);
    }
  };

  const openUniverseModal = (universe, description) => {
    setSelectedUniverse({ universe, description });
    setUniverseModalVisible(true);
  };

  const closeUniverseModal = () => {
    setUniverseModalVisible(false);
  };

  // Função para finalizar o SplashScreen
  const handleSplashFinish = () => {
    setSplashVisible(false);
  };

  // Lista de textos a serem exibidos no loop
  const loadingTexts = [
    "Searching Possibilities",
    "Analyzing Probabilities",
    "Simulating Multiverses",
  ];

  useEffect(() => {
    if (isLoaderVisible && !isSplashVisible) {
      const interval = setInterval(() => {
        setTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
      }, 4000);

      return () => clearInterval(interval); // Limpa o intervalo ao desmontar
    }
  }, [isLoaderVisible, isSplashVisible, loadingTexts.length]);

  return (
    <div className="app">
      {isSplashVisible ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <>
          <Header toggleSidebar={toggleSidebar} />
          <div className="main">
            <Sidebar
              isOpen={isSidebarOpen}
              decisions={decisions}
              onClose={() => setSidebarOpen(false)}
              onSelectDecision={(decision) => {
                setActiveDecision(decision.title); // Atualiza a decisão ativa
                setOutcomes(decision.universes || []);
              }}
            />
            <div className="content">
              {errorMessage && <p className="error">{errorMessage}</p>}

              {isLoaderVisible ? (
                <div className="loader-container">
                  <span className="loader"></span>
                  <div className="loader-text">{loadingTexts[textIndex]}</div>
                </div>
              ) : (
                <>
                  {/* Exibe o título da decisão ativa */}
                  {activeDecision && (
                    <h1 className="decision-title">{activeDecision}</h1>
                  )}

                  <Modal
                    isVisible={isModalVisible}
                    title="What decision would you like to make?"
                    onClose={() => setModalVisible(false)}
                  >
                    <input
                      type="text"
                      placeholder="Example: Expand the marketing budget."
                      value={currentDecision}
                      onChange={(e) => setCurrentDecision(e.target.value)}
                      className="modal-input"
                    />
                    <button
                      onClick={handleDecisionInput}
                      className="modal-button"
                    >
                      Next
                    </button>
                  </Modal>

                  <Modal
                    isVisible={isVariableModalVisible}
                    title="Provide additional information"
                    onClose={() => setVariableModalVisible(false)}
                  >
                    {variableQuestions.map(([key, question]) => (
                      <div key={key}>
                        <label>{question}</label>
                        <input
                          type="text"
                          value={currentVariables[key] || ""}
                          onChange={(e) =>
                            setCurrentVariables({
                              ...currentVariables,
                              [key]: e.target.value,
                            })
                          }
                          className="modal-input"
                        />
                      </div>
                    ))}
                    <button
                      onClick={handleVariableInput}
                      className="modal-button"
                    >
                      Generate Results
                    </button>
                  </Modal>

                  <div className="results">
                    {outcomes.map((outcome, index) => (
                      <ResultCard
                        key={index}
                        universe={`Universe ${index + 1}`}
                        description={outcome.narrative}
                        onExplore={() =>
                          openUniverseModal(
                            `Universe ${index + 1}`,
                            outcome.narrative
                          )
                        }
                      />
                    ))}
                  </div>
                </>
              )}

              <UniverseModal
                isVisible={isUniverseModalVisible}
                universe={selectedUniverse.universe}
                description={selectedUniverse.description}
                parentTitle={activeDecision} // Passa o título pai (decisão ativa)
                onClose={closeUniverseModal}
              />
            </div>
          </div>
          <Footer />
          <FloatingButton onClick={startNewDecision} />
        </>
      )}
    </div>
  );
}
