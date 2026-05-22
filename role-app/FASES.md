# role-app - Registro de fases

## Visao do projeto

O `role-app` e um MVP web responsivo para grupos privados medirem o clima de um role por link. Uma pessoa cria o role, compartilha o link, os amigos entram com nome ou apelido, votam no clima e acompanham o termometro geral.

A primeira versao nao tem parte publica para bares, eventos, mapa, pagamento ou app nativo. A ideia agora e validar o uso em grupos pequenos antes de abrir para estabelecimentos ou eventos publicos.

## Fases finalizadas em ordem real

- [x] Fase 1 - Configuracao base
- [x] Fase 2 - Banco PostgreSQL/Supabase
- [x] Fase 3 - Conexao com banco
- [x] Fase 4 - Tela inicial
- [x] Fase 5 - Entrar no role
- [x] Fase 6 - Votacao inicial
- [x] Fase 7 - Anonimato opcional
- [x] Fase 8 - Termometro inicial
- [x] Fase 9 - Link compartilhavel
- [x] Fase 10 - Visual mobile
- [x] Fase 11 - Tela de erro
- [x] Fase 12 - README
- [x] Fase 13 - Base pronta para Render
- [x] Fase 14 - Teste final local com Supabase
- [x] Fase 22 - Trava de voto por intervalo preparada
- [x] Fase 23 - Historico e horarios
- [x] Fase 17 - Redesenhar o termometro
- [x] Fase 18 - Separar frases do termometro
- [x] Fase 19 - Nova tela de avaliacao
- [x] Fase 20 - Repertorio de frases
- [x] Fase 32 - Sinais com votacao rapida
- [x] Fase 31 - Expiracao automatica do role em 24h
- [x] Fase 33 - Comentario curto em sinais especiais
- [x] Fase 34 - Sinais de seguranca e privacidade
- [x] Fase 25 - Login do criador
- [x] Fase 26 - Area do criador
- [x] Fase 27 - Controle de criacao de roles
- [x] Fase 21 - Avatar do participante
- [x] Fase 47 - Avatares com imagens proprias

## Proximas fases

### MVP de grupo interno

Fases para deixar o app forte como ferramenta privada de grupo antes de virar avaliacao publica de lugares.

- [ ] Fase 24 - Seguranca base
- [ ] Fase 36 - Configuracoes do role
- [ ] Fase 37 - Decisoes importantes do grupo
- [ ] Fase 30 - Localizacao do role
- [ ] Fase 38 - Localizacao em tempo real opcional
- [ ] Fase 39 - Participantes ativos
- [ ] Fase 40 - Moderacao simples do criador
- [ ] Fase 41 - Sessao persistente
- [ ] Fase 42 - Painel detalhado do role
- [ ] Fase 48 - Criador de avatar por camadas

### MVP funcional e expansao

Fases para deixar o produto pronto para uso mais amplo, dominio, pagamento e, depois, avaliacao de lugares.

- [ ] Fase 15 - Publicar no Render
- [ ] Fase 16 - Dominio proprio
- [ ] Fase 28 - Pagamento e planos
- [ ] Fase 29 - Modo pub e ambiente fechado
- [ ] Fase 35 - Vitrine de roles com previa
- [ ] Fase 43 - Roles publicos e privados
- [ ] Fase 44 - Avaliacao de lugares
- [ ] Fase 45 - Ranking e pagina de lugar
- [ ] Fase 46 - Regras comerciais para estabelecimentos

## Fases originais

### Fase 1 - Configuracao base

Criar projeto Node.js com Express, EJS, dotenv, pg, express-session, pasta `public`, pasta `views`, scripts `start` e `dev`.

### Fase 2 - Banco PostgreSQL/Supabase

Criar `database.sql` com tabelas `roles`, `participantes` e `votos`, relacionamentos e indices.

### Fase 3 - Conexao com banco

Configurar `pg.Pool`, `DATABASE_URL`, SSL para Supabase/Render e tratamento de erros nas rotas.

### Fase 4 - Tela inicial

Criar a home com formulario para nome do role e rota `POST /roles` para gerar codigo curto e salvar no banco.

### Fase 5 - Entrar no role

Criar pagina do role por codigo, formulario de nome/apelido e sessao do participante.

### Fase 6 - Votacao

Criar botoes de status e rota `POST /role/:codigo/votar`.

### Fase 7 - Anonimato opcional

Permitir voto anonimo, com confirmacao em status sensiveis.

