import React, { useState, useEffect } from "react";
import {
  FaUtensils,
  FaCarrot,
  FaUsers,
  FaClipboardList,
  FaSpinner,
} from "react-icons/fa"; // 1. Importar ícones
import "./HomePage.css";

// Um array para configurar os cards e as rotas da API
const cardConfig = [
  {
    id: "pratos",
    title: "Pratos Cadastrados",
    icon: <FaUtensils />,
    endpoint: "/pratos",
  },
  {
    id: "ingredientes",
    title: "Ingredientes",
    icon: <FaCarrot />,
    endpoint: "/ingredientes",
  },
  {
    id: "clientes",
    title: "Clientes",
    icon: <FaUsers />,
    endpoint: "/clientes",
  },
  {
    id: "pedidos",
    title: "Pedidos Registrados",
    icon: <FaClipboardList />,
    endpoint: "/pedidos",
  },
];

function HomePage() {
  // 2. Estado único para armazenar todos os totais e o estado de carregamento
  const [dashboardData, setDashboardData] = useState({
    pratos: 0,
    ingredientes: 0,
    clientes: 0,
    pedidos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para buscar todos os dados em paralelo
    const carregarDashboard = async () => {
      try {
        // Cria um array de promessas de fetch para cada endpoint
        const promises = cardConfig.map((card) =>
          fetch(`http://localhost:3001${card.endpoint}`).then((res) =>
            res.json()
          )
        );

        // Executa todas as promessas em paralelo
        const results = await Promise.all(promises);

        // Cria um novo objeto com os totais
        const novosTotais = {
          pratos: results[0].length,
          ingredientes: results[1].length,
          clientes: results[2].length,
          pedidos: results[3].length,
        };

        setDashboardData(novosTotais);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        // Em caso de erro, você pode definir um estado de erro aqui se quiser
      } finally {
        // 3. Independentemente de sucesso ou erro, para de carregar
        setLoading(false);
      }
    };

    carregarDashboard();
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  return (
    <div className="home-page">
      <header className="page-header">
        <h1>Bem-vindo ao SOS Restaurante</h1>
        <p>Seu painel de gerenciamento rápido.</p>
      </header>

      <div className="dashboard-cards">
        {cardConfig.map((card) => (
          <div className="card" key={card.id}>
            <div className="card-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            {/* 4. Exibe o spinner enquanto carrega, depois o número */}
            {loading ? (
              <FaSpinner className="spinner" />
            ) : (
              <p className="card-number">{dashboardData[card.id]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
