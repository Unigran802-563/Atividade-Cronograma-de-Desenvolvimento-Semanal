import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchEstoques();
    fetchIngredientes();
  }, []);

  useEffect(() => {
    if (mensagem) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const timer = setTimeout(() => setMensagem(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  useEffect(() => {
    const baixoExiste = estoques.some(
      (e) => parseFloat(e.quantidade) <= parseFloat(e.limite_minimo)
    );
    if (baixoExiste) {
      setMensagem("⚠ Alguns estoques estão baixos!");
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [estoques]);

  const fetchEstoques = async () => {
    try {
      const res = await fetch(`${API_URL}/estoques`);
      const data = await res.json();
      setEstoques(data);
    } catch (err) {
      setMensagem(`Erro ao buscar estoques: ${err.message}`);
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        unidade: ingredienteSelecionado
          ? ingredienteSelecionado.unidade_medida
          : "",
      });
      return;
    }

    if (
      (name === "quantidade" || name === "limite_minimo") &&
      parseFloat(value) < 0
    )
      return;

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const camposObrigatorios = [
      "id_estoque",
      "id_ingrediente",
      "quantidade",
      "limite_minimo",
      "unidade",
      "data_atualizacao",
    ];

    for (const campo of camposObrigatorios) {
      if (!formData[campo]?.toString().trim()) {
        setMensagem(`O campo "${campo}" é obrigatório!`);
        setMensagemTipo("erro");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    const quantidadeNum = parseFloat(formData.quantidade);
    const limiteMinimoNum = parseFloat(formData.limite_minimo);

    if (
      isNaN(quantidadeNum) ||
      isNaN(limiteMinimoNum) ||
      quantidadeNum < 0 ||
      limiteMinimoNum < 0
    ) {
      setMensagem("Quantidade e Limite mínimo devem ser números positivos!");
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (
      !editandoId &&
      estoques.some((e) => e.id_ingrediente === formData.id_ingrediente)
    ) {
      setMensagem("Este ingrediente já possui um estoque cadastrado!");
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const method = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `${API_URL}/estoque/${editandoId}`
        : `${API_URL}/estoque`;

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
        setMensagem(
          editandoId
            ? "Estoque atualizado com sucesso!"
            : "Estoque cadastrado com sucesso!"
        );
        setMensagemTipo("sucesso");
        window.scrollTo({ top: 0, behavior: "smooth" });
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
        setMensagem(`Erro: ${data.error || "Ocorreu um problema."}`);
        setMensagemTipo("erro");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setMensagem(`Erro de conexão: ${err.message}`);
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      unidade: ingredienteSelecionado
        ? ingredienteSelecionado.unidade_medida
        : "",
      data_atualizacao: estoque.data_atualizacao,
    });

    setEditandoId(estoque.id_estoque);
    setMensagem("");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      if (res.ok) {
        setMensagem("Estoque deletado com sucesso!");
        setMensagemTipo("sucesso");
        fetchEstoques();
      } else {
        const data = await res.json();
        setMensagem(
          `Erro ao deletar: ${data.error || "Não foi possível deletar."}`
        );
        setMensagemTipo("erro");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setMensagem(`Erro de conexão: ${err.message}`);
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const estoquesOrdenados = [...estoques].sort((a, b) => {
    const aBaixo = parseFloat(a.quantidade) <= parseFloat(a.limite_minimo);
    const bBaixo = parseFloat(b.quantidade) <= parseFloat(b.limite_minimo);
    if (aBaixo && !bBaixo) return -1;
    if (!aBaixo && bBaixo) return 1;
    return 0;
  });

  const formatarData = (data) => {
    const d = new Date(data);
    if (isNaN(d)) return data;
    return d.toLocaleDateString("pt-BR");
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gerenciamento de Estoque</h1>
        <p>Cadastre e gerencie os estoques do sistema.</p>
      </header>

      {mensagem && <div className={`message ${mensagemTipo}`}>{mensagem}</div>}

      <div className="main-container">
        <div className="form-card">
          <h2>{editandoId ? "Editar Estoque" : "Novo Estoque"}</h2>
          <form onSubmit={handleSubmit} className="main-form">
            <div className="form-group">
              <label>ID Estoque</label>
              <input
                type="text"
                name="id_estoque"
                value={formData.id_estoque}
                onChange={handleChange}
                placeholder="EX: EST-001"
                disabled={!!editandoId}
                required
              />
            </div>

            <div className="form-group">
              <label>Ingrediente</label>
              <select
                name="id_ingrediente"
                value={formData.id_ingrediente}
                onChange={handleChange}
                required={ingredientes.length > 0}
              >
                <option value="">Selecione...</option>
                {ingredientes.map((i) => (
                  <option key={i.id_ingrediente} value={i.id_ingrediente}>
                    {i.nome} ({i.unidade_medida})
                  </option>
                ))}
              </select>

              {ingredientes.length === 0 && (
                <div className="sem-ingrediente">
                  <p>
                    Nenhum ingrediente cadastrado. Cadastre um ingrediente
                    primeiro!
                  </p>
                  <button
                    type="button"
                    className="btn btn-success mt-2"
                    onClick={() => {
                      navigate("/ingredientes");
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }, 100);
                    }}
                  >
                    Cadastrar Ingrediente
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Quantidade</label>
              <div className="input-unidade">
                <input
                  type="number"
                  name="quantidade"
                  min="0"
                  step="0.01"
                  value={formData.quantidade}
                  onChange={handleChange}
                  placeholder="Ex: 12.5"
                  required
                />
                <span className="badge-unidade roxo-escuro">
                  {formData.unidade || "-"}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Limite mínimo</label>
              <div className="input-unidade">
                <input
                  type="number"
                  name="limite_minimo"
                  min="0"
                  step="0.01"
                  value={formData.limite_minimo}
                  onChange={handleChange}
                  placeholder="Ex: 5.00"
                  required
                />
                <span className="badge-unidade roxo-escuro">
                  {formData.unidade || "-"}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Data de atualização</label>
              <input
                type="date"
                name="data_atualizacao"
                value={formData.data_atualizacao}
                onChange={handleChange}
                placeholder="Selecione uma data"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editandoId ? "Atualizar" : "Cadastrar"}
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
          <h2>Estoques</h2>
          {estoquesOrdenados.length === 0 ? (
            <p className="lista-vazia">Nenhum estoque cadastrado.</p>
          ) : (
            estoquesOrdenados.map((e) => {
              const ingrediente = ingredientes.find(
                (i) => i.id_ingrediente === e.id_ingrediente
              );
              const baixo =
                parseFloat(e.quantidade) <= parseFloat(e.limite_minimo);
              return (
                <div
                  key={e.id_estoque}
                  className={`item-card ${baixo ? "estoque-baixo" : ""}`}
                >
                  <div className="item-info">
                    <h3>ID: {e.id_estoque}</h3>
                    <p>Ingrediente: {ingrediente?.nome || e.id_ingrediente}</p>
                    <p>
                      Quantidade: {Number(e.quantidade).toFixed(2)}{" "}
                      {ingrediente?.unidade_medida}
                    </p>
                    <p>
                      Limite mínimo: {Number(e.limite_minimo).toFixed(2)}{" "}
                      {ingrediente?.unidade_medida}
                    </p>
                    <p>Data atualização: {formatarData(e.data_atualizacao)}</p>
                  </div>
                  <div className="item-acoes">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEditar(e)}
                      title="Editar"
                    >
                      <FaEdit color="#10B981" />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeletar(e.id_estoque)}
                      title="Deletar"
                    >
                      <FaTrash color="#EF4444" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EstoquesPage;
