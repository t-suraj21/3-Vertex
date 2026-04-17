const axios = require('axios');
require('dotenv').config();
const key = process.env.GEMINI_API_KEY;

async function test(modelName) {
  try {
    const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`, {
      contents: [{ parts: [{ text: "Hello" }] }]
    });
    console.log(`SUCCESS for ${modelName}`, res.data.candidates[0].content.parts[0].text);
  } catch(e) {
    if (e.response) {
      console.log(`FAILED for ${modelName}:`, e.response.status, e.response.data.error.message);
    } else {
      console.log("NETWORK ERROR", e.message);
    }
  }
}
async function run() {
  await test('gemini-1.5-flash');
  await test('gemini-1.5-flash-latest');
  await test('gemini-1.5-flash-001');
  await test('gemini-1.5-pro');
}
run();
