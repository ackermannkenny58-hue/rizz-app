import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: `You are a texting expert who helps people craft perfect replies. Generate exactly 3 reply options that are ${toneDescriptions[tone] || "smooth and charming"}. Each reply should be concise (1-2 sentences max), natural-sounding, and something a real person would text. Do NOT use emojis excessively - max 1 per reply if any. Return ONLY a JSON array of 3 strings, nothing else. Example: ["reply 1", "reply 2", "reply 3"]`,
          },
          {
            role: "user",
            content: `Generate 3 ${tone} replies to this message: "${message}"`,
          },
        ],
        max_completion_tokens: 512,
      });

      const content = response.choices[0]?.message?.content || "[]";
      let replies: string[];
      try {
        replies = JSON.parse(content);
      } catch {
        const matches = content.match(/"([^"]+)"/g);
        replies = matches ? matches.map((m: string) => m.replace(/"/g, "")) : ["Could not generate replies"];
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
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: `You are a conversation analyst specializing in texting dynamics. Analyze the provided chat and return a JSON object with these exact fields:
- "interestLevel": number 1-10
- "investingMore": string (who is investing more in the conversation)
- "isDry": boolean (is the conversation dry/boring)
- "analysis": string (2-3 sentence analysis of the conversation dynamics)
- "suggestion": string (a specific, actionable next move suggestion)
Return ONLY the JSON object, nothing else.`,
          },
          {
            role: "user",
            content: `Analyze this conversation:\n${chat}`,
          },
        ],
        max_completion_tokens: 512,
      });

      const content = response.choices[0]?.message?.content || "{}";
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
        instagram: "Instagram DMs - could be commenting on a story, replying to a post, or a cold DM",
        whatsapp: "WhatsApp - more personal and direct messaging",
        dating: "a dating app like Tinder, Hinge, or Bumble - first message to match",
        inperson: "in-person conversation - approaching someone in real life",
      };

      const response = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: `You are a conversation starter expert. Generate 3 opening lines for ${platformContext[platform] || "texting"}. Return a JSON object with these exact fields:
- "safe": string (a friendly, low-risk opener that anyone can use)
- "funny": string (a witty, humorous opener that shows personality)
- "bold": string (a confident, attention-grabbing opener)
Each should be 1-2 sentences max, natural, and appropriate for the platform. Do NOT use excessive emojis. Return ONLY the JSON object.`,
          },
          {
            role: "user",
            content: `Generate opening lines for ${platform}`,
          },
        ],
        max_completion_tokens: 512,
      });

      const content = response.choices[0]?.message?.content || "{}";
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
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: `You are a profile bio expert who creates compelling dating/social media bios. Generate 3 bio options based on the user's input. Return a JSON object with these exact fields:
- "attractive": string (sophisticated and intriguing bio that creates mystery)
- "confident": string (self-assured bio that shows ambition and drive)
- "funny": string (witty, humorous bio that shows personality)
Each bio should be 2-3 lines max, concise, and feel authentic. Avoid cliches. Do NOT use excessive emojis. Return ONLY the JSON object.`,
          },
          {
            role: "user",
            content: `Create bios with these details:\nHobbies: ${hobbies || "not specified"}\nPersonality vibe: ${vibe || "not specified"}`,
          },
        ],
        max_completion_tokens: 512,
      });

      const content = response.choices[0]?.message?.content || "{}";
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
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: `You adjust text messages. ${directionPrompt}. Return ONLY the adjusted reply text, nothing else. Keep it concise (1-2 sentences).`,
          },
          {
            role: "user",
            content: reply,
          },
        ],
        max_completion_tokens: 256,
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
