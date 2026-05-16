import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function notImplemented(feature: string) {
  return NextResponse.json(
    {
      status: "planned",
      feature,
      message: `${feature} is scaffolded and will be connected during the approved build phases.`
    },
    { status: 202 }
  );
}
