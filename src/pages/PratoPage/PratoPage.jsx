import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaCheck, FaPlus } from "react-icons/fa";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import "./PratoPage.css";

function PratoPage() {
  const [pratos, setPratos] = useState([]);
  const [formData, setFormData] = useState({
    id_prato: "",
    nome: "",
    descricao: "",
    preco: "",
    categoria: "",
    disponivel: true,
  });
  const [editando, setEditando] = useState(false);
  const [pratoEditId, setPratoEditId] = useState(null);

  useEffect(() => {
    carregarPratos();
  }, []);

  const carregarPratos = async () => {
    try {
      const response = await fetch("http://localhost:3001/pratos");
      const data = await response.json();
      console.log("Pratos carregados:", data); // Debug
      setPratos(data);
    } catch (error) {
      console.error("Erro ao carregar pratos:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.id_prato ||
      !formData.nome ||
      !formData.categoria ||
      formData.preco === ""
    ) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    if (parseFloat(formData.preco) < 0) {
      alert("O preço não pode ser negativo!");
      return;
    }

    if (!editando && pratos.some((p) => p.id_prato === formData.id_prato)) {
      alert("ID do prato já cadastrado!");
      return;
    }

    const pratoData = {
      id_prato: formData.id_prato,
      ...formData,
      preco: Math.round(parseFloat(formData.preco) * 100),
    };

    try {
      if (editando) {
        const response = await fetch(
          `http://localhost:3001/pratos/${pratoEditId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pratoData),
          }
        );

        if (response.ok) {
          alert("Prato atualizado com sucesso!");
        } else {
          const errorData = await response.json();
          console.error("Erro ao atualizar:", errorData);
          alert("Erro ao atualizar prato!");
        }
      } else {
        const response = await fetch("http://localhost:3001/pratos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pratoData),
        });

        if (response.ok) {
          alert("Prato cadastrado com sucesso!");
        } else {
          const errorData = await response.json();
          console.error("Erro ao cadastrar:", errorData);
          alert("Erro ao cadastrar prato!");
        }
      }

      limparFormulario();
      carregarPratos();
    } catch (error) {
      console.error("Erro ao salvar prato:", error);
      alert("Erro ao salvar prato!");
    }
  };

  const handleEditar = (prato) => {
    setFormData({
      id_prato: prato.id_prato,
      nome: prato.nome,
      descricao: prato.descricao || "",
      preco: (prato.preco / 100).toFixed(2),
      categoria: prato.categoria,
      disponivel: prato.disponivel !== undefined ? prato.disponivel : true,
    });
    setEditando(true);
    setPratoEditId(prato.id_prato);
  };

  const handleDeletar = async (prato) => {
    if (!prato || !prato.id_prato) {
      console.error(
        "Erro: ID do prato é nulo ou indefinido. Não é possível deletar."
      );
      return;
    }
    if (
      window.confirm(`Tem certeza que deseja deletar o prato "${prato.nome}"?`)
    ) {
      try {
        console.log("Deletando prato ID:", prato.id_prato); // Debug

        const response = await fetch(
          `http://localhost:3001/pratos/${prato.id_prato}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          alert("Prato deletado com sucesso!");
          carregarPratos();
        } else {
          const errorData = await response.json();
          console.error("Erro ao deletar:", errorData);
          alert("Erro ao deletar prato! Verifique o console.");
        }
      } catch (error) {
        console.error("Erro ao deletar prato:", error);
        alert("Erro ao deletar prato! Verifique o console.");
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
      disponivel: true,
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

      <div className="prato-container">
        <div className="prato-form-card">
          <h2>{editando ? "Editar Prato" : "Cadastrar Novo Prato"}</h2>
          <form onSubmit={handleSubmit} className="prato-form">
            <div className="form-group">
              <label htmlFor="id_prato">ID do Prato *</label>
              <input
                type="text"
                id="id_prato"
                name="id_prato"
                value={formData.id_prato}
                onChange={handleChange}
                placeholder="Ex: PR001"
                required
                disabled={editando}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nome">Nome do Prato *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Feijoada Completa"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="descricao">Descrição</label>
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
                <label htmlFor="preco">Preço (R$) *</label>
                <input
                  type="number"
                  id="preco"
                  name="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoria *</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="entrada">Entrada</option>
                  <option value="prato_principal">Prato Principal</option>
                  <option value="sobremesa">Sobremesa</option>
                </select>
              </div>
            </div>

            <div className="form-group checkbox-group"></div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editando ? (
                  <>
                    <FaCheck /> Atualizar
                  </>
                ) : (
                  <>
                    <FaPlus /> Cadastrar
                  </>
                )}
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
                <div
                  key={prato.id_prato || `prato-${prato.nome}`}
                  className="prato-item"
                >
                  <div className="prato-info">
                    <h3>{prato.nome}</h3>
                    <p className="prato-descricao">{prato.descricao}</p>
                    <div className="prato-detalhes">
                      <span className="prato-preco">
                        R$ {(prato.preco / 100).toFixed(2)}
                      </span>
                      <span className="prato-categoria">
                        {formatarCategoria(prato.categoria)}
                      </span>
                    </div>
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
