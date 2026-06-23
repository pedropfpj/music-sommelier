#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const REPORT_DIR = path.join(ROOT, "reports");
const BATCH = "cosmic_crew_2026_research";
const EVENT_URL = "https://zig.tickets/eventos/cosmic-crew-23-anos";
const EVENT_NAME = "Cosmic Crew 23 anos";
const EVENT_DATES = "2026-07-31 to 2026-08-02";
const PROFILE_OUT = path.join(DATA_DIR, "cosmic_crew_2026_artist_profiles.csv");
const TRACK_OUT = path.join(DATA_DIR, "cosmic_crew_2026_playable_tracks.csv");
const RESEARCH_OUT = path.join(DATA_DIR, "cosmic_crew_2026_research.csv");
const REPORT_OUT = path.join(REPORT_DIR, "cosmic_crew_2026_research_2026-06-21.md");

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

function profile(def) {
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
  profile({
    style: "forest_psy",
    artist: "Umber Vamber",
    country: "Russia",
    city: "Moscow",
    artistGenre: "dark forest psytrance / forest psytrance",
    artistBio:
      "Umber Vamber e um projeto de Moscou iniciado em 2012, com som psicodelico profundo, atmosferico e groovado em territorio dark forest.",
    artistProfileHint:
      "Usar Umber Vamber para forest/dark forest: faixas publicadas entre 154 e 165 BPM, sem classificar como hi-tech.",
    sourceUrl:
      "https://umbervamber1.bandcamp.com/track/umbervamber-alcohbata-thundering-smoke-160bpm-katayy-records-brazil",
    aliases: "Artem Umber Vamber Leontev",
    sourceNote: "Bandcamp do artista lista discografia extensa e descreve o projeto como hybrid dark trance com forest/cosmic tunes.",
    links: ["https://umbervamber1.bandcamp.com/"],
    labelLinks: ["https://soundofnaturerecords.bandcamp.com/"]
  }),
  profile({
    style: "forest_psy",
    artist: "Umber Sonus",
    country: "Russia",
    city: "Moscow",
    artistGenre: "dark forest psytrance / forest psytrance",
    artistBio:
      "Umber Sonus aparece no catalogo do eixo Umber Vamber com faixas dark forest publicadas por Catar, Pralayah, Psionix e outros selos.",
    artistProfileHint:
      "Usar como forest/dark forest de alta energia; nao tratar como hitech apesar de algumas faixas acima de 160 BPM.",
    sourceUrl: "https://www.beatport.com/track/the-web-of-meaning/18351731",
    sourceNote: "Beatport classifica The Web of Meaning como Psy-Trance / Dark & Forest, 163 BPM.",
    links: ["https://umbervamber1.bandcamp.com/"]
  }),
  profile({
    style: "dark_psy",
    artist: "Phagos Sonus",
    country: "Russia",
    city: "Moscow",
    artistGenre: "darkpsy / forest psytrance",
    artistBio:
      "Phagos Sonus e o projeto do produtor Alex Zharov, com album Theatre of the Dust em Lycantrop Records e faixa de BPM dark/forest.",
    artistProfileHint:
      "Usar Phagos Sonus para darkpsy/forest narrativo, nao para hitech.",
    sourceUrl: "https://lycantroprecords.bandcamp.com/album/phagos-sonus-theatre-of-the-dust-album-lyccd007-2014",
    sourceNote: "Album Bandcamp lista faixas entre 150 e 170 BPM e projeto de produtor baseado em Moscou.",
    links: ["https://phagossonus.bandcamp.com/"]
  }),
  profile({
    style: "dark_psy",
    artist: "Ipotocaticac",
    country: "France",
    city: "Paris",
    artistGenre: "darkpsy / forestpsy / psygressive",
    artistBio:
      "Ipotocaticac e o projeto psytrance de Remo, de Paris, publicado pela Atomes Music com repertorio darkpsy, forestpsy e psygressive.",
    artistProfileHint:
      "Entrada corrigida do flyer: Ipotocaticac. Classificar como darkpsy/forest/psygressive, nao como hitech.",
    sourceUrl: "https://atomesmusic.bandcamp.com/album/the-mirror-of-the-world",
    aliases: "Ipotocattica; Ipotocatticac; Ipotocaticac",
    sourceNote: "Atomes Music descreve o projeto e inclui tags darkpsy, ethno, forestpsy, psychedelic, psygressive e psytrance.",
    links: ["https://atomesmusic.bandcamp.com/album/people-from-somewhere"]
  }),
  profile({
    style: "hi_tech",
    artist: "Paralocks",
    country: "South Africa",
    city: "Cape Town",
    artistGenre: "hi-tech psytrance / psycore-adjacent",
    artistBio:
      "Paralocks migrou do eixo dark sul-africano para velocidades mais altas, glitches high-tech e soundscapes dinamicos.",
    artistProfileHint:
      "Usar Paralocks como hi-tech principal; algumas faixas tambem aparecem em psycore, mas nao marcar como dark generico.",
    sourceUrl: "https://beatspace-mittaimusic.bandcamp.com/album/full-acceptance",
    aliases: "Paralocks Retro",
    sourceNote: "Full Acceptance informa a mudanca para higher speeds e high-tech glitches.",
    links: ["https://mittaimusic.com/releases"],
    labelLinks: ["https://beatspace-mittaimusic.bandcamp.com/"]
  }),
  profile({
    style: "freeform",
    artist: "Salakavala",
    country: "Finland",
    city: "",
    artistGenre: "freeform psytrance / suomisaundi",
    artistBio:
      "Salakavala e um duo finlandes de Suomitrance/freeform, com albums Magic Carpet e Unusual Conditions pela Hippie Killer Productions.",
    artistProfileHint:
      "Usar Salakavala para freeform/suomisaundi; separar de darkpsy e hitech.",
    sourceUrl: "https://www.salakavala.net/discography/",
    sourceNote: "Discografia oficial descreve Salakavala como Finnish trance madness masters e Magic Carpet como Suomitrance.",
    links: ["https://hippiekillerproductions.bandcamp.com/album/magic-carpet"]
  }),
  profile({
    style: "freeform",
    artist: "Igor Swamp",
    country: "Finland",
    city: "Hamburg",
    artistGenre: "freeform psytrance / suomisaundi",
    artistBio:
      "Igor Swamp e o projeto de Toni Sorsa, associado ao laboratorio Positive Dark e a discos suomisaundi pela Hippie Killer Productions/NULLZONE.",
    artistProfileHint:
      "Usar Igor Swamp em freeform/suomisaundi psicodelico, nao como darkpsy puro.",
    sourceUrl: "https://www.igorswamp.net/discography/",
    sourceNote: "Discografia oficial lista Hypha Hypha, Akrabadabra e outros albuns, com creditos de producao.",
    links: ["https://hippiekillerproductions.bandcamp.com/"]
  }),
  profile({
    style: "freeform",
    artist: "Gaida",
    country: "Finland",
    city: "",
    artistGenre: "suomisaundi / freeform / forest psy",
    artistBio:
      "Gaida e o duo finlandes de Tommy Lauhiala (Salakavala) e Iida Saarinen, misturando Goa trance, Suomisaundi e Forest psy.",
    artistProfileHint:
      "Usar Gaida como freeform/suomisaundi com ponte para forest, nao como dark ou hitech.",
    sourceUrl: "https://nullzone2007.bandcamp.com/album/guidance",
    sourceNote: "NULLZONE descreve o duo e a mistura de Goa trance, Suomisaundi e Forest psy.",
    links: ["https://www.artistcamp.com/gaida/guidance/9008798679522/index.html"],
    labelLinks: ["https://nullzone2007.bandcamp.com/"]
  }),
  profile({
    style: "forest_psy",
    artist: "Dylalien",
    country: "United States",
    city: "",
    artistGenre: "forest psytrance / darkpsy",
    artistBio:
      "Dylalien tem album B. Whalian pela Moon Koradji, descrito como uma exploracao de psytrance, forest e darkpsy.",
    artistProfileHint:
      "Usar Dylalien no recorte forest/darkpsy do album B. Whalian; nao confundir com trabalhos de techno experimental.",
    sourceUrl: "https://www.moonkoradji.com/artists/dylalien",
    sourceNote: "Moon Koradji lista B. Whalian como release de Dylalien; divulgacao fala em psytrance, forest e darkpsy.",
    links: ["https://moonkoradjirecords.bandcamp.com/"],
    labelLinks: ["https://www.moonkoradji.com/"]
  }),
  profile({
    style: "dark_psy",
    artist: "Alcohbata",
    country: "Brazil",
    city: "",
    artistGenre: "psytrance / darkpsy / forest-adjacent",
    artistBio:
      "Alcohbata e projeto brasileiro de psytrance com album Welcome To This World pela Katayy Records e colaboracoes dark forest.",
    artistProfileHint:
      "Entrada corrigida do flyer: Alcohbata. Usar como psytrance/dark forest-adjacent, sem marcar como hitech.",
    sourceUrl: "https://katayyrecords.bandcamp.com/album/alcohbata-welcome-to-this-world",
    aliases: "Alcohibata; Alcohbata BR",
    sourceNote: "Katayy Records publica o album do projeto; a colaboracao com Umber Vamber aparece com tags dark psy/forest.",
    links: ["https://www.katayyrecords.com.br/fr/musicas/"],
    labelLinks: ["https://katayyrecords.bandcamp.com/"]
  }),
  profile({
    style: "forest_psy",
    artist: "Traxon",
    country: "Brazil",
    city: "",
    artistGenre: "forest psytrance / dark forest",
    artistBio:
      "Traxon e projeto brasileiro de forest psytrance, com Taxi Pilot em V.A Brazilian Shamans e outras faixas em compilacoes de forest/dark.",
    artistProfileHint:
      "Usar Traxon para forest psytrance brasileiro; nao classificar como hitech.",
    sourceUrl: "https://woodogrecordingsofficial.bandcamp.com/album/v-a-brazilian-shamans-compiled-by-tiago-pires",
    sourceNote: "Brazilian Shamans lista Traxon - Taxi Pilot; Viberate tambem categoriza como Forest Psytrance.",
    links: ["https://www.viberate.com/artist/traxon/"]
  }),
  profile({
    style: "dark_progressive",
    artist: "Minimal Criminal",
    country: "Brazil",
    city: "",
    artistGenre: "dark progressive psytrance / zenonesque",
    artistBio:
      "Minimal Criminal e projeto brasileiro ligado ao dark progressive/Zenon, com faixas como The Architect, Alice in Acidland e Silver Exeloume.",
    artistProfileHint:
      "Usar Minimal Criminal em dark progressive/zenonesque; nao misturar com darkpsy, forest ou hitech.",
    sourceUrl: "https://www.deezer.com/track/359241241",
    sourceNote: "The Architect aparece em Two; catalogos de progressive dark/Zenon ja existem no app.",
    links: ["https://www.beatport.com/search?q=Minimal%20Criminal%20The%20Architect"]
  }),
  profile({
    style: "freeform",
    artist: "At Work",
    country: "Brazil",
    city: "Sao Paulo",
    artistGenre: "freeform psytrance / suomisaundi / west-psy",
    artistBio:
      "At Work e o projeto de Guilherme Araujo, produtor brasileiro de freeform psytrance/suomisaundi com EP Intrusive Thoughts pela Random Records.",
    artistProfileHint:
      "Incluir At Work como produtor live/freeform; separar de Mielikki, que apareceu como DJ no lineup.",
    sourceUrl: "https://randomrecords.bandcamp.com/album/intrusive-thoughts",
    aliases: "AT Work; atworkdj",
    sourceNote: "Random Records lista Intrusive Thoughts como EP by At Work, escrito e produzido por Guilherme Araujo.",
    links: ["https://tokisounds.bandcamp.com/album/biomas-compiled-by-at-work"],
    labelLinks: ["https://randomrecords.bandcamp.com/"]
  }),
  profile({
    style: "dark_experimental",
    artist: "IndacoRuna",
    country: "Italy",
    city: "",
    artistGenre: "dark experimental psytrance / psycore",
    artistBio:
      "IndacoRuna e projeto italiano de psytrance experimental, com faixas em Popol-Vuh, Madmuzik e releases recentes como Sabbat.",
    artistProfileHint:
      "Usar IndacoRuna para dark experimental; faixas acima de 180 BPM podem entrar em psycore, mas nao em hitech.",
    sourceUrl: "https://popol-vuh.bandcamp.com/album/v-a-xa-xa-namaxitacor-compiled-by-mita",
    aliases: "Indacoruna; Indaco Runa",
    sourceNote: "Popol-Vuh/Madmuzik e Deezer confirmam Propolisergica, Something Different e Sabbat.",
    links: ["https://madmuzik.bandcamp.com/album/va-the-hyperspace-madmuzik-2023-karacus-marakus-goa-22"]
  }),
  profile({
    style: "psycore",
    artist: "RadiRuna",
    country: "Italy",
    city: "",
    artistGenre: "psycore / dark experimental psytrance",
    artistBio:
      "RadiRuna e colaboracao Radice x IndacoRuna com faixas publicadas por Popol Vuh/Madmuzik em velocidades de 185 a 197 BPM.",
    artistProfileHint:
      "Usar RadiRuna em psycore/dark experimental, nao em hitech.",
    sourceUrl: "https://radice.bandcamp.com/track/radiruna-fragment-of-extinction",
    aliases: "Radiruna; Radice x IndacoRuna",
    sourceNote: "Fragment of Extinction tem fonte Bandcamp/Popol-Vuh; Pura Nasha aparece no VA The Hyperspace a 186 BPM.",
    links: ["https://madmuzik.bandcamp.com/album/va-the-hyperspace-madmuzik-2023-karacus-marakus-goa-22"]
  }),
  profile({
    style: "slambient",
    artist: "Radice",
    country: "Italy",
    city: "",
    artistGenre: "slambient / experimental psycore / darkpsy",
    artistBio:
      "Radice e projeto ligado a The Endless Knot, Post Modern Music e Labyrinthine Crew, com faixas slambient, experimentais e psycore.",
    artistProfileHint:
      "Usar Radice como slambient/experimental; faixas como Primordial Level tambem servem como ponte psycore.",
    sourceUrl: "https://radice.bandcamp.com/track/radice-primordial-level",
    sourceNote: "Bandcamp de Radice lista 36 releases e creditos com The Endless Knot; The Hyperspace lista Primordial Level a 180 BPM.",
    links: ["https://radice.bandcamp.com/"]
  }),
  profile({
    style: "dark_experimental",
    artist: "Umbra Lumen",
    country: "Brazil",
    city: "",
    artistGenre: "dark experimental psytrance / psycore",
    artistBio:
      "Umbra Lumen e projeto brasileiro de psytrance experimental de Khaline e Maramba, com singles Vysehrad e Sahasrara em 2026.",
    artistProfileHint:
      "Usar Umbra Lumen para dark experimental/psycore; manter separado de DJ/ritual session.",
    sourceUrl: "https://www.instagram.com/umbra__lumen/",
    sourceNote: "Perfil do projeto e plataformas confirmam Vysehrad e Sahasrara; set de Hitech Revolution 2026 lista as faixas do projeto.",
    links: ["https://www.youtube.com/watch?v=lx4M6xI-bcA"]
  })
];

