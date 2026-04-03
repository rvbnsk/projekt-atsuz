export type PhotoStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION'

export interface Photo {
  id: string
  uploaderId: string | null
  uploaderName: string | null
  hierarchyNodeId: string | null
  hierarchyNodeName: string | null
  title: string
  description: string | null
  accessionNumber: string | null
  thumbnailUrl: string | null
  mediumUrl: string | null
  originalFilename: string | null
  mimeType: string | null
  fileSizeBytes: number | null
  widthPx: number | null
  heightPx: number | null
  photoDateFrom: string | null
  photoDateTo: string | null
  photoDateLabel: string | null
  locationName: string | null
  latitude: number | null
  longitude: number | null
  rightsStatement: string | null
  licenseNotes: string | null
  status: PhotoStatus
  rejectionReason: string | null
  viewCount: number
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface PhotoSearchParams {
  q?: string
  nodeId?: string
  yearFrom?: number
  yearTo?: number
  tags?: string[]
  lat?: number
  lng?: number
  radiusKm?: number
  page?: number
  size?: number
  sort?: string
}

export interface PhotoUploadRequest {
  title: string
  description?: string
  nodeId?: string
  tags?: string[]
  photoDateFrom?: string
  photoDateTo?: string
  photoDateLabel?: string
  locationName?: string
  latitude?: number
  longitude?: number
  rightsStatement?: string
}
