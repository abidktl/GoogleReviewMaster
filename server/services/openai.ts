import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "sk-test-key"
});

export interface AISuggestion {
  suggestion: string;
  tone: "professional" | "friendly" | "apologetic" | "grateful";
  confidence: number;
}

export async function generateResponseSuggestions(
  reviewContent: string,
  rating: number,
  customerName: string
): Promise<AISuggestion[]> {
  try {
    const prompt = `
You are a professional customer service representative helping to respond to Google My Business reviews. 

Review Details:
- Customer: ${customerName}
- Rating: ${rating}/5 stars
- Review: "${reviewContent}"

Generate 2-3 different response suggestions that are:
1. Professional and empathetic
2. Personalized to the customer and their specific feedback
3. Appropriate for the rating given
4. Brief but meaningful (150-200 characters each)

For ratings 1-2: Focus on apology, acknowledgment, and resolution
For ratings 3: Balance acknowledgment with improvement commitment
For ratings 4-5: Express gratitude and encourage return visits

Respond with JSON in this exact format:
{
  "suggestions": [
    {
      "suggestion": "response text here",
      "tone": "professional|friendly|apologetic|grateful", 
      "confidence": 0.85
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at crafting professional, empathetic responses to customer reviews."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.suggestions || [];

  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    // Return fallback suggestions based on rating
    return getFallbackSuggestions(rating, customerName);
  }
}

export async function improveResponse(
  originalResponse: string,
  reviewContent: string,
  rating: number
): Promise<string> {
  try {
    const prompt = `
Improve this review response to make it more professional, empathetic, and engaging:

Original Response: "${originalResponse}"
Review Rating: ${rating}/5 stars
Review Content: "${reviewContent}"

Make the response:
- More personalized and specific
- Professional but warm
- Concise (under 200 characters)
- Appropriate for the rating

Respond with JSON in this format:
{
  "improved_response": "the improved response text here"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 400,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.improved_response || originalResponse;

  } catch (error) {
    console.error("Error improving response:", error);
    return originalResponse;
  }
}

function getFallbackSuggestions(rating: number, customerName: string): AISuggestion[] {
  if (rating <= 2) {
    return [
      {
        suggestion: `We sincerely apologize for not meeting your expectations, ${customerName}. Please contact us directly so we can make this right.`,
        tone: "apologetic",
        confidence: 0.8
      },
      {
        suggestion: `Thank you for your feedback, ${customerName}. We take your concerns seriously and would like to resolve this personally.`,
        tone: "professional",
        confidence: 0.7
      }
    ];
  } else if (rating === 3) {
    return [
      {
        suggestion: `Thank you for your feedback, ${customerName}. We appreciate your honesty and are working to improve in the areas you mentioned.`,
        tone: "professional",
        confidence: 0.8
      },
      {
        suggestion: `We're grateful for your review, ${customerName}. Your constructive feedback helps us provide better experiences for all our customers.`,
        tone: "friendly",
        confidence: 0.7
      }
    ];
  } else {
    return [
      {
        suggestion: `Thank you so much for the wonderful review, ${customerName}! We're thrilled you had such a positive experience with us.`,
        tone: "grateful",
        confidence: 0.9
      },
      {
        suggestion: `We're delighted you enjoyed your visit, ${customerName}! Your kind words mean the world to our team. Hope to see you again soon!`,
        tone: "friendly",
        confidence: 0.8
      }
    ];
  }
}
