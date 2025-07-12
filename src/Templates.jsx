import ReactMarkdown from "react-markdown";
import { FaCheck } from "react-icons/fa";
import {templates} from "../public/Templates"



export default function Templates({selectedTemplate, setSelectedTemplate, setInputText}) {

      const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setInputText(template.content); // ✅ Put the template text into the textarea
  };
  

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">
        Choose your template
      </h2>

      <ul className="divide-y divide-slate-100 mb-6">
        {templates.map((template, index) => (
          <li
            key={index}
            onClick={() => handleTemplateSelect(template)}
            className={`cursor-pointer flex items-center justify-between px-4 py-3 hover:bg-slate-100 rounded ${
              selectedTemplate?.name === template.name ? "bg-slate-100" : ""
            }`}
          >
            <h4 className="text-base text-slate-700">{template.name}</h4>
            {selectedTemplate?.name === template.name && (
              <FaCheck className="text-green-500" />
            )}
          </li>
        ))}
      </ul>

      {/* {selectedTemplate && (
        <div className="bg-slate-50 p-4 border border-slate-200 rounded shadow prose max-w-none">
          <ReactMarkdown>{selectedTemplate.content}</ReactMarkdown>
        </div>
      )} */}
    </div>
  );
}
