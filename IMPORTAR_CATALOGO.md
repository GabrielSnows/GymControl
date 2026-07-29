# Importação controlada da WorkoutX

## 1. Dependência

```bash
npm install @supabase/supabase-js
```

## 2. Variáveis em `.env.local`

```env
WORKOUTX_API_KEY=SUA_CHAVE_WORKOUTX
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_SECRET_KEY=SUA_CHAVE_SECRETA
```

## 3. Primeiro teste: somente uma requisição

O script usa **1 requisição por padrão**.

```bash
node --env-file=.env.local scripts/importWorkoutXCatalog.mjs
```

Depois confira no Supabase:

```text
Table Editor
→ exercises
```

Devem existir até 10 registros.

## 4. Continuar com limite controlado

Exemplo: até 20 requisições nesta execução.

### PowerShell

```powershell
$env:WORKOUTX_IMPORT_MAX_REQUESTS="20"
node --env-file=.env.local scripts/importWorkoutXCatalog.mjs
Remove-Item Env:WORKOUTX_IMPORT_MAX_REQUESTS
```

O script salva um checkpoint e continua do último offset.

## 5. Importação completa

Somente depois de confirmar o primeiro teste:

```powershell
$env:WORKOUTX_IMPORT_MAX_REQUESTS="160"
node --env-file=.env.local scripts/importWorkoutXCatalog.mjs
Remove-Item Env:WORKOUTX_IMPORT_MAX_REQUESTS
```

O script para automaticamente quando chega ao total informado pela API, recebe página incompleta/vazia ou alcança o limite definido.

## 6. Checkpoint

Arquivo criado automaticamente:

```text
scripts/.workoutx-import-checkpoint.json
```

Não apague durante a importação. Ele evita reiniciar do zero.

## 7. GIFs

O script não baixa arquivos GIF individualmente. Apenas armazena a URL presente no registro.
