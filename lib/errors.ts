"use client";

import { ApiError } from "@/lib/api/canhoesClient";

import { logger } from "./logger";

const DEFAULT_STATUS_MESSAGES: Partial<Record<number, string>> = {
  400: "O pedido nao e valido.",
  401: "A tua sessao expirou. Entra novamente para continuar.",
  403: "Nao tens permissao para fazer esta acao.",
  404: "O recurso pedido ja nao existe.",
  409: "O estado mudou entretanto. Atualiza a pagina e tenta outra vez.",
  422: "Os dados enviados nao sao validos.",
  500: "O servidor falhou a processar o pedido.",
  502: "O backend nao respondeu a tempo.",
  503: "O backend esta temporariamente indisponivel.",
};

const CODE_MESSAGES: Record<string, string> = {
  PROXY_PATH_MISSING: "Pedido invalido no proxy da API.",
  MOCK_REQUEST_FAILED: "O modo mock nao conseguiu processar o pedido.",
  PROXY_BACKEND_UNREACHABLE: "Nao foi possivel contactar o backend.",
  PROXY_UNHANDLED_ERROR: "O proxy da API falhou ao processar o pedido.",
  UNHANDLED_SERVER_ERROR: "O servidor encontrou um erro inesperado.",
};

function readErrorDetail(details: unknown) {
  if (typeof details === "string") {
    const normalized = details.trim();
    return normalized || null;
  }

  if (!details || typeof details !== "object") {
    return null;
  }

  for (const key of ["message", "detail", "title", "error"]) {
    const value = (details as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function readErrorCode(details: unknown) {
  if (!details || typeof details !== "object") return null;
  const value = (details as Record<string, unknown>).code;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isGenericErrorMessage(message: string) {
  return /^(request failed|failed to fetch|internal server error)$/i.test(
    message.trim()
  );
}

function joinMessages(base: string, detail: string | null) {
  if (!detail || detail === base || isGenericErrorMessage(detail)) {
    return base;
  }

  if (base.endsWith(".") || base.endsWith("!") || base.endsWith("?")) {
    return `${base} ${detail}`;
  }

  return `${base}: ${detail}`;
}

export function getErrorMessage(error: unknown, fallback?: string): string;
export function getErrorMessage(
  error: unknown,
  fallback: string,
  statusMessages?: Partial<Record<number, string>>
): string;
export function getErrorMessage(
  error: unknown,
  fallback: string = "Ocorreu um erro",
  statusMessages?: Partial<Record<number, string>>
) {
  if (error instanceof ApiError) {
    const code = readErrorCode(error.details);
    const baseMessage =
      (code ? CODE_MESSAGES[code] : null) ??
      statusMessages?.[error.status] ??
      DEFAULT_STATUS_MESSAGES[error.status] ??
      fallback;

    return joinMessages(
      baseMessage,
      readErrorDetail(error.details) ??
        (isGenericErrorMessage(error.message) ? null : error.message)
    );
  }

  if (error instanceof Error) {
    if (/failed to fetch/i.test(error.message)) {
      return `${fallback} Verifica a ligacao ao servidor.`;
    }

    const message = error.message.trim();
    return message || fallback;
  }

  return fallback;
}

export function logFrontendError(context: string, error: unknown, details?: unknown) {
  logger.error(context, error, details);
}

export function sanitizeErrorDetail(detail: string | null): string {
  if (!detail) return "Ocorreu um erro";
  return detail
    .replace(/at\s+.*:\d+:\d+/g, "")
    .replace(/\/home\/[^\s]+/g, "")
    .substring(0, 200);
}
