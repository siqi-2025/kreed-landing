/**
 * Kreed × 知了 — Landing Page Main Script
 * 认知成长引擎 | kreed.top
 *
 * Modules:
 *  1. Particle Background System
 *  2. Scroll Entrance Animations
 *  3. Global Micro-Chirp Counter
 *  4. Cicada Wing Canvas Animation
 *  5. Cognitive Momentum Index Animation
 *  6. FAQ Accordion
 *  7. Navbar Scroll Effect
 *  8. Smooth Anchor Scrolling
 *  9. CTA Button Ripple Effect
 * 10. Stats Number Roll-up Animation
 */

'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* ========================================================================
   *  Utility Functions
   * ======================================================================== */

  /**
   * Linear interpolation between a and b by t.
   * @param {number} a - Start value
   * @param {number} b - End value
   * @param {number} t  - Progress 0-1
   * @returns {number}
   */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Clamp value between min and max.
   */
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  /**
   * easeOutExpo — fast start, slow finish.
   * @param {number} t - Progress 0-1
   * @returns {number}
   */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /**
   * easeOutQuart — quick deceleration.
   * @param {number} t - Progress 0-1
   * @returns {number}
   */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  /**
   * Random integer between min and max (inclusive).
   */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Safe querySelector — returns element or null.
   */
  function $(selector) {
    return document.querySelector(selector);
  }

  /**
   * Safe querySelectorAll — returns array.
   */
  function $$(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  /* ========================================================================
   *  1. Hero Soft-Moon Particles  (#particles) — 自下而上飞升的金色微粒
   * ======================================================================== */

  (function initParticles() {
    var container = document.getElementById('particles');
    if (!container) return;

    var colors = [
      'rgba(212,168,67,0.9)',
      'rgba(232,200,122,0.8)',
      'rgba(212,168,67,0.6)',
      'rgba(255,220,130,0.7)'
    ];
    for (var i = 0; i < 55; i++) {
      var p = document.createElement('div');
      p.classList.add('particle');
      var size = 2 + Math.random() * 3.5;
      var color = colors[Math.floor(Math.random() * colors.length)];
      var left = 3 + Math.random() * 94;
      var delay = Math.random() * 14;
      var duration = 8 + Math.random() * 12;
      var glowSize = size * 4 + Math.random() * 4;
      p.style.cssText =
        'width:' + size + 'px;' +
        'height:' + size + 'px;' +
        'background:' + color + ';' +
        'left:' + left + '%;' +
        'bottom:' + (-5 + Math.random() * 10) + '%;' +
        'animation-delay:' + delay + 's;' +
        'animation-duration:' + duration + 's;' +
        'box-shadow:0 0 ' + glowSize + 'px ' + color +
          ',0 0 ' + (glowSize * 2) + 'px rgba(212,168,67,0.15);';
      container.appendChild(p);
    }
  })();

  /* ========================================================================
   *  2. Scroll Entrance Animations  (.animate-on-scroll)
   * ======================================================================== */

  (function initScrollAnimations() {
    var elements = $$('.animate-on-scroll');
    if (!elements.length) return;

    // Group by parent container for stagger
    var containers = {};
    elements.forEach(function (el) {
      var parent = el.parentElement;
      if (!containers[parent]) containers[parent] = [];
      containers[parent].push(el);
    });

    // Assign stagger delays within each container
    Object.keys(containers).forEach(function (parent) {
      var children = containers[parent];
      children.forEach(function (el, index) {
        el.style.transitionDelay = (index * 100) + 'ms';
      });
    });

    if (!('IntersectionObserver' in window)) {
      // Fallback: show all
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    elements.forEach(function (el) { observer.observe(el); });
  })();

  /* ========================================================================
   *  3. Global Micro-Chirp Counter  (#global-counter)
   * ======================================================================== */

  (function initGlobalCounter() {
    var counterEl = $('#counter-number');
    if (!counterEl) return;

    var count = 1284392;

    function updateDisplay() {
      counterEl.textContent = count.toLocaleString();
    }

    updateDisplay();

    setInterval(function () {
      count += randInt(1, 5);
      updateDisplay();
    }, 1000);
  })();

  /* ========================================================================
   *  4. Cicada Wing Canvas Animation  (#wing-canvas)
   * ======================================================================== */

  (function initWingCanvas() {
    var canvas = $('#wing-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var progress = 0;          // 0 = folded, 1 = fully open
    var targetProgress = 0;
    var animating = false;
    var ANIM_DURATION = 1500;  // 1.5 seconds
    var animStart = 0;

    // Colors
    var VEIN_COLOR      = 'rgba(212,168,67,';   // amber
    var MEMBRANE_COLOR  = 'rgba(26,77,46,0.12)'; // deep green fill
    var GLOW_COLOR      = 'rgba(212,168,67,0.08)';

    function resizeWingCanvas() {
      var rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    }
    resizeWingCanvas();
    window.addEventListener('resize', resizeWingCanvas);

    /**
     * Draw one wing (mirrored by caller).
     * @param {number} cx - Center X (body axis)
     * @param {number} cy - Center Y
     * @param {number} spread - Current spread factor 0-1
     * @param {number} dir - 1 for right, -1 for left
     */
    function drawWing(cx, cy, spread, dir) {
      var wingWidth  = 120 * spread;
      var wingHeight = 160;

      if (wingWidth < 1) return;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(dir, 1);

      // Wing outline path
      ctx.beginPath();
      ctx.moveTo(0, -wingHeight * 0.45);
      ctx.bezierCurveTo(
        wingWidth * 0.5, -wingHeight * 0.5,
        wingWidth, -wingHeight * 0.3,
        wingWidth * 0.95, 0
      );
      ctx.bezierCurveTo(
        wingWidth, wingHeight * 0.3,
        wingWidth * 0.4, wingHeight * 0.45,
        0, wingHeight * 0.4
      );
      ctx.closePath();

      // Membrane fill
      ctx.fillStyle = MEMBRANE_COLOR;
      ctx.fill();

      // Edge glow
      ctx.shadowColor = 'rgba(212,168,67,0.3)';
      ctx.shadowBlur = 12 * spread;
      ctx.strokeStyle = VEIN_COLOR + (0.4 * spread) + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw veins (main + branches)
      ctx.strokeStyle = VEIN_COLOR + (0.5 * spread) + ')';
      ctx.lineWidth = 0.8;

      // Main vein (central)
      ctx.beginPath();
      ctx.moveTo(0, -wingHeight * 0.45);
      ctx.quadraticCurveTo(wingWidth * 0.5, 0, 0, wingHeight * 0.4);
      ctx.stroke();

      // Branch veins
      var branches = 7;
      for (var i = 1; i <= branches; i++) {
        var t = i / (branches + 1);
        var startY = lerp(-wingHeight * 0.45, wingHeight * 0.4, t);
        // Point on main vein at this t
        var mainX = wingWidth * 0.5 * (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * wingWidth * 0.5 + t * t * 0;
        // Approximate: the main vein curves outward then back
        mainX = wingWidth * 0.5 * 4 * (1 - t) * t; // peak at t=0.5

        var endX = mainX + wingWidth * (0.3 + Math.random() * 0.15);
        var endY = startY + (Math.random() - 0.5) * 15;

        ctx.beginPath();
        ctx.moveTo(mainX, startY);
        ctx.quadraticCurveTo(
          (mainX + endX) / 2,
          startY + (endY - startY) * 0.3,
          endX, endY
        );
        ctx.stroke();
      }

      // Cross veins (horizontal connections between branches)
      ctx.strokeStyle = VEIN_COLOR + (0.2 * spread) + ')';
      ctx.lineWidth = 0.4;
      for (var i = 1; i < branches; i++) {
        var t1 = i / (branches + 1);
        var t2 = (i + 1) / (branches + 1);
        var y1 = lerp(-wingHeight * 0.45, wingHeight * 0.4, t1);
        var y2 = lerp(-wingHeight * 0.45, wingHeight * 0.4, t2);
        var mx1 = wingWidth * 0.5 * 4 * (1 - t1) * t1;
        var mx2 = wingWidth * 0.5 * 4 * (1 - t2) * t2;
        ctx.beginPath();
        ctx.moveTo(mx1 + wingWidth * 0.15, y1);
        ctx.lineTo(mx2 + wingWidth * 0.15, y2);
        ctx.stroke();
      }

      ctx.restore();
    }

    function render() {
      var w = canvas.getBoundingClientRect().width;
      var h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      var cx = w / 2;
      var cy = h / 2;

      // Outer glow halo
      if (progress > 0.1) {
        var gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, 140 * progress);
        gradient.addColorStop(0, GLOW_COLOR);
        gradient.addColorStop(1, 'rgba(212,168,67,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw body line
      ctx.beginPath();
      ctx.moveTo(cx, cy - 30);
      ctx.lineTo(cx, cy + 30);
      ctx.strokeStyle = VEIN_COLOR + '0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw wings
      drawWing(cx, cy, progress, 1);   // right
      drawWing(cx, cy, progress, -1);  // left
    }

    function animateWing(timestamp) {
      if (!animStart) animStart = timestamp;
      var elapsed = timestamp - animStart;
      var t = clamp(elapsed / ANIM_DURATION, 0, 1);
      progress = easeOutExpo(t);
      render();

      if (t < 1) {
        requestAnimationFrame(animateWing);
      } else {
        progress = 1;
        render();
        animating = false;
      }
    }

    function startWingAnimation() {
      if (animating || progress >= 1) return;
      animating = true;
      animStart = 0;
      requestAnimationFrame(animateWing);
    }

    // Trigger on scroll into view
    if ('IntersectionObserver' in window) {
      var wingObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startWingAnimation();
            wingObserver.unobserve(canvas);
          }
        });
      }, { threshold: 0.3 });
      wingObserver.observe(canvas);
    } else {
      // Fallback
      progress = 1;
      render();
    }
  })();

  /* ========================================================================
   *  5. Cognitive Momentum Index Animation
   * ======================================================================== */

  (function initMomentumIndex() {
    var el = $('#cognition-score');
    if (!el) return;

    var TARGET = parseInt(el.dataset.target, 10) || 847;
    var DURATION = 2000;
    var started = false;

    function animateCount(timestamp) {
      if (!started) return;
      var t = clamp((timestamp - animateCount.start) / DURATION, 0, 1);
      var value = Math.round(TARGET * easeOutExpo(t));
      el.textContent = value.toLocaleString();

      if (t < 1) {
        requestAnimationFrame(animateCount);
      } else {
        // Add pulse effect on completion
        el.classList.add('momentum-pulse');
      }
    }

    function startCount(timestamp) {
      started = true;
      animateCount.start = timestamp;
      requestAnimationFrame(animateCount);
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !started) {
            requestAnimationFrame(startCount);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.3 });
      observer.observe(el);
    } else {
      el.textContent = TARGET.toLocaleString();
    }
  })();

  /* ========================================================================
   *  6. FAQ Accordion
   * ======================================================================== */

  (function initFAQ() {
    var detailsList = $$('details.faq-item');

    detailsList.forEach(function (detail) {
      var summary = detail.querySelector('summary');
      var content = detail.querySelector('.faq-answer, .faq-content');
      if (!summary || !content) return;

      // Set initial max-height for transition
      content.style.maxHeight = '0';
      content.style.overflow  = 'hidden';
      content.style.transition = 'max-height 0.35s ease, padding 0.35s ease';

      detail.addEventListener('toggle', function () {
        if (detail.open) {
          // Close other open details
          detailsList.forEach(function (other) {
            if (other !== detail && other.open) {
              other.open = false;
              var otherContent = other.querySelector('.faq-answer, .faq-content');
              if (otherContent) otherContent.style.maxHeight = '0';
            }
          });
          // Open this one
          content.style.maxHeight = content.scrollHeight + 'px';
        } else {
          content.style.maxHeight = '0';
        }
      });
    });
  })();

  /* ========================================================================
   *  7. Navbar Scroll Effect
   * ======================================================================== */

  (function initNavbar() {
    var navbar = $('.navbar');
    if (!navbar) return;

    var SCROLL_THRESHOLD = 100;
    var ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > SCROLL_THRESHOLD) {
            navbar.classList.add('navbar--scrolled');
          } else {
            navbar.classList.remove('navbar--scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial check
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('navbar--scrolled');
    }
  })();

  /* ========================================================================
   *  8. Smooth Anchor Scrolling
   * ======================================================================== */

  (function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Update URL without jumping
      if (history.pushState) {
        history.pushState(null, null, targetId);
      }
    });
  })();

  /* ========================================================================
   *  9. CTA Button Ripple Effect
   * ======================================================================== */

  (function initRipple() {
    var ctaButtons = $$('.hero-cta, .pricing-cta, .cta-button');

    ctaButtons.forEach(function (btn) {
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';

      btn.addEventListener('click', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var size = Math.max(rect.width, rect.height) * 2;

        var ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText =
          'position:absolute;' +
          'border-radius:50%;' +
          'pointer-events:none;' +
          'background:rgba(212,168,67,0.35);' +
          'transform:scale(0);' +
          'animation:ripple-anim 0.6s ease-out forwards;' +
          'width:' + size + 'px;' +
          'height:' + size + 'px;' +
          'left:' + (x - size / 2) + 'px;' +
          'top:' + (y - size / 2) + 'px;';

        btn.appendChild(ripple);

        ripple.addEventListener('animationend', function () {
          ripple.remove();
        });
      });
    });

    // Inject keyframes if not already in stylesheet
    if (!document.querySelector('style[data-ripple]')) {
      var style = document.createElement('style');
      style.setAttribute('data-ripple', '');
      style.textContent =
        '@keyframes ripple-anim{' +
        '  0%{transform:scale(0);opacity:1;}' +
        '  100%{transform:scale(1);opacity:0;}' +
        '}';
      document.head.appendChild(style);
    }
  })();

  /* ========================================================================
   *  10. Stats Number Roll-up Animation
   * ======================================================================== */

  (function initStatsRollup() {
    var statEls = $$('.stat-number');
    if (!statEls.length) return;

    /**
     * Parse a stat element's data attributes.
     * Supported: data-target="100" data-suffix="篇" data-prefix=""
     * Or falls back to textContent parsing.
     */
    function parseStat(el) {
      var target = parseFloat(el.dataset.target);
      var suffix = el.dataset.suffix || '';
      var prefix = el.dataset.prefix || '';
      var duration = parseInt(el.dataset.duration, 10) || 2000;
      var decimals = 0;

      // If no data-target, try to parse textContent
      if (isNaN(target)) {
        var text = el.textContent.trim();
        var match = text.match(/^([^\d]*)([\d,.]+)(.*)$/);
        if (match) {
          prefix = match[1];
          suffix = match[3];
          var numStr = match[2].replace(/,/g, '');
          target = parseFloat(numStr);
          decimals = numStr.indexOf('.') !== -1 ? numStr.split('.')[1].length : 0;
        }
      }

      // Detect decimals from data-target
      if (!decimals && el.dataset.target && el.dataset.target.indexOf('.') !== -1) {
        decimals = el.dataset.target.split('.')[1].length;
      }

      return {
        target: isNaN(target) ? 0 : target,
        prefix: prefix,
        suffix: suffix,
        decimals: decimals,
        duration: duration
      };
    }

    function animateStat(el, config) {
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var t = clamp((timestamp - startTime) / config.duration, 0, 1);
        var eased = easeOutQuart(t);
        var current = config.target * eased;

        // Format number
        var display;
        if (config.decimals > 0) {
          display = current.toFixed(config.decimals);
        } else {
          display = Math.round(current).toLocaleString();
        }

        el.textContent = config.prefix + display + config.suffix;

        if (t < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
      var statsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var config = parseStat(el);
            animateStat(el, config);
            statsObserver.unobserve(el);
          }
        });
      }, { threshold: 0.3 });

      statEls.forEach(function (el) {
        // Store original text for parsing before clearing
        el._originalText = el.textContent;
        statsObserver.observe(el);
      });
    } else {
      // Fallback: just show target values
      statEls.forEach(function (el) {
        var config = parseStat(el);
        el.textContent = config.prefix + (config.decimals > 0
          ? config.target.toFixed(config.decimals)
          : Math.round(config.target).toLocaleString()) + config.suffix;
      });
    }
  })();

  // ===== Waitlist =====
  var wlBtn = document.getElementById('waitlist-btn');
  var wlInput = document.getElementById('waitlist-email');
  var wlSuccess = document.getElementById('waitlist-success');

  if (wlBtn && wlInput) {
    wlBtn.addEventListener('click', function() {
      var email = wlInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        wlInput.style.borderColor = '#f85149';
        wlInput.focus();
        return;
      }

      wlBtn.disabled = true;
      wlBtn.textContent = '提交中...';
      wlInput.style.borderColor = '#30363d';

      // Submit to waitlist endpoint
      fetch('https://kreed-waitlist.fenny-hou.workers.dev/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      }).then(function(r) {
        return r.json();
      }).then(function() {
        wlSuccess.classList.remove('hidden');
        wlBtn.textContent = '已加入';
        wlInput.value = '';
      }).catch(function() {
        // Fallback: store locally and show success
        try {
          var list = JSON.parse(localStorage.getItem('km_waitlist') || '[]');
          list.push({ email: email, time: new Date().toISOString() });
          localStorage.setItem('km_waitlist', JSON.stringify(list));
        } catch(e) {}
        wlSuccess.classList.remove('hidden');
        wlBtn.textContent = '已加入';
        wlInput.value = '';
      });
    });

    wlInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') wlBtn.click();
    });

    wlInput.addEventListener('input', function() {
      wlInput.style.borderColor = '#30363d';
    });
  }

});
