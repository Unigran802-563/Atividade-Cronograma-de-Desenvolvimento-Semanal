import React, { useState, useEffect } from "react";
import "./PedidosPage.css";
import { FaEdit, FaTrash, FaPlus, FaCheck } from "react-icons/fa";

const PedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    // 1. CAMPOS CORRIGIDOS PARA CORRESPONDER AO BANCO DE DADOS
    id_pedido: "",
    id_cliente: "",
    status: "em_preparo",
  });
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    fetchPedidos();
    fetchClientes();
  }, []);

  const fetchPedidos = async () => {
    try {
      const res = await fetch(`${API_URL}/pedidos`);
      const data = await res.json();
      setPedidos(data);
    } catch (err) {
      setMensagem(`Erro ao buscar pedidos: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const fetchClientes = async () => {
    try {
      const res = await fetch(`${API_URL}/clientes`);
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 2. VALIDAÇÃO ATUALIZADA
    if (!formData.id_pedido || !formData.id_cliente || !formData.status) {
      setMensagem("ID do Pedido, Cliente e Status são obrigatórios!");
      setMensagemTipo("erro");
      return;
    }

    // Verifica se o ID já existe ao criar um novo pedido
    if (
      !editandoId &&
      pedidos.some((p) => p.id_pedido === formData.id_pedido)
    ) {
      setMensagem(
        "Este ID de pedido já está em uso. Por favor, escolha outro."
      );
      setMensagemTipo("erro");
      return;
    }

    try {
      const method = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `${API_URL}/pedido/${editandoId}`
        : `${API_URL}/pedido`;

      // 3. CORPO DA REQUISIÇÃO CORRIGIDO
      const body = {
        id_pedido: formData.id_pedido,
        id_cliente: formData.id_cliente,
        status: formData.status,
        // A data é gerada no backend ao criar, e não é alterada ao editar
        // O total_centavos é calculado a partir dos itens, então não é enviado aqui
      };

      // Ao criar, adicionamos a data
      if (!editandoId) {
        body.data_pedido = new Date().toISOString();
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setMensagem(
          editandoId
            ? "Pedido atualizado com sucesso!"
            : "Pedido criado com sucesso!"
        );
        setMensagemTipo("sucesso");
        handleCancelar();
        fetchPedidos();
      } else {
        setMensagem(
          `Erro: ${data.error || "Não foi possível salvar o pedido."}`
        );
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro de conexão: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const handleEditar = (pedido) => {
    setEditandoId(pedido.id_pedido);
    // 4. FORMULÁRIO DE EDIÇÃO CORRIGIDO
    setFormData({
      id_pedido: pedido.id_pedido,
      id_cliente: pedido.id_cliente,
      status: pedido.status,
    });
    setMensagem("");
    window.scrollTo(0, 0);
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setFormData({ id_pedido: "", id_cliente: "", status: "em_preparo" });
  };

  const handleDeletar = async (id) => {
    if (
      !window.confirm(
        "Deseja realmente deletar este pedido? Isso também deletará todos os seus itens e pagamentos associados."
      )
    )
      return;
    try {
      const res = await fetch(`${API_URL}/pedido/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMensagem("Pedido deletado com sucesso!");
        setMensagemTipo("sucesso");
        fetchPedidos();
      } else {
        const data = await res.json();
        setMensagem(`Erro: ${data.error || "Não foi possível deletar."}`);
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro de conexão: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const getNomeCliente = (id) =>
    clientes.find((c) => c.id_cliente === id)?.nome || `Cliente #${id}`;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gerenciamento de Pedidos</h1>
        <p>Crie e acompanhe o status dos pedidos dos clientes.</p>
      </header>

      {mensagem && <div className={`message ${mensagemTipo}`}>{mensagem}</div>}

      <div className="main-container">
        <div className="form-card">
          <h2>{editandoId ? "Editar Status do Pedido" : "Novo Pedido"}</h2>
          <form onSubmit={handleSubmit} className="main-form">
            {/* 5. FORMULÁRIO JSX CORRIGIDO */}
            <div className="form-group">
              <label htmlFor="id_pedido">ID do Pedido *</label>
              <input
                type="text"
                id="id_pedido"
                name="id_pedido"
                value={formData.id_pedido}
                onChange={handleChange}
                required
                disabled={!!editandoId} // ID não pode ser alterado na edição
                placeholder="Ex: PED-2025-001"
              />
            </div>

            <div className="form-group">
              <label htmlFor="id_cliente">Cliente *</label>
              <select
                id="id_cliente"
                name="id_cliente"
                value={formData.id_cliente}
                onChange={handleChange}
                required
                disabled={!!editandoId} // Não permite trocar o cliente de um pedido existente
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status do Pedido *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                {/* Opções de status baseadas no seu schema */}
                <option value="em_preparo">Em Preparo</option>
                <option value="pronto">Pronto</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editandoId ? (
                  <>
                    <FaCheck /> Atualizar Pedido
                  </>
                ) : (
                  <>
                    <FaPlus /> Criar Pedido
                  </>
                )}
              </button>
              {editandoId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelar}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lista-card">
          <h2>Pedidos Atuais</h2>
          {pedidos.length === 0 ? (
            <p className="lista-vazia">Nenhum pedido cadastrado.</p>
          ) : (
            <div className="lista-grid">
              {pedidos.map((p) => (
                <div className="item-card" key={p.id_pedido}>
                  <div className="item-info">
                    <h3>{getNomeCliente(p.id_cliente)}</h3>
                    <p className="item-descricao">Pedido #{p.id_pedido}</p>
                    <div className="item-detalhes">
                      <span className="item-data">
                        {new Date(p.data_pedido).toLocaleDateString("pt-BR")}
                      </span>
                      <span className={`status-chip ${p.status}`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="item-acoes">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEditar(p)}
                      title="Editar"
                    >
                      <FaEdit color="#10B981" />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeletar(p.id_pedido)}
                      title="Deletar"
                    >
                      <FaTrash color="#EF4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PedidosPage;
