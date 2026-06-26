import mongoose from 'mongoose';

const LectureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  classroom_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true,
  },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  activeCode: {
    type: String,
    default: null,
  },
  codeExpiresAt: {
    type: Date,
    default: null,
  }
});

export default mongoose.models.Lecture || mongoose.model('Lecture', LectureSchema);
