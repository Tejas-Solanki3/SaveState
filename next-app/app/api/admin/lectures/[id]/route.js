import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Lecture from '../../../../models/Lecture';

export async function PATCH(req, props) {
  try {
    const params = await props.params;
    const { status } = await req.json();
    await connectToDatabase();
    
    const lecture = await Lecture.findByIdAndUpdate(params.id, { status }, { returnDocument: 'after' });
    return NextResponse.json({ success: true, lecture }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, props) {
  try {
    const params = await props.params;
    await connectToDatabase();
    await Lecture.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
