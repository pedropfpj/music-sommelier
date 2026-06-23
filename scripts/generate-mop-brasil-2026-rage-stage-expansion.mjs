#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const REPORT_DIR = path.join(ROOT, "reports");
const BATCH = "mop_brasil_2026_rage_stage_research";
const EVENT_NAME = "Masters of Puppets Brazil 2026 - Rage Stage by Void Brasil";
const EVENT_DATES = "2026-05-15 to 2026-05-18";
const EVENT_URL = "https://www.party-accessory.eu/festivals/masters-of-puppets-brazil/";
const EVENT_URL_ALT = "https://www.jambase.com/festival/masters-of-puppets-brazil-2026";
const PROFILE_OUT = path.join(DATA_DIR, "mop_brasil_2026_rage_artist_profiles.csv");
const TRACK_OUT = path.join(DATA_DIR, "mop_brasil_2026_rage_playable_tracks.csv");
const RESEARCH_OUT = path.join(DATA_DIR, "mop_brasil_2026_rage_research.csv");
const REPORT_OUT = path.join(REPORT_DIR, "mop_brasil_2026_rage_stage_research_2026-06-21.md");

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
    style: "dark_experimental",
    artist: "Karmn'Eugen",
    country: "Brazil",
    city: "Guarulhos",
    artistGenre: "IDM / dark experimental / dark psychedelic",
    artistBio:
      "Karmn'Eugen e uma faceta experimental de Necropsycho, com releases que misturam IDM, dark psychedelic, breakbeat e pressao ritual.",
    artistProfileHint:
      "Usar Karmn'Eugen como dark experimental/IDM de pista; nao classificar como hitech por aparecer na Rage Stage.",
    sourceUrl: "https://necropsycho.bandcamp.com/album/body-awakening",
    aliases: "Karmn Eugen; KarmnEugen; Carmine Eugenio Tarsitano",
    sourceNote:
      "Body Awakening tem faixas a 170 BPM no Bandcamp; divulgacoes do projeto citam IDM, breakbeat e drum and bass como eixo experimental.",
    links: ["https://www.youtube.com/watch?v=KevRrSb6ZfY"],
    labelLinks: ["https://necropsycho.bandcamp.com/"]
  }),
  p({
    style: "dark_experimental",
    artist: "Necropsycho",
    country: "Brazil",
    city: "Guarulhos",
    artistGenre: "dark experimental psytrance / darkpsy / psycore-adjacent",
    artistBio:
      "Necropsycho e o projeto de Carmine Eugenio Tarsitano, figura brasileira central do dark psychedelic extremo e experimental.",
    artistProfileHint:
      "Priorizar dark experimental/darkpsy; algumas faixas encostam em psycore, mas nao tratar como hitech generico.",
    sourceUrl: "https://www.deezer.com/en/track/2938879461",
    aliases: "Necropsyco; Nuccho",
    sourceNote: "Deezer confirma OPPEES em God's Own Country; Bandcamp oficial confirma catalogo proprio e colabs.",
    links: ["https://necropsycho.bandcamp.com/"],
    labelLinks: ["https://necropsycho.bandcamp.com/"]
  }),
  p({
    style: "dark_experimental",
    artist: "Kasatka",
    country: "Germany",
    city: "Hamburg",
    artistGenre: "darkpsy / dark experimental / hightech-adjacent",
    artistBio:
      "Kasatka e o alias de Marco em Hamburgo, com discografia Bandcamp marcada por darkpsy, experimental e hightech.",
    artistProfileHint:
      "Usar Kasatka como dark experimental de alta velocidade; so usar hi_tech quando a faixa indicar isso claramente.",
    sourceUrl: "https://kasatkamusic.bandcamp.com/album/irreversible-echoes",
    sourceNote: "Bandcamp lista Irreversible Echoes e tags electronic, darkpsy, experimental, hightech e psytrance.",
    links: ["https://kasatkamusic.bandcamp.com/"]
  }),
  p({
    style: "psycore",
    artist: "Infra",
    country: "Austria",
    city: "Salzburg",
    artistGenre: "darkpsy / psycore / experimental psychedelic",
    artistBio:
      "Infra e o projeto de Sebastian ligado ao nucleo Tzu-Jan, com faixas publicadas no Bandcamp oficial e sets retro no circuito MOP.",
    artistProfileHint:
      "Entrada do flyer Infra Retro deve apontar para Infra, nao virar artista separado; classificar no eixo darkpsy/psycore.",
    sourceUrl: "https://tzu-jan-official.bandcamp.com/",
    aliases: "Infra Retro; Sebastian; Infra / Tzu-Jan",
    sourceNote: "Bandcamp de Tzu-Jan lista faixas de Infra como Nullpunktfeld e Kietai na discografia do projeto.",
    links: ["https://tzu-jan-official.bandcamp.com/"]
  }),
  p({
    style: "psycore",
    artist: "Tzu Jan",
    country: "Austria",
    city: "Salzburg",
    artistGenre: "darkpsy / psycore / experimental psychedelic",
    artistBio:
      "Tzu Jan e o duo austriaco Sebastian e Natalie, com albums Bandcamp em darkpsy, experimental, psycore e psytrance.",
    artistProfileHint:
      "Usar Tzu Jan para darkpsy/psycore experimental; nao confundir com hitech puro apesar da velocidade.",
    sourceUrl: "https://tzu-jan-official.bandcamp.com/album/tzu-jan-entelechie",
    aliases: "Tzu-Jan; Tzu~Jan; Tzu Jan Official; Infra / Tzu-Jan",
    sourceNote: "Entelechie no Bandcamp traz tags darkpsy, experimental, psycore e psytrance.",
    links: ["https://tzu-jan-official.bandcamp.com/"]
  }),
  p({
    style: "dark_psy",
    artist: "Absurdus",
    country: "Hungary",
    city: "",
    artistGenre: "darkpsy / night psytrance",
    artistBio:
      "Absurdus aparece no recorte darkpsy europeu com faixas como Transmutation e Zephyrum em plataformas abertas.",
    artistProfileHint:
      "Classificar como darkpsy de alta energia; nao promover a psycore/hitech sem BPM ou fonte de release.",
    sourceUrl: "https://www.deezer.com/track/3528600411",
    aliases: "Absurdus Sounds",
    sourceNote: "Deezer confirma Transmutation e Zephyrum sob o mesmo artista; fonte social usa hashtags psytrance/darkpsy.",
    links: ["https://www.instagram.com/absurdusmuzik/"]
  }),
  p({
    style: "psycore",
    artist: "Varasurdum",
    country: "Hungary",
    city: "",
    artistGenre: "darkpsy / psycore live collaboration",
    artistBio:
      "Varasurdum e a colaboracao Varazslo com Absurdus, usada em lineups de MOP e Zenovoid para sets e faixas publicas.",
    artistProfileHint:
      "Tratar Varasurdum como projeto colaborativo de Varazslo e Absurdus; nao duplicar como DJ sem faixa.",
    sourceUrl: "https://www.youtube.com/watch?v=B6S2o7sCIj8",
    confidence: "medium_high",
    sceneRole: "collab_project_with_public_track",
    aliases: "Varazslo vs Absurdus; Varazslo & Absurdus",
    sourceNote: "Mechanika aparece como faixa publica de Varasurdum; lineup portugues tambem descreve Varasurdum como Varazslo vs Absurdus.",
    links: ["https://www.youtube.com/watch?v=B6S2o7sCIj8"],
    labelLinks: ["https://zenovoidrecords.bandcamp.com/"]
  }),
  p({
    style: "psycore",
    artist: "Varazslo",
    country: "Hungary",
    city: "",
    artistGenre: "psycore / darkpsy / high-BPM psychedelic trance",
    artistBio:
      "Varazslo e projeto hungaro de alta intensidade, com album Expressed Impressions e releases Zenovoid/Sacred Sound.",
    artistProfileHint:
      "Classificar como psycore/darkpsy de alta velocidade; evitar darkpsy generico quando a faixa for high-BPM/psycore.",
    sourceUrl: "https://sacredsoundrecs.bandcamp.com/album/expressed-impressions-free-download",
    aliases: "Varazslo; Varazslo Music; Varazsombor",
    sourceNote: "Expressed Impressions aparece em Bandcamp e Exorbeatal como Darkpsy/Psycore.",
    links: ["https://zenovoidrecords.bandcamp.com/album/scrapbook"],
    labelLinks: ["https://sacredsoundrecs.bandcamp.com/"]
  }),
  p({
    style: "hi_tech",
    artist: "KiLLATK",
    country: "Brazil",
    city: "Sao Paulo",
    artistGenre: "hi-tech psytrance / psytrance",
    artistBio:
      "KiLLATK e projeto brasileiro de Sao Paulo ligado ao hi-tech psytrance, com faixas como Babaji Vibes e Nitrous Drive.",
    artistProfileHint:
      "Usar KiLLATK como hi_tech; nao puxar para dark experimental so por estar na Rage Stage.",
    sourceUrl: "https://www.deezer.com/us/artist/13226473",
    aliases: "Killatk; KiLLATK Music",
    sourceNote: "Deezer confirma discografia; Viberate descreve como artista brasileiro de electronic/psy trance.",
    links: ["https://www.viberate.com/artist/killatk/"]
  }),
  p({
    style: "hi_tech",
    artist: "Mentalecho",
    country: "Portugal",
    city: "",
    artistGenre: "hi-tech psytrance / experimental psytrance",
    artistBio:
      "Mentalecho e projeto solo de Bernardo Fialho, publicado pela Black Out Records com EP Digital Nature e faixas de hi-tech.",
    artistProfileHint:
      "Classificar como hi_tech; nao confundir com dark experimental apenas pela estetica psicodelica.",
    sourceUrl: "https://blackoutrec.bandcamp.com/album/mentalecho-digital-nature",
    aliases: "Bernardo Fialho",
    sourceNote: "Black Out Records descreve Mentalecho como projeto solo e lista Digital Nature.",
    links: ["https://blackoutrec.bandcamp.com/album/mentalecho-digital-nature"],
    labelLinks: ["https://blackoutrec.bandcamp.com/"]
  }),
  p({
    style: "dark_psy",
    artist: "Tetraktyz",
    country: "Spain",
    city: "",
    artistGenre: "darkpsy / experimental darkpsy / dark forest",
    artistBio:
      "Tetraktyz trabalha darkpsy e experimental darkpsy, com Codex Seraphinianus EP e faixas em Enygma Music.",
    artistProfileHint:
      "Usar dark_psy/dark forest; nao classificar como hi_tech apesar da intensidade.",
    sourceUrl: "https://enygmamusic.bandcamp.com/track/tetraktyz-bethad-anima-158",
    sourceNote: "Enygma Music lista tags dark psy, darkpsy, experimental darkpsy e darkpsytrance para Anima 158.",
    links: ["https://enygmamusic.bandcamp.com/track/tetraktyz-bethad-anima-158"]
  }),
  p({
    style: "dark_experimental",
    artist: "Will O Wisp",
    country: "Argentina",
    city: "Buenos Aires",
    artistGenre: "experimental psychedelic trance / darkpsy / modular psytrance",
    artistBio:
      "Will O Wisp e o projeto de Gaston Mellino, explorador argentino de audio psicodelico e modular synthesis em psytrance.",
    artistProfileHint:
      "Classificar como dark experimental/experimental psytrance; algumas faixas podem entrar em psycore, mas nao tratar como DJ.",
    sourceUrl: "https://willowispmusic.bandcamp.com/",
    aliases: "Will O' Wisp; Gaston Mellino",
    sourceNote: "Bandcamp oficial identifica o projeto, origem argentina e foco em modular synthesis dentro do psychedelic trance.",
    links: ["https://osom-music.bandcamp.com/track/plucked-out"],
    labelLinks: ["https://osom-music.bandcamp.com/"]
  }),
  p({
    style: "dark_psy",
    artist: "Megalopsy",
    country: "Argentina",
    city: "Buenos Aires",
    artistGenre: "darkpsy / psychedelic trance / avant-garde psytrance",
    artistBio:
      "Megalopsy e exploracao psicodelica nascida em Buenos Aires e parte do ecossistema Dark Prisma.",
    artistProfileHint:
      "Usar como dark_psy/avant-garde psytrance; nao marcar como hitech.",
    sourceUrl: "https://megalopsy.bandcamp.com/",
    sourceNote: "Bandcamp oficial descreve Megalopsy como exploracao psicodelica de Buenos Aires; Dark Prisma lista o artista.",
    links: ["https://darkprisma.bandcamp.com/artists"],
    labelLinks: ["https://darkprisma.bandcamp.com/"]
  }),
  p({
    style: "psycore",
    artist: "Zik",
    country: "Greece",
    city: "",
    artistGenre: "darkpsy / psycore",
    artistBio:
      "Zik e projeto grego de darkpsy/psycore ligado ao circuito MOP e Parvati, tambem presente no duo ZikOre com Orestis.",
    artistProfileHint:
      "Usar Zik com cuidado: psycore/darkpsy underground, sem confundir com homonimos de musica mainstream.",
    sourceUrl: "https://ektoplazm.com/artist/zik",
    confidence: "medium_high",
    sourceNote: "Ektoplazm indexa Zik em darkpsy/forest; lineup MOP/JamBase confirma Zik e ZikOre no Rage Stage.",
    links: ["https://parvati-records.com/"]
  }),
  p({
    style: "dark_psy",
    artist: "Orestis",
    country: "Greece",
    city: "",
    artistGenre: "darkpsy / experimental psytrance / psycore-adjacent",
    artistBio:
      "Orestis e produtor grego de darkpsy, com faixas solo e colabs com Psykovsky e ZikOre no circuito MOP.",
    artistProfileHint:
      "Classificar como dark_psy; usar psycore apenas em colabs/faixas explicitamente mais extremas.",
    sourceUrl: "https://www.deezer.com/track/118571264",
    sourceNote: "Deezer confirma catalogo solo como P.O. Saga; MOP Brazil confirma Orestis e ZikOre no Rage Stage.",
    links: ["https://www.facebook.com/orestismusic.net/posts/-masters-of-puppets-brazil-edition-%EF%B8%8F-orestis-zikore-zikore-osom%EF%B8%8F-15-18-may-2026-/1504085841085441/"]
  }),
  p({
    style: "dark_psy",
    artist: "ZikOre",
    country: "Greece",
    city: "",
    artistGenre: "darkpsy / experimental psytrance collaboration",
    artistBio:
      "ZikOre e a colaboracao de Zik e Orestis, com Universal Modules em plataformas e slot proprio no Rage Stage.",
    artistProfileHint:
      "Tratar como projeto colaborativo Zik + Orestis; nao criar grafias separadas Zikore/ZikOre sem alias.",
    sourceUrl: "https://www.viberate.com/artist/zikore/",
    aliases: "Zikore; Zik + Orestis; Zik & Orestis",
    sourceNote: "Viberate e Deezer confirmam ZikOre/Zikore; MOP Brazil lista Zikore como set Zik & Orestis.",
    links: ["https://www.viberate.com/artist/zikore/"]
  }),
  p({
    style: "psycore",
    artist: "Osom",
    country: "Russia",
    city: "Moscow",
    artistGenre: "psycore / darkpsy / high-BPM psytrance",
    artistBio:
      "Osom e o projeto de Kindzadza com Psykovsky, uma referencia russa de darkpsy/psycore de alta intensidade.",
    artistProfileHint:
      "Usar Osom como psycore/darkpsy extremo; nao separar como DJ duo sem faixas.",
    sourceUrl: "https://www.facebook.com/TrancentralTV/videos/this-is-osom-/1067465433355133/",
    aliases: "OSOM; Kindzadza & Psykovsky",
    sourceNote: "Trancentral identifica OSOM como Kindzadza + Psykovsky; Deezer confirma faixas Acai Asassin e Carcosa.",
    links: ["https://www.deezer.com/track/119400404"]
  }),
  p({
    style: "psycore",
    artist: "Kindzadza",
    country: "Russia",
    city: "Moscow",
    artistGenre: "darkpsy / psycore / experimental psytrance",
    artistBio:
      "Kindzadza, de Moscou, e um dos fundadores do som dark psytrance russo e do selo OSOM Music.",
    artistProfileHint:
      "Usar Kindzadza como psycore/darkpsy de referencia; nao jogar em hi_tech por BPM alto.",
    sourceUrl: "https://sunstation.ru/artists/kindzadza/",
    aliases: "Kin Dza Dza; Leo Kindzadza",
    sourceNote: "Sun Station descreve Leo Kindzadza como fundador do dark psytrance russo e OSOM Music.",
    links: ["https://sunstation.ru/artists/kindzadza/"]
  }),
  p({
    style: "psycore",
    artist: "Psykovsky",
    country: "Russia",
    city: "Moscow",
    artistGenre: "psycore / darkpsy / experimental psytrance",
    artistBio:
      "Psykovsky, aka Vasily Markelov, e produtor russo de psytrance extremo, associado a Vertigo, Transdriver e OSOM.",
    artistProfileHint:
      "Usar Psykovsky em psycore/darkpsy experimental; evitar tracks de homonimos ou creditos errados em plataformas.",
    sourceUrl: "https://trancentral.tv/2018/05/psykovsky-10-essential-tracks/",
    aliases: "Vasily Markelov; Psykovski",
    sourceNote: "Trancentral identifica Psykovsky como produtor russo de psytrance; valida tracks essenciais.",
    links: ["https://trancentral.tv/2018/05/psykovsky-10-essential-tracks/"]
  }),
  p({
    style: "dark_experimental",
    artist: "Sectio Aurea",
    country: "Switzerland",
    city: "",
    artistGenre: "abstract psychedelic trance / avant-garde / dark experimental",
    artistBio:
      "Sectio Aurea assina trance psicodelico abstrato, complexo e avant-garde, com material proprio no Bandcamp.",
    artistProfileHint:
      "Usar dark_experimental; nao confundir com hitech mesmo quando uma faixa passa de 190 BPM.",
    sourceUrl: "https://sectioaurea.bandcamp.com/",
    aliases: "Sectio Aurea Argot Digamma Anficlavis",
    sourceNote: "Bandcamp oficial descreve o projeto como Abstract and Complex Psychedelic Trance, Avant-garde, PsyBaroque, neoDada.",
    links: ["https://sectioaurea.bandcamp.com/track/sectio-aurea-sparks"]
  }),
  p({
    style: "hi_tech",
    artist: "AlpsCore",
    country: "Austria",
    city: "Innsbruck",
    artistGenre: "hi-tech psytrance / psycore-adjacent",
    artistBio:
      "AlpsCore e o projeto de Max Franzelin, baseado nos Alpes tiroleses, criado para musica eletronica dura e de alta energia.",
    artistProfileHint:
      "Usar AlpsCore como hi_tech/psycore-adjacent; nao marcar como dark experimental.",
    sourceUrl: "https://alpscore.bandcamp.com/music",
    aliases: "ALPSCORE; Alpscore; Max Franzelin",
    sourceNote: "Bandcamp oficial descreve o projeto e Deezer confirma discografia como Red Snow, Higher Universe e Phatty.",
    links: ["https://www.deezer.com/en/artist/14475823"]
  }),
  p({
    style: "psycore",
    artist: "Maramba",
    country: "Brazil",
    city: "",
    artistGenre: "psycore / hi-tech psytrance / Brazilian darkpsy",
    artistBio:
      "Maramba e projeto brasileiro de psycore/hi-tech no circuito dark psy, com The Purge e outras faixas em plataformas.",
    artistProfileHint:
      "Usar Maramba como psycore brasileiro; hitech e adjacente, mas a curadoria MOP pede pressao psycore.",
    sourceUrl: "https://www.deezer.com/track/4028386941",
    aliases: "Maramba BR; Maramba Psy",
    sourceNote: "Deezer confirma The Purge sob Maramba; Popol-Vuh Records confirma Pray For Nepal a 180 BPM.",
    links: ["https://www.deezer.com/track/4028386941"]
  }),
  p({
    style: "dark_psy",
    artist: "Aquarius Orb",
    country: "Brazil",
    city: "",
    artistGenre: "darkpsy / forest / hi-tech-adjacent psytrance",
    artistBio:
      "Aquarius Orb e projeto brasileiro ligado a Resina Records, com releases de darkpsy, forest e hitech-adjacent.",
    artistProfileHint:
      "Usar Aquarius Orb como dark_psy/forest com borda hitech; nao promover para hi_tech sem evidenciar a faixa.",
    sourceUrl: "https://resinarecords.bandcamp.com/album/wizard-of-yester",
    aliases: "Victor Luciano; Aquarius Orb & Mad Goblins",
    sourceNote: "Resina Records lista Wizard of Yester e tags darkpsy, forest, hitech e psytrance.",
    links: ["https://resinarecords.bandcamp.com/track/resomatic"],
    labelLinks: ["https://resinarecords.bandcamp.com/"]
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
    albumKeywords: [EVENT_NAME, "Rage Stage", "Void Brasil"],
    energyBand: "festival_lineup_verified",
    catalogRole: "mop_brasil_2026_rage_stage_anchor;producer_with_verified_tracks",
    confidence: "high",
    sourceNote: "",
    labelLinks: [],
    ...def
  };
}

