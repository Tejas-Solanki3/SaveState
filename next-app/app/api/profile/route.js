import { NextResponse } from 'next/server';
import connectToDatabase from '../../lib/mongodb';
import User from '../../models/User';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const student_id = searchParams.get('student_id');

    if (!student_id) {
      return NextResponse.json({ success: false, message: 'student_id is required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ student_id });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
