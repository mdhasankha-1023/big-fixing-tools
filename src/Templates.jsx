import ReactMarkdown from "react-markdown";
import { FaCheck } from "react-icons/fa";
import {templates} from "../public/Templates"



export default function Templates({selectedTemplate, setSelectedTemplate, setInputText}) {

      const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setInputText(template.content); // ✅ Put the template text into the textarea
  };
  

  return (
    <div className="p-4 bg-white border-emerald-500 border-1 rounded-xl">
      <h2 className="text-2xl font-semibold text-emerald-500 mb-4">
        Choose your template
      </h2>

      <ul className="divide-y divide-slate-100 mb-6">
        {templates.map((template, index) => (
          <li
            key={index}
            onClick={() => handleTemplateSelect(template)}
            className={`group cursor-pointer flex items-center justify-between px-4 py-3 hover:bg-emerald-500 rounded ${
              selectedTemplate?.name === template.name ? "bg-emerald-500" : ""
            }`}
          >
            <h4 className={`text-base text-slate-700 group-hover:text-white ${selectedTemplate?.name === template.name && "text-white"}`}>{template.name}</h4>
            {selectedTemplate?.name === template.name && (
              <FaCheck className="text-white" />
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