const TRACKS = [
  tr({ style: "dark_experimental", artist: "Karmn'Eugen", song: "Body Awakening", label: "Body Awakening", bpm: 170, deezerId: "3483473691", sourceUrl: "https://necropsycho.bandcamp.com/album/body-awakening", bandcampTrackUrl: "https://necropsycho.bandcamp.com/album/body-awakening", sourceTags: ["dark_experimental", "idm_adjacent", "170_bpm"] }),
  tr({ style: "dark_experimental", artist: "Karmn'Eugen", song: "Dormant Dreams part 01", label: "Dormant Dreams", deezerId: "3569588171", sourceUrl: "https://necropsycho.bandcamp.com/", sourceTags: ["dark_experimental", "idm_adjacent"] }),

  tr({ style: "dark_experimental", artist: "Necropsycho", song: "OPPEES", label: "God's Own Country", deezerId: "2938879461", sourceUrl: "https://www.deezer.com/en/track/2938879461", sourceTags: ["dark_experimental", "darkpsy"] }),
  tr({ style: "dark_psy", artist: "Necropsycho", song: "Surrealismus", label: "Necropsycho", deezerId: "78758152", sourceUrl: "https://www.deezer.com/track/78758152", sourceTags: ["dark_psy", "psytrance"] }),
  tr({ style: "psycore", artist: "Necropsycho", song: "Samsara", label: "Necropsycho", deezerId: "888034412", sourceUrl: "https://www.deezer.com/track/888034412", sourceTags: ["psycore", "darkpsy"] }),

  tr({ style: "dark_experimental", artist: "Kasatka", song: "The Hive", label: "Irreversible Echoes", deezerId: "842698282", sourceUrl: "https://kasatkamusic.bandcamp.com/album/irreversible-echoes", bandcampTrackUrl: "https://kasatkamusic.bandcamp.com/album/irreversible-echoes", sourceTags: ["darkpsy", "experimental", "hightech_adjacent"] }),
  tr({ style: "dark_experimental", artist: "Kasatka", song: "Debut", label: "Irreversible Echoes", deezerId: "842698272", sourceUrl: "https://kasatkamusic.bandcamp.com/track/debut", bandcampTrackUrl: "https://kasatkamusic.bandcamp.com/track/debut", sourceTags: ["darkpsy", "experimental"] }),
  tr({ style: "dark_experimental", artist: "Kasatka", song: "A Certain Reality", label: "Kasatka", deezerId: "125738432", sourceUrl: "https://kasatkamusic.bandcamp.com/", sourceTags: ["darkpsy", "experimental"] }),

  tr({ style: "psycore", artist: "Infra", song: "Nullpunktfeld", label: "Tzu-Jan Bandcamp", sourceUrl: "https://tzu-jan-official.bandcamp.com/", bandcampTrackUrl: "https://tzu-jan-official.bandcamp.com/", sourceTags: ["darkpsy", "psycore", "infra_retro"], confidence: "medium_high" }),
  tr({ style: "psycore", artist: "Infra", song: "Kietai", label: "Tzu-Jan Bandcamp", sourceUrl: "https://tzu-jan-official.bandcamp.com/", bandcampTrackUrl: "https://tzu-jan-official.bandcamp.com/", sourceTags: ["darkpsy", "psycore", "infra_retro"], confidence: "medium_high" }),

  tr({ style: "psycore", artist: "Tzu Jan", song: "en-tel-echeia", label: "Tzu - Jan - Entelechie", sourceUrl: "https://tzu-jan-official.bandcamp.com/album/tzu-jan-entelechie", bandcampTrackUrl: "https://tzu-jan-official.bandcamp.com/album/tzu-jan-entelechie", sourceTags: ["darkpsy", "experimental", "psycore"] }),
  tr({ style: "psycore", artist: "Tzu Jan", song: "perceptio", label: "Tzu - Jan - Entelechie", sourceUrl: "https://tzu-jan-official.bandcamp.com/album/tzu-jan-entelechie", bandcampTrackUrl: "https://tzu-jan-official.bandcamp.com/album/tzu-jan-entelechie", sourceTags: ["darkpsy", "experimental", "psycore"] }),
  tr({ style: "psycore", artist: "Tzu Jan", song: "Annunaki", label: "Tzu Jan vs Phreneticus", sourceUrl: "https://tzu-jan-official.bandcamp.com/track/tzu-jan-vs-phreneticus-annunaki", bandcampTrackUrl: "https://tzu-jan-official.bandcamp.com/track/tzu-jan-vs-phreneticus-annunaki", sourceTags: ["darkpsy", "experimental", "psycore"] }),

  tr({ style: "dark_psy", artist: "Absurdus", song: "Transmutation", label: "Absurdus", deezerId: "3528600411", sourceUrl: "https://www.deezer.com/track/3528600411", sourceTags: ["darkpsy", "night_psy"] }),
  tr({ style: "dark_psy", artist: "Absurdus", song: "Zephyrum", label: "Absurdus", deezerId: "3930295991", sourceUrl: "https://www.deezer.com/track/3930295991", sourceTags: ["darkpsy", "night_psy"] }),

  tr({ style: "psycore", artist: "Varasurdum", song: "Mechanika", label: "Varasurdum", sourceUrl: "https://www.youtube.com/watch?v=B6S2o7sCIj8", youtubeTrackUrl: "https://www.youtube.com/watch?v=B6S2o7sCIj8", sourceTags: ["psycore", "darkpsy", "varazslo_absurdus"], confidence: "medium_high" }),

  tr({ style: "psycore", artist: "Varazslo", song: "Turan", label: "Varazslo", deezerId: "3523326601", sourceUrl: "https://www.deezer.com/track/3523326601", sourceTags: ["psycore", "darkpsy"] }),
  tr({ style: "psycore", artist: "Varazslo", song: "Promised Land", label: "Varazslo", deezerId: "1767007317", sourceUrl: "https://www.deezer.com/track/1767007317", sourceTags: ["psycore", "darkpsy"] }),
  tr({ style: "psycore", artist: "Varazslo", song: "Hall of Purity", label: "Varazslo", deezerId: "1767007297", sourceUrl: "https://sacredsoundrecs.bandcamp.com/album/expressed-impressions-free-download", bandcampTrackUrl: "https://sacredsoundrecs.bandcamp.com/album/expressed-impressions-free-download", sourceTags: ["psycore", "darkpsy"] }),
  tr({ style: "psycore", artist: "Varazslo", song: "Information", label: "Varazslo", deezerId: "1597215172", sourceUrl: "https://www.deezer.com/track/1597215172", sourceTags: ["psycore", "darkpsy"] }),

  tr({ style: "hi_tech", artist: "KiLLATK", song: "Babaji Vibes", label: "KiLLATK", deezerId: "2787422672", sourceUrl: "https://www.youtube.com/watch?v=zKnm2-WJl8M", youtubeTrackUrl: "https://www.youtube.com/watch?v=zKnm2-WJl8M", sourceTags: ["hi_tech", "psytrance"] }),
  tr({ style: "hi_tech", artist: "KiLLATK", song: "NITROUS DRIVE", label: "KiLLATK", deezerId: "3966402071", sourceUrl: "https://www.deezer.com/track/3966402071", sourceTags: ["hi_tech", "psytrance"] }),
  tr({ style: "hi_tech", artist: "KiLLATK", song: "Litanies of Satan", label: "KiLLATK", deezerId: "608098002", sourceUrl: "https://www.deezer.com/track/608098002", sourceTags: ["hi_tech", "psytrance"] }),

  tr({ style: "hi_tech", artist: "Mentalecho", song: "Bam Bam", label: "Digital Nature", deezerId: "473635172", sourceUrl: "https://blackoutrec.bandcamp.com/album/mentalecho-digital-nature", bandcampTrackUrl: "https://blackoutrec.bandcamp.com/album/mentalecho-digital-nature", youtubeTrackUrl: "https://www.youtube.com/watch?v=QhL1VRzCOcU", sourceTags: ["hi_tech", "digital_nature"] }),
  tr({ style: "hi_tech", artist: "Mentalecho", song: "Codex Gigas", label: "Digital Nature", deezerId: "473635192", sourceUrl: "https://blackoutrec.bandcamp.com/album/mentalecho-digital-nature", bandcampTrackUrl: "https://blackoutrec.bandcamp.com/album/mentalecho-digital-nature", sourceTags: ["hi_tech"] }),
  tr({ style: "hi_tech", artist: "Mentalecho", song: "Tomorrow Never Comes", label: "Mentalecho", deezerId: "1855221107", sourceUrl: "https://www.deezer.com/track/1855221107", sourceTags: ["hi_tech"] }),

  tr({ style: "dark_psy", artist: "Tetraktyz", song: "Anima", label: "Codex Seraphinianus EP", bpm: 158, deezerId: "3592895322", sourceUrl: "https://enygmamusic.bandcamp.com/track/tetraktyz-bethad-anima-158", bandcampTrackUrl: "https://enygmamusic.bandcamp.com/track/tetraktyz-bethad-anima-158", sourceTags: ["darkpsy", "experimental_darkpsy", "158_bpm"] }),
  tr({ style: "dark_psy", artist: "Tetraktyz", song: "Ebusus Materia", label: "Tetraktyz", deezerId: "1895036147", sourceUrl: "https://www.deezer.com/track/1895036147", sourceTags: ["darkpsy", "dark_forest"] }),
  tr({ style: "dark_psy", artist: "Tetraktyz", song: "Codex Seraphinianus", label: "Codex Seraphinianus EP", deezerId: "3592895312", sourceUrl: "https://www.deezer.com/track/3592895312", sourceTags: ["darkpsy", "experimental_darkpsy"] }),

  tr({ style: "dark_experimental", artist: "Will O Wisp", song: "Plucked Out", label: "Mukashi Mukashi", sourceUrl: "https://osom-music.bandcamp.com/track/plucked-out", bandcampTrackUrl: "https://osom-music.bandcamp.com/track/plucked-out", sourceTags: ["dark_experimental", "modular_psytrance"] }),
  tr({ style: "dark_experimental", artist: "Will O Wisp", song: "To The Moon And Back", label: "Mukashi Mukashi", sourceUrl: "https://osom-music.bandcamp.com/track/to-the-moon-and-back", bandcampTrackUrl: "https://osom-music.bandcamp.com/track/to-the-moon-and-back", sourceTags: ["dark_experimental", "modular_psytrance"] }),
  tr({ style: "dark_experimental", artist: "Will O Wisp", song: "Forking Path", label: "Mukashi Mukashi", sourceUrl: "https://osom-music.bandcamp.com/track/forking-path", bandcampTrackUrl: "https://osom-music.bandcamp.com/track/forking-path", sourceTags: ["dark_experimental", "modular_psytrance"] }),

  tr({ style: "dark_psy", artist: "Megalopsy", song: "Maleficio", label: "Megalopsy", deezerId: "92900866", sourceUrl: "https://megalopsy.bandcamp.com/", sourceTags: ["darkpsy", "dark_prisma"] }),
  tr({ style: "dark_psy", artist: "Megalopsy", song: "Alien Stretcher", label: "Megalopsy", deezerId: "6242885", sourceUrl: "https://megalopsy.bandcamp.com/", sourceTags: ["darkpsy", "psytrance"] }),
  tr({ style: "dark_psy", artist: "Megalopsy", song: "Megalupis", label: "Megalopsy", deezerId: "6167718", sourceUrl: "https://megalopsy.bandcamp.com/", sourceTags: ["darkpsy", "psytrance"] }),

  tr({ style: "psycore", artist: "Zik", song: "Voodoo People", label: "Parvati Records / Zik live archive", bpm: 178, sourceUrl: "https://ektoplazm.com/artist/zik", trackUrl: "https://ektoplazm.com/artist/zik", sourceTags: ["psycore", "darkpsy", "parvati"], confidence: "medium_high" }),

  tr({ style: "dark_psy", artist: "Orestis", song: "P.O. Saga", label: "Orestis", deezerId: "118571264", sourceUrl: "https://www.deezer.com/track/118571264", sourceTags: ["darkpsy", "experimental"] }),
  tr({ style: "dark_psy", artist: "Orestis", song: "Boipeba Roam", label: "Orestis", deezerId: "118571246", sourceUrl: "https://www.deezer.com/track/118571246", sourceTags: ["darkpsy"] }),
  tr({ style: "dark_psy", artist: "Orestis", song: "Cosmic Arena", label: "Orestis", deezerId: "118571248", sourceUrl: "https://www.deezer.com/track/118571248", sourceTags: ["darkpsy"] }),

  tr({ style: "dark_psy", artist: "ZikOre", song: "Universal Modules", label: "ZikOre", deezerId: "68377069", sourceUrl: "https://www.viberate.com/artist/zikore/", sourceTags: ["darkpsy", "zik_orestis"] }),

  tr({ style: "psycore", artist: "Osom", song: "Acai Asassin", label: "Osom", deezerId: "119400404", sourceUrl: "https://www.deezer.com/track/119400404", sourceTags: ["psycore", "darkpsy"] }),
  tr({ style: "psycore", artist: "Osom", song: "Carcosa", label: "Osom", deezerId: "119400402", sourceUrl: "https://www.deezer.com/track/119400402", sourceTags: ["psycore", "darkpsy"] }),

  tr({ style: "psycore", artist: "Kindzadza", song: "Full of Life", label: "Kindzadza", deezerId: "2562085652", sourceUrl: "https://sunstation.ru/artists/kindzadza/", sourceTags: ["psycore", "darkpsy"] }),
  tr({ style: "psycore", artist: "Kindzadza", song: "Krakatalo", label: "Kindzadza", deezerId: "2562085712", sourceUrl: "https://sunstation.ru/artists/kindzadza/", sourceTags: ["psycore", "darkpsy"] }),
  tr({ style: "psycore", artist: "Kindzadza", song: "Multi U", label: "Kindzadza", deezerId: "121130608", sourceUrl: "https://www.deezer.com/track/121130608", sourceTags: ["psycore", "darkpsy"] }),

  tr({ style: "psycore", artist: "Psykovsky", song: "Ketzakoatl", label: "Psykovsky", deezerId: "1757628327", sourceUrl: "https://trancentral.tv/2018/05/psykovsky-10-essential-tracks/", sourceTags: ["psycore", "darkpsy"] }),
  tr({ style: "psycore", artist: "Psykovsky", song: "Tender Nest", label: "Psykovsky", deezerId: "990782692", sourceUrl: "https://trancentral.tv/2018/05/psykovsky-10-essential-tracks/", sourceTags: ["psycore", "darkpsy"] }),
  tr({ style: "dark_psy", artist: "Psykovsky", song: "P.O. Saga", label: "Psykovsky & Orestis", deezerId: "118571264", sourceUrl: "https://www.deezer.com/track/118571264", sourceTags: ["darkpsy", "orestis_collab"] }),

  tr({ style: "dark_experimental", artist: "Sectio Aurea", song: "Sparks", label: "The Essence", deezerId: "688356372", sourceUrl: "https://sectioaurea.bandcamp.com/track/sectio-aurea-sparks", bandcampTrackUrl: "https://sectioaurea.bandcamp.com/track/sectio-aurea-sparks", sourceTags: ["dark_experimental", "avant_garde_psytrance"] }),
  tr({ style: "dark_experimental", artist: "Sectio Aurea", song: "Deep Resonance", label: "Research of Harmony", bpm: 198, sourceUrl: "https://meckoadn.bandcamp.com/track/sectio-aurea-deep-resonance-198-bpm", bandcampTrackUrl: "https://meckoadn.bandcamp.com/track/sectio-aurea-deep-resonance-198-bpm", sourceTags: ["dark_experimental", "198_bpm", "not_hitech_by_default"] }),
  tr({ style: "dark_experimental", artist: "Sectio Aurea", song: "E Il Cielo Dei Cieli", label: "Sectio Aurea", deezerId: "1195351052", sourceUrl: "https://www.deezer.com/track/1195351052", sourceTags: ["dark_experimental"] }),

  tr({ style: "hi_tech", artist: "AlpsCore", song: "Phatty", label: "ALPSCORE", deezerId: "623681532", sourceUrl: "https://alpscore.bandcamp.com/music", sourceTags: ["hi_tech", "psycore_adjacent"] }),
  tr({ style: "hi_tech", artist: "AlpsCore", song: "Higher Universe", label: "ALPSCORE", deezerId: "1236629222", sourceUrl: "https://www.deezer.com/en/artist/14475823", sourceTags: ["hi_tech"] }),
  tr({ style: "hi_tech", artist: "AlpsCore", song: "Red Snow", label: "ALPSCORE", deezerId: "624284952", sourceUrl: "https://www.deezer.com/en/artist/14475823", sourceTags: ["hi_tech"] }),

  tr({ style: "psycore", artist: "Maramba", song: "The Purge", label: "Maramba", deezerId: "4028386941", sourceUrl: "https://www.deezer.com/track/4028386941", sourceTags: ["psycore", "brazil"] }),
  tr({ style: "psycore", artist: "Maramba", song: "Pray For Nepal", label: "The Sacred Mayan Tree", bpm: 180, sourceUrl: "https://popol-vuh.bandcamp.com/track/pray-for-nepal-180-bpm-2", bandcampTrackUrl: "https://popol-vuh.bandcamp.com/track/pray-for-nepal-180-bpm-2", sourceTags: ["psycore", "darkpsy", "180_bpm", "brazil"], confidence: "high" }),

  tr({ style: "dark_psy", artist: "Aquarius Orb", song: "Resomatic", label: "Wizard of Yester", sourceUrl: "https://resinarecords.bandcamp.com/track/resomatic", bandcampTrackUrl: "https://resinarecords.bandcamp.com/track/resomatic", sourceTags: ["darkpsy", "forest", "hitech_adjacent"] }),
  tr({ style: "dark_psy", artist: "Aquarius Orb", song: "Boy Soul", label: "Wizard of Yester", deezerId: "2304431985", sourceUrl: "https://resinarecords.bandcamp.com/album/wizard-of-yester", bandcampTrackUrl: "https://resinarecords.bandcamp.com/album/wizard-of-yester", sourceTags: ["darkpsy", "forest"] }),
  tr({ style: "dark_psy", artist: "Aquarius Orb", song: "Cray Cake", label: "Wizard of Yester", deezerId: "2304431995", sourceUrl: "https://resinarecords.bandcamp.com/album/wizard-of-yester", bandcampTrackUrl: "https://resinarecords.bandcamp.com/album/wizard-of-yester", sourceTags: ["darkpsy", "forest"] })
];

