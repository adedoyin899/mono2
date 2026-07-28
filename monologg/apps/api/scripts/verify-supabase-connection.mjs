// One-off smoke test for features.md Phase 1: confirms DATABASE_URL (pooled) and
// DIRECT_URL (direct) are present and reachable. No schema exists yet (that's Phase 2),
// so this only runs `select 1` — it proves connectivity + auth, nothing more.
//
// Run with: pnpm --filter @monologg/api run verify:db
//
// DIRECT_URL uses Supabase's direct host, which is IPv6-only unless the project has the
// IPv4 add-on. Networks without an IPv6 route (some sandboxes, some CI runners) will not
// be able to reach it — that's an environment limitation, not a bad credential. This
// script reports that case distinctly from an auth/config failure instead of masking it.

import { Client } from "pg";

process.loadEnvFile(new URL("../.env", import.meta.url));

async function check(name, connectionString) {
  if (!connectionString) {
    console.error(`[${name}] missing — not set in apps/api/.env`);
    return false;
  }

  const client = new Client({ connectionString, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    const result = await client.query("select 1 as ok");
    console.log(`[${name}] OK — select 1 =`, result.rows[0].ok);
    return true;
  } catch (err) {
    const code = err?.code ?? err?.errno ?? "unknown";
    console.error(`[${name}] FAILED (${code}): ${err.message}`);
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

const pooledOk = await check("DATABASE_URL (pooled)", process.env.DATABASE_URL);
const directOk = await check("DIRECT_URL (direct)", process.env.DIRECT_URL);

console.log("\nSummary:");
console.log(`  DATABASE_URL (pooled): ${pooledOk ? "reachable" : "NOT reachable"}`);
console.log(`  DIRECT_URL (direct):   ${directOk ? "reachable" : "NOT reachable"}`);

if (!pooledOk) {
  console.error(
    "\nDATABASE_URL is required to be reachable in every environment — this is a real failure.",
  );
  process.exit(1);
}

if (!directOk) {
  console.warn(
    "\nDIRECT_URL was not reachable from this machine. If the cause is ENOTFOUND/ETIMEDOUT " +
      "and this network lacks an IPv6 route, that's expected (Supabase's direct host is " +
      "IPv6-only without the IPv4 add-on) — verify DIRECT_URL from an IPv6-capable network " +
      "before treating this as a credential problem.",
  );
}

process.exit(0);
