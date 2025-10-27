import React, { useState, useEffect } from "react";
import "../PedidosPage/PedidosPage.css"; 

const PedidoPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [formData, setFormData] = useState({
    id_pedido: "",
    cliente_id: "",
    data_pedido: new Date().toISOString().substring(0, 10),
    valor_total: 0,
    status: "em_preparo",
  });
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const mockPedidos = [
        { id_pedido: "P001", cliente_id: "C101", data_pedido: "2024-10-25", valor_total: 55.5, status: "pronto" },
        { id_pedido: "P002", cliente_id: "C102", data_pedido: "2024-10-25", valor_total: 120.0, status: "em_preparo" },
        { id_pedido: "P003", cliente_id: "C103", data_pedido: "2024-10-24", valor_total: 89.9, status: "cancelado" },
        { id_pedido: "P004", cliente_id: "C104", data_pedido: "2024-10-23", valor_total: 35.2, status: "em_preparo" },
      ];
      setPedidos(mockPedidos);
    } catch (err) {
      console.error(`Erro ao buscar pedidos: ${err.message}`);
      setMensagem("Erro ao carregar lista de pedidos.");
      setMensagemTipo("erro");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = { ...formData };

    try {
      const method = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `${API_URL}/pedido/${editandoId}`
        : `${API_URL}/pedido`;

      const res = { ok: true };

      if (res.ok) {
        setMensagem(editandoId ? "Pedido atualizado com sucesso!" : "Pedido cadastrado com sucesso!");
        setMensagemTipo("sucesso");
        handleCancelar();
        fetchPedidos();
      } else {
        setMensagem("Erro ao atualizar pedido!");
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const handleEditar = (pedido) => {
    setFormData({
      id_pedido: pedido.id_pedido,
      cliente_id: pedido.cliente_id,
      data_pedido: pedido.data_pedido,
      valor_total: pedido.valor_total,
      status: pedido.status,
    });
    setEditandoId(pedido.id_pedido);
    setMensagem("");
  };

  const handleCancelar = () => {
    setFormData({
      id_pedido: "",
      cliente_id: "",
      data_pedido: new Date().toISOString().substring(0, 10),
      valor_total: 0,
      status: "em_preparo",
    });
    setEditandoId(null);
    setMensagem("");
  };

  const handleDeletar = async (id) => {
    const isConfirmed = prompt(`Deseja realmente deletar o pedido ID ${id}? Digite 'SIM' para confirmar.`);
    if (isConfirmed !== "SIM") return;

    try {
      const res = { ok: true };

      if (res.ok) {
        setMensagem("Pedido deletado!");
        setMensagemTipo("sucesso");
        fetchPedidos();
      } else {
        setMensagem(`Erro ao deletar pedido.`);
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container-principal">
        {mensagem && (
          <p className={`mensagem ${mensagemTipo === "erro" ? "error" : "success"}`}>
            {mensagem}
          </p>
        )}

        <div className="pedidos-container">
          {/* FORMULÁRIO */}
          <div className="card-base card-form">
            <h2 className="card-header">
              {editandoId ? `Atualizar Pedido (ID: ${editandoId})` : "Novo Pedido"}
            </h2>

            <form className="form-cadastro" onSubmit={handleSubmit}>
              <label className="form-label">ID Pedido</label>
              <input
                type="text"
                name="id_pedido"
                className="form-input"
                placeholder="ID Pedido"
                value={formData.id_pedido}
                onChange={handleChange}
                required
                disabled={editandoId}
              />

              <label className="form-label">ID Cliente</label>
              <input
                type="text"
                name="cliente_id"
                className="form-input"
                placeholder="ID Cliente"
                value={formData.cliente_id}
                onChange={handleChange}
                required
              />

              <label className="form-label">Data Pedido</label>
              <input
                type="date"
                name="data_pedido"
                className="form-input"
                value={formData.data_pedido}
                onChange={handleChange}
                required
              />

              <label className="form-label">Valor Total</label>
              <input
                type="number"
                name="valor_total"
                className="form-input"
                placeholder="Valor Total"
                value={formData.valor_total}
                onChange={handleChange}
                required
              />

              {editandoId && (
                <>
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="em_preparo">Em preparo</option>
                    <option value="pronto">Pronto</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </>
              )}

              <div className="button-group">
                <button
                  type="submit"
                  className={`btn-base ${editandoId ? "btn-atualizar" : "btn-cadastrar"}`}
                >
                  {editandoId ? "Atualizar" : "Cadastrar"}
                </button>

                {editandoId && (
                  <button type="button" onClick={handleCancelar} className="btn-base btn-cancelar">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* LISTA DE PEDIDOS */}
          <div className="card-base">
            <h3 className="card-header">Lista de Pedidos ({pedidos.length})</h3>

            {pedidos.length === 0 ? (
              <p className="lista-vazia">Nenhum pedido cadastrado ainda.</p>
            ) : (
              <div className="tabela-wrapper">
                <table className="tabela-pedidos">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Data</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((p) => (
                      <tr key={p.id_pedido}>
                        <td>{p.id_pedido}</td>
                        <td>{p.cliente_id}</td>
                        <td>{p.data_pedido}</td>
                        <td>R$ {p.valor_total.toFixed(2)}</td>
                        <td>
                          <span className={`status-chip ${p.status}`}>
                            {p.status.toUpperCase().replace("_", " ")}
                          </span>
                        </td>
                        <td>
                          <div className="tabela-acoes">
                            <button
                              className="btn-editar-tabela"
                              onClick={() => handleEditar(p)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-deletar-tabela"
                              onClick={() => handleDeletar(p.id_pedido)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedidoPage;
