import { intelligentAIOrchestrator } from "./intelligent-ai-orchestrator";

// Advanced code analysis and auto-fixing capabilities
interface CodeAnalysisResult {
  quality: {
    score: number; // 0-100
    issues: CodeIssue[];
    suggestions: string[];
  };
  security: {
    vulnerabilities: SecurityIssue[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  performance: {
    bottlenecks: PerformanceIssue[];
    optimizations: string[];
  };
  architecture: {
    patterns: string[];
    recommendations: string[];
    complexity: number;
  };
  autoFixes: AutoFix[];
}

interface CodeIssue {
  type: 'syntax' | 'style' | 'logic' | 'naming' | 'structure';
  severity: 'info' | 'warning' | 'error' | 'critical';
  line: number;
  column?: number;
  message: string;
  suggestion: string;
  autoFixable: boolean;
}

interface SecurityIssue {
  type: 'xss' | 'sql_injection' | 'auth' | 'secrets' | 'permissions' | 'data_exposure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  line: number;
  description: string;
  impact: string;
  remediation: string;
}

interface PerformanceIssue {
  type: 'memory' | 'cpu' | 'network' | 'database' | 'algorithm';
  impact: 'low' | 'medium' | 'high';
  description: string;
  optimization: string;
  estimatedImprovement: string;
}

interface AutoFix {
  id: string;
  description: string;
  type: 'syntax' | 'style' | 'security' | 'performance';
  confidence: number; // 0-100
  preview: string;
  originalCode: string;
  fixedCode: string;
  lineRange: [number, number];
}

class CodeIntelligenceService {
  private analysisCache = new Map<string, { result: CodeAnalysisResult; timestamp: number }>();
  private fixHistory = new Map<string, AutoFix[]>();

  // Comprehensive code analysis using AI
  async analyzeCode(code: string, language: string, filePath?: string): Promise<CodeAnalysisResult> {
    const cacheKey = this.generateCacheKey(code, language);
    const cached = this.analysisCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5-minute cache
      return cached.result;
    }

    const analysisPrompt = `
Analyze this ${language} code comprehensively. Provide detailed analysis in JSON format:

\`\`\`${language}
${code}
\`\`\`

Return analysis as JSON with this structure:
{
  "quality": {
    "score": number (0-100),
    "issues": [{"type": "syntax|style|logic|naming|structure", "severity": "info|warning|error|critical", "line": number, "message": "description", "suggestion": "fix suggestion", "autoFixable": boolean}],
    "suggestions": ["general improvement suggestions"]
  },
  "security": {
    "vulnerabilities": [{"type": "xss|sql_injection|auth|secrets|permissions|data_exposure", "severity": "low|medium|high|critical", "line": number, "description": "vulnerability description", "impact": "potential impact", "remediation": "how to fix"}],
    "riskLevel": "low|medium|high|critical"
  },
  "performance": {
    "bottlenecks": [{"type": "memory|cpu|network|database|algorithm", "impact": "low|medium|high", "description": "bottleneck description", "optimization": "optimization suggestion", "estimatedImprovement": "expected improvement"}],
    "optimizations": ["general performance optimizations"]
  },
  "architecture": {
    "patterns": ["detected design patterns"],
    "recommendations": ["architectural improvements"],
    "complexity": number (1-10)
  }
}

Focus on actionable insights and specific line numbers where possible.`;

    try {
      const aiResponse = await intelligentAIOrchestrator.intelligentRequest(
        analysisPrompt,
        {
          type: 'code_analysis',
          complexity: 'high',
          budget: 'medium',
          speed: 'balanced',
          contextSize: code.length + analysisPrompt.length
        }
      );

      const analysis = JSON.parse(aiResponse.response);
      
      // Generate auto-fixes for fixable issues
      const autoFixes = await this.generateAutoFixes(code, analysis.quality.issues.filter((i: CodeIssue) => i.autoFixable), language);
      
      const result: CodeAnalysisResult = {
        ...analysis,
        autoFixes
      };

      // Cache the result
      this.analysisCache.set(cacheKey, { result, timestamp: Date.now() });
      
      return result;

    } catch (error) {
      console.error('Code analysis failed:', error);
      
      // Fallback to basic analysis
      return this.basicCodeAnalysis(code, language);
    }
  }

  // Generate automatic code fixes using AI
  private async generateAutoFixes(code: string, issues: CodeIssue[], language: string): Promise<AutoFix[]> {
    if (issues.length === 0) return [];

    const fixes: AutoFix[] = [];
    
    for (const issue of issues.slice(0, 5)) { // Limit to 5 fixes to avoid excessive API calls
      try {
        const fixPrompt = `
Fix this ${language} code issue:
Issue: ${issue.message} (line ${issue.line})
Suggestion: ${issue.suggestion}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide ONLY the fixed code segment around line ${issue.line} (include 2-3 lines of context). Return as JSON:
{
  "fixedCode": "corrected code segment",
  "explanation": "what was changed and why",
  "confidence": number (0-100)
}`;

        const aiResponse = await intelligentAIOrchestrator.intelligentRequest(
          fixPrompt,
          {
            type: 'code_generation',
            complexity: 'medium',
            budget: 'low',
            speed: 'fast',
            contextSize: fixPrompt.length
          }
        );

        const fixResult = JSON.parse(aiResponse.response);
        
        fixes.push({
          id: `fix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          description: fixResult.explanation,
          type: issue.type as any,
          confidence: fixResult.confidence,
          preview: fixResult.fixedCode,
          originalCode: this.extractCodeSegment(code, issue.line),
          fixedCode: fixResult.fixedCode,
          lineRange: [Math.max(1, issue.line - 1), issue.line + 1]
        });

      } catch (error) {
        console.error(`Failed to generate fix for issue at line ${issue.line}:`, error);
      }
    }

    return fixes;
  }

  // Apply auto-fixes to code
  async applyAutoFix(code: string, fix: AutoFix): Promise<string> {
    const lines = code.split('\n');
    const [startLine, endLine] = fix.lineRange;
    
    // Replace the specified line range with the fixed code
    const fixedLines = fix.fixedCode.split('\n');
    lines.splice(startLine - 1, endLine - startLine + 1, ...fixedLines);
    
    const fixedCode = lines.join('\n');
    
    // Record the fix in history
    const fileKey = this.generateCacheKey(code, 'fix_history');
    const history = this.fixHistory.get(fileKey) || [];
    history.push(fix);
    this.fixHistory.set(fileKey, history);
    
    return fixedCode;
  }

  // Apply multiple fixes in optimal order
  async applyMultipleFixes(code: string, fixes: AutoFix[]): Promise<{
    fixedCode: string;
    appliedFixes: AutoFix[];
    failedFixes: { fix: AutoFix; error: string }[];
  }> {
    // Sort fixes by line number (descending) to avoid line number shifts
    const sortedFixes = fixes.sort((a, b) => b.lineRange[0] - a.lineRange[0]);
    
    let currentCode = code;
    const appliedFixes: AutoFix[] = [];
    const failedFixes: { fix: AutoFix; error: string }[] = [];

    for (const fix of sortedFixes) {
      try {
        currentCode = await this.applyAutoFix(currentCode, fix);
        appliedFixes.push(fix);
      } catch (error) {
        failedFixes.push({ fix, error: error instanceof Error ? error.message : String(error) });
      }
    }

    return {
      fixedCode: currentCode,
      appliedFixes,
      failedFixes
    };
  }

  // Architecture analysis and recommendations
  async analyzeArchitecture(projectFiles: Array<{ path: string; content: string }>): Promise<{
    patterns: string[];
    structure: any;
    recommendations: string[];
    complexity: number;
    maintainability: number;
  }> {
    const architecturePrompt = `
Analyze this project's architecture based on these files:

${projectFiles.map(f => `
File: ${f.path}
\`\`\`
${f.content.substring(0, 2000)}${f.content.length > 2000 ? '...' : ''}
\`\`\`
`).join('\n')}

Provide architectural analysis as JSON:
{
  "patterns": ["detected architectural patterns"],
  "structure": {"description": "project structure analysis"},
  "recommendations": ["architectural improvement suggestions"],
  "complexity": number (1-10),
  "maintainability": number (1-10)
}`;

    try {
      const aiResponse = await intelligentAIOrchestrator.intelligentRequest(
        architecturePrompt,
        {
          type: 'architecture',
          complexity: 'high',
          budget: 'high',
          speed: 'quality',
          contextSize: architecturePrompt.length
        }
      );

      return JSON.parse(aiResponse.response);
    } catch (error) {
      console.error('Architecture analysis failed:', error);
      
      return {
        patterns: ['Unable to analyze - analysis failed'],
        structure: { description: 'Analysis unavailable' },
        recommendations: ['Unable to provide recommendations'],
        complexity: 5,
        maintainability: 5
      };
    }
  }

  // Performance optimization suggestions
  async optimizePerformance(code: string, language: string): Promise<{
    optimizations: Array<{
      type: string;
      description: string;
      impact: 'low' | 'medium' | 'high';
      implementation: string;
      estimatedImprovement: string;
    }>;
    optimizedCode?: string;
  }> {
    const optimizationPrompt = `
Analyze this ${language} code for performance optimizations:

\`\`\`${language}
${code}
\`\`\`

Provide optimization suggestions as JSON:
{
  "optimizations": [
    {
      "type": "optimization category",
      "description": "what can be optimized",
      "impact": "low|medium|high",
      "implementation": "how to implement the optimization",
      "estimatedImprovement": "expected performance gain"
    }
  ],
  "canOptimizeCode": boolean,
  "optimizedCode": "optimized version of the code (if canOptimizeCode is true)"
}`;

    try {
      const aiResponse = await intelligentAIOrchestrator.intelligentRequest(
        optimizationPrompt,
        {
          type: 'code_analysis',
          complexity: 'medium',
          budget: 'medium',
          speed: 'balanced',
          contextSize: optimizationPrompt.length
        }
      );

      const result = JSON.parse(aiResponse.response);
      return {
        optimizations: result.optimizations,
        optimizedCode: result.canOptimizeCode ? result.optimizedCode : undefined
      };
    } catch (error) {
      console.error('Performance optimization failed:', error);
      return {
        optimizations: [
          {
            type: 'analysis_failed',
            description: 'Unable to analyze performance',
            impact: 'low',
            implementation: 'Manual review required',
            estimatedImprovement: 'Unknown'
          }
        ]
      };
    }
  }

  // Get analysis statistics and insights
  getAnalyticsInsights() {
    const totalAnalyses = this.analysisCache.size;
    const totalFixes = Array.from(this.fixHistory.values()).reduce((sum, fixes) => sum + fixes.length, 0);
    
    const recentAnalyses = Array.from(this.analysisCache.values())
      .filter(entry => Date.now() - entry.timestamp < 86400000) // Last 24 hours
      .map(entry => entry.result);

    const avgQualityScore = recentAnalyses.length > 0 
      ? recentAnalyses.reduce((sum, r) => sum + r.quality.score, 0) / recentAnalyses.length
      : 0;

    const commonIssueTypes = recentAnalyses
      .flatMap(r => r.quality.issues)
      .reduce((counts, issue) => {
        counts[issue.type] = (counts[issue.type] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

    return {
      totalAnalyses,
      totalFixes,
      recentAnalyses: recentAnalyses.length,
      avgQualityScore: Math.round(avgQualityScore),
      commonIssueTypes,
      recommendations: this.generateAnalyticsRecommendations(avgQualityScore, commonIssueTypes)
    };
  }

  private generateAnalyticsRecommendations(avgScore: number, issueTypes: Record<string, number>): string[] {
    const recommendations = [];
    
    if (avgScore < 70) {
      recommendations.push('Focus on improving code quality - current average is below good standards');
    }
    
    const topIssue = Object.entries(issueTypes).sort(([,a], [,b]) => b - a)[0];
    if (topIssue) {
      recommendations.push(`Address ${topIssue[0]} issues - they appear most frequently`);
    }
    
    if (Object.keys(issueTypes).length > 5) {
      recommendations.push('Consider establishing coding standards to reduce variety of issues');
    }

    return recommendations;
  }

  // Utility methods
  private generateCacheKey(code: string, suffix: string = ''): string {
    const hash = Buffer.from(code).toString('base64').substring(0, 32);
    return `${hash}_${suffix}`;
  }

  private extractCodeSegment(code: string, lineNumber: number, context: number = 2): string {
    const lines = code.split('\n');
    const start = Math.max(0, lineNumber - context - 1);
    const end = Math.min(lines.length, lineNumber + context);
    return lines.slice(start, end).join('\n');
  }

  private basicCodeAnalysis(code: string, language: string): CodeAnalysisResult {
    // Basic fallback analysis when AI fails
    const lines = code.split('\n');
    const issues: CodeIssue[] = [];
    
    // Basic syntax checks (very simple)
    lines.forEach((line, index) => {
      if (line.trim().length > 120) {
        issues.push({
          type: 'style',
          severity: 'warning',
          line: index + 1,
          message: 'Line too long',
          suggestion: 'Break long lines for better readability',
          autoFixable: false
        });
      }
    });

    return {
      quality: {
        score: 75, // Default score
        issues,
        suggestions: ['Consider using AI-powered analysis for detailed insights']
      },
      security: {
        vulnerabilities: [],
        riskLevel: 'low'
      },
      performance: {
        bottlenecks: [],
        optimizations: []
      },
      architecture: {
        patterns: [],
        recommendations: [],
        complexity: 5
      },
      autoFixes: []
    };
  }
}

export const codeIntelligenceService = new CodeIntelligenceService();
export default codeIntelligenceService;