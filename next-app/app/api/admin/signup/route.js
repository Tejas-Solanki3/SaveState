import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Teacher from '../../../models/Teacher';
import Classroom from '../../../models/Classroom';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if teacher already exists
    const existing = await Teacher.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 400 });
    }

    const newTeacher = await Teacher.create({ name, email, password }); // In production, hash the password!

    // Automatically create a default classroom for the teacher
    const defaultClassroom = await Classroom.create({
      name: `${name}'s Classroom`,
      teacher_id: newTeacher._id,
      student_emails: []
    });

    return NextResponse.json({ success: true, teacher: newTeacher, classroom: defaultClassroom }, { status: 201 });
  } catch (error) {
    console.error('Admin signup error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
