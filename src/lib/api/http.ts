import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonError(message: string, status: number, extras?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extras }, { status });
}
