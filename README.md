markdown

# 🤖 Bot de Cobrança WhatsApp

Bot automatizado para envio de mensagens de cobrança via WhatsApp, desenvolvido em Node.js com `whatsapp-web.js`.  
Lê dados de inadimplência de um arquivo CSV, valida números de telefone, gera mensagens personalizadas baseadas no nível de atraso e envia os lotes com delays controlados para evitar bloqueios.

---

## 📋 Sumário

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré‑requisitos](#-pré‑requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Como Usar](#-como-usar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Fluxo de Execução](#-fluxo-de-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Mensagens e Templates](#-mensagens-e-templates)
- [Solução de Problemas](#-solução-de-problemas)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## ✨ Funcionalidades

- 🔐 **Sessão persistente** – escaneie o QR Code apenas uma vez.
- 📄 **Leitura de CSV** – suporte a múltiplos boletos por linha (separador configurável).
- ✅ **Validação de números** – verifica se o telefone está registrado no WhatsApp (com concorrência controlada).
- 📦 **Agrupamento inteligente** – múltiplas empresas para o mesmo contato geram uma única mensagem.
- 📝 **Templates dinâmicos** – mensagem adaptada ao nível de urgência (primeiro contato, acompanhamento, urgência, crítico).
- ⏱️ **Delays e Jitter** – evita bloqueio por envio em massa.
- 🔁 **Reconexão automática** – backoff exponencial em caso de desconexão.
- 🛑 **Execução diária** – o bot executa apenas uma vez por dia (controlado por arquivo JSON).
- 🧹 **Graceful shutdown** – trata sinais SIGINT/SIGTERM e finaliza conexões corretamente.

---

## 🧰 Tecnologias

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [whatsapp-web.js](https://wwebjs.dev/) – cliente WhatsApp não oficial
- [Puppeteer](https://pptr.dev/) – automação do navegador (Chromium)
- [csv-parser](https://www.npmjs.com/package/csv-parser) – leitura de CSV
- [iconv-lite](https://www.npmjs.com/package/iconv-lite) – decodificação Windows-1252
- [p-limit](https://www.npmjs.com/package/p-limit) – controle de concorrência
- [dotenv](https://www.npmjs.com/package/dotenv) – gerenciamento de variáveis de ambiente

---

## 📦 Pré‑requisitos

- Node.js instalado (versão 18+ recomendada)
- NPM ou Yarn
- **Chromium** (o Puppeteer baixa automaticamente, mas em servidores pode ser necessário instalá-lo)
- Acesso à internet para escanear o QR Code na primeira execução

---

## 🔧 Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/bot-cobranca-whatsapp.git
cd bot-cobranca-whatsapp

    Instale as dependências

bash

npm install

    Crie o arquivo de ambiente

bash

cp .env.example .env

    Edite as variáveis conforme sua necessidade (veja seção Variáveis de Ambiente).

    Prepare o arquivo CSV no diretório data/client.csv seguindo o formato descrito em Como Usar.

⚙️ Configuração
Arquivo .env
Variável	Descrição	Padrão
SESSION	Identificador da sessão (usado pelo LocalAuth)	production
CSV_FILE	Caminho do arquivo CSV de entrada	data/client.csv
CSV_SEPARATOR	Delimitador do CSV	;
MULTI_VALUE_SEPARATOR	Separador para múltiplos boletos na mesma célula	|
DELAY_BETWEEN_MESSAGES	Delay base entre mensagens (ms)	60000 (1 min)
JITTER_MAX_MS	Variação máxima adicionada ao delay (ms)	10000 (10s)
VALIDATION_CONCURRENCY	Número de validações simultâneas	5
MAX_RECONNECT_ATTEMPTS	Tentativas de reconexão após desconexão	5
RECONNECT_BASE_DELAY_MS	Delay inicial do backoff exponencial (ms)	5000 (5s)
Formato do CSV

O arquivo deve conter as seguintes colunas (nomes exatos, sensível a maiúsculas):
Coluna	Descrição	Exemplo
Nome Cliente	Telefone + nome (telefone antes de Contato:)	17991204960 Contato: João Silva
Empresa	Nome da empresa devedora	Clic Biz
Valor Atrasado	Valor total com juros (exibido na mensagem)	R$ 1.500,00
Dias de Atraso	Número inteiro de dias em atraso	45
Título	Número do título/boleto (suporta múltiplos separados por |)	12345 | 67890
Dt Venc	Data de vencimento (suporta múltiplos)	10/03/2025 | 15/04/2025
Vl Título	Valor original do título (suporta múltiplos)	R$ 800,00 | R$ 700,00
Situação	(opcional) Situação do título	Em aberto

Exemplo de linha:
csv

Nome Cliente;Empresa;Valor Atrasado;Dias de Atraso;Título;Dt Venc;Vl Título;Situação
17991204960 Contato: João;Empresa X;R$ 1.500,00;45;12345|67890;10/03/2025|15/04/2025;R$ 800,00|R$ 700,00;Em aberto

    Atenção: O campo Nome Cliente deve conter o telefone antes da palavra Contato: (case insensitive). O telefone pode conter apenas dígitos (o código limpa e formata automaticamente para o padrão internacional 55DDDNÚMERO).

🚀 Como Usar
Execução normal
bash

npm start

Na primeira execução, um QR Code será exibido no terminal. Escaneie‑o com o WhatsApp do seu celular (vá em Configurações > Dispositivos conectados > Conectar um dispositivo).

Após a autenticação, o bot:

    Lê o CSV

    Valida os telefones no WhatsApp

    Gera as mensagens personalizadas

    Envia uma a uma (com delays)

    Registra a execução do dia e encerra.

Execução manual (forçar nova tentativa no mesmo dia)
bash

rm data/last_run.json
npm start

    O bot foi projetado para rodar uma vez por dia. Se precisar testar, apague o arquivo data/last_run.json.

Parada antecipada

Pressione Ctrl+C – o bot tentará finalizar a conexão graciosamente.
📁 Estrutura do Projeto
text

.
├── app.js                      # Ponto de entrada
├── config/
│   └── env.js                  # Carrega variáveis de ambiente
├── client/
│   └── whatsappClient.js       # Singleton do cliente WhatsApp
├── events/
│   └── clientEvents.js         # Eventos (qr, ready, auth_failure, disconnected)
├── services/
│   ├── orchestrator.js         # Orquestra CSV → validação → envio
│   ├── sendService.js          # Envio com confirmação (ACK) e retry
│   ├── validationService.js    # Valida número no WhatsApp (paralelo)
│   ├── messageService.js       # Geração de mensagens (templates)
│   └── shutdownManager.js      # Flag global de desligamento
├── processors/
│   └── sendProcessor.js        # Agrupamento por telefone e envio sequencial
├── utils/
│   ├── csvConverter.js         # Leitura e parse do CSV
│   ├── phone.js                # Limpeza e normalização de telefone
│   ├── normalizeName.js        # Corrige nomes (acentuação, maiúsculas)
│   ├── delay.js                # Delay fixo + jitter
│   ├── greeting.js             # Saudação baseada no horário de Brasília
│   ├── runGuard.js             # Controle de execução diária
│   └── jsonService.js          # Utilitário para JSON (pouco usado)
├── data/                       # Diretório de dados (criado automaticamente)
│   ├── client.csv              # ← coloque seu CSV aqui
│   └── last_run.json           # Última data de execução
├── .env                        # Configurações (não versionar)
└── package.json

🔁 Fluxo de Execução
🔐 Variáveis de Ambiente (detalhadas)
Nome	Tipo	Obrigatório	Descrição
SESSION	string	não	Identificador da sessão para LocalAuth
CSV_FILE	string	não	Caminho absoluto ou relativo do CSV
CSV_SEPARATOR	string	não	Delimitador de colunas (ex: , ou ;)
MULTI_VALUE_SEPARATOR	string	não	Separador para múltiplos boletos dentro de uma célula
DELAY_BETWEEN_MESSAGES	number	não	Delay base em milissegundos
JITTER_MAX_MS	number	não	Variação máxima adicionada ao delay (para evitar padrões)
VALIDATION_CONCURRENCY	number	não	Máximo de validações simultâneas (evita sobrecarga)
MAX_RECONNECT_ATTEMPTS	number	não	Tentativas de reconexão após disconnected
RECONNECT_BASE_DELAY_MS	number	não	Delay inicial do backoff exponencial (ms)
📨 Mensagens e Templates

O bot gera mensagens com base no nível de urgência, definido pelos dias de atraso:
Dias de atraso	Nível	Template utilizado
0 – 15	firstContact	Primeiro contato, tom educado
16 – 60	followUp	Acompanhamento, reforço
61 – 90	urgency	Urgência, pedido de retorno rápido
> 90	critical	Crítico, alerta de suspensão

Características dos templates:

    Saudação dinâmica (Bom dia/Boa tarde/Boa noite)

    Pluralização automática (boleto/boletos, valor/valores)

    Listagem detalhada de boletos (título, data, valor)

    Adaptação para múltiplas empresas (agrupa em uma única mensagem)

Exemplo de mensagem (primeiro contato, empresa única)
text

Boa tarde, João. Espero que esta mensagem o encontre bem.

Meu nome é Jonas e represento a *Clic Biz*.
Identificamos 2 boletos vencidos totalizando R$ 1.500,00, referente à empresa *Empresa X* — 45 dia(s) em atraso.

📆 *Boletos:*
   12345  |   10/03/2025  |  R$ 800,00
   67890  |   15/04/2025  |  R$ 700,00

Por gentileza, poderia nos informar previsão de pagamento para esses valores em aberto?

Fico inteiramente à disposição para reenviar os boletos vencidos ou auxiliá-lo no que for necessário. Agradecemos a atenção e aguardamos seu retorno.

🧪 Solução de Problemas
❌ QR Code não aparece

    Certifique-se de que não há outra instância do bot rodando.

    Delete a pasta session-data (criada pelo LocalAuth) e reinicie.

    Verifique se o Puppeteer consegue iniciar o Chromium: em servidores headless, defina headless: true e instale dependências de sistema (fonts-liberation, libgbm1, etc.).

🔁 Bot desconecta constantemente

    Aumente MAX_RECONNECT_ATTEMPTS no .env.

    Verifique sua conexão de internet.

    O WhatsApp Web pode exigir nova autenticação de tempos em tempos (a cada ~30 dias). Reexecute o bot e escaneie o QR Code novamente.

📉 Mensagens não são entregues

    O número pode não ser registrado no WhatsApp (o bot já filtra na validação).

    Se o ACK não chegar, o bot considera a mensagem como enviada mas não confirmada. Verifique os logs: se houver ⚠️ Mensagem enviada, mas confirmação não recebida, pode ser instabilidade da rede.

    Aumente o DELAY_BETWEEN_MESSAGES (WhatsApp pode bloquear envios muito rápidos).

📂 CSV com encoding errado (caracteres estranhos)

    O bot já tenta decodificar como win1252. Se ainda aparecerem símbolos, converta seu CSV para UTF-8 ou altere o iconv.decode para outro encoding.

🤝 Contribuição

Contribuições são bem‑vindas! Siga os passos:

    Faça um fork do projeto.

    Crie uma branch para sua feature (git checkout -b feature/nova-feature).

    Commit suas alterações (git commit -m 'Adiciona nova feature').

    Push para a branch (git push origin feature/nova-feature).

    Abra um Pull Request.

📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo LICENSE para mais informações.

Desenvolvido com ❤️ para automação de cobranças. Use com responsabilidade e respeite os termos de serviço do WhatsApp.