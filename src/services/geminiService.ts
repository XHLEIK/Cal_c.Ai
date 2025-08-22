// Gemini API service for handling math and calculation queries

const GEMINI_API_KEY = 'AIzaSyBry2DYL__274twJWB1WkwCxYGKXmgw3aI'; // Hardcoded for now

// Updated model URLs - including latest 2.5 and fallback models
const GEMINI_MODELS = [
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent',    // Gemini 2.5 Pro
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent',   // Gemini 2.5 Flash
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-live:generateContent', // Gemini 2.0 Flash Live
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent',      // Gemini 2.0 Flash
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',      // Gemini 1.5 Flash
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent', // Gemini 1.5 Flash Latest
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'   // Gemini 1.5 Flash v1beta
];

let GEMINI_API_URL = GEMINI_MODELS[0];
let currentModelIndex = 0;

const MATH_SYSTEM_PROMPT = `
You are Cal.ai's expert math assistant. Solve mathematical problems step by step with clear explanations.
`;

// Format response for readability
function formatMathResponse(text: string): string {
  text = text.replace(/^(Step \d+:|Solution:|Answer:|Result:|Approach:|Method:)(.*)/gm, '**$1**$2');
  text = text.replace(/\b(equation|formula|theorem|proof|identity|expression|function|variable)\b/gi, '*$1*');
  text = text.replace(/^(Final Answer:|Therefore,|Thus,|In conclusion,)(.*)/gm, '\n**$1**$2\n');
  text = text.replace(/(\n[^*\n]+=[^*\n]+\n)/g, '\n$1\n');
  return text;
}

export async function generateMathResponse(userQuery: string): Promise<string> {
  try {
    console.log('Query:', userQuery);
    console.log('Using API URL:', GEMINI_API_URL);

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: MATH_SYSTEM_PROMPT + "\n\nQuestion: " + userQuery }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);

      // Try fallback model if available
      if (currentModelIndex < GEMINI_MODELS.length - 1) {
        currentModelIndex++;
        GEMINI_API_URL = GEMINI_MODELS[currentModelIndex];
        return generateMathResponse(userQuery);
      }

      // Reset model index
      currentModelIndex = 0;
      GEMINI_API_URL = GEMINI_MODELS[0];

      return `Sorry, the AI model is currently unavailable or your API key is invalid.`;
    }

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) {
      currentModelIndex = 0;
      GEMINI_API_URL = GEMINI_MODELS[0];

      let text = data.candidates[0].content.parts[0].text;
      text = formatMathResponse(text);
      return text;
    } else {
      return "I'm sorry, no answer could be generated. Try rephrasing your question.";
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "Network or unexpected error. Please check your connection and try again.";
  }
}
