document.addEventListener("DOMContentLoaded", () => {
  // 1. Console Opening & Loader on the Outer Lid!
  const outerLoadingBar = document.querySelector(".outer-loading-bar");
  const lidLoadingContainer = document.querySelector(".lid-loading-container");
  const outerOpenBtn = document.querySelector(".outer-open-btn");
  const powerLed = document.querySelector(".power-led-indicator");
  const bottomWelcomeText = document.querySelector(".bottom-welcome-text");
  const titleScreenContent = document.querySelector(".title-screen-content");
  
  const consoleBody = document.querySelector(".console-body");
  const consoleLid = document.querySelector(".console-lid");
  const consoleLidOuter = document.querySelector(".console-lid-outer");
  const scrollIndicator = document.querySelector(".scroll-indicator");
  
  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 12) + 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      setTimeout(() => {
        // Hide loader, show the glowing "TAP TO OPEN" button on outer lid
        lidLoadingContainer.style.display = "none";
        outerOpenBtn.style.display = "block";
        // Light up LED green if exists!
        if (powerLed) powerLed.classList.add("ready");
        
        // Play system booted sound
        playBleep(523.25, "sine", 0.08); // C5
        setTimeout(() => playBleep(659.25, "sine", 0.15), 80); // E5
      }, 500);
    }
    outerLoadingBar.style.width = progress + "%";
  }, 120);

  // Main function to open the 3DS Clamshell
  function openConsole() {
    if (consoleLid.classList.contains("opened")) return;
    
    // Open 3DS Lid and tilt body slightly
    consoleBody.classList.add("opened");
    consoleLid.classList.add("opened");
    
    // Play structural hinge open sound! (Double click mechanical effect)
    playBleep(150, "triangle", 0.1); 
    setTimeout(() => playBleep(180, "triangle", 0.08), 80);
    
    // Turn on the inner screens with delay
    setTimeout(() => {
      // Show gorgeous pixel screen graphics
      titleScreenContent.style.display = "block";
      bottomWelcomeText.style.display = "block";
      
      // Play 3DS OS welcome chime (retro game tone)
      playBleep(587.33, "triangle", 0.08); // D5
      setTimeout(() => playBleep(783.99, "sine", 0.08), 100); // G5
      setTimeout(() => playBleep(880.00, "sine", 0.08), 200); // A5
      setTimeout(() => playBleep(1174.66, "sine", 0.25), 300); // D6
      
      // Unlock page scrolling and invite the user
      setTimeout(() => {
        scrollIndicator.classList.add("visible");
        document.body.style.overflowY = "auto";
        window.scrollBy({ top: 320, behavior: "smooth" });
      }, 1200);
    }, 400);
  }

  // Click listeners on the closed console cover to trigger opening!
  consoleLidOuter.addEventListener("click", openConsole);
  
  // Interactive Overlays for D-Pad and Action Buttons
  const dPad = document.querySelector(".d-pad");
  const actionBtns = document.querySelectorAll(".action-btn");
  
  if (dPad) {
    dPad.addEventListener("click", () => {
      // Satisfying heavy D-pad click sound
      playBleep(220, "triangle", 0.06);
      
      // Randomly tweak CRT screen glow hue for interactive reaction!
      const screenGlow = document.querySelector(".screen-glow");
      if (screenGlow) {
        screenGlow.style.background = `radial-gradient(circle at center, hsla(${Math.random() * 360}, 100%, 50%, 0.15) 0%, transparent 70%)`;
      }
    });
  }
  
  actionBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Play a custom frequency bleep for each key (A, B, X, Y)
      let freq = 440;
      if (btn.classList.contains("a")) freq = 523.25; // C5
      if (btn.classList.contains("b")) freq = 493.88; // B4
      if (btn.classList.contains("x")) freq = 659.25; // E5
      if (btn.classList.contains("y")) freq = 587.33; // D5
      
      playBleep(freq, "square", 0.08);
      
      // Screen flash reaction!
      const topScreen = document.querySelector(".screen-top");
      if (topScreen) {
        topScreen.style.filter = "brightness(1.5) contrast(1.1)";
        setTimeout(() => topScreen.style.filter = "none", 100);
      }
    });
  });

  // Lock scroll initially
  document.body.style.overflowY = "hidden";

  // Synthesize game sound effects using Web Audio API (Zero external audio files needed!)
  function playBleep(freq, type = "sine", duration = 0.1) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext is blocked or not supported
    }
  }

  // 2. Scroll Animation (IntersectionObserver)
  const sections = document.querySelectorAll("section");
  const observerOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: "0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        
        // Stamp Overview Section: animate progress bars + pop stamps in
        if (entry.target.id === "section-stamps-overview") {
          animateStampOverview();
        }
        
        // If it's Section 1 (Trainer Cards), light up the stamps sequentially!
        if (entry.target.id === "section-trainers") {
          lightUpStamps();
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

  // Stamp Overview: progress bars + sequential stamp pop-in animation
  let stampOverviewAnimated = false;
  function animateStampOverview() {
    if (stampOverviewAnimated) return;
    stampOverviewAnimated = true;

    // Animate progress bars: store target widths, reset to 0, then animate
    const barFills = document.querySelectorAll(".stat-bar-fill");
    barFills.forEach(bar => {
      const targetWidth = bar.style.width || "0%";
      bar.setAttribute("data-target-width", targetWidth);
      bar.style.transition = "none";
      bar.style.width = "0%";
    });
    setTimeout(() => {
      barFills.forEach(bar => {
        bar.style.transition = "width 1.4s cubic-bezier(0.16, 1, 0.3, 1)";
        bar.style.width = bar.getAttribute("data-target-width");
      });
    }, 300);

    // Fade + scale in the whole stamp image
    const caseImg = document.querySelector(".stamp-case-bg");
    if (caseImg) {
      caseImg.style.opacity = "0";
      caseImg.style.transform = "scale(0.97) translateY(12px)";
      caseImg.style.transition = "none";
      setTimeout(() => {
        caseImg.style.transition = "opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
        caseImg.style.opacity = "1";
        caseImg.style.transform = "scale(1) translateY(0)";
        playBleep(400, "sine", 0.06);
      }, 150);
    }

    // Fade hover zones in staggered after image appears
    const hoverZones = document.querySelectorAll(".stamp-hover-zone");
    hoverZones.forEach((zone, idx) => {
      zone.style.opacity = "0";
      zone.style.transition = "none";
      setTimeout(() => {
        zone.style.transition = "opacity 0.4s ease";
        zone.style.opacity = "1";
      }, 500 + idx * 50);
    });
  }

  // 3D parallax tilt on the stamp case tray
  const stampCaseTray = document.querySelector(".stamp-case-tray");
  if (stampCaseTray) {
    stampCaseTray.addEventListener("mousemove", (e) => {
      const rect = stampCaseTray.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 to 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      const tiltX = y * -6;   // up/down tilt, max ±6deg
      const tiltY = x *  8;   // left/right tilt, max ±8deg
      stampCaseTray.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    stampCaseTray.addEventListener("mouseleave", () => {
      stampCaseTray.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
      stampCaseTray.style.transition = "transform 0.6s ease";
    });
    stampCaseTray.addEventListener("mouseenter", () => {
      stampCaseTray.style.transition = "transform 0.12s ease";
    });
  }

  // Light up stamps with a sequential delay
  function lightUpStamps() {
    const slots = document.querySelectorAll(".stamp-slot");
    slots.forEach((slot, index) => {
      // Only light up if it contains a stamp image (collected slots)
      if (slot.querySelector("img")) {
        setTimeout(() => {
          if (!slot.classList.contains("collected")) {
            slot.classList.add("collected");
            // Play a tiny high-pitched collect bleep for stamps
            if (index % 2 === 0) {
              playBleep(600 + index * 40, "sine", 0.08);
            }
          }
        }, 150 * index);
      }
    });
  }

  // 3. Dahun's Chapter: Time Slider Crossfade
  const timeSlider = document.querySelector(".custom-range-slider");
  const morphP2 = document.querySelector(".morph-painting.p2");
  const eraLabel = document.querySelector(".painting-era");
  const titleLabel = document.querySelector(".painting-name");

  if (timeSlider) {
    timeSlider.addEventListener("input", (e) => {
      const val = e.target.value;
      // Crossfade opacity of the second image (Impressionism)
      morphP2.style.opacity = val / 100;

      // Dynamically update era text and details based on slider position
      if (val < 35) {
        eraLabel.textContent = "RENAISSANCE - 르네상스 시기 (1500년대)";
        titleLabel.textContent = "보티첼리 - 비너스의 탄생 (빛과 선의 대칭 조화)";
      } else if (val >= 35 && val < 70) {
        eraLabel.textContent = "TRANSITION - 빛과 어둠의 과도기 (1700년대)";
        titleLabel.textContent = "시간 축 변화 시뮬레이션: 빛의 유기적 흐름 관찰";
      } else {
        eraLabel.textContent = "IMPRESSIONISM - 인상주의 시기 (1800년대 후반)";
        titleLabel.textContent = "모네 - 수련 (대기 속 변화하는 동적 빛의 집착)";
      }
    });
  }

  // 4. 3D Metallic Badge Mouse Effect for all proposed stamps!
  const badgeCards = document.querySelectorAll(".badge-3d-card");
  badgeCards.forEach(badgeCard => {
    badgeCard.addEventListener("mousemove", (e) => {
      const rect = badgeCard.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate within client
      const y = e.clientY - rect.top;  // y coordinate within client
      
      // Calculate rotation based on cursor offset from card center
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = -(y - centerY) / 10;
      const rotateY = (x - centerX) / 10;
      
      badgeCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    badgeCard.addEventListener("mouseleave", () => {
      badgeCard.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  });

  // 5. Hyun's Chapter: Color Filter Grid
  const galleryGrid = document.querySelector(".filtered-paintings-grid");
  const paletteBtns = document.querySelectorAll(".palette-btn");
  const filteredItems = document.querySelectorAll(".filtered-item");

  function updateGalleryMinHeight() {
    if (!galleryGrid) return;
    
    // Save currently active color filter
    const activeBtn = document.querySelector(".palette-btn.active");
    const activeColor = activeBtn ? activeBtn.dataset.color : "all";
    
    // 1. Temporarily show all items to get true layout height
    filteredItems.forEach(item => {
      item.classList.remove("hidden");
    });
    
    // Reset min-height to measure naturally
    galleryGrid.style.minHeight = "auto";
    const fullHeight = galleryGrid.offsetHeight;
    
    // 2. Set min-height to the measured full height
    galleryGrid.style.minHeight = `${fullHeight}px`;
    
    // 3. Re-apply the active filter
    filteredItems.forEach(item => {
      if (activeColor !== "all" && item.dataset.color !== activeColor) {
        item.classList.add("hidden");
      }
    });
  }

  paletteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Toggle active states
      paletteBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const filterColor = btn.dataset.color;
      playBleep(350, "triangle", 0.05);

      filteredItems.forEach(item => {
        if (filterColor === "all" || item.dataset.color === filterColor) {
          item.classList.remove("hidden");
        } else {
          item.classList.add("hidden");
        }
      });
    });
  });

  // Calculate gallery height on load and after short delay/window load for content sizing stability
  updateGalleryMinHeight();
  setTimeout(updateGalleryMinHeight, 500);
  window.addEventListener("load", updateGalleryMinHeight);

  // 6. Yeram's Chapter: Same Feeling Emotion Matcher
  const leftItems = document.querySelectorAll(".matcher-column.left .matcher-item");
  const rightItems = document.querySelectorAll(".matcher-column.right .matcher-item");
  const svgOverlay = document.querySelector(".matcher-svg-overlay");
  
  let selectedLeft = null;
  let matches = {}; // leftId -> rightId

  leftItems.forEach(leftItem => {
    leftItem.addEventListener("click", () => {
      if (leftItem.classList.contains("matched")) return;
      
      playBleep(300, "sine", 0.06);

      leftItems.forEach(item => item.classList.remove("active"));
      leftItem.classList.add("active");
      selectedLeft = leftItem;
      
      drawCurrentPreviewLine();
    });
  });

  rightItems.forEach(rightItem => {
    rightItem.addEventListener("click", () => {
      if (!selectedLeft || rightItem.classList.contains("matched")) return;

      const emotionLeft = selectedLeft.dataset.emotion;
      const emotionRight = rightItem.dataset.emotion;

      if (emotionLeft === emotionRight) {
        // MATCH SUCCESS!
        playBleep(880, "sine", 0.1);
        setTimeout(() => playBleep(1320, "sine", 0.2), 80);

        selectedLeft.classList.add("matched");
        rightItem.classList.add("matched");
        selectedLeft.classList.remove("active");
        
        matches[selectedLeft.id] = rightItem.id;
        
        selectedLeft = null;
        leftItems.forEach(item => item.classList.remove("active"));
        
        drawLines();
        checkGameComplete();
      } else {
        // MATCH FAIL - Blinks red
        playBleep(180, "sawtooth", 0.25);
        selectedLeft.classList.add("shake");
        rightItem.classList.add("shake");
        setTimeout(() => {
          selectedLeft.classList.remove("shake");
          rightItem.classList.remove("shake");
        }, 500);
      }
    });
  });

  // Draw permanent connecting lines
  function drawLines() {
    svgOverlay.innerHTML = "";
    
    Object.keys(matches).forEach(leftId => {
      const rightId = matches[leftId];
      const leftEl = document.getElementById(leftId);
      const rightEl = document.getElementById(rightId);
      
      if (leftEl && rightEl) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const coords = getCenterPoints(leftEl, rightEl);
        
        const pathData = `M ${coords.x1} ${coords.y1} C ${(coords.x1 + coords.x2)/2} ${coords.y1}, ${(coords.x1 + coords.x2)/2} ${coords.y2}, ${coords.x2} ${coords.y2}`;
        line.setAttribute("d", pathData);
        line.setAttribute("class", "connection-line permanent");
        svgOverlay.appendChild(line);
      }
    });
  }

  // Get coordinates of item centers relative to the overlay
  function getCenterPoints(el1, el2) {
    const rectOverlay = svgOverlay.getBoundingClientRect();
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();
    
    // Calculate right edge of element 1, and left edge of element 2
    const x1 = rect1.right - rectOverlay.left;
    const y1 = (rect1.top + rect1.bottom)/2 - rectOverlay.top;
    
    const x2 = rect2.left - rectOverlay.left;
    const y2 = (rect2.top + rect2.bottom)/2 - rectOverlay.top;
    
    return { x1, y1, x2, y2 };
  }

  function drawCurrentPreviewLine() {
    // Optional preview line if mouse moves (simplified: omitted for cleaner visual unless actively matched)
  }

  function checkGameComplete() {
    const totalLeft = leftItems.length;
    const matchedCount = Object.keys(matches).length;
    if (matchedCount === totalLeft) {
      const matcherTitle = document.querySelector(".matcher-instruction");
      matcherTitle.textContent = "🏆 축하합니다! 모든 감정이 초시공간을 넘어 유기적으로 연결되었습니다!";
      matcherTitle.style.color = "var(--yellow)";
      matcherTitle.style.fontSize = "13px";
      
      // Play game completion retro fanfare
      setTimeout(() => playBleep(523.25, "square", 0.1), 100); // C5
      setTimeout(() => playBleep(659.25, "square", 0.1), 200); // E5
      setTimeout(() => playBleep(783.99, "square", 0.1), 300); // G5
      setTimeout(() => playBleep(1046.50, "square", 0.3), 400); // C6
    }
  }

  // Recalculate line offsets and stable grid height on resize
  window.addEventListener("resize", () => {
    drawLines();
    updateGalleryMinHeight();
  });
});
