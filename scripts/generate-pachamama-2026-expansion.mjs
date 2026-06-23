#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const REPORT_DIR = path.join(ROOT, "reports");
const BATCH = "pachamama_2026_research";
const EVENT_NAME = "Pachamama Festival 11 anos - A Nova Era";
const EVENT_DATES = "2026-10-16 to 2026-10-18";
const EVENT_URL = "https://zig.tickets/eventos/pachamama-festival-11-anos";
const PROFILE_OUT = path.join(DATA_DIR, "pachamama_2026_artist_profiles.csv");
const TRACK_OUT = path.join(DATA_DIR, "pachamama_2026_playable_tracks.csv");
const RESEARCH_OUT = path.join(DATA_DIR, "pachamama_2026_research.csv");
const REPORT_OUT = path.join(REPORT_DIR, "pachamama_2026_research_2026-06-21.md");

const PROFILE_COLUMNS = [
  "style",
  "artist",
  "country",
  "city",
  "artist_bio",
  "artist_genre",
  "artist_profile_hint",
  "source",
  "source_url",
  "status",
  "confidence",
  "scene_role",
  "aliases",
  "source_note",
  "social_discovery_links",
  "label_links",
  "profile_tracks"
];

const TRACK_COLUMNS = [
  "style",
  "artist",
  "song",
  "label",
  "bpm_exact",
  "preview_url",
  "release_date",
  "duration_sec",
  "country",
  "city",
  "artist_bio",
  "artist_genre",
  "artist_profile_hint",
  "source",
  "source_url",
  "track_url",
  "deezer_track_id",
  "deezer_track_url",
  "cover_art_url",
  "youtube_track_url",
  "soundcloud_track_url",
  "bandcamp_track_url",
  "bandcamp_track_id",
  "source_tags",
  "album_keywords",
  "energy_band",
  "catalog_role",
  "confidence",
  "source_note",
  "social_discovery_links",
  "label_links"
];

const RESEARCH_COLUMNS = [
  "lineup_name",
  "canonical_artist",
  "action",
  "status",
  "style",
  "confidence",
  "reason",
  "source_url",
  "notes"
];

function p(def) {
  return {
    status: "published",
    confidence: "high",
    sceneRole: "producer_with_verified_tracks",
    aliases: "",
    sourceNote: "",
    links: [],
    labelLinks: [],
    profileTracks: [],
    ...def
  };
}

