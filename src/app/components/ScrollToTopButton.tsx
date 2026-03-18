import { useState, useEffect, useCallback } from "react";

export default function ScrollToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const heroSection = document.querySelector(".header-scroll-container");
        if (!heroSection) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Show button when hero is NOT intersecting (scrolled past)
                setVisible(!entry.isIntersecting);
            },
            { threshold: 0 }
        );

        observer.observe(heroSection);
        return () => observer.disconnect();
    }, []);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <button
            className={`scroll-to-top-btn ${visible ? "scroll-to-top-visible" : ""}`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title="Back to top"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M10 16V4M10 4L4 10M10 4L16 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}
