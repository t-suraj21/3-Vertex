const axios = require('axios');

// @desc    Get IT Industry News
// @route   GET /api/news
exports.getITNews = async (req, res) => {
  try {
    // In production, this would securely fetch from NewsAPI or Google News API
    // Example: await axios.get(`https://newsapi.org/v2/everything?q=IT+Hiring+Tech+Layoffs&apiKey=${process.env.NEWS_API_KEY}`)
    
    // We are returning live simulated API schema for immediate front-end mapping:
    const mockNewsResponse = [
      { id: 1, source: 'TechCrunch', title: 'OpenAI announces new model capable of deeper reasoning.', time: '2h ago' },
      { id: 2, source: 'Wired', title: 'Global IT hiring sees 15% surge as companies focus on AI.', time: '4h ago' },
      { id: 3, source: 'Verge', title: 'Apple releases completely redesigned MacBook Pro.', time: '5h ago' }
    ];

    res.status(200).json({ success: true, count: mockNewsResponse.length, data: mockNewsResponse });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error fetching News' });
  }
};
