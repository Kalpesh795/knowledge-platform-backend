/**
 * AI Service - OpenAI integration for improve, summary, and tag suggestions.
 * Requires OPENAI_API_KEY in .env. Falls back to mock if key is missing or API fails.
 */

const OpenAI = require("openai");

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

async function callOpenAI(systemPrompt, userContent) {
  if (!openai || !userContent || !String(userContent).trim()) return null;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: String(userContent).slice(0, 8000) },
      ],
      max_tokens: 1500,
    });
    const text = completion.choices?.[0]?.message?.content;
    return text ? text.trim() : null;
  } catch (e) {
    console.error("OpenAI error:", e.message);
    return null;
  }
}

function mockImprove(option, content) {
  const text = (content || "").slice(0, 300);
  const mocks = {
    rewrite: `[Improved clarity] ${text}...`,
    grammar: `[Grammar improved] ${text}...`,
    concise: `[More concise] ${text.slice(0, 100)}...`,
    title: "Suggested Title (set OPENAI_API_KEY for real AI)",
  };
  return mocks[option] || mocks.rewrite;
}

function mockSummary(content) {
  const snippet = (content || "").replace(/<[^>]*>/g, "").slice(0, 150);
  return snippet ? `${snippet}...` : "No summary available.";
}

function mockTags(content) {
  const snippet = (content || "").replace(/<[^>]*>/g, "").slice(0, 100);
  return `tag1, tag2, tag3 (Mock. Content: ${snippet}...)`;
}

exports.improveContent = async (option, content, title) => {
  const options = {
    rewrite: "Rewrite the following text more clearly. Keep the same meaning. Output only the rewritten text, no quotes or labels.",
    grammar: "Fix grammar and spelling. Output only the corrected text.",
    concise: "Make the following text more concise. Output only the shortened text.",
    title: "Suggest one short, catchy title for an article with the following content. Output only the title, no quotes.",
  };
  const prompt = options[option] || options.rewrite;
  const userContent = option === "title" ? (title || content || "") : (content || "");

  const result = await callOpenAI(prompt, userContent);
  if (result) return result;
  return mockImprove(option, content);
};

exports.generateSummary = async (content) => {
  if (!content || !String(content).trim()) return mockSummary(content);
  const plain = String(content).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const system = "Generate a short 1-2 sentence summary of the following article. Output only the summary, no labels or quotes.";
  const result = await callOpenAI(system, plain.slice(0, 6000));
  if (result) return result;
  return mockSummary(content);
};

exports.suggestTags = async (content) => {
  if (!content || !String(content).trim()) return mockTags(content);
  const plain = String(content).replace(/<[^>]*>/g, " ").slice(0, 3000);
  const system = "Based on the following article content, suggest 3-6 relevant tags (e.g. technologies, topics). Output only comma-separated tags, no numbering or bullets.";
  const result = await callOpenAI(system, plain);
  if (result) return result.trim();
  return mockTags(content);
};
