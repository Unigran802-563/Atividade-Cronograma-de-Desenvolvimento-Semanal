import React, { useState } from "react";

const PagamentosPage = () => {
  const [formData, setFormData] = useState({
    id_pagamento: "",
    id_pedido: "",
    metodo_pagamento: "PIX",
    valor_centavos: 0,
    status: "pendente",
    bandeira: "",
    ultimos4: "",
    parcelas: 1,
    autorizacao: "",
    chave_pix: "",
    txid: "",
    troco: 0,
  });
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = "http://localhost:3001";

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["valor_centavos", "parcelas", "troco"].includes(name) && parseInt(value) < 0) return;

    if (name === "metodo_pagamento") {
      setFormData((prev) => ({
        ...prev,
        metodo_pagamento: value,
        bandeira: "",
        ultimos4: "",
        parcelas: 1,
        autorizacao: "",
        chave_pix: "",
        txid: "",
        troco: 0,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_pagamento || !formData.id_pedido) return;

    try {
      const method = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `${API_URL}/pagamento/${editandoId}`
        : `${API_URL}/pagamento`;

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pagamento: formData.id_pagamento,
          id_pedido: formData.id_pedido,
          metodo_pagamento: formData.metodo_pagamento,
          valor_centavos: parseInt(formData.valor_centavos),
          status: formData.status,
        }),
      });

      switch (formData.metodo_pagamento) {
        case "CARTAO":
          await fetch(`${API_URL}/pagamento_cartao`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_pagamento: formData.id_pagamento,
              bandeira: formData.bandeira,
              ultimos4: formData.ultimos4,
              parcelas: parseInt(formData.parcelas),
              autorizacao: formData.autorizacao,
            }),
          });
          break;
        case "PIX":
          await fetch(`${API_URL}/pagamento_pix`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_pagamento: formData.id_pagamento,
              chave_pix: formData.chave_pix,
              txid: formData.txid,
            }),
          });
          break;
        case "DINHEIRO":
          await fetch(`${API_URL}/pagamento_dinheiro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_pagamento: formData.id_pagamento,
              troco: parseInt(formData.troco),
            }),
          });
          break;
      }

      setFormData({
        id_pagamento: "",
        id_pedido: "",
        metodo_pagamento: "PIX",
        valor_centavos: 0,
        status: "pendente",
        bandeira: "",
        ultimos4: "",
        parcelas: 1,
        autorizacao: "",
        chave_pix: "",
        txid: "",
        troco: 0,
      });
      setEditandoId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditar = (pagamento) => {
    setFormData({
      id_pagamento: pagamento.id_pagamento,
      id_pedido: pagamento.id_pedido,
      metodo_pagamento: pagamento.metodo_pagamento,
      valor_centavos: pagamento.valor_centavos,
      status: pagamento.status,
      bandeira: "",
      ultimos4: "",
      parcelas: 1,
      autorizacao: "",
      chave_pix: "",
      txid: "",
      troco: 0,
    });
    setEditandoId(pagamento.id_pagamento);
  };

  const handleCancelar = () => {
    setFormData({
      id_pagamento: "",
      id_pedido: "",
      metodo_pagamento: "PIX",
      valor_centavos: 0,
      status: "pendente",
      bandeira: "",
      ultimos4: "",
      parcelas: 1,
      autorizacao: "",
      chave_pix: "",
      txid: "",
      troco: 0,
    });
    setEditandoId(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="id_pagamento" value={formData.id_pagamento} onChange={handleChange} disabled={editandoId} required />
      <input type="text" name="id_pedido" value={formData.id_pedido} onChange={handleChange} required />
      <select name="metodo_pagamento" value={formData.metodo_pagamento} onChange={handleChange}>
        <option value="PIX">PIX</option>
        <option value="CARTAO">Cartão</option>
        <option value="DINHEIRO">Dinheiro</option>
      </select>
      <input type="number" name="valor_centavos" value={formData.valor_centavos} onChange={handleChange} min={0} required />
      <select name="status" value={formData.status} onChange={handleChange}>
        <option value="pendente">Pendente</option>
        <option value="pago">Pago</option>
        <option value="recusado">Recusado</option>
      </select>

      {formData.metodo_pagamento === "CARTAO" && (
        <>
          <input type="text" name="bandeira" value={formData.bandeira} onChange={handleChange} placeholder="Bandeira" />
          <input type="text" name="ultimos4" value={formData.ultimos4} onChange={handleChange} placeholder="Últimos 4 dígitos" />
          <input type="number" name="parcelas" value={formData.parcelas} onChange={handleChange} min={1} />
          <input type="text" name="autorizacao" value={formData.autorizacao} onChange={handleChange} placeholder="Autorização" />
        </>
      )}

      {formData.metodo_pagamento === "PIX" && (
        <>
          <input type="text" name="chave_pix" value={formData.chave_pix} onChange={handleChange} placeholder="Chave PIX" />
          <input type="text" name="txid" value={formData.txid} onChange={handleChange} placeholder="TXID" />
        </>
      )}

      {formData.metodo_pagamento === "DINHEIRO" && (
        <input type="number" name="troco" value={formData.troco} onChange={handleChange} min={0} />
      )}

      <button type="submit">{editandoId ? "Atualizar" : "Cadastrar"}</button>
      {editandoId && <button type="button" onClick={handleCancelar}>Cancelar</button>}
    </form>
  );
};

export default PagamentosPage;