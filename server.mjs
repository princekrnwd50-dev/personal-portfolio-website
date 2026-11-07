import express from "express";
import "dotenv/config";
import OpenAI from "openai";

const app = express();
const DEFAULT_PORT = 3000;

function startServer(port = DEFAULT_PORT) {
    const server = app.listen(port, "0.0.0.0", () => {
        console.log("");
        console.log("======================================");
        console.log("🚀 PRINCE PORTFOLIO SERVER");
        console.log("======================================");
        console.log(`🌐 http://localhost:${port}`);
        console.log(`🌐 http://127.0.0.1:${port}`);
        console.log("======================================");
        console.log("");
    });

    server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
            console.warn(`Port ${port} is busy. Retrying on ${port + 1}...`);
            startServer(port + 1);
            return;
        }

        console.error("❌ SERVER ERROR:");
        console.error(error);
    });
}

const portfolioKnowledge = {
    personal: {
        name: "Prince Kumar",
        role: "MCA student and aspiring software developer",
        about: "Prince Kumar enjoys solving programming problems, learning modern web technologies, and turning ideas into useful applications."
    },
    skills: {
        programming: ["Java", "Python", "JavaScript"],
        frontend: ["HTML", "CSS", "JavaScript", "React"],
        backend: ["Node.js", "Flask"],
        databases: ["MySQL"],
        tools: ["Git", "GitHub", "VS Code"],
        dsa: ["Arrays", "Strings", "Hashing", "Stacks", "Queues", "Linked Lists", "Sorting", "Searching", "Recursion"]
    },
    projects: [
        { name: "Stock Market Trend Analysis Dashboard", technologies: ["Python", "MySQL", "Power BI"], description: "Analyzed historical stock data, performed data cleaning and exploratory analysis, and created an interactive dashboard for understanding market trends.", features: ["Data cleaning", "Exploratory data analysis", "Interactive dashboard"] },
        { name: "Smart Banking Management System", technologies: ["Python", "Pickle"], description: "A console-based banking system with authentication, deposits, withdrawals, transaction history, and persistent data storage.", features: ["Authentication", "Deposits and withdrawals", "Transaction history", "Persistent data storage"] },
        { name: "Community Issue Reporting Portal", technologies: ["HTML", "CSS", "JavaScript"], description: "A responsive portal for submitting community complaints, setting priority, filtering issues, and managing resolved status.", features: ["Complaint submission", "Priority setting", "Issue filtering", "Resolved status management"] },
        { name: "Room & PG Finder", technologies: ["React", "Node.js", "MySQL"], description: "A full-stack idea for helping students discover nearby rooms, flats, and PGs with search, filters, and location-based listings.", features: ["Search", "Filters", "Location-based listings"], status: "In progress" }
    ],
    education: ["Currently pursuing a Master of Computer Applications at CGC University, Mohali.", "Completed a B.Sc. in Physics at R.P. College, Bihar."],
    learningJourney: ["Java", "DSA", "JavaScript", "React", "Backend", "SQL/Database", "AI Integration", "Full Stack Development"],
    career: "Prince is working toward a software developer or full-stack developer role and is open to internships, entry-level opportunities, collaborations, and project ideas.",
    contact: { email: "princekrnwd50@gmail.com", github: "https://github.com/princekrnwd50-dev/", linkedin: "https://www.linkedin.com/in/prince-kumar-688666323/", resume: "resume/prince_resume.pdf" }
};

const resumeContext = JSON.stringify(portfolioKnowledge, null, 2);

const apiKey = process.env.OPENAI_API_KEY;
const hasRealOpenAIKey = Boolean(apiKey) && apiKey !== "YOUR_OPENAI_API_KEY";
const openai = hasRealOpenAIKey ? new OpenAI({ apiKey }) : null;

