import React, { useState } from "react";
import { badWordsMap } from "../public/Badword";

const MessageFixer = () => {
    const [inputText, setInputText] = useState("");
    const [modalContent, setModalContent] = useState([]);
    const [fixedText, setFixedText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isResolved, setIsResolved] = useState(false);
    const [badWordCount, setBadWordCount] = useState(0); // Track bad word count

    const detectBugs = () => {
        const lines = inputText.split("\n"); // Split by lines to preserve paragraph structure

        const highlighted = lines.map((line, lineIndex) => {
            const words = line.split(/\s+/); // Split line into words
            const highlightedWords = words.map((word, wordIndex) => {
                const punctuation = word.match(/[.,!?]$/); // Handle punctuation
                const cleanWord = word.replace(/[.,!?]/g, ""); // Remove punctuation
                const lower = cleanWord.toLowerCase();
                const badWordReplacement = badWordsMap[lower]; // Look for a bad word replacement

                return {
                    original: word,
                    isBad: !!badWordReplacement,
                    isFixed: false,
                    fixed: badWordReplacement
                        ? badWordReplacement + (punctuation ? punctuation[0] : "") // Add punctuation back
                        : word,
                    id: `${lineIndex}-${wordIndex}`, // Unique ID for each word
                };
            });

            return highlightedWords; // Return the highlighted words for this line
        });

        const countBadWords = highlighted.flat().filter((item) => item.isBad).length; // Count bad words

        setModalContent(highlighted);
        setBadWordCount(countBadWords); // Update the bad word count
        setIsResolved(false);
        setIsModalOpen(true);
    };

    const resolveBugs = () => {
        const resolved = modalContent.map((line) =>
            line.map((item) => {
                if (item.isBad) {
                    return { ...item, isFixed: true };
                }
                return item;
            })
        );

        const fixedString = resolved
            .map((line) =>
                line
                    .map((item) => item.fixed)
                    .join(" ")
            )
            .join("\n"); // Reassemble the string with newlines

        setInputText(fixedString);
        setFixedText(fixedString);
        setModalContent(resolved);
        setIsResolved(true);

        // Recalculate bad words after resolving
        const updatedBadWordCount = resolved
            .flat()
            .filter((item) => item.isBad && !item.isFixed).length;
        setBadWordCount(updatedBadWordCount); // Update the bad word count
    };

    const handleCopyAndClose = () => {
        navigator.clipboard.writeText(fixedText || inputText).then(() => {
            setIsModalOpen(false);
        });
    };

    return (
        <div className="w-[60%] mt-10 p-4 mx-auto">
            {/* Input Page Title */}
            <h1 className="text-[50px] font-semibold text-center mb-6">BUG FIXING TOOLS</h1>

            {/* Textarea */}
            <div className="relative mb-4">
                <textarea
                    id="id-01"
                    placeholder="Write your message"
                    rows="10"
                    className="text-[18px] w-full h-[50vh] overflow-auto resize-none p-[30px] text-sm border rounded outline-none border-slate-200 text-slate-500 focus:border-emerald-500"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <label
                    htmlFor="id-01"
                    className="cursor-text absolute left-4 -top-3 text-xs text-slate-400 bg-white px-1"
                >
                    Write your message
                </label>
            </div>

            {/* Detect Button */}
            <div className="flex justify-end">
                <button
                    onClick={detectBugs}
                    className="cursor-pointer bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600 transition"
                >
                    Detect
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed top-0 left-0 z-20 flex items-center justify-center w-screen h-screen bg-slate-300/20 backdrop-blur-sm transition-opacity">
                    <div className="flex flex-col h-[80vh] w-[60%] gap-6 overflow-hidden rounded bg-white p-6 text-slate-500 shadow-xl">
                        {/* Modal Header Title */}
                        <header className="flex items-center justify-between">
                            <h3 className="text-[34px] font-medium text-slate-700">FIXED YOUR BUG</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="cursor-pointer text-emerald-500 hover:bg-emerald-100 p-2 rounded-full"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </header>

                        {/* Counter - display bad word count */}
                        <div
                            className={`text-sm mb-4 ${badWordCount === 0 ? 'text-green-500' : 'text-red-500'}`}
                        >
                            <strong>{badWordCount}</strong> bad word(s) detected
                        </div>

                        {/* Modal body - highlighted words */}
                        <div
                            className="overflow-auto h-full border rounded p-4 text-base leading-relaxed"
                            style={{ whiteSpace: "pre-wrap" }} // Preserve formatting (spaces, newlines)
                        >
                            {modalContent.map((line, lineIndex) => (
                                <div key={lineIndex}>
                                    {line.map((item) => {
                                        let className = "mr-1";
                                        if (item.isBad && !item.isFixed) {
                                            className += " bg-red-500 text-white px-1 rounded";
                                        } else if (item.isFixed) {
                                            className += " bg-green-500 text-white px-1 rounded";
                                        }
                                        return (
                                            <span key={item.id} className={className}>
                                                {item.isFixed ? item.fixed : item.original}
                                            </span>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Modal actions */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={resolveBugs}
                                className="cursor-pointer bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
                            >
                                Resolve
                            </button>
                            <button
                                onClick={handleCopyAndClose}
                                className="cursor-pointer text-emerald-600 hover:bg-emerald-100 px-5 py-2 rounded transition border border-emerald-400"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageFixer;