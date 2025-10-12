import fs from 'fs';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos dos arquivos
const dbPath = path.join(__dirname, 'database.db'); // cria database.db nesta pasta
const sqlPath = path.join(__dirname, 'schema_sqlite.sql');

// Ler o script SQL
const sqlScript = fs.readFileSync(sqlPath, 'utf-8');

// Criar o banco (ou conectar se já existir)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao criar o banco:', err.message);
    return;
  }
  console.log('Conectado ao banco SQLite.');
});

// Executar o script SQL
db.exec(sqlScript, (err) => {
  if (err) {
    console.error('Erro ao executar o script SQL:', err.message);
  } else {
    console.log('Banco criado com sucesso em:', dbPath);
  }
  db.close();
});
