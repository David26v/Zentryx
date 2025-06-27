import multer from 'multer';
import { GridFSBucket } from 'mongodb';
import mongoose from 'mongoose';

// Custom GridFS storage engine
class CustomGridFSStorage {
  private getBucket(): GridFSBucket {
    if (!mongoose.connection.db) {
      throw new Error('MongoDB connection not established');
    }
    return new GridFSBucket(mongoose.connection.db, {
      bucketName: 'avatars'
    });
  }

  constructor() {
    console.log('Custom GridFS storage initialized');
  }

  _handleFile(req: any, file: any, cb: any) {
    console.log('Custom storage handling file:', file.originalname);
    console.log('Request body username:', req.body?.username);

    try {
      const bucket = this.getBucket();
      
      const filename = `${Date.now()}-${file.originalname}`;
      const metadata = { 
        username: "pending", // Will be updated after body parsing
        uploadDate: new Date(),
        mimetype: file.mimetype
      };

      console.log('Creating upload stream with filename:', filename);
      console.log('Metadata:', metadata);

      const uploadStream = bucket.openUploadStream(filename, {
        metadata: metadata
      });

      // Handle upload completion
      uploadStream.on('finish', () => {
        console.log('File upload completed successfully');
        console.log('File ID:', uploadStream.id);
        
        cb(null, {
          id: uploadStream.id,
          filename: filename,
          metadata: metadata,
          size: uploadStream.length,
          bucketName: 'avatars'
        });
      });

      // Handle upload errors
      uploadStream.on('error', (error) => {
        console.error('Upload stream error:', error);
        cb(error);
      });

      // Pipe the file stream to GridFS
      file.stream.pipe(uploadStream);
    } catch (error) {
      console.error('Error in _handleFile:', error);
      cb(error);
    }
  }

  _removeFile(req: any, file: any, cb: any) {
    console.log('Removing file:', file.id);
    try {
      const bucket = this.getBucket();
      bucket.delete(file.id, cb);
    } catch (error) {
      cb(error);
    }
  }
}

// Create multer middleware with custom storage
const createUploadMiddleware = () => {
  const storage = new CustomGridFSStorage();

  return multer({
    storage: storage as any,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (_req, file, cb) => {
      console.log('File filter check - mimetype:', file.mimetype)
      console.log('Is image file:', file.mimetype.startsWith('image/'))
      
      if (file.mimetype.startsWith('image/')) {
        console.log('File accepted by filter')
        cb(null, true);
      } else {
        console.log('File rejected by filter - not an image')
        cb(new Error('Only image files are allowed'))
      }
    },
  })
}

const uploadAvatarMiddleware = createUploadMiddleware()


export default uploadAvatarMiddleware