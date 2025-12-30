import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Trade from '@/lib/models/Trade';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await dbConnect();
    
    const trade = await Trade.findOne({ 
      _id: id, 
      // @ts-ignore
      userId: session.user.id 
    })
    .populate('strategyId', 'name isTemplate')
    .populate('portfolioId', 'name accountType')
    .lean();

    if (!trade) {
      return NextResponse.json({ message: 'Trade not found' }, { status: 404 });
    }

    // Transform the populated strategy and portfolio data
    const transformedTrade = {
      ...trade,
      strategy: trade.strategyId ? {
        _id: trade.strategyId._id,
        name: trade.strategyId.name,
        isTemplate: trade.strategyId.isTemplate
      } : null,
      portfolio: trade.portfolioId ? {
        _id: trade.portfolioId._id,
        name: trade.portfolioId.name,
        accountType: trade.portfolioId.accountType
      } : null
    };

    return NextResponse.json(transformedTrade);
  } catch (error) {
    console.error('Fetch trade error:', error);
    return NextResponse.json({ message: 'Error fetching trade' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    await dbConnect();

    // Calculate derived fields
    const updateData = { ...body };
    
    // Recalculate PnL if prices changed
    if (updateData.entryPrice && updateData.exitPrice && updateData.quantity && updateData.direction) {
      const pnl = updateData.direction === 'long' 
        ? (updateData.exitPrice - updateData.entryPrice) * updateData.quantity 
        : (updateData.entryPrice - updateData.exitPrice) * updateData.quantity;
      
      updateData.pnl = pnl - (updateData.fees || 0);
      updateData.grossPnl = pnl;
    }

    // Recalculate R-Multiple
    if (updateData.stopLoss && updateData.entryPrice && updateData.exitPrice && updateData.direction) {
      const risk = Math.abs(updateData.entryPrice - updateData.stopLoss);
      if (risk > 0) {
        const reward = updateData.direction === 'long' 
          ? updateData.exitPrice - updateData.entryPrice 
          : updateData.entryPrice - updateData.exitPrice;
        updateData.rMultiple = reward / risk;
        updateData.actualRR = reward / risk;
      }
    }

    const trade = await Trade.findOneAndUpdate(
      { 
        _id: id, 
        // @ts-ignore
        userId: session.user.id 
      },
      { $set: updateData },
      { new: true }
    )
    .populate('strategyId', 'name isTemplate')
    .populate('portfolioId', 'name accountType');

    if (!trade) {
      return NextResponse.json({ message: 'Trade not found' }, { status: 404 });
    }

    return NextResponse.json(trade);
  } catch (error) {
    console.error('Update trade error:', error);
    return NextResponse.json({ message: 'Error updating trade' }, { status: 500 });
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

  try {
    await dbConnect();
    
    const trade = await Trade.findOneAndDelete({ 
      _id: id, 
      // @ts-ignore
      userId: session.user.id 
    });

    if (!trade) {
      return NextResponse.json({ message: 'Trade not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Trade deleted successfully' });
  } catch (error) {
    console.error('Delete trade error:', error);
    return NextResponse.json({ message: 'Error deleting trade' }, { status: 500 });
  }
}