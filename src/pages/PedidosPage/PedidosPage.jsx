// Funcionalidade: Atualização do status do pedido manualmente pelo usuário

// Dentro da função handleSubmit (parte responsável por enviar o pedido atualizado):
const handleSubmit = async (e) => {
  e.preventDefault();

  const dataToSend = { ...formData };

  try {
    const method = editandoId ? "PUT" : "POST";
    const url = editandoId
      ? `${API_URL}/pedido/${editandoId}`
      : `${API_URL}/pedido`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (res.ok) {
      setMensagem(editandoId ? "Pedido atualizado com sucesso!" : "Pedido cadastrado com sucesso!");
      setMensagemTipo("sucesso");
      fetchPedidos(); // Atualiza automaticamente a lista após a mudança de status
    } else {
      setMensagem("Erro ao atualizar pedido!");
      setMensagemTipo("erro");
    }
  } catch (err) {
    setMensagem(`Erro: ${err.message}`);
    setMensagemTipo("erro");
  }
};

// No formulário, quando o usuário está editando um pedido:
{editandoId && (
  <>
    <label>Status</label>
    <select
      name="status"
      value={formData.status}
      onChange={handleChange}
    >
      <option value="em_preparo">Em preparo</option>
      <option value="pronto">Pronto</option>
      <option value="cancelado">Cancelado</option>
    </select>
  </>
)}

