# RecordPile

RecordPile is the TBR list for your music. Backed by the MusicBrainz and Discogs APIs.

It's currently in active development, but the core functionality works if you
want to self-host it.

<video src="/docs/demo-july-2026.webm" controls height="600px"></video>

## Local development

First, install `direnv` if you don't have it already, then:

```bash
docker-compose up -d # Start postgres
npm run dev # Start Nextjs
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
