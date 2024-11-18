//frontend/app/components/ChatModal.js


"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./ChatModal.module.css";

const ChatModal = ({ isVisible, parentTitle, universe, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [activeTool, setActiveTool] = useState(null);

  // Mostrar animação da ferramenta
  const showToolAnimation = (toolName) => {
    setActiveTool(toolName);
    setTimeout(() => {
      setActiveTool(null); // Esconde a animação após 2 segundos
    }, 2000);
  };  

  // Mensagem inicial e configuração do contexto do universo
  useEffect(() => {
    if (isVisible && universe) {
      const initialMessage = {
        sender: "system",
        text: `Welcome to the "${universe}". How can I help you explore this scenario and make your decision easier?`,
      };
      setMessages([initialMessage]);

      initiateUniverseChat();
    }
  }, [isVisible, universe]);

  // Inicializar o contexto do universo no backend
  const initiateUniverseChat = async () => {
    if (!universe || !parentTitle) {
      console.error("Contexto do universo ou título pai não definido.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/universe/chat/initiate/", {
        universe_title: universe, // Enviar título do universo
      });
      console.log("Contexto iniciado no backend:", response.data);
    } catch (error) {
      console.error("Erro ao iniciar o contexto do universo no backend:", error);
      const errorMessage = {
        sender: "system",
        text: "Error setting initial context. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Enviar mensagem do usuário e obter resposta do backend
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessage = { sender: "user", text: userMessage };
    setMessages((prev) => [...prev, newMessage]);

    try {
      if (!universe) {
        throw new Error("O contexto do universo não está definido.");
      }

      // Enviar mensagem com o título do universo para o backend
      const response = await axios.post("http://localhost:8000/universe/chat/continue/", {
        context: parentTitle, // Certifique-se de que o contexto está correto
        message: userMessage,
      });

      const botMessage = { sender: "system", text: response.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      const errorMessage = {
        sender: "system",
        text: "Sorry, an error occurred while processing your message. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setUserMessage(""); // Limpa o campo de entrada após o envio
  };

  // Lidar com cliques nos ícones
  const handleIconClick = async (iconName) => {
    if (iconName === "close") {
      onClose(); // Fecha o modal
      return; // Para a execução aqui, sem realizar outras ações
    }
  
    if (!universe) {
      console.error("O contexto do universo não está definido.");
      return;
    }

    // Mapear nomes das ferramentas
    const toolNames = {
      "1": "Analyzing...",
      "2": "Thinking...",
      "3": "Researching...",
      "5": "Generating PDF...",
    };

    // Mostrar a animação com o nome da ferramenta
    showToolAnimation(toolNames[iconName] || "Processing...");







    if (iconName === "5") { // Gerar PDF
      const chatContext = messages.map((message) => message.text);
      try {
        const response = await axios.post("http://localhost:9001/summarize-and-generate-pdf/", {
          theme: universe,
          messages: chatContext,
        });
  
        // Exibir link de download no chat
        const downloadMessage = {
          sender: "system",
          text: `Report generated! <a href="${response.data.download_url}" target="_blank">Download the PDF here</a>`,
        };
        setMessages((prev) => [...prev, downloadMessage]);
      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        const errorMessage = {
          sender: "system",
          text: "Error generating PDF report. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
      return;
    }
  
    let endpoint = "";
  
    switch (iconName) {
      case "1": // Analyst
        endpoint = "http://localhost:9001/analyze/";
        break;
      case "2": // Thinker
        endpoint = "http://localhost:9001/think/";
        break;
      case "3": // Researcher
        endpoint = "http://localhost:9001/research/";
        break;
      case "5": // Placeholder
        console.log("Botão 5 foi clicado. Nenhuma lógica definida ainda.");
        return;
      default:
        console.error("Ícone inválido.");
        return;
    }
  
    // Extrair contexto do chat
    const chatContext = messages.map((message) => message.text).join(" | ");
  
    try {
      // Enviar contexto ao backend
      const response = await axios.post(endpoint, {
        theme: `${universe}: ${chatContext}`, // Contexto combinado com o universo
      });
  
      const agentMessage = {
        sender: "system",
        text: response.data.result, // Resposta do agente
      };
  
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Erro ao enviar dados ao backend:", error);
      const errorMessage = {
        sender: "system",
        text: "An error occurred while processing your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };


  const formatMessage = (text) => {
    // Substituir múltiplas quebras de linha por uma só
    let formattedText = text.replace(/\n+/g, "\n");
  
    // Adicionar <p> ao redor de cada parágrafo
    formattedText = formattedText
      .split("\n") // Divide em linhas
      .map((line) => line.trim()) // Remove espaços desnecessários
      .filter((line) => line.length > 0) // Remove linhas vazias
      .map((line) => `<p>${line}</p>`) // Envolve cada linha em <p>
      .join("");
  
    // Converter listas markdown (opcional)
    formattedText = formattedText
      .replace(/^\*\s(.*)$/gm, "<li>$1</li>") // Listas com "*"
      .replace(/(?:<li>.*<\/li>)/gm, "<ul>$&</ul>"); // Envolver <ul>
  
    return formattedText;
  };
  

  // Função para capitalizar a primeira letra de cada palavra
  const toTitleCase = (str) => {
    return str
      .toLowerCase() // Garantir que o restante das letras fique minúsculo
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalizar a primeira letra de cada palavra
  };

  
  

  if (!isVisible) return null;

  return (
    <div className={styles.backdrop}>
      {activeTool && (
        <div className={styles.overlay}>
          <h1 className={styles.toolName}>{activeTool}</h1>
        </div>
      )}
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2 className={styles.parentTitle}>"{toTitleCase(parentTitle)}"</h2>
          <h3 className={styles.universeTitle}>Chat - "{toTitleCase(universe)}"</h3>
        </header>
        <main className={styles.chatContent}>
          <div className={styles.messages}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={styles[message.sender]}
                dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
              ></div>
            ))}
          </div>
          <input
            type="text"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Enter your message..."
            className={styles.chatInput}
          />
          <button onClick={handleSendMessage} className={styles.sendButton}>
            Send
          </button>
          <div className={styles.iconContainer}>
            <img
              src="/1.svg"
              alt="Analyst"
              className={styles.iconButton}
              onClick={() => handleIconClick("1")}
            />
            <img
              src="/3.svg"
              alt="Thinker"
              className={styles.iconButton}
              onClick={() => handleIconClick("2")}
            />
            <img
              src="/5.svg"
              alt="Researcher"
              className={styles.iconButton}
              onClick={() => handleIconClick("3")}
            />
            <img
              src="/2.svg"
              alt="Generate PDF"
              className={styles.iconButton}
              onClick={() => handleIconClick("5")}
            />
            <img
              src="/6.svg"
              alt="Close"
              className={styles.iconButton}
              onClick={() => handleIconClick("close")}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatModal;