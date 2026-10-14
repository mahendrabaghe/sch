# Campus LMS workspace guidance

- Keep the student experience mobile-first and preserve the five-item mobile bottom navigation.
- Enforce role and school scoping in the API; never trust a client-provided role or expose private upload files publicly.
- Keep PostgreSQL schema changes in `server/src/db/schema.sql` and make seed data repeatable.
- Document API integrations and distinguish demo-only behavior from authenticated behavior.
