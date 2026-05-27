import { CVData } from "./types";

export const INITIAL_CV_DATA: CVData = {
  contact: {
    name: "Wilson Rojas Palacios",
    title: "Full Stack Cloud Engineer",
    email: "rojaswil336@gmail.com",
    phone: "+34 612 345 678",
    location: "Madrid, España (Disponible para Remoto)",
    website: "https://github.com/Wilwonka06",
    github: "https://github.com/Wilwonka06",
    linkedin: "https://www.linkedin.com/in/wilson-rojas-palacios-5a831431b?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    instagram: "https://www.instagram.com/rp__wilson?igsh=MTg3NTM1eXZ3OHVhMg=="
  },
  summary: "Desarrollador Full Stack con más de 5 años de trayectoria especializándome en arquitecturas serverless en la nube, optimización de flujos logísticos y automatización. Experto en soluciones impulsadas por el ecosistema de Google Cloud Platform y Firebase Suite. Apasionado por diseñar aplicaciones de alto rendimiento totalmente accesibles, robustas frente a desconexiones y elegantemente adaptativas.",
  experience: [
    {
      id: "exp-1",
      role: "Lead Cloud Developer",
      company: "LogisTech Solutions",
      period: "2024 - Presente",
      description: "Liderazgo del desarrollo y arquitectura back-to-front del ecosistema de aplicaciones móviles y web de despacho terrestre, implementando sincronización en la nube con soporte offline robusto.",
      bullets: [
        "Desarrollo y despliegue del software insignia 'EnrutApp' reduciendo las incidencias de ruteo erróneo en un 32%",
        "Migración completa de servicios legados a Google Cloud Run y Firebase Cloud Functions con escalado automático de cero a millones de peticiones",
        "Configuración e integración de Firebase Console, crashlytics, analytics y distribución automática de compilados"
      ]
    },
    {
      id: "exp-2",
      role: "Software Engineer & Integrator",
      company: "Google Workspace & Cloud Solutions",
      period: "2022 - 2024",
      description: "Diseño y desarrollo de automatizaciones empresariales, integrando APIs de Google Workspace (Drive, Calendar, Sheets) con arquitecturas en Google Cloud Platform.",
      bullets: [
        "Desarrollo de servicios sincronizados de reportes automáticos exportando datos de Firebase Firestore a Google BigQuery e informes interactivos de Sheets",
        "Implementación del sistema OAuth 2.0 seguro para acceso y manipulación segura de repositorios documentales",
        "Creación de microservicios con Express.js y NestJS desplegados en ecosistemas de contenedores administrados en GCP"
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "Ingeniería en Desarrollo de Software",
      school: "Universidad Tecnológica de la Información",
      period: "2018 - 2022",
      description: "Especialización en Sistemas Distribuidos, Bases de Datos Relacionales y NoSQL, y Seguridad Informática."
    }
  ],
  skillCategories: [
    {
      id: "cat-cloud",
      title: "Servicios de Nube",
      skills: [
        { name: "Google Cloud Platform (GCP)" },
        { name: "Firebase Firestore" },
        { name: "Firebase Auth" },
        { name: "Cloud Functions" },
        { name: "Firebase Storage" },
        { name: "Google Maps API" },
        { name: "BigQuery" }
      ]
    },
    {
      id: "cat-env",
      title: "Entornos y Despliegue",
      skills: [
        { name: "Firebase Console" },
        { name: "Google Cloud Console" },
        { name: "Docker" },
        { name: "Git & GitHub Actions" },
        { name: "Vite" },
        { name: "Vercel / Cloud Run" }
      ]
    },
    {
      id: "cat-lang",
      title: "Lenguajes",
      skills: [
        { name: "TypeScript" },
        { name: "JavaScript (ES6+)" },
        { name: "HTML5 / CSS3" },
        { name: "SQL (PostgreSQL / MySQL)" }
      ]
    },
    {
      id: "cat-frameworks",
      title: "Frameworks y Librerías",
      skills: [
        { name: "React" },
        { name: "NestJS" },
        { name: "Node.js (Express)" },
        { name: "Tailwind CSS" },
        { name: "Socket.IO" },
        { name: "Prisma ORM" },
        { name: "Expo (React Native)" }
      ]
    }
  ],
  featuredProjects: [
    {
      name: "EnrutApp",
      description: "Optimización inteligente de logística, rastreo en vivo y mapas dinámicos sobre GCP.",
      link: "#projects",
      tech: ["React", "NestJS", "Google Maps"]
    },
    {
      name: "CloudFire Analytics",
      description: "Telemetría integrada en tiempo real capturando millones de eventos.",
      link: "#projects",
      tech: ["TypeScript", "Firestore"]
    }
  ]
};
