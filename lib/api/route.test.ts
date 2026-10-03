import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { HttpError, notFound } from "./httpError";
import { apiRoute, json, readJson, readPaging } from "./route";

const BASE_URL = "http://localhost/api/test";

function jsonRequest(body: string) {
  return new NextRequest(BASE_URL, { method: "POST", body, headers: { "content-type": "application/json" } });
}

async function rejectionOf(promise: Promise<unknown>) {
  try {
    await promise;
    return null;
  } catch (error) {
    return error as HttpError;
  }
}

describe("readPaging", () => {
  it("uses the defaults when skip and take are missing", () => {
    expect(readPaging(new NextRequest(BASE_URL))).toEqual({ skip: 0, take: 50 });
  });

  it("falls back to the defaults for values that are not numbers", () => {
    expect(readPaging(new NextRequest(`${BASE_URL}?skip=abc&take=x`), { defaultTake: 15 })).toEqual({ skip: 0, take: 15 });
  });

  it("clamps negative skip and out-of-range take", () => {
    expect(readPaging(new NextRequest(`${BASE_URL}?skip=-5&take=5000`), { maxTake: 50 })).toEqual({ skip: 0, take: 50 });
    expect(readPaging(new NextRequest(`${BASE_URL}?take=0`))).toEqual({ skip: 0, take: 1 });
  });
});

describe("readJson", () => {
  const schema = z.object({ text: z.string().min(1, "Text is required") });

  it("returns the parsed body", async () => {
    await expect(readJson(jsonRequest('{"text":"olá"}'), schema)).resolves.toEqual({ text: "olá" });
  });

  it("rejects malformed JSON with a 400", async () => {
    const error = await rejectionOf(readJson(jsonRequest("{not json"), schema));
    expect(error).toMatchObject({ status: 400, code: "VALIDATION_ERROR", message: "Invalid JSON body." });
  });

  it("rejects invalid input with the first validation message", async () => {
    const error = await rejectionOf(readJson(jsonRequest('{"text":""}'), schema));
    expect(error).toMatchObject({ status: 400, code: "VALIDATION_ERROR", message: "Text is required" });
  });
});

describe("apiRoute", () => {
  const context = { params: Promise.resolve({ id: "42" }) };

  it("passes the resolved params to the handler", async () => {
    const route = apiRoute<{ id: string }>(async (_request, { id }) => json({ id }));
    const response = await route(new NextRequest(BASE_URL), context);
    expect(await response.json()).toEqual({ id: "42" });
  });

  it("turns an HttpError into its status and { code, message }", async () => {
    const route = apiRoute<{ id: string }>(async () => {
      throw notFound("Post not found.");
    });
    const response = await route(new NextRequest(BASE_URL), context);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ code: "NOT_FOUND", message: "Post not found." });
  });

  it("hides unexpected errors behind a generic 500", async () => {
    const route = apiRoute<{ id: string }>(async () => {
      throw new Error("connection refused at 10.0.0.3");
    });
    const response = await route(new NextRequest(BASE_URL), context);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ code: "UNHANDLED_SERVER_ERROR", message: "Unexpected server error." });
  });
});
