import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Trash2, 
  Edit as EditIcon, 
  PlusCircle, 
  UserCheck, 
  Calendar, 
  Instagram, 
  Moon, 
  Sun, 
  Briefcase, 
  FolderKanban, 
  Terminal, 
  Database, 
  Layers, 
  Cloud, 
  Sparkles, 
  Linkedin, 
  Github, 
  Mail, 
  Award, 
  Compass,
  ArrowRight,
  Info
} from "lucide-react";

import { Project, CVData, Technology } from "./types";
import { INITIAL_CV_DATA } from "./defaultCV";
import SyncIndicator from "./components/SyncIndicator";
import ProjectModal from "./components/ProjectModal";
import CVDigital from "./components/CVDigital";

export default function App() {
  // Navigation View selection
  const [activeView, setActiveView] = useState<"projects" | "cv">("projects");

  // Owner Mode versus Guest mode toggle
  const [isOwner, setIsOwner] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio-is-owner");
      return saved === "true"; // Defaults to FALSE (Visitor) so guest sees the view version first
    }
    return false;
  });

  // Dynamic projects loaded from external JSON or localStorage
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Search & Filtering State - No more text box search as requested, but keeping category/tags for stack clicks!
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Project Editor state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Dark Mode accessibility state: default to FALSE (Light Mode) first as requested
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio-dark-mode");
      if (saved !== null) return saved === "true";
    }
    return false;
  });

  // Modal selector for selected project matching image popup details
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Digital CV State loaded & persisted in LocalStorage
  const [cvData, setCvData] = useState<CVData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio-cv-data");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Fallo al leer datos guardados de CV. Cargando valores por defecto");
        }
      }
    }
    return INITIAL_CV_DATA;
  });

  // Simulation Sync and Network status
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline-pending">("synced");
  const [lastSyncedTime, setLastSyncedTime] = useState<Date | null>(new Date());

  // Save isOwner flag to localStorage
  useEffect(() => {
    localStorage.setItem("portfolio-is-owner", String(isOwner));
  }, [isOwner]);

  // Apply dark mode styling class
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("portfolio-dark-mode", String(darkMode));
  }, [darkMode]);

  // Fetch dynamic projects from external JSON on mount or localStorage
  useEffect(() => {
    async function loadProjects() {
      setIsLoadingProjects(true);
      try {
        const saved = localStorage.getItem("portfolio-projects-list");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProjects(parsed);
              setProjectError(null);
              setIsLoadingProjects(false);
              return;
            }
          } catch (_) {}
        }

        const response = await fetch("/projects.json");
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status} al cargar proyectos`);
        }
        const data = await response.json();
        setProjects(data);
        localStorage.setItem("portfolio-projects-list", JSON.stringify(data));
        setProjectError(null);
      } catch (err: any) {
        console.error(err);
        setProjectError(
          "No se pudieron cargar los proyectos. Presiona para usar el respaldo."
        );
      } finally {
        setIsLoadingProjects(false);
      }
    }
    loadProjects();
  }, []);

  // Update projects list helper (handles state + persist + simulation sync animation)
  const saveProjectsList = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem("portfolio-projects-list", JSON.stringify(updatedProjects));

    if (isSimulatedOffline) {
      setSyncStatus("offline-pending");
    } else {
      setSyncStatus("syncing");
      const timer = setTimeout(() => {
        setSyncStatus("synced");
        setLastSyncedTime(new Date());
      }, 800);
      return () => clearTimeout(timer);
    }
  };

  // Helper to split and auto-categorize tech tags written in plain text (e.g. Firebase, React)
  const classifyTechTags = (delimitedText: string): { name: string; category: string }[] => {
    return delimitedText
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(name => {
        const lower = name.toLowerCase();
        let category = "Entornos y Despliegue"; // default fallback
        if (
          lower.includes("firebase") ||
          lower.includes("gcp") ||
          lower.includes("google") ||
          lower.includes("cloud") ||
          lower.includes("firestore") ||
          lower.includes("nube") ||
          lower.includes("db") ||
          lower.includes("sql") ||
          lower.includes("postgres") ||
          lower.includes("database")
        ) {
          category = "Servicios de Nube";
        } else if (
          lower.includes("react") ||
          lower.includes("nestjs") ||
          lower.includes("express") ||
          lower.includes("angular") ||
          lower.includes("vue") ||
          lower.includes("tailwind") ||
          lower.includes("bootstrap") ||
          lower.includes("prisma") ||
          lower.includes("socket") ||
          lower.includes("expo") ||
          lower.includes("web")
        ) {
          category = "Frameworks";
        } else if (
          lower.includes("javascript") ||
          lower.includes("typescript") ||
          lower.includes("js") ||
          lower.includes("ts") ||
          lower.includes("python") ||
          lower.includes("go") ||
          lower.includes("kotlin") ||
          lower.includes("java") ||
          lower.includes("html") ||
          lower.includes("css")
        ) {
          category = "Lenguajes";
        }
        return { name, category };
      });
  };

  // Main save action for custom added/edited projects (survives offline + saved in localStorage)
  const handleSaveProjectForm = (
    id: string,
    formData: {
      name: string;
      year: string;
      description: string;
      longDescription: string;
      image: string;
      url: string;
      github: string;
      techString: string;
      highlightsString: string;
    }
  ) => {
    const techObjs = classifyTechTags(formData.techString);
    const highlightLines = formData.highlightsString
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const targetId = id || "proj-" + Date.now();
    const updatedData: Project = {
      id: targetId,
      name: formData.name || "Proyecto Sin Nombre",
      year: formData.year || new Date().getFullYear().toString(),
      description: formData.description || "Desarrollo de Software",
      longDescription: formData.longDescription || "Explicación en detalle del microservicio.",
      image: formData.image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200",
      url: formData.url || "#",
      github: formData.github || "#",
      technologies: techObjs,
      highlights: highlightLines,
    };

    if (editingProject) {
      // Edit existing
      const updatedList = projects.map(p => p.id === editingProject.id ? updatedData : p);
      saveProjectsList(updatedList);
      setEditingProject(null);
    } else {
      // Add new
      const updatedList = [updatedData, ...projects];
      saveProjectsList(updatedList);
      setIsCreatingNew(false);
    }
  };

  // Update dynamic CV data from edits
  const handleUpdateCV = (newData: CVData) => {
    setCvData(newData);
    localStorage.setItem("portfolio-cv-data", JSON.stringify(newData));

    // Fast-trigger syncing transitions
    if (isSimulatedOffline) {
      setSyncStatus("offline-pending");
    } else {
      setSyncStatus("syncing");
      const timer = setTimeout(() => {
        setSyncStatus("synced");
        setLastSyncedTime(new Date());
      }, 1000);
      return () => clearTimeout(timer);
    }
  };

  // Extract unique technology tags and categories from loaded projects
  const uniqueTechTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(p => {
      p.technologies.forEach(t => tags.add(t.name));
    });
    return Array.from(tags).sort();
  }, [projects]);

  // Categorized tech categories for the stack badge filters
  const techCategories = ["Todos", "Lenguajes", "Frameworks", "Servicios de Nube", "Entornos y Despliegue"];

  // Filter projects by Category Selector & specific Tag selector
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // 1. Category selection filter
      let matchesCategory = true;
      if (selectedCategory !== "Todos") {
        matchesCategory = p.technologies.some(t => {
          // Normalize categories for robust comparison
          const catNorm = t.category.toLowerCase();
          const selectedNorm = selectedCategory.toLowerCase();
          if (selectedNorm.includes("lenguajes") && catNorm.includes("lenguajes")) return true;
          if (selectedNorm.includes("frameworks") && (catNorm.includes("frameworks") || catNorm.includes("librerías"))) return true;
          if (selectedNorm.includes("nube") && (catNorm.includes("nube") || catNorm.includes("servicios"))) return true;
          if (selectedNorm.includes("entornos") && (catNorm.includes("entornos") || catNorm.includes("despliegue"))) return true;
          return catNorm.includes(selectedNorm);
        });
      }

      // 2. Specific Tag selector filter
      const matchesTag = !selectedTag || p.technologies.some(t => t.name === selectedTag);

      return matchesCategory && matchesTag;
    });
  }, [projects, selectedCategory, selectedTag]);

  return (
    <div id="portfolio-app-root" className="min-h-screen bg-gray-50/50 text-gray-800 dark:bg-zinc-950 dark:text-zinc-100 font-sans transition-colors duration-300 pb-16">
      
      {/* GLOBAL NAVBAR HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-150 dark:border-zinc-850 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Left Brand Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-blue-500/20 uppercase font-sans">
              {cvData.contact.name ? cvData.contact.name.split(" ").map(w => w[0]).slice(0, 2).join("") : "WR"}
            </div>
            <div className="text-left">
              <span className="font-extrabold text-gray-950 dark:text-white tracking-tight block text-sm sm:text-base">
                {cvData.contact.name}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono block">
                {cvData.contact.title}
              </span>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-950 rounded-2xl border border-gray-200/50 dark:border-zinc-800">
            <button
              id="nav-projects-tab"
              onClick={() => setActiveView("projects")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === "projects"
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"
              }`}
            >
              <FolderKanban className="h-3.5 w-3.5" />
              <span>Proyectos</span>
            </button>
            <button
              id="nav-cv-tab"
              onClick={() => setActiveView("cv")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === "cv"
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>CV Digital</span>
            </button>
          </nav>

          {/* Right Utilities (Owner View Switcher, Dark Mode, Networks & Contact shortcut) */}
          <div className="flex items-center gap-3">
            {/* Interactive Admin/Visitor switch */}
            <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-zinc-950 rounded-xl border border-gray-200/50 dark:border-zinc-800 text-[11px] font-bold">
              <button
                id="role-visitor-toggle"
                onClick={() => setIsOwner(false)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  !isOwner
                    ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-gray-400 hover:text-gray-700 dark:text-zinc-500"
                }`}
                title="Ver versión que verá el público"
              >
                Vista Lector
              </button>
              <button
                id="role-owner-toggle"
                onClick={() => setIsOwner(true)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  isOwner
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-400 hover:text-gray-700 dark:text-zinc-500"
                }`}
                title="Activar permisos de Propietario para poder editar y añadir"
              >
                {isOwner && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                <span>Dueño (Editor)</span>
              </button>
            </div>

            {/* Dark Mode toggle trigger */}
            <button
              id="toggle-dark-mode"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 border border-gray-200/50 dark:border-zinc-700/60"
              aria-label="Alternar modo oscuro"
              title="Alternar fondo para accesibilidad"
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>

            {/* Quick Contact Icon on Large Screens */}
            <a
              id="nav-contact-email"
              href={`mailto:${cvData.contact.email}`}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white rounded-xl shadow-xs transition-transform hover:scale-[1.02]"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Contacto</span>
            </a>
          </div>

        </div>
      </header>

      {/* SYNC AND OFFLINE INDICATOR BAR (Fixed just underneath navbar) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <SyncIndicator
          isSimulatedOffline={isSimulatedOffline}
          setIsSimulatedOffline={setIsSimulatedOffline}
          syncStatus={syncStatus}
          setSyncStatus={setSyncStatus}
          lastSyncedTime={lastSyncedTime}
        />
      </div>

      {/* CORE FRAMEWORK STAGES (PRODUCING THE SELECTED TABS) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <AnimatePresence mode="wait">
          
          {/* MODULE 1: PORTFOLIO & RECENT PROJECTS SECTION */}
          {activeView === "projects" && (
            <motion.section
              key="projects-view-stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Profile Intro Banner Hero */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-150/70 dark:border-zinc-850 p-6 sm:p-8 rounded-3.5xl flex flex-col md:flex-row items-center justify-between gap-6 transition-colors text-left shadow-xs">
                <div className="space-y-3.5 max-w-2xl">
                  {/* Skill Badge */}
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-100/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                    <Award className="h-3.5 w-3.5" />
                    <span>Especialista certificado en Cloud Run & Firebase Console</span>
                  </div>

                  <h1 className="text-3.5xl sm:text-4.5xl font-extrabold text-gray-950 dark:text-white tracking-tight leading-none font-sans">
                    Llevando tus ideas de código a <strong className="text-blue-600 dark:text-blue-400 font-extrabold">despliegues robustos</strong>
                  </h1>

                  <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 leading-relaxed font-normal">
                    Hola, soy <strong className="font-semibold text-gray-800 dark:text-zinc-200">{cvData.contact.name}</strong>. {cvData.summary.substring(0, 150)}...
                  </p>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <button
                      id="btn-hero-view-cv"
                      onClick={() => setActiveView("cv")}
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 group cursor-pointer"
                    >
                      <span>Ver mi CV interactivo & Perfil Profesional</span>
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Cloud & Technologies visual representations */}
                <div className="grid grid-cols-2 gap-3.5 w-full md:w-auto shrink-0">
                  <div className="p-4 bg-gray-50 dark:bg-zinc-950/40 rounded-2xl border border-gray-150/40 dark:border-zinc-850 text-center flex flex-col items-center justify-center min-w-36">
                    <span className="text-2.5xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">100%</span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono uppercase tracking-widest mt-1">GCP Serverless</span>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-zinc-950/40 rounded-2xl border border-gray-150/40 dark:border-zinc-850 text-center flex flex-col items-center justify-center min-w-36">
                    <span className="text-2.5xl font-extrabold text-emerald-500 dark:text-emerald-400 font-mono">LTS</span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono uppercase tracking-widest mt-1">Soporte Offline</span>
                  </div>
                </div>
              </div>

              {/* TWO COLUMN BENTO LAYOUT (Left Side: Stack & Contacts. Right Side: List of projects) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
                
                {/* COLUMN 1: STACK & SOCIAL CONTACT PANELS (lg:col-span-4) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Dynamic Stack de Tecnologías panel */}
                  <div className="bg-white dark:bg-zinc-900 border border-gray-150/70 dark:border-zinc-850 p-6 rounded-3xl space-y-4 shadow-xs transition-colors">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-blue-600" />
                        <span>Mi Stack de Tecnologías</span>
                      </h3>
                      {selectedCategory !== "Todos" && (
                        <button
                          onClick={() => {
                            setSelectedCategory("Todos");
                            setSelectedTag(null);
                          }}
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Limpiar filtro
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                      Ecosistema de entornos, lenguajes y servicios en la nube para el despliegue de microservicios. Haz clic en las categorías para filtrar los proyectos administrados.
                    </p>

                    {/* Grouped Stack view */}
                    <div className="space-y-4 pt-1">
                      {[
                        { id: "Servicios de Nube", label: "Servicios de Nube", icon: Cloud, color: "text-amber-500 bg-amber-500/10" },
                        { id: "Lenguajes", label: "Lenguajes", icon: Database, color: "text-blue-500 bg-blue-500/10" },
                        { id: "Frameworks", label: "Frameworks & UI", icon: Layers, color: "text-purple-500 bg-purple-500/10" },
                        { id: "Entornos y Despliegue", label: "Entornos & Despliegue", icon: Terminal, color: "text-emerald-500 bg-emerald-500/10" }
                      ].map((catDef) => {
                        const isSelected = selectedCategory === catDef.id;
                        return (
                          <div
                            key={catDef.id}
                            onClick={() => {
                              setSelectedCategory(isSelected ? "Todos" : catDef.id);
                              setSelectedTag(null);
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-blue-50/50 border-blue-400/80 dark:bg-blue-950/20 dark:border-blue-800"
                                : "bg-gray-50/80 hover:bg-gray-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-905 border-gray-150/40 dark:border-zinc-850"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`p-1 rounded ${catDef.color}`}>
                                <catDef.icon className="h-3 w-3" />
                              </span>
                              <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                                {catDef.label}
                              </span>
                              {isSelected && <span className="text-[9px] font-mono text-blue-600 bg-blue-100 dark:bg-blue-950 px-1 py-0.5 rounded ml-auto">Filtro activo</span>}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {/* Extraer tecnologías únicas asociadas a esta categoría */}
                              {Array.from(new Set(
                                projects.flatMap(p => p.technologies)
                                  .filter(t => t.category.toLowerCase().includes(catDef.id.toLowerCase().substring(0, 5)))
                                  .map(t => t.name)
                              )).slice(0, 7).map((techName, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200/45 dark:border-zinc-750/50"
                                >
                                  {techName}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section Contactáme & Redes Sociales */}
                  <div className="bg-white dark:bg-zinc-900 border border-gray-150/70 dark:border-zinc-850 p-6 rounded-3xl space-y-4 shadow-xs transition-colors">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span>Contáctame</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                      ¿Tienes un proyecto en mente o requieres infraestructura de nube en Google Cloud? ¡Conectemos!
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <a
                        href="https://www.instagram.com/rp__wilson?igsh=MTg3NTM1eXZ3OHVhMg=="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-950 border border-gray-150/50 dark:border-zinc-850 rounded-xl font-bold text-gray-700 dark:text-zinc-300 transition-all hover:-translate-y-0.5"
                      >
                        <Instagram className="h-4 w-4 text-rose-500" />
                        <span>Instagram</span>
                      </a>
                      <a
                        href="https://github.com/Wilwonka06"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-950 border border-gray-150/50 dark:border-zinc-850 rounded-xl font-bold text-gray-700 dark:text-zinc-300 transition-all hover:-translate-y-0.5"
                      >
                        <Github className="h-4 w-4 text-gray-900 dark:text-white" />
                        <span>GitHub</span>
                      </a>
                      <a
                        href="https://www.linkedin.com/in/wilson-rojas-palacios-5a831431b?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-950 border border-gray-150/50 dark:border-zinc-850 rounded-xl font-bold text-gray-700 dark:text-zinc-300 transition-all hover:-translate-y-0.5"
                      >
                        <Linkedin className="h-4 w-4 text-blue-600" />
                        <span>LinkedIn</span>
                      </a>
                      <a
                        href="mailto:rojaswil336@gmail.com"
                        className="flex items-center gap-2 p-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-950/40 dark:hover:bg-zinc-950 border border-gray-150/50 dark:border-zinc-850 rounded-xl font-bold text-gray-700 dark:text-zinc-300 transition-all hover:-translate-y-0.5"
                      >
                        <Mail className="h-4 w-4 text-amber-500" />
                        <span>Correo</span>
                      </a>
                    </div>

                    <div className="pt-2 text-center">
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono">
                        rojaswil336@gmail.com
                      </span>
                    </div>
                  </div>

                </div>

                {/* COLUMN 2: LIST-VIEW OF PROJECTS (lg:col-span-8) */}
                <div className="lg:col-span-8 space-y-4">
                  
                  {/* List Header control area */}
                  <div className="flex items-center justify-between pb-2">
                    <div className="text-left">
                      <h2 className="text-xl font-extrabold text-gray-950 dark:text-white tracking-tight">
                        Proyectos Recientes
                      </h2>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 font-mono">
                        {selectedCategory === "Todos" 
                          ? `Total: ${projects.length} desarrollos cargados` 
                          : `Filtro: ${filteredProjects.length} de ${projects.length} en ${selectedCategory}`}
                      </p>
                    </div>

                    {/* Propietario Only button trigger to create custom projects */}
                    {isOwner && (
                      <button
                        id="add-project-floating-btn"
                        onClick={() => setIsCreatingNew(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Añadir Proyecto</span>
                      </button>
                    )}
                  </div>

                  {/* LOADING state */}
                  {isLoadingProjects ? (
                    <div className="py-20 text-center space-y-4 bg-white dark:bg-zinc-900 border border-gray-150/50 dark:border-zinc-850 rounded-3xl">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 font-mono uppercase tracking-widest">
                        Consultando proyectos desde el JSON externo...
                      </p>
                    </div>
                  ) : filteredProjects.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900">
                      <span className="text-3xl block">🔍</span>
                      <h3 className="text-base font-bold text-gray-800 dark:text-zinc-200 mt-2">
                        No se encontraron proyectos correspondientes
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                        Prueba seleccionando otra categoría tecnológica en el panel lateral.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedCategory("Todos");
                          setSelectedTag(null);
                        }}
                        className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-350 text-xs font-bold rounded-xl mt-4 cursor-pointer"
                      >
                        Restablecer Filtros
                      </button>
                    </div>
                  ) : (
                    /* SIMPLIFIED LIST VIEW: "solo les pondrás nombre, año, lo demás se verá una vez se presione" */
                    <div className="divide-y divide-gray-100 dark:divide-zinc-850 bg-white dark:bg-zinc-900 border border-gray-150/70 dark:border-zinc-850 rounded-3xl overflow-hidden shadow-xs transition-colors">
                      <AnimatePresence mode="popLayout">
                        {filteredProjects.map((project, idx) => (
                          <motion.div
                            key={project.id || idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.15, delay: idx * 0.03 }}
                            onClick={() => setSelectedProject(project)}
                            className="flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50/70 dark:hover:bg-zinc-950/40 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-4 text-left">
                              {/* Standard compact timeline year representation */}
                              <div className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-305 font-mono text-xs font-bold rounded-lg shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {project.year}
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="text-base font-bold text-gray-950 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {project.name}
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {project.technologies.slice(0, 4).map((tech, techIdx) => (
                                    <span
                                      key={techIdx}
                                      className="text-[10px] font-mono text-gray-400 dark:text-zinc-500"
                                    >
                                      • {tech.name}
                                    </span>
                                  ))}
                                  {project.technologies.length > 4 && (
                                    <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500">
                                      +{project.technologies.length - 4} más
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions Right side: view indicator or administrative controls */}
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {isOwner ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setEditingProject(project)}
                                    title="Editar este proyecto"
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-500 hover:text-blue-600 dark:hover:text-zinc-700/80 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <EditIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`¿Estás seguro de que quieres eliminar "${project.name}"?`)) {
                                        const remaining = projects.filter(p => p.id !== project.id);
                                        saveProjectsList(remaining);
                                      }
                                    }}
                                    title="Eliminar este proyecto"
                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                  Ver Detalles ›
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Operational sync notice block */}
                  <div className="p-4 bg-gray-50/80 border border-gray-150/40 dark:bg-zinc-900/30 dark:border-zinc-850 rounded-2.5xl text-left flex gap-3.5 transition-colors">
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs">
                      <h4 className="font-bold text-gray-900 dark:text-white">Persistencia con Soporte Sin Conexión:</h4>
                      <p className="text-gray-500 dark:text-zinc-400 leading-relaxed font-normal">
                        Las adiciones, ediciones o eliminaciones se almacenan directamente de forma segura en `localStorage` con simulaciones de sincronización a Google Cloud. ¡Todo el contenido modificado sobrevive a recargas!
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </motion.section>
          )}

          {/* MODULE 2: INTERACTIVE DIGITAL CV & EDIT SESSIONS */}
          {activeView === "cv" && (
            <motion.section
              key="cv-view-stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <CVDigital
                data={cvData}
                onUpdate={handleUpdateCV}
                syncStatus={syncStatus}
                isOwner={isOwner}
              />
            </motion.section>
          )}

        </AnimatePresence>
      </main>

      {/* DYNAMIC POPUP DETAILS OVERLAY VIEW - MATCHING THE SPECIFIC SCENARIO IN IMAGE */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      {/* ADMIN CREATION / EDIT MODAL DRAWER FOR PORTFOLIO PROJECTS */}
      <AnimatePresence>
        {(isCreatingNew || editingProject) && (
          <div
            id="project-edit-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => {
              setIsCreatingNew(false);
              setEditingProject(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden text-left"
            >
              <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-gray-950 dark:text-white uppercase tracking-wider">
                  {editingProject ? `Editar Proyecto: ${editingProject.name}` : "Añadir Nuevo Proyecto"}
                </h3>
                <button
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingProject(null);
                  }}
                  className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold rounded-lg text-sm text-gray-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form rendering */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  handleSaveProjectForm(editingProject ? editingProject.id : "", {
                    name: target.projName.value,
                    year: target.projYear.value,
                    description: target.projDesc.value,
                    longDescription: target.projLongDesc.value,
                    image: target.projImage.value,
                    url: target.projUrl.value,
                    github: target.projGithub.value,
                    techString: target.projTechs.value,
                    highlightsString: target.projHighlights.value,
                  });
                }}
                className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Nombre del Proyecto</label>
                    <input
                      type="text"
                      name="projName"
                      required
                      defaultValue={editingProject ? editingProject.name : ""}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-zinc-200"
                      placeholder="Ej: EnrutApp"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Año de Entrega</label>
                    <input
                      type="text"
                      name="projYear"
                      required
                      defaultValue={editingProject ? editingProject.year : new Date().getFullYear().toString()}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-zinc-200"
                      placeholder="Ej: 2026"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Imagen de Portada (Enlace URL)</label>
                  <input
                    type="text"
                    name="projImage"
                    defaultValue={editingProject ? editingProject.image : ""}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-zinc-200 font-mono"
                    placeholder="Ej: https://images.unsplash.com/photo-1519389950473-47ba0277781c"
                  />
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">Sugerido: Usa cualquier enlace de Unsplash o Imgur. Puedes cambiar esta imagen en cualquier momento.</p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Descripción Breve</label>
                  <input
                    type="text"
                    name="projDesc"
                    required
                    defaultValue={editingProject ? editingProject.description : ""}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-zinc-200"
                    placeholder="Breve resumen de una línea que aparece al listarlo"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Descripción Detallada (Dashboard)</label>
                  <textarea
                    name="projLongDesc"
                    rows={3}
                    defaultValue={editingProject ? editingProject.longDescription : ""}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-zinc-200 font-sans"
                    placeholder="Explica detalladamente la funcionalidad básica, de qué tratan los algoritmos o el despliegue..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Url Github</label>
                    <input
                      type="text"
                      name="projGithub"
                      defaultValue={editingProject ? editingProject.github : ""}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-zinc-200 font-mono"
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Url Sitio Demo</label>
                    <input
                      type="text"
                      name="projUrl"
                      defaultValue={editingProject ? editingProject.url : ""}
                      className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-zinc-200 font-mono"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Tecnologías (Separadas por comas)</label>
                  <input
                    type="text"
                    name="projTechs"
                    defaultValue={editingProject ? editingProject.technologies.map(t => t.name).join(", ") : ""}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-zinc-200"
                    placeholder="Ej: React, NestJS, Google Cloud, Firebase Console"
                  />
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">Nuestro sistema auto-clasificará las tecnologías según su tipo (Nube, Lenguajes, etc.) para listarlas.</p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Logros o Highlights (Uno por línea)</label>
                  <textarea
                    name="projHighlights"
                    rows={3}
                    defaultValue={editingProject ? editingProject.highlights.join("\n") : ""}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-zinc-200 font-sans"
                    placeholder="Despliegue serverless optimizado a microsegundos&#10;Identidad resguardada con Firebase Auth"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setEditingProject(null);
                    }}
                    className="px-4 py-2 text-xs font-bold bg-gray-50 hover:bg-gray-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-gray-250 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-gray-150 dark:border-zinc-900/60 py-8 text-center text-xs text-gray-400 dark:text-zinc-500 select-none">
        <p>© 2026 {cvData.contact.name}. Todos los derechos reservados.</p>
        <p className="mt-1 font-mono text-[10px] text-gray-300 dark:text-zinc-650">
          Procesado bajo tecnologías de Nube de Google • Firebase Console Integrado
        </p>
      </footer>

    </div>
  );
}
