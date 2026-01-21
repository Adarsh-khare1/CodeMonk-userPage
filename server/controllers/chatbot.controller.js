import fetch from 'node-fetch'; // You'll need to install this: npm install node-fetch

export const chatWithAI = async (req, res) => {
  const { message, problemId, problemTitle, userCode, language, conversationHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Message is required", tokensUsed: 0 });
  }

  try {
    console.log('🤖 Calling your chatbot API:', { message: message.substring(0, 100) });

    // Replace this with your chatbot API call
    const response = await fetch('YOUR_CHATBOT_API_URL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_API_KEY` // If needed
      },
      body: JSON.stringify({
        message: message,
        context: {
          problemTitle,
          userCode,
          language,
          conversationHistory
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Chatbot API error: ${response.status}`);
    }

    const data = await response.json();

    // Adapt this based on your chatbot's response format
    const reply = data.response || data.message || data.reply || "Sorry, I couldn't get a response.";

    console.log('✅ Chatbot response received:', { replyLength: reply.length });

    res.json({
      reply,
      tokensUsed: data.tokensUsed || 0
    });

  } catch (error) {
    console.error('❌ Chatbot API error:', error);

    // Fallback response
    res.json({
      reply: "I'm having trouble connecting right now. Please try again later.",
      tokensUsed: 0
    });
  }
};