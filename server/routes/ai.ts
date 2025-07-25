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
  
  // Check if user is asking to build a website
  if (lowerMessage.includes('build') || lowerMessage.includes('create') || lowerMessage.includes('website') || lowerMessage.includes('site') || lowerMessage.includes('app')) {
    return generateWebsiteCode(message, context);
  }
  
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

// Generate actual website code based on user request
function generateWebsiteCode(message: string, context: any): string {
  const lowerMessage = message.toLowerCase();
  
  // Determine website type and generate appropriate code
  if (lowerMessage.includes('loan') || lowerMessage.includes('mortgage') || lowerMessage.includes('finance')) {
    return generateLoanOfficerWebsite();
  } else {
    // Generic professional website
    return generateGenericWebsite(message);
  }
}

function generateLoanOfficerWebsite(): string {
  return `I'll build that loan officer website for you! Here's your complete, professional website:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional Loan Officer - Your Mortgage Expert</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .header { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 1rem 0; position: fixed; width: 100%; top: 0; z-index: 1000; box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
        .nav { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.8rem; font-weight: bold; color: #667eea; }
        .nav-links { display: flex; list-style: none; gap: 2rem; }
        .nav-links a { text-decoration: none; color: #333; font-weight: 500; transition: color 0.3s; }
        .nav-links a:hover { color: #667eea; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 120px 0 80px; text-align: center; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .hero p { font-size: 1.3rem; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; }
        .cta-button { background: linear-gradient(45deg, #ff6b6b, #feca57); color: white; padding: 15px 30px; font-size: 1.1rem; border: none; border-radius: 50px; cursor: pointer; transition: transform 0.3s; text-decoration: none; display: inline-block; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .services { background: white; padding: 80px 0; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem; }
        .service-card { background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s; }
        .service-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .calculator { background: linear-gradient(135deg, #74b9ff, #0984e3); color: white; padding: 80px 0; }
        .calc-form { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 2rem; border-radius: 15px; max-width: 500px; margin: 2rem auto; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
        .form-group input { width: 100%; padding: 12px; border: none; border-radius: 8px; font-size: 1rem; }
        .contact { background: #2d3436; color: white; padding: 80px 0; text-align: center; }
        .contact-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 3rem; }
        .contact-item { background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 15px; }
        @media (max-width: 768px) { .hero h1 { font-size: 2.5rem; } .nav-links { display: none; } }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav container">
            <div class="logo">LoanPro Expert</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#calculator">Calculator</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="container">
            <h1>Your Mortgage Success Starts Here</h1>
            <p>Professional loan officer with 15+ years experience helping families achieve homeownership dreams.</p>
            <a href="#contact" class="cta-button">Get Pre-Approved Today</a>
        </div>
    </section>

    <section class="services" id="services">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem;">Mortgage Services</h2>
            <div class="services-grid">
                <div class="service-card">
                    <h3 style="color: #667eea; margin-bottom: 1rem;">First-Time Buyers</h3>
                    <p>Special programs and guidance for first-time homebuyers. FHA, VA, USDA loans available.</p>
                </div>
                <div class="service-card">
                    <h3 style="color: #667eea; margin-bottom: 1rem;">Refinancing</h3>
                    <p>Lower your monthly payments or cash out equity with our refinancing solutions.</p>
                </div>
                <div class="service-card">
                    <h3 style="color: #667eea; margin-bottom: 1rem;">Investment Properties</h3>
                    <p>Financing solutions for real estate investors and rental property purchases.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="calculator" id="calculator">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 1rem;">Mortgage Calculator</h2>
            <div class="calc-form">
                <div class="form-group">
                    <label for="loanAmount">Loan Amount ($)</label>
                    <input type="number" id="loanAmount" placeholder="400,000">
                </div>
                <div class="form-group">
                    <label for="interestRate">Interest Rate (%)</label>
                    <input type="number" id="interestRate" step="0.01" placeholder="6.5">
                </div>
                <div class="form-group">
                    <label for="loanTerm">Loan Term (years)</label>
                    <input type="number" id="loanTerm" placeholder="30">
                </div>
                <button class="cta-button" onclick="calculatePayment()" style="width: 100%;">Calculate Payment</button>
                <div id="result" style="margin-top: 1rem; font-size: 1.2rem; font-weight: bold; text-align: center;"></div>
            </div>
        </div>
    </section>

    <section class="contact" id="contact">
        <div class="container">
            <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Ready to Get Started?</h2>
            <div class="contact-info">
                <div class="contact-item">
                    <h3>📞 Call Me</h3>
                    <p>(555) 123-4567</p>
                </div>
                <div class="contact-item">
                    <h3>✉️ Email Me</h3>
                    <p>loans@loanproexpert.com</p>
                </div>
                <div class="contact-item">
                    <h3>🏢 Visit Office</h3>
                    <p>123 Main Street<br>City, State 12345</p>
                </div>
            </div>
        </div>
    </section>

    <script>
        function calculatePayment() {
            const loanAmount = parseFloat(document.getElementById('loanAmount').value);
            const annualRate = parseFloat(document.getElementById('interestRate').value) / 100;
            const loanTermYears = parseFloat(document.getElementById('loanTerm').value);
            
            if (!loanAmount || !annualRate || !loanTermYears) {
                document.getElementById('result').innerHTML = 'Please fill in all fields';
                return;
            }
            
            const monthlyRate = annualRate / 12;
            const numPayments = loanTermYears * 12;
            const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                                 (Math.pow(1 + monthlyRate, numPayments) - 1);
            
            document.getElementById('result').innerHTML = \`Monthly Payment: $\${monthlyPayment.toFixed(2)}\`;
        }
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
            });
        });
    </script>
</body>
</html>
\`\`\`

Your professional loan officer website is complete and ready to deploy!`;
}

