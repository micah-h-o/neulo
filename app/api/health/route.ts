import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const authHeader = request.headers.get("Authorization");

    if (authHeader != `Bearer ${process.env.HEALTH_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(authHeader, process.env.HEALTH_SECRET)

    return NextResponse.json({ message: "OK" }, { status: 200 });
}