### Fase 8 - Termometro do role

Calcular media geral considerando apenas o voto mais recente de cada participante.

### Fase 9 - Link compartilhavel

Mostrar link completo do role baseado no host atual e botao de copiar.

### Fase 10 - Visual mobile

Criar layout responsivo, com largura maxima de app mobile, cards, botoes grandes e CSS puro.

### Fase 11 - Tela de erro

Criar tela amigavel para role nao encontrado, nome vazio, falhas inesperadas e voto sem entrar.

### Fase 12 - README

Documentar projeto, stack, como rodar localmente, Supabase, Render e escopo do MVP privado.

### Fase 13 - Deploy no Render

Garantir `process.env.PORT`, `DATABASE_URL`, `SESSION_SECRET`, `.env` fora do GitHub, `.env.example` versionado e link sem localhost fixo.

### Fase 14 - Teste final

Testar instalacao, start, home, criacao de role, entrada, voto, anonimato, termometro, link compartilhavel, botao copiar e preparo para deploy.

## Fases novas propostas

### Fase 15 - Publicar no Render

Subir o projeto para GitHub, conectar no Render, configurar variaveis de ambiente e testar a URL `.onrender.com`.

### Fase 16 - Dominio proprio

Comprar um dominio, adicionar em Custom Domains no Render, configurar DNS e validar HTTPS.

### Fase 17 - Redesenhar o termometro

Trocar o termometro atual por uma nota direta de 0 a 100. A pessoa escolhe a nota do role, e essa nota passa a ser a unica coisa que influencia o termometro.

### Fase 18 - Separar frases do termometro

Transformar as frases em sinais/contexto do role. Elas servem para entender o que esta acontecendo, mas nao alteram a nota geral.

### Fase 19 - Nova tela de avaliacao

Criar uma tela com nota de 0 a 100, frases de contexto, anonimato e um botao final para enviar a avaliacao.

### Fase 20 - Repertorio de frases

Aumentar as frases por categorias: clima bom, role parado, after, mudanca de lugar, desconforto, seguranca, logistica e energia do grupo.

Lista atual:

- Divou
- Ta rendendo
- Role entregou
- Clima bom
- Ta meio parado
- Deu uma caída
- Bora pra pista
- Vamo rodar
- Bora trocar de canto
- Vamo pegar bebida
- Rodada de dose
- Vamo dar um tapa na pantera
- Bebida ta cara
- A procura de after
- Onde e o after?
- Muito cheio
- To desconfortavel
- Tem uma pessoa me encarando
- Embora?
- Quero ir embora
- Banheiro ta impossivel

### Fase 21 - Avatar do participante

Permitir que a pessoa escolha um avatar simples ao entrar no role. O avatar pode representar a pessoa sem precisar de foto real.

### Fase 22 - Trava de voto por intervalo

Ativar, quando fizer sentido, uma regra para impedir voto repetido em menos de 10 minutos. A estrutura ja fica preparada por variavel de ambiente.

### Fase 23 - Historico e horarios

Mostrar horario das avaliacoes e melhorar a leitura do historico recente do role.

### Fase 24 - Segurança base

Revisar seguranca antes de abrir para mais pessoas. Pontos principais:

- manter `.env` fora do GitHub;
- usar `SESSION_SECRET` forte;
- garantir HTTPS no Render/dominio;
- validar todos os formularios no servidor;
- limitar tamanho de nomes, frases e entradas;
- proteger rotas sensiveis;
- evitar mostrar erros tecnicos para usuarios;
- revisar permissoes do banco no Supabase;
- pensar em limite de tentativas e protecao contra spam.

### Fase 25 - Login do criador

Criar login apenas para quem pode criar roles. Participantes continuam entrando pelo link sem conta, mas a pagina de criar role fica protegida.

Opcoes possiveis:

- login simples com usuario e senha para o dono/admin;
- login com Google;
- login magico por e-mail;
- autenticação pelo Supabase Auth.

Para o MVP pago, a recomendacao inicial e proteger a criacao de roles com login do criador. Assim, se alguem apagar o codigo da URL e cair na home, nao consegue criar um novo role sem estar logado.

### Fase 26 - Area do criador

Criar uma area privada para o criador:

- criar novo role;
- ver roles criados;
- copiar links;
- encerrar role;
- acompanhar historico basico;
- futuramente ver status de pagamento/plano.

### Fase 27 - Controle de criacao de roles

Impedir que qualquer visitante crie roles. A regra passa a ser:

