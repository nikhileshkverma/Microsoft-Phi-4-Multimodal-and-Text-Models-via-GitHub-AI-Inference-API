import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const modelName = "microsoft/Phi-4-multimodal-instruct";

const client = ModelClient(endpoint, new AzureKeyCredential(token));

const response = await client.path("/chat/completions").post({
  body: {
    messages: [{ role: "user", content: "4+4=" }],
    temperature: 0.7,
    model: modelName,
  },
});

if (isUnexpected(response)) throw response.body.error;

console.log(response.body.choices[0].message.content);
