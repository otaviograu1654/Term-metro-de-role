const shareInput = document.querySelector('#shareLink');
const copyButton = document.querySelector('#copyLinkButton');
const copyFeedback = document.querySelector('#copyFeedback');
const voteForm = document.querySelector('#voteForm');
const anonymousCheckbox = document.querySelector('#anonymousCheckbox');
const anonymousInput = document.querySelector('#anonymousInput');
const statusInput = document.querySelector('#statusInput');
const scoreInput = document.querySelector('#nota');
const scoreOutput = document.querySelector('#scoreOutput');
const commentBox = document.querySelector('#commentBox');
const commentInput = document.querySelector('#comentario');

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

if (scoreInput && scoreOutput) {
  scoreInput.addEventListener('input', () => {
    scoreOutput.textContent = scoreInput.value;
  });
}

if (voteForm && anonymousInput && statusInput) {
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

    document.querySelectorAll('.vote-button.is-selected').forEach((selectedButton) => {
      selectedButton.classList.remove('is-selected');
    });

    button.classList.add('is-selected');
    statusInput.value = button.dataset.status;

    if (commentBox && commentInput) {
      const canComment = button.dataset.commentable === 'true';
      commentBox.classList.toggle('is-hidden', !canComment);

      if (!canComment) {
        commentInput.value = '';
      }
    }
  });
}
