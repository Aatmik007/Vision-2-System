import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generates a structured implementation plan from project details.
 * Uses Google Gemini API if GEMINI_API_KEY is available in process.env,
 * otherwise falls back to an intelligent template-based generator.
 */
export const generateImplementationPlan = async (project) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
You are an expert Senior Full Stack Web Developer.
Analyze the following web project design idea and generate a practical, concise implementation plan in strictly valid JSON format.

Project Title: "${project.title}"
Description: "${project.description}"
Design Reference: "${project.designReference || 'N/A'}"
Technologies Selected: "${(project.technologies || []).join(', ')}"
Target Platform: "${project.targetPlatform || 'Web Application'}"

Respond ONLY with a valid JSON object matching this exact schema, with no Markdown ticks or commentary:
{
  "pages": ["Page 1", "Page 2"],
  "components": ["Component A", "Component B"],
  "frontendRequirements": ["Req 1", "Req 2"],
  "backendRequirements": ["Req 1", "Req 2"],
  "databaseRequirements": ["Entity 1", "Entity 2"],
  "developmentSteps": ["Step 1", "Step 2", "Step 3"]
}
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Clean JSON string if wrapped in markdown code fence
      const cleanedJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedPlan = JSON.parse(cleanedJson);

      return {
        pages: parsedPlan.pages || [],
        components: parsedPlan.components || [],
        frontendRequirements: parsedPlan.frontendRequirements || [],
        backendRequirements: parsedPlan.backendRequirements || [],
        databaseRequirements: parsedPlan.databaseRequirements || [],
        developmentSteps: parsedPlan.developmentSteps || [],
        generatedAt: new Date()
      };
    } catch (error) {
      console.warn('Gemini AI call failed or timed out. Using deterministic plan generator fallback.', error.message);
    }
  }

  // Smart deterministic fallback generator
  const techList = project.technologies && project.technologies.length > 0 ? project.technologies : ['React', 'Node.js', 'Express', 'MongoDB'];
  const title = project.title || 'Web Application';

  return {
    pages: [
      'Landing Page (Hero section, Feature highlights, Call to Action)',
      'Authentication Page (Login & Registration forms)',
      'Dashboard Page (Overview, Stats, Project list)',
      `${title} Main View (Detailed interface for primary feature)`,
      'User Profile & Settings Page'
    ],
    components: [
      'Navbar (Navigation, Branding, Auth status)',
      'Sidebar (Navigation links & filter tags)',
      'ProjectCard (Metadata display & action buttons)',
      'Header / PageBanner (Dynamic titles & breadcrumbs)',
      'Modal / FormInput (Reusable input & popup controls)',
      'PlanDisplay (Structured accordion & tab view)'
    ],
    frontendRequirements: [
      `Setup SPA using ${techList.includes('React') ? 'React' : 'Modern Frontend Framework'} & Tailwind CSS`,
      'State Management via Context API for User Sessions',
      'Axios API Service module with Auth token interceptor',
      'Responsive design for Mobile, Tablet, and Desktop displays'
    ],
    backendRequirements: [
      'REST API Express Server with Modular Routing (Controllers, Routes, Middleware)',
      'JWT Authentication & Password Hashing (bcrypt)',
      'OAuth Integration for Google Sign-In',
      'Centralized Error Middleware and Response Formatters'
    ],
    databaseRequirements: [
      'User Document Collection (name, email, password, googleId, createdAt)',
      'Project Document Collection (user ref, title, description, technologies, implementationPlan)'
    ],
    developmentSteps: [
      'Step 1: Environment Setup & Project Directory Structure',
      'Step 2: Database Connection & Schema Definition (User & Project models)',
      'Step 3: Authentication Endpoints (Register, Login, Google OAuth, JWT protection)',
      'Step 4: Project CRUD API endpoints (Create, Read, Update, Delete)',
      'Step 5: Frontend UI Layout & React Router setup',
      'Step 6: Axios Service integration with Auth Context',
      'Step 7: AI Plan Generation endpoint integration & display components',
      'Step 8: End-to-End Testing, Responsive styling fix, and Documentation'
    ],
    generatedAt: new Date()
  };
};
