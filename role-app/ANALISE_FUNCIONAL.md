# Análise funcional — atualização de 05/10/2026

## Parecer

O fluxo principal do MVP privado por link está funcional. No Render, foram confirmados login, painel, página de um rolê existente e moderação carregando normalmente. Também foram relatadas 24 verificações do servidor com banco real, cobrindo criação, votação, enquetes, moderação e expiração. Os registros de teste foram revertidos ao final, e o intervalo entre votos bloqueou a repetição imediata.

O bloqueio de conexão registrado na análise de 03/10 não representa mais o estado funcional confirmado no Render. Ainda há limitações de atualização dos resultados, contagem, identidade do participante, persistência de sessão e anonimato. O aplicativo está pronto para avançar na validação de um piloto privado, mas a navegação visual e o compartilhamento no navegador/celular ainda precisam ser verificados.

Esta atualização incorpora o relato de validação fornecido pelo responsável pelo projeto em 05/10/2026 e a leitura do código local. As 24 verificações e o acesso ao Render não foram repetidos nesta atualização; não há confirmação independente de que todas as migrations estejam aplicadas ou de que o código local seja idêntico ao deploy.

## Fluxo funcional atual

1. O criador entra com usuário e senha, acessa o painel e cria o rolê.
2. Compartilha o link com os participantes.
3. O participante entra com nome e avatar, sem precisar de conta.
4. Envia uma nota de 0 a 100, com sinal e anonimato opcionais. O termômetro considera o último voto de cada participante registrado; os sinais não alteram a média.
5. Responde enquetes rápidas e vota em sugestões de lugares.
6. O criador modera ou encerra o rolê. Depois do encerramento ou expiração, novas entradas e votos são bloqueados.

A regra do último voto vale por registro de participante. Como uma entrada repetida pode criar outro registro para a mesma pessoa, essa limitação ainda pode afetar a representatividade da média.

## Escopo e verificações

### Validação atual informada em 05/10/2026

- Render: login, painel, página de um rolê existente e moderação carregaram normalmente.
- Servidor com banco real: 24 verificações passaram, incluindo criação, votação, enquetes, moderação e expiração.
- O intervalo entre votos bloqueou a repetição imediata.
- Os registros usados nos testes foram revertidos ao final.
- Pendentes: navegação visual, copiar link e compartilhar pelo WhatsApp no navegador/celular.

### Evidências históricas da análise de 03/10/2026

Os itens abaixo registram o diagnóstico anterior. Os conjuntos locais não devem ser somados às 24 verificações atuais como se fossem casos independentes, e a falha de DNS abaixo não é um bloqueador atual confirmado no Render.

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
| Login do criador e proteção do painel | Login e painel confirmados no Render; proteção também verificada por HTTP na análise anterior. |
| Criação de rolê com código e informações do convite | Criação coberta pelas verificações relatadas com banco real; validações também examinadas anteriormente com banco simulado. |
| Local, endereço e link para Maps | Campos implementados e convite renderizado; não há confirmação de presença por GPS. |
| Entrada com nome e avatar | Integra o fluxo funcional informado; verificada anteriormente com banco simulado. Repetir a entrada ainda pode duplicar registros. |
| Nota de 0 a 100 e sinais opcionais | Votação coberta pelas verificações com banco real; repetição imediata bloqueada pelo intervalo. Sinais não alteram a média. |
| Média do último voto de cada participante | Regra do fluxo atual, com SQL usando `DISTINCT ON` por participante. Na análise anterior, notas 80 e 20 produziram 50; atualizar 80 para 100 produziu 60 em dados simulados. |
| Anonimato e comentário curto | Identidade ocultada no histórico; sinal de pessoa encarando força anonimato; intervalo de comentário sensível verificado. Há vazamentos indiretos descritos abaixo. |
| Enquetes rápidas e sugestões de lugar | Enquetes cobertas pelas verificações com banco real; sugestões integram o fluxo informado. Respostas, votos em sugestões e prevenção de duplicidade também verificados anteriormente com banco simulado. |
| Moderação | Página confirmada no Render e moderação coberta pelas verificações com banco real. Remoções e invalidação da sessão também verificadas anteriormente com banco simulado. |
| Encerramento manual, reabertura e expiração | Encerramento/expiração bloqueiam novas entradas e votos no fluxo informado; expiração coberta pelas verificações com banco real. Reabertura e resumo verificados anteriormente com banco simulado. |
| Link e convite para WhatsApp | Geração implementada; operação no navegador não verificada. |

## Problemas e prioridades

### 1. Bloqueador anterior superado no ambiente validado

