import config from "eslint-config-next/core-web-vitals";

export default config.map((c) => {
  if (!c.rules) return c;
  return {
    ...c,
    rules: {
      ...c.rules,
      // Too strict for this repo right now; blocks common time/UX patterns.
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "@next/next/no-page-custom-font": "off",
    },
  };
});
