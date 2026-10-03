# Análise funcional — 03/10/2026

## Parecer

O projeto tem os principais fluxos implementados para um MVP privado por link. Porém, na configuração examinada, não está funcional de ponta a ponta: o endereço do banco configurado não resolveu (`ENOTFOUND`) e a página de rolê respondeu HTTP 500. Há também erros de contagem e limitações de segurança, privacidade e sessão a corrigir antes de ampliar o uso.

Este parecer considera o código atual, incluindo alterações locais ainda não commitadas. Não confirma o estado do deploy no Render.

## Escopo e verificações

- Leitura do servidor, JavaScript do navegador, CSS, todas as views, schema SQL, dez migrations, documentação e dependências instaladas.
- Verificação de sintaxe de `server.js` e `public/app.js`: passou.
- Compilação das seis views EJS: passou.
- Dependências diretas instaladas e reconhecidas por `npm.cmd ls --depth=0`.
- Dois conjuntos de verificações locais: 27 verificações iniciais passaram; o segundo conjunto passou em 28 verificações. Há sobreposição entre os conjuntos.
- As verificações de criação, entrada e interações usaram um substituto do PostgreSQL em memória, com requisições HTTP ao Express real e renderização EJS real. Não validam execução das consultas no PostgreSQL, migrations aplicadas ou persistência real. Nenhum dado foi gravado no banco configurado.
- Com a configuração real: login HTTP 200; painel sem autenticação HTTP 302; CSS, JavaScript e avatar HTTP 200; página de rolê HTTP 500 com erro `ENOTFOUND`.
- A tentativa de consultar somente a estrutura e contagens do banco falhou por DNS, tanto no ambiente restrito quanto na repetição fora dele. Não foi possível verificar quais migrations estão aplicadas.
- Não houve validação visual em navegador, em aparelhos reais, do clipboard ou do compartilhamento no WhatsApp. Não foi realizada auditoria de vulnerabilidades das dependências.

## Funcionalidades implementadas

| Recurso | Evidência / limite |
| --- | --- |
| Login do criador e proteção do painel | Verificados por HTTP local. |
| Criação de rolê com código e informações do convite | Criação e validações verificadas com banco simulado. |
| Local, endereço e link para Maps | Campos implementados e convite renderizado; não há confirmação de presença por GPS. |
| Entrada com nome e avatar | Verificada com banco simulado; as 17 imagens referenciadas existem. |
| Nota de 0 a 100 e sinais opcionais | Verificados com banco simulado. Sinais não alteram a média. |
| Média do último voto de cada participante | Verificada em dados simulados: notas 80 e 20 produziram 50; atualizar 80 para 100 produziu 60. SQL usa `DISTINCT ON` por participante. |
| Anonimato e comentário curto | Identidade ocultada no histórico; sinal de pessoa encarando força anonimato; intervalo de comentário sensível verificado. Há vazamentos indiretos descritos abaixo. |
| Enquetes rápidas e sugestões de lugar | Respostas, votos em sugestões, bloqueio do próprio autor e prevenção de resposta duplicada verificados com banco simulado. |
| Moderação | Renderização, remoção de avaliação/participante e invalidação da sessão do participante removido verificadas com banco simulado. |
| Encerramento manual, reabertura e expiração | Bloqueio de entrada/voto e resumo para participante existente verificados com banco simulado. |
| Link e convite para WhatsApp | Geração implementada; operação no navegador não verificada. |

## Problemas e prioridades

### 1. Bloqueador: banco inacessível nesta configuração

A conexão depende de `DATABASE_URL`. A tentativa real retornou `ENOTFOUND`, e `GET /role/AUDIT1` retornou HTTP 500 antes de poder procurar o código. O servidor consegue iniciar e servir login/arquivos mesmo quando o banco está indisponível.

É necessário conferir a connection string e a disponibilidade/resolução do host do PostgreSQL/Supabase. Após restabelecer a conexão, verificar as tabelas, colunas e migrations antes de concluir que o aplicativo funciona com dados reais.

### 2. Alta: credencial de exemplo e sessões frágeis para produção

A configuração local ainda usa uma senha de exemplo para o criador; o valor não foi reproduzido neste relatório. O servidor também assume credencial padrão e segredo de sessão padrão se as variáveis estiverem ausentes (`server.js:16–17` e `server.js:116`).

Não há limitação de tentativas de login. O armazenamento de sessões é o `MemoryStore` padrão do `express-session`, sem persistência. Reiniciar o servidor perde os vínculos dos participantes e o login; múltiplas instâncias não compartilham essas sessões. Não há regeneração de sessão ao autenticar, nem validação explícita de token CSRF ou origem nas operações que alteram dados.

Pontos positivos: `.env` está ignorado e não está versionado no estado examinado; consultas usam parâmetros; conteúdo variável das views usa escape EJS; cookies possuem `httpOnly` e `sameSite: lax`. O cookie seguro depende de `NODE_ENV=production`.

