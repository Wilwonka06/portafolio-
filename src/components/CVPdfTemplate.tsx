import React, { forwardRef } from "react";
import { CVData } from "../types";

interface CVPdfTemplateProps {
  data: CVData;
}

// Forward ref component so it can be targeted by React ref for direct PDF printing/exporting
export const CVPdfTemplate = forwardRef<HTMLDivElement, CVPdfTemplateProps>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        id="ats-print-layout"
        className="w-full bg-white text-[#111] p-8 sm:p-12 font-sans overflow-hidden border border-gray-100 rounded-3xl"
        style={{
          color: "#111111",
          fontFamily: "'Lora', serif"
        }}
      >
        {/* Print Styles Injector */}
        <span dangerouslySetInnerHTML={{
          __html: `<style>
            @media print {
              #ats-print-layout {
                border: none !important;
                border-radius: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                background: white !important;
                color: black !important;
              }
              body {
                background: white !important;
                color: black !important;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>`
        }} />

        {/* ATS Compatible Header - Clear Hierarchy */}
        <div className="text-center pb-5 mb-6">
          <h1 className="text-3xl font-normal text-blue-900 font-sans mb-3">
            {data.contact.name}
          </h1>
          
          {/* Symmetrical Contact Grid for ATS Parsers */}
          <div className="flex flex-wrap justify-center items-center gap-1.5 text-[13px] text-zinc-700 font-sans mb-1">
            <span>{data.contact.location}</span>
            <span className="text-zinc-400">|</span>
            <span>{data.contact.email}</span>
            <span className="text-zinc-400">|</span>
            <span>{data.contact.phone}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-1 text-[13px] text-blue-600 font-sans">
            <span>GitHub: github.com/{data.contact.github}</span>
            <span className="text-zinc-400 text-zinc-700">|</span>
            <span>LinkedIn: linkedin.com/in/{data.contact.linkedin}</span>
          </div>
        </div>

        {/* Executive Profile Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-900 border-b border-zinc-300 pb-1 mb-3">
            Perfil Profesional
          </h2>
          <p className="text-sm text-zinc-800 leading-relaxed font-sans text-justify">
            {data.summary}
          </p>
        </div>

        {/* Symmetrical Labor History */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-900 border-b border-zinc-300 pb-1 mb-4">
            Experiencia Laboral
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={exp.id || idx} className="page-break-inside-avoid">
                <div className="flex justify-between items-baseline font-bold text-[13px] text-zinc-900 mb-1 border-b border-black pb-0.5">
                  <span>
                    {exp.role}
                  </span>
                  <span className="font-sans font-normal text-[13px] text-zinc-700">
                    {exp.period}
                  </span>
                </div>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="text-[13px] text-zinc-800 leading-relaxed -ml-1">
                      <span className="font-sans">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Optative Featured Projects Section (For ATS and Recruiters) */}
        {data.featuredProjects && data.featuredProjects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-blue-900 border-b border-zinc-300 pb-1 mb-4">
              Proyectos Destacados
            </h2>
            <div className="space-y-4">
              {data.featuredProjects.map((p, idx) => (
                <div key={idx} className="page-break-inside-avoid">
                  <div className="flex justify-between items-baseline font-bold text-[13px] text-zinc-900 mb-1 border-b border-black pb-0.5">
                    <span>{p.name}</span>
                    <span className="font-sans font-normal text-[13px] text-zinc-700">
                    </span>
                  </div>
                  <p className="text-[13px] text-zinc-800 leading-relaxed mt-1 font-sans text-justify">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Highly Structured Skill Set Categories */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-900 border-b border-zinc-300 pb-1 mb-3">
            Habilidades Técnicas
          </h2>
          <ul className="list-disc list-inside space-y-2 mt-2">
            {data.skillCategories.map((cat, idx) => (
              <li key={cat.id || idx} className="text-[13px] leading-relaxed -ml-1">
                <strong className="text-zinc-900 font-bold">
                  {cat.title}:
                </strong>{" "}
                <span className="text-zinc-800 font-sans">
                  {cat.skills.map((skill) => skill.name).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Higher Education */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-blue-900 border-b border-zinc-300 pb-1 mb-3">
            Educación
          </h2>
          <div className="space-y-4">
            {data.education.map((edu, idx) => (
              <div key={edu.id || idx} className="page-break-inside-avoid">
                 <div className="flex justify-between items-baseline font-bold text-[13px] text-zinc-900 border-b border-black pb-0.5">
                  <span>
                    {edu.degree}
                  </span>
                  <span className="font-sans font-normal text-[13px] text-zinc-700">
                    Graduado: {edu.period}
                  </span>
                </div>
                <div className="text-[13px] italic text-zinc-600 mt-1">
                   {edu.school}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
CVPdfTemplate.displayName = "CVPdfTemplate";
