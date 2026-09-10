(function () {
  document.querySelectorAll('[data-wechat]').forEach(function (button) {
    var label = button.querySelector('span');
    var timer;

    function feedback(message) {
      window.clearTimeout(timer);
      label.textContent = message;
      timer = window.setTimeout(function () { label.textContent = 'Wechat'; }, 2500);
    }

    function fallbackCopy(text) {
      var input = document.createElement('textarea');
      input.value = text;
      input.readOnly = true;
      input.style.position = 'fixed';
      input.style.top = '-9999px';
      document.body.appendChild(input);
      input.select();
      try {
        if (!document.execCommand('copy')) { throw new Error('Copy failed'); }
        feedback('Copied!');
      } catch (error) {
        feedback(text);
      } finally {
        input.remove();
        button.focus();
      }
    }

    button.addEventListener('click', function () {
      var text = button.getAttribute('data-wechat');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          feedback('Copied!');
        }).catch(function () { fallbackCopy(text); });
      } else {
        fallbackCopy(text);
      }
    });
  });
}());
