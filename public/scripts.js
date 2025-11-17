document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quizForm');
  const validationMessage = document.getElementById('validationMessage');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    const totalQuestions = 16;
    let answered = 0;

    for (let i = 1; i <= totalQuestions; i++) {
      const radios = document.querySelectorAll(`input[name="q${i}"]`);
      const anyChecked = Array.from(radios).some(r => r.checked);
      if (anyChecked) answered++;
    }

    if (answered !== totalQuestions) {
      e.preventDefault();
      validationMessage.classList.remove('hidden');
      validationMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      validationMessage.classList.add('hidden');
    }
  });
});