A análise de 03/10 encontrou `ENOTFOUND` ao tentar acessar o banco configurado e HTTP 500 na página de rolê. A confirmação posterior no Render e as verificações com banco real demonstram que esse diagnóstico não deve continuar sendo apresentado como impedimento atual do fluxo principal.

Manter a conferência das migrations e da configuração por ambiente como tarefa operacional. A validação funcional relatada não equivale a uma auditoria completa da estrutura do banco.

### 2. Segurança base implementada localmente; sessões ainda em memória

A Fase 24 recebeu implementação local em 05/10: configuração obrigatória de credenciais e segredo em produção, limites de tentativas de login/interações, token CSRF nos formulários, renovação de sessão no login/logout, limites de tamanho e validação de campos, códigos e identificadores, além de cabeçalhos de segurança. As credenciais atuais do Render não foram auditadas; o deploy passa a exigir senha própria de pelo menos 12 caracteres e segredo de pelo menos 32 caracteres. Configuração ausente ou valores de exemplo impedem a inicialização em produção.

O armazenamento de sessões continua sendo o `MemoryStore` padrão do `express-session`, sem persistência. Reiniciar o servidor perde os vínculos dos participantes e o login; múltiplas instâncias não compartilham essas sessões. Os contadores de limitação também ficam em memória por processo. A Fase 41 foi adiada pelo responsável pelo projeto enquanto se define a retenção dos dados após o encerramento. A exclusão dos dados não foi implementada: o resumo atual depende dos registros mantidos no banco.

Pontos positivos: `.env` está ignorado e não está versionado no estado examinado; consultas usam parâmetros; conteúdo variável das views usa escape EJS; cookies possuem `httpOnly` e `sameSite: lax`. O cookie seguro depende de `NODE_ENV=production`. Ainda falta validar no Render o HTTPS, o IP recebido pelo proxy e as permissões do usuário do banco para concluir operacionalmente a Fase 24.

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

### 7. Corrigido localmente: validação de nota vazia

A validação agora exige texto numérico correspondente a uma nota inteira de 0 a 100 antes da conversão. Nota vazia, espaços, valores fracionários e valores fora da faixa são rejeitados. Notas explícitas 0 e 100 continuam válidas. A correção foi verificada por HTTP com banco simulado; ainda depende de deploy.

### 8. Parcial: configurações do rolê

A fase 36 está marcada como concluída, mas a implementação permite tipo, descrição, regras e aviso fixado apenas na criação. Não existem controles por rolê para duração, comentários, sinais sensíveis, intervalo de voto, exigência de localização ou visibilidade. Não há rota para editar o convite/aviso depois da criação.

A duração e o intervalo de voto são globais por variável de ambiente. A validação atual informou bloqueio da repetição imediata. Na análise anterior, os testes gerais de interação desativaram o intervalo apenas no processo isolado; o intervalo sensível de comentário foi testado separadamente.

### 9. Menor: validação de Maps, texto e documentação

- O campo de Maps aceita qualquer URL HTTP/HTTPS, inclusive domínios que não são de mapas (`server.js:160`). A rejeição de protocolos como `javascript:` funciona.
- Há texto com caracteres corrompidos em `views/role.ejs:114`: “VocÃª estÃ¡ no rolÃª como”.
- O aviso de encerramento afirma que o link ficou aberto por 24 horas até quando foi encerrado manualmente antes disso. A duração pode ser alterada globalmente, mas as mensagens continuam fixas em 24 horas.
- O README descreve somente três tabelas; o schema atual tem cinco e não documenta o login/configurações recentes nem aplicação das migrations em bancos existentes. `CREATE TABLE IF NOT EXISTS` sozinho não adiciona colunas às tabelas antigas.
- A migration 007 muda os defaults dos horários, mas não converte registros históricos. Convém conferir os dados antigos, pois a aplicação interpreta strings TIMESTAMP como horário de São Paulo ao calcular expiração e intervalos.
- Há script `npm test` para as proteções da Fase 24, com banco simulado. Ainda não há scripts de lint ou migration no `package.json`.
- O criador é um administrador global único. Não existe vínculo de propriedade de rolê com usuário no schema; o painel consulta todos os rolês. Um produto com vários criadores exige essa camada adicional.

## Próximo foco recomendado, com base no FASES.md

A ordem numérica das fases não deve ser tratada como ordem obrigatória de execução. Agora que o fluxo principal funciona, a prioridade é estabilizar o uso privado antes de ampliar funcionalidades ou distribuição.

