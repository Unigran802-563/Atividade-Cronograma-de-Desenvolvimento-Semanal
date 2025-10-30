import React, { useState, useEffect } from "react";
import "./style.css";

const IngredientesPage = () => {
  const [ingredientes, setIngredientes] = useState([]);
  const [formData, setFormData] = useState({
    id_ingrediente: "",
    nome: "",
    unidade_medida: "",
  });
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    fetchIngredientes();
  }, []);

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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_ingrediente || !formData.nome) {
      setMensagem("ID e Nome são obrigatórios!");
      setMensagemTipo("erro");
      return;
    }

    if (!editandoId) {
      const idExistente = ingredientes.some(
        (ing) => ing.id_ingrediente === formData.id_ingrediente
      );

      if (idExistente) {
        setMensagem("Esse ID já existe! Escolha outro ID para o ingrediente.");
        setMensagemTipo("erro");
        return;
      }
    }

    try {
      const method = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `${API_URL}/ingrediente/${editandoId}`
        : `${API_URL}/ingrediente`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMensagem(
          editandoId ? "Ingrediente atualizado!" : "Ingrediente criado!"
        );
        setMensagemTipo("sucesso");
        setFormData({ id_ingrediente: "", nome: "", unidade_medida: "" });
        setEditandoId(null);
        fetchIngredientes();
      } else {
        setMensagem(`Erro: ${data.error}`);
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const handleEditar = (ingrediente) => {
    setFormData({ ...ingrediente });
    setEditandoId(ingrediente.id_ingrediente);
    setMensagem("");
  };

  const handleCancelar = () => {
    setFormData({ id_ingrediente: "", nome: "", unidade_medida: "" });
    setEditandoId(null);
    setMensagem("");
  };

  const handleDeletar = async (id) => {
    if (!window.confirm("Deseja realmente deletar este ingrediente?")) return;
    try {
      const res = await fetch(`${API_URL}/ingrediente/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setMensagem("Ingrediente deletado!");
        setMensagemTipo("sucesso");
        fetchIngredientes();
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
      <h2>Cadastro de Ingrediente</h2>
      <form onSubmit={handleSubmit} className="form-cadastro">
        <label>ID do Ingrediente</label>
        <input
          type="text"
          name="id_ingrediente"
          placeholder="Ex: I001"
          value={formData.id_ingrediente}
          onChange={handleChange}
          required
          disabled={editandoId}
        />
        <label>Nome</label>
        <input
          type="text"
          name="nome"
          placeholder="Ex: Tomate"
          value={formData.nome}
          onChange={handleChange}
          required
        />
        <label>Unidade de Medida</label>
        <select
          name="unidade_medida"
          value={formData.unidade_medida}
          onChange={handleChange}
          required
        >
          <option value="">Selecione...</option>
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="l">l</option>
          <option value="ml">ml</option>
          <option value="un">un</option>
        </select>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            className={editandoId ? "atualizar" : "cadastrar"}
          >
            {editandoId ? "Atualizar" : "Cadastrar"}
          </button>
          {editandoId && (
            <button type="button" onClick={handleCancelar} className="cancelar">
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

      <h3>Lista de Ingredientes</h3>
      {ingredientes.length === 0 ? (
        <p className="sem-registro">Nenhum ingrediente cadastrado ainda.</p>
      ) : (
        <table className="tabela-cadastro">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Unidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ingredientes.map((i) => (
              <tr key={i.id_ingrediente}>
                <td>{i.id_ingrediente}</td>
                <td>{i.nome}</td>
                <td>{i.unidade_medida}</td>
                <td>
                  <div className="button-group">
                    <button className="editar" onClick={() => handleEditar(i)}>
                      Editar
                    </button>
                    <button
                      className="deletar"
                      onClick={() => handleDeletar(i.id_ingrediente)}
                    >
                      Deletar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default IngredientesPage;