const PROFILES = [
  p({
    style: "dark_psy",
    artist: "Zik",
    country: "Greece",
    city: "",
    artistGenre: "darkpsy / forest / psycore-adjacent",
    artistBio:
      "Zik e projeto grego de darkpsy/forest com catalogo em Parvati, Sangoma, Dark Prisma, Sanaton e Lycanthrop.",
    artistProfileHint:
      "Usar Zik no eixo dark_psy/forest/psycore-adjacent; nao misturar com homonimos mainstream nem classificar como hi_tech.",
    sourceUrl: "https://zikmusic1.bandcamp.com/",
    confidence: "high",
    aliases: "ZIK; Zik Music",
    sourceNote:
      "Zig confirma Zik na Pachamama; Deezer/catalogo local confirma Changa Reporter e What Is Life em selos darkpsy.",
    links: ["https://ektoplazm.com/artist/zik", "https://sangomarecs.bandcamp.com/music"],
    labelLinks: ["https://parvati-records.com/", "https://sangomarecs.bandcamp.com/music"]
  }),
  p({
    style: "psycore",
    artist: "Polyzik",
    country: "Greece",
    city: "",
    artistGenre: "darkpsy / psycore / experimental psychedelic collaboration",
    artistBio:
      "Polyzik e projeto colaborativo associado a Zik e Polyphonia, usado no circuito grego de darkpsy/psycore.",
    artistProfileHint:
      "Tratar Polyzik como projeto colaborativo de produtores, nao como DJ; usar psycore/darkpsy underground.",
    sourceUrl: "https://zikmusic1.bandcamp.com/",
    confidence: "medium_high",
    sceneRole: "collab_project_with_public_tracks",
    aliases: "Poly Zik; Zik + Polyphonia; Zik & Polyphonia",
    sourceNote:
      "A pagina de Zik e resultados de cena listam Polyzik como side project de Zik e Polyphonia; YouTube confirma Friscoo e Left Right.",
    links: ["https://bandcamp.com/search?q=Polyzik", "https://www.youtube.com/results?search_query=Polyzik+Zik+Polyphonia"]
  }),
  p({
    style: "hi_tech",
    artist: "Oxidaksi",
    country: "Israel",
    city: "",
    artistGenre: "hi-tech psytrance / high-BPM psychedelic trance",
    artistBio:
      "Oxidaksi e produtor israelense de hi-tech psytrance, com faixas em Noise Poison, Future Music, Black Out e Shamanic Tales.",
    artistProfileHint:
      "Classificar Oxidaksi como hi_tech; nao rebaixar para dark experimental/slambient por causa de timbre extremo.",
    sourceUrl: "https://www.deezer.com/track/493592102",
    aliases: "Oxidaksi Retro Set; Oxidaksi 3H Retro Set",
    sourceNote:
      "Poison Turtle, Evolution e Savage confirmam o eixo hi-tech; o flyer marca Retro Set como formato, nao outro artista.",
    links: ["https://blackoutrec.bandcamp.com/music"]
  }),
  p({
    style: "psycore",
    artist: "Depuratus",
    country: "Portugal",
    city: "",
    artistGenre: "psycore / darkpsy / high-BPM psychedelic",
    artistBio:
      "Depuratus assina psycore/darkpsy de alta intensidade com releases por Voodoo Hoodoo, Atomes, Labyrinthine e Xibalba.",
    artistProfileHint:
      "Usar Depuratus como psycore; nao confundir com dark experimental mais lento nem com hi_tech puro.",
    sourceUrl: "https://www.deezer.com/track/2068859787",
    sourceNote:
      "Conscious War, Hagios e Pi aparecem em plataformas e no catalogo Voodoo Hoodoo/Black Out de alta velocidade.",
    links: ["https://voodoo-hoodoo.bandcamp.com/music"]
  }),
  p({
    style: "dark_experimental",
    artist: "Audiosyntax",
    country: "Germany",
    city: "",
    artistGenre: "dark experimental psytrance / darkpsy / psycore-adjacent",
    artistBio:
      "Audiosyntax trabalha dark experimental psytrance com estruturas longas, timbres densos e catalogo Voodoo Hoodoo/Alice-D.",
    artistProfileHint:
      "Usar dark_experimental como primario; so usar psycore quando faixa/BPM indicar, e nao classificar como hi_tech generico.",
    sourceUrl: "https://www.deezer.com/track/3863925681",
    aliases: "Audio Syntax",
    sourceNote:
      "Alien Speech, Honey Badger e Te Deum confirmam faixas; auditoria previa moveu do psycore puro para dark experimental.",
    links: ["https://naturaizrecords.bandcamp.com/music", "https://voodoo-hoodoo.bandcamp.com/music"]
  }),
  p({
    style: "dark_experimental",
    artist: "Kasatka",
    country: "Germany",
    city: "Hamburg",
    artistGenre: "darkpsy / dark experimental / hightech-adjacent",
    artistBio:
      "Kasatka e projeto de Marco em Hamburgo, com discografia marcada por darkpsy, experimental e hightech-adjacent.",
    artistProfileHint:
      "Usar dark_experimental; so marcar hi_tech em faixas explicitamente hi-tech.",
    sourceUrl: "https://kasatkamusic.bandcamp.com/album/irreversible-echoes",
    sourceNote:
      "Irreversible Echoes traz tags darkpsy, experimental, hightech e psytrance; mantido no eixo experimental.",
    links: ["https://kasatkamusic.bandcamp.com/"]
  }),
  p({
    style: "psycore",
    artist: "Calyptratus",
    country: "Germany",
    city: "",
    artistGenre: "psycore / high-BPM dark psychedelic",
    artistBio:
      "Calyptratus aparece no catalogo psycore com faixas como 13 Trumpets, May Fair e Infection Human.",
    artistProfileHint:
      "Classificar como psycore; evitar dark_psy generico quando a faixa estiver no recorte core/alta velocidade.",
    sourceUrl: "https://www.deezer.com/track/111169026",
    confidence: "medium_high",
    sourceNote:
      "Deezer confirma faixas e o banco v14 ja mantinha Calyptratus em Psycore com ancora Beatport/Alice-D.",
    links: ["https://www.beatport.com/label/alice-d-records/66644"]
  }),
  p({
    style: "dark_psy",
    artist: "Opus Summum",
    country: "Germany",
    city: "",
    artistGenre: "darkpsy / psychedelic trance",
    artistBio:
      "Opus Summum tem faixa confirmada em Sacred Manuscript ao lado de nomes darkpsy/experimental do circuito Alice-D.",
    artistProfileHint:
      "Usar dark_psy com confianca media; ha pouca discografia publica, entao nao promover para psycore sem mais evidencias.",
    sourceUrl: "https://www.deezer.com/track/110384814",
    confidence: "medium_high",
    sourceNote:
      "Sonic Vibrations no VA Sacred Manuscript confirma faixa publica sob o projeto.",
    links: ["https://www.deezer.com/track/110384814"]
  }),
  p({
    style: "dark_psy",
    artist: "Kaos",
    country: "Greece",
    city: "Athens",
    artistGenre: "darkpsy / psychedelic trance",
    artistBio:
      "Kaos e produtor grego associado a projetos colaborativos como Polykaos e StrangeKaos dentro do darkpsy helenico.",
    artistProfileHint:
      "Usar apenas quando contexto for psytrance grego; nome e muito homonimo em plataformas.",
    sourceUrl: "https://www.youtube.com/results?search_query=Kaos+Beyond+Magic+Pralayah+Records",
    confidence: "medium_high",
    aliases: "Dennis Tapinos; Kaos GR",
    sourceNote:
      "Polykaos e StrangeKaos confirmam a identidade de Kaos no circuito; buscas diretas em Deezer retornam homonimos.",
    links: ["https://bandcamp.com/search?q=Kaos+psytrance", "https://www.youtube.com/results?search_query=Kaos+Beyond+Magic+Pralayah+Records"]
  }),
  p({
    style: "psycore",
    artist: "Polykaos",
    country: "Greece",
    city: "Athens",
    artistGenre: "psycore / darkpsy / psychedelic trance collaboration",
    artistBio:
      "Polykaos e projeto de Polyphonia com Kaos, em Athens, com material recente em plataformas e catalogo darkpsy.",
    artistProfileHint:
      "Tratar Polykaos como projeto colaborativo; usar psycore/darkpsy, nao hi_tech.",
    sourceUrl: "https://www.deezer.com/track/3540300671",
    aliases: "Poly Kaos; Polyphonia & Kaos",
    sourceNote:
      "Numbers, No More Faith e No Problem confirmam faixas; resultados Bandcamp descrevem Polykaos como Polyphonia + Kaos.",
    links: ["https://polykaos.bandcamp.com/", "https://bandcamp.com/search?q=Polykaos"]
  }),
  p({
    style: "dark_psy",
    artist: "StrangeKaos",
    country: "Greece",
    city: "Athens",
    artistGenre: "darkpsy / psychedelic trance collaboration",
    artistBio:
      "StrangeKaos e colaboracao de Stranger e Kaos iniciada no fim dos anos 2000, com som acido, atmosferico e energetico.",
    artistProfileHint:
      "Usar dark_psy; grafias Strange Kaos e StrangeKaos devem apontar para o mesmo projeto.",
    sourceUrl: "https://strangekaos.bandcamp.com/",
    aliases: "Strange Kaos; Stranger & Kaos",
    sourceNote:
      "Bandcamp/Deezer confirmam catalogo como Twilight Zone e Ethereal Powers; pagina do projeto descreve Stranger + Kaos.",
    links: ["https://bandcamp.com/search?q=StrangeKaos", "https://www.deezer.com/track/1868312977"]
  }),
  p({
    style: "dark_psy",
    artist: "Stranger",
    country: "Greece",
    city: "",
    artistGenre: "darkpsy / experimental psychedelic trance",
    artistBio:
      "Stranger e produtor grego ligado a StrangeKaos e ao circuito darkpsy helenico, com participacao em releases colaborativos.",
    artistProfileHint:
      "Usar Stranger somente com contexto psytrance; ha muitos homonimos em plataformas grandes.",
    sourceUrl: "https://strangekaos.bandcamp.com/",
    confidence: "medium",
    sceneRole: "producer_with_collab_release",
    aliases: "Stranger GR; Stranger / StrangeKaos",
    sourceNote:
      "Prova forte vem das faixas de StrangeKaos e da descricao do projeto com Stranger + Kaos; pouca faixa solo verificavel.",
    links: ["https://bandcamp.com/search?q=Stranger+Kaos+psytrance", "https://www.youtube.com/results?search_query=Stranger+psytrance+Greece"]
  }),
  p({
    style: "dark_psy",
    artist: "Bethad",
    country: "Spain",
    city: "",
    artistGenre: "darkpsy / forest / experimental darkpsy",
    artistBio:
      "Bethad trabalha darkpsy/forest espanhol com faixas como Reminiscing the Past e colabs no eixo Enygma/Tetraktyz.",
    artistProfileHint:
      "Preferir dark_psy/forest; nao classificar como hi_tech, mesmo quando o lineup esta em palco extremo.",
    sourceUrl: "https://www.deezer.com/track/877960112",
    sourceNote:
      "Deezer confirma Reminiscing the Past/Trying To Find the Reason; Enygma confirma Bethad em Anima com Tetraktyz.",
    links: ["https://enygmamusic.bandcamp.com/track/tetraktyz-bethad-anima-158"]
  }),
  p({
    style: "dark_psy",
    artist: "Penurna",
    country: "Spain",
    city: "",
    artistGenre: "darkpsy / experimental psytrance",
    artistBio:
      "Penurna e projeto espanhol de darkpsy/experimental psytrance com faixas publicas como Sacral Chakra e Supranormal.",
    artistProfileHint:
      "Grafia correta do flyer e Penurna; nao confundir com Penumbra ou homonimos.",
    sourceUrl: "https://www.youtube.com/watch?v=DDgOOFv-pCQ",
    confidence: "medium_high",
    sourceNote:
      "Sacral Chakra em Sick Trick Music e Supranormal confirmam faixa publica; cobertura em plataformas e menor que a dos headliners.",
    links: ["https://www.youtube.com/watch?v=Bh3d7LdHRec", "https://www.youtube.com/watch?v=DDgOOFv-pCQ"]
  }),
  p({
    style: "psycore",
    artist: "Khaline",
    country: "Brazil",
    city: "",
    artistGenre: "psycore / darkpsy / high-BPM psychedelic",
    artistBio:
      "Khaline e projeto brasileiro de darkpsy/psycore com faixas high-BPM como Magic Beans, Sinchronicity e Aquarius.",
    artistProfileHint:
      "Usar psycore; nao manter a seed antiga em hi_tech como classificacao primaria sem prova de faixa hi-tech.",
    sourceUrl: "https://www.youtube.com/watch?v=9OZwTwTmS9w",
    confidence: "medium_high",
    sourceNote:
      "Magic Beans aparece com 196 BPM e Sinchronicity com 184 BPM; tambem participa do projeto Umbra Lumen.",
    links: ["https://www.youtube.com/watch?v=xJOH-Q0NkGk", "https://www.youtube.com/watch?v=DMgpYUjEvDw"]
  }),
  p({
    style: "dark_psy",
    artist: "Yara",
    country: "Venezuela",
    city: "",
    artistGenre: "darkpsy / dark forest / psychedelic trance",
    artistBio:
      "Yara aparece em releases e videos de dark psy como Dark Star, No Signs of Life e Elixir, alem do set Yara vs Dark Notes.",
    artistProfileHint:
      "Corrigir seed antiga: aqui Yara deve entrar como dark_psy, nao hi_tech, salvo faixa futura provar outro recorte.",
    sourceUrl: "https://www.youtube.com/watch?v=iYCfpRLQYWA",
    confidence: "medium_high",
    aliases: "Yara VE; Yara vs Dark Notes",
    sourceNote:
      "Dark Star e Elixir/No Signs of Life ancoram dark psy; evitar homonimos latin/pop em plataformas.",
    links: ["https://www.youtube.com/watch?v=Kt5LoIBSp7o", "https://www.youtube.com/watch?v=RRWMVn8xnrA"]
  }),
  p({
    style: "dark_psy",
    artist: "Dark Notes",
    country: "Brazil",
    city: "",
    artistGenre: "darkpsy / Brazilian dark psychedelic trance",
    artistBio:
      "Dark Notes e projeto brasileiro de dark psy com material publico como Mighty Darkness e set/preview proprio.",
    artistProfileHint:
      "Usar dark_psy; o slot Yara vs Dark Notes e um set/collab ao vivo, nao artista separado.",
    sourceUrl: "https://www.youtube.com/watch?v=cDbZ7sTRycc",
    confidence: "medium_high",
    aliases: "Dark Notes BR; Fabio Batera",
    sourceNote:
      "SoundCloud e YouTube confirmam Mighty Darkness; manter longe de homonimos de rock/ambient.",
    links: ["https://soundcloud.com/dark-notes-fabiobatera/dark-notes-preview-to-mighty-darkness"]
  }),
  p({
    style: "dark_psy",
    artist: "Alcohbata",
    country: "Brazil",
    city: "",
    artistGenre: "psytrance / darkpsy / forest-adjacent",
    artistBio:
      "Alcohbata e projeto brasileiro de psytrance com album Welcome To This World pela Katayy Records e faixas em dark/forest.",
    artistProfileHint:
      "Grafia correta e Alcohbata; nao usar Alcohibata como nome principal e nao classificar como hi_tech.",
    sourceUrl: "https://katayyrecords.bandcamp.com/album/alcohbata-welcome-to-this-world",
    aliases: "Alcohibata; Alcohbata BR",
    sourceNote:
      "Ja validado no pacote Cosmic Crew: Pure Love, Youtab Ariobarzan e Morning Ritual confirmam discografia.",
    links: ["https://www.katayyrecords.com.br/fr/musicas/"],
    labelLinks: ["https://katayyrecords.bandcamp.com/"]
  }),
  p({
    style: "dark_experimental",
    artist: "Umbra Lumen",
    country: "Brazil",
    city: "",
    artistGenre: "dark experimental psytrance / psycore",
    artistBio:
      "Umbra Lumen e projeto brasileiro experimental de Khaline e Maramba, com singles Vysehrad e Sahasrara em 2026.",
    artistProfileHint:
      "Usar dark_experimental/psycore; manter como projeto musical proprio, separado de ritual session.",
    sourceUrl: "https://www.deezer.com/track/3857759251",
    sourceNote:
      "Vysehrad e Sahasrara ja foram confirmadas no pacote Cosmic Crew; Pachamama reforca evento futuro.",
    links: ["https://www.youtube.com/watch?v=lx4M6xI-bcA"]
  }),
  p({
    style: "slambient",
    artist: "Vuttun",
    country: "Brazil",
    city: "",
    artistGenre: "slambient / dark experimental psy / psycore-adjacent",
    artistBio:
      "Vuttun combina slambient acelerado, ambiencia ritual e dark experimental em releases da The Endless Knot.",
    artistProfileHint:
      "Classificar como slambient; nao jogar automaticamente em hi_tech por BPM 180-185.",
    sourceUrl: "https://theendlessknotrec.bandcamp.com/track/vuttun-nabaat-185bpm",
    aliases: "Vutt'un; Vuttun BR",
    sourceNote:
      "The Endless Knot publica Nabaat 185 BPM, N'Iser Synergic Transformation 185 BPM e Flegetonte 180 BPM.",
    links: ["https://vuttun.bandcamp.com/", "https://theendlessknotrec.bandcamp.com/"]
  }),
  p({
    style: "psycore",
    artist: "Vucsetics",
    country: "Brazil",
    city: "",
    artistGenre: "psycore / darkpsy / high-BPM psychedelic",
    artistBio:
      "Vucsetics e projeto brasileiro de psycore/darkpsy com faixas publicas como New Moon, Sun Down e Night Work.",
    artistProfileHint:
      "Usar psycore/darkpsy; nao confundir com DJ-only porque ha faixas publicas high-BPM.",
    sourceUrl: "https://www.youtube.com/watch?v=8DGrxq6HtTc",
    confidence: "medium_high",
    sourceNote:
      "Videos publicos indicam New Moon 185 BPM, Sun Down 180 BPM e Night Work 177 BPM.",
    links: ["https://www.youtube.com/watch?v=hpZ52Yhvt3E", "https://www.youtube.com/watch?v=ctvGqeay4Tc"]
  })
];

