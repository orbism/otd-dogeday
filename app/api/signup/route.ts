import { NextResponse } from "next/server";
import { z } from "zod";
import { SMTPClient } from "emailjs";
export const runtime = "nodejs";


type FormType = "attendee" | "vip" | "sponsor";

export async function POST(req: Request) {
	const contentType = req.headers.get("content-type") || "";
    try {

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
    } catch (err) {
        console.error("/api/signup POST error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
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

function formatSubmissionText(data: any): string {
	const lines: string[] = [];
	const push = (label: string, value: unknown) => {
		if (value === undefined || value === null || value === "") return;
		if (Array.isArray(value)) {
			if (value.length === 0) return;
			lines.push(`${label}: ${value.join(", ")}`);
			return;
		}
		if (typeof value === "object") return;
		lines.push(`${label}: ${String(value)}`);
	};

	push("Form Type", data?.formType || data?.interest || "attendee");
	push("Name", data?.name);
	push("Social", data?.social);
	if (data?.socials) {
		push("Twitter", data.socials.twitter);
		push("Instagram", data.socials.instagram);
		push("Discord", data.socials.discord);
	}
	push("Profiles", data?.profiles);
	if (data?.vip) {
		push("VIP Quantity", data.vip.quantity);
		push("VIP Company", data.vip.company);
		push("VIP Food Allergies", data.vip.foodAllergies);
	}
	if (data?.sponsor) {
		push("Sponsor Brand", data.sponsor.brand);
		push("Sponsor Package", data.sponsor.package);
	}
	push("Content Types", data?.contentTypes);
	if (data?.referral) {
		push("Referral Creator 1", data.referral.creator1);
		push("Referral Creator 2", data.referral.creator2);
	}
	push("Heard About", data?.heard);
	push("Heard Other", data?.heardOther);
	push("Suggestions", data?.suggestions);

	return lines.join("\n");
}

async function sendEmails(data: any, file?: File) {
	const host = process.env.SMTP_HOST || "";
	const port = Number(process.env.SMTP_PORT || 587);
	const user = process.env.SMTP_USER || "";
	const pass = process.env.SMTP_PASS || "";
	const from = process.env.EMAIL_FROM || user;
	const toEnv = process.env.EMAIL_TO || user;
	const ccEnv = process.env.EMAIL_CC || "";

	if (!host || !user || !pass) {
		console.error("SMTP is not configured. Check SMTP_HOST/SMTP_USER/SMTP_PASS envs.");
		return;
	}

	const client = new SMTPClient({ user, password: pass, host, port, tls: true });

	let subject = "Doge Day 2025 Submission";
	let toList = toEnv.split(",").map(s => s.trim()).filter(Boolean);
	let ccList: string[] = [];

	if (data?.formType === "vip" || data?.interest === "vip") {
		subject = "VIP Interest - Doge Day 2025";
	}
	if (data?.formType === "sponsor" || data?.interest === "sponsor") {
		subject = "Sponsorship Interest - Doge Day 2025";
		if (ccEnv) ccList = ccEnv.split(",").map(s => s.trim()).filter(Boolean);
	}

	const text = formatSubmissionText(data);
	const attachment: any[] = [];
	if (file) {
		const buf = Buffer.from(await file.arrayBuffer());
		attachment.push({ name: file.name || "screenshot", data: buf.toString("base64"), encoding: "base64" });
	}

	await new Promise<void>((resolve, reject) => {
		client.send({ text, from, to: toList, cc: ccList, subject, attachment } as any, (err: unknown) => {
			if (err) {
				console.error("SMTP send error:", err);
				reject(err);
			} else {
				console.log("SMTP send success:", { to: toList, cc: ccList, subject });
				resolve();
			}
		});
	});
}