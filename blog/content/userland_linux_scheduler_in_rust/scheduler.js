(() => {
  const animation = document.getElementById('scheduler-animation');
  if (!animation) return;

  const cpu = animation.querySelector('[data-cpu]');
  const timer = animation.querySelector('[data-timer]');
  const timerLabel = animation.querySelector('[data-timer-label]');
  const sectors = {};
  const steps = [
    ...[3, 2, 1].map(count => ({ phase: 'run', count, duration: 1000 })),
    { phase: 'save', duration: 1500 },
    { phase: 'choose', duration: 900 },
    { phase: 'load', duration: 1500 },
  ];

  function point(radius, degrees) {
    const angle = degrees * Math.PI / 180;
    return [280 + radius * Math.sin(angle), 280 - radius * Math.cos(angle)];
  }

  function ring(inner, outer, angle) {
    const start = angle - 60;
    const end = angle + 60;
    return `M${point(outer, start)} A${outer},${outer} 0 0 1 ${point(outer, end)}
            L${point(inner, end)} A${inner},${inner} 0 0 0 ${point(inner, start)} Z`;
  }

  for (const element of animation.querySelectorAll('[data-sector]')) {
    const angle = Number(element.dataset.angle);
    const [outer, context] = element.querySelectorAll('path');
    outer.setAttribute('d', ring(160, 252, angle));
    context.setAttribute('d', ring(66, 160, angle));
    sectors[element.dataset.sector] = {
      element,
      state: element.querySelector('[data-state]'),
      context: element.querySelector('[data-context]'),
    };
  }

  let current = 1;
  let step = 0;
  let timeout;
  let deadline;
  let pausedDelay = null;

  function updateSector(id, { active, state, context }) {
    const sector = sectors[id];
    sector.element.classList.toggle('active', active);
    sector.state.textContent = state;
    sector.context.textContent = context;
  }

  function render() {
    const { phase, count } = steps[step];
    const running = phase === 'run';
    const saving = phase === 'save';
    const next = current === 1 ? 2 : 1;
    const active = sectors[running ? `p${current}` : 'kernel'].element;

    timer.textContent = running ? count : '';
    timerLabel.setAttribute('visibility', running ? 'visible' : 'hidden');
    updateSector('kernel', {
      active: !running,
      state: running ? 'Waiting' : 'Active',
      context: running ? 'Waiting' : 'Active',
    });
    updateSector(`p${current}`, {
      active: running,
      state: running ? 'Active' : 'Waiting',
      context: running ? 'Active' : saving ? 'Saving' : 'Waiting',
    });
    updateSector(`p${next}`, {
      active: false,
      state: 'Waiting',
      context: phase === 'load' ? 'Loading' : 'Waiting',
    });

    // Draw the active sector last so its borders cover the shared seams.
    if (active.nextElementSibling !== cpu) cpu.before(active);
  }

  function schedule(delay = steps[step].duration) {
    deadline = performance.now() + delay;
    timeout = setTimeout(() => {
      step = (step + 1) % steps.length;
      if (step === 0) current = current === 1 ? 2 : 1;
      render();
      schedule();
    }, delay);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(timeout);
      pausedDelay = Math.max(1, deadline - performance.now());
    } else if (pausedDelay !== null) {
      schedule(pausedDelay);
      pausedDelay = null;
    }
  });

  render();
  schedule();
})();