- visitante pode entrar e votar se tiver link valido;
- visitante sem link nao cria role;
- apenas usuario logado/autorizado cria role;
- roles ficam vinculados ao usuario criador.

### Fase 28 - Pagamento e planos

Planejar monetizacao. Possiveis modelos:

- criador paga para criar roles ilimitados por mes;
- compra avulsa de um role;
- plano gratuito limitado para testes;
- cupom ou acesso manual para pilotos.

Antes de implementar pagamento real, validar o fluxo com acesso manual ou uma flag no banco, para testar o produto sem complexidade desnecessaria.

### Fase 29 - Modo pub e ambiente fechado

Criar uma variacao mais propria para pub, bar, festa fechada ou ambiente fechado. A ideia e manter o MVP privado por link, mas com frases e sinais mais adequados para esse tipo de role.

Exemplos de frases:

- Vamo pegar bebida
- Vamo rodar
- Rodada de dose
- Bora pra pista
- Mesa ta boa
- Fila ta osso
- Som ta bom
- Som ta estranho
- Ta cheio demais
- Ta vazio demais
- Bora fumar um ar
- Banheiro ta impossivel
- Atendimento ta suave
- Bebida ta cara
- Galera chegou
- Chama mais gente
- After daqui a pouco
- Bora trocar de canto

Essa fase tambem pode separar frases por contexto: bebida, pista, mesa, fila, banheiro, seguranca, preco, musica e after.

### Fase 30 - Localizacao do role

Permitir que o criador adicione localizacao ao cadastrar o role.

Possibilidades:

- campo manual com nome/endereco do local;
- link do Google Maps colado pelo criador;
- busca de lugares via Google Places API;
- mapa embutido na pagina do role;
- botao para abrir rota no Google Maps/Waze.
foco em decisoes rapidas;
interface simples e objetiva;
idealmente a pessoa vota antes de continuar usando o role.
Atualizacao da Fase 30 - Localizacao do role

Permitir validacao opcional por proximidade fisica do role.

Possibilidades:

criador define um raio aproximado:
20m;
50m;
100m;
participante precisa estar proximo do local para votar;
Objetivos:

reduzir votos aleatorios;
confirmar presenca no role;
evitar invasao por link compartilhado fora do contexto;
melhorar confiabilidade do termometro.

Para comecar, a melhor opcao e aceitar um nome do local e um link do Google Maps. Isso evita complexidade, reduz custo e ja resolve o uso real. Depois, se fizer sentido, integrar Google Places API para buscar o local direto dentro do app.

Pontos de atencao:

- Google Maps/Places pode exigir chave de API e configuracao de cobranca;
- nao expor a localizacao precisa de pessoas, apenas do local do role;
- validar links para evitar abuso;
- deixar a localizacao opcional.


### Fase 31 - Expiracao automatica do role

Encerrar o role automaticamente depois de 24 horas. Depois desse prazo:

- o link ainda pode mostrar o resumo;
- novos participantes nao entram;
- novos votos nao sao aceitos;
- o historico continua disponivel para consulta;
- futuramente pode haver limpeza fisica do banco depois de alguns dias.

No MVP, a recomendacao e encerrar primeiro sem apagar fisicamente. Apagar do banco pode vir depois, com uma rotina agendada no Render/Supabase.

### Fase 32 - Sinais com votacao rapida

Alguns sinais deixam de ser apenas contexto e passam a abrir uma votacao rapida entre os participantes. Essa votacao nao muda a nota do termometro.

Exemplos:

- Vamo pegar bebida
  - Vamo
  - Agora nao, irmao
- Embora?
  - Vamo
  - Agora nao, irmao
- Onde e o after?
  - Bora achar
  - Todo mundo ir dormir e o after

Essas respostas devem aparecer como contagem simples para o grupo, sem virar chat.

### Fase 33 - Comentario curto em sinais especiais

Permitir comentario curto apenas em alguns sinais, com limite de 20 a 30 caracteres. A ideia e dar contexto sem transformar o app em chat.

Sinais com comentario curto:

- Onde e o after?
- A procura de after
- Tem uma pessoa me encarando

Regras:

- comentario opcional;
- limite curto;
- mostrar junto do sinal;
- um comentario por participante a cada 5 minutos em sinais sensiveis;
- manter a trava geral de interacao em 10 minutos quando estiver ativada.

### Fase 34 - Sinais de seguranca e privacidade

