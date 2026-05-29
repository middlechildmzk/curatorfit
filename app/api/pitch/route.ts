import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const form = await request.formData();
  const artistName = String(form.get('artistName') || 'Artist');
  const tags = String(form.get('tags') || '').split(',').map((tag) => tag.trim()).filter(Boolean);
  const pitch = `Hi — I’m ${artistName}. I’m sharing a track that sits around ${tags.slice(0, 4).join(', ')}. I thought it may fit your playlist based on the mood and genre direction. No pressure if it is not right; I appreciate you listening.`;
  return NextResponse.json({ ok: true, pitch });
}
