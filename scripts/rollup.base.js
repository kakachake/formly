import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import externalGlobals from "rollup-plugin-external-globals";
import injectProcessEnv from "rollup-plugin-inject-process-env";
import { terser } from "rollup-plugin-terser";
import dts from "rollup-plugin-dts";

import { defineConfig } from "rollup";

const presets = () => {
  const externals = {
    vue: "Vue",
    react: "React",
  };
  return [
    typescript({
      tsconfig: "./tsconfig.build.json",
      tsconfigOverride: {
        compilerOptions: {
          declaration: false,
          module: "ESNext",
        },
      },
    }),
    resolve(),
    commonjs(),
    externalGlobals(externals, {
      exclude: ["**/*.{less,sass,scss}"],
    }),
  ];
};

const createEnvPlugin = (env) => {
  return injectProcessEnv(
    {
      NODE_ENV: env,
    },
    {
      exclude: "**/*.{css,less,sass,scss}",
      verbose: false,
    }
  );
};

export default (filename, targetname, ...plugins) => {
  const base = defineConfig([
    {
      input: "src/index.ts",
      output: {
        format: "umd",
        file: `dist/${filename}.umd.development.js`,
        name: targetname,
        sourcemap: true,
        amd: {
          id: filename,
        },
        globals: {},
      },
      external: ["react", "react-dom"],
      plugins: [...presets(), ...plugins, createEnvPlugin("development")],
    },
    {
      input: "src/index.ts",
      output: {
        format: "umd",
        file: `dist/${filename}.umd.production.js`,
        name: targetname,
        sourcemap: true,
        amd: {
          id: filename,
        },
        globals: {},
      },
      external: ["react", "react-dom"],
      plugins: [
        ...presets(),
        terser(),
        ...plugins,
        createEnvPlugin("development"),
      ],
    },
    {
      input: "esm/index.d.ts",
      output: {
        format: "es",
        file: `dist/${filename}.d.ts`,
      },
      plugins: [dts(), ...plugins],
    },
    {
      input: "esm/index.d.ts",
      output: {
        format: "es",
        file: `dist/${filename}.all.d.ts`,
      },
      plugins: [
        dts({
          respectExternal: true,
        }),
        ...plugins,
      ],
    },
  ]);

  return base;
};
