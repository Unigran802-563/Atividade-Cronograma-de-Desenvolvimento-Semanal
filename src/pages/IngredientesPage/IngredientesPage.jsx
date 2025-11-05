import React, { useState, useEffect } from "react";
import "./IngredientesPage.css"; // Importa o CSS final
import { FaEdit, FaTrash, FaPlus, FaCheck } from "react-icons/fa";

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
    if (
      !formData.id_ingrediente ||
      !formData.nome ||
      !formData.unidade_medida
    ) {
      setMensagem("Todos os campos são obrigatórios!");
      setMensagemTipo("erro");
      return;
    }

    if (!editandoId) {
      const idExistente = ingredientes.some(
        (ing) => ing.id_ingrediente === formData.id_ingrediente
      );
      if (idExistente) {
        setMensagem("Esse ID já existe! Escolha outro para o ingrediente.");
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
          editandoId
            ? "Ingrediente atualizado com sucesso!"
            : "Ingrediente cadastrado com sucesso!"
        );
        setMensagemTipo("sucesso");
        handleCancelar();
        fetchIngredientes();
      } else {
        setMensagem(`Erro: ${data.error || "Ocorreu um problema."}`);
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro de conexão: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const handleEditar = (ingrediente) => {
    setFormData({ ...ingrediente });
    setEditandoId(ingrediente.id_ingrediente);
    setMensagem("");
    window.scrollTo(0, 0);
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
      if (res.ok) {
        setMensagem("Ingrediente deletado com sucesso!");
        setMensagemTipo("sucesso");
        fetchIngredientes();
      } else {
        const data = await res.json();
        setMensagem(
          `Erro ao deletar: ${data.error || "Não foi possível deletar."}`
        );
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro de conexão: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Cadastro de Ingredientes</h1>
        <p>Gerencie os ingredientes que serão utilizados nos pratos.</p>
      </header>

      {mensagem && <div className={`message ${mensagemTipo}`}>{mensagem}</div>}

      <div className="main-container">
        <div className="form-card">
          <h2>{editandoId ? "Editar Ingrediente" : "Novo Ingrediente"}</h2>
          <form onSubmit={handleSubmit} className="main-form">
            <div className="form-group">
              <label htmlFor="id_ingrediente">ID do Ingrediente *</label>
              <input
                type="text"
                id="id_ingrediente"
                name="id_ingrediente"
                placeholder="Ex: I001, FRUT02"
                value={formData.id_ingrediente}
                onChange={handleChange}
                required
                disabled={!!editandoId}
              />
            </div>
            <div className="form-group">
              <label htmlFor="nome">Nome do Ingrediente *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                placeholder="Ex: Tomate Cereja"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="unidade_medida">Unidade de Medida *</label>
              <select
                id="unidade_medida"
                name="unidade_medida"
                value={formData.unidade_medida}
                onChange={handleChange}
                required
              >
                <option value="">Selecione a unidade</option>
                <option value="kg">Quilograma (kg)</option>
                <option value="g">Grama (g)</option>
                <option value="L">Litro (L)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="un">Unidade (un)</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editandoId ? (
                  <>
                    <FaCheck /> Atualizar
                  </>
                ) : (
                  <>
                    <FaPlus /> Cadastrar
                  </>
                )}
              </button>
              {editandoId && (
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* === MUDANÇA PRINCIPAL AQUI: de <table> para grid de <div> === */}
        <div className="lista-card">
          <h2>Ingredientes Cadastrados</h2>
          {ingredientes.length === 0 ? (
            <p className="lista-vazia">Nenhum ingrediente cadastrado.</p>
          ) : (
            <div className="lista-grid">
              {ingredientes.map((i) => (
                <div className="item-card" key={i.id_ingrediente}>
                  <div className="item-info">
                    <span className="item-id">{i.id_ingrediente}</span>
                    <h3>{i.nome}</h3>
                    <div className="item-detalhes">
                      <span className="item-unidade">{i.unidade_medida}</span>
                    </div>
                  </div>
                  <div className="item-acoes">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEditar(i)}
                      title="Editar"
                    >
                      <FaEdit color="#10B981" />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeletar(i.id_ingrediente)}
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

export default IngredientesPage;
