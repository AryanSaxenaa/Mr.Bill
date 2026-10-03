import { NextResponse } from "next/server";
import { getLlmPublicConfig } from "@/lib/llm-client";

export function GET() {
  return NextResponse.json(getLlmPublicConfig());
}
