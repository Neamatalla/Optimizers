import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { arTranslations } from '../translations/ar';

type Language = 'en' | 'ar';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    toggleLanguage: () => { },
    t: (text) => text,
});

export const useLanguage = () => useContext(LanguageContext);

// Build a reverse map for restoring English
const reverseMap: Record<string, string> = {};
Object.entries(arTranslations).forEach(([en, ar]) => {
    reverseMap[ar] = en;
});

// Elements to skip (inputs, textareas, scripts, styles, SVGs)
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'INPUT', 'TEXTAREA', 'SELECT', 'NOSCRIPT', 'CODE', 'PRE']);

function shouldSkipNode(node: Node): boolean {
    let parent = node.parentElement;
    while (parent) {
        if (SKIP_TAGS.has(parent.tagName)) return true;
        parent = parent.parentElement;
    }
    return false;
}

// Dynamic patterns: [regex, replacer function]
const dynamicPatterns: [RegExp, (match: string, ...groups: string[]) => string][] = [
    [/^Step (\d+) of (\d+)$/, (_m, step, total) => `الخطوة ${step} من ${total}`],
];

// Normalize curly/smart quotes to straight quotes for consistent lookup
function normalizeQuotes(s: string): string {
    return s.replace(/[\u2018\u2019\u201A\u201B]/g, "'").replace(/[\u201C\u201D\u201E\u201F]/g, '"');
}

function translateTextNode(node: Node): void {
    if (node.nodeType !== Node.TEXT_NODE) return;
    const text = node.nodeValue;
    if (!text || !text.trim()) return;
    if (shouldSkipNode(node)) return;

    // Store original if not already stored
    if (!(node as any).__origEN) {
        (node as any).__origEN = text;
    }

    const original = (node as any).__origEN as string;
    const trimmed = original.trim().replace(/\s+/g, ' ');
    const normalized = normalizeQuotes(trimmed);

    // 1) Direct full match (most common case)
    if (arTranslations[trimmed]) {
        node.nodeValue = original.replace(trimmed, arTranslations[trimmed]);
        return;
    }

    // 1b) Try with normalized quotes (curly → straight)
    if (normalized !== trimmed && arTranslations[normalized]) {
        node.nodeValue = arTranslations[normalized];
        return;
    }

    // 2) Try dynamic patterns on the full trimmed string
    for (const [pattern, replacer] of dynamicPatterns) {
        if (pattern.test(trimmed)) {
            node.nodeValue = trimmed.replace(pattern, replacer as any);
            return;
        }
    }

    // 3) No partial substring replacement — this prevents corruption
    //    where short keys like "Case", "Our", "Your" match inside other words.
    //    All translations should be full-node matches.
}

function restoreTextNode(node: Node): void {
    if (node.nodeType !== Node.TEXT_NODE) return;
    if ((node as any).__origEN) {
        node.nodeValue = (node as any).__origEN;
    }
}

function walkAndTranslate(root: Node): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
        translateTextNode(node);
    }
}

function walkAndRestore(root: Node): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
        restoreTextNode(node);
    }
}

// Also translate placeholder attributes, aria-labels, etc.
function translateAttributes(root: Element): void {
    const elements = root.querySelectorAll('[placeholder], [aria-label], [title]');
    elements.forEach((el) => {
        ['placeholder', 'aria-label', 'title'].forEach((attr) => {
            const val = el.getAttribute(attr);
            if (val && arTranslations[val.trim()]) {
                if (!(el as any)[`__orig_${attr}`]) {
                    (el as any)[`__orig_${attr}`] = val;
                }
                el.setAttribute(attr, arTranslations[val.trim()]);
            }
        });
    });
}

function restoreAttributes(root: Element): void {
    const elements = root.querySelectorAll('[placeholder], [aria-label], [title]');
    elements.forEach((el) => {
        ['placeholder', 'aria-label', 'title'].forEach((attr) => {
            if ((el as any)[`__orig_${attr}`]) {
                el.setAttribute(attr, (el as any)[`__orig_${attr}`]);
            }
        });
    });
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('language') as Language) || 'en';
        }
        return 'en';
    });

    const toggleLanguage = useCallback(() => {
        setLanguage(prev => {
            const nextLang = prev === 'en' ? 'ar' : 'en';
            localStorage.setItem('language', nextLang);
            return nextLang;
        });
    }, []);

    const t = useCallback((text: string) => {
        if (language === 'en') return text;
        const normalized = normalizeQuotes(text.trim().replace(/\s+/g, ' '));
        return arTranslations[normalized] || arTranslations[text.trim().replace(/\s+/g, ' ')] || text;
    }, [language]);

    useEffect(() => {
        // Set document direction & lang
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

        if (language === 'ar') {
            document.body.classList.add('lang-ar');
        } else {
            document.body.classList.remove('lang-ar');
        }

        if (language === 'ar') {
            // Small delay to let React finish rendering
            const translateTimer = setTimeout(() => {
                walkAndTranslate(document.body);
                translateAttributes(document.body);
            }, 100);

            const observer = new MutationObserver((mutations) => {
                // Batch translations to avoid excessive DOM walking
                requestAnimationFrame(() => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            mutation.addedNodes.forEach((node) => {
                                if (node.nodeType === Node.TEXT_NODE) {
                                    translateTextNode(node);
                                } else if (node.nodeType === Node.ELEMENT_NODE) {
                                    walkAndTranslate(node);
                                    translateAttributes(node as Element);
                                }
                            });
                        }
                    });
                });
            });

            observer.observe(document.body, { childList: true, subtree: true });

            // Re-translate periodically to catch lazy-loaded content
            const interval = setInterval(() => {
                walkAndTranslate(document.body);
                translateAttributes(document.body);
            }, 2000);

            return () => {
                clearTimeout(translateTimer);
                clearInterval(interval);
                observer.disconnect();
                walkAndRestore(document.body);
                restoreAttributes(document.body);
            };
        } else {
            // When switching back to English, restore all
            walkAndRestore(document.body);
            restoreAttributes(document.body);
        }
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
