# DeepL Translator App

## Panoramica del Progetto

Questa è una moderna applicazione web progettata per fornire una traduzione testuale senza interruzioni utilizzando l'API DeepL. Offre un'interfaccia utente intuitiva per tradurre testo tra varie lingue, con funzionalità aggiuntive come il salvataggio delle traduzioni preferite e un'autenticazione utente sicura. L'applicazione è stata costruita ponendo l'accento su prestazioni, manutenibilità e un'esperienza utente reattiva.

## Funzionalità

L'applicazione DeepL Translator offre le seguenti funzionalità principali:

*   **Traduzione in tempo reale:** Gli utenti possono inserire testo in una lingua di origine e ottenere una traduzione istantanea in una lingua di destinazione utilizzando l'API DeepL.
*   **Selezione della lingua:** Una combobox intuitiva consente una facile selezione delle lingue di origine e di destinazione da un elenco predefinito di lingue supportate.
*   **Traduzioni salvate:** Gli utenti autenticati possono salvare le loro traduzioni preferite per riferimento futuro. I prompt salvati mostrano il testo originale, il testo tradotto e le lingue di origine/destinazione.
*   **Autenticazione utente:** La funzionalità di accesso e disconnessione sicura è fornita tramite OAuth di GitHub, sfruttando Supabase per l'autenticazione e la gestione degli utenti.
*   **Interfaccia utente reattiva:** L'applicazione è progettata per essere reattiva e funzionare senza problemi su diversi dispositivi e dimensioni dello schermo.
*   **Copia negli appunti:** Gli utenti possono facilmente copiare il testo tradotto negli appunti con un solo clic.
*   **Integrazione con Google Search:** Un comodo pulsante consente agli utenti di cercare rapidamente su Google il testo tradotto.

### Processo di Traduzione: Input a Output

1.  **Input dell'Utente:** L'utente digita il testo nel campo di input della lingua di origine e seleziona le lingue di origine e di destinazione utilizzando le combobox.
2.  **Richiesta Lato Client:** Quando si fa clic sul pulsante "Traduci", il componente `TranslationForm` invia una richiesta `POST` all'endpoint `/api/translate`. Il corpo della richiesta include `sourceText`, `sourceLanguage` (codice) e `targetLanguage` (codice).
3.  **Gestione API Lato Server:** La route API di Next.js `/api/translate` riceve la richiesta.
    *   Recupera la `DEEPL_API_KEY` dalle variabili d'ambiente.
    *   Effettua una richiesta `POST` all'API DeepL (`https://api-free.deepl.com/v2/translate`) con il testo e i codici lingua forniti.
    *   Gestisce potenziali errori dall'API DeepL e restituisce una risposta JSON strutturata.
4.  **Gestione della Risposta Lato Client:** Il componente `TranslationForm` riceve il testo tradotto dall'endpoint `/api/translate`.
5.  **Visualizzazione della Traduzione:** Il testo tradotto viene visualizzato nel campo di input della lingua di destinazione.
6.  **Salvataggio Opzionale:** Se l'utente fa clic sul pulsante "Salva", la funzione `handleSave` in `TranslationForm` chiama `TranslationService.savePrompt`. Questa funzione invia il testo originale, il testo tradotto, il codice della lingua di origine, il codice della lingua di destinazione e l'ID dell'utente al database Supabase.

## Stack Tecnologico

Questo progetto sfrutta un moderno ecosistema JavaScript per un'applicazione robusta e scalabile:

*   **Next.js (v15.3.4):** Un framework React per la creazione di applicazioni web performanti con rendering lato server (SSR) e route API. Scelto per la sua eccellente esperienza di sviluppo, le capacità di routing e le funzionalità di ottimizzazione.
*   **React (v19.0.0):** Una libreria JavaScript per la creazione di interfacce utente. Utilizzato per la sua architettura basata su componenti e il rendering efficiente dell'interfaccia utente.
*   **Supabase:** Un'alternativa open-source a Firebase che fornisce un database PostgreSQL, autenticazione e servizi API. Scelto per la sua facilità d'uso, le capacità in tempo reale e l'autenticazione integrata.
    *   `@supabase/ssr`: Per il rendering lato server e l'autenticazione basata su cookie con Next.js.
    *   `@supabase/supabase-js`: La principale libreria client JavaScript per interagire con i servizi Supabase.
