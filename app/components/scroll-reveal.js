"use client";

import { useEffect, useRef } from "react";

export default function ScrollReveal({ children, className = "" }) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    element.classList.add("scroll-reveal-ready");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.classList.add("scroll-reveal-visible");
        observer.unobserve(entry.target);
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      element.classList.remove("scroll-reveal-ready", "scroll-reveal-visible");
    };
  }, []);

  return (
    <div ref={elementRef} className={className}>{children}</div>
  );
}
