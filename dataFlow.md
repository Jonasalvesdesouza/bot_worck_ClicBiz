[app.js] → startEvents() → initializeClient()
                              │
                              ▼
                     [whatsappClient] (Singleton)
                              │
                              ▼
              attachEventHandlers (qr, ready, ...)
                              │
                              ▼ ready
                     executeOnce (mutex)
                              │
                              ▼
                    jaRodouHoje? → sim → shutdown
                              │ não
                              ▼
              [orchestrator].run()
                    ├─ convertCsvToJson() → [customers]
                    ├─ extrai uniquePhones
                    ├─ validateBatch(phones)
                    │      └─ [validationService] (p-limit)
                    │            └─ client.getNumberId()
                    ├─ filter validCustomers
                    └─ processSend(validCustomers)
                           │
                           ▼
                   [sendProcessor].groupByPhone()
                           │
                           ▼
                   para cada grupo:
                         ├─ generateMessage(group)
                         │      └─ [messageService]
                         │            ├─ getGreeting()
                         │            ├─ single ou multi templates
                         │            └─ formatarListaBoletos()
                         └─ sendMessage(phone, msg)
                                │
                                ▼
                         [sendService].sendMessage()
                                ├─ isClientReady()
                                ├─ client.sendMessage() + timeout
                                ├─ aguarda ACK (evento message_ack)
                                └─ retry até 3x
                                │
                                ▼
                         randomDelay()
                           │
                           ▼ (próximo grupo)
                   ─────────────────────────
                           │
                           ▼
                   registrarExecucao() (runGuard)
                           │
                           ▼
                   gracefulShutdown() → client.destroy() → process.exit()

________________________________________////___________________________________                  

projeto/
├── app.js                         # Ponto de entrada
├── config/
│   └── env.js                     # Carrega e exporta variáveis .env
├── client/
│   └── whatsappClient.js          # Singleton do cliente WhatsApp + reset
├── events/
│   └── clientEvents.js            # Eventos: qr, ready, auth_failure, disconnected
│                                 # Controla fluxo de execução única e shutdown
├── services/
│   ├── orchestrator.js            # Orquestrador principal (CSV → validação → envio)
│   ├── sendService.js             # Envio de mensagem com ACK e retry
│   ├── validationService.js       # Valida se número é WhatsApp (paralelo)
│   ├── messageService.js          # Geração de mensagem (template + pluralização)
│   └── shutdownManager.js         # Flag global de desligamento
├── processors/
│   └── sendProcessor.js           # Agrupamento por telefone e envio sequencial
├── utils/
│   ├── csvConverter.js            # Leitura CSV, normalização, extração de telefone
│   ├── phone.js                   # Funções de extração e normalização de telefone
│   ├── normalizeName.js           # Corrige nomes (acentuação, maiúsculas)
│   ├── delay.js                   # Delay fixo + jitter
│   ├── greeting.js                # Saudação baseada na hora
│   ├── runGuard.js                # Controle de execução diária (JSON)
│   └── jsonService.js             # Leitura/escrita de JSON (usado? não parece)
└── data/
    ├── client.csv                 # Fonte dos dados (não fornecido)
    └── last_run.json              # Armazena data da última execução