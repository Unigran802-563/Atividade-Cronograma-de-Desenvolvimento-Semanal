import React, { useState, useEffect } from "react";
import "./PratoIngredientes.css";
// 1. IMPORTAR OS ÍCONES CORRETOS (FaEdit, FaTrash)
import { FaEdit, FaTrash } from "react-icons/fa";

const PratoIngredientes = () => {
  // ... (toda a lógica do componente permanece a mesma)
  const [pratoIngrediente, setPratoIngrediente] = useState([]);
  const [pratos, setPratos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [ingredientesSelecionados, setIngredientesSelecionados] = useState([]);
  const [formData, setFormData] = useState({
    id_prato: "",
    id_ingrediente_temp: "",
    quantidade_temp: "",
  });
  const [editando, setEditando] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    fetchPratoIngrediente();
    fetchPratos();
    fetchIngredientes();
  }, []);

  const fetchPratoIngrediente = async () => {
    try {
      const res = await fetch(`${API_URL}/pratos_ingredientes`);
      const data = await res.json();
      setPratoIngrediente(data);
    } catch (err) {
      setMensagem(`Erro ao buscar dados: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const fetchPratos = async () => {
    try {
      const res = await fetch(`${API_URL}/pratos`);
      setPratos(await res.json());
    } catch (err) {
      console.error("Erro ao buscar pratos:", err);
    }
  };

  const fetchIngredientes = async () => {
    try {
      const res = await fetch(`${API_URL}/ingredientes`);
      setIngredientes(await res.json());
    } catch (err) {
      console.error("Erro ao buscar ingredientes:", err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAdicionarIngrediente = () => {
    const { id_ingrediente_temp, quantidade_temp } = formData;

    if (!id_ingrediente_temp || !quantidade_temp) {
      setMensagem("Selecione o ingrediente e informe a quantidade!");
      setMensagemTipo("erro");
      return;
    }

    const quantidadeNum = parseFloat(quantidade_temp.replace(",", "."));
    if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
      setMensagem("Informe uma quantidade válida maior que zero!");
      setMensagemTipo("erro");
      return;
    }

    const ingredienteJaExiste = ingredientesSelecionados.some(
      (i) => i.id_ingrediente === id_ingrediente_temp
    );

    if (ingredienteJaExiste) {
      setMensagem("Esse ingrediente já foi adicionado!");
      setMensagemTipo("erro");
      return;
    }

    const ingrediente = ingredientes.find(
      (i) => i.id_ingrediente === id_ingrediente_temp
    );

    setIngredientesSelecionados([
      ...ingredientesSelecionados,
      {
        id_ingrediente: id_ingrediente_temp,
        nome: ingrediente ? ingrediente.nome : id_ingrediente_temp,
        medida: ingrediente?.unidade_medida || "-",
        quantidade_utilizada: quantidadeNum,
      },
    ]);

    setFormData({ ...formData, id_ingrediente_temp: "", quantidade_temp: "" });
    setMensagem("");
  };

  const handleRemoverIngrediente = (id_ingrediente) => {
    setIngredientesSelecionados(
      ingredientesSelecionados.filter(
        (i) => i.id_ingrediente !== id_ingrediente
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_prato) {
      setMensagem("Selecione o prato!");
      setMensagemTipo("erro");
      return;
    }

    if (ingredientesSelecionados.length === 0) {
      setMensagem("Adicione ao menos um ingrediente!");
      setMensagemTipo("erro");
      return;
    }

    try {
      for (const ingrediente of ingredientesSelecionados) {
        await fetch(`${API_URL}/prato_ingrediente`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_prato: formData.id_prato,
            id_ingrediente: ingrediente.id_ingrediente,
            quantidade_utilizada: ingrediente.quantidade_utilizada,
          }),
        });
      }

      setMensagem("Ingredientes do prato cadastrados com sucesso!");
      setMensagemTipo("sucesso");
      setFormData({
        id_prato: "",
        id_ingrediente_temp: "",
        quantidade_temp: "",
      });
      setIngredientesSelecionados([]);
      fetchPratoIngrediente();
    } catch (err) {
      setMensagem(`Erro ao cadastrar: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const handleEditar = (pi) => {
    setEditando(pi);
    setFormData({
      id_prato: pi.id_prato,
      id_ingrediente_temp: pi.id_ingrediente,
      quantidade_temp: pi.quantidade_utilizada.toString().replace(".", ","),
    });
    window.scrollTo(0, 0);
  };

  const handleAtualizar = async () => {
    if (!editando) return;

    const quantidadeNum = parseFloat(
      formData.quantidade_temp.replace(",", ".")
    );
    if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
      setMensagem("Informe uma quantidade válida maior que zero!");
      setMensagemTipo("erro");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/prato_ingrediente/${editando.id_prato}/${editando.id_ingrediente}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...editando,
            quantidade_utilizada: quantidadeNum,
          }),
        }
      );

      if (res.ok) {
        setMensagem("Quantidade atualizada com sucesso!");
        setMensagemTipo("sucesso");
        setEditando(null);
        setFormData({
          id_prato: "",
          id_ingrediente_temp: "",
          quantidade_temp: "",
        });
        fetchPratoIngrediente();
      } else {
        setMensagem("Erro ao atualizar ingrediente!");
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro ao atualizar: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const handleDeletar = async (id_prato, id_ingrediente) => {
    if (!window.confirm("Deseja realmente deletar esta relação?")) return;
    try {
      const res = await fetch(
        `${API_URL}/prato_ingrediente/${id_prato}/${id_ingrediente}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setMensagem("Relação deletada com sucesso!");
        setMensagemTipo("sucesso");
        fetchPratoIngrediente();
      } else {
        const data = await res.json();
        setMensagem(`Erro ao deletar: ${data.error}`);
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro ao deletar: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const getNomePrato = (id) =>
    pratos.find((p) => p.id_prato === id)?.nome || id;
  const getNomeIngrediente = (id) =>
    ingredientes.find((i) => i.id_ingrediente === id)?.nome || id;
  const getMedidaIngrediente = (id) =>
    ingredientes.find((i) => i.id_ingrediente === id)?.unidade_medida || "-";

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Ingredientes por Prato</h1>
        <p>Associe ingredientes e suas quantidades a cada prato do cardápio.</p>
      </header>

      {mensagem && <div className={`message ${mensagemTipo}`}>{mensagem}</div>}

      <div className="main-container">
        <div className="form-card">
          {/* ... O formulário continua o mesmo ... */}
          <h2>
            {editando
              ? "Editar Ingrediente"
              : "Adicionar Ingredientes ao Prato"}
          </h2>
          <form onSubmit={handleSubmit} className="main-form">
            <div className="form-group">
              <label htmlFor="id_prato">Prato</label>
              <select
                id="id_prato"
                name="id_prato"
                value={formData.id_prato}
                onChange={handleChange}
                disabled={!!editando || ingredientesSelecionados.length > 0}
                required
              >
                <option value="">Selecione um prato</option>
                {pratos.map((p) => (
                  <option key={p.id_prato} value={p.id_prato}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="add-ingredient-section">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="id_ingrediente_temp">Ingrediente</label>
                  <select
                    id="id_ingrediente_temp"
                    name="id_ingrediente_temp"
                    value={formData.id_ingrediente_temp}
                    onChange={handleChange}
                    disabled={!!editando}
                  >
                    <option value="">Selecione</option>
                    {ingredientes.map((i) => (
                      <option key={i.id_ingrediente} value={i.id_ingrediente}>
                        {i.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="quantidade_temp">
                    Quantidade (
                    {getMedidaIngrediente(formData.id_ingrediente_temp)})
                  </label>
                  <input
                    type="text"
                    id="quantidade_temp"
                    name="quantidade_temp"
                    value={formData.quantidade_temp}
                    onChange={handleChange}
                    placeholder="Ex: 200, 1.5"
                  />
                </div>
              </div>
              <div className="form-actions">
                {editando ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-update"
                      onClick={handleAtualizar}
                    >
                      Atualizar
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditando(null);
                        setFormData({
                          ...formData,
                          id_ingrediente_temp: "",
                          quantidade_temp: "",
                        });
                      }}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-add"
                    onClick={handleAdicionarIngrediente}
                  >
                    Adicionar à Lista
                  </button>
                )}
              </div>
            </div>
            {ingredientesSelecionados.length > 0 && (
              <div className="selected-items-list">
                <h3>Ingredientes a serem salvos</h3>
                {/* 1. APLICAR O NOVO CLASSNAME */}
                <table className="tabela-temporaria">
                  <thead>
                    <tr>
                      <th>Ingrediente</th>
                      <th>Quantidade</th>
                      <th className="acao-header">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredientesSelecionados.map((i) => (
                      <tr key={i.id_ingrediente}>
                        <td>{i.nome}</td>
                        <td>{`${i.quantidade_utilizada} ${i.medida}`}</td>
                        <td className="actions-cell">
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            title="Remover Ingrediente"
                            onClick={() =>
                              handleRemoverIngrediente(i.id_ingrediente)
                            }
                          >
                            <FaTrash color="#EF4444" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-success"
                disabled={ingredientesSelecionados.length === 0}
              >
                Salvar Ingredientes no Prato
              </button>
            </div>
          </form>
        </div>

        <div className="lista-card">
          <h2>Relações Cadastradas</h2>
          {pratoIngrediente.length === 0 ? (
            <p className="lista-vazia">Nenhuma relação cadastrada.</p>
          ) : (
            <div className="lista-grid">
              {pratoIngrediente.map((pi) => (
                <div
                  className="item-card"
                  key={`${pi.id_prato}-${pi.id_ingrediente}`}
                >
                  <div className="item-info">
                    <span className="item-categoria">
                      {getNomePrato(pi.id_prato)}
                    </span>
                    <h3>{getNomeIngrediente(pi.id_ingrediente)}</h3>
                    <div className="item-detalhes">
                      <span className="item-quantidade">
                        {`${pi.quantidade_utilizada
                          .toString()
                          .replace(".", ",")} ${getMedidaIngrediente(
                          pi.id_ingrediente
                        )}`}
                      </span>
                    </div>
                  </div>
                  {/* 2. USAR OS ÍCONES CORRETOS COM A PROP 'color' */}
                  <div className="item-acoes">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEditar(pi)}
                      title="Editar"
                    >
                      <FaEdit color="#10B981" />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() =>
                        handleDeletar(pi.id_prato, pi.id_ingrediente)
                      }
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

export default PratoIngredientes;
