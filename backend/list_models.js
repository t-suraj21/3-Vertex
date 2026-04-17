const axios = require('axios');
require('dotenv').config();
const key = process.env.GEMINI_API_KEY;

async function run() {
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const names = res.data.models.map(m => m.name).filter(n => n.includes('gemini'));
    console.log("AVAILABLE GEMINI MODELS:", names);
  } catch(e) {
    console.log("ERROR", e.response ? e.response.status : e.message);
  }
}
run();
