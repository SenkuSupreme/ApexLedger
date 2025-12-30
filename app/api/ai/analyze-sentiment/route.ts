import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const SYSTEM_PROMPT = `You are a professional AI Trading Analyst and Performance Coach operating at institutional standards.

Your primary function is to analyze trading data, evaluate execution quality, and deliver objective, actionable feedback that improves consistency and protects capital.

Core Responsibilities:
- Evaluate trade setup quality, entry logic, stop-loss validity, risk-to-reward, and exit execution
- Classify trades as high-quality or low-quality based on rule adherence, not profit outcome
- Identify execution errors (late entry, early exit, SL tampering, over-leverage)
- Assess discipline and decision-making patterns
- Provide corrective, rule-based behavioral guidance

Output Requirements (MANDATORY):
All responses must follow this exact structure with clear section headers:

EXECUTIVE SUMMARY:
[Brief overview of trade performance and key findings]

KEY PERFORMANCE METRICS:
[Quantified analysis of trade metrics and performance indicators]

CRITICAL ERRORS & RULE VIOLATIONS:
[Specific mistakes and rule violations identified]

BEHAVIORAL ASSESSMENT:
[Analysis of emotional state and decision-making patterns]

WHAT IS WORKING:
[Positive aspects to maintain and reinforce]

WHAT MUST STOP IMMEDIATELY:
[Critical issues that need immediate correction]

ACTION PLAN (Next Trading Cycle):
[Specific, actionable steps for improvement]

FINAL TRADER SCORE (0-100):
• Overall Performance: [X]/100
• Risk Discipline: [X]/100  
• Execution Quality: [X]/100
• Consistency: [X]/100

Scoring Guidelines:
- Risk Discipline: 90-100 (Perfect SL/TP), 70-89 (Good risk mgmt), 50-69 (Basic controls), <50 (Poor/No controls)
- Execution Quality: Based on setup grade, entry timing, exit discipline (Setup Grade * 20)
- Consistency: Based on adherence to strategy rules and emotional control
- Overall: Average of all components

Always provide specific numerical scores for each component. Never use 0 unless there's a complete absence of the measured quality.

Operating Principle: Behave as a fund manager reviewing a trader's account. Focus on long-term survivability, rule compliance, and consistent edge execution.`;

interface AnalysisSections {
  executiveSummary?: string;
  keyMetrics?: string;
  criticalErrors?: string;
  riskStatus?: string;
  behavioralAssessment?: string;
  whatIsWorking?: string;
  whatMustStop?: string;
  actionPlan?: string;
  traderScore?: {
    overall: number;
    riskDiscipline: number;
    executionQuality: number;
    consistency: number;
    professionalism: number;
  };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { tradeData, allTradeData } = await req.json();
    
    if (!tradeData) {
      return NextResponse.json({ message: 'No trade data provided' }, { status: 400 });
    }

    // Prepare comprehensive trade analysis data
    const analysisData = {
      currentTrade: {
        symbol: tradeData.symbol,
        direction: tradeData.direction,
        entryPrice: Number(tradeData.entryPrice) || 0,
        exitPrice: Number(tradeData.exitPrice) || 0,
        stopLoss: Number(tradeData.stopLoss) || 0,
        takeProfit: Number(tradeData.takeProfit) || 0,
        quantity: Number(tradeData.quantity) || 0,
        pnl: Number(tradeData.pnl) || 0,
        grossPnl: Number(tradeData.grossPnl) || 0,
        fees: Number(tradeData.fees) || 0,
        rMultiple: Number(tradeData.rMultiple) || 0,
        actualRR: Number(tradeData.actualRR) || 0,
        targetRR: Number(tradeData.targetRR) || 0,
        emotion: tradeData.emotion,
        setupGrade: Number(tradeData.setupGrade) || 3,
        outcome: tradeData.outcome,
        strategy: tradeData.strategy?.name,
        notes: tradeData.notes || tradeData.description,
        mistakes: tradeData.mistakes,
        marketCondition: tradeData.marketCondition,
        tradeType: tradeData.tradeType,
        sessions: tradeData.sessions,
        entrySignal: tradeData.entrySignal,
        confluences: tradeData.confluences,
        keyLevels: tradeData.keyLevels,
        timestampEntry: tradeData.timestampEntry,
        timestampExit: tradeData.timestampExit
      },
      accountContext: allTradeData || {}
    };

