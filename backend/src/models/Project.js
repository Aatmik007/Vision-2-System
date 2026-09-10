import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Project description / requirement is required'],
      trim: true
    },
    projectType: {
      type: String,
      enum: ['Web Application', 'SaaS', 'E-commerce', 'Mobile Application', 'Portfolio', 'Other'],
      default: 'Web Application'
    },
    preferredStack: {
      type: String,
      enum: ['Auto Detect', 'MERN', 'Java + Spring Boot', 'Python', 'Other'],
      default: 'Auto Detect'
    },
    generatedBlueprint: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
