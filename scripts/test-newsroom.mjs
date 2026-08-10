import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const handler = require("../lib/api/_news-editor.js");

process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_ANON_KEY = "anon-test-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-test-key";
process.env.SONIC_OWNER_EMAILS = "owner@sonicsearch.test";
process.env.NODE_ENV = "test";

const originalFetch = globalThis.fetch;

function response(status, payload) {
  return new Response(payload === null ? "" : JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function mockRequest({ method = "GET", query = {}, body = {}, token = "" } = {}) {
  return {
    method,
    query,
    body,
    url: `/api/news-editor?${new URLSearchParams(query)}`,
    headers: {
      host: "localhost:8794",
      ...(token ? { authorization: `Bearer ${token}` } : {})
    }
  };
}

function mockResponse() {
  const headers = new Map();
  let rawBody = "";
  return {
    statusCode: 200,
    setHeader(name, value) {
      headers.set(String(name).toLowerCase(), String(value));
    },
    end(value = "") {
      rawBody = String(value || "");
    },
    json() {
      return rawBody ? JSON.parse(rawBody) : {};
    },
    headers
  };
}

const row = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "festa-na-naturaiz-20260722",
  status: "published",
  category: "Agenda",
  eyebrow: "Jornal Sonic",
  title: "Festa movimenta a Naturaiz neste fim de semana",
  excerpt: "Uma noite dedicada à cena eletrônica do Ceará.",
  body: "Primeiro parágrafo.\n\nSegundo parágrafo.",
  cover_image_url: "https://images.example/cover.jpg",
  cover_image_alt: "Pista iluminada",
  image_credit: "Foto: Equipe da festa",
  author_name: "Redação Sonic Search",
  venue_name: "Naturaiz",
  city: "Fortaleza",
  state: "Ceará",
  event_starts_at: "2026-07-25T23:00:00.000Z",
  event_ends_at: null,
  lineup: [{ name: "DJ Teste", time: "23h", role: "" }],
  service_info: {
    address: "Fortaleza",
    price: "R$ 50",
    ageRating: "18 anos",
    _sonicTranslations: {
      en: {
        title: "A party brings new names together at Naturaiz",
        excerpt: "A night devoted to Ceará's electronic scene.",
        body: "First paragraph.\n\nSecond paragraph.",
        serviceInfo: { price: "From BRL 50" }
      }
    }
  },
  ticket_url: "https://tickets.example/event",
  instagram_url: "https://instagram.com/evento",
  cta_label: "Ver evento",
  is_sponsored: false,
  disclosure: "",
  published_at: "2026-07-22T12:00:00.000Z",
  created_at: "2026-07-22T11:00:00.000Z",
  updated_at: "2026-07-22T12:00:00.000Z"
};

async function testPublicList() {
  globalThis.fetch = async (url, options = {}) => {
    assert.match(String(url), /\/rest\/v1\/news_articles/);
    assert.equal(options.method, "GET");
    return response(200, [row]);
  };
  const res = mockResponse();
  await handler(mockRequest({ query: { limit: "10" } }), res);
  const payload = res.json();
  assert.equal(res.statusCode, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.articles[0].title, row.title);
  assert.equal(payload.articles[0].coverImageUrl, row.cover_image_url);
  assert.deepEqual(payload.articles[0].lineup, row.lineup);
  assert.equal(payload.articles[0].translations.en.title, row.service_info._sonicTranslations.en.title);
  assert.equal(payload.articles[0].translations.en.serviceInfo.price, "From BRL 50");
  assert.equal(payload.articles[0].serviceInfo._sonicTranslations, undefined);
  assert.deepEqual(payload.pagination, {
    limit: 10,
    offset: 0,
    hasMore: false,
    nextOffset: null
  });
}

async function testPublicPagination() {
  globalThis.fetch = async (url, options = {}) => {
    const target = new URL(String(url));
    assert.equal(options.method, "GET");
    assert.equal(target.searchParams.get("limit"), "3");
    assert.equal(target.searchParams.get("offset"), "1");
    return response(200, [row, { ...row, id: "33333333-3333-4333-8333-333333333333" }, { ...row, id: "44444444-4444-4444-8444-444444444444" }]);
  };
  const res = mockResponse();
  await handler(mockRequest({ query: { limit: "2", offset: "1" } }), res);
  const payload = res.json();
  assert.equal(res.statusCode, 200);
  assert.equal(payload.articles.length, 2);
  assert.deepEqual(payload.pagination, {
    limit: 2,
    offset: 1,
    hasMore: true,
    nextOffset: 3
  });
}

async function testAdminCreate() {
  let inserted = null;
  globalThis.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target.endsWith("/auth/v1/user")) {
      assert.equal(options.headers.Authorization, "Bearer admin-token");
      return response(200, { id: "22222222-2222-4222-8222-222222222222", email: "owner@sonicsearch.test" });
    }
    if (target.includes("/rest/v1/news_articles")) {
      inserted = JSON.parse(options.body);
      return response(201, [{ ...row, ...inserted, id: row.id }]);
    }
    throw new Error(`Unexpected fetch: ${target}`);
  };
  const res = mockResponse();
  await handler(mockRequest({
    method: "POST",
    token: "admin-token",
    body: {
      article: {
        status: "published",
        category: "Agenda",
        title: row.title,
        excerpt: row.excerpt,
        body: row.body,
        venueName: "Naturaiz",
        city: "Fortaleza",
        state: "Ceará",
        lineup: row.lineup,
        serviceInfo: {
          media: [{
            url: "https://images.example/naturaiz.jpg",
            alt: "Arte do Naturaíz",
            caption: "Naturaíz chega ao Ceará.",
            credit: "Divulgação / Naturaíz",
            afterParagraph: 2
          }],
          relatedLinks: [{
            label: "Ingressos Naturaíz",
            url: "https://tickets.example/naturaiz"
          }]
        },
        translations: {
          en: {
            category: "Agenda",
            title: "A party brings new names together at Naturaiz",
            excerpt: "A night devoted to Ceará's electronic scene.",
            body: "First paragraph.\n\nSecond paragraph.",
            serviceInfo: {
              price: "From BRL 50",
              media: [
                {},
                { caption: "A second translated caption." }
              ]
            }
          },
          es: {
            title: "Una fiesta reúne nuevos nombres en Naturaiz",
            excerpt: "Una noche dedicada a la escena electrónica de Ceará.",
            body: "Primer párrafo.\n\nSegundo párrafo."
          },
          fr: {
            title: "This unsupported locale must be discarded"
          }
        }
      }
    }
  }), res);
  const payload = res.json();
  assert.equal(res.statusCode, 201);
  assert.equal(payload.ok, true);
  assert.equal(inserted.status, "published");
  assert.ok(inserted.published_at);
  assert.equal(inserted.created_by, "22222222-2222-4222-8222-222222222222");
  assert.deepEqual(inserted.service_info.media, [{
    url: "https://images.example/naturaiz.jpg",
    alt: "Arte do Naturaíz",
    caption: "Naturaíz chega ao Ceará.",
    credit: "Divulgação / Naturaíz",
    afterParagraph: 2
  }]);
  assert.deepEqual(inserted.service_info.relatedLinks, [{
    label: "Ingressos Naturaíz",
    url: "https://tickets.example/naturaiz"
  }]);
  assert.equal(inserted.translations, undefined);
  assert.equal(inserted.service_info._sonicTranslations.en.title, "A party brings new names together at Naturaiz");
  assert.equal(inserted.service_info._sonicTranslations.es.title, "Una fiesta reúne nuevos nombres en Naturaiz");
  assert.equal(inserted.service_info._sonicTranslations.fr, undefined);
  assert.deepEqual(inserted.service_info._sonicTranslations.en.serviceInfo.media, [
    {},
    { caption: "A second translated caption." }
  ]);
  assert.equal(payload.article.serviceInfo._sonicTranslations, undefined);
  assert.equal(payload.article.translations.es.title, "Una fiesta reúne nuevos nombres en Naturaiz");
}

