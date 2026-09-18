import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // AI Zakat Assistant Chat Route
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, userContext } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          reply:
            'Assalamu Alaikum! The AI Assistant is ready to help, but no GEMINI_API_KEY was detected in the environment. Here is a baseline rule: Zakat is 2.5% on qualifying net wealth (Cash, Gold, Silver, Trade goods minus short-term debts) exceeding the Nisab threshold (Silver: 612.36g / 52.5 tolas or Gold: 87.48g / 7.5 tolas) held for one lunar year. You can calculate your exact dues in the Input & Result tabs!',
          fallback: true,
        });
      }

      // Contextual System Prompt tailored for Islamic Zakat rulings in Pakistan
      let contextNote = '';
      if (userContext) {
        contextNote = `
Current User Calculation Data:
- Cash & Bank Savings: PKR ${userContext.cashSavings?.toLocaleString() || 0}
- Gold Holdings: ${userContext.goldGrams || 0}g (${userContext.goldPurity || '24K'}), valued at approx PKR ${userContext.goldValue?.toLocaleString() || 0}
- Silver Holdings: ${userContext.silverGrams || 0}g, valued at approx PKR ${userContext.silverValue?.toLocaleString() || 0}
- Business Stock / Merchandise: PKR ${userContext.businessValue?.toLocaleString() || 0}
- Deductible Liabilities: PKR ${userContext.liabilities?.toLocaleString() || 0}
- Net Wealth: PKR ${userContext.netWealth?.toLocaleString() || 0}
- Selected Nisab Standard: ${userContext.nisabMethod === 'gold' ? 'Gold (87.48g / 7.5 tolas)' : 'Silver (612.36g / 52.5 tolas)'}
- Nisab Threshold in PKR: PKR ${userContext.nisabThresholdPKR?.toLocaleString() || 0}
- Zakat Due: PKR ${userContext.zakatDue?.toLocaleString() || 0} (${userContext.isEligible ? 'Zakat is Obligatory' : 'Wealth is below Nisab'})
`;
      }

      const systemInstruction = `You are a knowledgeable, compassionate, and authentic Islamic Zakat & Wealth Advisor for Pakistan named "Mufti AI / Zakat Companion".
Your mission is to guide Muslims in Pakistan with clear, practical, and scholar-grounded advice regarding Zakat calculations, Nisab criteria, asset eligibility, and Masarif (recipients).

Scholarly Guidelines for Pakistan (primarily Hanafi fiqh with acknowledgement of broader Sunni consensus):
1. Nisab Thresholds:
   - Silver Nisab: 52.5 Tolas (612.36 grams). In Pakistan, the silver threshold is widely adopted by scholars when a person holds mixed assets (e.g., cash + gold/silver) to maximally benefit the poor and needy.
   - Gold Nisab: 7.5 Tolas (87.48 grams). Used when the individual owns ONLY gold and zero cash or silver.
   - Rate: Exactly 2.5% (one fortieth) of net Zakatable wealth after passing the one-lunar-year (Hawl) condition.
2. Asset Evaluation:
   - Gold & Silver: In Hanafi fiqh, Zakat is due on ALL gold and silver jewelry, utensils, coins, and bullion, regardless of whether it is worn regularly or stored. Note gently that other schools (Shafi'i, Maliki, Hanbali) exempt reasonable personal everyday jewelry, but Hanafi fiqh considers all gold/silver Zakatable for safety.
   - Business Stock: Finished goods and inventory for sale evaluated at current wholesale/selling market value. Factory machinery, office equipment, and personal work tools are exempt.
   - Real Estate & Plots: Plots bought for trading/resale (Niyyah of trade) are subject to 2.5% Zakat annually on current market value. Personal residence plots and land held without definitive intention to sell are exempt. Rental properties: Zakat is due only on the net accumulated rental income, not the building value.
   - Provident Fund / Gratuity: Zakat is payable once funds are received or accessible into personal control.
   - Loans & Debts: Immediate short-term debts due now can be deducted. Long-term debts (e.g. 20-year mortgage): only deduct the installments due for the upcoming year.
3. Eligible Recipients (Masarif-e-Zakat per Surah At-Tawbah 9:60):
   - The poor (Fuqara), the destitute (Masakeen), indebted persons unable to pay, stranded travelers, etc.
   - Cannot give Zakat to direct ascendants (parents, grandparents) or direct descendants (children, grandchildren), or spouse, or Banu Hashim (Syeds).
   - Giving Zakat to needy siblings, uncles, aunts, or in-laws is highly encouraged as it carries dual reward (Charity + maintaining kinship).
4. Tone & Formatting:
   - Open warmly with a short greeting like "Assalamu Alaikum" or "Bismillah" when fitting.
   - Use clean Markdown with bullet points, bold key terms, and PKR calculations.
   - Reference Quran or Hadith briefly where helpful.
   - If the user has active calculator figures provided in the context below, personalize your advice directly to their figures!
   - For deeply complex inheritance, contested business partnership debt, or specialized financial derivatives, gently advise consulting a local Darul Ifta / qualified scholar.

${contextNote}`;

      // Build Gemini contents array
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          topP: 0.9,
        },
      });

      const reply = response.text || "I apologize, I could not generate an answer at this moment. Please try asking again.";
      return res.json({ reply });
    } catch (error: any) {
      console.error('Gemini chat error:', error);
      return res.status(500).json({
        error: 'Failed to process chat with Gemini AI.',
        details: error?.message || String(error),
      });
    }
  });

  // Vite Middleware in Development vs Static Serving in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
