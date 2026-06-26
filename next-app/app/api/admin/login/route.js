import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Teacher from '../../../models/Teacher';
import Classroom from '../../../models/Classroom';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    await connectToDatabase();

    const teacher = await Teacher.findOne({ email, password }); // In production, verify hash
    if (!teacher) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const classroom = await Classroom.findOne({ teacher_id: teacher._id });

    return NextResponse.json({ success: true, teacher, classroom }, { status: 200 });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