const profileByArtist = new Map(PROFILES.map((item) => [normalize(item.artist), item]));

function tr(def) {
  return {
    label: "",
    bpm: "",
    deezerId: "",
    sourceUrl: "",
    trackUrl: "",
    youtubeTrackUrl: "",
    soundcloudTrackUrl: "",
    bandcampTrackUrl: "",
    bandcampTrackId: "",
    sourceTags: [],
    albumKeywords: [EVENT_NAME, "A Nova Era", "Pachamama 11 anos"],
    energyBand: "festival_lineup_verified",
    catalogRole: "pachamama_2026_lineup_anchor;producer_with_verified_tracks",
    confidence: "high",
    sourceNote: "",
    labelLinks: [],
    ...def
  };
}

const TRACKS = [
  tr({ style: "dark_psy", artist: "Zik", song: "Changa Reporter", label: "Ritornello", deezerId: "3201692581", sourceUrl: "https://www.deezer.com/track/3201692581", sourceTags: ["darkpsy", "forest", "parvati"] }),
  tr({ style: "dark_psy", artist: "Zik", song: "What Is Life", label: "What is Life / Life is Life", deezerId: "1867855237", sourceUrl: "https://www.deezer.com/track/1867855237", sourceTags: ["darkpsy", "night_psy"] }),

  tr({ style: "psycore", artist: "Polyzik", song: "Friscoo", label: "Polyzik", sourceUrl: "https://www.youtube.com/watch?v=5j_E0lXJnvY", youtubeTrackUrl: "https://www.youtube.com/watch?v=5j_E0lXJnvY", sourceTags: ["darkpsy", "psycore", "collab_project"], confidence: "medium_high" }),
  tr({ style: "psycore", artist: "Polyzik", song: "Left Right", label: "Polyzik", bpm: 149, sourceUrl: "https://www.youtube.com/watch?v=tjBJVLsbvnQ", youtubeTrackUrl: "https://www.youtube.com/watch?v=tjBJVLsbvnQ", sourceTags: ["darkpsy", "psycore", "149_bpm"], confidence: "medium_high" }),

  tr({ style: "hi_tech", artist: "Oxidaksi", song: "Poison Turtle", label: "Noise Poison Festival", deezerId: "493592102", sourceUrl: "https://www.deezer.com/track/493592102", sourceTags: ["hi_tech", "noise_poison"] }),
  tr({ style: "hi_tech", artist: "Oxidaksi", song: "Evolution", label: "Futurism, Vol. 01", deezerId: "1005230632", sourceUrl: "https://www.deezer.com/track/1005230632", sourceTags: ["hi_tech", "future_music"] }),
  tr({ style: "hi_tech", artist: "Oxidaksi", song: "Savage", label: "Avira", deezerId: "975418102", sourceUrl: "https://www.deezer.com/track/975418102", sourceTags: ["hi_tech", "shamanic_tales"] }),

  tr({ style: "psycore", artist: "Depuratus", song: "Conscious War", label: "Atomes Music", deezerId: "2068859787", sourceUrl: "https://www.deezer.com/track/2068859787", sourceTags: ["psycore", "voodoo_hoodoo"] }),
  tr({ style: "psycore", artist: "Depuratus", song: "Hagios", label: "Voodoo Hoodoo Recordings", deezerId: "1769695607", sourceUrl: "https://www.deezer.com/track/1769695607", sourceTags: ["psycore", "high_bpm"] }),
  tr({ style: "psycore", artist: "Depuratus", song: "Pi", label: "Labyrinthine Crew", deezerId: "1412055052", sourceUrl: "https://www.deezer.com/track/1412055052", sourceTags: ["psycore", "labyrinthine"] }),

  tr({ style: "dark_experimental", artist: "Audiosyntax", song: "Alien Speech", label: "SURGICAL STRIKE", deezerId: "3863925681", sourceUrl: "https://www.deezer.com/track/3863925681", sourceTags: ["dark_experimental", "voodoo_hoodoo"] }),
  tr({ style: "dark_experimental", artist: "Audiosyntax", song: "Honey Badger", label: "Sacred Manuscript", deezerId: "110384816", sourceUrl: "https://www.deezer.com/track/110384816", sourceTags: ["dark_experimental", "alice_d"] }),
  tr({ style: "dark_experimental", artist: "Audiosyntax", song: "Te Deum", label: "TALISMAN HOODOO", deezerId: "3865066581", sourceUrl: "https://www.deezer.com/track/3865066581", sourceTags: ["dark_experimental", "voodoo_hoodoo"] }),

  tr({ style: "dark_experimental", artist: "Kasatka", song: "The Hive", label: "Irreversible Echoes", deezerId: "842698282", sourceUrl: "https://kasatkamusic.bandcamp.com/album/irreversible-echoes", bandcampTrackUrl: "https://kasatkamusic.bandcamp.com/album/irreversible-echoes", sourceTags: ["darkpsy", "experimental", "hightech_adjacent"] }),
  tr({ style: "dark_experimental", artist: "Kasatka", song: "Debut", label: "Irreversible Echoes", deezerId: "842698272", sourceUrl: "https://kasatkamusic.bandcamp.com/track/debut", bandcampTrackUrl: "https://kasatkamusic.bandcamp.com/track/debut", sourceTags: ["darkpsy", "experimental"] }),

  tr({ style: "psycore", artist: "Calyptratus", song: "13 Trumpets", label: "The Sacred Mayan Tree", deezerId: "111169026", sourceUrl: "https://www.deezer.com/track/111169026", sourceTags: ["psycore", "alice_d"] }),
  tr({ style: "psycore", artist: "Calyptratus", song: "May Fair", label: "Indigo Generation", deezerId: "75807124", sourceUrl: "https://www.deezer.com/track/75807124", sourceTags: ["psycore", "high_bpm"] }),
  tr({ style: "psycore", artist: "Calyptratus", song: "Infection Human", label: "Calyptratus", deezerId: "122942142", sourceUrl: "https://www.deezer.com/track/122942142", sourceTags: ["psycore", "darkpsy"] }),

  tr({ style: "dark_psy", artist: "Opus Summum", song: "Sonic Vibrations", label: "Sacred Manuscript", deezerId: "110384814", sourceUrl: "https://www.deezer.com/track/110384814", sourceTags: ["darkpsy", "alice_d"] }),

  tr({ style: "dark_psy", artist: "Kaos", song: "Beyond Magic", label: "Pralayah Records", sourceUrl: "https://www.youtube.com/results?search_query=Kaos+Beyond+Magic+Pralayah+Records", trackUrl: "https://www.youtube.com/results?search_query=Kaos+Beyond+Magic+Pralayah+Records", sourceTags: ["darkpsy", "greece"], confidence: "medium_high" }),

  tr({ style: "psycore", artist: "Polykaos", song: "Numbers", label: "Numbers", deezerId: "3540300671", sourceUrl: "https://www.deezer.com/track/3540300671", sourceTags: ["psycore", "darkpsy"] }),
  tr({ style: "psycore", artist: "Polykaos", song: "No More Faith", label: "Polykaos", deezerId: "3992758741", sourceUrl: "https://www.deezer.com/track/3992758741", sourceTags: ["psycore", "darkpsy"] }),
  tr({ style: "dark_psy", artist: "Polykaos", song: "No Problem", label: "Polykaos", deezerId: "415897222", sourceUrl: "https://www.deezer.com/track/415897222", sourceTags: ["darkpsy", "collab_project"] }),

  tr({ style: "dark_psy", artist: "StrangeKaos", song: "Twilight Zone", label: "StrangeKaos", deezerId: "1868312977", sourceUrl: "https://www.deezer.com/track/1868312977", sourceTags: ["darkpsy", "greece"] }),
  tr({ style: "dark_psy", artist: "StrangeKaos", song: "Ethereal Powers", label: "StrangeKaos", deezerId: "1868312987", sourceUrl: "https://www.deezer.com/track/1868312987", sourceTags: ["darkpsy", "acid_melodies"] }),
  tr({ style: "dark_psy", artist: "StrangeKaos", song: "Customer's Feedback", label: "StrangeKaos", deezerId: "1868312997", sourceUrl: "https://www.deezer.com/track/1868312997", sourceTags: ["darkpsy", "collab_project"] }),
  tr({ style: "dark_psy", artist: "Stranger", song: "Twilight Zone", label: "StrangeKaos", deezerId: "1868312977", sourceUrl: "https://strangekaos.bandcamp.com/", trackUrl: "https://www.deezer.com/track/1868312977", sourceTags: ["darkpsy", "strangekaos_member"], confidence: "medium", sourceNote: "Credited through StrangeKaos, the Stranger + Kaos project; retained for lineup search and event matching." }),

  tr({ style: "dark_psy", artist: "Bethad", song: "Reminiscing the Past", label: "Bethad", deezerId: "877960112", sourceUrl: "https://www.deezer.com/track/877960112", sourceTags: ["darkpsy", "forest"] }),
  tr({ style: "dark_psy", artist: "Bethad", song: "Trying To Find the Reason", label: "Bethad", deezerId: "877960102", sourceUrl: "https://www.deezer.com/track/877960102", sourceTags: ["darkpsy", "forest"] }),
  tr({ style: "dark_psy", artist: "Bethad", song: "Anima", label: "Codex Seraphinianus EP", bpm: 158, deezerId: "3592895322", sourceUrl: "https://enygmamusic.bandcamp.com/track/tetraktyz-bethad-anima-158", bandcampTrackUrl: "https://enygmamusic.bandcamp.com/track/tetraktyz-bethad-anima-158", sourceTags: ["darkpsy", "experimental_darkpsy", "tetraktyz_bethad"] }),

  tr({ style: "dark_psy", artist: "Penurna", song: "Sacral Chakra", label: "Sick Trick Music", sourceUrl: "https://www.youtube.com/watch?v=DDgOOFv-pCQ", youtubeTrackUrl: "https://www.youtube.com/watch?v=DDgOOFv-pCQ", sourceTags: ["darkpsy", "sick_trick"], confidence: "medium_high" }),
  tr({ style: "dark_psy", artist: "Penurna", song: "Supranormal", label: "Penurna", sourceUrl: "https://www.youtube.com/watch?v=Bh3d7LdHRec", youtubeTrackUrl: "https://www.youtube.com/watch?v=Bh3d7LdHRec", sourceTags: ["darkpsy", "experimental"], confidence: "medium_high" }),

  tr({ style: "psycore", artist: "Khaline", song: "Magic Beans", label: "Khaline", bpm: 196, sourceUrl: "https://www.youtube.com/watch?v=9OZwTwTmS9w", youtubeTrackUrl: "https://www.youtube.com/watch?v=9OZwTwTmS9w", sourceTags: ["psycore", "196_bpm"], confidence: "medium_high" }),
  tr({ style: "psycore", artist: "Khaline", song: "Sinchronicity", label: "Khaline", bpm: 184, sourceUrl: "https://www.youtube.com/watch?v=xJOH-Q0NkGk", youtubeTrackUrl: "https://www.youtube.com/watch?v=xJOH-Q0NkGk", sourceTags: ["psycore", "184_bpm"], confidence: "medium_high" }),
  tr({ style: "dark_psy", artist: "Khaline", song: "Aquarius", label: "Khaline", sourceUrl: "https://www.youtube.com/watch?v=DMgpYUjEvDw", youtubeTrackUrl: "https://www.youtube.com/watch?v=DMgpYUjEvDw", sourceTags: ["darkpsy", "brazil"], confidence: "medium_high" }),

  tr({ style: "dark_psy", artist: "Yara", song: "Dark Star", label: "Deviant Force Records", bpm: 170, sourceUrl: "https://www.youtube.com/watch?v=iYCfpRLQYWA", youtubeTrackUrl: "https://www.youtube.com/watch?v=iYCfpRLQYWA", sourceTags: ["darkpsy", "170_bpm"], confidence: "medium_high" }),
  tr({ style: "dark_psy", artist: "Yara", song: "No Signs of Life", label: "Yara", sourceUrl: "https://www.youtube.com/watch?v=Kt5LoIBSp7o", youtubeTrackUrl: "https://www.youtube.com/watch?v=Kt5LoIBSp7o", sourceTags: ["darkpsy"], confidence: "medium_high" }),
  tr({ style: "dark_psy", artist: "Yara", song: "Elixir", label: "Yara & Dekhat Bhuli", sourceUrl: "https://www.youtube.com/watch?v=RRWMVn8xnrA", youtubeTrackUrl: "https://www.youtube.com/watch?v=RRWMVn8xnrA", sourceTags: ["darkpsy", "collab"], confidence: "medium_high" }),

  tr({ style: "dark_psy", artist: "Dark Notes", song: "Mighty Darkness", label: "Dark Notes", sourceUrl: "https://www.youtube.com/watch?v=cDbZ7sTRycc", youtubeTrackUrl: "https://www.youtube.com/watch?v=cDbZ7sTRycc", soundcloudTrackUrl: "https://soundcloud.com/dark-notes-fabiobatera/dark-notes-br-mighty-darkness-vol-ii-setmix", sourceTags: ["darkpsy", "brazil"], confidence: "medium_high" }),
  tr({ style: "dark_psy", artist: "Dark Notes", song: "Preview To Mighty Darkness", label: "Dark Notes", sourceUrl: "https://soundcloud.com/dark-notes-fabiobatera/dark-notes-preview-to-mighty-darkness", soundcloudTrackUrl: "https://soundcloud.com/dark-notes-fabiobatera/dark-notes-preview-to-mighty-darkness", sourceTags: ["darkpsy", "brazil"], confidence: "medium_high" }),

  tr({ style: "dark_psy", artist: "Alcohbata", song: "Pure Love", label: "Welcome to This World", deezerId: "842642732", sourceUrl: "https://katayyrecords.bandcamp.com/album/alcohbata-welcome-to-this-world", bandcampTrackUrl: "https://katayyrecords.bandcamp.com/album/alcohbata-welcome-to-this-world", sourceTags: ["darkpsy", "psytrance"] }),
  tr({ style: "dark_psy", artist: "Alcohbata", song: "Youtab Ariobarzan", label: "VA ZAN", deezerId: "2844875492", sourceUrl: "https://www.deezer.com/track/2844875492", sourceTags: ["darkpsy", "forest"] }),
  tr({ style: "dark_psy", artist: "Alcohbata", song: "Morning Ritual", label: "Time Warp", deezerId: "3615872942", sourceUrl: "https://www.deezer.com/track/3615872942", sourceTags: ["darkpsy", "ritual_dark"] }),

  tr({ style: "dark_experimental", artist: "Umbra Lumen", song: "Vysehrad", label: "Vysehrad", deezerId: "3857759251", sourceUrl: "https://www.deezer.com/track/3857759251", youtubeTrackUrl: "https://www.youtube.com/watch?v=lx4M6xI-bcA", sourceTags: ["dark_experimental", "psycore"] }),
  tr({ style: "dark_experimental", artist: "Umbra Lumen", song: "Sahasrara", label: "Sahasrara", deezerId: "3937073021", sourceUrl: "https://www.deezer.com/track/3937073021", youtubeTrackUrl: "https://www.youtube.com/watch?v=lx4M6xI-bcA", sourceTags: ["dark_experimental", "psycore"] }),

  tr({ style: "slambient", artist: "Vuttun", song: "Nabaat", label: "The Endless Knot", bpm: 185, sourceUrl: "https://theendlessknotrec.bandcamp.com/track/vuttun-nabaat-185bpm", bandcampTrackUrl: "https://theendlessknotrec.bandcamp.com/track/vuttun-nabaat-185bpm", sourceTags: ["slambient", "185_bpm", "darkpsy"], confidence: "high" }),
  tr({ style: "slambient", artist: "Vuttun", song: "Synergic Transformation", label: "The Endless Knot", bpm: 185, sourceUrl: "https://theendlessknotrec.bandcamp.com/track/vuttun-n-iser-synergic-transformation-185bpm", bandcampTrackUrl: "https://theendlessknotrec.bandcamp.com/track/vuttun-n-iser-synergic-transformation-185bpm", sourceTags: ["slambient", "185_bpm", "collab"], confidence: "high" }),
  tr({ style: "slambient", artist: "Vuttun", song: "Flegetonte", label: "The Endless Knot", bpm: 180, sourceUrl: "https://theendlessknotrec.bandcamp.com/track/vuttun-flegetonte-180bpm", bandcampTrackUrl: "https://theendlessknotrec.bandcamp.com/track/vuttun-flegetonte-180bpm", sourceTags: ["slambient", "180_bpm"], confidence: "high" }),

  tr({ style: "psycore", artist: "Vucsetics", song: "New Moon", label: "Mindfullness", bpm: 185, sourceUrl: "https://www.youtube.com/watch?v=8DGrxq6HtTc", youtubeTrackUrl: "https://www.youtube.com/watch?v=8DGrxq6HtTc", sourceTags: ["psycore", "185_bpm"], confidence: "medium_high" }),
  tr({ style: "psycore", artist: "Vucsetics", song: "Sun Down", label: "Vucsetics", bpm: 180, sourceUrl: "https://www.youtube.com/watch?v=hpZ52Yhvt3E", youtubeTrackUrl: "https://www.youtube.com/watch?v=hpZ52Yhvt3E", sourceTags: ["psycore", "180_bpm"], confidence: "medium_high" }),
  tr({ style: "psycore", artist: "Vucsetics", song: "Night Work", label: "Vucsetics", bpm: 177, sourceUrl: "https://www.youtube.com/watch?v=ctvGqeay4Tc", youtubeTrackUrl: "https://www.youtube.com/watch?v=ctvGqeay4Tc", sourceTags: ["psycore", "177_bpm"], confidence: "medium_high" })
];

