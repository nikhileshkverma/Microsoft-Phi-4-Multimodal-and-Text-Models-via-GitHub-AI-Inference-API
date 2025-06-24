# Complete Guide to Run Microsoft Phi-4 Multimodal and Text Models via GitHub AI Inference API

---

## Prerequisites

* Node.js (v20+ recommended)
* npm (comes with Node.js)
* Git
* A GitHub Personal Access Token (PAT) with necessary scopes for GitHub AI Inference API (read/model inference)

---

## Step 1: Get a GitHub Personal Access Token (PAT)

1. Go to [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Generate a new token with at least the following scopes:

   * `read:packages`
   * Any other scopes required for GitHub AI model inference (check official docs)
3. Copy your token — you will use it as `GITHUB_TOKEN`

---

## Step 2: Setup your project directory

Open your terminal and run:

```bash
mkdir phi4-inference
cd phi4-inference
npm init -y
```

This creates a new Node.js project.

---

## Step 3: Install required npm packages

```bash
npm install @azure-rest/ai-inference @azure/core-auth
```

* `@azure-rest/ai-inference` — the Azure SDK client used to call GitHub’s AI inference API
* `@azure/core-auth` — handles credentials

---

## Step 4: Set environment variable with your GitHub token

```bash
export GITHUB_TOKEN="your_github_pat_here"
echo $GITHUB_TOKEN  # Verify it prints your token
```

---

## Step 5: Create `basic.js` for text model inference

Create `basic.js` in your `phi4-inference` folder with this content:

```js
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const modelName = "microsoft/Phi-4-multimodal-instruct";

async function main() {
  if (!token) {
    console.error("Please set your GITHUB_TOKEN environment variable.");
    process.exit(1);
  }

  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  const response = await client.path("/chat/completions").post({
    body: {
      model: modelName,
      messages: [{ role: "user", content: "4+4=" }],
      temperature: 0.7,
    },
  });

  if (isUnexpected(response)) {
    console.error("API error:", response.body.error);
    process.exit(1);
  }

  console.log("Response:", response.body.choices[0].message.content);
}

main();
```

---

## Step 6: Run `basic.js`

```bash
node basic.js
```

You should see output like:

```
Response: 8
```

---

## Step 7: Prepare an image file for multimodal input

* Place an image named `example.jpg` inside the `phi4-inference` folder (or update filename accordingly in next step).

---

## Step 8: Create `multimodal.js` for image + text model inference

Create `multimodal.js` with this code:

```js
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

  const client = ModelClient(endpoint, new AzureKeyCredential(token));

  const getImageDataUrl = (filePath, format) => {
    const buffer = readFileSync(filePath);
    const base64 = buffer.toString("base64");
    return `data:image/${format};base64,${base64}`;
  };

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
      temperature: 0.7,
    },
  });

  if (isUnexpected(response)) {
    console.error("API error:", response.body.error);
    process.exit(1);
  }

  console.log("Model response:\n", response.body.choices[0].message.content);
}

main();
```

---

## Step 9: Run `multimodal.js`

```bash
node multimodal.js
```

You should get a text response describing your image.

---

## Optional: Verify Node.js version (recommended >= 20)

```bash
node -v
```

If it’s older, update Node.js with your OS’s package manager or download from [https://nodejs.org/](https://nodejs.org/)

---

## Summary of key files & commands

| Step                | Command/File          | Purpose                    |
| ------------------- | --------------------- | -------------------------- |
| Init project        | `npm init -y`         | Create `package.json`      |
| Install deps        | `npm install ...`     | Install Azure SDK packages |
| Set token           | `export GITHUB_TOKEN` | Set PAT for authentication |
| Run text test       | `node basic.js`       | Text only model call       |
| Add image file      | `example.jpg`         | Image for multimodal       |
| Run multimodal test | `node multimodal.js`  | Text + image model call    |

---

## References

* [Microsoft Phi-4 Vision model on HuggingFace](https://huggingface.co/microsoft/phi-4-vision) (model repo)
* [GitHub AI Models Documentation](https://github.com/orgs/community/discussions/54027) (GitHub discussion on AI models)
* [Azure REST AI Inference SDK](https://learn.microsoft.com/en-us/javascript/api/overview/azure/ai-inference-rest) (Azure SDK docs)
* [GitHub PAT Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---
