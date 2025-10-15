import React, { useState, useEffect } from "react";
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
  const [mensagemTipo, setMensagemTipo] = useState(""); // 'sucesso' ou 'erro'
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = "http://localhost:3001";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTelefoneChange = (e) => {
    let valor = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
    if (valor.length > 11) valor = valor.slice(0, 11); // Limita a 11 dígitos
    // Formata como (99) 99999-9999 ou (99) 9999-9999
    if (valor.length > 6) {
      valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3");
    } else if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    }
    setFormData({ ...formData, telefone: valor });
  };

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let dig1 = (soma * 10) % 11;
    dig1 = dig1 === 10 ? 0 : dig1;
    if (dig1 !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    let dig2 = (soma * 10) % 11;
    dig2 = dig2 === 10 ? 0 : dig2;
    if (dig2 !== parseInt(cpf.charAt(10))) return false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Todos os campos obrigatórios
    const camposObrigatorios = ["id_cliente", "nome", "telefone", "cpf", "id_endereco"];
    for (const campo of camposObrigatorios) {
      if (!formData[campo]) {
        setMensagem(`O campo ${campo} é obrigatório!`);
        setMensagemTipo("erro");
        return;
      }
    }

    if (!validarCPF(formData.cpf)) {
      setMensagem("CPF inválido!");
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
    setFormData({
      id_cliente: cliente.id_cliente,
      nome: cliente.nome,
      telefone: cliente.telefone,
      cpf: cliente.cpf,
      id_endereco: cliente.id_endereco,
    });
    setEditandoId(cliente.id_cliente);
    setMensagem("");
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
  };

  const handleDeletar = async (id) => {
    if (!window.confirm("Deseja realmente deletar este cliente?")) return;
    try {
      const res = await fetch(`${API_URL}/cliente/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMensagem("Cliente deletado!");
        setMensagemTipo("sucesso");
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

  return (
    <div className="container">
      <h2>Cadastro de Cliente</h2>

      <form onSubmit={handleSubmit} className="form-cadastro">
        <label>ID Cliente</label>
        <input
          type="text"
          name="id_cliente"
          placeholder="ID Cliente"
          value={formData.id_cliente}
          onChange={handleChange}
          required
          disabled={editandoId}
        />

        <label>Nome</label>
        <input
          type="text"
          name="nome"
          placeholder="Nome"
          value={formData.nome}
          onChange={handleChange}
          required
        />

        <label>Telefone</label>
        <input
          type="text"
          name="telefone"
          placeholder="Telefone"
          value={formData.telefone}
          onChange={handleTelefoneChange}
          required
        />

        <label>CPF</label>
        <input
          type="text"
          name="cpf"
          placeholder="CPF"
          value={formData.cpf}
          onChange={handleChange}
          required
        />

        <label>ID Endereço</label>
        <select
          name="id_endereco"
          value={formData.id_endereco}
          onChange={handleChange}
          required
        >
          <option value="">Selecione...</option>
          {enderecos.map((e) => (
            <option key={e.id_endereco} value={e.id_endereco}>
              {e.rua}, {e.numero} - {e.cidade}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            className={editandoId ? "atualizar" : "cadastrar"}
          >
            {editandoId ? "Atualizar" : "Cadastrar"}
          </button>
          {editandoId && (
            <button type="button" className="cancelar" onClick={handleCancelar}>
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

      <h3>Lista de Clientes</h3>
      {clientes.length === 0 ? (
        <p className="sem-registro">Nenhum cliente cadastrado ainda.</p>
      ) : (
        <table className="tabela-cadastro">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Telefone</th>
              <th>CPF</th>
              <th>Endereço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id_cliente}>
                <td>{c.id_cliente}</td>
                <td>{c.nome}</td>
                <td>{c.telefone}</td>
                <td>{c.cpf}</td>
                <td>{c.id_endereco}</td>
                <td>
                  <div className="button-group">
                    <button className="editar" onClick={() => handleEditar(c)}>
                      Editar
                    </button>
                    <button
                      className="deletar"
                      onClick={() => handleDeletar(c.id_cliente)}
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

export default ClientesPage;
