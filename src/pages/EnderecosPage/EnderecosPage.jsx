import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./style.css";

const EnderecosPage = () => {
  const [enderecos, setEnderecos] = useState([]);
  const [formData, setFormData] = useState({
    id_endereco: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  });
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    fetchEnderecos();
  }, []);

  useEffect(() => {
    if (mensagem) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const timer = setTimeout(() => setMensagem(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  const fetchEnderecos = async () => {
    try {
      const res = await fetch(`${API_URL}/enderecos`);
      const data = await res.json();
      setEnderecos(data);
    } catch (err) {
      setMensagem(`Erro ao buscar endereços: ${err.message}`);
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cep") {
      const cepFormatado = value
        .replace(/\D/g, "")
        .replace(/^(\d{5})(\d)/, "$1-$2")
        .slice(0, 9);
      setFormData({ ...formData, cep: cepFormatado });
      return;
    }

    if (name === "estado") {
      const estadoFormatado = value
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase()
        .slice(0, 2);
      setFormData({ ...formData, estado: estadoFormatado });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const camposObrigatorios = [
      "id_endereco",
      "rua",
      "numero",
      "bairro",
      "cidade",
      "estado",
      "cep",
    ];

    for (const campo of camposObrigatorios) {
      if (!formData[campo]?.trim()) {
        setMensagem(`O campo "${campo}" é obrigatório!`);
        setMensagemTipo("erro");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    if (!/^\d{5}-\d{3}$/.test(formData.cep)) {
      setMensagem("CEP inválido! Use o formato 99999-999.");
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (formData.estado.length !== 2) {
      setMensagem("O campo Estado (UF) deve ter exatamente 2 letras.");
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const idDuplicado = enderecos.some(
      (e) =>
        e.id_endereco === formData.id_endereco && e.id_endereco !== editandoId
    );

    if (idDuplicado) {
      setMensagem("ID de endereço já cadastrado!");
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const method = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `${API_URL}/endereco/${editandoId}`
        : `${API_URL}/endereco`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMensagem(
          editandoId
            ? "Endereço atualizado com sucesso!"
            : "Endereço cadastrado com sucesso!"
        );
        setMensagemTipo("sucesso");
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchEnderecos();
        setFormData({
          id_endereco: "",
          rua: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
        });
        setEditandoId(null);
      } else {
        setMensagem(`Erro: ${data.error}`);
        setMensagemTipo("erro");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setMensagem(`Erro: ${err.message}`);
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEditar = (endereco) => {
    setFormData({ ...endereco });
    setEditandoId(endereco.id_endereco);
    setMensagem("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelar = () => {
    setFormData({
      id_endereco: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
    });
    setEditandoId(null);
    setMensagem("");
  };

  const handleDeletar = async (id) => {
    if (!window.confirm("Deseja realmente deletar este endereço?")) return;

    try {
      const res = await fetch(`${API_URL}/endereco/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMensagem("Endereço deletado com sucesso!");
        setMensagemTipo("sucesso");
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchEnderecos();
      }
    } catch (err) {
      setMensagem(`Erro: ${err.message}`);
      setMensagemTipo("erro");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gerenciamento de Endereços</h1>
        <p>Cadastre e gerencie os endereços do sistema.</p>
      </header>

      {mensagem && <div className={`message ${mensagemTipo}`}>{mensagem}</div>}

      <div className="main-container">
        <div className="form-card">
          <h2>{editandoId ? "Editar Endereço" : "Novo Endereço"}</h2>
          <form onSubmit={handleSubmit} className="main-form">
            <div className="form-group">
              <label>ID Endereço</label>
              <input
                type="text"
                name="id_endereco"
                value={formData.id_endereco}
                onChange={handleChange}
                placeholder="Ex: END-001"
                required
                disabled={!!editandoId}
              />
            </div>

            <div className="form-group">
              <label>Rua</label>
              <input
                type="text"
                name="rua"
                value={formData.rua}
                onChange={handleChange}
                placeholder="Ex: Rua das Flores"
                required
              />
            </div>

            <div className="form-group">
              <label>Número</label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="Ex: 123A"
                required
              />
            </div>

            <div className="form-group">
              <label>Bairro</label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                placeholder="Ex: Centro"
                required
              />
            </div>

            <div className="form-group">
              <label>Cidade</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Ex: São Paulo"
                required
              />
            </div>

            <div className="form-group">
              <label>Estado (UF)</label>
              <input
                type="text"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                placeholder="Ex: SP"
                maxLength={2}
                required
              />
            </div>

            <div className="form-group">
              <label>CEP</label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                placeholder="Ex: 12345-678"
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
                  onClick={handleCancelar}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lista-card">
          <h2>Endereços Cadastrados</h2>
          {enderecos.length === 0 ? (
            <p className="lista-vazia">Nenhum endereço cadastrado.</p>
          ) : (
            <div className="lista-grid">
              {enderecos.map((e) => (
                <div className="item-card" key={e.id_endereco}>
                  <div className="item-info">
                    <h3>ID: {e.id_endereco}</h3>
                    <p>Rua: {e.rua}</p>
                    <p>Número: {e.numero}</p>
                    <p>Bairro: {e.bairro}</p>
                    <p>Cidade: {e.cidade}</p>
                    <p>Estado: {e.estado}</p>
                    <p>CEP: {e.cep}</p>
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
                      onClick={() => handleDeletar(e.id_endereco)}
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

export default EnderecosPage;
