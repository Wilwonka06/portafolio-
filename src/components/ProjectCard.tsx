import React from "react";
import { motion } from "motion/react";
import { FolderKanban, Calendar, ArrowUpRight } from "lucide-react";
import { Project } from "../types";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <motion.div
      id={`project-card-${project.id}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group relative bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2.5xl shadow-xs hover:shadow-lg dark:hover:shadow-black/30 overflow-hidden cursor-pointer flex flex-col h-full transition-all duration-300"
    >
      {/* Project Thumbnail Image Wrapper with Hover zoom */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800/80">
        <img
          id={`img-preview-${project.id}`}
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out brightness-[0.93] dark:brightness-[0.8]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Year Badge overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[10px] font-bold uppercase tracking-wider">
          <Calendar className="h-3 w-3 text-sky-400" />
          <span>{project.year}</span>
        </div>

        {/* Hover action indicator */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="p-3 bg-white/90 dark:bg-zinc-900/90 rounded-full text-gray-900 dark:text-white shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform font-medium text-xs flex items-center gap-1.5 border border-white/25">
            <span>Ver detalles</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Card Details Block */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs text-sky-700 dark:text-sky-400 font-semibold mb-1.5 uppercase tracking-widest">
            <FolderKanban className="h-3.5 w-3.5" />
            <span>Proyecto del Sistema</span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
            {project.name}
          </h3>

          <p className="text-sm text-gray-600 dark:text-zinc-400 font-normal line-clamp-2 mt-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Tech Badges Row (Shows top 4 key tech badges inside the card space) */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100 dark:border-zinc-850">
          {project.technologies.slice(0, 4).map((tech, i) => (
            <span
              key={i}
              className="text-[10px] font-semibold tracking-wide bg-gray-50 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-1 rounded-md"
            >
              {tech.name}
            </span>
          ))}

          {project.technologies.length > 4 && (
            <span className="text-[10px] bg-sky-50 text-sky-700 dark:bg-zinc-800/80 dark:text-sky-300 font-bold px-1.5 py-1 rounded-md">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
