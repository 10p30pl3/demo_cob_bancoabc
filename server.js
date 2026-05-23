import express from "express";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;
const VOLL_API_URL = process.env.VOLL_API_URL;

if (!VOLL_API_URL) {
  console.warn("A variável de ambiente VOLL_API_URL não foi configurada.");
}

app.use(cors({
  origin: "*",
  methods: ["POST", "OPTIONS", "GET"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const allowedActions = ["EMAIL", "SMS", "WHATSAPP"];

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Proxy Régua de Cobrança Banco ABC"
  });
});

app.post("/api/regua-cobranca", async (req, res) => {
  try {
    if (!VOLL_API_URL) {
      return res.status(500).json({
        error: "VOLL_API_URL não configurada no servidor"
      });
    }

    const action = req.body?.contact?.action;

    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        error: "Ação inválida",
        received: action,
        allowedActions
      });
    }

    const response = await fetch(VOLL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const contentType = response.headers.get("content-type") || "";
    const responseBody = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return res.status(response.status).json({
      ok: response.ok,
      status: response.status,
      action,
      vollResponse: responseBody
    });
  } catch (error) {
    return res.status(500).json({
      error: "Erro ao chamar API Voll",
      detail: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy rodando na porta ${PORT}`);
});