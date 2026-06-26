import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Lecture from '../../../../models/Lecture';

// Generate a random 6-character uppercase alphanumeric code
function generateRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req, props) {
  try {
    const params = await props.params;
    await connectToDatabase();
    
    const code = generateRandomCode();
    // 2 minutes validity
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    
    const lecture = await Lecture.findByIdAndUpdate(
      params.id,
      { activeCode: code, codeExpiresAt: expiresAt },
      { returnDocument: 'after' }
    );
    
    if (!lecture) {
      return NextResponse.json({ success: false, message: 'Lecture not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, code, expiresAt }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req, props) {
  try {
    const params = await props.params;
    await connectToDatabase();
    
    const lecture = await Lecture.findById(params.id);
    if (!lecture) {
      return NextResponse.json({ success: false, message: 'Lecture not found' }, { status: 404 });
    }
    
    // Check if code is expired
    const isExpired = lecture.codeExpiresAt ? new Date() > new Date(lecture.codeExpiresAt) : true;
    
    return NextResponse.json({
      success: true,
      activeCode: isExpired ? null : lecture.activeCode,
      codeExpiresAt: isExpired ? null : lecture.codeExpiresAt,
      isExpired
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
