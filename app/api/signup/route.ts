import { NextResponse } from "next/server";

export async function POST() {
	return NextResponse.json({ message: "Signup not yet enabled" }, { status: 501 });
}

/**
 * Future env usage (documented):
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASS
 * - EMAIL_TO (receiver)
 * - EMAIL_FROM (from address)
 */ 