*   **DeepL API:** Un'API di traduzione automatica potente utilizzata per traduzioni testuali accurate e di alta qualità.
*   **Tailwind CSS (v4):** Un framework CSS utility-first per la creazione rapida di design personalizzati. Scelto per la sua flessibilità, prestazioni e facilità d'uso nella creazione di layout reattivi.
*   **`shadcn/ui`:** Una raccolta di componenti riutilizzabili costruiti con Radix UI e Tailwind CSS. Scelto per la sua accessibilità, personalizzazione e estetica moderna, accelerando significativamente lo sviluppo dell'interfaccia utente.
*   **`lucide-react`:** Una raccolta di icone open-source belle e personalizzabili per React.
*   **`framer-motion`:** Una libreria di animazione pronta per la produzione per React, utilizzata per animazioni ed elementi interattivi.
*   **`clsx` & `tailwind-merge`:** Utilità per unire condizionalmente i nomi delle classi CSS e unire le classi Tailwind CSS senza conflitti.
*   **`pnpm`:** Un gestore di pacchetti veloce ed efficiente in termini di spazio su disco.

## Configurazione e Avvio Locale

### Prerequisiti

*   Node.js (v18.x o superiore consigliato)
*   pnpm (installare con `npm install -g pnpm`)
*   Un progetto Supabase con una tabella `translation` configurata (vedere "Schema del Database" di seguito).
*   Una chiave API DeepL.

### Schema del Database (Supabase)

È necessaria una tabella `translation` nel tuo progetto Supabase con le seguenti colonne:

| Nome Colonna      | Tipo                       | Note                                                              |
| :---------------- | :------------------------- | :---------------------------------------------------------------- |
| `id`              | `uuid` (Chiave Primaria)   | Valore predefinito: `gen_random_uuid()`                           |
| `created_at`      | `timestamp con fuso orario` | Valore predefinito: `now()`                                       |
| `name`            | `text`                     | Memorizza l'ID dell'utente (da `auth.uid()`).                     |
| `source_text`     | `text`                     | Il testo originale inserito dall'utente.                          |
| `translated_text` | `text`                     | Il testo tradotto da DeepL.                                       |
| `source_language` | `text`                     | Il codice lingua del testo di origine (es. "EN", "IT").           |
| `target_language` | `text`                     | Il codice lingua del testo di destinazione (es. "ES", "FR").       |

**Policy di Sicurezza a Livello di Riga (RLS) per la tabella `translation`:**

Assicurati di avere una policy **"Abilita Inserimento"** che consenta agli utenti autenticati di inserire righe. Una policy comune per questo sarebbe:

*   **Nome:** `Consenti agli utenti autenticati di inserire le proprie traduzioni`
*   **Ruoli Target:** `authenticated`
*   **Espressione Utilizzata:** `auth.uid() = name` (supponendo che la colonna `name` memorizzi `auth.uid()`)

### Passaggi di Installazione

1.  **Clona il repository:**
    ```bash
    git clone <url-repository>
    cd translator
    ```
2.  **Installa le dipendenze:**
    ```bash
    pnpm install
    ```
3.  **Installa i componenti `shadcn/ui`:**
    ```bash
    npx shadcn@latest init # Se non già inizializzato
    npx shadcn@latest add alert alert-dialog avatar command popover
    ```

### Comandi Comuni

*   **Avvia il server di sviluppo:**
    ```bash
    pnpm dev
    ```
    L'applicazione sarà accessibile all'indirizzo `http://localhost:3000`.
*   **Crea la build per la produzione:**
    ```bash
    pnpm build
    ```
*   **Avvia il server di produzione:**
    ```bash
    pnpm start
    ```
*   **Esegui ESLint:**
    ```bash
    pnpm lint
    ```

## Struttura del Codice

Il progetto segue una struttura standard per le applicazioni Next.js:

