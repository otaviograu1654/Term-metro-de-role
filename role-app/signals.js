// The selectable vocabulary lives here, grouped explicitly instead of by array position.
const STATUS_CATEGORIES = [
  { id: 'chegada', label: 'Chegada', statuses: [
    '📍 Cheguei agora',
    '🚗 Tô chegando',
    '⏳ Vou atrasar um pouco',
    '🕒 Em 20 minutos eu chego',
    '👋 Cheguei, cadê vocês?'
  ] },
  { id: 'saida', label: 'Saída', statuses: [
    '🚶 Tô indo embora',
    '🚗 Tô indo embora, alguém vem comigo?',
    '⏰ Vou embora daqui a pouco',
    '🏠 Já cheguei em casa'
  ] },
  { id: 'ambiente', label: 'Ambiente', statuses: [
    '👩 Tem muita mulher',
    '👨 Tem muito homem',
    '🌀 Cheio de noiado',
    '🧍 Tá lotado aqui',
    '🪑 Tá vazio aqui',
    '🎶 A música tá boa',
    '🔇 A música tá ruim'
  ] },
  { id: 'grupo', label: 'Grupo', statuses: [
    '🔎 Cadê o pessoal?',
    '🤝 Bora se encontrar?',
    '🍺 Quem vai pegar bebida comigo?',
    '🍔 Alguém quer comer?',
    '🗺️ Bora pra outro lugar?',
    '🌙 Quem vai pro after?'
  ] },
  { id: 'cuidado', label: 'Cuidado', statuses: [
    '💧 Preciso beber água',
    '🪑 Preciso sentar um pouco',
    '⚠️ Não tô me sentindo bem',
    '👀 Tem alguém me incomodando'
  ] }
];

const STATUS_LIST = STATUS_CATEGORIES.flatMap((category) => category.statuses);
const PLACE_POLL_STATUS = '🗺️ Bora pra outro lugar?';
const SENSITIVE_STATUSES = ['⚠️ Não tô me sentindo bem', '👀 Tem alguém me incomodando'];
const COMMENTABLE_STATUSES = [
  '👋 Cheguei, cadê vocês?', '🔎 Cadê o pessoal?', '🤝 Bora se encontrar?',
  '🌙 Quem vai pro after?', '👀 Tem alguém me incomodando',
  // Existing comments/polls remain readable after the vocabulary changes.
  '🍻 À procura de after', '🌙 Onde é o after?', '👀 Tem uma pessoa me encarando'
];
const FORCE_ANONYMOUS_STATUSES = ['👀 Tem alguém me incomodando'];
const COMMENT_COOLDOWN_STATUSES = ['👀 Tem alguém me incomodando', '👀 Tem uma pessoa me encarando'];
const QUICK_POLL_OPTIONS = {
  '🚗 Tô indo embora, alguém vem comigo?': ['Vou com você', 'Vou ficar'],
  '🤝 Bora se encontrar?': ['Bora', 'Já tô com o pessoal'],
  '🍺 Quem vai pegar bebida comigo?': ['Eu vou', 'Agora não'],
  '🍔 Alguém quer comer?': ['Eu quero', 'Agora não'],
  [PLACE_POLL_STATUS]: ['Bora', 'Prefiro ficar'],
  '🌙 Quem vai pro after?': ['Eu vou', 'Vou pra casa'],
  // Preserve option labels for already stored responses; old signals cannot be sent again.
  '🍺 Vamo pegar bebida': ['Vamo', 'Agora não, irmão'],
  '🚪 Embora?': ['Vamo', 'Agora não, irmão'],
  '🌙 Onde é o after?': ['Bora achar', 'Todo mundo ir dormir é o after'],
  '🗺️ Vamo pra outro lugar': ['Bora', 'Vamo ficar mais']
};

function isPlacePoll(status) {
  return status === PLACE_POLL_STATUS || status === '🗺️ Vamo pra outro lugar';
}

module.exports = { STATUS_CATEGORIES, STATUS_LIST, SENSITIVE_STATUSES, COMMENTABLE_STATUSES,
  FORCE_ANONYMOUS_STATUSES, COMMENT_COOLDOWN_STATUSES, QUICK_POLL_OPTIONS, isPlacePoll };
