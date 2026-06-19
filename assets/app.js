const menuToggle = document.querySelector('.menu-toggle');
const mobilePanel = document.querySelector('.mobile-panel');

if (menuToggle && mobilePanel) {
  menuToggle.addEventListener('click', () => {
    const opened = mobilePanel.classList.toggle('open');
    mobilePanel.hidden = !opened;
    menuToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });
}

const slides = Array.from(document.querySelectorAll('.hero-slide'));
const dots = Array.from(document.querySelectorAll('.hero-dot'));
let heroIndex = 0;

function setHero(index) {
  if (!slides.length) {
    return;
  }

  heroIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('active', i === heroIndex));
  dots.forEach((dot, i) => dot.classList.toggle('active', i === heroIndex));
}

if (slides.length) {
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => setHero(i));
  });

  setInterval(() => setHero(heroIndex + 1), 5200);
}

const searchInput = document.querySelector('.page-search');
const cards = Array.from(document.querySelectorAll('.movie-card'));
const chips = Array.from(document.querySelectorAll('.filter-chip'));
const emptyResult = document.querySelector('.empty-result');
let activeFilter = 'all';

function filterCards() {
  if (!cards.length) {
    return;
  }

  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
  let visibleCount = 0;

  cards.forEach((card) => {
    const haystack = [
      card.dataset.title,
      card.dataset.year,
      card.dataset.region,
      card.dataset.genre,
      card.dataset.category,
      card.innerText
    ].join(' ').toLowerCase();

    const keywordMatch = !keyword || haystack.includes(keyword);
    const filterMatch = activeFilter === 'all' || haystack.includes(activeFilter.toLowerCase());
    const show = keywordMatch && filterMatch;

    card.classList.toggle('hidden-card', !show);
    if (show) {
      visibleCount += 1;
    }
  });

  if (emptyResult) {
    emptyResult.classList.toggle('show', visibleCount === 0);
  }
}

if (searchInput) {
  searchInput.addEventListener('input', filterCards);
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((item) => item.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter || 'all';
    filterCards();
  });
});
