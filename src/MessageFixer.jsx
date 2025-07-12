import React, { useState } from "react";
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

const MessageFixer = () => {
  const [inputText, setInputText] = useState("");
  const [modalContent, setModalContent] = useState([]);
  const [fixedText, setFixedText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [badWordCount, setBadWordCount] = useState(0);
  const [isCopied, setIsCopied] = useState(false); // ✅ new state
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const detectBugs = () => {
    const lines = inputText.split("\n");

    const highlighted = lines.map((line, lineIndex) => {
      const words = line.split(/\s+/);

      const highlightedWords = words.flatMap((word, wordIndex) => {
        const punctuation = word.match(/[.,!?]$/);
        const cleanWord = word.replace(/[.,!?]/g, "");
        const lower = cleanWord.toLowerCase();

        for (const [badWord, badReplacement] of Object.entries(badWordsMap)) {
          const badIndex = lower.indexOf(badWord);
          if (badIndex !== -1) {
            const before = word.slice(0, badIndex);
            const bad = word.slice(badIndex, badIndex + badWord.length);
            const after = word.slice(badIndex + badWord.length);
            const casedReplacement = matchCase(bad, badReplacement);

            const parts = [];

            if (before) {
              parts.push({
                original: before,
                isBad: false,
                isFixed: false,
                fixed: before,
                id: `${lineIndex}-${wordIndex}-before`,
              });
            }

            parts.push({
              original: bad,
              isBad: true,
              isFixed: false,
              fixed: casedReplacement,
              id: `${lineIndex}-${wordIndex}-bad`,
            });

            if (after || punctuation) {
              parts.push({
                original: after + (punctuation ? punctuation[0] : ""),
                isBad: false,
                isFixed: false,
                fixed: after + (punctuation ? punctuation[0] : ""),
                id: `${lineIndex}-${wordIndex}-after`,
              });
            }

            return parts;
          }
        }

        return [
          {
            original: word,
            isBad: false,
            isFixed: false,
            fixed: word,
            id: `${lineIndex}-${wordIndex}`,
          },
        ];
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
    setIsCopied(false); // reset copy state
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
      .map((line) => line.map((item) => item.fixed).join(" "))
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

  // ✅ Handle copy with checkmark feedback
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
    <div className="p-4 bg-[#fafafa] h-[100vh] w-[100vw]">
      <h1 className="text-[50px] font-semibold text-center mb-[50px]">
        BUG FIXING TOOLS{" "}
        <span className="text-emerald-500 font-bold">(V2.0)</span>
      </h1>
      <div className="flex gap-[50px] w-full justify-center items-start">
        <Templates
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          setInputText={setInputText}
        />
        <div className="flex flex-col w-[60%]">
          <div className="mb-4">
            <textarea
              id="id-01"
              placeholder="Write your message"
              rows="10"
              className="bg-white border-1 border-emerald-500 rounded-xl p-6 text-[18px] w-full h-[60vh] overflow-y-auto resize-none outline-none text-black focus:border-emerald-500"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={detectBugs}
              className="cursor-pointer bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600 transition"
            >
              Detect
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed top-0 left-0 z-20 flex items-center justify-center w-screen h-screen bg-slate-300/20 backdrop-blur-sm transition-opacity">
          <div className="flex flex-col h-[80vh] w-[60%] gap-6 overflow-hidden rounded bg-white p-6 text-slate-500 shadow-xl">
            <header className="flex items-center justify-between">
              <h3 className="text-[34px] font-medium text-slate-700">
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
              className={`text-sm mb-4 ${
                badWordCount === 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              <strong>{badWordCount}</strong> bad word(s) detected
            </div>

            <div className="overflow-y-auto overflow-x-hidden h-full border rounded p-4 text-[18px] text-black leading-relaxed whitespace-pre-wrap break-words">
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

            <div className="flex justify-end gap-3">
              <button
                onClick={resolveBugs}
                className="cursor-pointer bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
              >
                Resolve
              </button>

              {/* ✅ Copy button with checkmark */}
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

      <footer className="fixed bottom-[5%] text-center w-full">
        Developed by{" "}
        <span className="font-semibold text-emerald-600">Md. Hasan Kha</span>
      </footer>
    </div>
  );
};

export default MessageFixer;
