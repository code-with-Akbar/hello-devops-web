import { NextResponse } from "next/server";

export async function GET() {
 // return NextResponse.json({ status: "ok" });
   return NextResponse.json({ status: "broken" }, { status: 500 });

}
