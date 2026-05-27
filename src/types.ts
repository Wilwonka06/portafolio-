export interface Technology {
  name: string;
  category: string; // e.g., "Lenguajes", "Frameworks", "Servicios de Nube", "Entornos", "Otros"
}

export interface Project {
  id: string;
  year: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  url: string;
  github: string;
  technologies: Technology[];
  highlights: string[];
}

export interface ContactInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  instagram?: string;
}

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  period: string;
  description?: string;
}

export interface CVSkill {
  name: string;
  level?: string; // e.g., 'Avanzado', 'Intermedio'
}

export interface CVSkillCategory {
  id: string;
  title: string; // e.g., "Servicios de Nube", "Entornos y Despliegue", "Lenguajes", "Frameworks y Librerías"
  skills: CVSkill[];
}

export interface CVData {
  contact: ContactInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skillCategories: CVSkillCategory[];
  featuredProjects: {
    name: string;
    description: string;
    link: string;
    tech: string[];
  }[];
}
