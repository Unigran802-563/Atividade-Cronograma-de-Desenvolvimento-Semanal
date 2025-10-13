
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <h1>Bem-vindo ao SOS Restaurante</h1>
      <p>Sistema de Gerenciamento Completo</p>
      
      <div className="dashboard-cards">
        <div className="card">
          <h3>Pratos Cadastrados</h3>
          <p className="card-number">0</p>
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
          <h3>Pedidos</h3>
          <p className="card-number">0</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;