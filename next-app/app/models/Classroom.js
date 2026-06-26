import mongoose from 'mongoose';

const ClassroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  student_emails: {
    type: [String],
    default: [],
  }
});

export default mongoose.models.Classroom || mongoose.model('Classroom', ClassroomSchema);
