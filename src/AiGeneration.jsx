import React, { useState } from "react";

// Use your real API key here


export default function AiGeneration() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
  if (!prompt.trim()) {
    setOutput("Please enter a prompt first.");
    return;
  }

  setLoading(true);
  setOutput("");

  try {
    const response = await fetch("https://api.deepai.org/api/text-generator", {
      method: "POST", // ✅ Make sure this is POST
      headers: {
        "Api-Key": "ca348030-0506-46b6-ae2f-c51a08e937bd",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `text=${encodeURIComponent(prompt)}`, // ✅ Must be sent as form-urlencoded
    });

    const data = await response.json();

    if (data.output) {
      setOutput(data.output);
    } else {
      setOutput("No output received from AI.");
    }
  } catch (error) {
    console.error("Error generating text:", error);
    setOutput("Something went wrong. Check the console for details.");
  }

  setLoading(false);
};



  return (
    <div style={{ padding: 30, maxWidth: 600, margin: "auto" }}>
      <h1>🧠 AI Text Generator (DeepAI)</h1>
      <textarea
        rows="5"
        placeholder="Type your prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          fontSize: "16px",
          borderRadius: 8,
          border: "1px solid #ccc",
          resize: "none",
        }}
      ></textarea>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          marginTop: 15,
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Text"}
      </button>

      <div
        style={{
          marginTop: 25,
          backgroundColor: "#f7f7f7",
          padding: 15,
          borderRadius: 8,
          minHeight: 100,
          whiteSpace: "pre-wrap",
        }}
      >
        {output}
      </div>
    </div>
  );
}
