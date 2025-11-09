import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ItemPedidosPage.css";
import { FaEdit, FaTrash, FaCreditCard } from "react-icons/fa";

const ItemPedidosPage = () => {
  const navigate = useNavigate();
  const { idPedido: idPedidoUrl } = useParams();
  const [todosOsItens, setTodosOsItens] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [pratos, setPratos] = useState([]);
  const [pedidoSelecionadoId, setPedidoSelecionadoId] = useState(idPedidoUrl || "");
  const [itensFiltrados, setItensFiltrados] = useState([]);
  const [totalPedido, setTotalPedido] = useState(0);
  const [formData, setFormData] = useState({ id_item: "", id_prato: "", quantidade: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");
  const API_URL = "http://localhost:3001";

  useEffect(() => {
    const fetchDadosIniciais = async () => {
      try {
        const [resItens, resPedidos, resPratos] = await Promise.all([
          fetch(`${API_URL}/itempedidos`),
          fetch(`${API_URL}/pedidos`),
          fetch(`${API_URL}/pratos`),
        ]);
        setTodosOsItens(await resItens.json());
        setPedidos(await resPedidos.json());
        setPratos(await resPratos.json());
      } catch (err) {
        setMensagem(`Erro ao carregar dados iniciais: ${err.message}`);
        setMensagemTipo("erro");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    fetchDadosIniciais();
  }, []);

  useEffect(() => {
    if (pedidoSelecionadoId) {
      const itensDoPedido = todosOsItens.filter(
        (item) => item.id_pedido === pedidoSelecionadoId
      );
      setItensFiltrados(itensDoPedido);
      const total = itensDoPedido.reduce(
        (acc, item) => acc + item.subtotal_centavos,
        0
      );
      setTotalPedido(total);
    } else {
      setItensFiltrados([]);
      setTotalPedido(0);
    }
  }, [pedidoSelecionadoId, todosOsItens]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "quantidade" && parseInt(value, 10) < 1) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pedidoSelecionadoId) {
      setMensagem("Por favor, selecione um pedido antes de adicionar um item.");
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const camposObrigatorios = ["id_item", "id_prato", "quantidade"];
    for (const campo of camposObrigatorios) {
      if (!formData[campo]?.trim()) {
        setMensagem(`O campo "${campo}" é obrigatório!`);
        setMensagemTipo("erro");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    const quantidadeNum = parseInt(formData.quantidade, 10);
    if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
      setMensagem("A quantidade deve ser um número positivo!");
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const pratoSelecionado = pratos.find((p) => p.id_prato === formData.id_prato);
    if (!pratoSelecionado) {
      setMensagem("Prato selecionado é inválido!");
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!editandoId) {
      const idJaExiste = todosOsItens.some((item) => item.id_item === formData.id_item);
      if (idJaExiste) {
        setMensagem(`O ID "${formData.id_item}" já existe. Escolha outro ID.`);
        setMensagemTipo("erro");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    const subtotalCentavos = pratoSelecionado.preco_centavos * quantidadeNum;

    try {
      const method = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `${API_URL}/itempedido/${editandoId}`
        : `${API_URL}/itempedido`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_item: formData.id_item,
          id_pedido: pedidoSelecionadoId,
          id_prato: formData.id_prato,
          quantidade: quantidadeNum,
          subtotal_centavos: subtotalCentavos,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensagem(editandoId ? "Item atualizado!" : "Item adicionado com sucesso!");
        setMensagemTipo("sucesso");
        window.scrollTo({ top: 0, behavior: "smooth" });
        handleCancelar();
        const resItens = await fetch(`${API_URL}/itempedidos`);
        setTodosOsItens(await resItens.json());
      } else {
        setMensagem(`Erro: ${data.error || "Não foi possível salvar o item."}`);
        setMensagemTipo("erro");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setMensagem(`Erro de conexão: ${err.message}`);
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEditar = (item) => {
    setEditandoId(item.id_item);
    setFormData({
      id_item: item.id_item,
      id_prato: item.id_prato,
      quantidade: item.quantidade.toString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setFormData({ id_item: "", id_prato: "", quantidade: "" });
  };

  const handleDeletar = async (id) => {
    if (!window.confirm("Deseja realmente remover este item do pedido?")) return;
    try {
      const res = await fetch(`${API_URL}/itempedido/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMensagem("Item removido com sucesso!");
        setMensagemTipo("sucesso");
        window.scrollTo({ top: 0, behavior: "smooth" });
        const resItens = await fetch(`${API_URL}/itempedidos`);
        setTodosOsItens(await resItens.json());
      } else {
        const data = await res.json();
        setMensagem(`Erro: ${data.error || "Não foi possível remover o item."}`);
        setMensagemTipo("erro");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setMensagem(`Erro de conexão: ${err.message}`);
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getNomePrato = (id) => pratos.find((p) => p.id_prato === id)?.nome || id;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Itens de Pedido</h1>
        <p>Adicione, edite ou remova os itens de um pedido específico.</p>
      </header>

      {mensagem && <div className={`message ${mensagemTipo}`}>{mensagem}</div>}

      <div className="pedido-selector-card">
        <label htmlFor="pedido-selector">Selecione o Pedido</label>
        <select
          id="pedido-selector"
          value={pedidoSelecionadoId}
          onChange={(e) => setPedidoSelecionadoId(e.target.value)}
        >
          <option value="">-- Escolha um pedido --</option>
          {pedidos.map((p) => (
            <option key={p.id_pedido} value={p.id_pedido}>
              Pedido #{p.id_pedido}
            </option>
          ))}
        </select>
      </div>

      {pedidoSelecionadoId && (
        <>
          <div className="main-container">
            <div className="form-card">
              <h2>{editandoId ? "Editar Item" : "Adicionar Item"}</h2>
              <form onSubmit={handleSubmit} className="main-form">
                <div className="form-group">
                  <label htmlFor="id_item">ID do Item</label>
                  <input
                    type="text"
                    id="id_item"
                    name="id_item"
                    value={formData.id_item}
                    onChange={handleChange}
                    placeholder="EX: ITE-001"
                    required
                    disabled={!!editandoId}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="id_prato">Prato</label>
                  <select
                    id="id_prato"
                    name="id_prato"
                    value={formData.id_prato}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione um prato...</option>
                    {pratos.map((p) => (
                      <option key={p.id_prato} value={p.id_prato}>
                        {p.nome} - R$ {(p.preco_centavos / 100).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {pratos.length === 0 && (
                    <div className="sem-prato">
                      <p>Nenhum prato cadastrado. Cadastre um prato primeiro!</p>
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => navigate("/pratos")}
                      >
                        Cadastrar Prato
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="quantidade">Quantidade</label>
                  <input
                    type="number"
                    id="quantidade"
                    name="quantidade"
                    min="1"
                    step="1"
                    value={formData.quantidade}
                    onChange={handleChange}
                    placeholder="Ex: 1"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-success">
                    {editandoId ? "Atualizar Item" : "Adicionar Item"}
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
              <h2>Itens no Pedido #{pedidoSelecionadoId}</h2>
              {itensFiltrados.length === 0 ? (
                <p className="lista-vazia">Nenhum item adicionado a este pedido.</p>
              ) : (
                <div className="lista-grid">
                  {itensFiltrados.map((item) => (
                    <div className="item-card" key={item.id_item}>
                      <div className="item-info">
                        <h3>ID: {item.id_item}</h3>
                        <p>Prato: {getNomePrato(item.id_prato)}</p>
                        <p>Quantidade: {item.quantidade}</p>
                        <p>
                          Subtotal: R$ {(item.subtotal_centavos / 100).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      <div className="item-acoes">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditar(item)}
                          title="Editar"
                        >
                          <FaEdit color="#10B981" />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeletar(item.id_item)}
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

          <div className="payment-section">
            <div className="total-display">
              <span>Total do Pedido:</span>
              <span className="total-value">
                R$ {(totalPedido / 100).toFixed(2).replace(".", ",")}
              </span>
            </div>
            <button
              className="btn btn-success btn-payment"
              onClick={() =>
                navigate(`/pagamento/${pedidoSelecionadoId}/${totalPedido}`)
              }
              disabled={!pedidoSelecionadoId || itensFiltrados.length === 0}
            >
              <FaCreditCard /> Ir para Pagamento
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ItemPedidosPage;
