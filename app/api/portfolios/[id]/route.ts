
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Portfolio from '@/lib/models/Portfolio';
import Trade from '@/lib/models/Trade';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
    const { 
        name, 
        initialBalance, 
        currentBalance, 
        goal, 
        deposits, 
        withdrawals, 
        description, 
        accountType 
    } = body;

    await dbConnect();
    // @ts-ignore
    const userId = session.user.id;

    try {
        // Ensure the portfolio belongs to the user
        const portfolio = await Portfolio.findOne({ _id: id, userId });
        
        if (!portfolio) {
            return NextResponse.json({ message: 'Portfolio not found' }, { status: 404 });
        }

        // Update portfolio
        const updatedPortfolio = await Portfolio.findOneAndUpdate(
            { _id: id, userId },
            { 
                ...(name !== undefined && { name }),
                ...(initialBalance !== undefined && { initialBalance: Number(initialBalance) }),
                ...(currentBalance !== undefined && { currentBalance: Number(currentBalance) }),
                ...(goal !== undefined && { goal: Number(goal) }),
                ...(deposits !== undefined && { deposits: Number(deposits) }),
                ...(withdrawals !== undefined && { withdrawals: Number(withdrawals) }),
                ...(description !== undefined && { description }),
                ...(accountType !== undefined && { accountType })
            },
            { new: true }
        );

    return NextResponse.json(updatedPortfolio);
  } catch (error) {
    console.error('Failed to update portfolio:', error);
    return NextResponse.json({ message: 'Error updating portfolio' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await dbConnect();
  // @ts-ignore
  const userId = session.user.id;

  try {
    // Ensure the portfolio belongs to the user
    const portfolio = await Portfolio.findOne({ _id: id, userId });
    
    if (!portfolio) {
      return NextResponse.json({ message: 'Portfolio not found' }, { status: 404 });
    }

    // Delete all trades associated with this portfolio
    await Trade.deleteMany({ portfolioId: id, userId });

    // Delete the portfolio
    await Portfolio.deleteOne({ _id: id, userId });

    return NextResponse.json({ message: 'Portfolio and associated trades deleted successfully' });
  } catch (error) {
    console.error('Failed to delete portfolio:', error);
    return NextResponse.json({ message: 'Error deleting portfolio' }, { status: 500 });
  }
}
