(() => {
  "use strict";

  const nav = document.querySelector(".grammar-level-nav");
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll(".grammar-level-link[href^=\"#\"]"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!links.length || !sections.length) return;

  let pendingTargetId = null;
  let previousPendingTargetTop = null;

  const getActivationLine = () => {
    const styles = window.getComputedStyle(nav);
    const stickyTop = Number.parseFloat(styles.top) || 0;
    return stickyTop + nav.offsetHeight + 12;
  };

  const setActiveLevel = (sectionId) => {
    links.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${sectionId}`;
      link.classList.toggle("is-current", isCurrent);

      if (isCurrent) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const getCurrentSection = () => {
    const activationLine = getActivationLine();
    let currentSection = sections[0];

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= activationLine) {
        currentSection = section;
      }
    });

    return currentSection;
  };

  const updateFromScrollPosition = () => {
    if (pendingTargetId) {
      const pendingSection = sections.find((section) => section.id === pendingTargetId);
      if (!pendingSection) {
        pendingTargetId = null;
        previousPendingTargetTop = null;
      } else {
        const targetTop = pendingSection.getBoundingClientRect().top;
        if (targetTop <= getActivationLine()) {
          pendingTargetId = null;
          previousPendingTargetTop = null;
        } else if (previousPendingTargetTop !== null && targetTop > previousPendingTargetTop + 1) {
          pendingTargetId = null;
          previousPendingTargetTop = null;
        } else {
          previousPendingTargetTop = targetTop;
          setActiveLevel(pendingTargetId);
          return;
        }
      }
    }

    const currentSection = getCurrentSection();
    if (currentSection) setActiveLevel(currentSection.id);
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href").slice(1);
      const target = sections.find((section) => section.id === targetId);
      if (target) {
        pendingTargetId = targetId;
        previousPendingTargetTop = target.getBoundingClientRect().top;
        setActiveLevel(targetId);
      }
    });
  });

  const initialTarget = window.location.hash
    ? sections.find((section) => `#${section.id}` === window.location.hash)
    : null;

  if (initialTarget) {
    setActiveLevel(initialTarget.id);
  } else {
    updateFromScrollPosition();
  }

  if ("IntersectionObserver" in window) {
    const styles = window.getComputedStyle(nav);
    const stickyTop = Number.parseFloat(styles.top) || 0;
    const activationOffset = Math.ceil(stickyTop + nav.offsetHeight + 12);
    const observer = new IntersectionObserver(
      updateFromScrollPosition,
      {
        root: null,
        rootMargin: `-${activationOffset}px 0px -65% 0px`,
        threshold: 0
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  window.addEventListener("scroll", updateFromScrollPosition, { passive: true });
  window.addEventListener("resize", updateFromScrollPosition, { passive: true });
  window.addEventListener("hashchange", () => {
    const target = sections.find((section) => `#${section.id}` === window.location.hash);
    if (target) setActiveLevel(target.id);
  });
})();