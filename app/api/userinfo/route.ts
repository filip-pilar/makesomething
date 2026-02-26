import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  try {
    const raw = await readFile(join(process.cwd(), "makesomething.json"), "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json({ name: data.name || "", email: data.email || "" });
  } catch {
    return NextResponse.json({ name: "", email: "" });
  }
}
