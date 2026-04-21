import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import CanhoesAppLayout from "@/app/canhoes/(app)/layout";
import CanhoesLoginPage from "@/app/canhoes/(public)/login/page";
import { useAuth } from "@/hooks/useAuth";

const replace = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

describe("Canhoes auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redireciona para o login quando nao ha sessao no layout do app", async () => {
    mockUseAuth.mockReturnValue({
      isLogged: false,
      loading: false,
      user: null,
    } as never);

    render(
      <CanhoesAppLayout>
        <div>Area privada</div>
      </CanhoesAppLayout>
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/canhoes/login");
    });
  });

  it("mostra o erro de autenticacao no login e redireciona quando ja existe sessao", async () => {
    window.history.pushState({}, "", "/canhoes/login?error=OAuthSignin");

    mockUseAuth.mockReturnValue({
      isLogged: true,
      loading: false,
      loginGoogle: vi.fn(),
      isDevAuthBypass: false,
    } as never);

    render(<CanhoesLoginPage />);

    expect(await screen.findByText(/Falha no login Google/i)).toBeTruthy();

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/canhoes");
    });
  });
});
