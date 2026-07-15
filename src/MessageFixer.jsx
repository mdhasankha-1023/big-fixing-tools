import React, { useState, useMemo } from "react";
import { badWordsMap } from "../public/Badword";
import Templates from "./Templates";

// ✅ Helper to match casing
const matchCase = (original, replacement) => {
  return [...replacement]
    .map((char, i) => {
      const originalChar = original[i];
      if (originalChar && originalChar === originalChar.toUpperCase()) {
        return char.toUpperCase();
      }
      return char.toLowerCase();
    })
    .join("");
};


const findAllBadMatches = (lower) => {
  const claimed = [];
  const isOverlapping = (start, end) =>
    claimed.some((r) => start < r.end && end > r.start);

  const matches = [];

  for (const [badWord, badReplacement] of Object.entries(badWordsMap)) {
    if (!badWord) continue;

    let searchFrom = 0;
    let idx;
    while ((idx = lower.indexOf(badWord, searchFrom)) !== -1) {
      const start = idx;
      const end = idx + badWord.length;

      if (!isOverlapping(start, end)) {
        matches.push({ start, end, badWord, badReplacement });
        claimed.push({ start, end });
      }

      searchFrom = idx + 1;
    }
  }

  return matches.sort((a, b) => a.start - b.start);
};

