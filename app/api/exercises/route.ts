import { NextResponse } from "next/server";
import { lagreeExercises } from "@/lib/data";

export async function GET() {
  return NextResponse.json(lagreeExercises);
}