| Ordem | Trabalho | Relação com as fases | Critério de conclusão |
| --- | --- | --- | --- |
| 1 | Corrigir anonimato por horários e concluir a segurança base: configuração obrigatória de credenciais/segredo em produção, limite de tentativas de login, proteção das operações que alteram dados e rejeição de nota vazia. | Fase 24; revisão das fases 34 e 39; Fase 49 para privacidade social. | Horários públicos não associam voto anônimo a participante; entradas inválidas são rejeitadas; proteções de autenticação verificadas. |
| 2 | Persistir sessões e reutilizar o participante existente ao repetir a entrada no mesmo navegador. | Fase 41. | Reinício/deploy preserva a sessão dentro da validade configurada; reenviar a entrada não cria outro registro nem dá peso extra à mesma sessão na média. |
| 3 | Corrigir a contagem de avaliações no painel, distinguindo total de avaliações e pessoas que avaliaram. Pode ser uma correção pequena já no primeiro lote. | Correção da Fase 26; base para as fases 42 e 52. | Três participantes com três avaliações mostram três avaliações; novo voto aumenta o histórico sem aumentar o número de pessoas que avaliaram. |
| 4 | Atualizar termômetro, resultados e status sem exigir recarga manual. Começar com consulta periódica simples; definir o intervalo após observar o uso. | Evolução das fases 8, 23, 32 e 39; apoio à Fase 42. | Um segundo navegador recebe alterações automaticamente, respeitando a privacidade dos sinais e o encerramento do rolê. |
| 5 | Validar um ciclo completo no celular e em dois navegadores, incluindo copiar link, WhatsApp, avatar, votação, moderação e encerramento. | Revisão das fases 9, 10, 14 e 53. | Fluxo utilizável em aparelhos reais, com compartilhamento e comportamento de sessão conferidos. |

A validação visual pode começar em paralelo às correções; não precisa esperar novas funcionalidades. Antes da atualização automática, definir como ocultar horários e atividade ligados a votos anônimos. A Fase 49 propõe atraso aleatório e ocultação do horário exato para reduzir identificação social; apenas atrasar a exibição, mantendo horários correlacionáveis, não resolve o problema. Sinais de segurança precisam de uma decisão explícita sobre o equilíbrio entre privacidade e rapidez de resposta.

Para um piloto com conhecidos, o próximo pacote recomendado reúne segurança/anonimato, sessão persistente, prevenção de entrada duplicada e contagem correta. Depois, atualização automática e conclusão da validação mobile. Domínio próprio (16), pagamento (28), vitrine (35), localização em tempo real (38), expansão pública/comercial (43–46) e novos avatares/frases (48, 54 e 55) podem esperar a estabilização desse núcleo.

## Ajustes de leitura do planejamento

- A Fase 27 está marcada como concluída, mas o vínculo de propriedade entre rolê e usuário criador continua pendente para múltiplos criadores. O modelo atual é de administrador global único.
- A Fase 36 está parcialmente implementada: há informações do convite na criação, mas faltam os controles por rolê descritos no planejamento.
- As fases 34 e 39 precisam ser revistas em conjunto por causa da identificação indireta por horários.
- As fases 49, 50, 51 e 52 têm descrição no FASES.md, mas não aparecem no resumo de próximas fases. A Fase 49 deve entrar no planejamento imediato de privacidade.
- Enquetes rápidas existentes (Fase 32) não equivalem à Fase 37 completa, que prevê decisões destacadas com prazo e resultado registrado.

## Decisão posterior e execução da Fase 24

Após a atualização inicial deste relatório, o responsável autorizou implementar a Fase 24 e adiou as fases 34 e 41. A Fase 49 segue em discussão: atraso fixo de um minuto não elimina dedução de autoria por observação do grupo. A proposta de sinais agrupados, sem horários individuais, ainda não foi implementada.

Foram alterados servidor, módulo de segurança, formulários, configuração de exemplo, testes e documentação para a Fase 24. Quatro testes automatizados passaram, incluindo um cenário HTTP com múltiplas verificações de login, CSRF, validações, limitação e votação. Não houve deploy ou acesso ao banco real. A Fase 24 permanece aberta para validação operacional no Render/Supabase. A ordem recomendada acima registra o parecer inicial; a execução atual segue a decisão posterior do responsável.

## Novo repertório de sinais — Fase 54

Em seguida, o responsável solicitou substituir todos os sinais selecionáveis. O catálogo local agora tem 26 frases em Chegada, Saída, Ambiente, Grupo e Cuidado, definidas em `signals.js`. Enquetes, sugestões de lugar, comentários e regras existentes de anonimato foram adaptados ao novo repertório. Os registros antigos permanecem legíveis e suas enquetes continuam funcionando; novos votos não aceitam os sinais antigos.

Os sinais continuam sendo enviados junto da nota e sujeitos ao intervalo geral de voto. Para permitir avisos de chegada/saída sem reenviar uma avaliação, será necessária uma evolução separada do fluxo. Os testes HTTP com banco simulado passaram após a alteração; publicação e validação visual ainda estão pendentes.
