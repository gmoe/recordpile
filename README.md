# RecordPile

RecordPile is the TBR list for your music. Backed by the MusicBrainz and Discogs APIs.

It's currently in active development, but the core functionality works if you
want to self-host it.

[demo-july-2026.webm](https://github.com/user-attachments/assets/3f41f089-17fc-4f4c-9d2f-d97056ddf141)

## Local development

First, install `direnv` if you don't have it already, then:

```bash
docker-compose up -d # Start postgres
npm run dev # Start Nextjs
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
