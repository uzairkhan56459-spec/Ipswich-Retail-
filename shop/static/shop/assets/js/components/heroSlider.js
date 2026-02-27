/**
 * Hero Slider - Custom Carousel Component
 * A lightweight, accessible carousel for the homepage hero section
 */

class HeroSlider {
  constructor(selector = '.hero-slider') {
    this.slider = document.querySelector(selector);
    if (!this.slider) return;

    this.slides = this.slider.querySelectorAll('.hero-slider__slide');
    this.indicators = this.slider.querySelectorAll('.hero-slider__indicator');
    this.prevBtn = this.slider.querySelector('.hero-slider__arrow--prev');
    this.nextBtn = this.slider.querySelector('.hero-slider__arrow--next');

    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000; // 5 seconds
    this.isPlaying = true;

    this.init();
  }

  init() {
    if (this.totalSlides === 0) return;

    // Set up event listeners
    this.bindEvents();

    // Start autoplay
    this.startAutoPlay();

    // Pause on hover
    this.slider.addEventListener('mouseenter', () => this.pauseAutoPlay());
    this.slider.addEventListener('mouseleave', () => this.startAutoPlay());

    // Touch/Swipe support
    this.initTouchSupport();

    // Keyboard navigation
    this.slider.setAttribute('tabindex', '0');
    this.slider.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  bindEvents() {
    // Arrow navigation
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevSlide());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextSlide());
    }

    // Indicator navigation
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });
  }

  goToSlide(index) {
    // Remove active class from current slide and indicator
    this.slides[this.currentIndex].classList.remove('active');
    this.indicators[this.currentIndex].classList.remove('active');

    // Update index
    this.currentIndex = index;

    // Handle wrap around
    if (this.currentIndex >= this.totalSlides) {
      this.currentIndex = 0;
    } else if (this.currentIndex < 0) {
      this.currentIndex = this.totalSlides - 1;
    }

    // Add active class to new slide and indicator
    this.slides[this.currentIndex].classList.add('active');
    this.indicators[this.currentIndex].classList.add('active');
  }

  nextSlide() {
    this.goToSlide(this.currentIndex + 1);
  }

  prevSlide() {
    this.goToSlide(this.currentIndex - 1);
  }

  startAutoPlay() {
    if (!this.isPlaying) return;

    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  pauseAutoPlay() {
    this.stopAutoPlay();
  }

  initTouchSupport() {
    let touchStartX = 0;
    let touchEndX = 0;

    this.slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      this.pauseAutoPlay();
    }, { passive: true });

    this.slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
      this.startAutoPlay();
    }, { passive: true });
  }

  handleSwipe(startX, endX) {
    const swipeThreshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next slide
        this.nextSlide();
      } else {
        // Swipe right - previous slide
        this.prevSlide();
      }
    }
  }

  handleKeyboard(e) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.prevSlide();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.nextSlide();
        break;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new HeroSlider('.hero-slider');
});
