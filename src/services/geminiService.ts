// Gemini API service for handling math and calculation queries

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCaTWlU0AYQMfDx5WmUSW_MxNGPXWGTneE';
// Available model URLs - using the latest free models
const GEMINI_MODELS = [
  // Primary model - Gemini 2.0 Flash Live (newest and best free model)
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-live:generateContent',
  // First fallback - Gemini 2.0 Flash
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent',
  // Second fallback - Gemini 1.5 Flash
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
  // Third fallback - Gemini 1.5 Flash Latest
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent',
  // Fourth fallback - v1beta API version of Gemini 1.5 Flash
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
];

// Start with the primary model
let GEMINI_API_URL = GEMINI_MODELS[0];
// Track which model we're currently using (0-based index)
let currentModelIndex = 0;

// System prompt to guide Gemini to solve math problems
const MATH_SYSTEM_PROMPT = `
You are Cal.ai's expert math assistant. Your primary purpose is to solve mathematical problems and provide clear, step-by-step explanations.

Follow these guidelines:
1. Break down complex problems into simpler steps
2. Show all your work and calculations in detail
3. Explain your reasoning at each step in simple terms
4. Use clear mathematical notation that works in plain text
5. Verify your answer at the end and check for errors
6. For word problems, identify the key information and translate it into mathematical expressions
7. If there are multiple approaches, choose the most straightforward one
8. If the problem is ambiguous, make reasonable assumptions and state them
9. If the problem is unsolvable, explain why clearly

You can solve various types of math problems including:
- Arithmetic and basic calculations
- Algebra (equations, inequalities, systems of equations)
- Calculus (derivatives, integrals, limits)
- Statistics and probability
- Geometry (areas, volumes, angles)
- Trigonometry (sine, cosine, tangent)
- Linear algebra (matrices, vectors)
- Number theory

Format your response with:
- Clear section headings
- Numbered steps
- Final answer clearly marked
- Simple explanations for each step

Remember that you're helping students understand math concepts, so focus on clarity and educational value.
`;

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: {
      category: string;
      probability: string;
    }[];
  };
}

// Function to get the model name from the URL
function getModelNameFromUrl(url: string): string {
  const match = url.match(/models\/([^:]+)/);
  return match ? match[1] : 'unknown-model';
}

// Function to format math response for better readability
function formatMathResponse(text: string): string {
  // Add bold formatting to section headers
  text = text.replace(/^(Step \d+:|Solution:|Answer:|Result:|Approach:|Method:)(.*)/gm, '**$1**$2');

  // Add emphasis to important mathematical terms
  text = text.replace(/\b(equation|formula|theorem|proof|identity|expression|function|variable)\b/gi, '*$1*');

  // Format final answer sections
  text = text.replace(/^(Final Answer:|Therefore,|Thus,|In conclusion,)(.*)/gm, '\n**$1**$2\n');

  // Ensure proper spacing around equations
  text = text.replace(/(\n[^*\n]+=[^*\n]+\n)/g, '\n$1\n');

  return text;
}

export async function generateMathResponse(userQuery: string): Promise<string> {
  try {
    // Log the request for debugging
    console.log('Sending request to Gemini API with query:', userQuery);
    console.log('Using API URL:', GEMINI_API_URL);

    // Prepare the request body - using the same format for all models
    // The newer models all use the v1 API format
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
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Unknown error';

      try {
        // Try to parse the error as JSON
        const errorData = JSON.parse(errorText);
        console.error('Gemini API error:', errorData);
        errorMessage = errorData.error?.message || errorData.error || 'API error';
      } catch (e) {
        // If not JSON, use the raw text
        console.error('Gemini API error (raw):', errorText);
        errorMessage = errorText || 'API error';
      }

      // Try the next model if available
      if (currentModelIndex < GEMINI_MODELS.length - 1) {
        currentModelIndex++;
        console.log(`Trying fallback model ${currentModelIndex}...`);

        // Switch to the next API URL
        GEMINI_API_URL = GEMINI_MODELS[currentModelIndex];

        // Recursive call with the same query but using the fallback model
        return generateMathResponse(userQuery);
      }

      // Reset for next time
      currentModelIndex = 0;
      GEMINI_API_URL = GEMINI_MODELS[0];

      // Provide more helpful guidance based on common errors
      if (errorMessage.includes("quota")) {
        return "Sorry, the AI service has reached its quota limit. This is a common limitation with free API keys. Please try again in a few minutes.";
      } else if (errorMessage.includes("permission") || errorMessage.includes("access")) {
        return "Sorry, there seems to be a permission issue with the AI service. This can happen with free API keys. Please try a simpler math question or try again later.";
      } else if (errorMessage.includes("not found") || errorMessage.includes("unavailable")) {
        return "Sorry, the AI model is currently unavailable. This can happen with free API keys. Please try again later.";
      } else {
        return `Sorry, I encountered an error: ${errorMessage}. Please try a different math question or simplify your current one.`;
      }
    }

    const data: GeminiResponse = await response.json();
    console.log('Gemini API response:', data);

    // Check if the response was blocked for safety reasons
    if (data.promptFeedback?.blockReason) {
      return `Sorry, I cannot provide an answer to that question due to safety concerns.`;
    }

    // Extract the generated text from the response
    if (data.candidates && data.candidates.length > 0) {
      // Reset model index for next time if this was successful
      currentModelIndex = 0;
      GEMINI_API_URL = GEMINI_MODELS[0];

      // Get the raw text from the response
      let text = data.candidates[0].content.parts[0].text;

      // Format the math response for better readability
      text = formatMathResponse(text);

      const modelName = getModelNameFromUrl(GEMINI_API_URL);

      // Add a small note about which model was used (only in development)
      if (import.meta.env.DEV) {
        return `${text}\n\n_Generated using model: ${modelName}_`;
      }

      return text;
    } else {
      // Try the next model if available
      if (currentModelIndex < GEMINI_MODELS.length - 1) {
        currentModelIndex++;
        console.log(`No candidates returned, trying fallback model ${currentModelIndex}...`);

        // Switch to the next API URL
        GEMINI_API_URL = GEMINI_MODELS[currentModelIndex];

        // Recursive call with the same query but using the fallback model
        return generateMathResponse(userQuery);
      }

      // Reset for next time
      currentModelIndex = 0;
      GEMINI_API_URL = GEMINI_MODELS[0];

      // Provide more helpful guidance for no candidates case
      if (userQuery.length > 500) {
        return "I'm sorry, I couldn't generate a response for that question. Your question might be too long. Please try breaking it into smaller parts.";
      } else if (/[^\x00-\x7F]/.test(userQuery)) {
        return "I'm sorry, I couldn't generate a response for that question. Please avoid using special characters or non-English text in your question.";
      } else {
        return "I'm sorry, I couldn't generate a response for that question. Please try rephrasing it or asking a different math question.";
      }
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);

    // Reset for next time
    currentModelIndex = 0;
    GEMINI_API_URL = GEMINI_MODELS[0];

    // Check for network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return "Sorry, there was a network error. Please check your internet connection and try again.";
    } else if (error instanceof Error) {
      return `Sorry, there was an error: ${error.message}. Please try again with a simpler math question.`;
    } else {
      return "Sorry, there was an unexpected error processing your request. Please try again later.";
    }
  }
}