const profileByArtist = new Map(PROFILES.map((item) => [normalize(item.artist), item]));

function t(def) {
  return {
    confidence: "high",
    sourceTags: [],
    albumKeywords: [],
    energyBand: "festival_lineup_verified",
    catalogRole: "cosmic_crew_2026_lineup_anchor;producer_with_verified_tracks",
    sourceNote: "",
    links: [],
    labelLinks: [],
    ...def
  };
}

const TRACKS = [
  t({ style: "forest_psy", artist: "Umber Vamber", song: "Seeker", label: "Dunes of Illusion", bpm: 155, deezerId: "3015150071", sourceUrl: "https://www.beatport.com/track/seeker/19556233", bandcampTrackUrl: "https://umbervamber1.bandcamp.com/track/umber-vamber-under-the-roots-seeker-155bpm-sound-of-nature-turkey", sourceTags: ["forest_psy", "dark_forest", "155_bpm"] }),
  t({ style: "dark_psy", artist: "Umber Vamber", song: "Thundering Smoke", label: "Ancient Wisdom Vol.2", bpm: 160, deezerId: "3615941402", sourceUrl: "https://umbervamber1.bandcamp.com/track/umbervamber-alcohbata-thundering-smoke-160bpm-katayy-records-brazil", bandcampTrackUrl: "https://umbervamber1.bandcamp.com/track/umbervamber-alcohbata-thundering-smoke-160bpm-katayy-records-brazil", sourceTags: ["dark_psy", "forest", "160_bpm"] }),
  t({ style: "dark_psy", artist: "Umber Vamber", song: "Dark Times", label: "Paradigma: Galactic Darkness", bpm: 172, deezerId: "2886097222", sourceUrl: "https://umbervamber1.bandcamp.com/", sourceTags: ["dark_psy", "dark_forest", "172_bpm"] }),

  t({ style: "forest_psy", artist: "Umber Sonus", song: "The Web of Meaning", label: "Pattern Breaker", bpm: 163, deezerId: "2542189261", sourceUrl: "https://www.beatport.com/track/the-web-of-meaning/18351731", soundcloudTrackUrl: "https://m.soundcloud.com/umber_vamber/umber-sonus-the-web-of-meaning-163-bpm-catar-recordsspain", sourceTags: ["dark_forest", "forest_psy", "163_bpm"] }),
  t({ style: "forest_psy", artist: "Umber Sonus", song: "Bipolar Inversion", label: "V.A NATURE LITERATURE", bpm: 155, deezerId: "3529956401", sourceUrl: "https://umbervamber1.bandcamp.com/", sourceTags: ["forest_psy", "155_bpm"] }),
  t({ style: "dark_psy", artist: "Umber Sonus", song: "El Kysh", label: "QUANTUM FOAM", bpm: 0, deezerId: "2744542941", sourceUrl: "https://umbervamber1.bandcamp.com/", sourceTags: ["dark_psy", "forest"] }),

  t({ style: "dark_psy", artist: "Phagos Sonus", song: "Invitation to a Beheading", label: "Theatre of the Dust", bpm: 165, deezerId: "1854303537", sourceUrl: "https://lycantroprecords.bandcamp.com/album/phagos-sonus-theatre-of-the-dust-album-lyccd007-2014", bandcampTrackUrl: "https://lycantroprecords.bandcamp.com/album/phagos-sonus-theatre-of-the-dust-album-lyccd007-2014", sourceTags: ["dark_psy", "forest", "162_170_bpm"] }),
  t({ style: "forest_psy", artist: "Phagos Sonus", song: "TAnay", label: "Theatre of the Dust", bpm: 155, deezerId: "1854303507", sourceUrl: "https://lycantroprecords.bandcamp.com/album/phagos-sonus-theatre-of-the-dust-album-lyccd007-2014", bandcampTrackUrl: "https://lycantroprecords.bandcamp.com/album/phagos-sonus-theatre-of-the-dust-album-lyccd007-2014", sourceTags: ["forest_psy", "dark_psy", "155_bpm"] }),
  t({ style: "dark_psy", artist: "Phagos Sonus", song: "Phantom of the Opera (Ghost Project)", label: "Theatre of the Dust", bpm: 160, deezerId: "1854303557", sourceUrl: "https://lycantroprecords.bandcamp.com/album/phagos-sonus-theatre-of-the-dust-album-lyccd007-2014", sourceTags: ["dark_psy", "forest", "160_bpm"] }),

  t({ style: "dark_psy", artist: "Ipotocaticac", song: "The Mirror of the World", label: "The Mirror of the World", bpm: 0, deezerId: "673055022", sourceUrl: "https://atomesmusic.bandcamp.com/album/the-mirror-of-the-world", bandcampTrackUrl: "https://atomesmusic.bandcamp.com/album/the-mirror-of-the-world", sourceTags: ["darkpsy", "forestpsy", "psygressive"] }),
  t({ style: "forest_psy", artist: "Ipotocaticac", song: "Enchanted Ride", label: "The Mirror of the World", bpm: 0, deezerId: "673055032", sourceUrl: "https://atomesmusic.bandcamp.com/album/the-mirror-of-the-world", bandcampTrackUrl: "https://atomesmusic.bandcamp.com/album/the-mirror-of-the-world", sourceTags: ["forestpsy", "psygressive"] }),
  t({ style: "dark_psy", artist: "Ipotocaticac", song: "Mescalito", label: "People from Somewhere", bpm: 0, deezerId: "1766340637", sourceUrl: "https://atomesmusic.bandcamp.com/album/people-from-somewhere", bandcampTrackUrl: "https://atomesmusic.bandcamp.com/album/people-from-somewhere", sourceTags: ["darkpsy", "forestpsy", "psychedelic"] }),

  t({ style: "hi_tech", artist: "Paralocks", song: "Full Acceptance", label: "Mittai Music", bpm: 0, deezerId: "3495420171", sourceUrl: "https://beatspace-mittaimusic.bandcamp.com/album/full-acceptance", bandcampTrackUrl: "https://beatspace-mittaimusic.bandcamp.com/album/full-acceptance", sourceTags: ["hi_tech", "high_speed", "not_dark_generic"] }),
  t({ style: "hi_tech", artist: "Paralocks", song: "Realm - 195 bpm", label: "System Reboot", bpm: 195, deezerId: "3305707361", sourceUrl: "https://www.deezer.com/track/3305707361", sourceTags: ["hi_tech", "195_bpm"] }),
  t({ style: "hi_tech", artist: "Paralocks", song: "We Will Prevail", label: "Ultra Dynamics", bpm: 0, deezerId: "61619761", sourceUrl: "https://www.deezer.com/track/61619761", sourceTags: ["hi_tech"] }),

  t({ style: "freeform", artist: "Salakavala", song: "Catronaut", label: "Magic Carpet", bpm: 0, deezerId: "493651792", sourceUrl: "https://www.salakavala.net/discography/", bandcampTrackUrl: "https://hippiekillerproductions.bandcamp.com/album/magic-carpet", sourceTags: ["suomisaundi", "freeform"] }),
  t({ style: "freeform", artist: "Salakavala", song: "No Glue", label: "10 Years Of Randomness", bpm: 0, deezerId: "1025142162", sourceUrl: "https://www.deezer.com/track/1025142162", sourceTags: ["suomisaundi", "freeform"] }),
  t({ style: "freeform", artist: "Salakavala", song: "Salalalaa", label: "Frequency Brew", bpm: 0, deezerId: "1034904042", sourceUrl: "https://www.deezer.com/track/1034904042", sourceTags: ["suomisaundi", "freeform"] }),

  t({ style: "freeform", artist: "Igor Swamp", song: "Lusty District", label: "Akrabadabra", bpm: 0, deezerId: "561127782", sourceUrl: "https://www.igorswamp.net/discography/", sourceTags: ["suomisaundi", "freeform"] }),
  t({ style: "freeform", artist: "Igor Swamp", song: "Hidden Hypha", label: "Hypha Hypha", bpm: 0, deezerId: "417707652", sourceUrl: "https://www.igorswamp.net/discography/", sourceTags: ["suomisaundi", "positive_dark"] }),
  t({ style: "freeform", artist: "Igor Swamp", song: "Over the Fences", label: "Hafen Hertz", bpm: 0, deezerId: "1031623182", sourceUrl: "https://www.igorswamp.net/discography/", sourceTags: ["suomisaundi", "freeform"] }),

  t({ style: "freeform", artist: "Gaida", song: "Black Box", label: "Guidance", bpm: 0, deezerId: "3310859831", sourceUrl: "https://nullzone2007.bandcamp.com/album/guidance", bandcampTrackUrl: "https://nullzone2007.bandcamp.com/album/guidance", sourceTags: ["suomisaundi", "freeform", "forest_psy"] }),
  t({ style: "freeform", artist: "Gaida", song: "Yazzy", label: "Kiitos Vol.2", bpm: 0, deezerId: "3695195842", sourceUrl: "https://randomrecords.bandcamp.com/album/kiitos-vol-2", bandcampTrackUrl: "https://randomrecords.bandcamp.com/album/kiitos-vol-2", sourceTags: ["suomisaundi", "freeform"] }),

  t({ style: "forest_psy", artist: "Dylalien", song: "Don't Shake Your Teeth at the DJ", label: "B. Whalian", bpm: 0, deezerId: "4063838741", sourceUrl: "https://www.moonkoradji.com/artists/dylalien", sourceTags: ["forest_psy", "darkpsy"] }),
  t({ style: "forest_psy", artist: "Dylalien", song: "Portal Party Mix 5000", label: "B. Whalian", bpm: 0, deezerId: "4063838781", sourceUrl: "https://www.moonkoradji.com/artists/dylalien", sourceTags: ["forest_psy", "darkpsy"] }),
  t({ style: "dark_psy", artist: "Dylalien", song: "Bassiachi", label: "B. Whalian", bpm: 0, deezerId: "4063838751", sourceUrl: "https://www.moonkoradji.com/artists/dylalien", sourceTags: ["darkpsy", "forest_psy"] }),

  t({ style: "dark_psy", artist: "Alcohbata", song: "Pure Love", label: "Welcome to This World", bpm: 0, deezerId: "842642732", sourceUrl: "https://katayyrecords.bandcamp.com/album/alcohbata-welcome-to-this-world", bandcampTrackUrl: "https://katayyrecords.bandcamp.com/album/alcohbata-welcome-to-this-world", sourceTags: ["psytrance", "darkpsy"] }),
  t({ style: "dark_psy", artist: "Alcohbata", song: "Youtab Ariobarzan", label: "VA ZAN", bpm: 0, deezerId: "2844875492", sourceUrl: "https://www.deezer.com/track/2844875492", sourceTags: ["psytrance", "darkpsy"] }),
  t({ style: "dark_psy", artist: "Alcohbata", song: "Morning Ritual", label: "Time Warp", bpm: 0, deezerId: "3615872942", sourceUrl: "https://www.deezer.com/track/3615872942", sourceTags: ["psytrance", "ritual_dark"] }),

  t({ style: "forest_psy", artist: "Traxon", song: "Taxi Pilot", label: "Brazilian Shamans", bpm: 148, deezerId: "81169082", sourceUrl: "https://woodogrecordingsofficial.bandcamp.com/album/v-a-brazilian-shamans-compiled-by-tiago-pires", bandcampTrackUrl: "https://woodogrecordingsofficial.bandcamp.com/album/v-a-brazilian-shamans-compiled-by-tiago-pires", sourceTags: ["forest_psy", "148_bpm"] }),
  t({ style: "forest_psy", artist: "Traxon", song: "Boomreasca (148)", label: "UNUS MUNDUS", bpm: 148, deezerId: "478903342", sourceUrl: "https://www.deezer.com/track/478903342", sourceTags: ["forest_psy", "148_bpm"] }),
  t({ style: "forest_psy", artist: "Traxon", song: "Deep", label: "Heart of the Forest", bpm: 0, deezerId: "446469522", sourceUrl: "https://www.deezer.com/track/446469522", sourceTags: ["forest_psy", "dark_forest"] }),

  t({ style: "dark_progressive", artist: "Minimal Criminal", song: "The Architect", label: "Two", bpm: 0, deezerId: "359241241", sourceUrl: "https://www.deezer.com/track/359241241", sourceTags: ["dark_progressive", "zenonesque"] }),
  t({ style: "dark_progressive", artist: "Minimal Criminal", song: "Alice in Acidland", label: "Minimus Maleficarum", bpm: 0, deezerId: "72107481", sourceUrl: "https://www.deezer.com/track/72107481", sourceTags: ["dark_progressive", "zenonesque"] }),
  t({ style: "dark_progressive", artist: "Minimal Criminal", song: "Colonization -140-", label: "RECOVERED TRIPS (EP)", bpm: 140, deezerId: "543190142", sourceUrl: "https://www.deezer.com/track/543190142", sourceTags: ["dark_progressive", "140_bpm"] }),

  t({ style: "freeform", artist: "At Work", song: "Intrusive Thoughts", label: "Intrusive Thoughts", bpm: 0, deezerId: "3454068771", sourceUrl: "https://randomrecords.bandcamp.com/album/intrusive-thoughts", bandcampTrackUrl: "https://randomrecords.bandcamp.com/album/intrusive-thoughts", sourceTags: ["freeform", "suomisaundi", "west_psy"] }),
  t({ style: "freeform", artist: "At Work", song: "Compulsive Patterns", label: "Intrusive Thoughts", bpm: 0, deezerId: "3454068721", sourceUrl: "https://randomrecords.bandcamp.com/album/intrusive-thoughts", bandcampTrackUrl: "https://randomrecords.bandcamp.com/album/intrusive-thoughts", sourceTags: ["freeform", "suomisaundi"] }),
  t({ style: "freeform", artist: "At Work", song: "Leilao de Gado", label: "Futuristic Humans", bpm: 0, deezerId: "2212989547", sourceUrl: "https://futuristicgrow.bandcamp.com/album/futuristic-humans", bandcampTrackUrl: "https://futuristicgrow.bandcamp.com/album/futuristic-humans", sourceTags: ["freeform", "suomisaundi", "west_psy"] }),

  t({ style: "psycore", artist: "IndacoRuna", song: "Propolisergica (Original Mix)", label: "Xa Xa Namaxitacore", bpm: 198, deezerId: "776759942", sourceUrl: "https://popol-vuh.bandcamp.com/album/v-a-xa-xa-namaxitacor-compiled-by-mita", sourceTags: ["psycore", "dark_experimental", "198_bpm"] }),
  t({ style: "psycore", artist: "IndacoRuna", song: "Something Different", label: "VA - The Hyperspace", bpm: 181, deezerId: "2274094337", sourceUrl: "https://madmuzik.bandcamp.com/album/va-the-hyperspace-madmuzik-2023-karacus-marakus-goa-22", bandcampTrackUrl: "https://madmuzik.bandcamp.com/album/va-the-hyperspace-madmuzik-2023-karacus-marakus-goa-22", sourceTags: ["psycore", "dark_experimental", "181_bpm"] }),
  t({ style: "dark_experimental", artist: "IndacoRuna", song: "Mabon", label: "Sabbat", bpm: 0, deezerId: "3143457211", sourceUrl: "https://www.deezer.com/track/3143457211", sourceTags: ["dark_experimental", "ritual_psytrance"] }),

  t({ style: "psycore", artist: "RadiRuna", song: "Pura Nasha", label: "VA - The Hyperspace", bpm: 186, deezerId: "2274094347", sourceUrl: "https://madmuzik.bandcamp.com/album/va-the-hyperspace-madmuzik-2023-karacus-marakus-goa-22", bandcampTrackUrl: "https://madmuzik.bandcamp.com/album/va-the-hyperspace-madmuzik-2023-karacus-marakus-goa-22", sourceTags: ["psycore", "darkpsy", "186_bpm"] }),
  t({ style: "psycore", artist: "RadiRuna", song: "Fragment of Extinction", label: "V/A Entheogen", bpm: 197, deezerId: "1531840892", sourceUrl: "https://radice.bandcamp.com/track/radiruna-fragment-of-extinction", bandcampTrackUrl: "https://radice.bandcamp.com/track/radiruna-fragment-of-extinction", sourceTags: ["psycore", "darkpsy", "197_bpm"] }),
  t({ style: "psycore", artist: "RadiRuna", song: "Scaccia Pensieri", label: "Limone E Zenzero, Vol. 1", bpm: 0, deezerId: "1157194082", sourceUrl: "https://www.deezer.com/track/1157194082", sourceTags: ["psycore", "dark_experimental"] }),

  t({ style: "psycore", artist: "Radice", song: "Primordial Level", label: "VA - The Hyperspace", bpm: 180, deezerId: "2274094357", sourceUrl: "https://radice.bandcamp.com/track/radice-primordial-level", bandcampTrackUrl: "https://radice.bandcamp.com/track/radice-primordial-level", sourceTags: ["psycore", "slambient", "180_bpm"] }),
  t({ style: "slambient", artist: "Radice", song: "Radipiri", label: "VA - Metamorphosis - Evolution", bpm: 0, sourceUrl: "https://samanarecords.bandcamp.com/album/va-metamorphosis-evolution", bandcampTrackUrl: "https://samanarecords.bandcamp.com/album/va-metamorphosis-evolution", sourceTags: ["slambient", "experimental", "darkpsy"] }),
  t({ style: "slambient", artist: "Radice", song: "Saudade", label: "Radice - Saudade", bpm: 0, sourceUrl: "https://radice.bandcamp.com/track/radice-saudade", bandcampTrackUrl: "https://radice.bandcamp.com/track/radice-saudade", sourceTags: ["slambient", "experimental"] }),

  t({ style: "dark_experimental", artist: "Umbra Lumen", song: "Vysehrad", label: "Vysehrad", bpm: 0, deezerId: "3857759251", sourceUrl: "https://open.spotify.com/track/2eEbhnxHg1lwH0jpnsqV01", youtubeTrackUrl: "https://www.youtube.com/watch?v=lx4M6xI-bcA", sourceTags: ["dark_experimental", "psycore"] }),
  t({ style: "dark_experimental", artist: "Umbra Lumen", song: "Sahasrara", label: "Sahasrara", bpm: 0, deezerId: "3937073021", sourceUrl: "https://open.spotify.com/track/3a8m4AcHgptqRRG87z2Upl", youtubeTrackUrl: "https://www.youtube.com/watch?v=lx4M6xI-bcA", sourceTags: ["dark_experimental", "psycore"] })
];

