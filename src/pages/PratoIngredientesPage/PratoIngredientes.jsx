import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./PratoIngredientes.css";

const PratoIngredientes = () => {
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchPratoIngrediente();
    fetchPratos();
    fetchIngredientes();
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
    setFormData({
      id_prato: "",
      id_ingrediente_temp: "",
      quantidade_temp: "",
    });
    setIngredientesSelecionados([]);
    setEditando(null);
  };

  const fetchPratoIngrediente = async () => {
    try {
      const res = await fetch(`${API_URL}/pratos_ingredientes`);
      const data = await res.json();
      setPratoIngrediente(data);
    } catch (err) {
      exibirMensagem(`Erro ao buscar dados: ${err.message}`);
    }
  };

  const fetchPratos = async () => {
    try {
      const res = await fetch(`${API_URL}/pratos`);
      setPratos(await res.json());
    } catch (err) {
      exibirMensagem("Erro ao buscar pratos!");
    }
  };

  const fetchIngredientes = async () => {
    try {
      const res = await fetch(`${API_URL}/ingredientes`);
      setIngredientes(await res.json());
    } catch (err) {
      exibirMensagem("Erro ao buscar ingredientes!");
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAdicionarIngrediente = () => {
    const { id_ingrediente_temp, quantidade_temp } = formData;
    if (!id_ingrediente_temp || !quantidade_temp) {
      exibirMensagem("Selecione o ingrediente e informe a quantidade!");
      return;
    }
    const quantidadeNum = parseFloat(quantidade_temp.replace(",", "."));
    if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
      exibirMensagem("Informe uma quantidade válida maior que zero!");
      return;
    }
    const ingredienteJaExiste = ingredientesSelecionados.some(
      (i) => i.id_ingrediente === id_ingrediente_temp
    );
    if (ingredienteJaExiste) {
      exibirMensagem("Esse ingrediente já foi adicionado!");
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
  };

  const handleRemoverIngrediente = (id_ingrediente) => {
    setIngredientesSelecionados(
      ingredientesSelecionados.filter((i) => i.id_ingrediente !== id_ingrediente)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_prato) {
      exibirMensagem("Selecione o prato!");
      return;
    }
    if (ingredientesSelecionados.length === 0) {
      exibirMensagem("Adicione ao menos um ingrediente!");
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
      exibirMensagem("Ingredientes do prato cadastrados com sucesso!", "sucesso");
      limparFormulario();
      fetchPratoIngrediente();
    } catch (err) {
      exibirMensagem(`Erro ao cadastrar: ${err.message}`);
    }
  };

  const handleEditar = (pi) => {
    setEditando(pi);
    setFormData({
      id_prato: pi.id_prato,
      id_ingrediente_temp: pi.id_ingrediente,
      quantidade_temp: pi.quantidade_utilizada.toString().replace(".", ","),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAtualizar = async () => {
    if (!editando) return;
    const quantidadeNum = parseFloat(formData.quantidade_temp.replace(",", "."));
    if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
      exibirMensagem("Informe uma quantidade válida maior que zero!");
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
        exibirMensagem("Quantidade atualizada com sucesso!", "sucesso");
        limparFormulario();
        fetchPratoIngrediente();
      } else exibirMensagem("Erro ao atualizar ingrediente!");
    } catch (err) {
      exibirMensagem(`Erro ao atualizar: ${err.message}`);
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
        exibirMensagem("Relação deletada com sucesso!", "sucesso");
        fetchPratoIngrediente();
      } else exibirMensagem("Erro ao deletar!");
    } catch (err) {
      exibirMensagem(`Erro ao deletar: ${err.message}`);
    }
  };

  const getNomePrato = (id) =>
    pratos.find((p) => p.id_prato === id)?.nome || id;
  const getNomeIngrediente = (id) =>
    ingredientes.find((i) => i.id_ingrediente === id)?.nome || id;
  const getMedidaIngrediente = (id) =>
    ingredientes.find((i) => i.id_ingrediente === id)?.unidade_medida || "-";

  const redirecionar = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Ingredientes por Prato</h1>
        <p>Associe ingredientes e suas quantidades a cada prato do cardápio.</p>
      </header>

      {mensagem && <div className={`message ${mensagemTipo}`}><p>{mensagem}</p></div>}

      <div className="main-container">
        <div className="form-card">
          <h2>{editando ? "Editar Ingrediente" : "Adicionar Ingredientes ao Prato"}</h2>
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
              {pratos.length === 0 && (
                <>
                  <p>Nenhum prato cadastrado. Cadastre um prato primeiro!</p>
                  <button type="button" className="btn btn-success" onClick={() => redirecionar("/pratos")}>
                    Cadastrar prato
                  </button>
                </>
              )}
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
                  {ingredientes.length === 0 && (
                    <>
                      <p>Nenhum ingrediente cadastrado. Cadastre um ingrediente primeiro!</p>
                      <button type="button" className="btn btn-success" onClick={() => redirecionar("/ingredientes")}>
                        Cadastrar ingrediente
                      </button>
                    </>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="quantidade_temp">
                    Quantidade ({getMedidaIngrediente(formData.id_ingrediente_temp)})
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
                    <button type="button" className="btn btn-success" onClick={handleAtualizar}>
                      Atualizar
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => limparFormulario()}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn btn-add" onClick={handleAdicionarIngrediente}>
                    Adicionar à Lista
                  </button>
                )}
              </div>
            </div>

            {ingredientesSelecionados.length > 0 && (
              <div className="selected-items-list">
                <h3>Ingredientes a serem salvos</h3>
                <table className="tabela-temporaria">
                  <thead>
                    <tr>
                      <th>Ingrediente</th>
                      <th>Quantidade</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredientesSelecionados.map((i) => (
                      <tr key={i.id_ingrediente}>
                        <td>{i.nome}</td>
                        <td>{`${i.quantidade_utilizada} ${i.medida}`}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            onClick={() => handleRemoverIngrediente(i.id_ingrediente)}
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
                <div className="item-card" key={`${pi.id_prato}-${pi.id_ingrediente}`}>
                  <div className="item-info">
                    <h3>Prato: {getNomePrato(pi.id_prato)}</h3>
                    <p>Ingrediente: {getNomeIngrediente(pi.id_ingrediente)}</p>
                    <p>
                      Quantidade:{" "}
                      {`${pi.quantidade_utilizada.toString().replace(".", ",")} ${getMedidaIngrediente(
                        pi.id_ingrediente
                      )}`}
                    </p>
                  </div>
                  <div className="item-acoes">
                    <button className="btn-icon btn-edit" onClick={() => handleEditar(pi)}>
                      <FaEdit color="#10B981" />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeletar(pi.id_prato, pi.id_ingrediente)}
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
