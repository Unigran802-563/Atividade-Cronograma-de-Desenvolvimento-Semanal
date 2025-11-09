import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PedidosPage.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const PedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    id_pedido: "",
    id_cliente: "",
    status: "em_preparo",
  });
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");

  const API_URL = "http://localhost:3001";
  const navigate = useNavigate();

  useEffect(() => {
    fetchPedidos();
    fetchClientes();
  }, []);

  const limparMensagem = (tempo = 3000) => {
    setTimeout(() => {
      setMensagem("");
      setMensagemTipo("");
    }, tempo);
  };

  const exibirMensagem = (texto, tipo = "erro", tempo = 3000) => {
    setMensagem(texto);
    setMensagemTipo(tipo);
    window.scrollTo({ top: 0, behavior: "smooth" });
    limparMensagem(tempo);
  };

  const limparFormulario = () => {
    setEditandoId(null);
    setFormData({
      id_pedido: "",
      id_cliente: "",
      status: "em_preparo",
    });
  };

  const fetchPedidos = async () => {
    try {
      const res = await fetch(`${API_URL}/pedidos`);
      const data = await res.json();
      setPedidos(data);
    } catch (err) {
      exibirMensagem(`Erro ao buscar pedidos: ${err.message}`);
    }
  };

  const fetchClientes = async () => {
    try {
      const res = await fetch(`${API_URL}/clientes`);
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      exibirMensagem("Erro ao buscar clientes!");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const camposObrigatorios = ["id_pedido", "id_cliente", "status"];
    for (const campo of camposObrigatorios) {
      if (!formData[campo]?.toString().trim()) {
        const nomes = {
          id_pedido: "ID do Pedido",
          id_cliente: "Cliente",
          status: "Status do Pedido",
        };
        exibirMensagem(`O campo "${nomes[campo]}" é obrigatório!`);
        return;
      }
    }

    if (!editandoId && pedidos.some((p) => p.id_pedido === formData.id_pedido)) {
      exibirMensagem("Este ID de pedido já está em uso. Escolha outro.");
      return;
    }

    try {
      const method = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `${API_URL}/pedido/${editandoId}`
        : `${API_URL}/pedido`;

      const body = {
        id_pedido: formData.id_pedido,
        id_cliente: formData.id_cliente,
        status: formData.status,
      };

      if (!editandoId) body.data_pedido = new Date().toISOString();

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        exibirMensagem(
          editandoId
            ? "Pedido atualizado com sucesso!"
            : "Pedido criado com sucesso!",
          "sucesso"
        );
        limparFormulario();
        fetchPedidos();
      } else {
        exibirMensagem(`Erro: ${data.error || "Não foi possível salvar o pedido."}`);
      }
    } catch (err) {
      exibirMensagem(`Erro de conexão: ${err.message}`);
    }
  };

  const handleEditar = (pedido) => {
    setEditandoId(pedido.id_pedido);
    setFormData({
      id_pedido: pedido.id_pedido,
      id_cliente: pedido.id_cliente,
      status: pedido.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletar = async (id) => {
    if (!window.confirm("Deseja realmente deletar este pedido?")) return;
    try {
      const res = await fetch(`${API_URL}/pedido/${id}`, { method: "DELETE" });
      if (res.ok) {
        exibirMensagem("Pedido deletado com sucesso!", "sucesso");
        fetchPedidos();
      } else {
        const data = await res.json();
        exibirMensagem(`Erro: ${data.error || "Não foi possível deletar."}`);
      }
    } catch (err) {
      exibirMensagem(`Erro de conexão: ${err.message}`);
    }
  };

  const getNomeCliente = (id) =>
    clientes.find((c) => c.id_cliente === id)?.nome || `Cliente #${id}`;

  const redirecionar = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gerenciamento de Pedidos</h1>
        <p>Crie e acompanhe o status dos pedidos dos clientes.</p>
      </header>

      {mensagem && (
        <div className={`message ${mensagemTipo}`}>
          <p>{mensagem}</p>
        </div>
      )}

      <div className="main-container">
        <div className="form-card">
          <h2>{editandoId ? "Editar Pedido" : "Novo Pedido"}</h2>
          <form onSubmit={handleSubmit} className="main-form">
            <div className="form-group">
              <label htmlFor="id_pedido">ID do Pedido</label>
              <input
                type="text"
                id="id_pedido"
                name="id_pedido"
                value={formData.id_pedido}
                onChange={handleChange}
                disabled={!!editandoId}
                placeholder="Ex: PED-2025-001"
              />
            </div>

            <div className="form-group">
              <label htmlFor="id_cliente">Cliente</label>
              {clientes.length > 0 ? (
                <select
                  id="id_cliente"
                  name="id_cliente"
                  value={formData.id_cliente}
                  onChange={handleChange}
                  disabled={!!editandoId}
                  required
                >
                  <option value="">Selecione...</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <p>Nenhum cliente cadastrado. Cadastre um cliente primeiro!</p>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => redirecionar("/clientes")}
                  >
                    Cadastrar Cliente
                  </button>
                </>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status do Pedido</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="em_preparo">Em Preparo</option>
                <option value="pronto">Pronto</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editandoId ? "Atualizar Pedido" : "Criar Pedido"}
              </button>
              {editandoId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={limparFormulario}
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
                    <h3>ID: {p.id_pedido}</h3>
                    <p>Cliente: {getNomeCliente(p.id_cliente)}</p>
                    <p>Data: {new Date(p.data_pedido).toLocaleDateString("pt-BR")}</p>
                    <p>Status: {p.status.replace("_", " ")}</p>
                  </div>
                  <div className="item-acoes">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEditar(p)}
                    >
                      <FaEdit color="#10B981" />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeletar(p.id_pedido)}
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
