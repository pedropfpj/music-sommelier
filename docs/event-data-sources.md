# Event Data Sources

Base para alimentar proximos eventos de DJs/lives no Sonic Search.

## Ativo agora

### Goabase

- URL: https://www.goabase.net/
- API: https://www.goabase.net/api/party/
- Uso atual: fonte publica para psytrance/goa/darkpsy/hitech/forest/prog psy.
- Credencial: nenhuma.
- Atribuicao: manter link/backlink para Goabase nos eventos.
- Implementacao:
  - Live artist lookup em `/api/ticketmaster-events`.
  - Snapshot em `/api/event-radar`.
  - Dados locais:
    - `data/event_radar_goabase_upcoming_latest.json`
    - `data/artist_events_goabase_upcoming_latest.csv`
- Atualizacao:

```bash
node scripts/generate-event-radar-snapshot.mjs --countries=all --limit=50
```

## Pronto para ligar com credencial

### Ticketmaster Discovery API

- URL: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
- Uso recomendado: festivais e eventos oficiais maiores, menos underground.
- Credencial: `TICKETMASTER_CONSUMER_KEY` ou `TICKETMASTER_API_KEY`.
- Rota: `/api/ticketmaster-events`.

### Bandsintown

- URL: https://help.artists.bandsintown.com/en/articles/9186477-api-documentation
- Uso recomendado: proximos eventos por artista quando houver app ID aprovado.
- Credencial: `BANDSINTOWN_APP_ID`.
- Rota: `/api/ticketmaster-events`.

## Curadoria/parceria

### Resident Advisor

- URL: https://ra.co/
- Uso recomendado: techno, club culture, Berlin/EU underground.
- Observacao: excelente fonte editorial/cultural, mas nao trate como API publica aberta. Preferir parceria, curadoria manual ou importador assistido por links.

### Shotgun

- URL: https://shotgun.live/
- Uso recomendado: festas independentes, techno/psy no Brasil e Europa.
- Observacao: forte para promoters/eventos, mas a ingestao global deve ser parceria/importador assistido.

## Modelo de dados

Campos usados no snapshot:

- `source`, `sourceEventId`, `name`, `startAt`, `endAt`, `timezone`
- `countryCode`, `country`, `city`, `venue`, `lat`, `lon`
- `eventType`, `organizer`, `imageUrl`, `sourceUrl`
- `styles`
- `artists[]`: `name`, `role`, `timeSlot`, `source`