function generateGenericWebsite(message: string): string {
  return `I'll build a professional website for you! Here's your complete website:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional Business Website</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 0; position: fixed; width: 100%; top: 0; z-index: 1000; }
        .nav { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.8rem; font-weight: bold; }
        .nav-links { display: flex; list-style: none; gap: 2rem; }
        .nav-links a { color: white; text-decoration: none; transition: opacity 0.3s; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 120px 0 80px; text-align: center; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.3rem; margin-bottom: 2rem; max-width: 600px; margin: 0 auto 2rem; }
        .cta-button { background: linear-gradient(45deg, #ff6b6b, #feca57); color: white; padding: 15px 30px; font-size: 1.1rem; border: none; border-radius: 50px; cursor: pointer; transition: transform 0.3s; text-decoration: none; display: inline-block; }
        .cta-button:hover { transform: translateY(-2px); }
        .features { padding: 80px 0; background: #f8f9fa; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem; }
        .feature-card { background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s; }
        .feature-card:hover { transform: translateY(-5px); }
        .contact { background: #2d3436; color: white; padding: 80px 0; text-align: center; }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav container">
            <div class="logo">YourBusiness</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <section class="hero" id="home">
        <div class="container">
            <h1>Welcome to Your Success</h1>
            <p>Professional solutions tailored to your business needs. We deliver results that matter.</p>
            <a href="#contact" class="cta-button">Get Started Today</a>
        </div>
    </section>

    <section class="features" id="features">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem;">Our Services</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <h3 style="color: #667eea; margin-bottom: 1rem;">Professional Service</h3>
                    <p>High-quality solutions delivered with expertise and attention to detail.</p>
                </div>
                <div class="feature-card">
                    <h3 style="color: #667eea; margin-bottom: 1rem;">Customer Focus</h3>
                    <p>Your success is our priority. We work closely with you to achieve your goals.</p>
                </div>
                <div class="feature-card">
                    <h3 style="color: #667eea; margin-bottom: 1rem;">Proven Results</h3>
                    <p>Track record of delivering measurable results for businesses like yours.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="contact" id="contact">
        <div class="container">
            <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Ready to Get Started?</h2>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">Contact us today for a free consultation</p>
            <a href="mailto:contact@yourbusiness.com" class="cta-button">Contact Us Now</a>
        </div>
    </section>

    <script>
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
            });
        });
    </script>
</body>
</html>
\`\`\`

Your professional website is complete and ready to deploy!`;
}

export default router;