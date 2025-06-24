import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const modelName = "microsoft/Phi-4-multimodal-instruct";

async function main() {
  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "user", content: "What is the capital of France?" },
      ],
      model: modelName,
    },
  });

  if (isUnexpected(response)) {
    console.error("API returned an error:", response.body);
    throw response.body.error;
  }

  console.log("API response:", response.body.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
