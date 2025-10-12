SOS Restaurante
Introdução

O projeto SOS Restaurante tem como objetivo o desenvolvimento de um sistema de gerenciamento completo para um restaurante, utilizando React no front-end e Node.js com SQLite no back-end. A aplicação foi estruturada para permitir o controle eficiente de clientes, endereços, pratos, ingredientes, estoque, pedidos e pagamentos, garantindo uma integração fluida entre a interface e o banco de dados.

Banco de Dados SQLite

O banco de dados utilizado é o SQLite, escolhido por sua leveza, praticidade e compatibilidade com aplicações locais. Para acessá-lo diretamente no VS Code, é necessário instalar as extensões SQLite (de alexcvzz) e SQLite Viewer (de Florian Klampfer), que permitem visualizar, editar e consultar as tabelas de forma simples dentro do editor. Na pasta database estão localizados os arquivos responsáveis pela estrutura do banco de dados: schema_sqlite.sql, que define todas as tabelas e seus relacionamentos; criarDatabase.js, que gera automaticamente o arquivo físico do banco; e database.db, que armazena efetivamente os dados criados.

Criação do Banco de Dados

Para criar o banco de dados, abra o terminal do VS Code, acesse a pasta do projeto, entre no diretório database e execute o comando node criarDatabase.js. Ao rodar esse comando, o arquivo database.db será criado automaticamente com toda a estrutura das tabelas e relacionamentos definidos no script SQL.

Reset do Banco de Dados

Para limpar todos os dados do banco (database.db) e manter apenas a estrutura das tabelas, utilize o script SQL deletarDatabase.sql localizado na pasta src/database.

No VS Code, siga estes passos: abra o terminal, pressione Ctrl + Shift + P e selecione SQLite: New Query. Escolha o banco de dados do projeto (database.db), abra o arquivo deletarDatabase.sql ou cole seu conteúdo na query, selecione todo o código (Ctrl + A) e execute a query (Run Query ou clique duplo no código e daí aparece a opção de Run Query). Uma nova aba mostrará os resultados e você poderá confirmar que todas as tabelas foram limpas.

Observação: os valores monetários e relacionamentos serão resetados, mas a estrutura do banco permanece intacta.

Back-End (Node.js)

O back-end foi configurado na pasta server, no arquivo crud.js, que realiza as operações de criação, leitura, atualização e exclusão (CRUD) no banco SQLite. Para iniciar o servidor individualmente, execute node src/server/crud.js. Após a execução, o servidor ficará ativo e disponível localmente, normalmente no endereço http://localhost:3001
, permitindo a comunicação com o front-end em React.

Front-End (React)

O front-end, desenvolvido em React, é responsável pela interface de interação com o usuário, possibilitando o envio e recebimento de dados através das rotas expostas pelo back-end. Assim, será possível consultar e atualizar informações diretamente no banco de dados. Para rodar o projeto, abra o terminal na pasta principal do projeto, execute npm install para instalar as dependências e npm start para iniciar o servidor de desenvolvimento. Após isso, o sistema pode ser acessado no navegador em http://localhost:3000.

Para facilitar o desenvolvimento, é possível criar um comando único que inicia o servidor Node.js e o front-end React juntos. Para isso, adicione no arquivo package.json a seguinte linha em "scripts":

"dev:all": "concurrently \"node src/server/crud.js\" \"npm start\""

Dessa forma, basta rodar npm run dev:all no terminal para ter ambos funcionando simultaneamente.

Estrutura de Dados e Observações

O banco de dados contém todas as tabelas essenciais do sistema, incluindo Cliente, Endereco, Ingrediente, Estoque, Prato, Prato_Ingrediente, Pedido, ItemPedido, Pagamento, Pagamento_Cartao, Pagamento_PIX e Pagamento_Dinheiro. Todos os valores monetários do sistema — como preços, subtotais, totais e trocos — são armazenados em centavos (tipo INTEGER) para evitar imprecisões. No caso do campo troco da tabela Pagamento_Dinheiro, o valor também é salvo em centavos e deve ser dividido por 100 no front-end para exibição em reais, utilizando ponto flutuante normalmente.

Diagrama de Classes

O diagrama de classes que representa a estrutura lógica do banco de dados e as relações entre as entidades pode ser acessado pelo link do diagrama de classes SOS Restaurante. Ele mostra as classes correspondentes às tabelas, seus atributos e relações, servindo como referência visual da modelagem do sistema. O link do diagrama de classes: https://drive.google.com/file/d/19Px7oDmPVikbtUHrf6lO9GWtMpJD84tr/view?usp=sharing

Conclusão

Este repositório contém toda a base inicial do projeto, incluindo o banco de dados configurado, o script SQL, o servidor Node.js e a estrutura preparada para integração com o React. As próximas etapas de desenvolvimento incluirão a implementação das telas de cadastro, pedidos e controle de estoque, conforme o cronograma de entregas do grupo.
