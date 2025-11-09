import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./style.css";

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [enderecos, setEnderecos] = useState([]);
  const [formData, setFormData] = useState({
    id_cliente: "",
    nome: "",
    telefone: "",
    cpf: "",
    id_endereco: "",
  });
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = "http://localhost:3001";
  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
    fetchEnderecos();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await fetch(`${API_URL}/clientes`);
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      setMensagem(`Erro ao buscar clientes: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const fetchEnderecos = async () => {
    try {
      const res = await fetch(`${API_URL}/enderecos`);
      const data = await res.json();
      setEnderecos(data);
    } catch (err) {
      setMensagem(`Erro ao buscar endereços: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  useEffect(() => {
    if (mensagem) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const timer = setTimeout(() => setMensagem(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTelefoneChange = (e) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length > 6) {
      valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3");
    } else if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    }
    setFormData({ ...formData, telefone: valor });
  };

  const handleCPFChange = (e) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length > 9) {
      valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, "$1.$2.$3-$4");
    } else if (valor.length > 6) {
      valor = valor.replace(/^(\d{3})(\d{3})(\d{0,3})$/, "$1.$2.$3");
    } else if (valor.length > 3) {
      valor = valor.replace(/^(\d{3})(\d{0,3})$/, "$1.$2");
    }
    setFormData({ ...formData, cpf: valor });
  };

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, "").replace(/\s/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = soma % 11;
    let dig1 = resto < 2 ? 0 : 11 - resto;
    if (dig1 !== parseInt(cpf.charAt(9))) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = soma % 11;
    let dig2 = resto < 2 ? 0 : 11 - resto;
    return dig2 === parseInt(cpf.charAt(10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const camposObrigatorios = [
      "id_cliente",
      "nome",
      "telefone",
      "cpf",
      "id_endereco",
    ];
    for (const campo of camposObrigatorios) {
      if (!formData[campo]?.trim()) {
        setMensagem(`O campo "${campo}" é obrigatório!`);
        setMensagemTipo("erro");
        return;
      }
    }
    if (!validarCPF(formData.cpf)) {
      setMensagem("CPF inválido!");
      setMensagemTipo("erro");
      return;
    }
    const idDuplicado = clientes.some(
      (c) => c.id_cliente === formData.id_cliente && c.id_cliente !== editandoId
    );
    if (idDuplicado) {
      setMensagem("ID de cliente já cadastrado!");
      setMensagemTipo("erro");
      return;
    }
    const cpfDuplicado = clientes.some(
      (c) => c.cpf === formData.cpf && c.id_cliente !== editandoId
    );
    if (cpfDuplicado) {
      setMensagem("CPF já cadastrado!");
      setMensagemTipo("erro");
      return;
    }
    try {
      const method = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `${API_URL}/cliente/${editandoId}`
        : `${API_URL}/cliente`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMensagem(editandoId ? "Cliente atualizado!" : "Cliente cadastrado!");
        setMensagemTipo("sucesso");
        setFormData({
          id_cliente: "",
          nome: "",
          telefone: "",
          cpf: "",
          id_endereco: "",
        });
        setEditandoId(null);
        fetchClientes();
      } else {
        setMensagem(`Erro: ${data.error}`);
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const handleEditar = (cliente) => {
    setFormData({ ...cliente });
    setEditandoId(cliente.id_cliente);
    setMensagem("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelar = () => {
    setFormData({
      id_cliente: "",
      nome: "",
      telefone: "",
      cpf: "",
      id_endereco: "",
    });
    setEditandoId(null);
    setMensagem("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeletar = async (id) => {
    if (!window.confirm("Deseja realmente deletar este cliente?")) return;
    try {
      const res = await fetch(`${API_URL}/cliente/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMensagem("Cliente deletado!");
        setMensagemTipo("sucesso");
        fetchClientes();
      }
    } catch (err) {
      setMensagem(`Erro: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const getEnderecoNome = (id) => {
    const e = enderecos.find((end) => end.id_endereco === id);
    return e ? `${e.rua}, ${e.numero} - ${e.cidade}` : "Sem endereço";
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gerenciamento de Clientes</h1>
        <p>Cadastre e gerencie os clientes do sistema.</p>
      </header>

      {mensagem && <div className={`message ${mensagemTipo}`}>{mensagem}</div>}

      <div className="main-container">
        <div className="form-card">
          <h2>{editandoId ? "Editar Cliente" : "Novo Cliente"}</h2>
          <form onSubmit={handleSubmit} className="main-form">
            <div className="form-group">
              <label>ID Cliente</label>
              <input
                type="text"
                name="id_cliente"
                value={formData.id_cliente}
                onChange={handleChange}
                disabled={!!editandoId}
                placeholder="Ex: CLI-001"
                required
              />
            </div>
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: João da Silva"
                required
              />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleTelefoneChange}
                placeholder="Ex: (11) 98765-4321"
                required
              />
            </div>
            <div className="form-group">
              <label>CPF</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleCPFChange}
                placeholder="Ex: 123.456.789-00"
                required
              />
            </div>
            <div className="form-group">
              <label>Endereço</label>
              <select
                name="id_endereco"
                value={formData.id_endereco}
                onChange={handleChange}
                required={enderecos.length > 0}
              >
                <option value="">Selecione...</option>
                {enderecos.map((e) => (
                  <option key={e.id_endereco} value={e.id_endereco}>
                    {e.rua}, {e.numero} - {e.cidade}
                  </option>
                ))}
              </select>
              {enderecos.length === 0 && (
                <div className="sem-endereco">
                  <p>Nenhum endereço cadastrado. Cadastre um endereço primeiro!</p>
                  <button
                    type="button"
                    className="btn btn-success mt-2"
                    onClick={() => {
                      navigate("/enderecos");
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }, 100);
                    }}
                  >
                    Cadastrar Endereço
                  </button>
                </div>
              )}
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
          <h2>Clientes Cadastrados</h2>
          {clientes.length === 0 ? (
            <p className="lista-vazia">Nenhum cliente cadastrado.</p>
          ) : (
            <div className="lista-grid">
              {clientes.map((c) => (
                <div className="item-card" key={c.id_cliente}>
                  <div className="item-info">
                    <h3>ID: {c.id_cliente}</h3>
                    <p>Nome: {c.nome}</p>
                    <p>Telefone: {c.telefone}</p>
                    <p>CPF: {c.cpf}</p>
                    <p>Endereço: {getEnderecoNome(c.id_endereco)}</p>
                  </div>
                  <div className="item-acoes">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleEditar(c)}
                    >
                      <FaEdit color="#10B981" />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeletar(c.id_cliente)}
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

export default ClientesPage;
