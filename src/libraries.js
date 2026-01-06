const JS_TS = {
  "UI / Components": [
    {
      label: "Tailwind CSS",
      packagesDev: ["tailwindcss", "postcss", "autoprefixer"],
      post: "tailwind-init",
    },
    { label: "shadcn/ui (Next/Vite)", packagesDev: [], post: "shadcn-init" },
    {
      label: "Material UI (MUI)",
      packages: ["@mui/material", "@emotion/react", "@emotion/styled"],
    },
    {
      label: "Chakra UI",
      packages: [
        "@chakra-ui/react",
        "@emotion/react",
        "@emotion/styled",
        "framer-motion",
      ],
    },
    { label: "Ant Design", packages: ["antd"] },
    { label: "Mantine", packages: ["@mantine/core", "@mantine/hooks"] },
    { label: "Radix UI (primitives)", packages: ["@radix-ui/react-dialog"] },
    { label: "DaisyUI (Tailwind plugin)", packagesDev: ["daisyui"] },
  ],
  "UX / Animation": [
    { label: "Framer Motion", packages: ["framer-motion"] },
    { label: "Lottie", packages: ["lottie-react"] },
    { label: "GSAP", packages: ["gsap"] },
    { label: "Three.js", packages: ["three"] },
  ],
  "Forms / Validation": [
    { label: "React Hook Form", packages: ["react-hook-form"] },
    { label: "Zod", packages: ["zod"] },
    { label: "Yup", packages: ["yup"] },
    { label: "Valibot", packages: ["valibot"] },
  ],
  "Data / State": [
    { label: "TanStack Query", packages: ["@tanstack/react-query"] },
    { label: "Zustand", packages: ["zustand"] },
    { label: "Redux Toolkit", packages: ["@reduxjs/toolkit", "react-redux"] },
    { label: "Jotai", packages: ["jotai"] },
    { label: "Recoil", packages: ["recoil"] },
  ],
  Testing: [
    { label: "Vitest", packagesDev: ["vitest"] },
    {
      label: "Playwright",
      packagesDev: ["@playwright/test"],
      post: "playwright-install",
    },
    { label: "Jest", packagesDev: ["jest", "ts-jest", "@types/jest"] },
    { label: "Cypress", packagesDev: ["cypress"] },
  ],
  "Backend / API": [
    { label: "Axios", packages: ["axios"] },
    {
      label: "TRPC",
      packages: ["@trpc/client", "@trpc/server", "@trpc/react-query"],
    },
    { label: "Socket.io Client", packages: ["socket.io-client"] },
  ],
};

const PY = {
  "TUI / UI": [
    { label: "Rich", packages: ["rich"] },
    { label: "Typer (CLI)", packages: ["typer"] },
    { label: "Textual", packages: ["textual"] },
    { label: "Flet", packages: ["flet"] },
  ],
  Web: [
    { label: "FastAPI", packages: ["fastapi", "uvicorn[standard]"] },
    { label: "Flask", packages: ["flask"] },
    { label: "Django", packages: ["django"] },
    { label: "Starlette", packages: ["starlette"] },
    { label: "Litestar", packages: ["litestar"] },
  ],
  "Data Science": [
    { label: "Pandas", packages: ["pandas"] },
    { label: "NumPy", packages: ["numpy"] },
    { label: "Matplotlib", packages: ["matplotlib"] },
    { label: "Scikit-learn", packages: ["scikit-learn"] },
  ],
  Testing: [
    { label: "Pytest", packages: ["pytest"] },
    { label: "Unittest", packages: [] }, // builtin
  ],
};

const RUST = {
  Web: [
    { label: "Axum", packages: ["axum", "tokio"] },
    { label: "Actix-web", packages: ["actix-web"] },
    { label: "Rocket", packages: ["rocket"] },
    { label: "Yew", packages: ["yew"] },
    { label: "Leptos", packages: ["leptos"] },
  ],
  "CLI / TUI": [
    { label: "Clap", packages: ["clap"] },
    { label: "Ratatui", packages: ["ratatui"] },
    { label: "Dialoguer", packages: ["dialoguer"] },
    { label: "Inquire", packages: ["inquire"] },
  ],
  "Async / Runtime": [{ label: "Tokio", packages: ["tokio"] }],
  Serialization: [{ label: "Serde", packages: ["serde", "serde_json"] }],
  "ORM / DB": [
    { label: "Diesel", packages: ["diesel"] },
    { label: "SQLx", packages: ["sqlx"] },
    { label: "SeaORM", packages: ["sea-orm"] },
  ],
  Utilities: [
    { label: "Anyhow", packages: ["anyhow"] },
    { label: "Thiserror", packages: ["thiserror"] },
    { label: "Log", packages: ["log"] },
    { label: "Env_logger", packages: ["env_logger"] },
  ],
};

const GO = {
  Web: [
    { label: "Gin", packages: ["github.com/gin-gonic/gin"] },
    { label: "Echo", packages: ["github.com/labstack/echo/v4"] },
    { label: "Fiber", packages: ["github.com/gofiber/fiber/v2"] },
    { label: "Chi", packages: ["github.com/go-chi/chi/v5"] },
  ],
  CLI: [
    { label: "Cobra", packages: ["github.com/spf13/cobra"] },
    { label: "Viper", packages: ["github.com/spf13/viper"] },
    { label: "Bubbletea", packages: ["github.com/charmbracelet/bubbletea"] },
  ],
  "ORM / DB": [
    { label: "GORM", packages: ["gorm.io/gorm"] },
    { label: "Ent", packages: ["entgo.io/ent"] },
    { label: "Sqlc", packages: ["github.com/kyleconroy/sqlc/cmd/sqlc"] },
  ],
};

function getCatalog(language) {
  if (language === "JavaScript/TypeScript") return JS_TS;
  if (language === "Python") return PY;
  if (language === "Rust") return RUST;
  if (language === "Go") return GO;
  return {};
}

module.exports = {
  getCatalog,
};
