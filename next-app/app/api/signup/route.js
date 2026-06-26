import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongodb';
import User from '@/app/models/User';



export async function POST(req) {
  try {
    const { name, email, student_id, selfie_base64 } = await req.json();

    if (!name || !email || !student_id || !selfie_base64) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ student_id });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Student ID already registered' }, { status: 400 });
    }

    const newUser = await User.create({
      name,
      email,
      student_id,
      selfie_base64
    });

    // Tell the Python AI Engine to re-fetch users from MongoDB so it knows about this new face
    try {
      const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://127.0.0.1:5001';
      await fetch(`${aiEngineUrl}/sync`, { method: 'POST' });
    } catch (e) {
      console.warn('Python AI engine might not be running or failed to sync', e.message);
    }

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
