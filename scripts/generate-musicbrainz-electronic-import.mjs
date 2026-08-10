#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_OUTPUT = path.join(ROOT, "reports", "musicbrainz_electronic_candidates.rows.json");
const DEFAULT_REPORT = path.join(ROOT, "reports", "musicbrainz-electronic-candidates-latest.md");
const BATCH = "musicbrainz_electronic_candidates_v1";
const GATE_VERSION = "20260713_electronic_v2";
const BROAD_STYLE = "electronic_unclassified";

function parseArgs(argv) {
  const args = {
    dumpDir: "",
    output: DEFAULT_OUTPUT,
    report: DEFAULT_REPORT,
    minScore: 1,
    maxAliases: 10,
    includeBroad: true
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dump-dir") args.dumpDir = path.resolve(ROOT, argv[++index] || "");
    else if (arg.startsWith("--dump-dir=")) args.dumpDir = path.resolve(ROOT, arg.slice("--dump-dir=".length));
    else if (arg === "--output") args.output = path.resolve(ROOT, argv[++index] || "");
    else if (arg.startsWith("--output=")) args.output = path.resolve(ROOT, arg.slice("--output=".length));
    else if (arg === "--report") args.report = path.resolve(ROOT, argv[++index] || "");
    else if (arg.startsWith("--report=")) args.report = path.resolve(ROOT, arg.slice("--report=".length));
    else if (arg === "--min-score") args.minScore = Number(argv[++index] || 1);
    else if (arg.startsWith("--min-score=")) args.minScore = Number(arg.slice("--min-score=".length));
    else if (arg === "--max-aliases") args.maxAliases = Number(argv[++index] || 10);
    else if (arg.startsWith("--max-aliases=")) args.maxAliases = Number(arg.slice("--max-aliases=".length));
    else if (arg === "--exclude-broad") args.includeBroad = false;
  }
  if (!Number.isFinite(args.minScore) || args.minScore < 0) args.minScore = 1;
  if (!Number.isFinite(args.maxAliases) || args.maxAliases < 0) args.maxAliases = 10;
  args.minScore = Math.floor(args.minScore);
  args.maxAliases = Math.floor(args.maxAliases);
  return args;
}

