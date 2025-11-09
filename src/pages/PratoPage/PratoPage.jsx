import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./PratoPage.css";

function PratoPage() {
  const [pratos, setPratos] = useState([]);
  const [formData, setFormData] = useState({
    id_prato: "",
    nome: "",
    descricao: "",
    preco: "",
    categoria: "",
  });
  const [editando, setEditando] = useState(false);
  const [pratoEditId, setPratoEditId] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");

  useEffect(() => {
    carregarPratos();
  }, []);

  const carregarPratos = async () => {
    try {
      const response = await fetch("http://localhost:3001/pratos");
      const data = await response.json();
      setPratos(data);
    } catch (error) {
      console.error("Erro ao carregar pratos:", error);
      exibirMensagem("Erro ao carregar pratos!");
    }
  };

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (name === "preco") {
      newValue = newValue.replace(",", ".");
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : newValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const camposObrigatorios = ["id_prato", "nome", "categoria", "preco"];
    for (const campo of camposObrigatorios) {
      if (!formData[campo]?.trim()) {
        exibirMensagem(`O campo "${campo}" é obrigatório!`);
        return;
      }
    }

    const precoNum = parseFloat(formData.preco);
    if (isNaN(precoNum) || precoNum < 0) {
      exibirMensagem("Informe um preço válido maior ou igual a zero!");
      return;
    }

    if (!editando && pratos.some((p) => p.id_prato === formData.id_prato)) {
      exibirMensagem("ID do prato já cadastrado!");
      return;
    }

    const pratoData = {
      id_prato: formData.id_prato,
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim(),
      categoria: formData.categoria,
      preco_centavos: Math.round(precoNum * 100),
    };

    try {
      const url = editando
        ? `http://localhost:3001/pratos/${pratoEditId}`
        : "http://localhost:3001/pratos";
      const method = editando ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pratoData),
      });

      if (response.ok) {
        exibirMensagem(
          editando
            ? "Prato atualizado com sucesso!"
            : "Prato cadastrado com sucesso!",
          "sucesso"
        );
        limparFormulario();
        carregarPratos();
      } else {
        const errorData = await response.json();
        console.error("Erro:", errorData);
        exibirMensagem("Erro ao salvar prato!");
      }
    } catch (error) {
      console.error("Erro ao salvar prato:", error);
      exibirMensagem("Erro ao salvar prato!");
    }
  };

  const handleEditar = (prato) => {
    setFormData({
      id_prato: prato.id_prato,
      nome: prato.nome,
      descricao: prato.descricao || "",
      preco: (prato.preco_centavos / 100).toString().replace(".", ","),
      categoria: prato.categoria,
    });
    setEditando(true);
    setPratoEditId(prato.id_prato);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletar = async (prato) => {
    if (
      window.confirm(`Tem certeza que deseja deletar o prato "${prato.nome}"?`)
    ) {
      try {
        const response = await fetch(
          `http://localhost:3001/pratos/${prato.id_prato}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          exibirMensagem("Prato deletado com sucesso!", "sucesso");
          carregarPratos();
        } else {
          exibirMensagem("Erro ao deletar prato!");
        }
      } catch (error) {
        console.error("Erro ao deletar:", error);
        exibirMensagem("Erro ao deletar prato!");
      }
    }
  };

  const limparFormulario = () => {
    setFormData({
      id_prato: "",
      nome: "",
      descricao: "",
      preco: "",
      categoria: "",
    });
    setEditando(false);
    setPratoEditId(null);
  };

  const formatarCategoria = (categoria) => {
    const categorias = {
      entrada: "Entrada",
      prato_principal: "Prato Principal",
      sobremesa: "Sobremesa",
    };
    return categorias[categoria] || categoria;
  };

  return (
    <div className="prato-page">
      <div className="page-header">
        <h1>Gerenciamento de Pratos</h1>
        <p>Cadastre e gerencie os pratos do restaurante</p>
      </div>

      {mensagem && (
        <div className={`message ${mensagemTipo}`}>
          <p>{mensagem}</p>
        </div>
      )}

      <div className="prato-container">
        <div className="prato-form-card">
          <h2>{editando ? "Editar Prato" : "Cadastrar Novo Prato"}</h2>
          <form onSubmit={handleSubmit} className="prato-form">
            <div className="form-group">
              <label htmlFor="id_prato">ID do Prato</label>
              <input
                type="text"
                id="id_prato"
                name="id_prato"
                value={formData.id_prato}
                onChange={handleChange}
                placeholder="Ex: PR001"
                disabled={editando}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nome">Nome do Prato</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Feijoada Completa"
              />
            </div>

            <div className="form-group">
              <label htmlFor="descricao">Descrição (Opicional)</label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descreva o prato..."
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preco">Preço (R$)</label>
                <input
                  type="text"
                  id="preco"
                  name="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  placeholder="0,00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoria</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  <option value="entrada">Entrada</option>
                  <option value="prato_principal">Prato Principal</option>
                  <option value="sobremesa">Sobremesa</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editando ? "Atualizar" : "Cadastrar"}
              </button>
              {editando && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={limparFormulario}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="prato-lista-card">
          <h2>Pratos Cadastrados ({pratos.length})</h2>
          <div className="prato-lista">
            {pratos.length === 0 ? (
              <p className="lista-vazia">Nenhum prato cadastrado ainda.</p>
            ) : (
              pratos.map((prato) => (
                <div key={prato.id_prato} className="prato-item">
                  <div className="item-info">
                    <h3>Prato: {prato.nome}</h3>
                    <p>ID: {prato.id_prato}</p>
                    <p>Descrição: {prato.descricao || "Sem descrição"}</p>
                    <p>
                      Preço: R${" "}
                      {(prato.preco_centavos / 100)
                        .toFixed(2)
                        .replace(".", ",")}
                    </p>
                    <p>Categoria: {formatarCategoria(prato.categoria)}</p>
                  </div>
                  <div className="prato-acoes">
                    <button
                      className="btn-editar"
                      onClick={() => handleEditar(prato)}
                      title="Editar"
                    >
                      <FaEdit color="#10B981" />
                    </button>
                    <button
                      className="btn-deletar"
                      onClick={() => handleDeletar(prato)}
                      title="Deletar"
                    >
                      <FaTrash color="#EF4444" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PratoPage;
