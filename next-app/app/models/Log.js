import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
  },
  lecture_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Log || mongoose.model('Log', LogSchema);
