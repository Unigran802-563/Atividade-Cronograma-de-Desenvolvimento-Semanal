import React, { useState, useEffect } from "react";
import "./PedidosPage.css";

export default function PedidosPage() {
  const [pedido, setPedido] = useState({
    cliente: "",
    produto: "",
    quantidade: "",
    status: "em_preparo",
  });
  const [pedidos, setPedidos] = useState([]);
  const [editando, setEditando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPedido({ ...pedido, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editando) {
      const atualizados = pedidos.map((p) =>
        p.id === pedido.id ? pedido : p
      );
      setPedidos(atualizados);
      setEditando(false);
    } else {
      setPedidos([...pedidos, { ...pedido, id: Date.now() }]);
    }
    setPedido({ cliente: "", produto: "", quantidade: "", status: "em_preparo" });
  };

  const handleEdit = (p) => {
    setPedido(p);
    setEditando(true);
  };

  const handleDelete = (id) => {
    setPedidos(pedidos.filter((p) => p.id !== id));
  };

  return (
    <div className="bg-gray-900">
      <div className="container-principal">
        <h1 className="titulo-principal">Cadastro de Pedidos</h1>

        <div className="pedidos-container">
          {/* FORMULÁRIO */}
          <div className="card-base">
            <h2 className="card-header">{editando ? "Editar Pedido" : "Novo Pedido"}</h2>

            <form className="form-cadastro" onSubmit={handleSubmit}>
              <label className="form-label">Cliente</label>
              <input
                type="text"
                name="cliente"
                value={pedido.cliente}
                onChange={handleChange}
                className="form-input"
                required
              />

              <label className="form-label">Produto</label>
              <input
                type="text"
                name="produto"
                value={pedido.produto}
                onChange={handleChange}
                className="form-input"
                required
              />

              <label className="form-label">Quantidade</label>
              <input
                type="number"
                name="quantidade"
                value={pedido.quantidade}
                onChange={handleChange}
                className="form-input"
                min="1"
                required
              />

              <label className="form-label">Status</label>
              <select
                name="status"
                value={pedido.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="em_preparo">Em preparo</option>
                <option value="pronto">Pronto</option>
                <option value="cancelado">Cancelado</option>
              </select>

              <div className="button-group">
                <button type="submit" className="btn-base btn-cadastrar">
                  {editando ? "Atualizar" : "Cadastrar"}
                </button>
                {editando && (
                  <button
                    type="button"
                    className="btn-base btn-cancelar"
                    onClick={() => {
                      setEditando(false);
                      setPedido({
                        cliente: "",
                        produto: "",
                        quantidade: "",
                        status: "em_preparo",
                      });
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* LISTA DE PEDIDOS */}
          <div className="card-base">
            <h2 className="card-header">Lista de Pedidos</h2>

            {pedidos.length === 0 ? (
              <p className="lista-vazia">Nenhum pedido cadastrado.</p>
            ) : (
              <div className="tabela-wrapper">
                <table className="tabela-pedidos">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.cliente}</td>
                        <td>{p.produto}</td>
                        <td>{p.quantidade}</td>
                        <td>
                          <span className={`status-chip ${p.status}`}>
                            {p.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="tabela-acoes">
                          <button
                            className="btn-editar-tabela"
                            onClick={() => handleEdit(p)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-deletar-tabela"
                            onClick={() => handleDelete(p.id)}
                          >
                            🗑️
                          </button>
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
}
