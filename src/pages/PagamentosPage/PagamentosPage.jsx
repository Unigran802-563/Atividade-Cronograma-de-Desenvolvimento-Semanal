import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 1. Importar hooks
import "./PagamentosPage.css"; // Importar o novo CSS
import {
  FaPix,
  FaCreditCard,
  FaMoneyBillWave,
  FaPlus,
  FaCheck,
} from "react-icons/fa6"; // Ícones para métodos

const PagamentosPage = () => {
  const { idPedido, valorTotal } = useParams(); // 2. Pegar dados da URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id_pagamento: "",
    id_pedido: idPedido || "",
    metodo_pagamento: "PIX",
    valor_centavos: valorTotal || 0,
    status: "pendente",
    // Campos específicos
    bandeira: "",
    ultimos4: "",
    parcelas: 1,
    chave_pix: "",
    valor_pago: "", // Para troco em dinheiro
  });
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");

  const API_URL = "http://localhost:3001";

  // Efeito para atualizar o valor se ele mudar na URL
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      id_pedido: idPedido,
      valor_centavos: valorTotal,
    }));
  }, [idPedido, valorTotal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_pagamento || !formData.id_pedido) {
      setMensagem("ID do Pagamento e do Pedido são obrigatórios.");
      setMensagemTipo("erro");
      return;
    }

    try {
      // Lógica para enviar para a API (simplificada)
      const res = await fetch(`${API_URL}/pagamento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pagamento: formData.id_pagamento,
          id_pedido: formData.id_pedido,
          metodo_pagamento: formData.metodo_pagamento,
          valor_centavos: formData.valor_centavos,
          status: formData.status,
          // ...enviar dados específicos do método (bandeira, chave_pix, etc.)
        }),
      });

      if (res.ok) {
        setMensagem("Pagamento registrado com sucesso!");
        setMensagemTipo("sucesso");
        setTimeout(() => navigate(`/pedidos`), 2000); // Volta para a lista de pedidos
      } else {
        const data = await res.json();
        setMensagem(
          `Erro: ${data.error || "Não foi possível registrar o pagamento."}`
        );
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro de conexão: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const renderMetodoPagamento = () => {
    switch (formData.metodo_pagamento) {
      case "CARTAO":
        return (
          <>
            <div className="form-group">
              <label htmlFor="bandeira">Bandeira</label>
              <input
                type="text"
                id="bandeira"
                name="bandeira"
                value={formData.bandeira}
                onChange={handleChange}
                placeholder="Ex: Visa"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ultimos4">Últimos 4 dígitos</label>
                <input
                  type="text"
                  id="ultimos4"
                  name="ultimos4"
                  value={formData.ultimos4}
                  onChange={handleChange}
                  maxLength="4"
                  placeholder="1234"
                />
              </div>
              <div className="form-group">
                <label htmlFor="parcelas">Parcelas</label>
                <input
                  type="number"
                  id="parcelas"
                  name="parcelas"
                  value={formData.parcelas}
                  onChange={handleChange}
                  min="1"
                />
              </div>
            </div>
          </>
        );
      case "PIX":
        return (
          <div className="form-group">
            <label htmlFor="chave_pix">Chave PIX</label>
            <input
              type="text"
              id="chave_pix"
              name="chave_pix"
              value={formData.chave_pix}
              onChange={handleChange}
              placeholder="email@exemplo.com ou CPF"
            />
          </div>
        );
      case "DINHEIRO":
        const troco =
          (parseFloat(formData.valor_pago) || 0) -
          formData.valor_centavos / 100;
        return (
          <>
            <div className="form-group">
              <label htmlFor="valor_pago">Valor Pago pelo Cliente (R$)</label>
              <input
                type="number"
                id="valor_pago"
                name="valor_pago"
                value={formData.valor_pago}
                onChange={handleChange}
                placeholder="50.00"
                step="0.01"
              />
            </div>
            {troco >= 0 && (
              <div className="troco-display">
                Troco: R$ {troco.toFixed(2).replace(".", ",")}
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Registro de Pagamento</h1>
        <p>Finalize o pedido #{idPedido} registrando o pagamento.</p>
      </header>

      {mensagem && <div className={`message ${mensagemTipo}`}>{mensagem}</div>}

      <div className="payment-container">
        <div className="form-card">
          <h2>Detalhes do Pagamento</h2>
          <form onSubmit={handleSubmit} className="main-form">
            <div className="total-display-form">
              <span>Valor Total a Pagar:</span>
              <span className="total-value">
                R${" "}
                {(formData.valor_centavos / 100).toFixed(2).replace(".", ",")}
              </span>
            </div>

            <div className="form-group">
              <label>Método de Pagamento</label>
              <div className="metodo-pagamento-group">
                <button
                  type="button"
                  className={`metodo-btn ${
                    formData.metodo_pagamento === "PIX" ? "active" : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      metodo_pagamento: "PIX",
                    }))
                  }
                >
                  <FaPix /> PIX
                </button>
                <button
                  type="button"
                  className={`metodo-btn ${
                    formData.metodo_pagamento === "CARTAO" ? "active" : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      metodo_pagamento: "CARTAO",
                    }))
                  }
                >
                  <FaCreditCard /> Cartão
                </button>
                <button
                  type="button"
                  className={`metodo-btn ${
                    formData.metodo_pagamento === "DINHEIRO" ? "active" : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      metodo_pagamento: "DINHEIRO",
                    }))
                  }
                >
                  <FaMoneyBillWave /> Dinheiro
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="id_pagamento">ID do Pagamento *</label>
              <input
                type="text"
                id="id_pagamento"
                name="id_pagamento"
                value={formData.id_pagamento}
                onChange={handleChange}
                required
                placeholder="Ex: PAG-2025-001"
              />
            </div>

            {renderMetodoPagamento()}

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                <FaCheck /> Confirmar Pagamento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PagamentosPage;
