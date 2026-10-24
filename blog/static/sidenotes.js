// Numeric Markdown labels ([^1]) are numbered sidenotes; named labels ([^aside])
// are unnumbered paragraph notes. Without JavaScript, ordinary endnotes remain.
(() => {
  const prose = document.querySelector(".prose");
  const footnotes = prose?.querySelector("section.footnotes");
  if (!footnotes) return;

  const narrow = window.matchMedia("(max-width: 760px)");
  const references = [...prose.querySelectorAll("sup.footnote-reference")];
  const numbers = new Map();
  const pairs = [];

  for (const reference of references) {
    const link = reference.querySelector("a[href]");
    if (!link) continue;
    const id = decodeURIComponent(new URL(link.href).hash.slice(1));
    const definition = document.getElementById(id);
    if (!definition || !footnotes.contains(definition)) continue;

    const numbered = /^fn-\d+$/.test(id);
    if (numbered && !numbers.has(id)) numbers.set(id, numbers.size + 1);
    const number = numbers.get(id);
    const note = document.createElement("span");
    note.className = numbered ? "sidenote" : "marginnote";
    note.id = `sidenote-${reference.id}`;
    note.tabIndex = -1;
    note.setAttribute("role", "note");
    note.setAttribute("aria-label", numbered ? `Note ${number}` : "Paragraph note");
    if (numbered) note.dataset.number = number;

    const content = definition.cloneNode(true);
    for (const anchor of content.querySelectorAll("a[href]")) {
      const target = document.getElementById(decodeURIComponent(new URL(anchor.href).hash.slice(1)));
      if (target?.classList.contains("footnote-reference")) anchor.remove();
    }
    for (const element of content.querySelectorAll("[id]")) element.removeAttribute("id");
    // Keep note paragraphs valid inside a span when placed within the article text.
    for (const paragraph of content.querySelectorAll("p")) {
      const span = document.createElement("span");
      span.className = "note-paragraph";
      span.append(...paragraph.childNodes);
      paragraph.replaceWith(span);
    }
    note.append(...content.childNodes);

    if (numbered) {
      link.textContent = number;
      link.href = `#${note.id}`;
      link.setAttribute("aria-label", `Note ${number}`);
    } else {
      // Preserve the source reference ID, but show no marker in the paragraph.
      reference.replaceChildren();
      reference.hidden = true;
    }
    const paragraph = reference.closest("p") || reference.parentElement;
    if (!numbered) paragraph.classList.add("has-margin-note");
    pairs.push({ note, reference, paragraph, numbered });
  }

  if (pairs.length && pairs.length === references.length) footnotes.hidden = true;

  const updatePlacement = () => {
    if (narrow.matches) {
      // Keep all notes together, immediately after their paragraph, in source order.
      const lastNote = new Map();
      for (const { note, paragraph } of pairs) {
        (lastNote.get(paragraph) || paragraph).after(note);
        lastNote.set(paragraph, note);
      }
    } else {
      // Prepend in reverse so multiple paragraph notes keep their source order.
      for (const { note, paragraph, numbered } of [...pairs].reverse())
        if (!numbered) paragraph.prepend(note);
      for (const { note, reference, numbered } of pairs)
        if (numbered) reference.after(note);
    }
  };
  narrow.addEventListener("change", updatePlacement);
  updatePlacement();
})();
