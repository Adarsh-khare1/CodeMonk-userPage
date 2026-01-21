import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getAIFeedback = async (code, testResults, problemDescription) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return 'AI feedback unavailable. Please configure OpenAI API key.';
    }

    const status = testResults.status;
    const prompt = status === 'Accepted'
      ? `The user's code was accepted. Provide optimization suggestions and explain alternative approaches if any.

Code:
\`\`\`javascript
${code}
\`\`\`

Problem:
${problemDescription}

Provide brief, helpful feedback focusing on:
1. Time/space complexity analysis
2. Possible optimizations
3. Alternative approaches

Keep it concise (2-3 sentences).`
      : `The user's code failed with status: ${status}. Explain why it failed and suggest fixes.

Code:
\`\`\`javascript
${code}
\`\`\`

Problem:
${problemDescription}

Test Results:
${JSON.stringify(testResults.results, null, 2)}

Provide:
1. Why it failed (brief explanation)
2. What might be wrong
3. Suggested fix or approach

Keep it concise and helpful (3-4 sentences).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful coding tutor. Provide clear, concise feedback on code submissions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'AI feedback is currently unavailable. Please try again later.';
  }
};
