import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini on server side safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI:", e);
}

// API endpoint for search
app.post("/api/search", async (req, res) => {
  const { query, appData, isSuperAdmin } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const defaultTab = isSuperAdmin ? "Executive Dashboard" : "Overview";

  if (!ai) {
    return res.json({
      conversationalAnswer: `Search indexed locally for "${query}". Use the sidebar tabs or quick filters to inspect matching records directly.`,
      suggestedAction: {
        tabName: defaultTab,
        buttonText: isSuperAdmin ? "Go to Executive Dashboard" : "Go to Overview"
      },
      hits: []
    });
  }

  const validTabs = isSuperAdmin
    ? [
        "Executive Dashboard",
        "Employees Directory",
        "Departments & Teams",
        "Org Hierarchy Matrix",
        "Attendance Shifts",
        "Leave Allocations",
        "Payroll & Claims Ledger",
        "Helpdesk & Assets",
        "Broadcast Command",
        "Onboarding & Audits",
        "SSO & Security Policies",
        "Workflow Architect",
        "BI Tools & Settings",
        "Profile"
      ]
    : [
        "Overview",
        "Tasks",
        "Attendance",
        "Leaves",
        "Team Approvals",
        "Payslip",
        "Bank Details",
        "Reimbursements",
        "Helpdesk",
        "Joining Formality",
        "Directory",
        "Announcements",
        "Profile"
      ];

  const userDisplayName = appData?.profile
    ? `${appData.profile.firstName || ""} ${appData.profile.lastName || ""}`.trim()
    : isSuperAdmin
    ? "Super Admin"
    : "Employee";

  try {
    const systemPrompt = `You are the ParkEngage corporate workspace search assistant.
Analyze the user's search query along with the provided workspace state of the logged-in user (${userDisplayName}, ${isSuperAdmin ? "Super Administrator" : "Standard Employee"}).

You must return JSON matching this structure:
1. "conversationalAnswer": Direct, helpful answer citing specific facts from the provided profile, directory, tasks, attendance, leaves, payslips, claims, support tickets, or announcements. Keep it clear and concise, highlighting key terms with markdown bold.
2. "suggestedAction": Specify the single most relevant tab in the portal and a concise action button label. Valid tabName values ONLY:
${validTabs.map(t => `- "${t}"`).join("\n")}
3. "hits": Up to 4 specific matching records from the dataset. Each hit has 'category', 'title', 'subtitle', and 'tabName' (must match one of the exact valid tab names above).

Application State Data:
${JSON.stringify(appData || {})}
`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Search Query: "${query}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conversationalAnswer: {
              type: Type.STRING,
              description: "Direct answering response formatted with clear sentences and markdown highlights."
            },
            suggestedAction: {
              type: Type.OBJECT,
              properties: {
                tabName: {
                  type: Type.STRING,
                  description: `Exact tab name from: ${validTabs.join(", ")}`
                },
                buttonText: {
                  type: Type.STRING,
                  description: "Short label for the navigation button"
                }
              },
              required: ["tabName", "buttonText"]
            },
            hits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "e.g., Payslip, Directory, Task, Announcement, Leave, Claim, Helpdesk" },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  tabName: { type: Type.STRING }
                },
                required: ["category", "title", "subtitle", "tabName"]
              }
            }
          },
          required: ["conversationalAnswer", "suggestedAction", "hits"]
        }
      }
    });

    const parsedResult = JSON.parse(response.text || "{}");
    return res.json(parsedResult);
  } catch (error: any) {
    console.error("Gemini Search API error:", error);
    return res.json({
      conversationalAnswer: "Live workspace search is temporarily unavailable. Please use the navigation menu to view your records directly.",
      suggestedAction: {
        tabName: defaultTab,
        buttonText: isSuperAdmin ? "Open Executive Dashboard" : "Open Overview"
      },
      hits: []
    });
  }
});

// API endpoint for colleague chat
app.post("/api/chat", async (req, res) => {
  const { messages, personName, personRole, isBotActive, senderName, senderRole } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const lastUserMessage = messages[messages.length - 1]?.text || "Hello";
  const activeSenderName = senderName || "Colleague";
  const activeSenderRole = senderRole || "ParkEngage Team Member";
  const senderFirstName = activeSenderName.split(" ")[0] || "there";
  const personFirstName = personName ? personName.split(" ")[0] : "Colleague";

  if (!ai) {
    const botText = isBotActive
      ? `Automated Assistant for ${personName}: I've logged your message ("${lastUserMessage}") and flagged it for ${personFirstName}'s attention.`
      : `${personName}: Hey ${senderFirstName}, got your message ("${lastUserMessage}"). Let's sync up shortly to review the details.`;

    return res.json({ text: botText });
  }

  try {
    const systemPrompt = isBotActive
      ? `You are a corporate virtual assistant responding on behalf of "${personName}" (${personRole || "Colleague"}) at ParkEngage Solutions.
The sender (${activeSenderName}, ${activeSenderRole}) is messaging this person's assistant. Identify yourself clearly as ${personName}'s automated assistant, answer corporate/department questions helpfully in 1-2 short paragraphs, and offer to log follow-up items.`
      : `You are "${personName}" (${personRole || "Colleague"}), a colleague at ParkEngage Solutions replying directly in instant messaging to ${activeSenderName} (${activeSenderRole}).
Write in natural first-person ("I", "we") in 1-3 concise sentences without sounding like a bot.`;

    const convoContents = messages.map((m: any) => ({
      role: m.sender === "me" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: convoContents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini Chat API error:", error);
    return res.json({
      text: isBotActive
        ? `Automated Assistant for ${personName}: Logged your message ("${lastUserMessage}") while ${personFirstName} is unavailable.`
        : `${personName}: Hey ${senderFirstName}, saw your note ("${lastUserMessage}"). I'll follow up with you shortly.`
    });
  }
});

// Server configuration & Dev/Prod static assets
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
