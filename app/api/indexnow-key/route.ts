import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const expectedKey = process.env.INDEXNOW_KEY;

  if (key && expectedKey && key === expectedKey) {
    return new NextResponse(expectedKey, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse("Not Found", { status: 404 });
}
