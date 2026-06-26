import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Classroom from '../../../models/Classroom';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const teacher_id = searchParams.get('teacher_id');
    
    await connectToDatabase();
    const classroom = await Classroom.findOne({ teacher_id });
    
    return NextResponse.json({ success: true, classroom }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { teacher_id, email } = await req.json();
    await connectToDatabase();
    
    const classroom = await Classroom.findOne({ teacher_id });
    if (!classroom.student_emails.includes(email)) {
      classroom.student_emails.push(email);
      await classroom.save();
    }
    
    return NextResponse.json({ success: true, classroom }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const teacher_id = searchParams.get('teacher_id');
    const email = searchParams.get('email');
    
    await connectToDatabase();
    const classroom = await Classroom.findOne({ teacher_id });
    
    classroom.student_emails = classroom.student_emails.filter(e => e !== email);
    await classroom.save();
    
    return NextResponse.json({ success: true, classroom }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
