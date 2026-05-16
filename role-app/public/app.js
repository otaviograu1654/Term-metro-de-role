const shareInput = document.querySelector('#shareLink');
const copyButton = document.querySelector('#copyLinkButton');
const copyFeedback = document.querySelector('#copyFeedback');
const voteForm = document.querySelector('#voteForm');
const anonymousCheckbox = document.querySelector('#anonymousCheckbox');
const anonymousInput = document.querySelector('#anonymousInput');

if (copyButton && shareInput) {
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareInput.value);
      copyFeedback.textContent = 'Link copiado.';
    } catch (error) {
      shareInput.select();
      document.execCommand('copy');
      copyFeedback.textContent = 'Link copiado.';
    }
  });
}

if (anonymousCheckbox && anonymousInput) {
  anonymousCheckbox.addEventListener('change', () => {
    anonymousInput.value = anonymousCheckbox.checked ? 'true' : 'false';
  });
}

if (voteForm && anonymousInput) {
  voteForm.addEventListener('click', (event) => {
    const button = event.target.closest('.vote-button');

    if (!button) {
      return;
    }

    if (button.dataset.sensitive === 'true') {
      const wantsAnonymous = window.confirm('Deseja enviar anonimamente?');
      anonymousInput.value = wantsAnonymous ? 'true' : 'false';
    } else {
      anonymousInput.value = anonymousCheckbox && anonymousCheckbox.checked ? 'true' : 'false';
    }
  });
}
