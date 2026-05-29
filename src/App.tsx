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
  Info,
  Menu,
  X
} from "lucide-react";

import { Project, CVData, Technology } from "./types";
import { INITIAL_CV_DATA } from "./defaultCV";
import SyncIndicator from "./components/SyncIndicator";
import ProjectModal from "./components/ProjectModal";
import CVDigital from "./components/CVDigital";
import { db, auth, googleProvider, handleFirestoreError, OperationType } from "./lib/firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
// @ts-ignore
import profileBanner from "./assets/images/presentación.jpeg";

// Static Technology Stack information including description
const STATIC_TECH_STACK_DATA = [
  {
    name: "WordPress",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg",
    description: "Utilizo WordPress para crear sitios web rápidos, autogestionables y optimizados para SEO, adaptando plantillas y desarrollando temas personalizados."
  },
  {
    name: "JavaScript",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    description: "Utilizo JavaScript como mi lenguaje principal de scripting tanto en el frontend como en el backend, permitiendo interactividad dinámica y lógicas avanzadas."
  },
  {
    name: "HTML5",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
    description: "Es la base estructural de todas mis aplicaciones web, enfocado en marcado semántico, accesibilidad y SEO técnico."
  },
  {
    name: "CSS3",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
    description: "Esencial para el diseño de interfaces de usuario interactivas, layouts con Flexbox y Grid, variables nativas y animaciones refinadas."
  },
  {
    name: "PHP",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
    description: "Lo utilizo para desarrollos en el backend, integración estricta de bases de datos, APIs de servidores y el mantenimiento de portales web dinámicos."
  },
  {
    name: "Python",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    description: "Fundamental en mi stack para la automatización de flujos de trabajo, web scraping, scripts ágiles y el procesamiento automatizado de datos."
  },
  {
    name: "React",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    description: "Mi biblioteca favorita para construir interfaces altamente interactivas, dinámicas y modulares aplicando estados reactivos y componentes autónomos."
  },
  {
    name: "Next.js",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
    description: "Lo escojo para construir aplicaciones web robustas sobre React enfocadas en Server-Side Rendering (SSR) y optimización para buscadores."
  },
  {
    name: "Tailwind CSS",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
    description: "Mi framework de estilado preferido, permitiéndome acelerar el diseño responsive mediante clases utilitarias altamente configurables."
  },
  {
    name: "Astro",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/astro/astro-original.svg",
    description: "Herramienta que utilizo para construir micro-sitios estáticos ultrarrápidos, optimizados al máximo y con un consumo insignificante de JavaScript."
  },
  {
    name: "Node.js",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
    description: "Plataforma clave para programar servicios del backend rápidos y de baja latencia mediante APIs REST, utilizando JavaScript en todo el espectro."
  },
  {
    name: "PostgreSQL",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
    description: "Base de datos relacional de nivel corporativo para almacenar datos tipados garantizando integridad, consistencia e indexado eficiente para búsquedas."
  },
  {
    name: "Git / GitHub",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
    description: "Básico para el control de versiones y el trabajo colaborativo distribuido mediante repositorios administrados de manera segura."
  },
  {
    name: "Figma",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
    description: "Herramienta con la que estructuro flujos de experiencia de usuario (UX) y diseño maquetaciones interactivas previas al código."
  },
  {
    name: "NestJS",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg",
    description: "Framework empresarial de Node.js que elijo para arquitecturas escalables, completamente testeadas y escritas con TypeScript estricto."
  },
  {
    name: "Bootstrap",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
    description: "Framework clásico que me permite prototipar rápidamente plantillas visuales y maquetaciones de administración ágiles."
  },
  {
    name: "Firebase",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-original.svg",
    description: "Utilizo servicios de Firebase (Firestore para base de datos NoSQL, Authentication para sesiones e IAM) para prototipado rápido y sincronización en vivo."
  },
  {
    name: "Google Cloud",
    logoUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg",
    description: "Ecosistema para hospedar aplicaciones en microservicios autogestionados mediante Cloud Run y Cloud Functions logrando escalado serverless impecable."
  }
];

// Smart Devicon CDN logo selector with manual mappings to ensure perfect hits
const getDeviconCdnUrl = (name: string): string => {
  const normalized = name.trim().toLowerCase();
  
  const mappings: { [key: string]: string } = {
    "c++": "cplusplus",
    "cpp": "cplusplus",
    "c#": "csharp",
    "c sharp": "csharp",
    "javascript": "javascript",
    "js": "javascript",
    "typescript": "typescript",
    "ts": "typescript",
    "react": "react",
    "reactjs": "react",
    "react.js": "react",
    "vue": "vuejs",
    "vuejs": "vuejs",
    "vue.js": "vuejs",
    "next": "nextjs",
    "nextjs": "nextjs",
    "next.js": "nextjs",
    "tailwind": "tailwindcss",
    "tailwindcss": "tailwindcss",
    "postgres": "postgresql",
    "postgresql": "postgresql",
    "firebase": "firebase",
    "firestore": "firebase",
    "gcp": "googlecloud",
    "google cloud": "googlecloud",
    "node": "nodejs",
    "nodejs": "nodejs",
    "node.js": "nodejs",
    "git": "git",
    "figma": "figma",
    "astro": "astro",
    "wordpress": "wordpress",
    "wp": "wordpress",
    "php": "php",
    "python": "python",
    "sql": "mysql",
    "docker": "docker",
    "kubernetes": "kubernetes",
    "k8s": "kubernetes",
    "aws": "amazonwebservices",
    "amazon web services": "amazonwebservices",
    "azure": "azure",
    "sass": "sass",
    "scss": "sass",
    "mongodb": "mongodb",
    "mongo": "mongodb",
    "express": "express",
    "expressjs": "express",
    "nest": "nestjs",
    "nestjs": "nestjs",
    "angular": "angularjs",
    "angularjs": "angularjs",
    "graphql": "graphql",
    "redux": "redux",
    "html": "html5",
    "html5": "html5",
    "css": "css3",
    "css3": "css3",
    "bootstrap": "bootstrap"
  };

  const matchedSlug = mappings[normalized] || normalized.replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  return matchedSlug ? `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${matchedSlug}/${matchedSlug}-original.svg` : "";
};