    // Best free models from OpenRouter (in order of preference)
    const freeModels = [
      'meta-llama/llama-3.2-3b-instruct:free',
      'microsoft/phi-3-mini-128k-instruct:free', 
      'huggingfaceh4/zephyr-7b-beta:free',
      'openchat/openchat-7b:free',
      'gryphe/mythomist-7b:free'
    ];

    let analysis = null;
    let usedModel = null;

    // Try each free model until one works
    for (const model of freeModels) {
      try {
        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'X-Title': 'Trading Journal AI Analysis'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: SYSTEM_PROMPT
              },
              {
                role: 'user',
                content: `Analyze this trading execution and provide professional feedback:

TRADE DETAILS:
${JSON.stringify(analysisData.currentTrade, null, 2)}

ACCOUNT CONTEXT:
${JSON.stringify(analysisData.accountContext, null, 2)}

Please provide a comprehensive analysis following the mandatory output structure.`
              }
            ],
            temperature: 0.3,
            max_tokens: 2000,
            top_p: 0.9
          })
        });

        if (openRouterResponse.ok) {
          const aiResponse = await openRouterResponse.json();
          const responseText = aiResponse.choices[0]?.message?.content;
          
          if (responseText && responseText.length > 100) {
            analysis = responseText;
            usedModel = model;
            break;
          }
        }
      } catch (error) {
        console.error(`Failed with model ${model}:`, error);
        continue;
      }
    }

    if (!analysis) {
      // Fallback to enhanced analysis if all OpenRouter models fail
      console.error('All OpenRouter models failed, using enhanced fallback analysis');
      return getFallbackAnalysis(tradeData);
    }

    // Parse the structured response
    const sections = parseAnalysisResponse(analysis);

    return NextResponse.json({
      success: true,
      analysis: {
        fullAnalysis: analysis,
        sections: sections,
        model: usedModel || 'fallback',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Analysis error:', error);
    return NextResponse.json({
      success: false,
      analysis: {
        fullAnalysis: "Analysis temporarily unavailable. Please try again later.",
        sections: {
          traderScore: { overall: 0, riskDiscipline: 0, executionQuality: 0, consistency: 0 }
        },
        model: 'fallback',
        timestamp: new Date().toISOString()
      }
    });
  }
}

function getFallbackAnalysis(tradeData: any) {
  const pnl = Number(tradeData?.pnl) || 0;
  const rMultiple = Number(tradeData?.rMultiple) || 0;
  const emotion = tradeData?.emotion || 'neutral';
  const setupGrade = Number(tradeData?.setupGrade) || 3;
  const hasStopLoss = !!tradeData.stopLoss;
  const hasTakeProfit = !!tradeData.takeProfit;
  
  // Calculate realistic scores based on actual trade data
  const riskScore = hasStopLoss ? (hasTakeProfit ? 85 : 75) : 35;
  const executionScore = Math.min(100, Math.max(20, setupGrade * 20));
  const consistencyScore = setupGrade >= 4 ? 85 : setupGrade >= 3 ? 70 : setupGrade >= 2 ? 55 : 40;
  
  const emotionalScore = emotion === 'calm' ? 90 :
                        emotion === 'confident' ? 85 :
                        emotion === 'neutral' ? 75 :
                        emotion === 'nervous' ? 60 :
                        emotion === 'excited' ? 65 :
                        emotion === 'frustrated' ? 45 :
                        emotion === 'fearful' ? 40 :
                        emotion === 'greedy' ? 35 : 70;
  
  const overallScore = Math.round((riskScore + executionScore + consistencyScore + emotionalScore) / 4);
  
  const isWin = pnl > 0;
  const isLoss = pnl < 0;
  
  const fallbackAnalysis = `PROFESSIONAL TRADING ANALYSIS - ENHANCED FALLBACK

EXECUTIVE SUMMARY:
Trade executed with ${isWin ? 'profitable' : isLoss ? 'loss' : 'breakeven'} outcome (${rMultiple.toFixed(2)}R). 
Setup quality rated ${setupGrade}/5. Emotional state: ${emotion}. 
${hasStopLoss ? 'Risk management present' : 'WARNING: No stop loss detected'}.

KEY PERFORMANCE METRICS:
• P&L: $${pnl.toFixed(2)}
• R-Multiple: ${rMultiple.toFixed(2)}R
• Setup Grade: ${setupGrade}/5 (${setupGrade >= 4 ? 'Excellent' : setupGrade >= 3 ? 'Good' : 'Needs Improvement'})
• Risk Management: ${hasStopLoss ? 'Stop Loss Set' : 'NO STOP LOSS'}
• Take Profit: ${hasTakeProfit ? 'Target Set' : 'No Target'}

CRITICAL ERRORS & RULE VIOLATIONS:
${!hasStopLoss ? '⚠️ CRITICAL: No stop loss - Violates basic risk management' : 'No critical violations detected'}
${emotion === 'greedy' ? '⚠️ Emotional bias detected - Greed can lead to overtrading' : ''}
${emotion === 'fearful' ? '⚠️ Fear-based execution - May cause premature exits' : ''}
${setupGrade < 3 ? '⚠️ Low setup quality - Trading below standard' : ''}

BEHAVIORAL ASSESSMENT:
Emotional State: ${emotion.toUpperCase()}
${emotion === 'confident' ? 'Positive mindset - maintain discipline' : 
  emotion === 'calm' ? 'Excellent emotional control' :
  emotion === 'nervous' ? 'Anxiety detected - may affect decision making' :
  emotion === 'fearful' ? 'Fear present - risk of premature exits' :
  emotion === 'greedy' ? 'Greed detected - high risk of overtrading' :
  emotion === 'frustrated' ? 'Frustration - risk of revenge trading' :
  'Neutral emotional state'}

WHAT MUST STOP IMMEDIATELY:
${!hasStopLoss ? '🚫 Trading without stop losses' : 'Continue current risk management'}
${emotion === 'greedy' ? '🚫 Greed-driven decision making' : ''}
${emotion === 'fearful' ? '🚫 Fear-based trade management' : ''}
${setupGrade < 3 ? '🚫 Taking low-quality setups' : ''}

ACTION PLAN (Next Trading Cycle):
1. ${!hasStopLoss ? 'MANDATORY: Set stop loss on every trade' : 'Continue using stop losses'}
2. ${!hasTakeProfit ? 'Set clear take profit targets for better R:R' : 'Maintain target discipline'}
3. ${setupGrade < 3 ? 'Only trade setups rated 3+ quality' : 'Maintain setup standards'}
4. ${['nervous', 'fearful', 'greedy', 'frustrated'].includes(emotion) ? 'Work on emotional discipline' : 'Maintain current emotional approach'}

FINAL TRADER SCORE (0-100):
• Overall Performance: ${overallScore}/100
• Risk Discipline: ${riskScore}/100
• Execution Quality: ${executionScore}/100
• Emotional Control: ${emotionalScore}/100`;

  const sections: AnalysisSections = {
    executiveSummary: `Trade ${isWin ? 'profitable' : isLoss ? 'loss' : 'breakeven'} with ${rMultiple.toFixed(2)}R outcome. Emotional state: ${emotion}. ${hasStopLoss ? 'Risk management present' : 'WARNING: No stop loss detected'}.`,
    keyMetrics: `P&L: $${pnl.toFixed(2)}, R-Multiple: ${rMultiple.toFixed(2)}R, Setup Grade: ${setupGrade}/5`,
    criticalErrors: !hasStopLoss ? 'No stop loss - Critical risk management violation' : 'No critical errors detected',
    behavioralAssessment: `Emotional state: ${emotion}. ${['calm', 'confident'].includes(emotion) ? 'Good emotional control' : 'Emotional discipline needs attention'}`,
    whatMustStop: !hasStopLoss ? 'Trading without stop losses' : emotion === 'greedy' ? 'Greed-driven decisions' : 'Continue current approach',
    actionPlan: `1. ${!hasStopLoss ? 'Set stop losses' : 'Maintain risk controls'} 2. ${setupGrade < 3 ? 'Improve setup quality' : 'Maintain standards'} 3. Monitor emotional state`,
    traderScore: {
      overall: overallScore,
      riskDiscipline: riskScore,
      executionQuality: executionScore,
      consistency: consistencyScore,
      professionalism: emotionalScore
    }
  };

  return NextResponse.json({
    success: true,
    analysis: {
      fullAnalysis: fallbackAnalysis,
      sections: sections,
      model: 'fallback-enhanced',
      timestamp: new Date().toISOString()
    }
  });
}

function parseAnalysisResponse(analysis: string): AnalysisSections {
  const sections: AnalysisSections = {};
  
  const lines = analysis.split('\n');
  let currentSection = '';
  let currentContent = '';
  
  for (const line of lines) {
    if (line.includes('Executive Summary') || line.includes('EXECUTIVE SUMMARY')) {
      if (currentSection && currentSection !== 'traderScore') {
        (sections as any)[currentSection] = currentContent.trim();
      }
      currentSection = 'executiveSummary';
      currentContent = '';
    } else if (line.includes('Key Performance Metrics') || line.includes('KEY PERFORMANCE METRICS')) {
      if (currentSection && currentSection !== 'traderScore') {
        (sections as any)[currentSection] = currentContent.trim();
      }
      currentSection = 'keyMetrics';
      currentContent = '';
    } else if (line.includes('Critical Errors') || line.includes('CRITICAL ERRORS')) {
      if (currentSection && currentSection !== 'traderScore') {
        (sections as any)[currentSection] = currentContent.trim();
      }
      currentSection = 'criticalErrors';
      currentContent = '';
    } else if (line.includes('Risk & Drawdown Status') || line.includes('RISK & DRAWDOWN STATUS')) {
      if (currentSection && currentSection !== 'traderScore') {
        (sections as any)[currentSection] = currentContent.trim();
      }
      currentSection = 'riskStatus';
      currentContent = '';
    } else if (line.includes('Behavioral Assessment') || line.includes('BEHAVIORAL ASSESSMENT')) {
      if (currentSection && currentSection !== 'traderScore') {
        (sections as any)[currentSection] = currentContent.trim();
      }
      currentSection = 'behavioralAssessment';
      currentContent = '';
    } else if (line.includes('What Is Working') || line.includes('WHAT IS WORKING')) {
      if (currentSection && currentSection !== 'traderScore') {
        (sections as any)[currentSection] = currentContent.trim();
      }
      currentSection = 'whatIsWorking';
      currentContent = '';
    } else if (line.includes('What Must Stop') || line.includes('WHAT MUST STOP')) {
      if (currentSection && currentSection !== 'traderScore') {
        (sections as any)[currentSection] = currentContent.trim();
      }
      currentSection = 'whatMustStop';
      currentContent = '';
    } else if (line.includes('Action Plan') || line.includes('ACTION PLAN')) {
      if (currentSection && currentSection !== 'traderScore') {
        (sections as any)[currentSection] = currentContent.trim();
      }
      currentSection = 'actionPlan';
      currentContent = '';
    } else if (line.includes('Final Trader Score') || line.includes('FINAL TRADER SCORE')) {
      if (currentSection && currentSection !== 'traderScore') {
        (sections as any)[currentSection] = currentContent.trim();
      }
      currentSection = 'traderScore';
      currentContent = '';
    } else {
      currentContent += line + '\n';
    }
  }
  
  if (currentSection) {
    if (currentSection === 'traderScore') {
      // Parse trader score from text
      const scoreText = currentContent.trim();
      const scores = {
        overall: extractScore(scoreText, 'Overall Performance') || extractScore(scoreText, 'overall') || 0,
        riskDiscipline: extractScore(scoreText, 'Risk Discipline') || 0,
        executionQuality: extractScore(scoreText, 'Execution Quality') || 0,
        consistency: extractScore(scoreText, 'Consistency') || 0,
        professionalism: extractScore(scoreText, 'Professionalism') || extractScore(scoreText, 'Emotional Control') || 0
      };
      sections.traderScore = scores;
    } else {
      (sections as any)[currentSection] = currentContent.trim();
    }
  }
  
  return sections;
}

function extractScore(text: string, metric: string): number {
  // Look for patterns like "Risk Discipline: 85/100" or "• Risk Discipline: 85/100"
  const patterns = [
    new RegExp(`${metric}[:\\s]+([0-9]+)(?:/100)?`, 'i'),
    new RegExp(`•\\s*${metric}[:\\s]+([0-9]+)(?:/100)?`, 'i'),
    new RegExp(`${metric.replace(' ', '\\s*')}[:\\s]+([0-9]+)(?:/100)?`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const score = parseInt(match[1]);
      return isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
    }
  }
  
  return 0;
}