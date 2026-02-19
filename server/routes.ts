import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const MODEL = "gpt-5-mini";

function extractJSON(raw: string): string {
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();
  const jsonMatch = raw.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (jsonMatch) return jsonMatch[1].trim();
  return raw.trim();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/generate-reply", async (req: Request, res: Response) => {
    try {
      const { message, tone } = req.body;
      if (!message || !tone) {
        return res.status(400).json({ error: "Message and tone are required" });
      }

      const toneDescriptions: Record<string, string> = {
        smooth: "confident, charming, and suave - like someone who knows exactly what to say",
        playful: "fun, teasing, flirty, and lighthearted - using wit and humor",
        calm: "cool, collected, and effortlessly chill - not trying too hard",
        savage: "bold, witty, slightly edgy with clever comebacks - confidently provocative but not mean",
      };

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `You are a texting expert. Generate exactly 3 reply options that are ${toneDescriptions[tone] || "smooth and charming"}. Each reply: 1-2 sentences, natural, no excessive emojis. Return ONLY a JSON array of 3 strings. Example: ["reply 1", "reply 2", "reply 3"]`,
          },
          {
            role: "user",
            content: `Generate 3 ${tone} replies to: "${message}"`,
          },
        ],
        max_completion_tokens: 8192,
      });

      const rawContent = response.choices[0]?.message?.content || "[]";
      const content = extractJSON(rawContent);
      let replies: string[];
      try {
        replies = JSON.parse(content);
        if (!Array.isArray(replies)) replies = [String(replies)];
      } catch {
        const matches = rawContent.match(/"([^"]+)"/g);
        replies = matches ? matches.map((m: string) => m.replace(/"/g, "")).slice(0, 3) : ["Could not generate replies"];
      }

      res.json({ replies });
    } catch (error) {
      console.error("Error generating reply:", error);
      res.status(500).json({ error: "Failed to generate replies" });
    }
  });

  app.post("/api/analyze-chat", async (req: Request, res: Response) => {
    try {
      const { chat } = req.body;
      if (!chat) {
        return res.status(400).json({ error: "Chat text is required" });
      }

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `You are a conversation analyst. Analyze the chat and return a JSON object with these exact fields:
- "interestLevel": number 1-10
- "investingMore": string (who is investing more)
- "isDry": boolean
- "analysis": string (2-3 sentence analysis)
- "suggestion": string (actionable next move)
Return ONLY the JSON object.`,
          },
          {
            role: "user",
            content: `Analyze this conversation:\n${chat}`,
          },
        ],
        max_completion_tokens: 8192,
      });

      const rawContent = response.choices[0]?.message?.content || "{}";
      const content = extractJSON(rawContent);
      let analysis;
      try {
        analysis = JSON.parse(content);
      } catch {
        analysis = {
          interestLevel: 5,
          investingMore: "Unclear",
          isDry: false,
          analysis: "Could not fully analyze the conversation.",
          suggestion: "Try being more engaging and ask open-ended questions.",
        };
      }

      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing chat:", error);
      res.status(500).json({ error: "Failed to analyze chat" });
    }
  });

  app.post("/api/generate-opener", async (req: Request, res: Response) => {
    try {
      const { platform } = req.body;
      if (!platform) {
        return res.status(400).json({ error: "Platform is required" });
      }

      const platformContext: Record<string, string> = {
        instagram: "Instagram DMs",
        whatsapp: "WhatsApp messaging",
        dating: "a dating app like Tinder or Hinge",
        inperson: "in-person conversation",
      };

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `You are a conversation starter expert. Generate 3 opening lines for ${platformContext[platform] || "texting"}. Return a JSON object with:
- "safe": string (friendly, low-risk opener)
- "funny": string (witty, humorous opener)
- "bold": string (confident, attention-grabbing opener)
Each 1-2 sentences, natural. Return ONLY the JSON object.`,
          },
          {
            role: "user",
            content: `Generate opening lines for ${platform}`,
          },
        ],
        max_completion_tokens: 8192,
      });

      const rawContent = response.choices[0]?.message?.content || "{}";
      const content = extractJSON(rawContent);
      let openers;
      try {
        openers = JSON.parse(content);
      } catch {
        openers = {
          safe: "Hey! How's your day going?",
          funny: "I'm running out of clever things to say, so... hi!",
          bold: "I had to message you. Something about your vibe is magnetic.",
        };
      }

      res.json(openers);
    } catch (error) {
      console.error("Error generating opener:", error);
      res.status(500).json({ error: "Failed to generate openers" });
    }
  });

  app.post("/api/generate-bio", async (req: Request, res: Response) => {
    try {
      const { hobbies, vibe } = req.body;
      if (!hobbies && !vibe) {
        return res.status(400).json({ error: "Hobbies or vibe are required" });
      }

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `You are a profile bio expert. Generate 3 bio options. Return a JSON object with:
- "attractive": string (sophisticated, intriguing bio)
- "confident": string (self-assured bio showing ambition)
- "funny": string (witty, humorous bio)
Each 2-3 lines max. Return ONLY the JSON object.`,
          },
          {
            role: "user",
            content: `Create bios.\nHobbies: ${hobbies || "not specified"}\nVibe: ${vibe || "not specified"}`,
          },
        ],
        max_completion_tokens: 8192,
      });

      const rawContent = response.choices[0]?.message?.content || "{}";
      const content = extractJSON(rawContent);
      let bios;
      try {
        bios = JSON.parse(content);
      } catch {
        bios = {
          attractive: "Living life one adventure at a time.",
          confident: "Building something bigger than myself.",
          funny: "Professional overthinker, amateur chef.",
        };
      }

      res.json(bios);
    } catch (error) {
      console.error("Error generating bio:", error);
      res.status(500).json({ error: "Failed to generate bios" });
    }
  });

  app.post("/api/adjust-reply", async (req: Request, res: Response) => {
    try {
      const { reply, direction } = req.body;
      if (!reply || !direction) {
        return res.status(400).json({ error: "Reply and direction are required" });
      }

      const directionPrompt = direction === "bolder"
        ? "Make this reply more bold, confident, and daring while keeping it natural"
        : "Make this reply safer, friendlier, and more approachable while keeping it natural";

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `${directionPrompt}. Return ONLY the adjusted reply text, nothing else. Keep it concise (1-2 sentences).`,
          },
          {
            role: "user",
            content: reply,
          },
        ],
        max_completion_tokens: 8192,
      });

      const adjusted = response.choices[0]?.message?.content || reply;
      res.json({ reply: adjusted.trim() });
    } catch (error) {
      console.error("Error adjusting reply:", error);
      res.status(500).json({ error: "Failed to adjust reply" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
