import React, { useState, useEffect } from "react";
import "./style.css";

const ItemPedidosPage = () => {
  const [itens, setItens] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [pratos, setPratos] = useState([]);
  const [formData, setFormData] = useState({
    id_item: "",
    id_pedido: "",
    id_prato: "",
    quantidade: "",
    subtotal: "",
  });
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [mensagemTipo, setMensagemTipo] = useState("");

  const API_URL = "http://localhost:3001";

  useEffect(() => {
    fetchItens();
    fetchPedidos();
    fetchPratos();
  }, []);

  const fetchItens = async () => {
    try {
      const res = await fetch(`${API_URL}/itempedidos`);
      const data = await res.json();
      setItens(data);
    } catch (err) {
      setMensagem(`Erro ao buscar itens: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const fetchPedidos = async () => {
    const res = await fetch(`${API_URL}/pedidos`);
    setPedidos(await res.json());
  };

  const fetchPratos = async () => {
    const res = await fetch(`${API_URL}/pratos`);
    setPratos(await res.json());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "subtotal") {
      let apenasNumeros = value.replace(/\D/g, "");
      let centavos = parseInt(apenasNumeros || "0", 10);
      let reais = (centavos / 100).toFixed(2).replace(".", ",");
      setFormData({ ...formData, subtotal: `R$ ${reais}` });
      return;
    }

    if (name === "quantidade") {
      if (parseInt(value) < 1) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { id_item, id_pedido, id_prato, quantidade, subtotal } = formData;

    if (!id_item || !id_pedido || !id_prato || !quantidade || !subtotal) {
      setMensagem("Todos os campos são obrigatórios!");
      setMensagemTipo("erro");
      return;
    }

    const quantidadeNum = parseInt(quantidade, 10);
    const subtotalCentavos = Math.round(
      parseFloat(subtotal.replace("R$ ", "").replace(",", ".")) * 100
    );

    if (isNaN(quantidadeNum) || quantidadeNum < 1) {
      setMensagem("Quantidade deve ser um número maior que 0!");
      setMensagemTipo("erro");
      return;
    }

    if (isNaN(subtotalCentavos) || subtotalCentavos < 1) {
      setMensagem("Subtotal deve ser maior que R$ 0,00!");
      setMensagemTipo("erro");
      return;
    }
    
    const idDuplicado = itens.some(
    (item) => item.id_item === id_item && item.id_item !== editandoId
  );
  if (idDuplicado) {
    setMensagem("ID do item já cadastrado!");
    setMensagemTipo("erro");
    return;
  }

    try {
      const method = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `${API_URL}/itempedido/${editandoId}`
        : `${API_URL}/itempedido`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_item,
          id_pedido,
          id_prato,
          quantidade: quantidadeNum,
          subtotal_centavos: subtotalCentavos,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensagem(editandoId ? "Item atualizado!" : "Item criado!");
        setMensagemTipo("sucesso");
        setFormData({
          id_item: "",
          id_pedido: "",
          id_prato: "",
          quantidade: "",
          subtotal: "",
        });
        setEditandoId(null);
        fetchItens();
      } else {
        setMensagem(`Erro: ${data.error}`);
        setMensagemTipo("erro");
      }
    } catch (err) {
      setMensagem(`Erro: ${err.message}`);
      setMensagemTipo("erro");
    }
  };

  const handleEditar = (item) => {
    setEditandoId(item.id_item);
    setFormData({
      id_item: item.id_item,
      id_pedido: item.id_pedido,
      id_prato: item.id_prato,
      quantidade: item.quantidade.toString(),
      subtotal: `R$ ${(item.subtotal_centavos / 100).toFixed(2).replace(".", ",")}`,
    });
    setMensagem("");
  };

  const handleDeletar = async (id) => {
    if (!window.confirm("Deseja realmente deletar este item?")) return;
    const res = await fetch(`${API_URL}/itempedido/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setMensagem("Item deletado com sucesso!");
      setMensagemTipo("sucesso");
      fetchItens();
    } else {
      setMensagem(`Erro: ${data.error}`);
      setMensagemTipo("erro");
    }
  };

  const getNomePedido = (id) => pedidos.find((p) => p.id_pedido === id)?.id_pedido || id;
  const getNomePrato = (id) => pratos.find((p) => p.id_prato === id)?.nome || id;

  return (
    <div className="container">
      <h2>Cadastro de Item do Pedido</h2>
      <form onSubmit={handleSubmit} className="form-cadastro">
        <label>ID do Item</label>
        <input
          type="text"
          name="id_item"
          value={formData.id_item}
          onChange={handleChange}
          required
          disabled={!!editandoId}
        />

        <label>Pedido</label>
        <select
          name="id_pedido"
          value={formData.id_pedido}
          onChange={handleChange}
          required
        >
          <option value="">Selecione o pedido...</option>
          {pedidos.map((p) => (
            <option key={p.id_pedido} value={p.id_pedido}>
              {p.id_pedido}
            </option>
          ))}
        </select>

        <label>Prato</label>
        <select
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

        <label>Quantidade</label>
        <input
          type="number"
          name="quantidade"
          min="1"
          value={formData.quantidade}
          onChange={handleChange}
          required
        />

        <label>Subtotal</label>
        <input
          type="text"
          name="subtotal"
          value={formData.subtotal}
          onChange={handleChange}
          placeholder="R$ 0,00"
          required
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" className={editandoId ? "atualizar" : "cadastrar"}>
            {editandoId ? "Atualizar" : "Cadastrar"}
          </button>
          {editandoId && (
            <button
              type="button"
              className="cancelar"
              onClick={() => {
                setEditandoId(null);
                setFormData({
                  id_item: "",
                  id_pedido: "",
                  id_prato: "",
                  quantidade: "",
                  subtotal: "",
                });
              }}
            >
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

      <h3>Itens Cadastrados</h3>
      {itens.length === 0 ? (
        <p className="sem-registro">Nenhum item cadastrado ainda.</p>
      ) : (
        <table className="tabela-cadastro">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pedido</th>
              <th>Prato</th>
              <th>Quantidade</th>
              <th>Subtotal</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id_item}>
                <td>{item.id_item}</td>
                <td>{getNomePedido(item.id_pedido)}</td>
                <td>{getNomePrato(item.id_prato)}</td>
                <td>{item.quantidade}</td>
                <td>
                  R$ {(item.subtotal_centavos / 100).toFixed(2).replace(".", ",")}
                </td>
                <td className="button-group">
                  <button className="editar" onClick={() => handleEditar(item)}>
                    Editar
                  </button>
                  <button className="deletar" onClick={() => handleDeletar(item.id_item)}>
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ItemPedidosPage;