const RESEARCH = [
  r("Umber Vamber", "Umber Vamber", "include", "producer_with_tracks", "forest_psy", "high", "Bandcamp/Deezer/Beatport confirmam varias faixas; subgenero dark forest/forest.", "https://umbervamber1.bandcamp.com/"),
  r("Umber Sonus", "Umber Sonus", "include", "producer_with_tracks", "forest_psy", "high", "Beatport e Deezer confirmam faixas dark & forest como The Web of Meaning.", "https://www.beatport.com/track/the-web-of-meaning/18351731"),
  r("Phagos Sonus", "Phagos Sonus", "include", "producer_with_tracks", "dark_psy", "high", "Album Theatre of the Dust em Lycantrop Records confirma projeto e faixas 150-170 BPM.", "https://lycantroprecords.bandcamp.com/album/phagos-sonus-theatre-of-the-dust-album-lyccd007-2014"),
  r("Ipotocaticac", "Ipotocaticac", "include", "producer_with_tracks", "dark_psy", "high", "Nome corrigido; Atomes Music confirma album e tags darkpsy/forestpsy/psygressive.", "https://atomesmusic.bandcamp.com/album/the-mirror-of-the-world", "Corrige Ipotocattica/Ipotocatticac do OCR."),
  r("Paralocks", "Paralocks", "include", "producer_with_tracks", "hi_tech", "high", "Full Acceptance descreve foco em higher speeds e high-tech glitches.", "https://beatspace-mittaimusic.bandcamp.com/album/full-acceptance"),
  r("Paralocks Retro", "Paralocks", "alias_only", "not_separate_artist", "hi_tech", "high", "Tratado como formato/set retro de Paralocks, nao artista separado.", "https://beatspace-mittaimusic.bandcamp.com/album/full-acceptance"),
  r("Salakavala", "Salakavala", "include", "producer_with_tracks", "freeform", "high", "Discografia oficial confirma Suomitrance/freeform.", "https://www.salakavala.net/discography/"),
  r("Igor Swamp", "Igor Swamp", "include", "producer_with_tracks", "freeform", "high", "Discografia oficial confirma albums e creditos de producao.", "https://www.igorswamp.net/discography/"),
  r("Gaida", "Gaida", "include", "producer_with_tracks", "freeform", "high", "NULLZONE confirma duo finlandes misturando Goa, Suomisaundi e Forest psy.", "https://nullzone2007.bandcamp.com/album/guidance"),
  r("Dylalien", "Dylalien", "include", "producer_with_tracks", "forest_psy", "medium_high", "Moon Koradji confirma release B. Whalian; material descrito como psytrance/forest/darkpsy.", "https://www.moonkoradji.com/artists/dylalien"),
  r("Alcohibata", "Alcohbata", "include", "producer_with_tracks", "dark_psy", "high", "Nome corrigido para Alcohbata; Katayy/Deezer confirmam album e faixas.", "https://katayyrecords.bandcamp.com/album/alcohbata-welcome-to-this-world"),
  r("Traxon", "Traxon", "include", "producer_with_tracks", "forest_psy", "high", "Brazilian Shamans lista Traxon - Taxi Pilot; fontes categorizam como forest psytrance.", "https://woodogrecordingsofficial.bandcamp.com/album/v-a-brazilian-shamans-compiled-by-tiago-pires"),
  r("Minimal Criminal", "Minimal Criminal", "include", "producer_with_tracks", "dark_progressive", "high", "Faixas publicadas confirmam dark progressive/zenonesque; nao darkpsy/hitech.", "https://www.deezer.com/track/359241241"),
  r("At Work", "At Work", "include", "producer_with_tracks", "freeform", "high", "Random Records confirma EP by At Work, escrito e produzido por Guilherme Araujo.", "https://randomrecords.bandcamp.com/album/intrusive-thoughts"),
  r("Mielikki", "Mielikki", "exclude", "dj_only_or_unverified_project", "", "medium", "Resultados relevantes apontam DJ Mielikki; Deezer traz artista homonimo nao-psy, entao nao promovi como produtor.", "https://playbpm.com.br/noticias/bloco-psytrance-somos-nozes-abril-2022/"),
  r("Booo", "Booo", "exclude", "dj_only_or_unverified_project", "", "medium", "Fontes publicas listam Dj BooO/Cosmic Crew/O.V.N.I.; nao encontrei faixa propria verificavel sob esta identidade.", "https://www.instagram.com/reel/DEDt1fwPUsZ/"),
  r("Sutemi", "Sutemi", "exclude", "dj_only", "", "high", "Parvati Records chama Sutemi explicitamente de DJ; sem faixa propria verificada para entrada de produtor.", "https://parvati-records.com/author/parvatirec/page/3/"),
  r("IndacoRuna", "IndacoRuna", "include", "producer_with_tracks", "dark_experimental", "high", "Popol-Vuh/Madmuzik/Deezer confirmam faixas; classificar como dark experimental/psycore por faixa.", "https://popol-vuh.bandcamp.com/album/v-a-xa-xa-namaxitacor-compiled-by-mita"),
  r("RadiRuna", "RadiRuna", "include", "producer_with_tracks", "psycore", "high", "Projeto Radice x IndacoRuna com Pura Nasha/Fragment of Extinction; 185-197 BPM.", "https://radice.bandcamp.com/track/radiruna-fragment-of-extinction"),
  r("Radice", "Radice", "include", "producer_with_tracks", "slambient", "high", "Bandcamp de Radice e The Hyperspace confirmam catalogo slambient/experimental/psycore.", "https://radice.bandcamp.com/track/radice-primordial-level"),
  r("Umbra Lumen", "Umbra Lumen", "include", "producer_with_tracks", "dark_experimental", "medium_high", "Singles Vysehrad/Sahasrara confirmados em plataformas; perfil do projeto aponta dark/experimental/psycore.", "https://www.instagram.com/umbra__lumen/"),
  r("Paula", "Paula", "exclude", "ritual_or_dj_unverified", "", "medium", "Nome generico em Special Ritual Session; sem release proprio verificavel ligado ao lineup.", EVENT_URL),
  r("Thaty", "Thaty", "exclude", "ritual_or_dj_unverified", "", "medium", "Nome generico em Special Ritual Session; sem release proprio verificavel ligado ao lineup.", EVENT_URL)
];

