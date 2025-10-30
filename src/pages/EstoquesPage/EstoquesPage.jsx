import React, { useState, useEffect } from "react";
import "./style.css";

const EstoquesPage = () => {
  const [estoques, setEstoques] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [formData, setFormData] = useState({
    id_estoque: "",
    id_ingrediente: "",
    quantidade: "",
    limite_minimo: "",
    unidade: "",
    data_atualizacao: "",
  });
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    fetchEstoques();
    fetchIngredientes();
  }, []);

  const fetchEstoques = async () => {
    try {
      const res = await fetch(`${API_URL}/estoques`);
      const data = await res.json();
      setEstoques(data);
    } catch (err) {
      setMensagem(`Erro ao buscar estoques: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const fetchIngredientes = async () => {
    try {
      const res = await fetch(`${API_URL}/ingredientes`);
      const data = await res.json();
      setIngredientes(data);
    } catch (err) {
      setMensagem(`Erro ao buscar ingredientes: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "id_ingrediente") {
      const ingredienteSelecionado = ingredientes.find(
        (i) => i.id_ingrediente === value
      );
      setFormData({
        ...formData,
        id_ingrediente: value,
        unidade: ingredienteSelecionado ? ingredienteSelecionado.unidade_medida : "",
      });
      return;
    }

    if ((name === "quantidade" || name === "limite_minimo") && parseFloat(value) < 0) {
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id_estoque, id_ingrediente, quantidade, limite_minimo, unidade, data_atualizacao } = formData;

    if (!id_estoque || !id_ingrediente || !quantidade || !limite_minimo || !unidade || !data_atualizacao) {
      setMensagem("Todos os campos são obrigatórios!");
      setMensagemTipo("erro");
      return;
    }

    const quantidadeNum = parseFloat(quantidade);
    const limiteMinimoNum = parseFloat(limite_minimo);

    if (isNaN(quantidadeNum) || isNaN(limiteMinimoNum) || quantidadeNum < 0 || limiteMinimoNum < 0) {
      setMensagem("Quantidade e Limite mínimo devem ser números positivos!");
      setMensagemTipo("erro");
      return;
    }

    if (!editandoId && estoques.some((e) => e.id_ingrediente === id_ingrediente)) {
      setMensagem("Este ingrediente já possui um estoque cadastrado!");
      setMensagemTipo("erro");
      return;
    }

    try {
      const method = editandoId ? "PUT" : "POST";
      const url = editandoId ? `${API_URL}/estoque/${editandoId}` : `${API_URL}/estoque`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantidade: quantidadeNum,
          limite_minimo: limiteMinimoNum,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensagem(editandoId ? "Estoque atualizado!" : "Estoque criado!");
        setMensagemTipo("sucesso");
        setFormData({
          id_estoque: "",
          id_ingrediente: "",
          quantidade: "",
          limite_minimo: "",
          unidade: "",
          data_atualizacao: "",
        });
        setEditandoId(null);
        fetchEstoques();
      } else {
        setMensagem(`Erro: ${data.error}`);
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const handleEditar = (estoque) => {
    const ingredienteSelecionado = ingredientes.find(
      (i) => i.id_ingrediente === estoque.id_ingrediente
    );
    setFormData({
      id_estoque: estoque.id_estoque,
      id_ingrediente: estoque.id_ingrediente,
      quantidade: estoque.quantidade,
      limite_minimo: estoque.limite_minimo,
      unidade: ingredienteSelecionado ? ingredienteSelecionado.unidade_medida : "",
      data_atualizacao: estoque.data_atualizacao,
    });
    setEditandoId(estoque.id_estoque);
    setMensagem("");
  };

  const handleCancelar = () => {
    setFormData({
      id_estoque: "",
      id_ingrediente: "",
      quantidade: "",
      limite_minimo: "",
      unidade: "",
      data_atualizacao: "",
    });
    setEditandoId(null);
    setMensagem("");
  };

  const handleDeletar = async (id) => {
    if (!window.confirm("Deseja realmente deletar este estoque?")) return;
    try {
      const res = await fetch(`${API_URL}/estoque/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMensagem("Estoque deletado!");
        setMensagemTipo("sucesso");
        fetchEstoques();
      } else {
        setMensagem(`Erro: ${data.error}`);
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  return (
    <div className="container">
      <h2>Cadastro de Estoque</h2>
      <form onSubmit={handleSubmit} className="form-cadastro">
        <label>ID do Estoque</label>
        <input
          type="text"
          name="id_estoque"
          value={formData.id_estoque}
          onChange={handleChange}
          required
          disabled={editandoId}
        />

        <label>Ingrediente</label>
        <select
          name="id_ingrediente"
          value={formData.id_ingrediente}
          onChange={handleChange}
          required
        >
          <option value="">Selecione...</option>
          {ingredientes.map((i) => (
            <option key={i.id_ingrediente} value={i.id_ingrediente}>
              {i.nome} ({i.unidade_medida})
            </option>
          ))}
        </select>

        <label>Quantidade</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="number"
            name="quantidade"
            min="0"
            step="0.01"
            value={formData.quantidade}
            onChange={handleChange}
            required
          />
          <span
            style={{
              backgroundColor: "#6a0dad",
              color: "white",
              padding: "4px 8px",
              borderRadius: "6px",
              fontWeight: "bold",
              minWidth: "40px",
              textAlign: "center",
            }}
          >
            {formData.unidade || "-"}
          </span>
        </div>

        <label>Limite mínimo</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="number"
            name="limite_minimo"
            min="0"
            step="0.01"
            value={formData.limite_minimo}
            onChange={handleChange}
            required
          />
          <span
            style={{
              backgroundColor: "#6a0dad",
              color: "white",
              padding: "4px 8px",
              borderRadius: "6px",
              fontWeight: "bold",
              minWidth: "40px",
              textAlign: "center",
            }}
          >
            {formData.unidade || "-"}
          </span>
        </div>

        <label>Data de atualização</label>
        <input
          type="date"
          name="data_atualizacao"
          value={formData.data_atualizacao}
          onChange={handleChange}
          required
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" className={editandoId ? "atualizar" : "cadastrar"}>
            {editandoId ? "Atualizar" : "Cadastrar"}
          </button>
          {editandoId && (
            <button type="button" className="cancelar" onClick={handleCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {mensagem && (
        <p className={`mensagem ${mensagemTipo === "erro" ? "erro" : ""}`}>
          {mensagem}
        </p>
      )}

      <h3>Lista de Estoques</h3>
      {estoques.length === 0 ? (
        <p className="sem-registro">Nenhum estoque cadastrado ainda.</p>
      ) : (
        <table className="tabela-cadastro">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ingrediente</th>
              <th>Quantidade</th>
              <th>Limite mínimo</th>
              <th>Data Atualização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {estoques.map((e) => {
              const ingrediente = ingredientes.find((i) => i.id_ingrediente === e.id_ingrediente);
              return (
                <tr key={e.id_estoque}>
                  <td>{e.id_estoque}</td>
                  <td>{ingrediente?.nome || e.id_ingrediente}</td>
                  <td>{Number(e.quantidade).toFixed(2)} {ingrediente?.unidade_medida}</td>
                  <td>{Number(e.limite_minimo).toFixed(2)} {ingrediente?.unidade_medida}</td>
                  <td>{e.data_atualizacao}</td>
                  <td>
                    <div className="button-group">
                      <button className="editar" onClick={() => handleEditar(e)}>Editar</button>
                      <button className="deletar" onClick={() => handleDeletar(e.id_estoque)}>Deletar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EstoquesPage;