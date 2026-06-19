import axios from "axios";

export function getFriendlyApiError(error: unknown): string {
  if (!error) {
    return "Ocorreu um erro inesperado. Tente novamente em instantes.";
  }

  if (typeof error === "string") {
    return error;
  }

  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    // Check if API returned a message
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message;
    }

    switch (status) {
      case 400:
        return "Dados inválidos. Verifique os campos e tente novamente.";
      case 401:
        return "Sua sessão expirou. Faça login novamente.";
      case 403:
        return "Você não tem permissão para realizar esta ação.";
      case 404:
        return "Conteúdo não encontrado.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Não foi possível carregar os dados devido a um erro no servidor. Tente novamente mais tarde.";
      default:
        break;
    }

    if (error.code === "ERR_NETWORK") {
      return "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado. Tente novamente em instantes.";
}
