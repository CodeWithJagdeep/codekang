import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, jobSlug, jobTitle, resumeUrl, coverNote } = body;

    if (!name || !email || !jobSlug || !jobTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const res = await fetch(`${API_URL}/careers/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, jobSlug, jobTitle, resumeUrl, coverNote }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message ?? 'Failed to submit' }, { status: res.status });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[careers/apply]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