const MessageFixer = () => {
  const [inputText, setInputText] = useState("");
  const [modalContent, setModalContent] = useState([]);
  const [fixedText, setFixedText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [badWordCount, setBadWordCount] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // ✅ Controls the mobile hamburger/dropdown for templates
  const [isMobileTemplateOpen, setIsMobileTemplateOpen] = useState(false);

  // ✅ Dynamic limits based on template name
  const characterLimit = useMemo(() => {
    if (!selectedTemplate) return 2500;

    switch (selectedTemplate.name) {
      case "Extension Request":
        return 400;
      case "Meting Follow-up":
      case "Follow Up":
        return 2500;
      case "First Update":
      case "Working Progress":
        return 2500;
      case "Delivery Follow-up":
      case "Delivery Message":
        return 2500;
      default:
        return 2500;
    }
  }, [selectedTemplate]);

  const isOverLimit = inputText.length > characterLimit;

  const detectBugs = () => {
    const lines = inputText.split("\n");

    const highlighted = lines.map((line, lineIndex) => {
      const words = line.split(/\s+/);

      const highlightedWords = words.flatMap((word, wordIndex) => {
        const cleanWord = word.replace(/[.,!?]/g, "");
        const lower = cleanWord.toLowerCase();

        const matches = findAllBadMatches(lower);

        if (matches.length === 0) {
          return [
            {
              original: word,
              isBad: false,
              isFixed: false,
              fixed: word,
              id: `${lineIndex}-${wordIndex}`,
              wordIndex,
            },
          ];
        }

        const parts = [];
        let cursor = 0;

        matches.forEach((m, mIdx) => {
          if (m.start > cursor) {
            const segment = word.slice(cursor, m.start);
            parts.push({
              original: segment,
              isBad: false,
              isFixed: false,
              fixed: segment,
              id: `${lineIndex}-${wordIndex}-seg${mIdx}-before`,
              wordIndex,
            });
          }

          const badSegment = word.slice(m.start, m.end);
          const casedReplacement = matchCase(badSegment, m.badReplacement);

          parts.push({
            original: badSegment,
            isBad: true,
            isFixed: false,
            fixed: casedReplacement,
            id: `${lineIndex}-${wordIndex}-seg${mIdx}-bad`,
            wordIndex,
          });

          cursor = m.end;
        });

        if (cursor < word.length) {
          const segment = word.slice(cursor);
          parts.push({
            original: segment,
            isBad: false,
            isFixed: false,
            fixed: segment,
            id: `${lineIndex}-${wordIndex}-after`,
            wordIndex,
          });
        }

        return parts;
      });

      return highlightedWords;
    });

    const countBadWords = highlighted
      .flat()
      .filter((item) => item.isBad).length;

    setModalContent(highlighted);
    setBadWordCount(countBadWords);
    setIsResolved(false);
    setIsModalOpen(true);
    setIsCopied(false);
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

    // ✅ Group fragments that belong to the SAME word (same wordIndex) and
    // concatenate them with NO space in between. Only separate words get
    // joined with a space. This prevents stray spaces when a bad word
    // (e.g. "@") is replaced with an empty string.
    const fixedString = resolved
      .map((line) => {
        const wordGroups = [];
        const indexMap = new Map();

        line.forEach((item) => {
          if (!indexMap.has(item.wordIndex)) {
            indexMap.set(item.wordIndex, []);
            wordGroups.push(item.wordIndex);
          }
          indexMap.get(item.wordIndex).push(item.fixed);
        });

        return wordGroups
          .map((wi) => indexMap.get(wi).join(""))
          .filter((word) => word.length > 0)
          .join(" ");
      })
      .join("\n");

    setInputText(fixedString);
    setFixedText(fixedString);
    setModalContent(resolved);
    setIsResolved(true);

    const updatedBadWordCount = resolved
      .flat()
      .filter((item) => item.isBad && !item.isFixed).length;

    setBadWordCount(updatedBadWordCount);
  };

  const handleCopyAndClose = () => {
    navigator.clipboard.writeText(fixedText || inputText).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        setIsModalOpen(false);
      }, 2000);
    });
  };

  return (
    <div className="p-4 bg-[#fafafa] min-h-[100vh] w-full overflow-x-hidden">
      <h1 className="text-[28px] sm:text-[36px] md:text-[50px] font-semibold text-center mb-[24px] md:mb-[50px] px-2">
        BUG FIXING TOOLS{" "}
        <span className="text-emerald-500 font-bold">(V2.2)</span>
      </h1>

      {/* ✅ Mobile-only hamburger button to open Templates dropdown */}
      <div className="md:hidden mb-4 px-1">
        <button
          onClick={() => setIsMobileTemplateOpen((prev) => !prev)}
          className="w-full flex items-center justify-between bg-white border-2 border-emerald-500 rounded-xl px-4 py-3 text-emerald-600 font-medium"
        >
          <span>
            {selectedTemplate ? `Template: ${selectedTemplate.name}` : "Select Template"}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-5 h-5 transition-transform ${
              isMobileTemplateOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown panel */}
        {isMobileTemplateOpen && (
          <div className="mt-2 bg-white border-2 border-emerald-200 rounded-xl p-3 max-h-[60vh] overflow-y-auto shadow-lg">
            <Templates
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={(tpl) => {
                setSelectedTemplate(tpl);
                setIsMobileTemplateOpen(false); // close after picking
              }}
              setInputText={setInputText}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-[50px] w-full justify-center items-start px-1 md:px-0">

        {/* ✅ Left Column: Templates — hidden on mobile (handled by dropdown above), visible from md up */}
        <div className="hidden md:flex md:flex-col">
          {/* This empty div (h-6 + mb-2) aligns the template list with the textarea */}
          <div className="h-6 mb-2"></div>
          <Templates
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            setInputText={setInputText}
          />
        </div>

        {/* ✅ Right Column: Message Fixer */}
        <div className="flex flex-col w-full md:w-[60%]">
          {/* Character Count Header (Height = h-6 + mb-2) */}
          <div className="flex flex-wrap justify-between items-end gap-1 mb-2 px-1">
            <div className="h-6">
              {isOverLimit && (
                <span className="text-red-500 font-medium text-xs sm:text-sm flex items-center gap-1 animate-pulse">
                  ⚠️ The max number reached. You need to optimize this.
                </span>
              )}
            </div>
            <div
              className={`text-xs sm:text-sm font-bold px-2 py-1 rounded ${
                isOverLimit ? "bg-red-100 text-red-600" : "text-emerald-600"
              }`}
            >
              {inputText.length} / {characterLimit}
            </div>
          </div>

          <div className="mb-4">
            <textarea
              id="id-01"
              placeholder="Write your message"
              rows="10"
              className={`bg-white border-2 rounded-xl p-4 md:p-6 text-base md:text-[18px] w-full h-[45vh] md:h-[60vh] overflow-y-auto resize-none outline-none text-black transition-all ${
                isOverLimit
                  ? "border-red-500 focus:border-red-600 shadow-sm"
                  : "border-emerald-500 focus:border-emerald-600"
              }`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={detectBugs}
              disabled={isOverLimit}
              className={`px-5 py-2 rounded font-medium transition ${
                isOverLimit
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "cursor-pointer bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              Detect
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed top-0 left-0 z-20 flex items-center justify-center w-screen h-screen bg-slate-300/20 backdrop-blur-sm transition-opacity p-3 md:p-0">
          <div className="flex flex-col h-[85vh] md:h-[80vh] w-full md:w-[60%] gap-4 md:gap-6 overflow-hidden rounded bg-white p-4 md:p-6 text-slate-500 shadow-xl">
            <header className="flex items-center justify-between">
              <h3 className="text-[22px] md:text-[34px] font-medium text-slate-700">
                FIXED YOUR BUG
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer text-emerald-500 hover:bg-emerald-100 p-2 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </header>

            <div
              className={`text-sm mb-2 md:mb-4 ${
                badWordCount === 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              <strong>{badWordCount}</strong> bad word(s) detected
            </div>

            <div className="overflow-y-auto overflow-x-hidden h-full border rounded p-3 md:p-4 text-base md:text-[18px] text-black leading-relaxed whitespace-pre-wrap break-words">
              {modalContent.map((line, lineIndex) => (
                <div key={lineIndex}>
                  {line.map((item) => {
                    let className = "mr-1 inline";
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

            <div className="flex flex-wrap justify-end gap-3">
              <button
                onClick={resolveBugs}
                className="cursor-pointer bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
              >
                Resolve
              </button>

              <button
                onClick={handleCopyAndClose}
                className={`flex items-center gap-2 cursor-pointer px-5 py-2 rounded transition border ${
                  isCopied
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "text-emerald-600 hover:bg-emerald-100 border-emerald-400"
                }`}
              >
                {isCopied ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied
                  </>
                ) : (
                  "Copy"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="static md:fixed md:bottom-[5%] text-center w-full mt-8 md:mt-0 pb-4">
        Developed by{" "}
        <span className="font-semibold text-emerald-600">Md. Hasan Kha</span>
      </footer>
    </div>
  );
};

export default MessageFixer;