```
/translator
├───.next/                 # Output della build di Next.js
├───node_modules/          # Dipendenze del progetto
├───public/                # Risorse statiche (immagini, font)
├───src/                   # Codice sorgente
│   ├───app/               # Next.js App Router (pagine, route API)
│   │   ├───api/           # Route API
│   │   │   └───translate/ # Endpoint API di traduzione DeepL
│   │   │       └───route.js
│   │   ├───auth/          # Pagine e route relative all'autenticazione
│   │   │   ├───callback/
│   │   │   │   └───route.js
│   │   │   ├───error/
│   │   │   │   └───page.jsx
│   │   │   ├───login/
│   │   │   │   └───page.jsx
│   │   │   └───oauth/
│   │   │       └───route.js
│   │   ├───favicon.ico
│   │   ├───globals.css    # Stili globali
│   │   ├───layout.jsx     # Componente di layout radice
│   │   └───page.jsx       # Pagina principale dell'applicazione
│   ├───components/        # Componenti React riutilizzabili
│   │   ├───login-form.jsx
│   │   ├───logout-button.jsx
│   │   ├───theme-provider.jsx
│   │   ├───translation/   # Componenti specifici della funzionalità di traduzione
│   │   │   ├───SavedPrompts.jsx
│   │   │   ├───TranslationForm.jsx
│   │   │   └───TranslationInput.jsx
│   │   └───ui/            # Componenti shadcn/ui (personalizzati)
│   │       ├───alert.jsx
│   │       ├───alert-dialog.jsx
│   │       ├───avatar.jsx
│   │       ├───button.jsx
│   │       ├───card.jsx
│   │       ├───command.jsx
│   │       ├───dialog.jsx
│   │       ├───error-boundary.jsx
│   │       ├───input.jsx
│   │       ├───label.jsx
│   │       ├───loading-spinner.jsx
│   │       ├───popover.jsx
│   │       ├───select.jsx
│   │       ├───tabs.jsx
│   │       └───textarea.jsx
│   └───lib/               # Funzioni di utilità, servizi e configurazioni
│       ├───constants.js   # Costanti globali (es. SUPPORTED_LANGUAGES)
│       ├───supabaseClient.js # Client Supabase per browser
│       ├───useAuth.js     # Hook personalizzato per lo stato di autenticazione
│       ├───utils.js       # Funzioni di utilità generali (es. `cn` per Tailwind)
│       ├───services/      # Livelli di servizio API
│       │   ├───auth-service.js
│       │   └───translation-service.js
│       └───supabase/      # Configurazioni lato server di Supabase
│           ├───middleware.js
│           └───server.js
├───.gitignore
├───components.json        # Configurazione shadcn/ui
├───eslint.config.mjs      # Configurazione ESLint
├───next.config.mjs        # Configurazione Next.js
├───package-lock.json
├───package.json
├───pnpm-lock.yaml
├───postcss.config.mjs     # Configurazione PostCSS
├───README.md              # Documentazione del progetto
└───jsconfig.json          # Configurazione JavaScript per importazioni assolute
```

## Decisioni Architetturali e Pattern di Design

*   **Next.js App Router:** Utilizzato per il suo routing basato su file system, i componenti server (ove applicabile) e le route API, fornendo un approccio strutturato e scalabile alla creazione di applicazioni web.
*   **Architettura Basata su Componenti (React):** L'interfaccia utente è suddivisa in componenti piccoli e riutilizzabili, promuovendo modularità, riutilizzabilità e una più facile manutenzione.
*   **Pattern del Livello di Servizio:** File di servizio dedicati (`src/lib/services/auth-service.js`, `src/lib/services/translation-service.js`) astraggono le chiamate API e la logica di business, separando le preoccupazioni dai componenti dell'interfaccia utente.
*   **Gestione dello Stato Centralizzata (React Hooks):** I hook `useState` e `useEffect` sono utilizzati per la gestione dello stato a livello di componente, mantenendo la logica dello stato vicina ai componenti che la utilizzano.
*   **Variabili d'Ambiente per i Segreti:** Tutte le chiavi API e le informazioni sensibili sono memorizzate in variabili d'ambiente, garantendo che non siano esposte nel codice.
*   **Importazioni Assolute:** Configurate utilizzando `jsconfig.json` per percorsi di importazione più puliti e manutenibili (es. `@/components/ui/button` invece di `../../components/ui/button`).
*   **`shadcn/ui` per i Componenti UI:** Sfruttato per i suoi componenti pre-costruiti, accessibili e personalizzabili, garantendo un'interfaccia utente/UX coerente e moderna con il minimo sforzo.
*   **Error Boundary:** Implementato per gestire elegantemente gli errori imprevisti nell'interfaccia utente, impedendo il crash dell'intera applicazione e fornendo una migliore esperienza utente.

## Miglioramenti Futuri ed Estensioni Potenziali

*   **Più Funzionalità di Traduzione:**
    *   **Rilevamento automatico della lingua di origine:** Integrare la funzionalità di rilevamento della lingua di DeepL per identificare automaticamente la lingua di origine.
    *   **Sintesi vocale:** Aggiungere la funzionalità per leggere il testo tradotto.
    *   **Cronologia delle traduzioni:** Implementare una cronologia delle traduzioni più persistente e ricercabile oltre ai soli prompt salvati.
*   **Gestione Utente:**
    *   **Profili utente:** Consentire agli utenti di gestire i propri profili (es. cambiare nome, email).
    *   **Più provider OAuth:** Aggiungere il supporto per altri provider di autenticazione (es. Google, Facebook).
*   **Ottimizzazioni delle Prestazioni:**
    *   **Debouncing dell'input di traduzione:** Implementare il debouncing sull'input di traduzione per ridurre il numero di chiamate API mentre l'utente digita.
    *   **Caching delle risposte DeepL:** Memorizzare nella cache le frasi tradotte frequentemente per ridurre le chiamate API e migliorare i tempi di risposta.
