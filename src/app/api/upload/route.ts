import { Storage } from '@google-cloud/storage';
import { NextRequest, NextResponse } from 'next/server';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID || 'scx-scxweb-dev',
});
const bucketName = process.env.GCS_BUCKET_NAME || 'scx-scxweb-dev-gcs-bkk-001';

// Server-side upload: browser sends file to this route, Cloud Run uploads to GCS.
// Avoids signed URL complexity and GCS CORS requirements.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = storage.bucket(bucketName);
    const gcsFile = bucket.file(file.name);

    await gcsFile.save(buffer, {
      contentType: file.type,
    });

    const cdnDomain = process.env.CDN_DOMAIN || 'storage.googleapis.com/' + bucketName;
    const publicUrl = `https://${cdnDomain}/${encodeURIComponent(file.name)}`;

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
