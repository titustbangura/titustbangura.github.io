// Performance monitoring and optimization demo
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // Measure page load performance
        window.addEventListener('load', () => {
            this.measurePageLoad();
        });

        // Monitor Largest Contentful Paint
        this.observeLCP();

        // Monitor Cumulative Layout Shift
        this.observeCLS();

        // Add lazy loading for images
        this.initLazyLoading();
    }

    measurePageLoad() {
        const perfData = performance.getEntriesByType('navigation')[0];
        this.metrics = {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            totalTime: perfData.loadEventEnd - perfData.fetchStart
        };

        console.log('Page Load Metrics:', this.metrics);
    }

    observeLCP() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('Largest Contentful Paint:', lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    observeCLS() {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            console.log('Cumulative Layout Shift:', clsValue);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
    }

    initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize performance monitoring
const perfMonitor = new PerformanceMonitor();

// Smooth scrolling for table of contents and anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80; // Account for any fixed header
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Highlight active section in table of contents
const tocLinks = document.querySelectorAll('.table-of-contents a');
const sections = document.querySelectorAll('section[id]');

function highlightTOC() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightTOC);
window.addEventListener('load', highlightTOC);

// Add loading animation for performance cards
const cards = document.querySelectorAll('.card');
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    cardObserver.observe(card);
});

// Service Worker registration for caching (if supported)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Enhanced Search Functionality
class ContentSearch {
    constructor() {
        this.searchInput = document.getElementById('content-search');
        this.clearButton = document.getElementById('clear-search');
        this.resultsContainer = document.getElementById('search-results');
        this.sections = document.querySelectorAll('.article-content section[id]');
        this.searchIndex = [];
        this.currentHighlights = [];
        
        this.init();
    }

    init() {
        this.buildSearchIndex();
        this.bindEvents();
    }

    buildSearchIndex() {
        this.sections.forEach(section => {
            const id = section.id;
            const title = section.querySelector('h2, h3')?.textContent || '';
            const content = section.textContent.toLowerCase();
            
            this.searchIndex.push({
                id,
                title,
                content,
                element: section
            });
        });
    }

    bindEvents() {
        this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        this.clearButton.addEventListener('click', this.clearSearch.bind(this));
        
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideResults();
            }
        });

        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
    }

    handleSearch(e) {
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length < 2) {
            this.hideResults();
            this.clearButton.style.display = 'none';
            this.clearHighlights();
            return;
        }

        this.clearButton.style.display = 'block';
        const results = this.searchIndex.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.content.includes(query)
        );

        this.displayResults(results, query);
        this.highlightMatches(query);
    }

    displayResults(results, query) {
        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<div class="search-result-item">No results found</div>';
            this.showResults();
            return;
        }

        const html = results.map(result => `
            <div class="search-result-item" data-section-id="${result.id}" tabindex="0">
                <div class="search-result-title">${this.highlightText(result.title, query)}</div>
                <div class="search-result-preview">${this.getPreviewText(result.content, query)}</div>
            </div>
        `).join('');

        this.resultsContainer.innerHTML = html;
        this.showResults();
        
        // Add click handlers for results
        this.resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const sectionId = item.dataset.sectionId;
                this.scrollToSection(sectionId);
                this.hideResults();
            });
        });
    }

    highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    getPreviewText(content, query) {
        const words = content.split(' ');
        const queryIndex = words.findIndex(word => word.toLowerCase().includes(query));
        
        if (queryIndex === -1) return content.substring(0, 100) + '...';
        
        const start = Math.max(0, queryIndex - 10);
        const end = Math.min(words.length, queryIndex + 15);
        const preview = words.slice(start, end).join(' ');
        
        return this.highlightText(preview, query) + (end < words.length ? '...' : '');
    }

    highlightMatches(query) {
        this.clearHighlights();
        
        if (!query) return;

        const regex = new RegExp(`(${query})`, 'gi');
        const contentSections = document.querySelectorAll('.article-content section');
        
        contentSections.forEach(section => {
            const textNodes = this.getTextNodes(section);
            textNodes.forEach(node => {
                if (regex.test(node.textContent)) {
                    const highlighted = node.textContent.replace(regex, '<span class="highlight">$1</span>');
                    const wrapper = document.createElement('span');
                    wrapper.innerHTML = highlighted;
                    node.parentNode.replaceChild(wrapper, node);
                    this.currentHighlights.push(wrapper);
                }
            });
        });
    }

    getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim()) {
                textNodes.push(node);
            }
        }
        return textNodes;
    }

    clearHighlights() {
        this.currentHighlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.innerHTML = parent.textContent;
        });
        this.currentHighlights = [];
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offset = 80; // Account for fixed header
            const elementPosition = section.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    clearSearch() {
        this.searchInput.value = '';
        this.hideResults();
        this.clearButton.style.display = 'none';
        this.clearHighlights();
        this.searchInput.focus();
    }

    showResults() {
        this.resultsContainer.classList.add('show');
    }

    hideResults() {
        this.resultsContainer.classList.remove('show');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContentSearch();
    
    // Back to Top Button
    const backToTopButton = document.getElementById('back-to-top');
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });
    
    // Smooth scroll to top
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Reading Progress Bar
    function updateReadingProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }
    }

    window.addEventListener('scroll', updateReadingProgress);
    window.addEventListener('load', updateReadingProgress);

    // Code Block Copy Functionality
    function initCodeCopy() {
        const codeBlocks = document.querySelectorAll('pre');
        
        codeBlocks.forEach((block, index) => {
            // Create copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.textContent = 'Copy';
            copyButton.setAttribute('aria-label', 'Copy code to clipboard');
            
            // Add button to pre element
            block.appendChild(copyButton);
            
            // Add click handler
            copyButton.addEventListener('click', async () => {
                const code = block.querySelector('code');
                if (code) {
                    try {
                        await navigator.clipboard.writeText(code.textContent);
                        copyButton.textContent = 'Copied!';
                        copyButton.classList.add('copied');
                        
                        // Reset after 2 seconds
                        setTimeout(() => {
                            copyButton.textContent = 'Copy';
                            copyButton.classList.remove('copied');
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy: ', err);
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = code.textContent;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        
                        copyButton.textContent = 'Copied!';
                        copyButton.classList.add('copied');
                        setTimeout(() => {
                            copyButton.textContent = 'Copy';
                            copyButton.classList.remove('copied');
                        }, 2000);
                    }
                }
            });
        });
    }

    initCodeCopy();

    // Staggered animation for code blocks
    function animateCodeBlocks() {
        const codeBlocks = document.querySelectorAll('pre');
        codeBlocks.forEach((block, index) => {
            block.style.animationDelay = `${index * 0.1}s`;
        });
    }

    animateCodeBlocks();
});
