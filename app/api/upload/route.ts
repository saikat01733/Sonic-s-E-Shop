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

    // Convert file to base64 or forward multipart
    let base64Image = '';
    if (typeof imageFile === 'string') {
      base64Image = imageFile.replace(/^data:image\/[a-z]+;base64,/, '');
    } else if (imageFile instanceof Blob) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Image = buffer.toString('base64');
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid image format' },
        { status: 400 }
      );
    }

    // Upload to ImgBB
    const imgbbParams = new URLSearchParams();
    imgbbParams.append('image', base64Image);

    const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: imgbbParams,
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
