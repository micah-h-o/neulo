import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const authHeader = request.headers.get("Authorization");
    console.log(authHeader, process.env.HEALTH_SECRET)
    
    if (authHeader != `Bearer ${process.env.HEALTH_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });
}