import path from "node:path"

import vue from "@vitejs/plugin-vue"
import * as vite from "vite"

export default vite.defineConfig((config) => {
	return {
		root: path.join(import.meta.dirname, "src"),
		base: "./",

		cacheDir: path.join(import.meta.dirname, "cache"),
		publicDir: path.join(import.meta.dirname, "public"),

		build: {
			outDir: path.join(import.meta.dirname, "build", config.mode),
			emptyOutDir: true,

			assetsDir: "",
			assetsInlineLimit: 0,

			rollupOptions: {
				input: [path.join(import.meta.dirname, "src", "index.html")],
			},
		},

		resolve: {
			alias: {
				"@": path.join(import.meta.dirname, "src"),
			},
		},

		plugins: [vue()],

		css: {
			preprocessorOptions: {
				sass: {
					api: "modern-compiler",
				},
			},
		},
	}
})
