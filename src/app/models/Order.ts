import mongoose, { Schema, model, models } from 'mongoose';

interface ICartItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  size?: string;
  color?: string;
}

interface ITrackingEvent {
  status: string;
  date: Date;
  location?: string;
  notes?: string;
}

interface IOrder {
  items: ICartItem[];
  customer: {
    name: string;
    address: string;
    contact: string;
    email?: string;
  };
  shipping: {
    method: string;
    cost: number;
    estimatedDelivery: string;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  payment: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    method?: string;
    status?: string;
  };
  trackingCode: string;
  confirmationCode?: string; // Made optional
  deliveryStatus: string;
  statusUpdatedAt?: Date;
  trackingHistory: ITrackingEvent[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  imageUrl: String,
  size: String,
  color: String
});

const TrackingEventSchema = new Schema<ITrackingEvent>({
  status: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  location: String,
  notes: String
});

const OrderSchema = new Schema<IOrder>(
  {
    items: [CartItemSchema],
    customer: {
      name: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      contact: {
        type: String,
        required: true
      },
      email: String
    },
    shipping: {
      method: {
        type: String,
        required: true
      },
      cost: {
        type: Number,
        required: true
      },
      estimatedDelivery: {
        type: String,
        required: true
      },
      carrier: String,
      trackingNumber: String,
      trackingUrl: String
    },
    payment: {
      subtotal: {
        type: Number,
        required: true
      },
      discount: {
        type: Number,
        required: true,
        default: 0
      },
      shipping: {
        type: Number,
        required: true
      },
      total: {
        type: Number,
        required: true
      },
      method: String,
      status: String
    },
    trackingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: function() {
        const prefix = 'CMD';
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        return `${prefix}${randomNum}`;
      }
    },
    confirmationCode: {
      type: String,
      index: true,
      default: function() {
        return `CONF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
    },
    deliveryStatus: {
      type: String,
      enum: ['processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
      default: 'processing'
    },
    statusUpdatedAt: Date,
    trackingHistory: [TrackingEventSchema]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      }
    }
  }
);

// Add a pre-save hook to update statusUpdatedAt when deliveryStatus changes
OrderSchema.pre('save', function(next) {
  if (this.isModified('deliveryStatus')) {
    this.statusUpdatedAt = new Date();
    
    // Add to tracking history
    this.trackingHistory = this.trackingHistory || [];
    this.trackingHistory.push({
      status: this.deliveryStatus,
      date: new Date()
    });
  }
  next();
});

// Static method for order tracking
OrderSchema.statics.findByTrackingCode = async function(trackingCode: string) {
  return this.findOne({ trackingCode })
    .populate('items.productId', 'name price imageUrls stock')
    .lean();
};

const Order = models.Order || model<IOrder>('Order', OrderSchema);

export default Order;