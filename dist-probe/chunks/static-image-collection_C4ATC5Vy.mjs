globalThis.process ??= {};
globalThis.process.env ??= {};
import { J as joinPaths, X as removeBase, Y as prependForwardSlash } from "./console_B-OutPbu.mjs";
import { t as getInstalledRenderScope } from "./entrypoints_Cx3U1hht.mjs";
import { s as isESMImportedImage } from "./service_DVTl5eNc.mjs";
import { n as propsToFilename, t as hashTransform } from "./assets_Bfsta2bi.mjs";
//#region node_modules/astro/dist/core/render-scope/record.js
function recordStaticImage(image) {
	getInstalledRenderScope()?.getStore()?.staticImages?.push(image);
}
//#endregion
//#region node_modules/@astrojs/cloudflare/dist/utils/static-image-collection.js
function installAddStaticImage(config) {
	if (globalThis.astroAsset?.addStaticImage) return;
	if (!globalThis.astroAsset) globalThis.astroAsset = { referencedImages: /* @__PURE__ */ new Set() };
	globalThis.astroAsset.addStaticImage = (options, hashProperties, _originalFSPath) => {
		if (!globalThis.astroAsset.staticImages) globalThis.astroAsset.staticImages = /* @__PURE__ */ new Map();
		const ESMImportedImageSrc = isESMImportedImage(options.src) ? options.src.src : options.src;
		const finalOriginalPath = removeBase(removeBase(ESMImportedImageSrc, config.base), config.assetsPrefix ?? "");
		const hash = hashTransform(options, config.imageServiceEntrypoint, hashProperties);
		let finalFilePath;
		let transformsForPath = globalThis.astroAsset.staticImages.get(finalOriginalPath);
		const transformForHash = transformsForPath?.transforms.get(hash);
		if (transformsForPath && transformForHash) finalFilePath = transformForHash.finalPath;
		else {
			finalFilePath = prependForwardSlash(joinPaths(isESMImportedImage(options.src) ? "" : config.buildAssets, prependForwardSlash(propsToFilename(finalOriginalPath, options, hash))));
			if (!transformsForPath) {
				globalThis.astroAsset.staticImages.set(finalOriginalPath, {
					originalSrcPath: _originalFSPath,
					transforms: /* @__PURE__ */ new Map()
				});
				transformsForPath = globalThis.astroAsset.staticImages.get(finalOriginalPath);
			}
			transformsForPath.transforms.set(hash, {
				finalPath: finalFilePath,
				transform: options
			});
		}
		recordStaticImage({
			originalPath: finalOriginalPath,
			hash,
			finalPath: finalFilePath,
			originalSrcPath: _originalFSPath,
			transform: options
		});
		if (config.assetsPrefix) return encodeURI(joinPaths(config.assetsPrefix, finalFilePath));
		return encodeURI(prependForwardSlash(joinPaths(config.base, finalFilePath)));
	};
}
//#endregion
export { installAddStaticImage };
