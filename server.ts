import express from "express";
import path from "path";
import multer from "multer";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import fs from "fs";

// Initialize Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const upload = multer({ dest: 'uploads/' });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API route for parsing CV from PDF
  app.post("/api/parse-cv", upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No PDF file provided" });
      }

      // Convert uploaded file to base64 for Gemini
      const fileData = fs.readFileSync(req.file.path);
      const base64Data = fileData.toString('base64');
      const mimeType = "application/pdf";
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                }
              },
              {
                text: "Extrae la información de esta hoja de vida (CV) y devuélvela en el siguiente formato JSON. Asegúrate de extraer TODA la experiencia laboral, educación, proyectos, habilidades y la información de contacto. Usa español."
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              contact: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  title: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  location: { type: Type.STRING },
                  website: { type: Type.STRING },
                  github: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                  instagram: { type: Type.STRING },
                },
                required: ["name", "title", "email", "phone", "location", "website", "github", "linkedin"]
              },
              summary: { type: Type.STRING, description: "Un perfil profesional corto." },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    role: { type: Type.STRING },
                    company: { type: Type.STRING },
                    period: { type: Type.STRING },
                    description: { type: Type.STRING },
                    bullets: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["id", "role", "company", "period", "description", "bullets"]
                }
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    school: { type: Type.STRING },
                    period: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["id", "degree", "school", "period"]
                }
              },
              skillCategories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    skills: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          level: { type: Type.STRING }
                        },
                        required: ["name"]
                      }
                    }
                  },
                  required: ["id", "title", "skills"]
                }
              },
              featuredProjects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    link: { type: Type.STRING },
                    tech: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["name", "description", "link", "tech"]
                }
              }
            },
            required: ["contact", "summary", "experience", "education", "skillCategories", "featuredProjects"]
          }
        }
      });

      // Cleanup uploaded file
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Failed to delete temp file", err);
      }

      if (response.text) {
        const parsedCV = JSON.parse(response.text);
        res.json(parsedCV);
      } else {
        res.status(500).json({ error: "Failed to parse CV from Gemini" });
      }
    } catch (error: any) {
      console.error("Error parsing CV:", error);
      res.status(500).json({ error: "Error parsing CV: " + error.message });
      
      // Cleanup on error if possible
      if (req.file) {
         try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
