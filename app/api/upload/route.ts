import { NextRequest, NextResponse } from 'next/server';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || 'f4df601fbbe9f7e258525727fabc681c';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    const imgbbFormData = new FormData();

    if (imageFile instanceof Blob) {
      const fileName = (imageFile as any).name || 'upload.png';
      imgbbFormData.append('image', imageFile, fileName);
    } else if (typeof imageFile === 'string') {
      const base64Data = imageFile.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer], { type: 'image/png' });
      imgbbFormData.append('image', blob, 'upload.png');
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid image format' },
        { status: 400 }
      );
    }

    // Direct multipart upload to ImgBB API
    const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: imgbbFormData,
    });

    const json = await imgbbResponse.json();

    if (!json.success || !json.data) {
      return NextResponse.json(
        { success: false, error: json.error?.message || 'ImgBB upload failed' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      url: json.data.url,
      display_url: json.data.display_url,
      thumb: json.data.thumb?.url || json.data.url,
      delete_url: json.data.delete_url,
    });
  } catch (error: any) {
    console.error('[Upload API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal upload error' },
      { status: 500 }
    );
  }
}
