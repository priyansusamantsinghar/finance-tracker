// controllers/chatController.js
// Handles AI chatbot requests using Groq API
import Groq from "groq-sdk";

// Lazy-initialized so the server doesn't crash without a key
let groq = null;
function getGroqClient() {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

// System prompt that defines the chatbot's personality and scope
const SYSTEM_PROMPT = `You are FinBot, a smart and friendly personal finance assistant built into the FinTrack app. Your role is to help users understand their spending, budgeting, and saving habits.

Rules:
- Keep responses concise (2-4 sentences max unless the user asks for detail).
- Use a warm, encouraging tone — like a helpful financial coach.
- When the user provides financial context (income, expenses, budgets), reference specific numbers.
- Give actionable tips when possible.
- If asked about non-finance topics, politely redirect: "I'm best at helping with your finances! Ask me about spending, budgets, or saving tips."
- Use emojis sparingly for friendliness (1-2 per message max).
- Format currency amounts with $ and commas.
- Never give specific investment advice or stock recommendations.`;

export async function chat(req, res) {
  try {
    const { message, history = [], financialContext = null } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "Groq API key not configured" });
    }

    // Build messages array for the Groq API
    const messages = [{ role: "system", content: SYSTEM_PROMPT }];

    // If we have financial context, inject it as a system-level context message
    if (financialContext) {
      const contextMsg = `Here is the user's current financial data for context:
- Total Income this month: $${financialContext.totalIncome?.toLocaleString() || "0"}
- Total Expenses this month: $${financialContext.totalExpenses?.toLocaleString() || "0"}
- Net Balance this month: $${financialContext.netBalance?.toLocaleString() || "0"}
- Number of transactions this month: ${financialContext.transactionCount || 0}
${financialContext.topCategories ? `- Top spending categories: ${financialContext.topCategories}` : ""}
${financialContext.budgetInfo ? `- Budget info: ${financialContext.budgetInfo}` : ""}

Use this data to give personalized responses when relevant.`;
      messages.push({ role: "system", content: contextMsg });
    }

    // Add conversation history (last 10 messages to keep context manageable)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    }

    // Add the current user message
    messages.push({ role: "user", content: message });

    // Call Groq API
    const completion = await getGroqClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 512,
      top_p: 0.9,
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err.message);

    if (err.status === 401) {
      return res.status(401).json({ error: "Invalid Groq API key" });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: "Rate limit reached. Please wait a moment and try again." });
    }

    res.status(500).json({ error: "Failed to get AI response" });
  }
}
