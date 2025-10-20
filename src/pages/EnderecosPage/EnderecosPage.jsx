import React, { useState, useEffect } from "react";
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
  const [mensagemTipo, setMensagemTipo] = useState(""); // 'sucesso' ou 'erro'
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    fetchEnderecos();
  }, []);

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
    const { name, value } = e.target;

    // Máscaras e restrições específicas
    if (name === "cep") {
      // Mantém apenas números e formata como 99999-999
      const cepFormatado = value
        .replace(/\D/g, "")
        .replace(/^(\d{5})(\d)/, "$1-$2")
        .slice(0, 9);
      setFormData({ ...formData, cep: cepFormatado });
      return;
    }

    if (name === "estado") {
      // Permite apenas letras e limita a 2 caracteres em maiúsculo
      const estadoFormatado = value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
      setFormData({ ...formData, estado: estadoFormatado });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação de campos obrigatórios
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
        return;
      }
    }

    // Validação de formato do CEP
    if (!/^\d{5}-\d{3}$/.test(formData.cep)) {
      setMensagem("CEP inválido! Use o formato 99999-999.");
      setMensagemTipo("erro");
      return;
    }

    // Validação de UF
    if (formData.estado.length !== 2) {
      setMensagem("O campo Estado (UF) deve ter exatamente 2 letras.");
      setMensagemTipo("erro");
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
        setMensagem(editandoId ? "Endereço atualizado!" : "Endereço criado!");
        setMensagemTipo("sucesso");
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
        fetchEnderecos();
      } else {
        setMensagem(`Erro: ${data.error}`);
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const handleEditar = (endereco) => {
    setFormData({ ...endereco });
    setEditandoId(endereco.id_endereco);
    setMensagem("");
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
      const data = await res.json();
      if (res.ok) {
        setMensagem("Endereço deletado!");
        setMensagemTipo("sucesso");
        fetchEnderecos();
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
      <h2>Cadastro de Endereço</h2>

      <form onSubmit={handleSubmit} className="form-cadastro">
        <label>ID Endereço</label>
        <input
          type="text"
          name="id_endereco"
          placeholder="ID Endereço"
          value={formData.id_endereco}
          onChange={handleChange}
          required
          disabled={editandoId}
        />
        <label>Rua</label>
        <input
          type="text"
          name="rua"
          placeholder="Rua"
          value={formData.rua}
          onChange={handleChange}
          required
        />
        <label>Número</label>
        <input
          type="text"
          name="numero"
          placeholder="Número"
          value={formData.numero}
          onChange={handleChange}
          required
        />
        <label>Bairro</label>
        <input
          type="text"
          name="bairro"
          placeholder="Bairro"
          value={formData.bairro}
          onChange={handleChange}
          required
        />
        <label>Cidade</label>
        <input
          type="text"
          name="cidade"
          placeholder="Cidade"
          value={formData.cidade}
          onChange={handleChange}
          required
        />
        <label>Estado (UF)</label>
        <input
          type="text"
          name="estado"
          placeholder="Ex: SP"
          value={formData.estado}
          onChange={handleChange}
          maxLength={2}
          required
        />
        <label>CEP</label>
        <input
          type="text"
          name="cep"
          placeholder="99999-999"
          value={formData.cep}
          onChange={handleChange}
          required
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            className={editandoId ? "atualizar" : "cadastrar"}
          >
            {editandoId ? "Atualizar" : "Cadastrar"}
          </button>
          {editandoId && (
            <button type="button" onClick={handleCancelar} className="cancelar">
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

      <h3>Lista de Endereços</h3>
      {enderecos.length === 0 ? (
        <p className="sem-registro">Nenhum endereço cadastrado ainda.</p>
      ) : (
        <table className="tabela-cadastro">
          <thead>
            <tr>
              <th>ID</th>
              <th>Rua</th>
              <th>Número</th>
              <th>Bairro</th>
              <th>Cidade</th>
              <th>Estado</th>
              <th>CEP</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {enderecos.map((e) => (
              <tr key={e.id_endereco}>
                <td>{e.id_endereco}</td>
                <td>{e.rua}</td>
                <td>{e.numero}</td>
                <td>{e.bairro}</td>
                <td>{e.cidade}</td>
                <td>{e.estado}</td>
                <td>{e.cep}</td>
                <td>
                  <div className="button-group">
                    <button className="editar" onClick={() => handleEditar(e)}>
                      Editar
                    </button>
                    <button
                      className="deletar"
                      onClick={() => handleDeletar(e.id_endereco)}
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

export default EnderecosPage;