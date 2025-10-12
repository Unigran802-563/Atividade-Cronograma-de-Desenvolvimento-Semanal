-- ================================
-- LIMPAR BANCO DE DADOS (RESET)
-- ================================

-- ⚠️ ORIENTAÇÃO PARA EXECUTAR NO VS CODE:
-- 1. Pressione Ctrl+Shift+P e escolha "SQLite: New Query".
-- 2. Selecione o banco de dados do projeto (database.db).
-- 3. Abra este arquivo SQL ou cole o conteúdo na query.
-- 4. Selecione todo o código (Ctrl+A) e clique duas vezes no código ou botão "Run Query".
-- 5. Uma nova aba mostrará os resultados da execução.

-- Desativa temporariamente as foreign keys para evitar erros ao deletar registros
PRAGMA foreign_keys = OFF;

-- Limpa todas as tabelas, mantendo o esquema
DELETE FROM Pagamento_Dinheiro;
DELETE FROM Pagamento_PIX;
DELETE FROM Pagamento_Cartao;
DELETE FROM Pagamento;
DELETE FROM ItemPedido;
DELETE FROM Pedido;
DELETE FROM Prato_Ingrediente;
DELETE FROM Prato;
DELETE FROM Estoque;
DELETE FROM Ingrediente;
DELETE FROM Cliente;
DELETE FROM Endereco;

-- Reativa as foreign keys
PRAGMA foreign_keys = ON;

-- (Opcional) Verifica se tudo foi realmente limpo:
SELECT 
  (SELECT COUNT(*) FROM Endereco) AS Enderecos,
  (SELECT COUNT(*) FROM Cliente) AS Clientes,
  (SELECT COUNT(*) FROM Ingrediente) AS Ingredientes,
  (SELECT COUNT(*) FROM Estoque) AS Estoque,
  (SELECT COUNT(*) FROM Prato) AS Pratos,
  (SELECT COUNT(*) FROM Pedido) AS Pedidos,
  (SELECT COUNT(*) FROM Pagamento) AS Pagamentos;