### 3. Alta: anonimato permite associação indireta

`getRoleParticipants` calcula a última interação com `MAX(v.criado_em)` sem excluir votos anônimos (`server.js:307`). A lista pública de participantes exibe nome e esse horário, enquanto o histórico exibe o horário do voto anônimo (`views/role.ejs`). Em grupos pequenos, a combinação permite deduzir quem enviou o sinal.

Para enquetes anônimas, os botões ficam desabilitados especificamente para o autor, pois a view compara `voto.participante_id` com o participante atual. Isso também permite distinguir o próprio sinal. O banco mantém o vínculo com a identidade, portanto a anonimização atual é de apresentação.

### 4. Média: contador de avaliações incorreto no painel

Em `getCreatorRoles` (`server.js:208–222`), participantes e votos são unidos separadamente ao mesmo rolê. `COUNT(v.id)` conta cada voto uma vez por participante. Exemplo: 3 participantes e 3 avaliações produzem 9 avaliações no painel.

A reprodução em memória confirmou o valor exibido segundo essa multiplicação; a causa também é identificável diretamente na consulta. Corrigir com contagem distinta de votos ou agregações separadas.

### 5. Média: histórico não atualiza automaticamente

A página diz “Ao vivo”, mas não há polling, SSE, WebSocket ou recarga automática. Outra pessoa só vê as novas notas/sinais quando recarrega ou realiza uma interação que redireciona à página.

### 6. Média: entrada repetida duplica participante

`POST /role/:codigo/entrar` sempre executa `INSERT INTO participantes`, mesmo se já existir vínculo válido na sessão (`server.js:923–956`). A repetição foi reproduzida. A sessão passa a apontar para o novo registro, mas o antigo e seus votos permanecem, podendo dar peso extra ao mesmo usuário na média.

Remover um participante invalida seu registro/sessão, mas não constitui banimento: ele pode entrar novamente com o link.

### 7. Média: validação aceita nota vazia como zero

`normalizeScore` faz `Number(value)` (`server.js:395`). `Number('')` e espaços retornam zero. Uma requisição com `nota=` é aceita como nota 0, embora não haja escolha válida explícita. A interface usual envia o range, mas a validação do servidor deve rejeitar entradas vazias.

### 8. Parcial: configurações do rolê

A fase 36 está marcada como concluída, mas a implementação permite tipo, descrição, regras e aviso fixado apenas na criação. Não existem controles por rolê para duração, comentários, sinais sensíveis, intervalo de voto, exigência de localização ou visibilidade. Não há rota para editar o convite/aviso depois da criação.

A duração e o intervalo de voto são globais por variável de ambiente. A configuração examinada ativa o intervalo de voto; os testes gerais de interação o desativaram apenas no processo isolado. O intervalo sensível de comentário foi testado separadamente.

### 9. Menor: validação de Maps, texto e documentação

- O campo de Maps aceita qualquer URL HTTP/HTTPS, inclusive domínios que não são de mapas (`server.js:160`). A rejeição de protocolos como `javascript:` funciona.
- Há texto com caracteres corrompidos em `views/role.ejs:114`: “VocÃª estÃ¡ no rolÃª como”.
- O aviso de encerramento afirma que o link ficou aberto por 24 horas até quando foi encerrado manualmente antes disso. A duração pode ser alterada globalmente, mas as mensagens continuam fixas em 24 horas.
- O README descreve somente três tabelas; o schema atual tem cinco e não documenta o login/configurações recentes nem aplicação das migrations em bancos existentes. `CREATE TABLE IF NOT EXISTS` sozinho não adiciona colunas às tabelas antigas.
- A migration 007 muda os defaults dos horários, mas não converte registros históricos. Convém conferir os dados antigos, pois a aplicação interpreta strings TIMESTAMP como horário de São Paulo ao calcular expiração e intervalos.
- Não há scripts de testes, lint ou migration no `package.json`.
- O criador é um administrador global único. Não existe vínculo de propriedade de rolê com usuário no schema; o painel consulta todos os rolês. Um produto com vários criadores exige essa camada adicional.

## O que falta para confirmar o MVP

1. Resolver a conexão real do PostgreSQL e verificar/aplicar as migrations necessárias.
2. Substituir a senha de exemplo e exigir configuração de autenticação/sessão adequada ao ambiente.
3. Corrigir contagem do painel, nota vazia, entrada duplicada e associação indireta de votos anônimos.
4. Decidir e implementar a atualização automática entre participantes, se a experiência deve ser ao vivo.
5. Validar um ciclo completo com banco real em ambiente de teste: login, criação, dois participantes, atualização de nota, anonimato, enquete, sugestão, moderação e encerramento.
6. Conferir o fluxo visual no celular e o comportamento de sessões após reinício/deploy.

Não foram alterados arquivos de implementação nem dados reais durante a análise. Este relatório é o único arquivo adicionado.