Tratar sinais delicados com mais cuidado, especialmente:

- Tem uma pessoa me encarando
- To desconfortavel
- Quero ir embora

Regras desejadas:

- sugerir anonimato;
- permitir comentario curto;
- limitar repeticao para evitar spam;
- destacar no historico sem expor a pessoa quando anonimo;
- pensar em botao futuro de "preciso de ajuda" para grupos fechados.

### Fase 35 - Vitrine de roles com previa

Criar uma pagina com varios roles disponiveis. Antes de entrar, a pessoa consegue ver uma previa do que esta acontecendo.

Ideia da tela:

- lista de roles ativos;
- nome do role;
- local, quando existir;
- termometro atual;
- quantidade de pessoas que votaram;
- sinais/comentarios recentes;
- status de encerramento;
- botao para entrar no role.

Essa fase muda um pouco o produto: deixa de ser apenas link privado e comeca a parecer uma vitrine de roles. Por isso deve vir depois de decidir regras de privacidade, criador logado, pagamento e quais roles podem aparecer publicamente.

Regras importantes:

- role privado nao aparece na vitrine;
- role publico/aprovado aparece;
- comentarios anonimos continuam anonimos;
- sinais sensiveis devem ser resumidos com cuidado;
- antes de entrar, a pessoa ve o clima, mas nao interage.

### Fase 36 - Configuracoes do role

Permitir que o criador configure o role em vez de tudo ser pre-definido.

Configuracoes iniciais:

- duracao do role: 2h, 6h, 12h, 24h;
- permitir ou nao comentarios curtos;
- permitir ou nao sinais sensiveis;
- ativar ou desativar trava de voto;
- escolher se o role exige localizacao para votar;
- escolher se o role aparece apenas por link ou em uma lista futura;
- encerrar manualmente.

Essa fase deixa o app mais flexivel para testar diferentes tipos de grupo.

### Fase 37 - Decisoes importantes do grupo

Criar votacoes importantes que aparecem com destaque para todos no role.

Exemplos:

- Vamos embora?
- Vamos procurar um after?
- Vamos para outro lugar?
- Vamos fechar a conta?

Regras:

- criador ou sinal forte pode abrir a decisao;
- votacao possui tempo limite:

5 minutos;
10 minutos;
20 minutos; 
quem crioe a enquete que decide o tempo que vai ficar aberta
- quem entra durante a decisao ve a votacao em destaque;
- idealmente a pessoa precisa votar antes de continuar usando o role;
- resultado fica registrado no historico;
- cada participante vota uma vez e nao troca.
Resultados possiveis:

aprovado;
flopou;
empate.
foco em decisoes rapidas;
interface simples e objetiva;
idealmente a pessoa vota antes de continuar usando o role.

Essa fase e diferente dos sinais rapidos: ela funciona como uma decisao coletiva do grupo.



### Fase 38 - Localizacao em tempo real opcional

Permitir que o participante compartilhe localizacao aproximada ou em tempo real durante o role.

Objetivos:

- ajudar a confirmar que a pessoa esta no local;
- reduzir voto aleatorio de gente fora do role;
- facilitar encontrar o grupo em ambiente grande;
- futuramente permitir "estou perto" ou "cheguei".

Cuidados:

- pedir permissao clara no navegador;
- deixar opcional no MVP;
- nunca mostrar localizacao precisa publicamente;
- permitir ao criador exigir localizacao para votar, se fizer sentido;
- guardar o minimo possivel;
- evitar mapa em tempo real publico no inicio.

Complexidade:

- localizacao simples no navegador e viavel;
- mapa em tempo real de todo mundo da mais trabalho;
- exigir presenca por raio do local depende da Fase 30, com local do role definido.

Sugestao para MVP: comecar com "confirmar presenca" usando geolocalizacao do navegador, sem mapa ao vivo.

### Fase 39 - Participantes ativos

Mostrar quem esta no role e quem interagiu recentemente.

Ideias:

- lista de participantes com avatar;
- ultimo horario de atividade;
- contador de pessoas no role;
- separar ativos e inativos;
- nao mostrar dados sensiveis.

### Fase 40 - Moderacao simples do criador

Permitir ao criador controlar o role durante o uso.

Funcoes:

- encerrar role;
- ocultar sinal/comentario;
- remover participante problemático;
- limpar historico do role;
- copiar link rapidamente.

### Fase 41 - Sessao persistente

Melhorar a permanencia do participante.

