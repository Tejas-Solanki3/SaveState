import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/mongodb';
import Log from '../../../../../models/Log';
import Classroom from '../../../../../models/Classroom';
import User from '../../../../../models/User';

export async function GET(req, props) {
  try {
    const params = await props.params;
    const lecture_id = params.id;
    const { searchParams } = new URL(req.url);
    const classroom_id = searchParams.get('classroom_id');
    
    await connectToDatabase();
    
    // Get all student emails allowed in this classroom
    const classroom = await Classroom.findById(classroom_id);
    const allowedEmails = classroom.student_emails;
    
    // Fetch all students whose emails are in allowedEmails
    const students = await User.find({ email: { $in: allowedEmails } }).select('name email student_id selfie_base64');
    
    // Fetch all logs for this lecture
    const logs = await Log.find({ lecture_id });
    
    // Map students to their attendance status
    const attendance = students.map(student => {
      const log = logs.find(l => l.student_id === student.student_id);
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        student_id: student.student_id,
        selfie_base64: student.selfie_base64,
        status: log ? 'Present' : 'Absent',
        timestamp: log ? log.timestamp : null
      };
    });
    
    return NextResponse.json({ success: true, attendance }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