*   **UI/UX Avanzata:**
    *   **Temi:** Implementare opzioni di tema più estese oltre alla modalità scura/chiara.
    *   **Animazioni:** Aggiungere animazioni più sottili per migliorare l'interazione dell'utente.
*   **Test:** Implementare test unitari, di integrazione e end-to-end completi per garantire la stabilità dell'applicazione e prevenire regressioni.
*   **Automazione del Deployment:** Configurare pipeline CI/CD per test e deployment automatizzati.

## Sfide Incontrate e Soluzioni Implementate

*   **Refactoring da TypeScript a JavaScript:** La richiesta iniziale prevedeva una migrazione completa da TypeScript a JavaScript. Ciò ha richiesto un'attenta rimozione delle annotazioni di tipo, delle interfacce e della sintassi specifica di TypeScript, garantendo al contempo che il codice rimanesse funzionale e manutenibile. La sfida principale è stata garantire che tutti i problemi relativi ai tipi fossero risolti senza introdurre errori di runtime.
*   **Conflitti di Merge di Git:** Durante il processo di refactoring, sono sorti complessi conflitti di merge di Git a causa di modifiche simultanee su rami locali e remoti, in particolare con ridenominazioni ed eliminazioni di file (es. da `.ts` a `.js`). Questi sono stati risolti utilizzando sistematicamente `git pull --rebase` e `git checkout --ours`/`--theirs` per dare priorità alle modifiche desiderate e mantenere una cronologia Git pulita.
*   **Problemi di Risoluzione dei Moduli (Next.js/Turbopack):** Dopo la rimozione di TypeScript, la risoluzione dei moduli per le importazioni assolute (`@/`) è diventata problematica, portando a errori "Module not found". Questo è stato risolto configurando correttamente `jsconfig.json` e assicurandosi che la cache di Next.js (directory `.next`) fosse cancellata per forzare una nuova build.
*   **Mancata Corrispondenza dello Schema Supabase:** Un problema iniziale con il salvataggio delle traduzioni su Supabase è stato ricondotto a una mancata corrispondenza tra l'interfaccia `SavedPrompt` nel codice e i nomi effettivi delle colonne nella tabella `translation` di Supabase. Questo è stato risolto allineando la definizione dello schema del codice con il database.
*   **Mancata Corrispondenza dei Dati Linguistici:** L'interfaccia utente inviava codici lingua (es. "EN") ma il database memorizzava nomi di lingua (es. "Inglese"), portando a una visualizzazione errata. Questo è stato risolto garantendo che i codici lingua siano utilizzati in modo coerente in tutta la logica dell'applicazione e memorizzati nel database, e quindi convertiti in nomi visualizzabili solo nell'interfaccia utente.
*   **Scope e Inizializzazione di `useState`:** Un `ReferenceError` relativo alla variabile di stato `result` in `TranslationForm.jsx` è stato risolto integrando `result` direttamente nell'oggetto `state` principale, garantendo che sia sempre correttamente ambito e inizializzato.
*   **Integrazione di `shadcn/ui`:** L'integrazione dei componenti `shadcn/ui` ha richiesto un'attenta attenzione al loro utilizzo, ai tipi di prop e allo stile per garantire che si adattassero perfettamente alla configurazione Tailwind CSS esistente. Le sfide specifiche includevano l'implementazione corretta della combobox per la selezione della lingua e la garanzia di una corretta gestione dello stato per elementi interattivi come i pulsanti di copia e salvataggio.

## Metodologie di Test e Copertura

Attualmente, il progetto si basa su test manuali durante lo sviluppo. Per un'applicazione pronta per la produzione, verrebbero implementate le seguenti metodologie di test:

*   **Test Unitari:** Utilizzo di un framework come Jest o React Testing Library per testare singole funzioni e componenti in isolamento.
*   **Test di Integrazione:** Per verificare l'interazione tra diversi moduli e servizi (es. comunicazione client-server, interazioni Supabase).
*   **Test End-to-End:** Utilizzo di strumenti come Cypress o Playwright per simulare i flussi utente e garantire che l'intera applicazione funzioni come previsto dal punto di vista dell'utente.

## Riconoscimenti

*   **DeepL API:** Per aver fornito un servizio di traduzione di alta qualità.
*   **Supabase:** Per la piattaforma open-source backend-as-a-service.
*   **Next.js & React:** Per i potenti framework di sviluppo web.
*   **Tailwind CSS & shadcn/ui:** Per le eccellenti librerie di stile e componenti UI.
*   **Lucide React:** Per le icone belle e funzionali.
*   **Framer Motion:** Per la libreria di animazione intuitiva.