Hoje o participante depende do cookie/sessao do navegador. Essa fase melhora:

- continuar como o mesmo nome/avatar;
- evitar duplicar participante no mesmo aparelho;
- mostrar "continuar como";
- trocar nome/avatar se necessario.

### Fase 42 - Painel detalhado do role

Criar uma visao melhor para o criador acompanhar um role especifico.

Indicadores:

- termometro atual;
- historico;
- decisoes abertas;
- sugestoes mais votadas;
- participantes;
- sinais sensiveis;
- link compartilhavel.

### Fase 43 - Roles publicos e privados

Separar claramente roles privados por link e roles publicos/listados.

Regras:

- privado: apenas quem tem link entra;
- publico: pode aparecer em vitrine/lista;
- criador escolhe visibilidade;
- publico pode exigir moderacao/aprovacao.

### Fase 44 - Avaliacao de lugares

Comecar a evoluir de role interno para avaliacao de locais.

Ideia:

- um lugar pode ter varios roles;
- roles geram sinais e notas temporarias;
- lugar tem pagina propria;
- avaliacoes de lugar devem ser separadas das decisoes internas do grupo.

### Fase 45 - Ranking e pagina de lugar

Criar paginas para lugares com historico agregado.

Possibilidades:

- media recente;
- melhores horarios;
- sinais frequentes;
- comentarios moderados;
- roles recentes publicos;
- botao para criar role naquele lugar.

### Fase 46 - Regras comerciais para estabelecimentos

Planejar recursos pagos para bares, pubs e eventos.

Possibilidades:

- perfil verificado;
- painel do estabelecimento;
- destaque em vitrine;
- resposta do estabelecimento;
- estatisticas agregadas;
- planos pagos.

### Fase 47 - Avatares com imagens proprias

Trocar os emojis atuais por imagens proprias do app.

Objetivo:

- deixar o app menos generico;
- criar identidade visual propria;
- manter a escolha de avatar simples;
- preparar o caminho para personalizacao futura.

Formato recomendado:

- imagens PNG ou WebP;
- tamanho base 512x512;
- fundo transparente;
- mesma linguagem visual em todos;
- salvar em `/public/avatars`.

Ferramentas possiveis para criar ideias:

- VRoid Studio para personagem estilo jogo/anime/3D;
- Ready Player Me para avatar 3D customizavel;
- Canva ou Figma para sticker/icone 2D;
- Aseprite ou Piskel para pixel art;
- Picrew apenas com cuidado com direitos de uso/licenca.

Implementacao tecnica:

- trocar `{ icon: 'emoji' }` por `{ image: '/avatars/nome.png' }`;
- manter `id` e `label` do avatar no banco;
- exibir `<img>` no lugar do emoji;
- manter fallback para emoji se a imagem nao carregar.

### Fase 48 - Criador de avatar por camadas

Criar um editor simples dentro do app para a propria pessoa customizar o avatar.

Ideia:

- rosto;
- tom de pele;
- cabelo;
- cor do cabelo;
- barba/bigode;
- oculos;
- bone/acessorio;
- roupa/cor;
- expressao.

O avatar pode ser renderizado combinando camadas SVG/PNG. Em vez de salvar uma imagem final no banco, o app salva a configuracao:

```json
{
  "skin": "medium",
  "hair": "curly",
  "hairColor": "black",
  "facialHair": "mustache",
  "accessory": "glasses",
  "shirt": "green"
}
```

Recomendacao:

- primeiro criar avatares prontos melhores;
- depois evoluir para customizacao por camadas;
- evitar 3D no MVP interno para nao aumentar muito a complexidade.

Fase 49 - Delay de privacidade nos sinais

Criar um atraso proposital para exibicao de sinais e interacoes no role.

Objetivo:

Evitar que participantes descubram quem enviou um sinal observando quem acabou de mexer no celular, principalmente em grupos pequenos.

Funcionamento inicial:

sinais entram em fila antes de aparecer;
atraso aleatorio entre 1 e 2 minutos;
sistema nao revela horario exato do envio;
atualizacao nao acontece imediatamente;
especialmente importante para sinais sensiveis.

Sinais prioritarios:

To desconfortavel
Quero ir embora
Tem uma pessoa me encarando

Possibilidades futuras:

aplicar delay em todos os sinais;
modo de privacidade reforcada;
configuracao do delay pelo criador;
delays diferentes por categoria.

Mensagem sugerida:

“Protecao de anonimato ativa”
“Alguns sinais podem demorar um pouco para aparecer”

