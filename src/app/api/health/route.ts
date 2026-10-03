import { NextResponse } from "next/server";
import packageJson from "../../../../package.json";

export function GET() {
  return NextResponse.json({
    ok: true,
    version: packageJson.version,
  });
}
