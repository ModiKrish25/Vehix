import { useEffect, useRef } from 'react';

/**
 * useScrollReveal – attaches an IntersectionObserver that adds .in-view
 * to elements with scroll-reveal CSS classes. Re-runs when `deps` change
 * so elements rendered after async data loads are also observed.
 */
const useScrollReveal = (deps = []) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const root = containerRef.current || document;

        // querySelectorAll may not be on document fragments
        if (!root || typeof root.querySelectorAll !== 'function') return;

        const targets = root.querySelectorAll(
            '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
        );

        if (targets.length === 0) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
        );

        targets.forEach(t => {
            // If already in viewport on first render, immediately show it
            const rect = t.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                t.classList.add('in-view');
            } else {
                io.observe(t);
            }
        });

        return () => io.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return containerRef;
};

export default useScrollReveal;