function r(lineupName, canonicalArtist, action, status, style, confidence, reason, sourceUrl, notes = "") {
  return { lineupName, canonicalArtist, action, status, style, confidence, reason, sourceUrl, notes };
}

const RESEARCH = [
  r("ZIK", "Zik", "include", "producer_with_tracks", "dark_psy", "high", "Zig confirma o evento/lineup; Changa Reporter e What Is Life confirmam faixas darkpsy/forest.", EVENT_URL),
  r("POLYZIK", "Polyzik", "include", "collab_project_with_public_tracks", "psycore", "medium_high", "Projeto associado a Zik + Polyphonia; Friscoo e Left Right confirmam faixas publicas.", "https://www.youtube.com/watch?v=5j_E0lXJnvY"),
  r("OXIDAKSI (3H RETRO SET)", "Oxidaksi", "include", "producer_with_tracks", "hi_tech", "high", "Poison Turtle, Evolution e Savage confirmam hi-tech; Retro Set e formato.", "https://www.deezer.com/track/493592102"),
  r("DEPURATUS (3H)", "Depuratus", "include", "producer_with_tracks", "psycore", "high", "Conscious War, Hagios e Pi confirmam psycore/darkpsy high-BPM.", "https://www.deezer.com/track/2068859787"),
  r("AUDIOSYNTAX (3H)", "Audiosyntax", "include", "producer_with_tracks", "dark_experimental", "high", "Alien Speech/Honey Badger/Te Deum confirmam catalogo; primario dark experimental, nao hitech generico.", "https://www.deezer.com/track/3863925681"),
  r("KASATKA (3H)", "Kasatka", "include", "producer_with_tracks", "dark_experimental", "high", "Irreversible Echoes tem tags darkpsy/experimental/hightech-adjacent; mantido dark experimental.", "https://kasatkamusic.bandcamp.com/album/irreversible-echoes"),
  r("CALYPTRATUS (3H)", "Calyptratus", "include", "producer_with_tracks", "psycore", "medium_high", "13 Trumpets e May Fair confirmam faixas; banco v14 ja ancorava Psycore.", "https://www.deezer.com/track/111169026"),
  r("OPUS SUMMUM", "Opus Summum", "include", "producer_with_tracks", "dark_psy", "medium_high", "Sonic Vibrations em Sacred Manuscript confirma faixa publica; pouca discografia aberta.", "https://www.deezer.com/track/110384814"),
  r("KAOS", "Kaos", "include", "producer_with_tracks", "dark_psy", "medium_high", "Identidade grega confirmada via Polykaos/StrangeKaos; buscas diretas em streaming tem muito homonimo.", "https://bandcamp.com/search?q=Kaos+psytrance"),
  r("POLYKAOS", "Polykaos", "include", "producer_with_tracks", "psycore", "high", "Numbers/No More Faith/No Problem confirmam projeto Polyphonia + Kaos.", "https://www.deezer.com/track/3540300671"),
  r("STRANGEKAOS", "StrangeKaos", "include", "producer_with_tracks", "dark_psy", "high", "Twilight Zone/Ethereal Powers e descricao Stranger + Kaos confirmam projeto.", "https://strangekaos.bandcamp.com/"),
  r("STRANGER", "Stranger", "include", "producer_with_collab_release", "dark_psy", "medium", "Pouca faixa solo verificavel; incluido por ser parte do projeto StrangeKaos e aparecer no lineup como produtor.", "https://strangekaos.bandcamp.com/"),
  r("BETHAD", "Bethad", "include", "producer_with_tracks", "dark_psy", "high", "Reminiscing the Past e Anima/Tetraktyz confirmam darkpsy/forest.", "https://www.deezer.com/track/877960112"),
  r("PENURNA", "Penurna", "include", "producer_with_tracks", "dark_psy", "medium_high", "Sacral Chakra e Supranormal confirmam faixa publica; grafia e Penurna, nao Penumbra.", "https://www.youtube.com/watch?v=DDgOOFv-pCQ"),
  r("KHALINE", "Khaline", "include", "producer_with_tracks", "psycore", "medium_high", "Magic Beans 196 BPM e Sinchronicity 184 BPM apontam psycore/high-BPM, nao hi-tech primario.", "https://www.youtube.com/watch?v=9OZwTwTmS9w"),
  r("YARA", "Yara", "include", "producer_with_tracks", "dark_psy", "medium_high", "Dark Star 170 BPM e No Signs of Life apontam darkpsy; corrige seed antiga hi_tech.", "https://www.youtube.com/watch?v=iYCfpRLQYWA"),
  r("DARK NOTES", "Dark Notes", "include", "producer_with_tracks", "dark_psy", "medium_high", "Mighty Darkness em YouTube/SoundCloud confirma projeto brasileiro de darkpsy.", "https://www.youtube.com/watch?v=cDbZ7sTRycc"),
  r("YARA VS DARK NOTES (4H INEDITO)", "Yara / Dark Notes", "alias_only", "live_collab_not_separate_artist", "dark_psy", "medium_high", "Tratado como set/collab ao vivo; os artistas individuais entram no banco.", EVENT_URL),
  r("ALCOHBATA", "Alcohbata", "include", "producer_with_tracks", "dark_psy", "high", "Katayy/Deezer confirmam album e faixas; grafia correta Alcohbata.", "https://katayyrecords.bandcamp.com/album/alcohbata-welcome-to-this-world"),
  r("UMBRA LUMEN", "Umbra Lumen", "include", "producer_with_tracks", "dark_experimental", "high", "Vysehrad e Sahasrara confirmam projeto experimental de Khaline + Maramba.", "https://www.deezer.com/track/3857759251"),
  r("VUTTUN", "Vuttun", "include", "producer_with_tracks", "slambient", "high", "The Endless Knot confirma Nabaat 185 BPM, Synergic Transformation 185 BPM e Flegetonte 180 BPM.", "https://theendlessknotrec.bandcamp.com/track/vuttun-nabaat-185bpm"),
  r("VUCSETICS", "Vucsetics", "include", "producer_with_tracks", "psycore", "medium_high", "New Moon 185 BPM, Sun Down 180 BPM e Night Work 177 BPM confirmam projeto high-BPM.", "https://www.youtube.com/watch?v=8DGrxq6HtTc"),
  r("KATOPTROS", "Katoptros", "exclude", "dj_only_or_unverified_project", "", "medium", "Encontrei confirmacao de lineup/showcase, mas nao faixa publica confiavel sob a identidade.", EVENT_URL),
  r("TURTLE TREE", "Turtle Tree", "exclude", "dj_only_or_unverified_project", "", "medium", "Aparece em lineups locais, mas nao encontrei release/faixa propria verificavel.", EVENT_URL)
];

