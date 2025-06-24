import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { readFileSync } from "node:fs";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const modelName = "microsoft/Phi-4-multimodal-instruct";

async function main() {
  if (!token) {
    console.error("Please set your GITHUB_TOKEN environment variable.");
    process.exit(1);
  }

  const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token),
  );

  // Function to convert image file to base64 data URL
  function getImageDataUrl(imageFile, imageFormat) {
    try {
      const imageBuffer = readFileSync(imageFile);
      const imageBase64 = imageBuffer.toString("base64");
      return `data:image/${imageFormat};base64,${imageBase64}`;
    } catch (error) {
      console.error(`Could not read '${imageFile}':`, error.message);
      process.exit(1);
    }
  }

  // Replace with your local image filename and format
  const imageDataUrl = getImageDataUrl("example.jpg", "jpeg");

  const response = await client.path("/chat/completions").post({
    body: {
      model: modelName,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What's in this image?" },
            { type: "image_url", image_url: { url: imageDataUrl, details: "low" } },
          ],
        },
      ],
    },
  });

  if (isUnexpected(response)) {
    console.error("API returned an error:", response.body.error);
    process.exit(1);
  }

  console.log("Model response:");
  console.log(response.body.choices[0].message.content);
}

main().catch((err) => {
  console.error("Error running the multimodal sample:", err);
});
