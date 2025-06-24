// vision.js

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { readFileSync } from "node:fs";

const token = process.env["GITHUB_TOKEN"];
if (!token) {
  console.error("ERROR: Please set your GITHUB_TOKEN environment variable before running.");
  process.exit(1);
}

const endpoint = "https://models.github.ai/inference";
const modelName = "microsoft/Phi-4-multimodal-instruct";

/**
 * Convert local image file to data URL string (base64)
 * @param {string} imageFile - path to the image file
 * @param {string} imageFormat - image format like "jpeg" or "png"
 * @returns {string} Data URL of the image
 */
function getImageDataUrl(imageFile, imageFormat) {
  try {
    const imageBuffer = readFileSync(imageFile);
    const imageBase64 = imageBuffer.toString("base64");
    return `data:image/${imageFormat};base64,${imageBase64}`;
  } catch (error) {
    console.error(`Could not read '${imageFile}'. Make sure the path is correct.`);
    process.exit(1);
  }
}

async function main() {
  // Create client
  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  // Compose messages with text and an image URL (local image converted to data URL)
  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: "What's in this image?" },
        {
          type: "image_url",
          image_url: {
            url: getImageDataUrl("example.jpg", "jpeg"), // Replace example.jpg with your file path
            details: "low",
          },
        },
      ],
    },
    {
      role: "user",
      content: "Also, tell me a fun fact about Paris.",
    },
  ];

  // POST request body
  const requestBody = {
    messages,
    model: modelName,
  };

  // Call the /chat/completions endpoint
  const response = await client.path("/chat/completions").post({ body: requestBody });

  if (isUnexpected(response)) {
    console.error("API returned an error:", response.body.error);
    return;
  }

  // Output the assistant reply
  console.log("Model response:", response.body.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
