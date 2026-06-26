import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Lecture from '../../../../models/Lecture';

export async function POST(req) {
  try {
    const { lecture_id, code } = await req.json();
    
    if (!lecture_id || !code) {
      return NextResponse.json({ success: false, message: 'lecture_id and code are required' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    const lecture = await Lecture.findById(lecture_id);
    if (!lecture) {
      return NextResponse.json({ success: false, message: 'Lecture not found' }, { status: 404 });
    }
    
    if (!lecture.activeCode || lecture.activeCode !== code.toUpperCase().trim()) {
      return NextResponse.json({ success: false, message: 'Invalid code' }, { status: 400 });
    }
    
    const isExpired = lecture.codeExpiresAt ? new Date() > new Date(lecture.codeExpiresAt) : true;
    if (isExpired) {
      return NextResponse.json({ success: false, message: 'Code has expired' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: 'Code is valid' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