function normalize(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function cleanField(value = "") {
  return value === "\\N" ? "" : String(value || "").trim();
}

function decodeHtml(value = "") {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseStyleOptions() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const select = html.match(/<select\s+id=["']style["'][^>]*>([\s\S]*?)<\/select>/i)?.[1] || "";
  const styles = [];
  const optionPattern = /<option\s+value=["']([^"']+)["'][^>]*>([\s\S]*?)<\/option>/gi;
  let match;
  while ((match = optionPattern.exec(select))) {
    const slug = cleanField(match[1]);
    const displayName = decodeHtml(match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    if (slug && displayName) styles.push({ slug, displayName });
  }
  if (!styles.length) throw new Error("Nenhum subgenero encontrado no select #style de index.html.");
  return styles;
}

function buildTagMap(styles, includeBroad) {
  const tags = new Map();
  const add = (tag, slug) => {
    const key = normalize(tag);
    if (key && slug && !tags.has(key)) tags.set(key, slug);
  };

  styles.forEach(({ slug, displayName }) => {
    add(slug.replace(/_/g, " "), slug);
    add(displayName, slug);
    displayName.split("/").forEach((part) => add(part, slug));
  });

  const aliases = {
    "dnb": "drum_and_bass",
    "d and b": "drum_and_bass",
    "drum n bass": "drum_and_bass",
    "drum & bass": "drum_and_bass",
    "liquid drum and bass": "liquid_dnb",
    "liquid drum n bass": "liquid_dnb",
    "psy trance": "psytrance",
    "psychill": "psybient",
    "fullon": "full_on",
    "full on psytrance": "full_on",
    "hi tech psytrance": "hi_tech",
    "hitech psytrance": "hi_tech",
    "2 step": "uk_garage",
    "2step": "uk_garage",
    "ukg": "uk_garage",
    "filter house": "french_house",
    "industrial body music": "ebm",
    "intelligent dance music": "idm",
    "electronic body music": "ebm",
    "electro acoustic": "electroacoustic",
    "musique concrete": "musique_concrete",
    "nu skool breaks": "nu_skool_breaks",
    "new skool breaks": "nu_skool_breaks",
    "juke": "footwork_juke",
    "footwork": "footwork_juke",
    "vogue beats": "ballroom_vogue_beats",
    "ballroom": "ballroom_vogue_beats",
    "brazilian bass": "brazilian_funk",
    "baile funk": "brazilian_funk",
    "funk carioca": "brazilian_funk",
    "hard acid techno": "acid_techno",
    "acid house": "acid_techno",
    "hardtek": "hard_techno",
    "tribecore": "hard_techno",
    "free tekno": "hard_techno",
    "hardcore techno": "hardcore",
    "happy hardcore": "uk_hardcore",
    "gabba": "gabber",
    "italo dance": "italo_disco",
    "synth pop": "futurepop",
    "synthpop": "futurepop",
    "electropop": "electronic_dance_pop",
    "dance pop": "electronic_dance_pop",
    "electroclash": "electro",
    "kosmische": "kosmische_musik",
    "ambient music": "ambient",
    "dark ambient music": "dark_ambient"
  };
  Object.entries(aliases).forEach(([tag, slug]) => add(tag, slug));

  if (includeBroad) {
    [
      "electronic",
      "electronic music",
      "electronica",
      "experimental electronic",
      "dance music",
      "electronic dance music"
    ].forEach((tag) => add(tag, BROAD_STYLE));
  }
  return tags;
}

function findDumpFile(dumpDir, filename, required = true) {
  const candidates = [
    path.join(dumpDir, filename),
    path.join(dumpDir, "mbdump", filename)
  ];
  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found && required) {
    throw new Error(`Arquivo MusicBrainz ausente: ${filename}. Procurei em ${candidates.join(" e ")}.`);
  }
  return found || "";
}

async function forEachTsvLine(filePath, callback) {
  const input = fs.createReadStream(filePath, { encoding: "utf8" });
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  let lineNumber = 0;
  for await (const line of lines) {
    lineNumber += 1;
    if (!line) continue;
    await callback(line.split("\t"), lineNumber);
  }
}

function addArtistStyle(artistStyles, artistId, style, tag, score) {
  let styles = artistStyles.get(artistId);
  if (!styles) {
    styles = new Map();
    artistStyles.set(artistId, styles);
  }
  const current = styles.get(style) || { score: 0, tags: new Map() };
  current.score += score;
  current.tags.set(tag, Number(current.tags.get(tag) || 0) + score);
  styles.set(style, current);
}

function topTags(tagScores, limit = 12) {
  return [...tagScores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("pt-BR");
}

async function writeChunk(writer, chunk) {
  if (!writer.write(chunk)) await once(writer, "drain");
}

function buildReport({ args, files, summary, styleCounts, styles }) {
  const styleNames = new Map(styles.map(({ slug, displayName }) => [slug, displayName]));
  styleNames.set(BROAD_STYLE, "Electronic (sem subgênero confirmado)");
  const rows = [...styleCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([style, count]) => `| ${styleNames.get(style) || style} | \`${style}\` | ${formatNumber(count)} |`)
    .join("\n");
  return `# Candidatos eletrônicos do MusicBrainz

Gerado em ${summary.generatedAt}. Este lote amplia o banco, mas **não publica recomendações**: todos os artistas entram como \`needs_review\` até existir prova em nível de gravação que passe pelo gate eletrônico.

## Resumo

| Métrica | Quantidade |
|---|---:|
| Tags do dump reconhecidas | ${formatNumber(summary.matchedTagDefinitions)} |
| Artistas candidatos únicos | ${formatNumber(summary.uniqueArtists)} |
| Relações artista–subgênero | ${formatNumber(summary.artistStyleRows)} |
| Relações sem subgênero confirmado | ${formatNumber(summary.broadStyleRows)} |
| Faixas publicadas | 0 |

## Cobertura por subgênero candidato

| Subgênero | Chave | Artistas |
|---|---|---:|
${rows || "| — | — | 0 |"}

## Parâmetros e origem

- Diretório do dump: \`${args.dumpDir}\`
- Score mínimo por tag: ${args.minScore}
- Tags eletrônicas amplas: ${args.includeBroad ? "incluídas como electronic_unclassified" : "excluídas"}
- Arquivo \`tag\`: \`${files.tag}\`
- Arquivo \`artist_tag\`: \`${files.artistTag}\`
- Arquivo \`artist\`: \`${files.artist}\`
- Arquivo \`artist_alias\`: ${files.artistAlias ? `\`${files.artistAlias}\`` : "não encontrado (opcional)"}
- Licença declarada no lote: CC0 1.0 (dados centrais do MusicBrainz)

## Próxima etapa segura

1. Importe as linhas em \`catalog_artists\`; os gatilhos da v2 também as normalizam.
2. Enriqueça gravações, IDs e links de reprodução.
3. Só altere para \`published\` quando ao menos uma gravação do subgênero passar por \`electronic_gate=passed\`.
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.dumpDir) {
    throw new Error("Informe --dump-dir com o diretório extraído de mbdump.tar.bz2.");
  }

  const styles = parseStyleOptions();
  const tagAliases = buildTagMap(styles, args.includeBroad);
  const files = {
    tag: findDumpFile(args.dumpDir, "tag"),
    artistTag: findDumpFile(args.dumpDir, "artist_tag"),
    artist: findDumpFile(args.dumpDir, "artist"),
    artistAlias: findDumpFile(args.dumpDir, "artist_alias", false)
  };

  console.log(`Subgeneros do app: ${styles.length}`);
  console.log("Lendo definicoes de tags do MusicBrainz...");
  const matchedTags = new Map();
  await forEachTsvLine(files.tag, (columns) => {
    const id = cleanField(columns[0]);
    const name = cleanField(columns[1]);
    const style = tagAliases.get(normalize(name));
    if (id && name && style) matchedTags.set(id, { name, style });
  });

  console.log(`Tags reconhecidas no dump: ${matchedTags.size}`);
  console.log("Lendo relacoes artista-tag...");
  const artistStyles = new Map();
  await forEachTsvLine(files.artistTag, (columns) => {
    const artistId = cleanField(columns[0]);
    const tag = matchedTags.get(cleanField(columns[1]));
    const score = Number(cleanField(columns[2]) || 0);
    if (!artistId || !tag || !Number.isFinite(score) || score < args.minScore) return;
    addArtistStyle(artistStyles, artistId, tag.style, tag.name, score);
  });

  console.log(`Artistas candidatos por tag: ${artistStyles.size}`);
  const aliasesByArtist = new Map();
  if (files.artistAlias && args.maxAliases > 0) {
    console.log("Lendo aliases dos artistas candidatos...");
    await forEachTsvLine(files.artistAlias, (columns) => {
      const artistId = cleanField(columns[1]);
      const alias = cleanField(columns[2]);
      if (!artistStyles.has(artistId) || !alias) return;
      const aliases = aliasesByArtist.get(artistId) || [];
      if (aliases.length < args.maxAliases && !aliases.some((item) => normalize(item.alias) === normalize(alias))) {
        aliases.push({ alias, locale: cleanField(columns[3]) });
        aliasesByArtist.set(artistId, aliases);
      }
    });
  }

  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.mkdirSync(path.dirname(args.report), { recursive: true });
  const temporaryOutput = `${args.output}.tmp`;
  const writer = fs.createWriteStream(temporaryOutput, { encoding: "utf8" });
  const styleNames = new Map(styles.map(({ slug, displayName }) => [slug, displayName]));
  styleNames.set(BROAD_STYLE, "Electronic (unclassified)");
  const styleCounts = new Map();
  const seenArtists = new Set();
  let rowCount = 0;
  let broadStyleRows = 0;
  let first = true;

  try {
    await writeChunk(writer, '{"artists":[');
    console.log("Lendo artistas e gerando o lote candidato...");
    await forEachTsvLine(files.artist, async (columns) => {
      const artistId = cleanField(columns[0]);
      const relations = artistStyles.get(artistId);
      if (!relations) return;
      const musicbrainzId = cleanField(columns[1]);
      const artist = cleanField(columns[2]);
      const sortName = cleanField(columns[3]);
      if (!musicbrainzId || !artist) return;
      seenArtists.add(musicbrainzId);

      for (const [style, evidence] of relations) {
        const tags = topTags(evidence.tags);
        const row = {
          style,
          artist,
          country: "",
          city: "",
          artist_bio: "",
          artist_genre: styleNames.get(style) || style,
          artist_profile_hint: `Candidato MusicBrainz associado às tags: ${tags.join(", ")}. Exige validação por gravação.`,
          source: "musicbrainz_full_export_candidate",
          source_url: `https://musicbrainz.org/artist/${musicbrainzId}`,
          status: "needs_review",
          metadata: {
            batch: BATCH,
            catalog_scope: "electronic_music",
            normalized_catalog_version: 2,
            electronic_gate: "candidate",
            electronic_gate_version: GATE_VERSION,
            electronic_gate_reason: "musicbrainz_tag_requires_recording_proof",
            electronic_gate_detail: "Artist tag evidence is stored for review; no recording is recommendable yet.",
            musicbrainz_artist_id: musicbrainzId,
            musicbrainz_artist_numeric_id: artistId,
            musicbrainz_tags: tags,
            musicbrainz_tag_score: evidence.score,
            sort_name: sortName,
            aliases: aliasesByArtist.get(artistId) || [],
            source_type: "musicbrainz_artist_tag_candidate",
            source_license: "CC0-1.0"
          }
        };
        await writeChunk(writer, `${first ? "" : ","}${JSON.stringify(row)}`);
        first = false;
        rowCount += 1;
        if (style === BROAD_STYLE) broadStyleRows += 1;
        styleCounts.set(style, Number(styleCounts.get(style) || 0) + 1);
      }
    });

    const summary = {
      generatedAt: new Date().toISOString(),
      matchedTagDefinitions: matchedTags.size,
      uniqueArtists: seenArtists.size,
      artistStyleRows: rowCount,
      broadStyleRows,
      tracks: 0,
      status: "candidate_only"
    };
    await writeChunk(
      writer,
      `],"tracks":[],"batch":${JSON.stringify(BATCH)},"generatedAt":${JSON.stringify(summary.generatedAt)},` +
      `"gateVersion":${JSON.stringify(GATE_VERSION)},"summary":${JSON.stringify(summary)}}\n`
    );
    writer.end();
    await once(writer, "finish");
    fs.renameSync(temporaryOutput, args.output);
    fs.writeFileSync(args.report, buildReport({ args, files, summary, styleCounts, styles }), "utf8");

    console.log(`Artistas unicos: ${summary.uniqueArtists}`);
    console.log(`Relacoes artista-subgenero: ${summary.artistStyleRows}`);
    console.log(`Saida: ${path.relative(ROOT, args.output)}`);
    console.log(`Relatorio: ${path.relative(ROOT, args.report)}`);
  } catch (error) {
    writer.destroy();
    if (fs.existsSync(temporaryOutput)) fs.rmSync(temporaryOutput);
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
