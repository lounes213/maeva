import mongoose, { Schema, Model, Document } from 'mongoose';
import slugify from 'slugify';

// Interface for TypeScript type checking
interface ICollection extends Document {
  name: string;
  slug: string;
  description?: string;
  image: string[];  // Only use array of strings, not union type
  isFeatured: boolean;
  status: 'published' | 'draft' | 'archived';
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  updatedBy?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const CollectionSchema: Schema<ICollection> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: [String], // Explicitly an array of strings
      default: [],    // Default to empty array
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'draft',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 10,
        message: 'Cannot have more than 10 tags',
      },
    },
    seoTitle: {
      type: String,
      maxlength: [60, 'SEO Title cannot exceed 60 characters'],
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'SEO Description cannot exceed 160 characters'],
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        
        // Ensure image is always an array
        if (!ret.image) {
          ret.image = [];
        }
        
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug before saving
CollectionSchema.pre<ICollection>('save', function (next) {
  if (!this.isModified('name')) return next();

  this.slug = slugify(this.name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });

  // Ensure image is always an array
  if (!this.image) {
    this.image = [];
  }

  next();
});

// Same as before...
CollectionSchema.index({ name: 'text', description: 'text', tags: 'text' });
CollectionSchema.index({ status: 1, isFeatured: 1 });
CollectionSchema.index({ sortOrder: 1 });

// Virtual for product count
CollectionSchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'collections',
  count: true,
});

// Static methods
CollectionSchema.statics.findPublished = function () {
  return this.find({ status: 'published' }).sort({ sortOrder: 1, name: 1 });
};

CollectionSchema.statics.findFeatured = function () {
  return this.find({ status: 'published', isFeatured: true }).sort({ sortOrder: 1 });
};

// Instance methods
CollectionSchema.methods.updateStatus = async function (
  newStatus: ICollection['status'],
  userId: mongoose.Types.ObjectId
) {
  this.status = newStatus;
  this.updatedBy = userId;
  return this.save();
};

// Model type
interface ICollectionModel extends Model<ICollection> {
  findPublished(): Promise<ICollection[]>;
  findFeatured(): Promise<ICollection[]>;
}

// Create and export model
const Collection: ICollectionModel =
  (mongoose.models.Collection as ICollectionModel) ||
  mongoose.model<ICollection, ICollectionModel>('Collection', CollectionSchema);

export default Collection;