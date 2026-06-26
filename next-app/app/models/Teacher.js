import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  }
});

export default mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
