
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PROMPTS, queryAI } from '@/lib/ai';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { strategyName, content } = await req.json();
    if (!strategyName || !content) {
      return NextResponse.json({ message: 'Strategy name and content are required' }, { status: 400 });
    }

    const prompt = PROMPTS.GENERATE_CHECKLIST(strategyName, content);
    const aiResponseStr = await queryAI(prompt);
    
    let checklist: string[] = [];
    if (aiResponseStr) {
        try {
            const cleanStr = aiResponseStr.replace(/```json\n|\n```/g, "").trim();
            checklist = JSON.parse(cleanStr);
        } catch (e) {
            console.error("Failed to parse AI JSON", e);
            // Fallback: try to extract strings if it's not a perfect JSON array
            const matches = aiResponseStr.match(/"([^"]+)"/g);
            if (matches) {
                checklist = matches.map(m => m.replace(/"/g, ''));
            }
        }
    }

    if (!Array.isArray(checklist) || checklist.length === 0) {
        return NextResponse.json({ message: 'Failed to generate a valid checklist' }, { status: 500 });
    }

    return NextResponse.json({ checklist });
  } catch (error) {
    console.error('Error generating checklist:', error);
    return NextResponse.json({ message: 'Failed to generate checklist' }, { status: 500 });
  }
}
