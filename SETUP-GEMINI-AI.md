# Setup Gemini AI for Real-Time Predictions

## 🚀 Enable Real-Time AI Predictions

To get real-time internet-based predictions instead of fallback values, you need to set up the Gemini AI API key.

## 📋 Step-by-Step Setup

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (it starts with `AIza...`)

### 2. Add Environment Variable

Create a file named `.env.local` in your project root:

```bash
# In your project directory
touch .env.local
```

Add your API key to the file:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## 🔍 Test the AI Integration

Run the test script to verify it's working:

```bash
node test-gemini-ai.js
```

## 🎯 What This Enables

✅ **Real-time internet-based predictions**
✅ **Current year competition analysis** 
✅ **Accurate percentile calculations**
✅ **Dynamic rank predictions**
✅ **Exam-specific analysis**

## 🔧 Troubleshooting

### Issue: Still getting 0.0% predictions

**Check the browser console for these messages:**
- `⚠️ GEMINI_API_KEY is missing` → Add the API key
- `🤖 Using fallback prediction due to missing GEMINI_API_KEY` → API key not working

**Solutions:**
1. Verify API key is correct (no extra spaces)
2. Check `.env.local` file is in project root
3. Restart development server after adding key
4. Ensure API key has proper permissions

### Issue: API Key Not Working

1. **Generate a new API key** from Google AI Studio
2. **Check your API quota** - free tier has limits
3. **Verify key format** - should start with `AIza...`

## 📊 Expected Results

With proper Gemini AI setup, you should see:
- **Realistic percentiles** (50-99% range)
- **Accurate rank predictions** (1-1,000,000 range)
- **Current-year analysis** in predictions
- **Internet data source** confirmed in logs

## 🎉 Example Output

```
🤖 AI Source: internet Dataset: None
📋 AI Parameters: {
  score: 180,
  examName: "JEE MAIN 2024",
  aiSource: "internet",
  hasDatasetData: false,
  apiKeyExists: true
}
✅ AI Prediction successful:
  - Predicted Percentile: 94.2
  - Predicted Rank: 69,600
  - Data Source: internet
  - Confidence: 85
```

Your AI predictions will now use real-time internet data instead of fallback calculations!
