import { Router } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

const router = Router();

// Chat request schema
const chatRequestSchema = z.object({
  message: z.string(),
  model: z.string(),
  context: z.object({
    projectType: z.string().optional(),
    selectedStacks: z.array(z.string()).optional(),
    industry: z.string().optional()
  }).optional()
});

// Initialize AI clients
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ''
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const gemini = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY || ''
});

// System prompt for the AI sales agent
const getSystemPrompt = (context: any) => {
  const projectInfo = context?.projectType ? `The user is building a ${context.projectType}.` : '';
  const stacksInfo = context?.selectedStacks?.length > 0 ? 
    `They've selected these marketing tools: ${context.selectedStacks.join(', ')}.` : '';
  const industryInfo = context?.industry ? `They are in the ${context.industry} industry.` : '';

  return `You are an expert AI sales consultant for Codexel.ai, a revolutionary AI-powered development platform. 
Your role is to help users understand how our platform can solve their specific business needs.

${projectInfo} ${stacksInfo} ${industryInfo}

Key points to emphasize:
- We can build their entire application in hours, not months
- Our AI agents work 24/7 to develop, test, and deploy their project
- We integrate with all major AI models (GPT-4, Claude, Gemini, etc.)
- Typical cost savings of 90% compared to traditional development
- No coding knowledge required

Be specific, helpful, and focus on their exact use case. Provide concrete examples and ROI calculations when relevant.
Ask clarifying questions to better understand their needs.
Always be enthusiastic but professional.`;
};

router.post('/chat', async (req, res) => {
  try {
    const { message, model, context } = chatRequestSchema.parse(req.body);
    const systemPrompt = getSystemPrompt(context);

    let response = '';

    switch (model) {
      case 'gpt-4':
      case 'gpt-4-turbo': {
        const completion = await openai.chat.completions.create({
          model: model === 'gpt-4' ? 'gpt-4' : 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        });
        response = completion.choices[0].message.content || '';
        break;
      }

      case 'claude-3.5-sonnet': {
        const completion = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          system: systemPrompt,
          messages: [{ role: 'user', content: message }],
          max_tokens: 500
        });
        response = completion.content[0].type === 'text' ? completion.content[0].text : '';
        break;
      }

      case 'gemini-ultra': {
        const genModel = gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          config: { systemInstruction: systemPrompt },
          contents: message
        });
        const result = await genModel;
        response = result.text || '';
        break;
      }

      case 'grok-2': {
        const completion = await xai.chat.completions.create({
          model: 'grok-2-1212',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        });
        response = completion.choices[0].message.content || '';
        break;
      }

      default: {
        // Fallback to intelligent hardcoded responses based on common queries
        response = getIntelligentResponse(message, context);
      }
    }

    res.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    
    // Provide intelligent fallback response
    const fallbackResponse = getIntelligentResponse(req.body.message, req.body.context);
    res.json({ response: fallbackResponse });
  }
});

// Intelligent fallback responses based on user queries
function getIntelligentResponse(message: string, context: any): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('loan officer') || lowerMessage.includes('mortgage')) {
    return `Perfect! I'll help you create a professional loan officer website with AI-powered features. Here's what we'll build:

**Your Loan Officer Platform Will Include:**
- Professional landing page with your photo and credentials
- Mortgage calculator with real-time rates
- AI chatbot to pre-qualify leads 24/7  
- Automated appointment scheduling
- Client portal for document uploads
- Email/SMS follow-up automation
- Integration with MLS for property data

**Cost Breakdown:**
- Traditional dev agency: $15,000-25,000 + 3-6 months
- With Codexel.ai: $497/month + built in 48 hours

Our AI agents will handle everything - design, development, testing, and deployment. You'll have a fully functional site that converts visitors into qualified leads.

Would you like me to show you some successful loan officer sites we've built?`;
  }

  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
    const selectedCount = context?.selectedStacks?.length || 0;
    const monthlyPrice = selectedCount * 49 || 197;
    
    return `Great question! Here's our transparent pricing:

**Codexel.ai Pricing:**
${selectedCount > 0 ? 
  `- Your selected tools: $${monthlyPrice}/month
  - This includes ${selectedCount} AI marketing agents working 24/7` :
  `- Starter: $197/month (perfect for MVPs)
  - Professional: $497/month (full-featured apps)
  - Enterprise: $997/month (complex platforms)`}

**What You Save:**
- Traditional development: $50,000-150,000
- Time saved: 3-6 months → 48 hours
- No hiring developers, designers, or project managers
- No maintenance headaches

**Included in Every Plan:**
- Unlimited revisions
- All AI models (GPT-4, Claude, Gemini)
- Deployment & hosting setup
- Source code ownership
- 24/7 AI support

Ready to calculate your exact ROI? I can show you projected revenue vs. our costs.`;
  }

  if (lowerMessage.includes('how') || lowerMessage.includes('work') || lowerMessage.includes('process')) {
    return `Excellent question! Here's exactly how Codexel.ai works:

**Our 4-Step Process:**

1. **Describe Your Vision** (5 minutes)
   - Tell us what you want to build in plain English
   - No technical knowledge needed
   - Our AI understands your business goals

2. **AI Agents Start Building** (Immediately)
   - Multiple specialized agents work in parallel
   - Frontend, backend, database, testing agents
   - You can watch the progress in real-time

3. **Review & Refine** (Ongoing)
   - See live previews as it's built
   - Request changes in plain English
   - AI implements your feedback instantly

4. **Launch Your App** (24-48 hours)
   - One-click deployment
   - Custom domain setup
   - Your app is live and ready for customers

**What makes us different:**
- No coding required from you
- 10x faster than traditional development
- 90% more cost-effective
- You own 100% of the code

Want to see a demo of an app being built in real-time?`;
  }

  // Generic but contextual response
  return `I understand you're looking to build something amazing with Codexel.ai! 

Based on what you've told me, I can help you create exactly what you need. Our AI-powered platform can build your complete application in just 48 hours - no coding required.

Could you tell me more about:
- What specific features you need?
- Who your target customers are?
- What's your timeline for launching?

This helps me show you exactly how Codexel.ai can solve your specific needs and calculate your ROI.`;
}

export default router;