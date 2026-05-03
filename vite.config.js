import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/MSCI/",
  resolve: {
    alias: [
      {
        find: "./model/msciV2QuestionBank",
        replacement: "/src/model/msciV2QuestionBankBalanced.js",
      },
    ],
  },
});