Importante:

nao mostrar “digitando”;
nao mostrar ordem exata das interacoes;
preservar anonimato social do grupo;
evitar identificacao indireta de participantes.

Fase 49 - Delay de privacidade nos sinais

Criar um atraso proposital para exibicao de sinais e interacoes no role.

Objetivo:

Evitar que participantes descubram quem enviou um sinal observando quem acabou de mexer no celular, principalmente em grupos pequenos.

Funcionamento inicial:

sinais entram em fila antes de aparecer;
atraso aleatorio entre 1 e 2 minutos;
sistema nao revela horario exato do envio;
atualizacao nao acontece imediatamente;
especialmente importante para sinais sensiveis.

Sinais prioritarios:

To desconfortavel
Quero ir embora
Tem uma pessoa me encarando

Possibilidades futuras:

aplicar delay em todos os sinais;
modo de privacidade reforcada;
configuracao do delay pelo criador;
delays diferentes por categoria.

Mensagem sugerida:

“Protecao de anonimato ativa”
“Alguns sinais podem demorar um pouco para aparecer”

Importante:

nao mostrar “digitando”;
nao mostrar ordem exata das interacoes;
preservar anonimato social do grupo;
evitar identificacao indireta de participantes.
Fase 50 - Linha do tempo do role

Criar uma linha do tempo automatica com os acontecimentos mais importantes do role.

Objetivos:

transformar o role em uma memoria resumida da noite;
mostrar os principais momentos do grupo;
gerar historico automatico sem virar chat;
permitir leitura rapida do que aconteceu.

Eventos detectados:

inicio do role;
pico da nota;
queda forte do clima;
aumento repentino da energia;
votacoes abertas;
votacoes encerradas;
decisoes do grupo;
mudanca de estado do role;
encerramento automatico ou manual.

Exemplos:

22:14 — Role começou
22:31 — “Bora pra pista” aumentou
23:02 — Nota chegou em 87
00:41 — Votacao “Trocar de lugar?” abriu
00:58 — Votacao flopou
01:30 — Grupo decidiu procurar after
02:04 — Role encerrado

Regras importantes:

nao mostrar quem enviou sinais anonimos;
nao revelar localizacao do after;
evitar excesso de eventos irrelevantes;
priorizar momentos coletivos importantes.
Fase 51 - Estados do role

Criar estados automaticos para representar o clima atual do role.

Objetivos:

deixar o role mais vivo;
resumir rapidamente a energia do grupo;
facilitar leitura instantanea do momento atual;
complementar a nota de 0 a 100.

Exemplos de estados:

🔥 Bombando
🟢 Fluindo
🟡 Meio parado
🔴 Dissolvendo
🌅 Indo pro after

Os estados podem ser calculados por:

nota atual;
atividade recente;
quantidade de sinais;
estabilidade das notas;
participantes ativos;
queda ou aumento rapido do clima.

Exemplos:

Nota 82
Estado: Bombando

Nota 41
Estado: Dissolvendo

Importante:

os estados devem mudar naturalmente;
evitar mudancas muito bruscas;
nao depender apenas da nota;
representar sensacao coletiva do role.
Fase 52 - Historico e metricas do criador

Permitir que o criador acompanhe metricas e historicos de roles anteriores.

Objetivos:

criar memoria dos roles;
entender comportamento do grupo;
comparar roles anteriores;
acompanhar horarios de pico e queda.

Metricas iniciais:

maior nota atingida;
horario de pico;
horario de queda;
duracao do role;
quantidade de participantes;
sinais mais usados;
quantidade de votacoes abertas;
horario comum de after;
estado final do role.

Exemplo:

Role anterior:

23:00 — Pico da noite (87)
01:30 — Grupo decidiu procurar after
02:10 — Estado: Dissolvendo

Importante:

nao mostrar dados pessoais;
preservar anonimato dos participantes;
nao salvar localizacao privada de after;
manter foco em leitura coletiva do role.

## Observacoes de produto

O termometro deve ser simples e honesto: nota de 0 a 100. As frases devem funcionar como contexto rapido, nao como pontuacao escondida.

O repertorio de frases deve soar natural. Melhor usar frases curtas e reconheciveis do que tentar forcar giria demais.

A criacao de roles deve ser controlada antes de publicar amplamente. O acesso dos participantes precisa continuar simples, mas a criacao de novos roles deve ficar atras de login, permissao ou pagamento.
