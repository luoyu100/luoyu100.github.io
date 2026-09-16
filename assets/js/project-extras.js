(function () {
  "use strict";

  document.querySelectorAll("[data-walkthrough]").forEach(function (walkthrough) {
    var tabs = Array.from(walkthrough.querySelectorAll('[role="tab"]'));
    var panels = Array.from(walkthrough.querySelectorAll('[role="tabpanel"]'));
    var previous = walkthrough.querySelector("[data-case-prev]");
    var next = walkthrough.querySelector("[data-case-next]");
    var status = walkthrough.querySelector("[data-case-status]");
    var active = 0;

    function show(index, focusTab) {
      active = Math.max(0, Math.min(index, tabs.length - 1));
      tabs.forEach(function (tab, i) {
        tab.setAttribute("aria-selected", String(i === active));
        tab.tabIndex = i === active ? 0 : -1;
        panels[i].classList.toggle("is-active", i === active);
        panels[i].setAttribute("aria-hidden", String(i !== active));
        panels[i].inert = i !== active;
      });
      previous.disabled = active === 0;
      next.disabled = active === tabs.length - 1;
      status.textContent = "Step " + (active + 1) + " of " + tabs.length;
      if (focusTab) tabs[active].focus({ preventScroll: true });
      // Reveal the selected tab without scrolling the page or the panel.
      var list = tabs[active].parentElement;
      var tabRect = tabs[active].getBoundingClientRect();
      var listRect = list.getBoundingClientRect();
      if (tabRect.left < listRect.left) list.scrollLeft -= listRect.left - tabRect.left;
      if (tabRect.right > listRect.right) list.scrollLeft += tabRect.right - listRect.right;
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { show(i, false); });
      tab.addEventListener("keydown", function (event) {
        var target;
        if (event.key === "ArrowRight") target = (active + 1) % tabs.length;
        if (event.key === "ArrowLeft") target = (active + tabs.length - 1) % tabs.length;
        if (event.key === "Home") target = 0;
        if (event.key === "End") target = tabs.length - 1;
        if (target !== undefined) { event.preventDefault(); show(target, true); }
      });
    });
    previous.addEventListener("click", function () { show(active - 1, false); });
    next.addEventListener("click", function () { show(active + 1, false); });
    show(0, false);
  });

  document.querySelectorAll("[data-copy-command]").forEach(function (button) {
    button.addEventListener("click", async function () {
      var text = button.closest(".project-run-command").querySelector("code").textContent.trim();
      var label = button.querySelector("span");
      var copied = false;
      button.disabled = true;
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch (error) {
        var field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.cssText = "position:fixed;top:-1000px;";
        document.body.appendChild(field);
        field.select();
        try { copied = document.execCommand("copy"); } catch (fallbackError) { copied = false; }
        field.remove();
        button.focus({ preventScroll: true });
      }
      label.textContent = copied ? "Copied" : "Try again";
      window.setTimeout(function () { label.textContent = "Copy"; button.disabled = false; }, 1800);
    });
  });
}());
