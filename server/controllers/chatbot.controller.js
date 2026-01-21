import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "Message is required",
        tokensUsed: 0,
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful coding assistant." },
        { role: "user", content: message },
      ],
      max_tokens: 500,
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "⚠️ No response from AI.";

    const tokensUsed = completion.usage?.total_tokens || 0;

    res.json({ reply, tokensUsed });
  } catch (error) {
    console.error("❌ OpenAI Error:", error);
    res.status(500).json({
      reply: "⚠️ Server error",
      tokensUsed: 0,
    });
  }
};
