import { NextResponse } from "next/server";
import { z } from "zod";
import { SMTPClient } from "emailjs";
export const runtime = "nodejs";

type FormType = "attendee" | "vip" | "sponsor";

export async function POST(req: Request) {
	const contentType = req.headers.get("content-type") || "";

	if (contentType.includes("multipart/form-data")) {
		const form = await req.formData();
		const formType = String(form.get("formType") || "");
		if (formType !== "attendee") {
			return NextResponse.json({ error: "multipart only supported for attendee" }, { status: 400 });
		}
		const payloadBlob = form.get("payload");
		let data: any = {};
		if (payloadBlob instanceof Blob) {
			try { data = JSON.parse(await payloadBlob.text()); } catch {}
		}
		const screenshot = form.get("screenshot");
		// Minimal validation: require name
		if (!data?.name || String(data.name).trim().length < 2) {
			return NextResponse.json({ error: "Invalid name" }, { status: 400 });
		}
		// Email will be handled by shared helper
		await sendEmails(data, screenshot instanceof File ? screenshot : undefined);
		return NextResponse.json({ ok: true }, { status: 200 });
	}

	if (contentType.includes("application/json")) {
		const body = await req.json().catch(() => null);
		if (!body || typeof body !== "object") {
			return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
		}

		const formType = body.formType as "attendee" | "vip" | "sponsor" | undefined;
		if (!formType || !(formType === "attendee" || formType === "vip" || formType === "sponsor")) {
			return NextResponse.json({ error: "formType must be attendee | vip | sponsor" }, { status: 400 });
		}

		switch (formType) {
			case "attendee": {
				if (!body.name || !body.social) {
					return NextResponse.json({ error: "Missing attendee fields: name, social" }, { status: 400 });
				}
				break;
			}
			case "vip": {
				if (!body.name || !body.quantity || !body.passport) {
					return NextResponse.json({ error: "Missing VIP fields: name, quantity, passport" }, { status: 400 });
				}
				break;
			}
			case "sponsor": {
				if (!body.brand || !body.package) {
					return NextResponse.json({ error: "Missing sponsor fields: brand, package" }, { status: 400 });
				}
				break;
			}
		}

		await sendEmails(body);
		return NextResponse.json({ ok: true }, { status: 200 });
	}

	return NextResponse.json({ error: "Unsupported content-type" }, { status: 415 });
}

/**
 * Env (planned):
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASS
 * - EMAIL_TO (receiver)
 * - EMAIL_CC (optional CC)
 * - EMAIL_FROM (from address)
 */

async function sendEmails(data: any, file?: File) {
	const host = process.env.SMTP_HOST || "";
	const port = Number(process.env.SMTP_PORT || 587);
	const user = process.env.SMTP_USER || "";
	const pass = process.env.SMTP_PASS || "";
	const from = process.env.EMAIL_FROM || user;
	const toEnv = process.env.EMAIL_TO || user;
	const ccEnv = process.env.EMAIL_CC || "";

	if (!host || !user || !pass) return;

	const client = new SMTPClient({ user, password: pass, host, port, tls: true });

	let subject = "Doge Day 2025 Submission";
	let target = toEnv;
	let ccList: string[] = [];

	if (data?.formType === "vip" || data?.interest === "vip") {
		subject = "VIP Interest - Doge Day 2025";
		target = "smoke@ownthedoge.com";
	}
	if (data?.formType === "sponsor" || data?.interest === "sponsor") {
		subject = "Sponsorship Interest - Doge Day 2025";
		if (ccEnv) ccList = ccEnv.split(",").map(s => s.trim()).filter(Boolean);
	}

	const text = JSON.stringify(data, null, 2);
	const attachment: any[] = [];
	if (file) {
		const buf = Buffer.from(await file.arrayBuffer());
		attachment.push({ name: file.name || "screenshot", data: buf.toString("base64"), encoding: "base64" });
	}

	await new Promise<void>((resolve, reject) => {
		client.send({ text, from, to: target, cc: ccList, subject, attachment } as any, (err: unknown) => {
			if (err) reject(err);
			else resolve();
		});
	});
}