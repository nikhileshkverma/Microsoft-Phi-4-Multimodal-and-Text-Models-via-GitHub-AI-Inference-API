import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { readFileSync } from "node:fs";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const modelName = "microsoft/Phi-4-multimodal-instruct";

function getImageDataUrl(file, format) {
  const buffer = readFileSync(file);
  return `data:image/${format};base64,${buffer.toString('base64')}`;
}

const client = ModelClient(endpoint, new AzureKeyCredential(token));

const response = await client.path("/chat/completions").post({
  body: {
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What's in this image?" },
          { type: "image_url", image_url: { url: getImageDataUrl("sample.jpg", "jpg"), details: "low" } }
        ]
      }
    ],
    model: modelName,
  },
});

if (isUnexpected(response)) throw response.body.error;

console.log(response.body.choices[0].message.content);