function normalize(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function csvEscape(value) {
  if (Array.isArray(value)) value = value.join(";");
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function writeCsv(filePath, columns, rows) {
  const content = [
    columns.map(csvEscape).join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(","))
  ].join("\n");
  fs.writeFileSync(filePath, `${content}\n`, "utf8");
}

async function deezerTrack(id) {
  if (!id) return null;
  try {
    const response = await fetch(`https://api.deezer.com/track/${encodeURIComponent(id)}`, {
      headers: { Accept: "application/json", "User-Agent": "Codex Pachamama research" }
    });
    if (!response.ok) return null;
    const json = await response.json();
    if (json?.error) return null;
    return json;
  } catch (_err) {
    return null;
  }
}

async function buildTrackRows() {
  const rows = [];
  for (const item of TRACKS) {
    const artistProfile = profileByArtist.get(normalize(item.artist)) || {};
    const dz = await deezerTrack(item.deezerId);
    const deezerUrl = dz?.link || (item.deezerId ? `https://www.deezer.com/track/${item.deezerId}` : "");
    rows.push({
      style: item.style,
      artist: item.artist,
      song: item.song,
      label: item.label || dz?.album?.title || EVENT_NAME,
      bpm_exact: item.bpm || "",
      preview_url: dz?.preview || "",
      release_date: dz?.release_date || "",
      duration_sec: dz?.duration || "",
      country: artistProfile.country || "",
      city: artistProfile.city || "",
      artist_bio: artistProfile.artistBio || "",
      artist_genre: artistProfile.artistGenre || item.style,
      artist_profile_hint: artistProfile.artistProfileHint || "",
      source: BATCH,
      source_url: item.sourceUrl || artistProfile.sourceUrl || deezerUrl,
      track_url: item.trackUrl || deezerUrl || item.bandcampTrackUrl || item.youtubeTrackUrl || item.soundcloudTrackUrl || item.sourceUrl || "",
      deezer_track_id: item.deezerId || "",
      deezer_track_url: deezerUrl,
      cover_art_url: dz?.album?.cover_xl || dz?.album?.cover_big || "",
      youtube_track_url: item.youtubeTrackUrl || "",
      soundcloud_track_url: item.soundcloudTrackUrl || "",
      bandcamp_track_url: item.bandcampTrackUrl || "",
      bandcamp_track_id: item.bandcampTrackId || "",
      source_tags: item.sourceTags,
      album_keywords: item.albumKeywords,
      energy_band: item.energyBand,
      catalog_role: item.catalogRole,
      confidence: item.confidence,
      source_note: item.sourceNote || artistProfile.sourceNote || "",
      social_discovery_links: artistProfile.links || [],
      label_links: artistProfile.labelLinks || item.labelLinks || []
    });
  }
  return rows;
}

function buildProfileRows(trackRows) {
  const tracksByArtist = new Map();
  trackRows.forEach((track) => {
    const key = normalize(track.artist);
    if (!tracksByArtist.has(key)) tracksByArtist.set(key, []);
    tracksByArtist.get(key).push(track.song);
  });

  return PROFILES.map((item) => ({
    style: item.style,
    artist: item.artist,
    country: item.country,
    city: item.city,
    artist_bio: item.artistBio,
    artist_genre: item.artistGenre,
    artist_profile_hint: item.artistProfileHint,
    source: BATCH,
    source_url: item.sourceUrl,
    status: item.status,
    confidence: item.confidence,
    scene_role: item.sceneRole,
    aliases: item.aliases,
    source_note: item.sourceNote,
    social_discovery_links: item.links,
    label_links: item.labelLinks,
    profile_tracks: tracksByArtist.get(normalize(item.artist)) || item.profileTracks
  }));
}

function buildResearchRows() {
  return RESEARCH.map((item) => ({
    lineup_name: item.lineupName,
    canonical_artist: item.canonicalArtist,
    action: item.action,
    status: item.status,
    style: item.style,
    confidence: item.confidence,
    reason: item.reason,
    source_url: item.sourceUrl,
    notes: item.notes
  }));
}

function buildReport(profileRows, trackRows, researchRows) {
  const included = researchRows.filter((row) => row.action === "include");
  const excluded = researchRows.filter((row) => row.action === "exclude");
  const aliasOnly = researchRows.filter((row) => row.action === "alias_only");
  const styleCounts = profileRows.reduce((acc, row) => {
    acc[row.style] = (acc[row.style] || 0) + 1;
    return acc;
  }, {});

  const lines = [];
  lines.push("# Pachamama 2026 artist research");
  lines.push("");
  lines.push("Generated: 2026-06-21");
  lines.push(`Event: ${EVENT_NAME} (${EVENT_DATES})`);
  lines.push(`Event source: ${EVENT_URL}`);
  lines.push("");
  lines.push("## Outputs");
  lines.push("");
  lines.push(`- \`${path.relative(ROOT, PROFILE_OUT)}\`: ${profileRows.length} artist profile rows.`);
  lines.push(`- \`${path.relative(ROOT, TRACK_OUT)}\`: ${trackRows.length} playable/anchored track rows.`);
  lines.push(`- \`${path.relative(ROOT, RESEARCH_OUT)}\`: ${researchRows.length} inclusion/exclusion audit rows.`);
  lines.push("");
  lines.push("## Inclusion policy");
  lines.push("");
  lines.push("- Included lineup names only when there was a public track, Bandcamp/Deezer/YouTube/SoundCloud release, or a verifiable producer identity tied to a released collab project.");
  lines.push("- DJ-only, showcase-only, ritual-only, and names without reliable public tracks were kept out of artist/profile rows.");
  lines.push("- Subgenre assignment used release tags, label context, BPM notes, and prior audited catalog data. The lineup stage alone was not used as subgenre proof.");
  lines.push("- Pachamama happens after 2026-06-21, so included producers also get an upcoming-event fallback in the app/API.");
  lines.push("");
  lines.push("## Included artists");
  lines.push("");
  included.forEach((row) => {
    lines.push(`- ${row.canonical_artist}: ${row.style || "n/a"} (${row.confidence}) - ${row.reason}`);
  });
  lines.push("");
  lines.push("## Aliases / non-separate acts");
  lines.push("");
  aliasOnly.forEach((row) => {
    lines.push(`- ${row.lineup_name} -> ${row.canonical_artist}: ${row.reason}`);
  });
  lines.push("");
  lines.push("## Excluded for now");
  lines.push("");
  excluded.forEach((row) => {
    lines.push(`- ${row.lineup_name}: ${row.status} - ${row.reason}`);
  });
  lines.push("");
  lines.push("## Profile style counts");
  lines.push("");
  Object.entries(styleCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([style, count]) => lines.push(`- ${style}: ${count}`));
  lines.push("");
  lines.push("## Main sources");
  lines.push("");
  [
    EVENT_URL,
    "https://zikmusic1.bandcamp.com/",
    "https://ektoplazm.com/artist/zik",
    "https://www.deezer.com/track/493592102",
    "https://www.deezer.com/track/2068859787",
    "https://www.deezer.com/track/3863925681",
    "https://kasatkamusic.bandcamp.com/album/irreversible-echoes",
    "https://www.deezer.com/track/111169026",
    "https://www.deezer.com/track/110384814",
    "https://www.deezer.com/track/3540300671",
    "https://strangekaos.bandcamp.com/",
    "https://enygmamusic.bandcamp.com/track/tetraktyz-bethad-anima-158",
    "https://www.youtube.com/watch?v=DDgOOFv-pCQ",
    "https://www.youtube.com/watch?v=9OZwTwTmS9w",
    "https://www.youtube.com/watch?v=iYCfpRLQYWA",
    "https://www.youtube.com/watch?v=cDbZ7sTRycc",
    "https://katayyrecords.bandcamp.com/album/alcohbata-welcome-to-this-world",
    "https://www.deezer.com/track/3857759251",
    "https://theendlessknotrec.bandcamp.com/track/vuttun-nabaat-185bpm",
    "https://www.youtube.com/watch?v=8DGrxq6HtTc"
  ].forEach((source) => lines.push(`- ${source}`));
  lines.push("");
  return `${lines.join("\n")}\n`;
}

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(REPORT_DIR, { recursive: true });

const trackRows = await buildTrackRows();
const profileRows = buildProfileRows(trackRows);
const researchRows = buildResearchRows();

writeCsv(PROFILE_OUT, PROFILE_COLUMNS, profileRows);
writeCsv(TRACK_OUT, TRACK_COLUMNS, trackRows);
writeCsv(RESEARCH_OUT, RESEARCH_COLUMNS, researchRows);
fs.writeFileSync(REPORT_OUT, buildReport(profileRows, trackRows, researchRows), "utf8");

console.log(JSON.stringify({
  profiles: profileRows.length,
  tracks: trackRows.length,
  researchRows: researchRows.length,
  outputs: [PROFILE_OUT, TRACK_OUT, RESEARCH_OUT, REPORT_OUT].map((file) => path.relative(ROOT, file))
}, null, 2));
