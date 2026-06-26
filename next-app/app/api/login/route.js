import { NextResponse } from 'next/server';
import connectToDatabase from '../../lib/mongodb';
import User from '../../models/User';

export async function POST(req) {
  try {
    const { student_id } = await req.json();

    if (!student_id) {
      return NextResponse.json({ success: false, message: 'student_id is required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ student_id });
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid Student ID' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
