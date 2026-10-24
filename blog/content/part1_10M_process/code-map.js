// Line numbers are 1-based within the original Markdown code fences,
// including comment-only lines. Edit these associations to change the mapping.
(() => {
  const groups = [
    {
      id: "read",
      label: "Memory access",
      lines: [[2, 3], [1,2], [1,2,3,4,5,6]],
    },
    {
      id: "exit",
      label: "Syscall",
      lines: [[4, 5], [3,4,5,6], [7, 8, 9, 10, 11, 12, 13, 14, 15, 16]],
    },
  ];
  const stages = ["Original Rust guest", "ARM assembly", "ARM assembly after LFI"];
  const source = document.getElementById("lfi-code");
  if (!source) return;
  const blocks = [...source.querySelectorAll("pre > code")];
  if (blocks.length !== stages.length) return;
  const lines = blocks.map(block => [...block.querySelectorAll(".giallo-l")]);
  if (groups.some(group => group.lines.some((numbers, stage) =>
    numbers.some(number => !lines[stage][number - 1])))) return;

  const view = document.createElement("div");
  view.className = "code-map";
  view.setAttribute("role", "region");
  view.setAttribute("aria-label", "Rust to assembly to LFI: interactive code comparison");
  view.innerHTML = `
    <div class="code-map-choices" role="group" aria-label="Code operation"></div>
    <div class="code-map-columns"></div>`;

  const controls = [];
  function select(group) {
    view.dataset.selection = group.id;
    for (const control of controls) {
      const active = control.dataset.group === group.id;
      control.classList.toggle("is-active", active);
      control.setAttribute("aria-pressed", String(active));
    }
  }
  function connect(button, group) {
    button.type = "button";
    button.dataset.group = group.id;
    button.addEventListener("pointerenter", () => select(group));
    button.addEventListener("focus", () => select(group));
    button.addEventListener("click", () => select(group));
    controls.push(button);
  }
  for (const group of groups) {
    const button = document.createElement("button");
    button.textContent = group.label;
    connect(button, group);
    view.querySelector(".code-map-choices").append(button);
  }
  stages.forEach((title, stage) => {
    const panel = document.createElement("div");
    panel.className = "code-map-panel";
    const heading = document.createElement("div");
    heading.className = "code-map-stage";
    heading.textContent = title;
    panel.append(heading);
    const listing = document.createElement("div");
    listing.className = "code-map-listing";
    lines[stage].forEach((line, index) => {
      const group = groups.find(group => group.lines[stage].includes(index + 1));
      const row = document.createElement(group ? "button" : "div");
      row.className = "code-map-line";
      row.dataset.line = index + 1;
      const code = document.createElement("code");
      code.className = "code-map-code";
      code.append(...line.cloneNode(true).childNodes);
      row.append(code);
      if (group) {
        row.setAttribute("aria-label", `${title}, line ${index + 1}: ${line.textContent.trim()}`);
        connect(row, group);
      }
      listing.append(row);
    });
    panel.append(listing);
    view.querySelector(".code-map-columns").append(panel);
  });
  select(groups.find(group => group.id === "exit"));
  // Only hide the fallback after the complete interactive view is ready.
  source.after(view);
  source.dataset.enhanced = "true";
})();
