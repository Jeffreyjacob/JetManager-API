import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getConfig } from '../config/config';
import crypto from 'crypto';
import { AppError } from './appError';

const config = getConfig();
const isDev = config.env !== 'production';

const s3 = new S3Client({
  region: config.aws.s3.region,
  ...(isDev && {
    credentials: {
      accessKeyId: config.aws.s3.access_key,
      secretAccessKey: config.aws.s3.access_secret_key,
    },
  }),
});

const BUCKET_NAME = config.aws.s3.bucket_name;

// generate a hash from file buffer (for duplication)

const generateFileHas = (buffer: Buffer): string => {
  return crypto.createHash('md5').update(buffer).digest('hex');
};

export const uploadFileToS3 = async (
  file: Express.Multer.File,
  folder: string = 'upload'
) => {
  const fileHash = generateFileHas(file.buffer);
  const fileExtension = file.originalname.split('.').pop();
  const key = `${folder}/${fileHash}.${fileExtension}`;

  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );

    console.log(`File already exist in s3, returning existing link`);
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error: any) {
    if (error.name !== 'NotFound') {
      throw error;
    }
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

export const deleteFileFromS3 = async (key: string) => {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );

    console.log(`File deleted successfully from S3: ${key}`);
  } catch (error: any) {
    console.error(`Failed to delete file from S3: ${key}`, error);
    throw new Error('Error deleting file from S3');
  }
};

export const extractKeyFromFileUrl = async (fileUrl: string) => {
  try {
    const parts = fileUrl.split('.amazonaws.com/');
    if (parts.length < 2) {
      throw new AppError('Invalid s3 url', 400);
    }
    return parts[1];
  } catch (error: any) {
    throw new Error('Invalid S3 URL format');
  }
};
