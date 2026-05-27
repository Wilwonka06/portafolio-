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
          fontFamily: "'Inter', sans-serif"
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
        <div className="text-center border-b-2 border-zinc-200 pb-5 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 uppercase">
            {data.contact.name}
          </h1>
          <p className="text-sm font-semibold text-zinc-700 tracking-wide uppercase mt-1">
            {data.contact.title}
          </p>

          {/* Symmetrical Contact Grid for ATS Parsers */}
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 text-xs text-zinc-600 mt-3 font-normal">
            <span>{data.contact.location}</span>
            <span className="text-zinc-300">•</span>
            <span>📱 {data.contact.phone}</span>
            <span className="text-zinc-300">•</span>
            <span>✉ {data.contact.email}</span>
            <span className="text-zinc-300">•</span>
            <span className="underline">{data.contact.website}</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-zinc-500 mt-2 font-mono">
            <span>GitHub: {data.contact.github}</span>
            <span className="text-zinc-300">•</span>
            <span>LinkedIn: {data.contact.linkedin}</span>
            {data.contact.instagram && (
              <>
                <span className="text-zinc-300">•</span>
                <span>Instagram: {data.contact.instagram}</span>
              </>
            )}
          </div>
        </div>

        {/* Executive Profile Section */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 mb-2">
            Perfil Profesional
          </h2>
          <p className="text-xs text-zinc-700 leading-relaxed font-normal text-justify">
            {data.summary}
          </p>
        </div>

        {/* Highly Structured Skill Set Categories */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 mb-2">
            Habilidades Tecnológicas & Herramientas
          </h2>
          <div className="space-y-2">
            {data.skillCategories.map((cat, idx) => (
              <div key={cat.id || idx} className="text-xs flex items-baseline leading-relaxed">
                <span className="font-bold text-zinc-800 w-44 shrink-0 uppercase tracking-wide text-[10px]">
                  {cat.title}:
                </span>
                <span className="text-zinc-700 font-normal">
                  {cat.skills.map((skill) => skill.name).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Symmetrical Labor History */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 mb-3">
            Trayectoria Laboral
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={exp.id || idx} className="page-break-inside-avoid">
                <div className="flex justify-between items-baseline font-semibold text-xs text-zinc-900 mb-1">
                  <span>
                    {exp.role} — <strong className="font-extrabold text-zinc-850">{exp.company}</strong>
                  </span>
                  <span className="font-mono text-[10px] text-zinc-600">
                    {exp.period}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 italic leading-relaxed mb-1.5 font-normal">
                  {exp.description}
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="text-[11px] text-zinc-700 leading-relaxed pl-1">
                      <span className="font-sans">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Higher Education */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 mb-2">
            Educación y Formación
          </h2>
          <div className="space-y-3">
            {data.education.map((edu, idx) => (
              <div key={edu.id || idx} className="flex justify-between items-baseline text-xs text-zinc-900">
                <div>
                  <span className="font-bold">{edu.degree}</span>
                  <span className="text-zinc-600"> — {edu.school}</span>
                  {edu.description && (
                    <p className="text-[11px] text-zinc-500 italic mt-0.5">{edu.description}</p>
                  )}
                </div>
                <span className="font-mono text-[10px] text-zinc-500">{edu.period}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Optative Featured Projects Section (For ATS and Recruiters) */}
        {data.featuredProjects && data.featuredProjects.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-1 mb-2">
              Proyectos Destacados (Integración Cloud)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.featuredProjects.map((p, idx) => (
                <div key={idx} className="border border-zinc-100 p-3 rounded-xl bg-zinc-50/50">
                  <h3 className="text-xs font-bold text-zinc-900 flex justify-between">
                    <span>{p.name}</span>
                    <span className="text-[9px] text-zinc-500 font-mono italic">Demo / Repo</span>
                  </h3>
                  <p className="text-[11px] text-zinc-600 leading-relaxed mt-1">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.tech.map((t, tIdx) => (
                      <span key={tIdx} className="text-[9px] bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Verification Watermark for ATS Parsing systems */}
        <div className="mt-8 border-t border-zinc-100 pt-3 text-center">
          <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono">
            Documento estructurado codificado para lectura ATS automatizada de Candidatos
          </p>
        </div>
      </div>
    );
  }
);

CVPdfTemplate.displayName = "CVPdfTemplate";
