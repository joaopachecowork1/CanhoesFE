import { NextResponse } from "next/server";

import { notFound } from "@/lib/api/httpError";
import { apiRoute } from "@/lib/api/route";
import { readUpload, UploadValidationError } from "@/lib/storage/localStorage";

const ONE_DAY_IN_SECONDS = 86_400;

export const GET = apiRoute<{ path: string[] }>(async (_request, { path }) => {
  try {
    const { buffer, contentType } = await readUpload(path);
    return new NextResponse(buffer, {
      headers: {
        "content-type": contentType,
        "cache-control": `public, max-age=${ONE_DAY_IN_SECONDS}, immutable`,
      },
    });
  } catch (error) {
    if (error instanceof UploadValidationError) throw error;
    throw notFound("File not found.");
  }
});
