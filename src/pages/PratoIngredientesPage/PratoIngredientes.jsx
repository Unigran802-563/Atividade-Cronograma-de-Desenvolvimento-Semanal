import React, { useState, useEffect } from "react";
import "./style.css";

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
      setMensagem(`Erro: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const fetchPratos = async () => {
    const res = await fetch(`${API_URL}/pratos`);
    setPratos(await res.json());
  };

  const fetchIngredientes = async () => {
    const res = await fetch(`${API_URL}/ingredientes`);
    setIngredientes(await res.json());
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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

    const ingrediente = ingredientes.find((i) => i.id_ingrediente === id_ingrediente_temp);

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
      ingredientesSelecionados.filter((i) => i.id_ingrediente !== id_ingrediente)
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

      setMensagem("Ingredientes cadastrados com sucesso!");
      setMensagemTipo("sucesso");
      setFormData({
        id_prato: "",
        id_ingrediente_temp: "",
        quantidade_temp: "",
      });
      setIngredientesSelecionados([]);
      fetchPratoIngrediente();
    } catch (err) {
      setMensagem(`Erro: ${err.message}`);
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
  };

  const handleAtualizar = async () => {
    if (!editando) return;

    const quantidadeNum = parseFloat(formData.quantidade_temp.replace(",", "."));
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
          body: JSON.stringify({ ...editando, quantidade_utilizada: quantidadeNum }),
        }
      );

      if (res.ok) {
        setMensagem("Quantidade atualizada com sucesso!");
        setMensagemTipo("sucesso");
        setEditando(null);
        setFormData({ id_prato: "", id_ingrediente_temp: "", quantidade_temp: "" });
        fetchPratoIngrediente();
      } else {
        setMensagem("Erro ao atualizar ingrediente!");
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const handleDeletar = async (id_prato, id_ingrediente) => {
    if (!window.confirm("Deseja realmente deletar esta relação?")) return;
    const res = await fetch(
      `${API_URL}/prato_ingrediente/${id_prato}/${id_ingrediente}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    if (res.ok) {
      setMensagem("Relação deletada com sucesso!");
      setMensagemTipo("sucesso");
      fetchPratoIngrediente();
    } else {
      setMensagem(`Erro: ${data.error}`);
      setMensagemTipo("erro");
    }
  };

  const getNomePrato = (id) => pratos.find((p) => p.id_prato === id)?.nome || id;
  const getNomeIngrediente = (id) =>
    ingredientes.find((i) => i.id_ingrediente === id)?.nome || id;
  const getMedidaIngrediente = (id) =>
    ingredientes.find((i) => i.id_ingrediente === id)?.unidade_medida || "-";

  return (
    <div className="container">
      <h2>Definir Ingredientes do Prato</h2>

      <form onSubmit={handleSubmit} className="form-cadastro">
        <label htmlFor="id_prato">Selecione o prato:</label>
        <select
          id="id_prato"
          name="id_prato"
          value={formData.id_prato}
          onChange={handleChange}
          required
        >
          <option value="">Selecione o prato...</option>
          {pratos.map((p) => (
            <option key={p.id_prato} value={p.id_prato}>
              {p.nome}
            </option>
          ))}
        </select>

        <div className="ingrediente-adicao">
          <h4>{editando ? "Editar Ingrediente" : "Adicionar Ingrediente"}</h4>

          <label htmlFor="id_ingrediente_temp">Ingrediente:</label>
          <select
            id="id_ingrediente_temp"
            name="id_ingrediente_temp"
            value={formData.id_ingrediente_temp}
            onChange={handleChange}
            disabled={!!editando}
            required
          >
            <option value="">Selecione o ingrediente...</option>
            {ingredientes.map((i) => (
              <option key={i.id_ingrediente} value={i.id_ingrediente}>
                {i.nome}
              </option>
            ))}
          </select>

          {formData.id_ingrediente_temp && (
            <p className="medida-info">
              Medida: {getMedidaIngrediente(formData.id_ingrediente_temp)}
            </p>
          )}

          <label htmlFor="quantidade_temp">Quantidade:</label>
          <input
            type="text"
            id="quantidade_temp"
            name="quantidade_temp"
            value={formData.quantidade_temp}
            onChange={handleChange}
            placeholder="Ex: 200, 1.5, 0.5..."
            required
          />

          <div className="botoes-centrais">
            {editando ? (
              <>
                <button type="button" className="atualizar" onClick={handleAtualizar}>
                  Atualizar
                </button>
                <button
                  type="button"
                  className="cancelar"
                  onClick={() => {
                    setEditando(null);
                    setFormData({ id_prato: "", id_ingrediente_temp: "", quantidade_temp: "" });
                  }}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button type="button" className="adicionar" onClick={handleAdicionarIngrediente}>
                Adicionar Ingrediente
              </button>
            )}
          </div>
        </div>

        {ingredientesSelecionados.length > 0 && (
          <>
            <h4>Ingredientes Adicionados</h4>
            <table className="tabela-cadastro">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Medida</th>
                  <th>Quantidade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ingredientesSelecionados.map((i) => (
                  <tr key={i.id_ingrediente}>
                    <td>{i.nome}</td>
                    <td>{i.medida}</td>
                    <td>{i.quantidade_utilizada}</td>
                    <td className="button-group">
                      <button type="button" className="editar" onClick={() => handleEditar(i)}>
                        Editar
                      </button>
                      <button type="button" className="deletar" onClick={() => handleRemoverIngrediente(i.id_ingrediente)}>
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="botoes-centrais">
          <button type="submit" className="cadastrar">
            Cadastrar Ingredientes
          </button>
        </div>
      </form>

      {mensagem && <p className={`mensagem ${mensagemTipo === "erro" ? "erro" : ""}`}>{mensagem}</p>}

      <h3>Ingredientes Cadastrados nos Pratos</h3>
      {pratoIngrediente.length === 0 ? (
        <p className="sem-registro">Nenhuma relação cadastrada.</p>
      ) : (
        <table className="tabela-cadastro">
          <thead>
            <tr>
              <th>Prato</th>
              <th>Ingrediente</th>
              <th>Medida</th>
              <th>Quantidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pratoIngrediente.map((pi) => (
              <tr key={`${pi.id_prato}-${pi.id_ingrediente}`}>
                <td>{getNomePrato(pi.id_prato)}</td>
                <td>{getNomeIngrediente(pi.id_ingrediente)}</td>
                <td>{getMedidaIngrediente(pi.id_ingrediente)}</td>
                <td>{pi.quantidade_utilizada.toString().replace(".", ",")}</td>
                <td className="button-group">
                  <button className="editar" onClick={() => handleEditar(pi)}>Editar</button>
                  <button className="deletar" onClick={() => handleDeletar(pi.id_prato, pi.id_ingrediente)}>Deletar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PratoIngredientes;