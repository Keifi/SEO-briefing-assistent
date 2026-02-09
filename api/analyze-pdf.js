export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pdfData } = req.body;

    if (!pdfData) {
      return res.status(400).json({ error: 'No PDF data provided' });
    }

    // Get API key from environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfData
                }
              },
              {
                type: "text",
                text: `Analyseer dit SEMrush rapport en extraheer de volgende informatie voor SEO doeleinden:

1. HOOFDZOEKWOORD: Het primaire/meest relevante zoekwoord (1 zoekwoord)
2. ZOEKWOORDVARIATIES: Meervoud, synoniemen, spellingvarianten (max 10)
3. LONG-TAIL ZOEKWOORDEN: Langere specifieke zoekwoorden (max 10)
4. VRAGEN: "People Also Ask" vragen of vraagvormen (max 8)

FILTER UIT: Zoekwoorden met merknamen van concurrenten.

Geef je antwoord ALLEEN in dit exacte JSON formaat, zonder extra tekst of markdown:
{
  "mainKeyword": "string",
  "variations": ["string"],
  "longTail": ["string"],
  "questions": ["string"]
}`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      return res.status(response.status).json({ 
        error: 'API call failed', 
        details: errorData 
      });
    }

    const data = await response.json();
    
    // Extract text content
    const textContent = data.content
      .filter(item => item.type === "text")
      .map(item => item.text)
      .join("\n");

    // Parse JSON response
    let parsedData;
    try {
      const cleanJson = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse response',
        rawText: textContent 
      });
    }

    // Return parsed data
    return res.status(200).json(parsedData);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}