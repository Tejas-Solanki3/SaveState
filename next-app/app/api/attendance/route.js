import { NextResponse } from 'next/server';
import connectToDatabase from '../../lib/mongodb';
import Log from '../../models/Log';

export async function POST(request) {
  try {
    const { student_id } = await request.json();

    if (!student_id) {
      return NextResponse.json({ error: 'student_id is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    const newLog = await Log.create({ student_id });
    
    return NextResponse.json({ success: true, log: newLog }, { status: 201 });
  } catch (error) {
    console.error('Error logging attendance:', error);
    return NextResponse.json({ error: 'Failed to log attendance' }, { status: 500 });
  }
}
