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
  ],
  "Forms / Validation": [
    { label: "React Hook Form", packages: ["react-hook-form"] },
    { label: "Zod", packages: ["zod"] },
    { label: "Yup", packages: ["yup"] },
  ],
  "Data / State": [
    { label: "TanStack Query", packages: ["@tanstack/react-query"] },
    { label: "Zustand", packages: ["zustand"] },
    { label: "Redux Toolkit", packages: ["@reduxjs/toolkit", "react-redux"] },
  ],
  Testing: [
    { label: "Vitest", packagesDev: ["vitest"] },
    {
      label: "Playwright",
      packagesDev: ["@playwright/test"],
      post: "playwright-install",
    },
  ],
};

const PY = {
  "TUI / UI": [
    { label: "Rich", packages: ["rich"] },
    { label: "Typer (CLI)", packages: ["typer"] },
    { label: "Textual", packages: ["textual"] },
  ],
  Web: [
    { label: "FastAPI", packages: ["fastapi", "uvicorn"] },
    { label: "Flask", packages: ["flask"] },
    { label: "Django", packages: ["django"] },
  ],
};

function getCatalog(language) {
  if (language === "JavaScript/TypeScript") return JS_TS;
  if (language === "Python") return PY;
  return {};
}

module.exports = {
  getCatalog,
};
