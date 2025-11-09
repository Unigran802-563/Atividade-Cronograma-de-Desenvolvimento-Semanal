import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PagamentosPage.css";
import { FaPix, FaCreditCard, FaMoneyBillWave } from "react-icons/fa6";

const PagamentosPage = () => {
  const { idPedido, valorTotal } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id_pagamento: "",
    id_pedido: idPedido || "",
    metodo_pagamento: "PIX",
    valor_centavos: Number(valorTotal) || 0,
    status: "pendente",
    bandeira: "",
    ultimos4: "",
    parcelas: 1,
    chave_pix: "",
    valor_pago: "",
  });

  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");
  const [pagamentosExistentes, setPagamentosExistentes] = useState([]);

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    const fetchPagamentos = async () => {
      try {
        const res = await fetch(`${API_URL}/pagamentos`);
        if (res.ok) {
          setPagamentosExistentes(await res.json());
        }
      } catch (err) {
        console.error("Erro ao buscar pagamentos:", err);
      }
    };
    fetchPagamentos();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      id_pedido: idPedido,
      valor_centavos: Number(valorTotal),
    }));
  }, [idPedido, valorTotal]);

  useEffect(() => {
    if (mensagem) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const timer = setTimeout(() => setMensagem(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const idJaExiste = pagamentosExistentes.some(
      (p) => p.id_pagamento === formData.id_pagamento
    );
    if (idJaExiste) {
      setMensagem("Já existe um pagamento com este ID!");
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    let camposObrigatorios = ["id_pagamento"];
    switch (formData.metodo_pagamento) {
      case "CARTAO":
        camposObrigatorios.push("bandeira", "ultimos4", "parcelas");
        break;
      case "PIX":
        camposObrigatorios.push("chave_pix");
        break;
      case "DINHEIRO":
        camposObrigatorios.push("valor_pago");
        break;
      default:
        break;
    }

    for (const campo of camposObrigatorios) {
      if (!formData[campo]?.toString().trim()) {
        setMensagem(`O campo "${campo}" é obrigatório!`);
        setMensagemTipo("erro");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    if (
      formData.metodo_pagamento === "DINHEIRO" &&
      parseFloat(formData.valor_pago) < formData.valor_centavos / 100
    ) {
      setMensagem(
        "O valor pago deve ser suficiente para cobrir o total do pedido!"
      );
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/pagamento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMensagem("Pagamento registrado com sucesso!");
        setMensagemTipo("sucesso");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => navigate(`/pedidos`), 2000);
      } else {
        const data = await res.json();
        setMensagem(
          `Erro: ${data.error || "Não foi possível registrar o pagamento."}`
        );
        setMensagemTipo("erro");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setMensagem(`Erro de conexão: ${err.message}`);
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCancelar = () => navigate(`/pedidos`);

  const renderMetodoPagamento = () => {
    switch (formData.metodo_pagamento) {
      case "CARTAO":
        return (
          <>
            <div className="form-group">
              <label>Bandeira</label>
              <input
                type="text"
                name="bandeira"
                value={formData.bandeira}
                onChange={handleChange}
                placeholder="Ex: Visa"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Últimos 4 dígitos</label>
                <input
                  type="text"
                  name="ultimos4"
                  value={formData.ultimos4}
                  onChange={handleChange}
                  maxLength="4"
                  placeholder="1234"
                />
              </div>
              <div className="form-group">
                <label>Parcelas</label>
                <input
                  type="number"
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
            <label>Chave PIX</label>
            <input
              type="text"
              name="chave_pix"
              value={formData.chave_pix}
              onChange={handleChange}
              placeholder="email@exemplo.com ou CPF"
            />
          </div>
        );

      case "DINHEIRO":
        const troco =
          (parseFloat(formData.valor_pago) || 0) - formData.valor_centavos / 100;
        return (
          <>
            <div className="form-group">
              <label>Valor Pago pelo Cliente (R$)</label>
              <input
                type="number"
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
                    setFormData({ ...formData, metodo_pagamento: "PIX" })
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
                    setFormData({ ...formData, metodo_pagamento: "CARTAO" })
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
                    setFormData({ ...formData, metodo_pagamento: "DINHEIRO" })
                  }
                >
                  <FaMoneyBillWave /> Dinheiro
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>ID do Pagamento</label>
              <input
                type="text"
                name="id_pagamento"
                value={formData.id_pagamento}
                onChange={handleChange}
                placeholder="Ex: PAG-2025-001"
              />
            </div>

            {renderMetodoPagamento()}

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                Confirmar Pagamento
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelar}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PagamentosPage;