function buildLocalReply(message, projectName = "") {
    const text = (message || "").trim();
    const lower = text.toLowerCase();

    if (!text) {
        return "Please ask me something about Prince's resume, skills, projects, or learning journey.";
    }

    const project = portfolioKnowledge.projects.find((item) => {
        const name = item.name.toLowerCase();
        return projectName.toLowerCase() === name || lower.includes(name);
    });
    if (project) {
        return `${project.name}: ${project.description}\nTechnologies: ${project.technologies.join(", ")}\nFeatures: ${project.features.join(", ")}. The portfolio does not currently document a separate role, challenge log, or improvement plan for this project.`;
    }
    if (lower.includes("who is prince") || lower.includes("tell me about prince") || lower.includes("about prince") || lower.includes("resume") || lower.includes("summar") || lower.includes("background")) {
        return `Prince Kumar is an ${portfolioKnowledge.personal.role} focused on Java, Python, web technologies, DSA, and practical projects. Resume: ${portfolioKnowledge.contact.resume}`;
    }

    if (lower.includes("skill") || lower.includes("technology") || lower.includes("stack")) {
        return `Programming: ${portfolioKnowledge.skills.programming.join(", ")}. Frontend: ${portfolioKnowledge.skills.frontend.join(", ")}. Backend: ${portfolioKnowledge.skills.backend.join(", ")}. Databases: ${portfolioKnowledge.skills.databases.join(", ")}. Tools: ${portfolioKnowledge.skills.tools.join(", ")}.`;
    }

    if (lower.includes("project") || lower.includes("built") || lower.includes("work") || lower.includes("portfolio")) {
        return portfolioKnowledge.projects.map((item) => `${item.name}: ${item.description}`).join("\n");
    }

    if (lower.includes("education") || lower.includes("study") || lower.includes("college") || lower.includes("mca")) {
        return portfolioKnowledge.education.join(" ");
    }

    if (lower.includes("learn") || lower.includes("current") || lower.includes("focus") || lower.includes("journey")) {
        return `Learning path: ${portfolioKnowledge.learningJourney.join(" → ")}. The portfolio does not mark every stage as completed.`;
    }

    if (lower.includes("contact") || lower.includes("email") || lower.includes("linkedin") || lower.includes("github")) {
        return `Email: ${portfolioKnowledge.contact.email}\nGitHub: ${portfolioKnowledge.contact.github}\nLinkedIn: ${portfolioKnowledge.contact.linkedin}`;
    }

    if (lower.includes("career") || lower.includes("goal") || lower.includes("future") || lower.includes("aspire") || lower.includes("role") || lower.includes("hire") || lower.includes("recruit")) {
        return portfolioKnowledge.career;
    }

    if (lower.includes("strength") || lower.includes("personality") || lower.includes("trait")) {
        return "The portfolio presents Prince as focused on continuous learning, programming practice, and turning ideas into practical projects.";
    }

    return "I don't have that information in Prince's portfolio right now.";
}

async function askOpenAI(message, projectName = "", recruiterMode = false) {
    if (!openai) {
        return null;
    }

    const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [
            {
                role: "system",
                content: `You are Prince AI, a professional portfolio assistant. Answer using only the verified structured portfolio data below. If the data does not answer the question, say exactly: "I don't have that information in Prince's portfolio right now." Never invent qualifications, roles, companies, certificates, statistics, grades, achievements, project roles, challenges, or technologies. ${recruiterMode ? "Use a concise, recruiter-friendly style." : "Use a helpful, concise style."} ${projectName ? `The visitor is asking about the project named "${projectName}". Keep the answer scoped to that project.` : ""}\n\n${resumeContext}`
            },
            {
                role: "user",
                content: message
            }
        ],
        temperature: 0.5
    });

    const text = response.output_text || response.output?.[0]?.content?.[0]?.text || "";
    return typeof text === "string" ? text.trim() : "";
}

/* Allow JSON requests */
app.use(express.json());

/* Serve your portfolio files */
app.use(express.static(process.cwd()));

/* Test route */
app.get("/api/test", (req, res) => {
    res.json({
        message: "Portfolio server is working!"
    });
});

/* AI route */
app.post("/api/chat", async (req, res) => {
    const message = String(req.body.message || "").trim();
    const projectName = String(req.body.project || "").trim();
    const recruiterMode = Boolean(req.body.recruiterMode);

    if (!message) {
        return res.status(400).json({
            reply: "Please ask a question about Prince's resume, skills, projects, or learning journey."
        });
    }

    try {
        const openAiReply = await askOpenAI(message, projectName, recruiterMode);

        if (openAiReply) {
            return res.json({ reply: openAiReply });
        }

        return res.json({ reply: buildLocalReply(message, projectName) });
    } catch (error) {
        console.error("AI chat failed:", error);
        return res.json({ reply: buildLocalReply(message, projectName) });
    }
});

/* Start server */
startServer();