-- Ativar foreign keys
PRAGMA foreign_keys = ON;

-- -----------------------
-- Endereco
-- -----------------------
CREATE TABLE IF NOT EXISTS Endereco (
  id_endereco TEXT PRIMARY KEY,
  rua TEXT NOT NULL,
  numero TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT
);

-- -----------------------
-- Cliente
-- -----------------------
CREATE TABLE IF NOT EXISTS Cliente (
  id_cliente TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  cpf TEXT UNIQUE,
  id_endereco TEXT,
  FOREIGN KEY (id_endereco) REFERENCES Endereco(id_endereco) ON DELETE SET NULL
);

-- -----------------------
-- Ingrediente (metadados do insumo)
-- -----------------------
CREATE TABLE IF NOT EXISTS Ingrediente (
  id_ingrediente TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  unidade_medida TEXT
);

-- -----------------------
-- Estoque (quantidades físicas)
-- -----------------------
CREATE TABLE IF NOT EXISTS Estoque (
  id_estoque TEXT PRIMARY KEY,
  id_ingrediente TEXT NOT NULL,
  quantidade REAL DEFAULT 0,
  limite_minimo REAL DEFAULT 0,
  data_atualizacao TEXT,
  FOREIGN KEY (id_ingrediente) REFERENCES Ingrediente(id_ingrediente) ON DELETE CASCADE
);

-- -----------------------
-- Prato
-- -----------------------
CREATE TABLE IF NOT EXISTS Prato (
  id_prato TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco_centavos INTEGER NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('entrada','prato_principal','sobremesa'))
);

-- -----------------------
-- Relacao Prato <-> Ingrediente (muitos-para-muitos)
-- -----------------------
CREATE TABLE IF NOT EXISTS Prato_Ingrediente (
  id_prato TEXT NOT NULL,
  id_ingrediente TEXT NOT NULL,
  quantidade_utilizada REAL NOT NULL,
  PRIMARY KEY (id_prato, id_ingrediente),
  FOREIGN KEY (id_prato) REFERENCES Prato(id_prato) ON DELETE CASCADE,
  FOREIGN KEY (id_ingrediente) REFERENCES Ingrediente(id_ingrediente) ON DELETE CASCADE
);

-- -----------------------
-- Pedido
-- -----------------------
CREATE TABLE IF NOT EXISTS Pedido (
  id_pedido TEXT PRIMARY KEY,
  id_cliente TEXT NOT NULL,
  data_pedido TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('em_preparo','pronto','cancelado')),
  total_centavos INTEGER DEFAULT 0,
  FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente) ON DELETE CASCADE
);

-- -----------------------
-- ItemPedido
-- -----------------------
CREATE TABLE IF NOT EXISTS ItemPedido (
  id_item TEXT PRIMARY KEY,
  id_pedido TEXT NOT NULL,
  id_prato TEXT NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  subtotal_centavos INTEGER NOT NULL,
  FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (id_prato) REFERENCES Prato(id_prato) ON DELETE RESTRICT
);

-- -----------------------
-- Pagamento
-- -----------------------
CREATE TABLE IF NOT EXISTS Pagamento (
  id_pagamento TEXT PRIMARY KEY,
  id_pedido TEXT NOT NULL,
  metodo_pagamento TEXT NOT NULL CHECK (metodo_pagamento IN ('PIX','CARTAO','DINHEIRO')),
  valor_centavos INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente','pago','recusado')),
  FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido) ON DELETE CASCADE
);

-- -----------------------
-- Pagamento_Cartao
-- -----------------------
CREATE TABLE IF NOT EXISTS Pagamento_Cartao (
  id_pagamento TEXT PRIMARY KEY,
  bandeira TEXT,
  ultimos4 TEXT,
  parcelas INTEGER,
  autorizacao TEXT,
  FOREIGN KEY (id_pagamento) REFERENCES Pagamento(id_pagamento) ON DELETE CASCADE
);

-- -----------------------
-- Pagamento_PIX
-- -----------------------
CREATE TABLE IF NOT EXISTS Pagamento_PIX (
  id_pagamento TEXT PRIMARY KEY,
  chave_pix TEXT,
  txid TEXT,
  FOREIGN KEY (id_pagamento) REFERENCES Pagamento(id_pagamento) ON DELETE CASCADE
);

-- -----------------------
-- Pagamento_Dinheiro
-- -----------------------
CREATE TABLE IF NOT EXISTS Pagamento_Dinheiro (
  id_pagamento TEXT PRIMARY KEY,
  troco INTEGER, -- o troco é em centavos
  FOREIGN KEY (id_pagamento) REFERENCES Pagamento(id_pagamento) ON DELETE CASCADE
);

-- -----------------------
-- Índices
-- -----------------------
CREATE INDEX IF NOT EXISTS idx_pedido_cliente ON Pedido(id_cliente);
CREATE INDEX IF NOT EXISTS idx_itempedido_pedido ON ItemPedido(id_pedido);
CREATE INDEX IF NOT EXISTS idx_prato_ingrediente_ingrediente ON Prato_Ingrediente(id_ingrediente);
CREATE INDEX IF NOT EXISTS idx_estoque_ingrediente ON Estoque(id_ingrediente);
