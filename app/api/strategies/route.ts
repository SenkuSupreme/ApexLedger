
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Strategy from '@/lib/models/Strategy';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (id) {
            const strategy = await Strategy.findOne({ _id: id, userId: session.user.id }).lean();
            if (!strategy) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            return NextResponse.json(strategy);
        }

        const strategies = await Strategy.find({ userId: session.user.id }).sort({ updatedAt: -1 }).lean();
        return NextResponse.json(strategies);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        await dbConnect();

        const strategy = await Strategy.create({
            ...body,
            userId: session.user.id
        });

        return NextResponse.json(strategy);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { _id, userId, ...updateData } = body;

        if (!_id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await dbConnect();
        const strategy = await Strategy.findOneAndUpdate(
            { _id, userId: session.user.id },
            { $set: updateData },
            { new: true }
        );

        if (!strategy) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(strategy);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await dbConnect();
        const deleted = await Strategy.findOneAndDelete({ _id: id, userId: session.user.id });

        if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
