
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select'
import { Trash, Edit, X, Check, Star, Truck, Calendar, Image } from 'lucide-react'
import { SetStateAction, useState } from 'react'
import { Label } from 'recharts'

type Product = {
  id: string
  name: string
  reference: string
  description: string
  price: number
  stock: number
  category: string
  tissu?: string
  couleurs?: string[]
  taille?: string[]
  sold?: number
  promotion?: boolean
  promoPrice?: number
  reviews?: string
  rating?: number
  reviewCount?: number
  deliveryDate?: string
  deliveryAddress?: string
  deliveryStatus?: string
  imageUrls?: string[]
  createdAt?: string
  updatedAt?: string
}

const deliveryStatuses = [
  'en attente',
  'expédié',
  'livré',
  'annulé',
  'retourné'
]

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Chemise en coton',
      reference: 'CH-1001',
      description: 'Chemise élégante en coton biologique',
      price: 59.99,
      stock: 100,
      category: 'Vêtements',
      tissu: 'Coton',
      couleurs: ['Blanc', 'Bleu', 'Noir'],
      taille: ['S', 'M', 'L', 'XL'],
      sold: 25,
      promotion: true,
      promoPrice: 49.99,
      rating: 4.5,
      reviewCount: 12,
      deliveryStatus: 'livré',
      imageUrls: ['chemise1.jpg', 'chemise2.jpg']
    },
    {
      id: '2',
      name: 'Pantalon en lin',
      reference: 'PN-2001',
      description: 'Pantalon décontracté en lin',
      price: 79.99,
      stock: 50,
      category: 'Vêtements',
      tissu: 'Lin',
      couleurs: ['Beige', 'Marron'],
      taille: ['M', 'L', 'XL'],
      rating: 4.2,
      reviewCount: 8,
      deliveryStatus: 'expédié',
      imageUrls: ['pantalon1.jpg']
    }
  ])

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    reference: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    tissu: '',
    couleurs: [],
    taille: [],
    sold: 0,
    promotion: false,
    promoPrice: undefined,
    reviews: '',
    rating: 0,
    reviewCount: 0,
    deliveryDate: '',
    deliveryAddress: '',
    deliveryStatus: '',
    imageUrls: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentColorInput, setCurrentColorInput] = useState('')
  const [currentSizeInput, setCurrentSizeInput] = useState('')
  const [currentImageInput, setCurrentImageInput] = useState('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.reference.trim()) newErrors.reference = 'Reference is required'
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0'
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    if (formData.promotion && (!formData.promoPrice || formData.promoPrice >= formData.price)) {
      newErrors.promoPrice = 'Promo price must be less than regular price'
    }
    if (formData.rating && (formData.rating < 0 || formData.rating > 5)) {
      newErrors.rating = 'Rating must be between 0 and 5'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'sold' || name === 'rating' || name === 'reviewCount' || name === 'promoPrice' 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addColor = () => {
    if (currentColorInput.trim() && !formData.couleurs?.includes(currentColorInput.trim())) {
      setFormData(prev => ({
        ...prev,
        couleurs: [...(prev.couleurs || []), currentColorInput.trim()]
      }))
      setCurrentColorInput('')
    }
  }

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      couleurs: prev.couleurs?.filter(c => c !== color) || []
    }))
  }

  const addSize = () => {
    if (currentSizeInput.trim() && !formData.taille?.includes(currentSizeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        taille: [...(prev.taille || []), currentSizeInput.trim()]
      }))
      setCurrentSizeInput('')
    }
  }

  const removeSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      taille: prev.taille?.filter(t => t !== size) || []
    }))
  }

  const addImage = () => {
    if (currentImageInput.trim()) {
      setFormData(prev => ({
        ...prev,
        imageUrls: [...(prev.imageUrls || []), currentImageInput.trim()]
      }))
      setCurrentImageInput('')
    }
  }

  const removeImage = (image: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter(i => i !== image) || []
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...formData, id: editingProduct.id } : p
      ))
      setEditingProduct(null)
    } else {
      // Add new product
      const newProduct = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setProducts([...products, newProduct])
      setIsCreating(false)
    }
    resetForm()
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      reference: product.reference,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      tissu: product.tissu || '',
      couleurs: product.couleurs || [],
      taille: product.taille || [],
      sold: product.sold || 0,
      promotion: product.promotion || false,
      promoPrice: product.promoPrice,
      reviews: product.reviews || '',
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      deliveryDate: product.deliveryDate || '',
      deliveryAddress: product.deliveryAddress || '',
      deliveryStatus: product.deliveryStatus || '',
      imageUrls: product.imageUrls || []
    })
  }

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      reference: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      tissu: '',
      couleurs: [],
      taille: [],
      sold: 0,
      promotion: false,
      promoPrice: undefined,
      reviews: '',
      rating: 0,
      reviewCount: 0,
      deliveryDate: '',
      deliveryAddress: '',
      deliveryStatus: '',
      imageUrls: []
    })
    setErrors({})
    setCurrentColorInput('')
    setCurrentSizeInput('')
    setCurrentImageInput('')
  }

  const cancelForm = () => {
    resetForm()
    setEditingProduct(null)
    setIsCreating(false)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Product Manager</CardTitle>
          {!isCreating && !editingProduct && (
            <Button onClick={() => setIsCreating(true)}>Add Product</Button>
          )}
        </CardHeader>
        <CardContent>
          {(isCreating || editingProduct) && (
            <form onSubmit={handleSubmit} className="mb-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div>
                  <Label htmlFor="name">Name*</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="reference">Reference*</Label>
                  <Input
                    id="reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                  />
                  {errors.reference && <p className="text-red-500 text-sm">{errors.reference}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description*</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price*</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                  {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                </div>
                <div>
                  <Label htmlFor="stock">Stock*</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                  />
                  {errors.stock && <p className="text-red-500 text-sm">{errors.stock}</p>}
                </div>
                <div>
                  <Label htmlFor="category">Category*</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  />
                  {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                </div>
                <div>
                  <Label htmlFor="tissu">Fabric</Label>
                  <Input
                    id="tissu"
                    name="tissu"
                    value={formData.tissu}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Colors */}
                <div className="md:col-span-2">
                  <Label>Colors</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentColorInput}
                      onChange={(e: { target: { value: SetStateAction<string> } }) => setCurrentColorInput(e.target.value)}
                      placeholder="Add color"
                    />
                    <Button type="button" onClick={addColor}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.couleurs?.map(color => (
                      <div key={color} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <span>{color}</span>
                        <button 
                          type="button" 
                          onClick={() => removeColor(color)}
                          className="text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Sizes */}
                <div className="md:col-span-2">
                  <Label>Sizes</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentSizeInput}
                      onChange={(e: { target: { value: SetStateAction<string> } }) => setCurrentSizeInput(e.target.value)}
                      placeholder="Add size"
                    />
                    <Button type="button" onClick={addSize}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.taille?.map(size => (
                      <div key={size} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <span>{size}</span>
                        <button 
                          type="button" 
                          onClick={() => removeSize(size)}
                          className="text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Sales and Promotion */}
                <div>
                  <Label htmlFor="sold">Sold</Label>
                  <Input
                    id="sold"
                    name="sold"
                    type="number"
                    min="0"
                    value={formData.sold}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="promotion"
                    name="promotion"
                    type="checkbox"
                    checked={formData.promotion}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="promotion">Promotion</Label>
                </div>
                {formData.promotion && (
                  <div>
                    <Label htmlFor="promoPrice">Promo Price*</Label>
                    <Input
                      id="promoPrice"
                      name="promoPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.promoPrice || ''}
                      onChange={handleInputChange}
                    />
                    {errors.promoPrice && <p className="text-red-500 text-sm">{errors.promoPrice}</p>}
                  </div>
                )}
                
                {/* Reviews */}
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleInputChange}
                  />
                  {errors.rating && <p className="text-red-500 text-sm">{errors.rating}</p>}
                </div>
                <div>
                  <Label htmlFor="reviewCount">Review Count</Label>
                  <Input
                    id="reviewCount"
                    name="reviewCount"
                    type="number"
                    min="0"
                    value={formData.reviewCount}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="reviews">Reviews</Label>
                  <Input
                    id="reviews"
                    name="reviews"
                    value={formData.reviews}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Delivery Information */}
                <div>
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    name="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryStatus">Delivery Status</Label>
                  <Select 
                    value={formData.deliveryStatus} 
                    onValueChange={(value: string) => handleSelectChange('deliveryStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryStatuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Input
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                  />
                </div>
                
                {/* Images */}
                <div className="md:col-span-2">
                  <Label>Images</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={currentImageInput}
                      onChange={(e: { target: { value: SetStateAction<string> } }) => setCurrentImageInput(e.target.value)}
                      placeholder="Add image URL"
                    />
                    <Button type="button" onClick={addImage}>Add</Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                    {formData.imageUrls?.map((image, index) => (
                      <div key={index} className="relative">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-24 flex items-center justify-center">
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeImage(image)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={cancelForm}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button type="submit">
                  <Check className="mr-2 h-4 w-4" /> {editingProduct ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 font-semibold p-2 bg-gray-100 rounded">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Reference</div>
              <div className="col-span-1">Price</div>
              <div className="col-span-1">Stock</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Rating</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Actions</div>
            </div>
            {products.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No products found</p>
            ) : (
              products.map(product => (
                <div key={product.id} className="grid grid-cols-12 gap-2 items-center p-2 border-b">
                  <div className="col-span-3">{product.name}</div>
                  <div className="col-span-2">{product.reference}</div>
                  <div className="col-span-1">
                    {product.promotion ? (
                      <div className="flex flex-col">
                        <span className="line-through text-sm text-gray-500">${product.price.toFixed(2)}</span>
                        <span className="text-red-500">${product.promoPrice?.toFixed(2)}</span>
                      </div>
                    ) : (
                      `$${product.price.toFixed(2)}`
                    )}
                  </div>
                  <div className="col-span-1">{product.stock}</div>
                  <div className="col-span-2">{product.category}</div>
                  <div className="col-span-1 flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    {product.rating?.toFixed(1)}
                  </div>
                  <div className="col-span-1 flex items-center">
                    {product.deliveryStatus && (
                      <>
                        <Truck className="h-4 w-4 mr-1" />
                        {product.deliveryStatus}
                      </>
                    )}
                  </div>
                  <div className="col-span-1 flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}