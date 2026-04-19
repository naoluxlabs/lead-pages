import { c as createComponent } from './astro-component_BBrI9IJz.mjs';
import 'piccolore';
import { l as generateCspDigest, s as spreadAttributes, u as unescapeHTML, r as renderTemplate, n as removeBase, b as isRemotePath, A as AstroError, o as UnknownContentCollectionError, p as defineScriptVars, q as renderHead, h as addAttribute } from './entrypoint_CkoFHobM.mjs';
import 'clsx';
import 'html-escaper';
import { Traverse } from 'neotraverse/modern';
import * as z from 'zod/v4';
import { b as VALID_INPUT_FORMATS } from './consts_BLFvATRa.mjs';
import * as devalue from 'devalue';

function createSvgComponent({ meta, attributes, children, styles }) {
  const hasStyles = styles.length > 0;
  const Component = createComponent({
    async factory(result, props) {
      const normalizedProps = normalizeProps(attributes, props);
      if (hasStyles && result.cspDestination) {
        for (const style of styles) {
          const hash = await generateCspDigest(style, result.cspAlgorithm);
          result._metadata.extraStyleHashes.push(hash);
        }
      }
      return renderTemplate`<svg${spreadAttributes(normalizedProps)}>${unescapeHTML(children)}</svg>`;
    },
    propagation: hasStyles ? "self" : "none"
  });
  Object.defineProperty(Component, "toJSON", {
    value: () => meta,
    enumerable: false
  });
  return Object.assign(Component, meta);
}
const ATTRS_TO_DROP = ["xmlns", "xmlns:xlink", "version"];
const DEFAULT_ATTRS = {};
function dropAttributes(attributes) {
  for (const attr of ATTRS_TO_DROP) {
    delete attributes[attr];
  }
  return attributes;
}
function normalizeProps(attributes, props) {
  return dropAttributes({ ...DEFAULT_ATTRS, ...attributes, ...props });
}

const CONTENT_IMAGE_FLAG = "astroContentImageFlag";
const IMAGE_IMPORT_PREFIX = "__ASTRO_IMAGE_";

function imageSrcToImportId(imageSrc, filePath) {
  imageSrc = removeBase(imageSrc, IMAGE_IMPORT_PREFIX);
  if (isRemotePath(imageSrc)) {
    return;
  }
  const ext = imageSrc.split(".").at(-1)?.toLowerCase();
  if (!ext || !VALID_INPUT_FORMATS.includes(ext)) {
    return;
  }
  const params = new URLSearchParams(CONTENT_IMAGE_FLAG);
  if (filePath) {
    params.set("importer", filePath);
  }
  return `${imageSrc}?${params.toString()}`;
}

class ImmutableDataStore {
  _collections = /* @__PURE__ */ new Map();
  constructor() {
    this._collections = /* @__PURE__ */ new Map();
  }
  get(collectionName, key) {
    return this._collections.get(collectionName)?.get(String(key));
  }
  entries(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.entries()];
  }
  values(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.values()];
  }
  keys(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.keys()];
  }
  has(collectionName, key) {
    const collection = this._collections.get(collectionName);
    if (collection) {
      return collection.has(String(key));
    }
    return false;
  }
  hasCollection(collectionName) {
    return this._collections.has(collectionName);
  }
  collections() {
    return this._collections;
  }
  /**
   * Attempts to load a DataStore from the virtual module.
   * This only works in Vite.
   */
  static async fromModule() {
    try {
      const data = await import('./_astro_data-layer-content_DDg9o50P.mjs');
      if (data.default instanceof Map) {
        return ImmutableDataStore.fromMap(data.default);
      }
      const map = devalue.unflatten(data.default);
      return ImmutableDataStore.fromMap(map);
    } catch {
    }
    return new ImmutableDataStore();
  }
  static async fromMap(data) {
    const store = new ImmutableDataStore();
    store._collections = data;
    return store;
  }
}
function dataStoreSingleton() {
  let instance = void 0;
  return {
    get: async () => {
      if (!instance) {
        instance = ImmutableDataStore.fromModule();
      }
      return instance;
    },
    set: (store) => {
      instance = store;
    }
  };
}
const globalDataStore = dataStoreSingleton();

