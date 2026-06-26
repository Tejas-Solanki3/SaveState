import { NextResponse } from 'next/server';
import connectToDatabase from '../../lib/mongodb';
import Log from '../../models/Log';

export async function GET() {
  try {
    await connectToDatabase();
    
    const logs = await Log.aggregate([
      { $sort: { timestamp: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: 'student_id',
          foreignField: 'student_id',
          as: 'user_info'
        }
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$user_info', 0] }
        }
      },
      {
        $project: {
          user_info: 0
        }
      }
    ]);
    
    return NextResponse.json({ success: true, logs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { student_id, lecture_id } = await req.json();

    if (!student_id || !lecture_id) {
      return NextResponse.json({ success: false, message: 'student_id and lecture_id are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if log already exists for this lecture to prevent duplicates
    const existingLog = await Log.findOne({ student_id, lecture_id });
    if (existingLog) {
      return NextResponse.json({ success: true, log: existingLog, message: 'Already marked present' }, { status: 200 });
    }

    const newLog = await Log.create({
      student_id,
      lecture_id,
      timestamp: new Date()
    });

    return NextResponse.json({ success: true, log: newLog }, { status: 201 });
  } catch (error) {
    console.error('Error logging attendance:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