function r(lineupName, canonicalArtist, action, status, style, confidence, reason, sourceUrl, notes = "") {
  return { lineupName, canonicalArtist, action, status, style, confidence, reason, sourceUrl, notes };
}

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
      headers: { Accept: "application/json", "User-Agent": "Codex Cosmic Crew research" }
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
    const row = {
      style: item.style,
      artist: item.artist,
      song: item.song,
      label: item.label || dz?.album?.title || "Cosmic Crew 2026 research",
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
      album_keywords: item.albumKeywords.length ? item.albumKeywords : [EVENT_NAME, "Psychedelic Revolution"],
      energy_band: item.energyBand,
      catalog_role: item.catalogRole,
      confidence: item.confidence,
      source_note: item.sourceNote || artistProfile.sourceNote || "",
      social_discovery_links: artistProfile.links || [],
      label_links: artistProfile.labelLinks || item.labelLinks || []
    };
    rows.push(row);
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
  lines.push("# Cosmic Crew 2026 artist research");
  lines.push("");
  lines.push(`Generated: 2026-06-21`);
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
  lines.push("- Included only names with a public track, album, EP, or platform track under the same project identity.");
  lines.push("- DJ-only, ritual-only, generic, or homonym-risk names were not promoted to producer rows.");
  lines.push("- Subgenre was assigned from release context and label language, not only from festival stage context.");
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
    "https://umbervamber1.bandcamp.com/",
    "https://lycantroprecords.bandcamp.com/album/phagos-sonus-theatre-of-the-dust-album-lyccd007-2014",
    "https://atomesmusic.bandcamp.com/album/the-mirror-of-the-world",
    "https://beatspace-mittaimusic.bandcamp.com/album/full-acceptance",
    "https://www.salakavala.net/discography/",
    "https://www.igorswamp.net/discography/",
    "https://nullzone2007.bandcamp.com/album/guidance",
    "https://www.moonkoradji.com/artists/dylalien",
    "https://katayyrecords.bandcamp.com/album/alcohbata-welcome-to-this-world",
    "https://woodogrecordingsofficial.bandcamp.com/album/v-a-brazilian-shamans-compiled-by-tiago-pires",
    "https://randomrecords.bandcamp.com/album/intrusive-thoughts",
    "https://madmuzik.bandcamp.com/album/va-the-hyperspace-madmuzik-2023-karacus-marakus-goa-22",
    "https://radice.bandcamp.com/track/radiruna-fragment-of-extinction",
    "https://radice.bandcamp.com/"
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
