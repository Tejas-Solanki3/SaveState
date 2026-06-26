import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Classroom from '../../../models/Classroom';
import Lecture from '../../../models/Lecture';
import Log from '../../../models/Log';
import Teacher from '../../../models/Teacher';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const student_id = searchParams.get('student_id');
    
    if (!email || !student_id) {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    // Find classrooms where this student is whitelisted
    const classrooms = await Classroom.find({ student_emails: email });
    const classroomIds = classrooms.map(c => c._id);
    
    if (classroomIds.length === 0) {
      return NextResponse.json({ success: true, lectures: [] }, { status: 200 });
    }
    
    // Find all lectures for these classrooms
    const allLectures = await Lecture.find({
      classroom_id: { $in: classroomIds },
      startTime: { $exists: true },
      endTime: { $exists: true }
    }).populate('teacher_id', 'name');
    
    const now = new Date();
    
    // Dynamically filter active lectures based on real-time clock
    const activeLectures = allLectures.filter(l => {
      const lectureStart = new Date(`${l.date}T${l.startTime}`);
      const lectureEnd = new Date(`${l.date}T${l.endTime}`);
      return now >= lectureStart && now <= lectureEnd;
    });

    if (activeLectures.length === 0) {
      return NextResponse.json({ success: true, lectures: [] }, { status: 200 });
    }
    
    // Check if the student has already marked attendance for these lectures
    const logs = await Log.find({
      student_id,
      lecture_id: { $in: activeLectures.map(l => l._id) }
    });
    const attendedLectureIds = logs
      .filter(l => l.lecture_id)
      .map(l => l.lecture_id.toString());
    
    const enrichedLectures = activeLectures.map(l => ({
      _id: l._id,
      name: l.name,
      date: l.date,
      startTime: l.startTime,
      endTime: l.endTime,
      teacher_name: l.teacher_id?.name || 'Professor',
      has_attended: attendedLectureIds.includes(l._id.toString())
    }));
    
    return NextResponse.json({ success: true, lectures: enrichedLectures }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
