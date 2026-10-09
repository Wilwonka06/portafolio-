import React from "react";
import { motion } from "motion/react";
import { 
  X, 
  Github, 
  ExternalLink, 
  Database, 
  Terminal, 
  Layers, 
  MapPin, 
  ArrowLeftRight, 
  Smartphone, 
  Code, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Check,
  Server
} from "lucide-react";
import { Project } from "../types";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

// Map tech name to appropriate Lucide icon for premium, authentic badging
const getTechIcon = (techName: string) => {
  const norm = techName.toLowerCase();
  if (norm.includes("react")) return <Layers id={`tech-layer-${techName}`} className="h-4.5 w-4.5 text-sky-500 animate-pulse" />;
  if (norm.includes("javascript") || norm.includes("js")) return <Code id={`tech-code-${techName}`} className="h-4.5 w-4.5 text-yellow-500" />;
  if (norm.includes("typescript") || norm.includes("ts")) return <Terminal id={`tech-term-${techName}`} className="h-4.5 w-4.5 text-blue-500" />;
  if (norm.includes("nestjs")) return <Terminal id={`tech-nest-${techName}`} className="h-4.5 w-4.5 text-rose-500" />;
  if (norm.includes("postgresql") || norm.includes("database") || norm.includes("firestore") || norm.includes("sqlite") || norm.includes("mysql")) {
    return <Database id={`tech-db-${techName}`} className="h-4.5 w-4.5 text-indigo-500" />;
  }
  if (norm.includes("socket.io") || norm.includes("socket") || norm.includes("comunicaciones")) {
    return <Activity id={`tech-comms-${techName}`} className="h-4.5 w-4.5 text-emerald-500" />;
  }
  if (norm.includes("maps") || norm.includes("google maps") || norm.includes("gps")) return <MapPin id={`tech-map-${techName}`} className="h-4.5 w-4.5 text-red-500" />;
  if (norm.includes("axios")) return <ArrowLeftRight id={`tech-axios-${techName}`} className="h-4.5 w-4.5 text-blue-400" />;
  if (norm.includes("material design") || norm.includes("tailwind") || norm.includes("css")) return <Sparkles id={`tech-design-${techName}`} className="h-4.5 w-4.5 text-purple-400" />;
  if (norm.includes("prisma")) return <Compass id={`tech-cloud-${techName}`} className="h-4.5 w-4.5 text-emerald-600" />;
  if (norm.includes("expo")) return <Smartphone id={`tech-expo-${techName}`} className="h-4.5 w-4.5 text-indigo-400" />;
  if (norm.includes("firebase") || norm.includes("gcp") || norm.includes("cloud")) return <Server id={`tech-gcp-${techName}`} className="h-4.5 w-4.5 text-amber-500" />;
  
  return <ShieldCheck id={`tech-shield-${techName}`} className="h-4.5 w-4.5 text-gray-400" />;
};

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  // Prevent propagation
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        id={`container-modal-${project.id}`}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 my-4 max-h-[85vh] flex flex-col"
        onClick={handleContainerClick}
      >
        {/* Modal Close Floating Button */}
        <button
          id="btn-close-modal"
          onClick={onClose}
          className="absolute top-5 right-5 z-10 p-2.5 bg-zinc-150 hover:bg-zinc-200 text-zinc-800 rounded-full transition-all hover:scale-105 active:scale-95"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-left space-y-6">
          {/* Top Label & Title */}
          <div className="mb-2 flex flex-col items-start gap-1">
            <span className="text-xs font-bold text-zinc-650 font-mono bg-zinc-100 px-2.5 py-1 rounded shadow-3xs uppercase tracking-wider">
              Año: {project.year}
            </span>
            <h2 className="text-3.5xl font-black text-zinc-950 tracking-tight mt-2 text-left">
              {project.name}
            </h2>
          </div>

          {/* Browser Mockup Wrapper - High Fidelity CSS Rendered */}
          <div className="relative rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 overflow-hidden shadow-lg mb-6">
            {/* Header / Address Bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 select-none">
              {/* Browser Dots */}
              <div className="flex gap-1.5 mr-2">
                <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              </div>
              
              {/* Navigation Chevrons */}
              <div className="hidden sm:flex items-center gap-1.5 text-gray-400 dark:text-zinc-600 mr-2 text-xs">
                <span>&lsaquo;</span>
                <span>&rsaquo;</span>
                <span className="text-[10px]">↻</span>
              </div>

              {/* URL Address Box */}
              <div className="flex-1 max-w-md mx-auto h-6.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-center flex items-center justify-center text-[11px] text-gray-500 dark:text-zinc-400 font-mono tracking-tight px-3 overflow-hidden">
                <span className="text-gray-300 dark:text-zinc-500 mr-1">https://</span>
                {project.id === "enrutapp" ? "enrutapp.app" : project.id === "cloudfire-analytics" ? "cloudfire-analytics.web.app" : "docushare-drive.web.app"}
              </div>
              
              {/* Utility Icons */}
              <div className="hidden sm:flex items-center gap-2 text-gray-400 dark:text-zinc-500 text-xs">
                <span>🛡️</span>
                <span>⇪</span>
              </div>
            </div>

            {/* Image Viewport of the App itself inside the Browser Frame - Clean without mock overlay */}
            <div className="w-full h-48 sm:h-56 md:h-64 relative overflow-hidden bg-zinc-100 dark:bg-zinc-950">
              {project.image ? (
                <img 
                  src={project.image} 
                  alt={project.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900">
                  <span className="text-xs uppercase font-bold tracking-widest">Sin vista previa</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Block */}
          <div className="mb-6">
            <p className="text-lg text-zinc-900 leading-relaxed font-sans font-semibold mb-4 text-left">
              {project.description}
            </p>
            <p className="text-sm text-zinc-800 leading-relaxed text-left font-normal">
              {project.longDescription}
            </p>
          </div>

          {/* Project Highlights bullet points */}
          {project.highlights && project.highlights.length > 0 && (
            <div className="mb-6 bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-left">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900 mb-2.5">
                Logros Clave y Métricas
              </h4>
              <ul className="space-y-1.5">
                {project.highlights.map((highlight, index) => (
                  <li key={index} className="text-xs text-zinc-900 flex items-start gap-2">
                    <span className="text-emerald-600 mt-0.5 font-bold">✓</span>
                    <span className="font-medium text-zinc-800">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technology Badges Matrix - Matches Image Exactly */}
          <div className="mb-8 text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900 mb-3">
              Stack de Tecnologías y Herramientas
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <div
                  key={index}
                  id={`tech-badge-${project.id}-${index}`}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-50/80 border border-blue-200 text-blue-900 text-xs font-bold rounded-full hover:scale-[1.03] transition-transform select-none"
                >
                  {getTechIcon(tech.name)}
                  <span className="font-sans">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Call to Buttons - Matches Image Styled Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <a
              id={`link-github-${project.id}`}
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 text-sm font-bold rounded-2xl border border-gray-200/50 dark:border-zinc-700/50 transition-all hover:shadow-sm"
            >
              <Github className="h-4.5 w-4.5" />
              <span>GitHub</span>
            </a>
            <a
              id={`link-website-${project.id}`}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-4 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-950/40 dark:hover:bg-blue-950/60 dark:text-blue-300 text-sm font-bold rounded-2xl border border-blue-200/50 dark:border-blue-900/30 transition-all hover:shadow-sm"
            >
              <ExternalLink className="h-4.5 w-4.5" />
              <span>Ver sitio</span>
            </a>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
