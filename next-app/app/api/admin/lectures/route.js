import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Lecture from '../../../models/Lecture';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const teacher_id = searchParams.get('teacher_id');
    const classroom_id = searchParams.get('classroom_id');
    
    await connectToDatabase();
    
    let query = {
      startTime: { $exists: true },
      endTime: { $exists: true }
    };
    if (teacher_id) query.teacher_id = teacher_id;
    if (classroom_id) query.classroom_id = classroom_id;
    
    const lectures = await Lecture.find(query).sort({ _id: -1 });
    
    // Dynamically compute status based on real-time clock
    const now = new Date();
    
    const computedLectures = lectures.map(l => {
      const lectureStart = new Date(`${l.date}T${l.startTime}`);
      const lectureEnd = new Date(`${l.date}T${l.endTime}`);
      
      let status = 'upcoming';
      if (now >= lectureStart && now <= lectureEnd) {
        status = 'active';
      } else if (now > lectureEnd) {
        status = 'completed';
      }
      
      return {
        _id: l._id,
        name: l.name,
        date: l.date,
        startTime: l.startTime,
        endTime: l.endTime,
        status
      };
    });
    
    return NextResponse.json({ success: true, lectures: computedLectures }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, date, startTime, endTime, teacher_id, classroom_id } = await req.json();
    await connectToDatabase();
    
    const lecture = await Lecture.create({
      name, date, startTime, endTime, teacher_id, classroom_id
    });
    
    return NextResponse.json({ success: true, lecture }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