z.object({
  tags: z.array(z.string()).optional(),
  lastModified: z.date().optional()
});
function createGetCollection({
  liveCollections
}) {
  return async function getCollection(collection, filter) {
    if (collection in liveCollections) {
      throw new AstroError({
        ...UnknownContentCollectionError,
        message: `Collection "${collection}" is a live collection. Use getLiveCollection() instead of getCollection().`
      });
    }
    const hasFilter = typeof filter === "function";
    const store = await globalDataStore.get();
    if (store.hasCollection(collection)) {
      const { default: imageAssetMap } = await import('./content-assets_DleWbedO.mjs');
      const result = [];
      for (const rawEntry of store.values(collection)) {
        const data = updateImageReferencesInData(rawEntry.data, rawEntry.filePath, imageAssetMap);
        let entry = {
          ...rawEntry,
          data,
          collection
        };
        if (hasFilter && !filter(entry)) {
          continue;
        }
        result.push(entry);
      }
      return result;
    } else {
      console.warn(
        `The collection ${JSON.stringify(
          collection
        )} does not exist or is empty. Please check your content config file for errors.`
      );
      return [];
    }
  };
}
function updateImageReferencesInData(data, fileName, imageAssetMap) {
  return new Traverse(data).map(function(ctx, val) {
    if (typeof val === "string" && val.startsWith(IMAGE_IMPORT_PREFIX)) {
      const src = val.replace(IMAGE_IMPORT_PREFIX, "");
      const id = imageSrcToImportId(src, fileName);
      if (!id) {
        ctx.update(src);
        return;
      }
      const imported = imageAssetMap?.get(id);
      if (imported) {
        if (imported.__svgData) {
          const { __svgData: svgData, ...meta } = imported;
          ctx.update(createSvgComponent({ meta, ...svgData }));
        } else {
          ctx.update(imported);
        }
      } else {
        ctx.update(src);
      }
    }
  });
}

// astro-head-inject

const liveCollections = {};

const getCollection = createGetCollection({
	liveCollections,
});

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
async function getStaticPaths() {
  const resources = await getCollection("resources");
  return resources.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry }
  }));
}
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const { entry } = Astro2.props;
  const { title, headline, subtitle, pdfUrl, valueProps, ctaText, previewDescription, pages, type } = entry.data;
  const { Content } = await entry.render();
  return renderTemplate(_a || (_a = __template(['<html lang="en" data-astro-cid-3kblmlr2> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>', ' — Naolux Labs</title><meta name="description"', ">", '</head> <body data-astro-cid-3kblmlr2> <div class="container" data-astro-cid-3kblmlr2> <div class="badge" data-astro-cid-3kblmlr2>Free ', "</div> <h1 data-astro-cid-3kblmlr2>", '</h1> <p class="subtitle" data-astro-cid-3kblmlr2>', '</p> <p class="meta" data-astro-cid-3kblmlr2>', ' pages · Instant download</p> <ul class="value-props" data-astro-cid-3kblmlr2> ', ' </ul> <form id="form" data-astro-cid-3kblmlr2> <input type="text" id="name" placeholder="Your first name" required data-astro-cid-3kblmlr2> <input type="email" id="email" placeholder="Your email address" required data-astro-cid-3kblmlr2> <button type="submit" data-astro-cid-3kblmlr2>', ' →</button> </form> <p class="note" data-astro-cid-3kblmlr2>No spam. Unsubscribe anytime.</p> <div class="success" id="success" data-astro-cid-3kblmlr2>✓ Your guide is downloading now!</div> </div> <script>(function(){', "\n    document.getElementById('form').addEventListener('submit', async (e) => {\n      e.preventDefault();\n      const name = document.getElementById('name').value;\n      const email = document.getElementById('email').value;\n      try {\n        await fetch('/api/capture', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, source: window.location.pathname }) });\n      } catch {}\n      document.getElementById('form').style.display = 'none';\n      document.getElementById('success').style.display = 'block';\n      const a = document.createElement('a');\n      a.href = pdfUrl;\n      a.download = '';\n      document.body.appendChild(a);\n      a.click();\n      document.body.removeChild(a);\n    });\n  })();<\/script> </body> </html>"])), title, addAttribute(previewDescription, "content"), renderHead(), type, headline, subtitle, pages, valueProps.map((prop) => renderTemplate`<li data-astro-cid-3kblmlr2>${prop}</li>`), ctaText, defineScriptVars({ pdfUrl }));
}, "/Users/kylesoller/ai-content-system/lead-pages/src/pages/resources/[slug].astro", void 0);

const $$file = "/Users/kylesoller/ai-content-system/lead-pages/src/pages/resources/[slug].astro";
const $$url = "/resources/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
