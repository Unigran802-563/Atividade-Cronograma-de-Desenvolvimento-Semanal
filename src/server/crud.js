import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'; // ⚠️ Importante: Para integrar o front-end React com este back-end, é necessário que o CORS esteja habilitado.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); // Permite que o front-end acesse o back-end e caso precise o comando para baixar a dependência é: npm install cors
app.use(bodyParser.json());

const dbPath = path.join(__dirname, '../database/database.db');

// Função para abrir conexão com o banco
async function openDb() {
  return open({ filename: dbPath, driver: sqlite3.Database });
}

// -------------------- CRUD Endereco --------------------
// Criação
app.post('/endereco', async (req, res) => {
  const { id_endereco, rua, numero, bairro, cidade, estado, cep } = req.body;
  try {
    const db = await openDb();
    await db.run(
      `INSERT INTO Endereco (id_endereco, rua, numero, bairro, cidade, estado, cep)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_endereco, rua, numero, bairro, cidade, estado, cep]
    );
    res.json({ message: 'Endereço criado!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// Listagem
app.get('/enderecos', async (req, res) => {
  const db = await openDb();
  const enderecos = await db.all('SELECT * FROM Endereco');
  res.json(enderecos);
});
// Atualização
app.put('/endereco/:id', async (req, res) => {
  const { id } = req.params;
  const { rua, numero, bairro, cidade, estado, cep } = req.body;
  const db = await openDb();
  await db.run(
    `UPDATE Endereco SET rua=?, numero=?, bairro=?, cidade=?, estado=?, cep=? WHERE id_endereco=?`,
    [rua, numero, bairro, cidade, estado, cep, id]
  );
  res.json({ message: 'Endereço atualizado!' });
});
// Exclusão
app.delete('/endereco/:id', async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  await db.run('DELETE FROM Endereco WHERE id_endereco=?', [id]);
  res.json({ message: 'Endereço deletado!' });
});

// -------------------- CRUD Cliente --------------------
// Criação
app.post('/cliente', async (req, res) => {
  const { id_cliente, nome, telefone, cpf, id_endereco } = req.body;
  try {
    const db = await openDb();
    await db.run(
      `INSERT INTO Cliente (id_cliente, nome, telefone, cpf, id_endereco) VALUES (?, ?, ?, ?, ?)`,
      [id_cliente, nome, telefone, cpf, id_endereco]
    );
    res.json({ message: 'Cliente criado!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
// Listagem
app.get('/clientes', async (req, res) => {
  const db = await openDb();
  const clientes = await db.all('SELECT * FROM Cliente');
  res.json(clientes);
});
// Atualização
app.get('/cliente/:id', async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  const cliente = await db.get('SELECT * FROM Cliente WHERE id_cliente=?', [id]);
  res.json(cliente);
});
// Exclusão
app.put('/cliente/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, telefone, cpf, id_endereco } = req.body;
  const db = await openDb();
  await db.run(
    `UPDATE Cliente SET nome=?, telefone=?, cpf=?, id_endereco=? WHERE id_cliente=?`,
    [nome, telefone, cpf, id_endereco, id]
  );
  res.json({ message: 'Cliente atualizado!' });
});

app.delete('/cliente/:id', async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  await db.run('DELETE FROM Cliente WHERE id_cliente=?', [id]);
  res.json({ message: 'Cliente deletado!' });
});

// -------------------- CRUD Ingrediente --------------------
// Criação
app.post('/ingrediente', async (req, res) => {
  const { id_ingrediente, nome, unidade_medida } = req.body;
  const db = await openDb();
  await db.run(
    `INSERT INTO Ingrediente (id_ingrediente, nome, unidade_medida) VALUES (?, ?, ?)`,
    [id_ingrediente, nome, unidade_medida]
  );
  res.json({ message: 'Ingrediente criado!' });
});
// Listagem
app.get('/ingredientes', async (req, res) => {
  const db = await openDb();
  const ingredientes = await db.all('SELECT * FROM Ingrediente');
  res.json(ingredientes);
});
// Atualização
app.put('/ingrediente/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, unidade_medida } = req.body;
  const db = await openDb();
  await db.run(
    `UPDATE Ingrediente SET nome=?, unidade_medida=? WHERE id_ingrediente=?`,
    [nome, unidade_medida, id]
  );
  res.json({ message: 'Ingrediente atualizado!' });
});
// Exclusão
app.delete('/ingrediente/:id', async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  await db.run('DELETE FROM Ingrediente WHERE id_ingrediente=?', [id]);
  res.json({ message: 'Ingrediente deletado!' });
});

// -------------------- CRUD Estoque --------------------
// Criação
app.post('/estoque', async (req, res) => {
  const { id_estoque, id_ingrediente, quantidade, limite_minimo, data_atualizacao } = req.body;
  const db = await openDb();
  await db.run(
    `INSERT INTO Estoque (id_estoque, id_ingrediente, quantidade, limite_minimo, data_atualizacao) VALUES (?, ?, ?, ?, ?)`,
    [id_estoque, id_ingrediente, quantidade, limite_minimo, data_atualizacao]
  );
  res.json({ message: 'Estoque criado!' });
});
// Listagem
app.get('/estoques', async (req, res) => {
  const db = await openDb();
  const estoques = await db.all('SELECT * FROM Estoque');
  res.json(estoques);
});
// Atualização
app.put('/estoque/:id', async (req, res) => {
  const { id } = req.params;
  const { quantidade, limite_minimo, data_atualizacao } = req.body;
  const db = await openDb();
  await db.run(
    `UPDATE Estoque SET quantidade=?, limite_minimo=?, data_atualizacao=? WHERE id_estoque=?`,
    [quantidade, limite_minimo, data_atualizacao, id]
  );
  res.json({ message: 'Estoque atualizado!' });
});
// Exclusão
app.delete('/estoque/:id', async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  await db.run('DELETE FROM Estoque WHERE id_estoque=?', [id]);
  res.json({ message: 'Estoque deletado!' });
});

// -------------------- CRUD Prato --------------------
// Criação
app.post('/prato', async (req, res) => {
  const { id_prato, nome, descricao, preco_centavos, categoria } = req.body;
  const db = await openDb();
  await db.run(
    `INSERT INTO Prato (id_prato, nome, descricao, preco_centavos, categoria) VALUES (?, ?, ?, ?, ?)`,
    [id_prato, nome, descricao, preco_centavos, categoria]
  );
  res.json({ message: 'Prato criado!' });
});
// Listagem
app.get('/pratos', async (req, res) => {
  const db = await openDb();
  const pratos = await db.all('SELECT * FROM Prato');
  res.json(pratos);
});
// Atualização
app.put('/prato/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco_centavos, categoria } = req.body;
  const db = await openDb();
  await db.run(
    `UPDATE Prato SET nome=?, descricao=?, preco_centavos=?, categoria=? WHERE id_prato=?`,
    [nome, descricao, preco_centavos, categoria, id]
  );
  res.json({ message: 'Prato atualizado!' });
});
// Exclusão
app.delete('/prato/:id', async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  await db.run('DELETE FROM Prato WHERE id_prato=?', [id]);
  res.json({ message: 'Prato deletado!' });
});

// -------------------- CRUD Prato_Ingrediente --------------------
// Criação
app.post('/prato_ingrediente', async (req, res) => {
  const { id_prato, id_ingrediente, quantidade_utilizada } = req.body;
  const db = await openDb();
  await db.run(
    `INSERT INTO Prato_Ingrediente (id_prato, id_ingrediente, quantidade_utilizada) VALUES (?, ?, ?)`,
    [id_prato, id_ingrediente, quantidade_utilizada]
  );
  res.json({ message: 'Prato_Ingrediente criado!' });
});
// Listagem
app.get('/pratos_ingredientes', async (req, res) => {
  const db = await openDb();
  const pi = await db.all('SELECT * FROM Prato_Ingrediente');
  res.json(pi);
});
// Atualização
app.put('/prato_ingrediente/:prato/:ingrediente', async (req, res) => {
  const { prato, ingrediente } = req.params;
  const { quantidade_utilizada } = req.body;
  const db = await openDb();
  await db.run(
    `UPDATE Prato_Ingrediente SET quantidade_utilizada=? WHERE id_prato=? AND id_ingrediente=?`,
    [quantidade_utilizada, prato, ingrediente]
  );
  res.json({ message: 'Prato_Ingrediente atualizado!' });
});
// Exclusão
app.delete('/prato_ingrediente/:prato/:ingrediente', async (req, res) => {
  const { prato, ingrediente } = req.params;
  const db = await openDb();
  await db.run(
    'DELETE FROM Prato_Ingrediente WHERE id_prato=? AND id_ingrediente=?',
    [prato, ingrediente]
  );
  res.json({ message: 'Prato_Ingrediente deletado!' });
});

// -------------------- CRUD Pedido --------------------
// Criação
app.post('/pedido', async (req, res) => {
  const { id_pedido, id_cliente, data_pedido, status, total_centavos } = req.body;
  const db = await openDb();
  await db.run(
    `INSERT INTO Pedido (id_pedido, id_cliente, data_pedido, status, total_centavos)
     VALUES (?, ?, ?, ?, ?)`,
    [id_pedido, id_cliente, data_pedido, status, total_centavos]
  );
  res.json({ message: 'Pedido criado!' });
});
// Listagem
app.get('/pedidos', async (req, res) => {
  const db = await openDb();
  const pedidos = await db.all('SELECT * FROM Pedido');
  res.json(pedidos);
});
// Atualização
app.put('/pedido/:id', async (req, res) => {
  const { id } = req.params;
  const { status, total_centavos } = req.body;
  const db = await openDb();
  await db.run(
    `UPDATE Pedido SET status=?, total_centavos=? WHERE id_pedido=?`,
    [status, total_centavos, id]
  );
  res.json({ message: 'Pedido atualizado!' });
});
// Exclusão
app.delete('/pedido/:id', async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  await db.run('DELETE FROM Pedido WHERE id_pedido=?', [id]);
  res.json({ message: 'Pedido deletado!' });
});

// -------------------- CRUD ItemPedido --------------------
// Criação
app.post('/itempedido', async (req, res) => {
  const { id_item, id_pedido, id_prato, quantidade, subtotal_centavos } = req.body;
  const db = await openDb();
  await db.run(
    `INSERT INTO ItemPedido (id_item, id_pedido, id_prato, quantidade, subtotal_centavos)
     VALUES (?, ?, ?, ?, ?)`,
    [id_item, id_pedido, id_prato, quantidade, subtotal_centavos]
  );
  res.json({ message: 'ItemPedido criado!' });
});
// Listagem
app.get('/itempedidos', async (req, res) => {
  const db = await openDb();
  const items = await db.all('SELECT * FROM ItemPedido');
  res.json(items);
});
// Atualização
app.put('/itempedido/:id', async (req, res) => {
  const { id } = req.params;
  const { quantidade, subtotal_centavos } = req.body;
  const db = await openDb();
  await db.run(
    `UPDATE ItemPedido SET quantidade=?, subtotal_centavos=? WHERE id_item=?`,
    [quantidade, subtotal_centavos, id]
  );
  res.json({ message: 'ItemPedido atualizado!' });
});
// Exclusão
app.delete('/itempedido/:id', async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  await db.run('DELETE FROM ItemPedido WHERE id_item=?', [id]);
  res.json({ message: 'ItemPedido deletado!' });
});

// -------------------- CRUD Pagamento --------------------
// Criação
app.post('/pagamento', async (req, res) => {
  const { id_pagamento, id_pedido, metodo_pagamento, valor_centavos, status } = req.body;
  const db = await openDb();
  await db.run(
    `INSERT INTO Pagamento (id_pagamento, id_pedido, metodo_pagamento, valor_centavos, status)
     VALUES (?, ?, ?, ?, ?)`,
    [id_pagamento, id_pedido, metodo_pagamento, valor_centavos, status]
  );
  res.json({ message: 'Pagamento criado!' });
});
// Listagem
app.get('/pagamentos', async (req, res) => {
  const db = await openDb();
  const pagamentos = await db.all('SELECT * FROM Pagamento');
  res.json(pagamentos);
});
// Atualização
app.put('/pagamento/:id', async (req, res) => {
  const { id } = req.params;
  const { status, valor_centavos } = req.body;
  const db = await openDb();
  await db.run(
    `UPDATE Pagamento SET status=?, valor_centavos=? WHERE id_pagamento=?`,
    [status, valor_centavos, id]
  );
  res.json({ message: 'Pagamento atualizado!' });
});
// Exclusão
app.delete('/pagamento/:id', async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  await db.run('DELETE FROM Pagamento WHERE id_pagamento=?', [id]);
  res.json({ message: 'Pagamento deletado!' });
});

// -------------------- Pagamento Cartao --------------------
// Criação
app.post('/pagamento_cartao', async (req, res) => {
  const { id_pagamento, bandeira, ultimos4, parcelas, autorizacao } = req.body;
  const db = await openDb();
  await db.run(
    `INSERT INTO Pagamento_Cartao (id_pagamento, bandeira, ultimos4, parcelas, autorizacao)
     VALUES (?, ?, ?, ?, ?)`,
    [id_pagamento, bandeira, ultimos4, parcelas, autorizacao]
  );
  res.json({ message: 'Pagamento cartão criado!' });
});
// Listagem
app.get('/pagamentos_cartao', async (req, res) => {
  const db = await openDb();
  const data = await db.all('SELECT * FROM Pagamento_Cartao');
  res.json(data);
});
// Atualização
app.put('/pagamento_cartao/:id', async (req, res) => {
  const { id } = req.params;
  const { bandeira, ultimos4, parcelas, autorizacao } = req.body;
  const db = await openDb();
  await db.run(
    `UPDATE Pagamento_Cartao SET bandeira=?, ultimos4=?, parcelas=?, autorizacao=? WHERE id_pagamento=?`,
    [bandeira, ultimos4, parcelas, autorizacao, id]
  );
  res.json({ message: 'Pagamento cartão atualizado!' });
});
// Exclusão
app.delete('/pagamento_cartao/:id', async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  await db.run('DELETE FROM Pagamento_Cartao WHERE id_pagamento=?', [id]);
  res.json({ message: 'Pagamento cartão deletado!' });
});

// -------------------- Pagamento PIX --------------------
// Criação
app.post('/pagamento_pix', async (req, res) => {
  const { id_pagamento, chave_pix, txid } = req.body;
  const db = await openDb();
  await db.run(
    `INSERT INTO Pagamento_PIX (id_pagamento, chave_pix, txid)
     VALUES (?, ?, ?)`,
    [id_pagamento, chave_pix, txid]
  );
  res.json({ message: 'Pagamento PIX criado!' });
});
// Listagem
app.get('/pagamentos_pix', async (req, res) => {
  const db = await openDb();
  const data = await db.all('SELECT * FROM Pagamento_PIX');
  res.json(data);
});
// Atualização
app.put('/pagamento_pix/:id', async (req, res) => {
  const { id } = req.params;
  const { chave_pix, txid } = req.body;
  const db = await openDb();
  await db.run(
    `UPDATE Pagamento_PIX SET chave_pix=?, txid=? WHERE id_pagamento=?`,
    [chave_pix, txid, id]
  );
  res.json({ message: 'Pagamento PIX atualizado!' });
});
// Exclusão
app.delete('/pagamento_pix/:id', async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  await db.run('DELETE FROM Pagamento_PIX WHERE id_pagamento=?', [id]);
  res.json({ message: 'Pagamento PIX deletado!' });
});

// -------------------- Pagamento Dinheiro --------------------
// Criação
app.post('/pagamento_dinheiro', async (req, res) => {
  const { id_pagamento, troco } = req.body;
  const db = await openDb();
  await db.run(
    `INSERT INTO Pagamento_Dinheiro (id_pagamento, troco)
     VALUES (?, ?)`,
    [id_pagamento, troco]
  );
  res.json({ message: 'Pagamento Dinheiro criado!' });
});
// Listagem
app.get('/pagamentos_dinheiro', async (req, res) => {
  const db = await openDb();
  const data = await db.all('SELECT * FROM Pagamento_Dinheiro');
  res.json(data);
});
// Atualização
app.put('/pagamento_dinheiro/:id', async (req, res) => {
  const { id } = req.params;
  const { troco } = req.body;
  const db = await openDb();
  await db.run(
    `UPDATE Pagamento_Dinheiro SET troco=? WHERE id_pagamento=?`,
    [troco, id]
  );
  res.json({ message: 'Pagamento Dinheiro atualizado!' });
});
// Exclusão
app.delete('/pagamento_dinheiro/:id', async (req, res) => {
  const { id } = req.params;
  const db = await openDb();
  await db.run('DELETE FROM Pagamento_Dinheiro WHERE id_pagamento=?', [id]);
  res.json({ message: 'Pagamento Dinheiro deletado!' });
});

// -------------------- Servidor --------------------
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