async function testAdminUpload() {
  let uploaded = false;
  globalThis.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target.endsWith("/auth/v1/user")) {
      return response(200, { id: "22222222-2222-4222-8222-222222222222", email: "owner@sonicsearch.test" });
    }
    if (target.includes("/storage/v1/object/news-media/")) {
      uploaded = Buffer.isBuffer(options.body) && options.body.length > 0;
      return response(200, { Key: "news-media/test.jpg" });
    }
    throw new Error(`Unexpected fetch: ${target}`);
  };
  const res = mockResponse();
  await handler(mockRequest({
    method: "POST",
    token: "admin-token",
    body: {
      action: "upload-cover",
      fileName: "capa.jpg",
      fileDataUrl: `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 0xff, 0xd9]).toString("base64")}`
    }
  }), res);
  const payload = res.json();
  assert.equal(res.statusCode, 201);
  assert.equal(uploaded, true);
  assert.match(payload.url, /\/storage\/v1\/object\/public\/news-media\//);
}

async function testAdminServiceUpdatePreservesTranslations() {
  let updated = null;
  globalThis.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target.endsWith("/auth/v1/user")) {
      return response(200, { id: "22222222-2222-4222-8222-222222222222", email: "owner@sonicsearch.test" });
    }
    if (target.includes("/rest/v1/news_articles") && options.method === "GET") {
      return response(200, [{ service_info: row.service_info }]);
    }
    if (target.includes("/rest/v1/news_articles") && options.method === "PATCH") {
      updated = JSON.parse(options.body);
      return response(200, [{ ...row, ...updated }]);
    }
    throw new Error(`Unexpected fetch: ${target}`);
  };
  const res = mockResponse();
  await handler(mockRequest({
    method: "PATCH",
    token: "admin-token",
    body: {
      id: row.id,
      article: {
        serviceInfo: { address: "Novo endereço", price: "R$ 75" }
      }
    }
  }), res);
  const payload = res.json();
  assert.equal(res.statusCode, 200);
  assert.equal(updated.service_info.address, "Novo endereço");
  assert.equal(updated.service_info._sonicTranslations.en.title, "A party brings new names together at Naturaiz");
  assert.equal(payload.article.serviceInfo._sonicTranslations, undefined);
  assert.equal(payload.article.translations.en.title, "A party brings new names together at Naturaiz");
}

try {
  await testPublicList();
  await testPublicPagination();
  await testAdminCreate();
  await testAdminServiceUpdatePreservesTranslations();
  await testAdminUpload();
  console.log("Newsroom API tests passed: public feed, protected publish, and cover upload.");
} finally {
  globalThis.fetch = originalFetch;
}