export default function App() {
  // Navigation View selection
  const [activeView, setActiveView] = useState<"projects" | "cv">("projects");

  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Locked to Light Mode as requested. Dark mode completely disabled.
  const darkMode = false;

  // Owner Mode versus Guest mode toggle (Visitor default)
  const [isOwner, setIsOwner] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio-is-owner");
      return saved === "true"; 
    }
    return false;
  });

  // Hidden admin click count to toggle editor buttons for Wilson Rojas (5 clicks in header / footer)
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [adminNotification, setAdminNotification] = useState<string | null>(null);
  const [showAdminTabOption, setShowAdminTabOption] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("portfolio-show-admin-trigger") === "true";
    }
    return false;
  });

  const handleSecretClick = () => {
    setAdminClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        const nextState = !showAdminTabOption;
        setShowAdminTabOption(nextState);
        setIsOwner(nextState);
        if (typeof window !== "undefined") {
          localStorage.setItem("portfolio-show-admin-trigger", String(nextState));
          localStorage.setItem("portfolio-is-owner", String(nextState));
        }
        setAdminNotification(nextState ? "🔓 ¡Modo de edición dueño activado!" : "🔒 Modo lector estándar activado.");
        setTimeout(() => setAdminNotification(null), 3000);
        return 0;
      }
      return next;
    });
  };

  // Dynamic projects loaded from external JSON or localStorage
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Search & Filtering State - No more text box search, but keeping category filters
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Project Editor state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // Custom tools configuration panel states
  const [editingTech, setEditingTech] = useState<{ name: string; logoUrl: string; description: string; enabled?: boolean } | null>(null);
  const [isAddingTech, setIsAddingTech] = useState(false);
  const [newTechName, setNewTechName] = useState("");
  const [newTechDescription, setNewTechDescription] = useState("");
  const [newTechLogoUrl, setNewTechLogoUrl] = useState("");

  // Selected technology logo for showing custom details popup
  const [selectedTechForModal, setSelectedTechForModal] = useState<typeof STATIC_TECH_STACK_DATA[0] | null>(null);

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

  // Dynamic Technology Stack with selection manager
  const [techStack, setTechStack] = useState<{ name: string; logoUrl: string; description: string; enabled?: boolean }[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio-tech-stack-enabled");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item: any) => {
              const staticMatch = STATIC_TECH_STACK_DATA.find(s => s.name.toLowerCase() === item.name.toLowerCase());
              return {
                name: item.name,
                logoUrl: item.logoUrl || (staticMatch ? staticMatch.logoUrl : "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"),
                description: item.description || (staticMatch ? staticMatch.description : "Detalle de herramienta técnica."),
                enabled: typeof item.enabled !== "undefined" ? !!item.enabled : true
              };
            });
          }
        } catch (_) {}
      }
    }
    // Default: all enabled
    return STATIC_TECH_STACK_DATA.map(tech => ({ ...tech, enabled: true }));
  });

  // Save changes to localStorage on tech stack toggle
  const toggleTechEnabled = (name: string) => {
    const updated = techStack.map(t => t.name === name ? { ...t, enabled: !t.enabled } : t);
    saveTechStack(updated);
  };

  // Network and Firestore Sync status
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline-pending">("synced");
  const [lastSyncedTime, setLastSyncedTime] = useState<Date | null>(new Date());

  // Active user credentials state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Authentication status observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        const isOfficialOwner = firebaseUser.email === "rojaswil336@gmail.com";
        setIsOwner(isOfficialOwner);
        if (typeof window !== "undefined") {
          localStorage.setItem("portfolio-is-owner", String(isOfficialOwner));
        }
        if (isOfficialOwner) {
          setShowAdminTabOption(true);
          setAdminNotification("🔓 Sesión iniciada como Wilson Rojas (Propietario). Permisos de escritura activos.");
        } else {
          setAdminNotification(`👤 Autenticado como ${firebaseUser.displayName || 'Visitante'}. Modo editor local congelado.`);
        }
        setTimeout(() => setAdminNotification(null), 5000);
      } else {
        setIsOwner(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("portfolio-is-owner", "false");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Google Auth popups
  const triggerGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Auth fail: ", err);
      setAdminNotification("⚠️ Error de autenticación. Abre el sitio en una pestaña nueva.");
      setTimeout(() => setAdminNotification(null), 5000);
    }
  };

  const triggerLogout = async () => {
    try {
      await signOut(auth);
      setAdminNotification("🔒 Sesión de Google finalizada.");
      setTimeout(() => setAdminNotification(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Real-time listen to projects collection
  useEffect(() => {
    setIsLoadingProjects(true);
    const unsubscribe = onSnapshot(collection(db, "projects"), (snapshot) => {
      const list: Project[] = [];
      snapshot.forEach((pSnap) => {
        list.push({ id: pSnap.id, ...pSnap.data() } as Project);
      });

      if (snapshot.empty) {
        // Load defaults from local JSON file to ensure visitors can instantly see data
        fetch("/projects.json")
          .then(res => res.json())
          .then(data => {
            setProjects(data);
            setProjectError(null);
            
            // Populate database ONLY if the current logged-in user is the verified owner
            if (auth.currentUser?.email === "rojaswil336@gmail.com") {
              data.forEach(async (proj: Project) => {
                try {
                  await setDoc(doc(db, "projects", proj.id), proj);
                } catch (writeErr) {
                  console.error("Failed to bootstrap project to Firestore: ", writeErr);
                  handleFirestoreError(writeErr, OperationType.WRITE, `projects/${proj.id}`);
                }
              });
            }
          })
          .catch(err => {
            console.error("Error populating projects: ", err);
            setProjectError("Fallo al inicializar proyectos por defecto.");
          });
      } else {
        list.sort((a, b) => b.year.localeCompare(a.year));
        setProjects(list);
        setProjectError(null);
      }
      setIsLoadingProjects(false);
    }, (err) => {
      console.error("Firestore projects listener error: ", err);
      // Local fallback
      const saved = localStorage.getItem("portfolio-projects-list");
      if (saved) {
        try {
          setProjects(JSON.parse(saved));
        } catch (_) {}
      }
      setIsLoadingProjects(false);
      handleFirestoreError(err, OperationType.GET, "projects");
    });

    return () => unsubscribe();
  }, []);

  // Real-time listen to primary CV Data document
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "cv_data", "main"), (snap) => {
      if (snap.exists()) {
        setCvData(snap.data() as CVData);
      } else {
        // Offline fallback to INITIAL_CV_DATA
        setCvData(INITIAL_CV_DATA);
        // Write defaults to Firestore ONLY if the current logged-in user is the verified owner
        if (auth.currentUser?.email === "rojaswil336@gmail.com") {
          setDoc(doc(db, "cv_data", "main"), INITIAL_CV_DATA)
            .catch(err => {
              console.error("Bootstrap writing CV error: ", err);
              handleFirestoreError(err, OperationType.WRITE, "cv_data/main");
            });
        }
      }
    }, (err) => {
      console.error("CV data listener error: ", err);
      handleFirestoreError(err, OperationType.GET, "cv_data/main");
    });

    return () => unsubscribe();
  }, []);

  // Real-time listen to Technical tools stack document
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "cv_data", "tech_stack"), (snap) => {
      if (snap.exists()) {
        const stackList = snap.data().items as any[];
        setTechStack(stackList);
      } else {
        const initialStack = STATIC_TECH_STACK_DATA.map(t => ({ ...t, enabled: true }));
        setTechStack(initialStack);
        // Write defaults to Firestore ONLY if the current logged-in user is the verified owner
        if (auth.currentUser?.email === "rojaswil336@gmail.com") {
          setDoc(doc(db, "cv_data", "tech_stack"), { items: initialStack })
            .catch(err => {
              console.error("Bootstrap writing Techstack error: ", err);
              handleFirestoreError(err, OperationType.WRITE, "cv_data/tech_stack");
            });
        }
      }
    }, (err) => {
      console.error("Tech stack listener error: ", err);
      handleFirestoreError(err, OperationType.GET, "cv_data/tech_stack");
    });

    return () => unsubscribe();
  }, []);

  // Synchronise isOwner state
  useEffect(() => {
    localStorage.setItem("portfolio-is-owner", String(isOwner));
  }, [isOwner]);

  // Always locked to elegant bright mode
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
  }, []);

  // Update projects list fallback helper
  const saveProjectsList = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem("portfolio-projects-list", JSON.stringify(updatedProjects));
  };

  // Sync tools database
  const saveTechStack = async (updated: typeof techStack) => {
    setTechStack(updated);
    localStorage.setItem("portfolio-tech-stack-enabled", JSON.stringify(updated));
    setSyncStatus("syncing");
    try {
      await setDoc(doc(db, "cv_data", "tech_stack"), { items: updated });
      setSyncStatus("synced");
      setLastSyncedTime(new Date());
    } catch (err) {
      console.error("Firestore Tools sync failed: ", err);
      setSyncStatus("offline-pending");
      handleFirestoreError(err, OperationType.WRITE, "cv_data/tech_stack");
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

  // Main save action for custom added/edited projects (survives offline + saves in Firestore)
  const handleSaveProjectForm = async (
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

    setSyncStatus("syncing");
    try {
      // Write document in Firestore
      await setDoc(doc(db, "projects", targetId), updatedData);
      setSyncStatus("synced");
      setLastSyncedTime(new Date());

      if (editingProject) {
        setEditingProject(null);
      } else {
        setIsCreatingNew(false);
      }
    } catch (err: any) {
      console.error("Firestore write project error: ", err);
      // Fallback local support
      if (editingProject) {
        const updatedList = projects.map(p => p.id === editingProject.id ? updatedData : p);
        saveProjectsList(updatedList);
        setEditingProject(null);
      } else {
        const updatedList = [updatedData, ...projects];
        saveProjectsList(updatedList);
        setIsCreatingNew(false);
      }
      setSyncStatus("offline-pending");
      handleFirestoreError(err, OperationType.WRITE, `projects/${targetId}`);
    }
  };

  // Update dynamic CV data from edits
  const handleUpdateCV = async (newData: CVData) => {
    setCvData(newData);
    localStorage.setItem("portfolio-cv-data", JSON.stringify(newData));

    setSyncStatus("syncing");
    try {
      await setDoc(doc(db, "cv_data", "main"), newData);
      setSyncStatus("synced");
      setLastSyncedTime(new Date());
    } catch (err) {
      console.error("Firestore write CV error: ", err);
      setSyncStatus("offline-pending");
      handleFirestoreError(err, OperationType.WRITE, "cv_data/main");
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
    <div id="portfolio-app-root" className="min-h-screen bg-white text-zinc-900 font-sans pb-32">
      
      {/* Floating admin notification toast banner */}
      <AnimatePresence>
        {adminNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-zinc-800"
          >
            <span className="text-emerald-400">⚡</span>
            <span>{adminNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* GLOBAL NAVBAR HEADER */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Left Brand Identity: Name and Role (Toggles admin mode with 5 clicks secretly) */}
          <div 
            onClick={handleSecretClick}
            className="flex items-center gap-2.5 cursor-pointer select-none active:scale-95 transition-transform"
            title="Presiona varias veces para más detalles"
          >
            <div className="w-10 h-10 bg-blue-950 text-white rounded-xl flex items-center justify-center font-extrabold text-base shadow-sm uppercase">
              {cvData.contact.name ? cvData.contact.name.split(" ").map(w => w[0]).slice(0, 2).join("") : "WR"}
            </div>
            <div className="text-left">
              <span className="font-extrabold text-zinc-950 tracking-tight block text-sm sm:text-base leading-none">
                {cvData.contact.name}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block mt-1 tracking-tight">
                {cvData.contact.title}
              </span>
            </div>
          </div>

          {/* Header Horizontal Tabs (Visible on desktop alongside the bottom floating bar) */}
          <div className="hidden md:flex items-center gap-2 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button
              onClick={() => {
                setActiveView("projects");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === "projects"
                  ? "bg-white text-zinc-950 shadow-xs scale-[1.02]"
                  : "text-zinc-500 hover:text-zinc-950 bg-transparent"
              }`}
            >
              <FolderKanban className="h-3.5 w-3.5 text-blue-900" />
              <span>Proyectos</span>
            </button>
            <button
              onClick={() => {
                setActiveView("cv");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeView === "cv"
                  ? "bg-white text-zinc-950 shadow-xs scale-[1.02]"
                  : "text-zinc-550 hover:text-zinc-950 bg-transparent"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5 text-blue-900" />
              <span>CV Digital</span>
            </button>
          </div>

          {/* Right Area: Owner Toggle & Contact Actions */}
          <div className="flex items-center gap-3">
            {/* Interactive Admin/Visitor switch - visible only if showAdminTabOption is true (unlocked) or isOwner already active */}
            {(showAdminTabOption || isOwner) && (
              <div className="hidden sm:flex items-center gap-1 p-0.5 bg-zinc-100 rounded-xl border border-zinc-200 text-[11px] font-bold">
                <button
                  id="role-visitor-toggle"
                  onClick={() => setIsOwner(false)}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    !isOwner
                      ? "bg-white text-blue-900 shadow-xs"
                      : "text-zinc-400 hover:text-zinc-700"
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
                      ? "bg-blue-950 text-white shadow-xs"
                      : "text-zinc-400 hover:text-zinc-700"
                  }`}
                  title="Activar permisos de Propietario para poder editar y añadir"
                >
                  {isOwner && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                  <span>Dueño (Editor)</span>
                </button>
              </div>
            )}

            {/* Desktop Contact smooth click anchor */}
            <button
              id="nav-contact-email"
              onClick={() => {
                setActiveView("projects");
                setTimeout(() => {
                  const element = document.getElementById("contact-section");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }, 100);
              }}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-blue-950 hover:bg-slate-900 font-bold text-xs text-white rounded-xl shadow-xs transition-transform"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Contáctame</span>
            </button>

            {/* Mobile Hamburger menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* Collapsible Mobile Navigation Bar Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-zinc-200 bg-zinc-50 overflow-hidden shadow-inner text-left"
            >
              <div className="px-5 py-5 space-y-4">
                
                {/* Mobile Identity Block (Mi nombre junto con el rol) */}
                <div className="p-3 bg-white rounded-xl border border-zinc-200 shadow-3xs">
                  <span className="text-xs font-mono text-zinc-400 block uppercase tracking-wider">Desarrollador Responsable</span>
                  <h4 className="text-sm font-black text-zinc-950 leading-tight mt-0.5">
                    {cvData.contact.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-medium leading-none mt-1">
                    {cvData.contact.title}
                  </p>
                </div>

                {/* Section navigational redirect links */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveView("projects");
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-xs font-extrabold flex items-center justify-between transition-colors ${
                      activeView === "projects" ? "bg-zinc-950 text-white" : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderKanban className="h-4 w-4 text-blue-800" />
                      <span>Proyectos Recientes</span>
                    </div>
                    <span className="text-[10px] opacity-75">›</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView("cv");
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-xs font-extrabold flex items-center justify-between transition-colors ${
                      activeView === "cv" ? "bg-zinc-950 text-white" : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="h-4 w-4 text-blue-800" />
                      <span>CV Digital</span>
                    </div>
                    <span className="text-[10px] opacity-75">›</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView("projects");
                      setMobileMenuOpen(false);
                      setTimeout(() => {
                        const element = document.getElementById("contact-section");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }, 180);
                    }}
                    className="w-full text-left px-4 py-3 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-lg text-xs font-extrabold flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-blue-800" />
                      <span>Contáctame & Redes</span>
                    </div>
                    <span className="text-[10px] opacity-75">›</span>
                  </button>
                </div>

                {/* Mobile Admin switcher - strictly hidden for standard readers/guests (as requested: "el menú para los demas usuarios no debe mostrar la parte que dice vista lector/ dueño") */}
                {isOwner && (
                  <div className="p-3.5 bg-zinc-100/80 rounded-xl border border-dashed border-zinc-300">
                    <span className="text-[9px] text-zinc-500 font-mono block mb-2 uppercase tracking-wide">Panel del Propietario</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setIsOwner(false); setMobileMenuOpen(false); }}
                        className={`py-2 px-3 rounded-lg text-[10px] font-black tracking-wider uppercase text-center cursor-pointer transition-colors ${
                          !isOwner ? "bg-zinc-950 text-white" : "bg-white text-zinc-700 border border-zinc-200"
                        }`}
                      >
                        Lector
                      </button>
                      <button
                        onClick={() => { setIsOwner(true); setMobileMenuOpen(false); }}
                        className={`py-2 px-3 rounded-lg text-[10px] font-black tracking-wider uppercase text-center cursor-pointer transition-colors ${
                          isOwner ? "bg-amber-600 text-white" : "bg-white text-zinc-700 border border-zinc-200"
                        }`}
                      >
                        Dueño (Edit)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              className="space-y-8 pb-10"
            >
              {/* 1. TOP ABOUT ME BANNER IMAGE (As requested: "al inicio, antes de la presentación va la imagen sobre mi") */}
              <div className="w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xs">
                <img 
                  src={profileBanner} 
                  alt="Wilson Rojas - Desarrollador de Software" 
                  className="w-full h-auto object-cover max-h-[280px] sm:max-h-[420px]"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* 2. ABOUT ME PRESENTATION CARD */}
              <div className="bg-white border border-zinc-200 p-6 sm:p-8 rounded-3.5xl flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-xs">
                <div className="space-y-3.5 max-w-2xl">
                  {/* Skill Badge */}
                  {/* <div className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-100 border border-zinc-200 text-blue-950 font-mono rounded-full text-[11px] font-bold">
                    <Award className="h-3.5 w-3.5 text-blue-900" />
                    <span>Especialista certificado de Google Cloud & Firebase</span>
                  </div> */}

                  <h1 className="text-3.5xl sm:text-4.2xl font-extrabold text-zinc-950 tracking-tight leading-none">
                    Llevando tus ideas de código a <strong className="text-blue-900 font-extrabold">despliegues robustos</strong>
                  </h1>

                  <p className="text-sm sm:text-base text-zinc-650 leading-relaxed font-normal">
                    Hola, soy <strong className="font-semibold text-zinc-900">{cvData.contact.name}</strong>. {cvData.summary}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <button
                      id="btn-hero-view-cv"
                      onClick={() => {
                        setActiveView("cv");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-900 hover:underline group cursor-pointer"
                    >
                      <span>Ver mi CV interactivo & Perfil Profesional</span>
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Cloud & Technologies visual representations */}
                <div className="grid grid-cols-2 gap-3.5 w-full md:w-auto shrink-0">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-center flex flex-col items-center justify-center min-w-36 shadow-xs">
                    <span className="text-2.5xl font-extrabold text-blue-900 font-mono">100%</span>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">GCP Serverless</span>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-center flex flex-col items-center justify-center min-w-36 shadow-xs">
                    <span className="text-2.5xl font-extrabold text-blue-900 font-mono">LTS</span>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Soporte Offline</span>
                  </div>
                </div>
              </div>

              {/* 3. LIST-VIEW OF PROJECTS (NOW RESTRUCTURED TO TAKE FULL WIDTH) */}
              <div className="w-full space-y-4 pt-4 text-left">
                
                {/* List Header control area */}
                <div className="flex items-center justify-between pb-2">
                  <div className="text-left">
                    <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">
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
                    <div className="divide-y divide-gray-100  bg-white  border border-gray-150/70 dark:border-zinc-850 rounded-3xl overflow-hidden shadow-xs transition-colors">
                      <AnimatePresence mode="popLayout">
                        {filteredProjects.map((project, idx) => (
                          <motion.div
                            key={project.id || idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.15, delay: idx * 0.03 }}
                            onClick={() => setSelectedProject(project)}
                            className="flex items-center justify-between p-4 sm:p-5 hover:bg-zinc-50 border-b border-zinc-100 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-4 text-left">
                              {/* Standard compact timeline year representation */}
                              <div className="px-3 py-1 bg-zinc-150 text-zinc-900 font-mono text-xs font-bold rounded-lg shrink-0 group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                                {project.year}
                              </div>
                              <div>
                                <h4 className="text-base font-black text-zinc-950 tracking-tight group-hover:text-blue-700 transition-colors">
                                  {project.name}
                                </h4>
                              </div>
                            </div>

                            {/* Actions Right side: view indicator or administrative controls */}
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {isOwner ? (
                                <div className="flex items-center gap-1.5">
                                  {deletingProjectId === project.id ? (
                                    <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg p-0.5 shadow-2xs" onClick={(e) => e.stopPropagation()}>
                                      <span className="text-[10px] text-red-700 font-bold px-1.5 py-0.5">¿Eliminar?</span>
                                      <button
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          setSyncStatus("syncing");
                                          try {
                                            await deleteDoc(doc(db, "projects", project.id));
                                            setSyncStatus("synced");
                                            setLastSyncedTime(new Date());
                                          } catch (err) {
                                            console.error("error: ", err);
                                            const remaining = projects.filter(p => p.id !== project.id);
                                            saveProjectsList(remaining);
                                            setSyncStatus("offline-pending");
                                            handleFirestoreError(err, OperationType.DELETE, `projects/${project.id}`);
                                          }
                                          setDeletingProjectId(null);
                                        }}
                                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                                        title="Confirmar eliminación"
                                      >
                                        Sí
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeletingProjectId(null);
                                        }}
                                        className="px-2 py-1 bg-zinc-200 hover:bg-zinc-350 text-zinc-800 rounded text-[10px] font-bold cursor-pointer transition-colors"
                                        title="Cancelar"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingProject(project);
                                        }}
                                        title="Editar este proyecto"
                                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-500 hover:text-blue-600 dark:hover:text-zinc-700/80 rounded-lg transition-colors cursor-pointer"
                                      >
                                        <EditIcon className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeletingProjectId(project.id);
                                        }}
                                        title="Eliminar este proyecto"
                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
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
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2.5xl text-left flex gap-3.5 shadow-xs">
                    <Info className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs">
                      <h4 className="font-bold text-zinc-950">Persistencia con Soporte Sin Conexión:</h4>
                      <p className="text-zinc-600 leading-relaxed font-normal">
                        Las adiciones, ediciones o eliminaciones de proyectos se conservan localmente de forma segura en `localStorage` con simulación automática hacia la nube de Google Cloud & Firebase Console.
                      </p>
                    </div>
                  </div>
                </div>

              {/* 4. SEPARATE TECHNOLOGY STACK LOGO GRID WITH CLICKABLE MODALS (As requested: "sección aparte al stack que manejo... con el logo... abrir una modal") */}
              <div id="stack-separated-section" className="bg-white border border-zinc-200 p-6 sm:p-8 rounded-3.5xl text-left space-y-5 shadow-xs">
                <div className="border-b border-zinc-150 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-zinc-950 tracking-tight flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-blue-900" />
                      <span>Ecosistema de Tecnologías & Herramientas</span>
                    </h3>
                    <p className="text-xs text-zinc-700 font-sans mt-0.5">
                      Haz clic en cualquier herramienta para ver detalladamente para qué la utilizo en mis desarrollos.
                    </p>
                  </div>
                </div>

                {/* Owner controls to select active tech stack items */}
                {isOwner && (
                  <div className="mb-6 p-5 bg-zinc-50 border border-zinc-200 rounded-3xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-zinc-950 flex items-center gap-2">
                          <span className="p-1 bg-zinc-200 rounded-full text-xs">🛠️</span>
                          <span>Gestionar Ecosistema de Herramientas</span>
                        </h4>
                        <p className="text-[11px] text-zinc-650 mt-0.5 font-normal leading-relaxed">
                          Agrega, edita, elimina o activa herramientas. El logo se cargará desde el CDN de Devicon automáticamente o puedes especificar un enlace manual.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsAddingTech(true);
                          setEditingTech(null);
                          setNewTechName("");
                          setNewTechDescription("");
                          setNewTechLogoUrl("");
                        }}
                        className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer transition-all self-start sm:self-center"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Añadir Herramienta</span>
                      </button>
                    </div>

                    {/* Adding Tool / Editing Tool Inline form */}
                    {(isAddingTech || editingTech) && (
                      <div className="p-4 bg-white border border-zinc-200 rounded-2xl shadow-xs space-y-3">
                        <div className="flex justify-between items-center border-b border-zinc-150 pb-2">
                          <h5 className="text-xs font-extrabold text-zinc-950 uppercase tracking-wide">
                            {editingTech ? `Editar Herramienta: ${editingTech.name}` : "Nueva Herramienta Técnica"}
                          </h5>
                          <button
                            onClick={() => {
                              setIsAddingTech(false);
                              setEditingTech(null);
                            }}
                            className="text-zinc-400 hover:text-zinc-650 text-xs font-bold"
                          >
                            Cancelar
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-extrabold text-zinc-650 uppercase tracking-widest block mb-1">Nombre</label>
                            <input
                              type="text"
                              placeholder="Ej. Angular, Docker, Ruby"
                              value={isAddingTech ? newTechName : editingTech?.name || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (isAddingTech) {
                                  setNewTechName(val);
                                  // Auto set logo url suggestion from devicon CDN
                                  if (val.trim()) {
                                    setNewTechLogoUrl(getDeviconCdnUrl(val));
                                  } else {
                                    setNewTechLogoUrl("");
                                  }
                                } else if (editingTech) {
                                  setEditingTech({
                                    ...editingTech,
                                    name: val,
                                    logoUrl: getDeviconCdnUrl(val)
                                  });
                                }
                              }}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 px-3 text-xs text-zinc-800 font-sans focus:outline-none focus:border-blue-500 font-semibold"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-extrabold text-zinc-650 uppercase tracking-widest">Enlace de Imagen o Logo</label>
                              <button
                                type="button"
                                onClick={() => {
                                  const activeName = isAddingTech ? newTechName : editingTech?.name || "";
                                  if (!activeName) return;
                                  const standardUrl = getDeviconCdnUrl(activeName);
                                  const alternateUrl = standardUrl.replace("-original.svg", "-plain.svg");
                                  if (isAddingTech) {
                                    setNewTechLogoUrl(alternateUrl);
                                  } else if (editingTech) {
                                    setEditingTech({ ...editingTech, logoUrl: alternateUrl });
                                  }
                                }}
                                className="text-[9px] font-bold text-blue-800 hover:underline cursor-pointer"
                                title="Prueba con formato plain alternativo si el original no existe en Devicon"
                              >
                                Usar formato plain alternative
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="URL del icono SVG, PNG o devicon URL"
                              value={isAddingTech ? newTechLogoUrl : editingTech?.logoUrl || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (isAddingTech) {
                                  setNewTechLogoUrl(val);
                                } else if (editingTech) {
                                  setEditingTech({ ...editingTech, logoUrl: val });
                                }
                              }}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 px-3 text-xs text-zinc-850 font-mono focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold text-zinc-650 uppercase tracking-widest block mb-1">Descripción de Experiencia / Para qué la usas</label>
                          <textarea
                            rows={2}
                            placeholder="Describe qué desarrollos construyes con esta herramienta o tu nivel de dominio."
                            value={isAddingTech ? newTechDescription : editingTech?.description || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (isAddingTech) {
                                setNewTechDescription(val);
                              } else if (editingTech) {
                                setEditingTech({ ...editingTech, description: val });
                              }
                            }}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 px-3 text-xs text-zinc-800 font-sans focus:outline-none focus:border-blue-500 leading-relaxed font-medium"
                          />
                        </div>

                        {/* Logo Preview box */}
                        <div className="flex items-center gap-3 p-2 bg-zinc-50 border border-zinc-200 rounded-xl">
                          <span className="text-[10px] font-extrabold text-zinc-500 uppercase">Vista previa de Logo:</span>
                          <div className="w-8 h-8 bg-white border border-zinc-200 rounded-lg flex items-center justify-center p-1 shadow-3xs overflow-hidden">
                            <img
                              src={isAddingTech ? newTechLogoUrl : editingTech?.logoUrl || ""}
                              alt="Logo preview"
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg";
                              }}
                            />
                          </div>
                          <span className="text-[9px] text-zinc-400 font-mono block truncate max-w-xs sm:max-w-md">
                            {isAddingTech ? newTechLogoUrl : editingTech?.logoUrl}
                          </span>
                        </div>

                        <div className="flex justify-end gap-2 pt-1 border-t border-zinc-100">
                          <button
                            onClick={() => {
                              setIsAddingTech(false);
                              setEditingTech(null);
                            }}
                            className="px-3 py-1.5 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg cursor-pointer"
                          >
                            Cerrar
                          </button>
                          <button
                            onClick={() => {
                              if (isAddingTech) {
                                if (!newTechName.trim()) {
                                  return;
                                }
                                const nTool = {
                                  name: newTechName.trim(),
                                  logoUrl: newTechLogoUrl.trim() || `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg`,
                                  description: newTechDescription.trim() || `Utilizo esta herramienta para optimizar mi flujo de trabajo de desarrollo.`,
                                  enabled: true
                                };
                                const updated = [...techStack, nTool];
                                saveTechStack(updated);
                                setIsAddingTech(false);
                                setNewTechName("");
                                setNewTechDescription("");
                                setNewTechLogoUrl("");
                              } else if (editingTech) {
                                if (!editingTech.name.trim()) {
                                  return;
                                }
                                const updated = techStack.map(t => t.name === editingTech.name ? editingTech : t);
                                saveTechStack(updated);
                                setEditingTech(null);
                              }
                            }}
                            className="px-4 py-1.5 text-xs font-extrabold bg-blue-900 hover:bg-blue-950 text-white rounded-lg shadow-3xs cursor-pointer"
                          >
                            {editingTech ? "Guardar Cambios" : "Agregar Herramienta"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Checklist of all tools with Edit & Delete button */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                      {techStack.map((tech) => (
                        <div
                          key={tech.name}
                          className={`flex items-center justify-between p-1.5 px-2.5 rounded-xl border text-[11px] font-semibold transition-all select-none ${
                            tech.enabled
                              ? "bg-white border-blue-200 text-zinc-950 shadow-3xs"
                              : "bg-zinc-100/50 border-zinc-250 text-zinc-400 saturate-50 animate-pulse-none"
                          }`}
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1 truncate py-0.5">
                            <input
                              type="checkbox"
                              checked={!!tech.enabled}
                              onChange={() => toggleTechEnabled(tech.name)}
                              className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer accent-blue-600 shrink-0"
                            />
                            <img src={tech.logoUrl} className="w-4.5 h-4.5 object-contain shrink-0" alt="" onError={(e) => { e.currentTarget.src = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" }} />
                            <span className="truncate">{tech.name}</span>
                          </label>

                          <div className="flex items-center gap-1 shrink-0 ml-1.5">
                            <button
                              onClick={() => {
                                setEditingTech({
                                  name: tech.name,
                                  logoUrl: tech.logoUrl,
                                  description: tech.description,
                                  enabled: tech.enabled
                                });
                                setIsAddingTech(false);
                              }}
                              title="Editar este elemento"
                              className="p-1 hover:bg-zinc-200 rounded text-zinc-500 hover:text-blue-900 cursor-pointer"
                            >
                              <EditIcon className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => {
                                const updated = techStack.filter(t => t.name !== tech.name);
                                saveTechStack(updated);
                              }}
                              title="Eliminar este elemento"
                              className="p-1 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Squircles Logo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 pt-2">
                  {techStack.filter(t => t.enabled).map((tech, idx) => (
                    <motion.button
                      key={tech.name || idx}
                      whileHover={{ scale: 1.08, y: -4 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelectedTechForModal(tech)}
                      className="aspect-square bg-white hover:bg-zinc-50/80 border border-zinc-200 hover:border-zinc-300 p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-colors cursor-pointer group shadow-2xs"
                      title={`Haz clic para ver la descripción de ${tech.name}`}
                    >
                      <img
                        src={tech.logoUrl}
                        alt={`Logo de ${tech.name}`}
                        className="w-10 h-10 object-contain transition-transform group-hover:rotate-3 duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span className="text-[11px] font-extrabold text-zinc-750 group-hover:text-zinc-950 transition-colors block text-center truncate w-full px-1">
                        {tech.name}
                      </span>
                    </motion.button>
                  ))}
                  {techStack.filter(t => t.enabled).length === 0 && (
                    <p className="col-span-full text-center text-xs text-zinc-500 py-8 italic font-sans">
                      No hay tecnologías marcadas como activas en este momento.
                    </p>
                  )}
                </div>
              </div>

              {/* 5. CONTACTAME & REDES SOCIALES SECTION (Placed first than contact section, then act as page bottom/footer footer) */}
              <div id="contact-section" className="bg-white border border-zinc-200 p-6 sm:p-8 rounded-3.5xl text-left space-y-6 shadow-xs">
                <div className="border-b border-zinc-150 pb-3">
                  <h3 className="text-xl font-extrabold text-zinc-950 tracking-tight flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-900" />
                    <span>Contáctame & Redes Sociales</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    ¿Quieres colaborar, implementar un sistema inteligente o migrar tu negocio a Google Cloud Platform?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <a
                    href="https://www.instagram.com/rp__wilson?igsh=MTg3NTM1eXZ3OHVhMg=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 rounded-2xl font-bold text-sm text-zinc-800 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                      <Instagram className="h-5 w-5 text-rose-500" />
                    </div>
                    <div className="text-left leading-tight">
                      <span className="text-[10px] text-zinc-400 font-mono block uppercase">Instagram</span>
                      <span className="text-xs text-zinc-900">@rp__wilson</span>
                    </div>
                  </a>

                  <a
                    href="https://github.com/Wilwonka06"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 rounded-2xl font-bold text-sm text-zinc-800 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 bg-zinc-800 text-white rounded-xl flex items-center justify-center shrink-0">
                      <Github className="h-5 w-5" />
                    </div>
                    <div className="text-left leading-tight">
                      <span className="text-[10px] text-zinc-400 font-mono block uppercase">GitHub</span>
                      <span className="text-xs text-zinc-900">Wilwonka06</span>
                    </div>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/wilson-rojas-palacios-5a831431b?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 rounded-2xl font-bold text-sm text-zinc-800 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <Linkedin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left leading-tight">
                      <span className="text-[10px] text-zinc-400 font-mono block uppercase">LinkedIn</span>
                      <span className="text-xs text-zinc-900">Wilson Rojas</span>
                    </div>
                  </a>

                  <a
                    href="mailto:rojaswil336@gmail.com"
                    className="flex items-center gap-3 p-4 bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 rounded-2xl font-bold text-sm text-zinc-800 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="text-left leading-tight">
                      <span className="text-[10px] text-zinc-400 font-mono block uppercase">Correo</span>
                      <span className="text-xs text-zinc-900">rojaswil336@gmail.com</span>
                    </div>
                  </a>
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

      {/* TECH STACK MODAL - AS REQUESTED ("abrir una modal si la selecciono que diga para que utilizo esa herramienta") */}
      <AnimatePresence>
        {selectedTechForModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedTechForModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5"
            >
              {/* Tool Icon container */}
              <div className="mx-auto w-20 h-20 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-center p-4 shadow-sm">
                <img
                  src={selectedTechForModal.logoUrl}
                  alt={selectedTechForModal.name}
                  className="w-12 h-12 object-contain"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-blue-900 tracking-wider uppercase bg-blue-50 px-2.5 py-1 rounded-full">
                  Tecnología del Stack
                </span>
                <h3 className="text-xl font-black text-zinc-950 tracking-tight">
                  {selectedTechForModal.name}
                </h3>
              </div>

              <div className="space-y-3 text-left bg-zinc-50 rounded-xl p-4 border border-zinc-150">
                <h4 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider block">
                  ¿Para qué utilizo esta herramienta?
                </h4>
                <p className="text-sm text-zinc-650 leading-relaxed font-normal">
                  {selectedTechForModal.description}
                </p>
              </div>

              {/* Action and close indicators */}
              <button
                onClick={() => setSelectedTechForModal(null)}
                className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Cerrar Detalle
              </button>
            </motion.div>
          </div>
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

      {/* FLOATING ACTION BOTTOM NAV (Projects / CV Digital) - AS REQUESTED ("proyectos / cv digital, conviertela en botones flotantes en la parte inferior en el centro") */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-white/95 backdrop-blur-md border border-zinc-300 p-1.5 rounded-full flex items-center justify-center gap-1 px-2.5 shadow-2xl max-w-[90vw]">
        <button
          onClick={() => {
            setActiveView("projects");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`px-5 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer select-none ${
            activeView === "projects"
              ? "bg-zinc-950 text-white shadow-md scale-105"
              : "text-zinc-700 hover:text-zinc-950 bg-transparent hover:bg-zinc-100/50"
          }`}
        >
          <FolderKanban className="h-4 w-4 text-blue-800" />
          <span>Proyectos</span>
        </button>
        <button
          onClick={() => {
            setActiveView("cv");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`px-5 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer select-none ${
            activeView === "cv"
              ? "bg-zinc-950 text-white shadow-md scale-105"
              : "text-zinc-700 hover:text-zinc-950 bg-transparent hover:bg-zinc-100/50"
          }`}
        >
          <Briefcase className="h-4 w-4 text-blue-800" />
          <span>CV Digital</span>
        </button>
      </div>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-zinc-200 py-8 text-center text-xs text-zinc-500 select-none bg-zinc-50">
        <p onClick={handleSecretClick} className="cursor-pointer font-bold hover:text-zinc-900 transition-colors">
          © 2026 {cvData.contact.name}. Todos los derechos reservados.
        </p>
        <p className="mt-1 font-mono text-[10px] text-zinc-400">
          Procesado bajo tecnologías de Nube de Google • Firebase Console Integrado
        </p>
      </footer>

    </div>
  );
}
