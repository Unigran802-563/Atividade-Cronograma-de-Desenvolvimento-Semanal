import { useState, useEffect } from "react";
import "./HomePage.css";

function HomePage() {
  // 1. Criar um estado para armazenar a quantidade de pratos
  const [totalPratos, setTotalPratos] = useState(0);

  // 2. Usar o useEffect para buscar os dados quando o componente for montado
  useEffect(() => {
    // Função assíncrona para buscar os pratos da API
    const carregarTotalPratos = async () => {
      try {
        const response = await fetch("http://localhost:3001/pratos");
        const data = await response.json();
        // Atualiza o estado com o número de itens no array recebido
        setTotalPratos(data.length);
      } catch (error) {
        console.error("Erro ao carregar o total de pratos:", error);
        // Se der erro, podemos manter como 0 ou exibir uma mensagem
      }
    };

    carregarTotalPratos();
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  return (
    <div className="home-page">
      <h1>Bem-vindo ao SOS Restaurante</h1>
      <p>Sistema de Gerenciamento Completo</p>

      <div className="dashboard-cards">
        <div className="card">
          <h3>Pratos Cadastrados</h3>
          {/* 3. Exibir o valor do estado em vez do número fixo "0" */}
          <p className="card-number">{totalPratos}</p>
        </div>
        <div className="card">
          <h3>Ingredientes</h3>
          <p className="card-number">0</p>
        </div>
        <div className="card">
          <h3>Clientes</h3>
          <p className="card-number">0</p>
        </div>
        <div className="card">
          <h3>Endereços</h3>
          <p className="card-number">0</p>
        </div>
        <div className="card">
          <h3>Pedidos</h3>
          <p className="card-number">0</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
