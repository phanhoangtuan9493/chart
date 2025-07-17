module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "nativewind/babel",
      [
        "module-resolver",
        {
          root: ["./src"],
          extensions: [".ts", ".tsx", ".jsx", ".js", ".json"],
          alias: {
            "@navigation": "./src/navigation",
            "@screens": "./src/screens",
            "@localization": "./src/localization",
            "@components": "./src/components",
            "@hooks": "./src/hooks",
            "@constants": "./src/constants",
            "@store": "./src/store",
          },
        },
      ],
    ],
  };
};
