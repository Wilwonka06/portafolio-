import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  Download, 
  Save, 
  Check, 
  Sparkles, 
  Eye, 
  EyeOff, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Github, 
  Linkedin,
  Instagram,
  Lightbulb,
  X
} from "lucide-react";
import { CVData, WorkExperience, Education, CVSkillCategory } from "../types";
import { CVPdfTemplate } from "./CVPdfTemplate";

interface CVDigitalProps {
  data: CVData;
  onUpdate: (newData: CVData) => void;
  syncStatus: string;
  isOwner?: boolean;
}

export default function CVDigital({ data, onUpdate, syncStatus, isOwner = false }: CVDigitalProps) {
  const [activeTab, setActiveTab] = useState<"view" | "edit">("view");

  useEffect(() => {
    if (!isOwner) {
      setActiveTab("view");
    }
  }, [isOwner]);

  const [editSection, setEditSection] = useState<"profile" | "experience" | "skills" | "education">("profile");
  const [exportingPdf, setExportingPdf] = useState(false);
  const [showPrintHint, setShowPrintHint] = useState(false);

  // Helper to handle contact info changes
  const handleContactChange = (field: keyof typeof data.contact, value: string) => {
    const updated = {
      ...data,
      contact: {
        ...data.contact,
        [field]: value
      }
    };
    onUpdate(updated);
  };

  // Helper to update summary
  const handleSummaryChange = (value: string) => {
    onUpdate({
      ...data,
      summary: value
    });
  };

  // Trajectory: Edit specific experience
  const handleExperienceChange = (id: string, field: keyof WorkExperience, value: any) => {
    const updatedExp = data.experience.map(exp => {
      if (exp.id === id) {
        return { ...exp, [field]: value };
      }
      return exp;
    });
    onUpdate({ ...data, experience: updatedExp });
  };

  // Trajectory: Add bullet to an experience
  const addExpBullet = (expId: string) => {
    const updatedExp = data.experience.map(exp => {
      if (exp.id === expId) {
        return {
          ...exp,
          bullets: [...exp.bullets, "Nuevo logro o responsabilidad clave..."]
        };
      }
      return exp;
    });
    onUpdate({ ...data, experience: updatedExp });
  };

  // Trajectory: Remove bullet
  const deleteExpBullet = (expId: string, bulletIndex: number) => {
    const updatedExp = data.experience.map(exp => {
      if (exp.id === expId) {
        return {
          ...exp,
          bullets: exp.bullets.filter((_, idx) => idx !== bulletIndex)
        };
      }
      return exp;
    });
    onUpdate({ ...data, experience: updatedExp });
  };

  // Trajectory: Edit bullet text
  const editExpBullet = (expId: string, bulletIndex: number, value: string) => {
    const updatedExp = data.experience.map(exp => {
      if (exp.id === expId) {
        const newBullets = [...exp.bullets];
        newBullets[bulletIndex] = value;
        return { ...exp, bullets: newBullets };
      }
      return exp;
    });
    onUpdate({ ...data, experience: updatedExp });
  };

  // Trajectory: Add/Delete Experience Card
  const addExperienceCard = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      role: "Nuevo Puesto",
      company: "Nombre de Empresa",
      period: "2026 - Presente",
      description: "Introduce una breve descripción de tu rol e impacto general...",
      bullets: ["Logro destacado número uno con impacto de métricas", "Segundo hito alcanzado"]
    };
    onUpdate({
      ...data,
      experience: [newExp, ...data.experience]
    });
  };

  const deleteExperienceCard = (id: string) => {
    onUpdate({
      ...data,
      experience: data.experience.filter(exp => exp.id !== id)
    });
  };

  // Education: Add/Delete Education Card
  const addEducationCard = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: "Grado o Certificación",
      school: "Universidad o Instituto",
      period: "2024 - 2026",
      description: "Especialidades o tesis desarrolladas."
    };
    onUpdate({
      ...data,
      education: [...data.education, newEdu]
    });
  };

  const deleteEducationCard = (id: string) => {
    onUpdate({
      ...data,
      education: data.education.filter(edu => edu.id !== id)
    });
  };

  const handleEducationChange = (id: string, field: keyof Education, value: string) => {
    const updatedEdu = data.education.map(edu => {
      if (edu.id === id) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    onUpdate({ ...data, education: updatedEdu });
  };

  // Technical Skills Category managers
  const handleSkillCategoryTitleChange = (catId: string, newTitle: string) => {
    const updated = data.skillCategories.map(cat => {
      if (cat.id === catId) {
        return { ...cat, title: newTitle };
      }
      return cat;
    });
    onUpdate({ ...data, skillCategories: updated });
  };

  const addSkillToCategory = (catId: string, skillName: string = "Nueva Habilidad") => {
    const updated = data.skillCategories.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          skills: [...cat.skills, { name: skillName }]
        };
      }
      return cat;
    });
    onUpdate({ ...data, skillCategories: updated });
  };

  const removeSkillFromCategory = (catId: string, skillIdx: number) => {
    const updated = data.skillCategories.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          skills: cat.skills.filter((_, idx) => idx !== skillIdx)
        };
      }
      return cat;
    });
    onUpdate({ ...data, skillCategories: updated });
  };

  const editSkillInCategory = (catId: string, skillIdx: number, newName: string) => {
    const updated = data.skillCategories.map(cat => {
      if (cat.id === catId) {
        const skillsCopy = [...cat.skills];
        skillsCopy[skillIdx] = { ...skillsCopy[skillIdx], name: newName };
        return { ...cat, skills: skillsCopy };
      }
      return cat;
    });
    onUpdate({ ...data, skillCategories: updated });
  };

  const addSkillCategory = () => {
    const newCat: CVSkillCategory = {
      id: `cat-${Date.now()}`,
      title: "Nueva Categoría",
      skills: [{ name: "Ajuste Sencillo" }]
    };
    onUpdate({
      ...data,
      skillCategories: [...data.skillCategories, newCat]
    });
  };

  const deleteSkillCategory = (catId: string) => {
    onUpdate({
      ...data,
      skillCategories: data.skillCategories.filter(cat => cat.id !== catId)
    });
  };

  // Trigger browser print to save CV as PDF
  const triggerPrintPdf = () => {
    setShowPrintHint(true);
    // Short grace delay to allow reading the optimal browser instructions, then trigger print dialog
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div id="cv-interactive-module" className="space-y-6">
      
      {/* Header Bar with View/Edit toggle & print action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 p-4 rounded-2xl shadow-xs transition-colors">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Curriculum Vitae Digital</h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-sans">
              Compatible con ATS • Modificación en tiempo real y descarga PDF
            </p>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Tabs */}
          <div className="bg-gray-100 dark:bg-zinc-950 p-1 rounded-xl flex border border-gray-200/40 dark:border-zinc-800">
            <button
              id="tab-cv-view"
              onClick={() => { setActiveTab("view"); setShowPrintHint(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "view"
                  ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Ver CV (Diseño)</span>
            </button>
            {isOwner && (
              <button
                id="tab-cv-edit"
                onClick={() => setActiveTab("edit")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "edit"
                    ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Editar Datos</span>
              </button>
            )}
          </div>

          {/* PDF Export Button */}
          <button
            id="btn-export-pdf"
            onClick={triggerPrintPdf}
            className="px-4 py-1.5.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-blue-600"
            title="Abre la ventana de impresión para guardar el CV digital de manera idónea"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar PDF ATS</span>
          </button>
        </div>
      </div>

      {/* PDF Generation Print Hints Bar */}
      {showPrintHint && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 dark:bg-blue-950/45 border border-blue-200/50 dark:border-blue-900/30 text-blue-800 dark:text-blue-300 rounded-2xl text-xs flex gap-3"
        >
          <Lightbulb className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">💡 Instrucciones para Exportación Óptima a PDF:</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-700/90 dark:text-blue-300/80 font-normal">
              <li>En el diálogo de guardado del navegador, configura el destino como <strong className="font-semibold">Guardar como PDF</strong>.</li>
              <li>Desactiva la opción de <strong className="font-semibold">Cabeceras y pies de página</strong> en la pestaña "Más Ajustes" para evitar textos de urls en los bordes.</li>
              <li>Establece el tamaño del papel en <strong className="font-semibold">Carta (Letter) o A4</strong> con márgenes predeterminados o ninguno.</li>
            </ul>
          </div>
        </motion.div>
      )}

      {/* Core Panels Grid rendering view or edit */}
      <div className="grid grid-cols-12 gap-6">

        {/* MAIN PANEL CONTENT - VIEW/PREVIEW OR EDITOR */}
        <div className="col-span-12">
          <AnimatePresence mode="wait">
            
            {/* VIEW TAB PANEL */}
            {activeTab === "view" ? (
              <motion.div
                key="cv-view-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* CV Interactive Preview Card inside the portfolio platform */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-805/85 rounded-3xl overflow-hidden shadow-sm transition-colors">
                  
                  {/* Decorative Banner top */}
                  <div className="h-28 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600 via-indigo-700 to-slate-900 relative">
                    <div className="absolute bottom-4 right-6 flex items-center gap-1.5 opacity-80 text-[10px] text-white font-mono bg-black/30 px-2 py-0.5 rounded border border-white/10">
                      <Sparkles className="h-3 w-3 text-yellow-400" />
                      <span>Sincronizado Localmente</span>
                    </div>
                  </div>

                  {/* Body container */}
                  <div className="px-6 pb-6 sm:px-8 sm:pb-8 relative">
                    
                    {/* User profile avatar simulator */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 -mt-10 mb-6">
                      <div className="w-20 h-20 bg-blue-100 text-blue-700 dark:bg-zinc-800 dark:text-blue-400 border-4 border-white dark:border-zinc-900 rounded-3.5xl flex items-center justify-center font-bold text-2.5xl shadow-md uppercase">
                        {data.contact.name.slice(0, 2)}
                      </div>
                      <div className="pt-2 flex flex-col justify-end text-left">
                        <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/20 rounded-full py-0.5 px-3 self-start sm:self-end text-xs font-semibold">
                          Activo en Tiempo Real
                        </span>
                      </div>
                    </div>

                    {/* Meta info & profile names */}
                    <div className="text-left mb-6">
                      <h3 className="text-2.5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">
                        {data.contact.name}
                      </h3>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1.5">
                        {data.contact.title}
                      </p>

                      {/* Contact metadata row */}
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-gray-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{data.contact.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="underline">{data.contact.email}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{data.contact.phone}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 shrink-0" />
                          <span className="underline">{data.contact.website}</span>
                        </span>
                      </div>

                      {/* Links social media details */}
                      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-400 dark:text-zinc-500">
                        {data.contact.github && (
                          <a href={data.contact.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <Github className="h-3.5 w-3.5" />
                            <span>GitHub</span>
                          </a>
                        )}
                        {data.contact.linkedin && (
                          <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <Linkedin className="h-3.5 w-3.5" />
                            <span>LinkedIn</span>
                          </a>
                        )}
                        {data.contact.instagram && (
                          <a href={data.contact.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                            <Instagram className="h-3.5 w-3.5" />
                            <span>Instagram</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Executive Resumen/Description */}
                    <div className="text-left mb-6">
                      <h4 className="text-xs uppercase tracking-widest text-gray-400 dark:text-zinc-500 font-bold mb-2">Resumen Profesional</h4>
                      <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed font-normal">
                        {data.summary}
                      </p>
                    </div>

                    {/* Skill set display categorized */}
                    <div className="text-left mb-8">
                      <h4 className="text-xs uppercase tracking-widest text-gray-400 dark:text-zinc-500 font-bold mb-3">Habilidades de Desarrollo</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {data.skillCategories.map((cat, idx) => (
                          <div key={cat.id || idx} className="p-3.5 bg-gray-50/50 dark:bg-zinc-950/30 border border-gray-150/40 dark:border-zinc-850 rounded-xl">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-2">
                              {cat.title}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.skills.map((skill, sIdx) => (
                                <span key={sIdx} className="text-[11px] font-semibold text-gray-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-gray-200/50 dark:border-zinc-700/60 rounded px-2 py-0.5">
                                  {skill.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Workexperience display trajectory */}
                    <div className="text-left mb-8 pt-6 border-t border-gray-100 dark:border-zinc-850">
                      <h4 className="text-xs uppercase tracking-widest text-gray-400 dark:text-zinc-500 font-bold mb-4 flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>Trayectoria Laboral</span>
                      </h4>
                      <div className="space-y-6">
                        {data.experience.map((exp, idx) => (
                          <div key={exp.id || idx} className="relative pl-4 border-l-2 border-blue-500 dark:border-blue-800 font-sans">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-1">
                              <h5 className="text-base font-bold text-gray-900 dark:text-white">
                                {exp.role} <span className="font-normal text-gray-400 text-sm">en</span> <strong className="text-blue-600 dark:text-blue-400 font-bold">{exp.company}</strong>
                              </h5>
                              <span className="text-xs font-mono bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 py-0.5 px-2.5 rounded-full font-semibold max-w-max">
                                {exp.period}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed italic mb-2">
                              {exp.description}
                            </p>
                            <ul className="space-y-1 text-xs text-gray-600 dark:text-zinc-300">
                              {exp.bullets.map((bullet, bulletIdx) => (
                                <li key={bulletIdx} className="flex items-start gap-1.5 pl-1">
                                  <span className="text-blue-505 dark:text-blue-400 mt-0.5 shrink-0">•</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education section */}
                    <div className="text-left pt-6 border-t border-gray-100 dark:border-zinc-850">
                      <h4 className="text-xs uppercase tracking-widest text-gray-400 dark:text-zinc-500 font-bold mb-4 flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        <span>Formación Académica</span>
                      </h4>
                      <div className="space-y-4">
                        {data.education.map((edu, idx) => (
                          <div key={edu.id || idx} className="flex flex-col sm:flex-row sm:justify-between gap-2.5">
                            <div>
                              <h5 className="text-sm font-bold text-gray-950 dark:text-zinc-100">
                                {edu.degree}
                              </h5>
                              <span className="text-xs text-gray-510 dark:text-zinc-400 mt-0.5 block">
                                {edu.school}
                              </span>
                              {edu.description && (
                                <p className="text-xs text-gray-400 dark:text-zinc-500 italic mt-1 font-normal">{edu.description}</p>
                              )}
                            </div>
                            <span className="text-xs font-mono text-gray-400 dark:text-zinc-500 whitespace-nowrap self-start">
                              {edu.period}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Print Layout Hidden Preview in standard UI, shown in print triggers */}
                <div className="hidden">
                  <CVPdfTemplate data={data} />
                </div>
              </motion.div>
            ) : (
              
              /* EDITOR TAB PANEL - EASY, FAST AND FULLY RESPONSIVE */
              <motion.div
                key="cv-edit-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-12 gap-5"
              >
                {/* Editor Left navigation sidebar (bento categories) */}
                <div className="col-span-12 md:col-span-3 space-y-2">
                  {[
                    { id: "profile", label: "Contacto & Acerca", icon: User },
                    { id: "skills", label: "Habilidades Técnicas", icon: Settings },
                    { id: "experience", label: "Trayectoria Laboral", icon: Briefcase },
                    { id: "education", label: "Educación", icon: GraduationCap }
                  ].map((sec) => {
                    const SecIcon = sec.icon;
                    return (
                      <button
                        key={sec.id}
                        id={`btn-sec-edit-${sec.id}`}
                        onClick={() => setEditSection(sec.id as any)}
                        className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                          editSection === sec.id
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                            : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-100 dark:border-zinc-800"
                        }`}
                      >
                        <SecIcon className="h-4 w-4 shrink-0" />
                        <span>{sec.label}</span>
                      </button>
                    );
                  })}

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-gray-100 dark:border-zinc-800 text-[10px] text-gray-400 dark:text-zinc-500 text-left font-mono">
                    <p>💾 Al guardar un cambio, la información se almacena localmente en caché.</p>
                  </div>
                </div>

                {/* Editor Right Workspace Form */}
                <div className="col-span-12 md:col-span-9 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 rounded-2.5xl shadow-xs text-left">
                  
                  {/* CONTACT & PROFILE SUMMARY EDITOR */}
                  {editSection === "profile" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 border-b pb-2 mb-4">
                        Información de Contacto & Título
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 block mb-1">Nombre Completo</label>
                          <input
                            type="text"
                            value={data.contact.name}
                            onChange={(e) => handleContactChange("name", e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-sans"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 block mb-1">Título Profesional</label>
                          <input
                            type="text"
                            value={data.contact.title}
                            onChange={(e) => handleContactChange("title", e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 block mb-1">Correo Electrónico</label>
                          <input
                            type="email"
                            value={data.contact.email}
                            onChange={(e) => handleContactChange("email", e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 block mb-1">Teléfono</label>
                          <input
                            type="text"
                            value={data.contact.phone}
                            onChange={(e) => handleContactChange("phone", e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 block mb-1">Ubicación física</label>
                          <input
                            type="text"
                            value={data.contact.location}
                            onChange={(e) => handleContactChange("location", e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 block mb-1">Sitio Web / Portfolio</label>
                          <input
                            type="text"
                            value={data.contact.website}
                            onChange={(e) => handleContactChange("website", e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 block mb-1">GitHub URL</label>
                          <input
                            type="text"
                            value={data.contact.github}
                            onChange={(e) => handleContactChange("github", e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 block mb-1">LinkedIn URL</label>
                          <input
                            type="text"
                            value={data.contact.linkedin}
                            onChange={(e) => handleContactChange("linkedin", e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 block mb-1">Instagram URL</label>
                          <input
                            type="text"
                            value={data.contact.instagram || ""}
                            onChange={(e) => handleContactChange("instagram", e.target.value)}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 block mb-1">Resumen Profesional (ATS)</label>
                        <textarea
                          rows={4}
                          value={data.summary}
                          onChange={(e) => handleSummaryChange(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {/* TECHNICAL SKILLS MANAGEMENT */}
                  {editSection === "skills" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                          Habilidades Técnicas Editables
                        </h3>
                        <button
                          onClick={addSkillCategory}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 dark:text-blue-400 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Añadir Categoría</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {data.skillCategories.map((cat) => (
                          <div key={cat.id} className="p-4 bg-gray-50/50 dark:bg-zinc-950/40 border border-gray-150/50 dark:border-zinc-800 rounded-xl">
                            
                            {/* Category Header Title */}
                            <div className="flex justify-between items-center gap-2 mb-3">
                              <input
                                type="text"
                                value={cat.title}
                                onChange={(e) => handleSkillCategoryTitleChange(cat.id, e.target.value)}
                                className="bg-transparent text-xs font-extrabold uppercase text-gray-700 dark:text-zinc-200 border-b border-dashed border-gray-300 dark:border-zinc-700 py-0.5 focus:outline-none focus:border-blue-600 min-w-44"
                              />

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => addSkillToCategory(cat.id)}
                                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                                  title="Añadir habilidad a esta sección"
                                >
                                  <Plus className="h-3 w-3" /> Añadir
                                </button>
                                <button
                                  onClick={() => deleteSkillCategory(cat.id)}
                                  className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-zinc-800 cursor-pointer"
                                  title="Eliminar categoría completa"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Skills items flexbox layout */}
                            <div className="flex flex-wrap gap-2">
                              {cat.skills.map((skill, sIdx) => (
                                <div key={sIdx} className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-750 rounded-lg pl-2 pr-1.5 py-1">
                                  <input
                                    type="text"
                                    value={skill.name}
                                    onChange={(e) => editSkillInCategory(cat.id, sIdx, e.target.value)}
                                    className="bg-transparent text-xs font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none w-24 sm:w-28"
                                  />
                                  <button
                                    onClick={() => removeSkillFromCategory(cat.id, sIdx)}
                                    className="text-gray-400 hover:text-red-500 p-0.5 rounded cursor-pointer"
                                    title="Quitar habilidad"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}

                              {cat.skills.length === 0 && (
                                <span className="text-[11px] text-gray-400 italic">No hay habilidades cargadas. Añade una arriba.</span>
                              )}
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WORK EXPERIENCE (TRAYECTORIA LABORAL) */}
                  {editSection === "experience" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 font-sans">
                          Trayectoria Laboral
                        </h3>
                        <button
                          onClick={addExperienceCard}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 dark:text-blue-400 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Añadir Experiencia</span>
                        </button>
                      </div>

                      <div className="space-y-6">
                        {data.experience.map((exp) => (
                          <div key={exp.id} className="p-4 bg-gray-50/50 dark:bg-zinc-950/30 border border-gray-200/50 dark:border-zinc-800 rounded-xl space-y-3 relative group">
                            
                            <button
                              onClick={() => deleteExperienceCard(exp.id)}
                              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Remover puesto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Rol o Puesto</label>
                                <input
                                  type="text"
                                  value={exp.role}
                                  onChange={(e) => handleExperienceChange(exp.id, "role", e.target.value)}
                                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-805 rounded-md py-1 px-2.5 text-xs text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Empresa</label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-805 rounded-md py-1 px-2.5 text-xs text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Periodo</label>
                                <input
                                  type="text"
                                  value={exp.period}
                                  onChange={(e) => handleExperienceChange(exp.id, "period", e.target.value)}
                                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-md py-1 px-2.5 text-xs text-gray-850 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Resumen de impacto</label>
                              <input
                                type="text"
                                value={exp.description}
                                onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-md py-1 px-2.5 text-xs text-gray-600 dark:text-zinc-350 italic"
                              />
                            </div>

                            {/* Bullet points experience targets achievements */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Metas y Logros Clave (Bullet list ATS)</span>
                                <button
                                  onClick={() => addExpBullet(exp.id)}
                                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" /> Añadir logro
                                </button>
                              </div>

                              <div className="space-y-1.5 pl-2">
                                {exp.bullets.map((bullet, bIdx) => (
                                  <div key={bIdx} className="flex gap-2 items-center">
                                    <span className="text-gray-400 text-xs shrink-0">•</span>
                                    <input
                                      type="text"
                                      value={bullet}
                                      onChange={(e) => editExpBullet(exp.id, bIdx, e.target.value)}
                                      className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md py-1 px-2.5 text-xs text-gray-700 dark:text-zinc-300"
                                    />
                                    <button
                                      onClick={() => deleteExpBullet(exp.id, bIdx)}
                                      className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                                      title="Quitar logro"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}

                                {exp.bullets.length === 0 && (
                                  <span className="text-[11px] text-gray-400 italic block">No hay metas agregadas. Añade una arriba de este bloque.</span>
                                )}
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EDUCATION SECTION */}
                  {editSection === "education" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                          Educación y Formación académica
                        </h3>
                        <button
                          onClick={addEducationCard}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 dark:text-blue-400 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Añadir Grado</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {data.education.map((edu) => (
                          <div key={edu.id} className="p-4 bg-gray-50/50 dark:bg-zinc-950/30 border border-gray-200/50 dark:border-zinc-800 rounded-xl space-y-3 relative">
                            
                            <button
                              onClick={() => deleteEducationCard(edu.id)}
                              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-white dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Remover carrera/grado"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Título o Carrera</label>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-805 rounded-md py-1 px-2.5 text-xs text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Institución</label>
                                <input
                                  type="text"
                                  value={edu.school}
                                  onChange={(e) => handleEducationChange(edu.id, "school", e.target.value)}
                                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-md py-1 px-2.5 text-xs text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Periodo</label>
                                <input
                                  type="text"
                                  value={edu.period}
                                  onChange={(e) => handleEducationChange(edu.id, "period", e.target.value)}
                                  className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-md py-1 px-2.5 text-xs text-gray-850 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Especialidad o Notas</label>
                              <input
                                type="text"
                                value={edu.description || ""}
                                onChange={(e) => handleEducationChange(edu.id, "description", e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md py-1 px-2.5 text-xs text-gray-600 dark:text-zinc-300 italic"
                              />
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
