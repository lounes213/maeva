'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiStar, FiTag, FiClock, FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { Skeleton } from '@/components/ui/skeleton'
import CreateCollectionModal from './createCollection'
import EditCollectionModal from './editCollection'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface Collection {
  _id: string
  name: string
  slug: string
  description: string
  image?: string[] | string // Allow for both array and string for backward compatibility
  status: 'draft' | 'published' | 'archived'
  tags: string[]
  isFeatured: boolean
  seoTitle?: string
  seoDescription?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

export default function CollectionTable() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [showMetadata, setShowMetadata] = useState(false)

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch('https://maeva-three.vercel.app/api/collection')
        if (!res.ok) throw new Error('Failed to fetch collections')
        const { data } = await res.json()
        setCollections(data)
        setFilteredCollections(data)
      } catch (error) {
        console.error('Error fetching collections:', error)
        toast.error('Failed to load collections')
      } finally {
        setLoading(false)
      }
    }
    fetchCollections()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = collections.filter(collection =>
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        collection.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCollections(filtered)
    } else {
      setFilteredCollections(collections)
    }
  }, [searchTerm, collections])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return
    
    setIsDeleting(true)
    try {
      const res = await fetch(`https://maeva-three.vercel.app/api/collection?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete collection')
      }

      setCollections(collections.filter(collection => collection._id !== id))
      toast.success('Collection deleted successfully')
    } catch (error) {
      console.error('Error deleting collection:', error)
      toast.error('Failed to delete collection')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection)
  }

  const handleUpdateSuccess = (updatedCollection: Collection) => {
    setCollections(collections.map(collection => 
      collection._id === updatedCollection._id ? updatedCollection : collection
    ))
    setEditingCollection(null)
    toast.success('Collection updated successfully')
  }

  // Helper to get the image URL (handles both string and array)
  const getCollectionImage = (collection: Collection): string | null => {
    if (!collection.image) return null;
    
    if (Array.isArray(collection.image)) {
      return collection.image.length > 0 ? collection.image[0] : null;
    }
    
    return collection.image || null;
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-16 w-16" />
            <Skeleton className="h-16 flex-1" />
            <Skeleton className="h-16 flex-1" />
            <Skeleton className="h-16 w-32" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Edit Collection Modal */}
      {editingCollection && (
        <EditCollectionModal
          collection={editingCollection}
          onClose={() => setEditingCollection(null)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Collections</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search collections..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMetadata(!showMetadata)}
            >
              {showMetadata ? (
                <>
                  <FiEyeOff className="mr-2" />
                  Hide Metadata
                </>
              ) : (
                <>
                  <FiEye className="mr-2" />
                  Show Metadata
                </>
              )}
            </Button>
            <CreateCollectionModal 
              onCreateSuccess={(newCollection: Collection) => setCollections([...collections, newCollection])}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name / Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                {showMetadata && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SEO/Metadata
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCollections.length > 0 ? (
                filteredCollections.map((collection) => (
                  <tr key={collection._id} className="hover:bg-gray-50">
                    {/* Image */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCollectionImage(collection) ? (
                        <div className="relative h-12 w-12">
                          <Image
                            src={getCollectionImage(collection)!}
                            alt={collection.name}
                            fill
                            className="rounded object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-400">No image</span>
                        </div>
                      )}
                    </td>

                    {/* Name and Slug */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {collection.name}
                          {collection.isFeatured && (
                            <FiStar className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {collection.slug}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Order: {collection.sortOrder}
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 text-gray-500 max-w-xs">
                      <div className="line-clamp-3">
                        {collection.description || '-'}
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {collection.tags?.length > 0 ? (
                          collection.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <FiTag className="mr-1" /> {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={
                          collection.status === 'published' ? 'default' : 
                          collection.status === 'archived' ? 'destructive' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {collection.status}
                      </Badge>
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          <span>Created: {format(new Date(collection.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <FiClock className="w-3 h-3" />
                          <span>Updated: {format(new Date(collection.updatedAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </td>

                    {/* SEO/Metadata (conditional) */}
                    {showMetadata && (
                      <td className="px-6 py-4 text-gray-500 text-sm max-w-xs">
                        <div className="space-y-1">
                          <div className="line-clamp-1">
                            <span className="font-medium">SEO Title:</span> {collection.seoTitle || '-'}
                          </div>
                          <div className="line-clamp-2">
                            <span className="font-medium">SEO Desc:</span> {collection.seoDescription || '-'}
                          </div>
                          {collection.metadata && (
                            <div className="line-clamp-1">
                              <span className="font-medium">Metadata:</span> {JSON.stringify(collection.metadata)}
                            </div>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="px-3"
                        onClick={() => handleEdit(collection)}
                      >
                        <FiEdit className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="px-3"
                        onClick={() => handleDelete(collection._id)}
                        disabled={isDeleting}
                      >
                        <FiTrash2 className="mr-2" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={showMetadata ? 8 : 7} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm
                      ? 'No collections match your search'
                      : 'No collections found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}