
document.getElementById('year').textContent = new Date().getFullYear();

const cards = document.querySelectorAll('.feature-card, .feature-grid article, .tech-grid div, .timeline article, .gallery figure');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

cards.forEach((card, index) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(18px)';
  card.style.transition = `opacity .55s ease ${index % 4 * 0.06}s, transform .55s ease ${index % 4 * 0.06}s`;
  observer.observe(card);
});

const style = document.createElement('style');
style.textContent = '.visible{opacity:1!important;transform:translateY(0)!important}';
document.head.appendChild(style);