function r(lineupName, canonicalArtist, action, status, style, confidence, reason, sourceUrl, notes = "") {
  return { lineupName, canonicalArtist, action, status, style, confidence, reason, sourceUrl, notes };
}

const RESEARCH = [
  r("Karmn'Eugen / Necropsycho", "Karmn'Eugen", "include", "producer_with_tracks", "dark_experimental", "high", "Body Awakening e Dormant Dreams confirmam release; subgenero e experimental/IDM/dark psychedelic, nao hitech.", "https://necropsycho.bandcamp.com/album/body-awakening"),
  r("Karmn'Eugen / Necropsycho", "Necropsycho", "include", "producer_with_tracks", "dark_experimental", "high", "OPPEES/God's Own Country e catalogo Bandcamp confirmam projeto brasileiro de dark experimental/darkpsy.", "https://www.deezer.com/en/track/2938879461"),
  r("Kasatka", "Kasatka", "include", "producer_with_tracks", "dark_experimental", "high", "Irreversible Echoes no Bandcamp traz darkpsy/experimental/hightech; perfil primario mantido em dark experimental.", "https://kasatkamusic.bandcamp.com/album/irreversible-echoes"),
  r("Infra Retro", "Infra", "include", "producer_with_tracks", "psycore", "medium_high", "Infra aparece como projeto com faixas no Bandcamp de Tzu-Jan; Retro tratado como formato/set.", "https://tzu-jan-official.bandcamp.com/"),
  r("Tzu Jan", "Tzu Jan", "include", "producer_with_tracks", "psycore", "high", "Entelechie e outras faixas no Bandcamp trazem tags darkpsy/experimental/psycore.", "https://tzu-jan-official.bandcamp.com/album/tzu-jan-entelechie"),
  r("Absurdus", "Absurdus", "include", "producer_with_tracks", "dark_psy", "medium_high", "Transmutation e Zephyrum confirmam faixas; mantido como darkpsy/night psy.", "https://www.deezer.com/track/3528600411"),
  r("Varasurdum", "Varasurdum", "include", "collab_project_with_public_track", "psycore", "medium_high", "Mechanika confirma projeto Varazslo vs Absurdus; nao separado como DJ.", "https://www.youtube.com/watch?v=B6S2o7sCIj8"),
  r("Varazslo", "Varazslo", "include", "producer_with_tracks", "psycore", "high", "Expressed Impressions e faixas em plataformas confirmam darkpsy/psycore.", "https://sacredsoundrecs.bandcamp.com/album/expressed-impressions-free-download"),
  r("KiLLATK", "KiLLATK", "include", "producer_with_tracks", "hi_tech", "high", "Discografia Deezer e videos confirmam hi-tech psytrance brasileiro.", "https://www.deezer.com/us/artist/13226473"),
  r("Mentalecho", "Mentalecho", "include", "producer_with_tracks", "hi_tech", "high", "Black Out Records confirma Digital Nature; classificado como hi-tech, nao dark experimental.", "https://blackoutrec.bandcamp.com/album/mentalecho-digital-nature"),
  r("Tetraktyz", "Tetraktyz", "include", "producer_with_tracks", "dark_psy", "high", "Enygma Music marca Anima 158 como darkpsy/experimental darkpsy.", "https://enygmamusic.bandcamp.com/track/tetraktyz-bethad-anima-158"),
  r("Will O Wisp", "Will O Wisp", "include", "producer_with_tracks", "dark_experimental", "high", "Bandcamp oficial confirma projeto de Gaston Mellino e OSOM Music traz faixas de Mukashi Mukashi.", "https://willowispmusic.bandcamp.com/"),
  r("Megalopsy", "Megalopsy", "include", "producer_with_tracks", "dark_psy", "high", "Bandcamp/Dark Prisma confirmam projeto argentino de psytrance psicodelico/avant-garde.", "https://megalopsy.bandcamp.com/"),
  r("Zik", "Zik", "include", "producer_with_tracks", "psycore", "medium_high", "Ektoplazm indexa Zik em darkpsy/forest e MOP confirma Zik/ZikOre; mantido com cuidado por baixa cobertura de plataformas.", "https://ektoplazm.com/artist/zik"),
  r("Orestis", "Orestis", "include", "producer_with_tracks", "dark_psy", "high", "Catalogo Deezer e post de MOP confirmam Orestis/ZikOre no Rage Stage.", "https://www.deezer.com/track/118571264"),
  r("Zikore", "ZikOre", "include", "collab_project_with_public_track", "dark_psy", "high", "ZikOre e projeto Zik + Orestis; Universal Modules confirmado em plataformas.", "https://www.viberate.com/artist/zikore/"),
  r("Osom", "Osom", "include", "collab_project_with_public_track", "psycore", "high", "Trancentral identifica OSOM como Kindzadza + Psykovsky e Deezer confirma faixas.", "https://www.facebook.com/TrancentralTV/videos/this-is-osom-/1067465433355133/"),
  r("Kindzadza", "Kindzadza", "include", "producer_with_tracks", "psycore", "high", "Sun Station confirma papel no dark psytrance russo e OSOM Music; faixas Deezer adicionadas.", "https://sunstation.ru/artists/kindzadza/"),
  r("Psykovsky", "Psykovsky", "include", "producer_with_tracks", "psycore", "high", "Trancentral confirma Psykovsky como produtor russo; evitei Beat Box Error porque Deezer atribui a Fuzulu.", "https://trancentral.tv/2018/05/psykovsky-10-essential-tracks/"),
  r("Sectio Aurea", "Sectio Aurea", "include", "producer_with_tracks", "dark_experimental", "high", "Bandcamp oficial descreve Abstract and Complex Psychedelic Trance/Avant-garde; Deep Resonance 198 BPM nao vira hitech por padrao.", "https://sectioaurea.bandcamp.com/"),
  r("Alpscore", "AlpsCore", "include", "producer_with_tracks", "hi_tech", "high", "Bandcamp oficial e Deezer confirmam projeto e faixas; classificado como hi-tech/psycore-adjacent.", "https://alpscore.bandcamp.com/music"),
  r("Maramba", "Maramba", "include", "producer_with_tracks", "psycore", "high", "The Purge e Pray For Nepal confirmam projeto brasileiro; mantido como psycore/hi-tech-adjacent.", "https://popol-vuh.bandcamp.com/track/pray-for-nepal-180-bpm-2"),
  r("Aquarius Orb", "Aquarius Orb", "include", "producer_with_tracks", "dark_psy", "high", "Resina Records confirma Wizard of Yester com tags darkpsy/forest/hitech; primario dark_psy.", "https://resinarecords.bandcamp.com/album/wizard-of-yester"),
  r("Psynonima", "Psynonima", "exclude", "dj_only_or_unverified_project", "", "medium", "Resultados publicos apontam mais para Djane/sets; nao encontrei faixa propria verificavel sob a identidade do flyer.", EVENT_URL),
  r("Maiko", "Maiko", "exclude", "dj_only_or_unverified_project", "", "medium", "Nome muito generico; fontes do contexto indicam Djane Maiko e nao release proprio verificavel.", EVENT_URL),
  r("Altura", "Altura", "alias_only", "live_collab_not_separate_artist", "dark_experimental", "medium", "Slot indicado como Sectio Aurea & Necropsycho; sem release separado confiavel como Altura.", EVENT_URL),
  r("Tzu Jan & Necropsycho", "Tzu Jan / Necropsycho", "alias_only", "live_collab_not_separate_artist", "psycore", "medium", "Tratar como set/collab ao vivo, nao artista novo ate aparecer release publico.", EVENT_URL),
  r("Necrowillo", "Necropsycho / Will O Wisp", "alias_only", "live_collab_not_separate_artist", "dark_experimental", "medium", "Slot indicado como Necropsycho & Will O Wisp; sem release separado confiavel como Necrowillo.", EVENT_URL),
  r("Psykovsky Retro Set", "Psykovsky", "alias_only", "set_format_not_artist", "psycore", "high", "Retro Set e formato de Psykovsky, nao artista separado.", EVENT_URL_ALT),
  r("Kindzadza Retro Set", "Kindzadza", "alias_only", "set_format_not_artist", "psycore", "high", "Retro Set e formato de Kindzadza, nao artista separado.", EVENT_URL_ALT),
  r("Paula", "Paula", "exclude", "dj_or_ritual_unverified", "", "medium", "Nome generico no lineup; sem release proprio verificavel ligado ao Rage Stage.", EVENT_URL),
  r("Booo", "Booo", "exclude", "dj_only_or_unverified_project", "", "medium", "Sem faixa propria confiavel sob esta identidade; mantido fora de produtores e ja bloqueado como seed solta.", EVENT_URL),
  r("Anginha", "Anginha", "exclude", "homonym_risk_or_dj_unverified", "", "medium", "Buscas em plataforma retornam homonimos nao-psy; sem release proprio confiavel ligado ao lineup.", EVENT_URL)
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
      headers: { Accept: "application/json", "User-Agent": "Codex MOP Brazil research" }
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
  lines.push("# MOP Brazil 2026 Rage Stage artist research");
  lines.push("");
  lines.push("Generated: 2026-06-21");
  lines.push(`Event: ${EVENT_NAME} (${EVENT_DATES})`);
  lines.push(`Event sources: ${EVENT_URL} and ${EVENT_URL_ALT}`);
  lines.push("");
  lines.push("## Outputs");
  lines.push("");
  lines.push(`- \`${path.relative(ROOT, PROFILE_OUT)}\`: ${profileRows.length} artist profile rows.`);
  lines.push(`- \`${path.relative(ROOT, TRACK_OUT)}\`: ${trackRows.length} playable/anchored track rows.`);
  lines.push(`- \`${path.relative(ROOT, RESEARCH_OUT)}\`: ${researchRows.length} inclusion/exclusion audit rows.`);
  lines.push("");
  lines.push("## Inclusion policy");
  lines.push("");
  lines.push("- Included names with public tracks, Bandcamp releases, Deezer tracks, or a verifiable producer identity under the same lineup name.");
  lines.push("- DJ-only, ritual-only, generic, homonym-risk, and one-off live collab names were not promoted to standalone producer rows.");
  lines.push("- Subgenre assignment comes from release tags, label language, and artist profile evidence, not only from the Rage Stage context.");
  lines.push("- MOP Brazil 2026 already happened on 2026-05-15 to 2026-05-18, so this file enriches recommendations/catalog data but does not create upcoming-event fallbacks.");
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
    EVENT_URL_ALT,
    "https://necropsycho.bandcamp.com/album/body-awakening",
    "https://kasatkamusic.bandcamp.com/album/irreversible-echoes",
    "https://tzu-jan-official.bandcamp.com/album/tzu-jan-entelechie",
    "https://sacredsoundrecs.bandcamp.com/album/expressed-impressions-free-download",
    "https://blackoutrec.bandcamp.com/album/mentalecho-digital-nature",
    "https://enygmamusic.bandcamp.com/track/tetraktyz-bethad-anima-158",
    "https://willowispmusic.bandcamp.com/",
    "https://megalopsy.bandcamp.com/",
    "https://sunstation.ru/artists/kindzadza/",
    "https://trancentral.tv/2018/05/psykovsky-10-essential-tracks/",
    "https://sectioaurea.bandcamp.com/",
    "https://alpscore.bandcamp.com/music",
    "https://resinarecords.bandcamp.com/album/wizard-of-yester"
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
