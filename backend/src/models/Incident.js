import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: [true, 'Incident reference ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title must not exceed 100 characters'],
    },

    category: {
      type: String,
      required: [true, 'Incident category is required'],
      enum: {
        values: ['Accident', 'Fire', 'Medical Emergency', 'Crime', 'Natural Disaster', 'Other'],
        message: 'Invalid incident category',
      },
    },

    description: {
      type: String,
      required: [true, 'Incident description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description must not exceed 2000 characters'],
    },

    severity: {
      type: String,
      required: [true, 'Incident severity level is required'],
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: 'Invalid severity level',
      },
    },

    location: {
      address: {
        type: String,
        trim: true,
        default: 'Location details provided via coordinates',
      },
      latitude: {
        type: Number,
        required: [true, 'Latitude coordinate is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude coordinate is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter user identity is required'],
    },

    status: {
      type: String,
      enum: {
        values: ['reported', 'in_progress', 'resolved', 'dismissed'],
        message: 'Invalid incident status',
      },
      default: 'reported',
    },

    aiClassification: {
      category: {
        type: String,
        enum: ['Accident', 'Fire', 'Medical Emergency', 'Crime', 'Natural Disaster', 'Other'],
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
      },
      reasoning: {
        type: String,
        trim: true,
      },
      severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
      },
      severityConfidence: {
        type: Number,
        min: 0,
        max: 1,
      },
      severityReasoning: {
        type: String,
        trim: true,
      },
      classifiedAt: {
        type: Date,
        default: Date.now,
      },
    },

    aiAssessment: {
      category: String,
      categoryConfidence: Number,
      categoryReasoning: String,
      severity: String,
      severityConfidence: Number,
      severityReasoning: String,
      assessedAt: {
        type: Date,
        default: Date.now,
      },
    },

    safetyRecommendations: {
      recommendations: [
        {
          type: String,
          trim: true,
        },
      ],
      warning: {
        type: String,
        trim: true,
      },
      isFallback: {
        type: Boolean,
        default: false,
      },
      generatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;
