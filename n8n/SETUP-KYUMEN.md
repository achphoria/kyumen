# Setup n8n untuk Kyumen (18 agent)

n8n yang sama dengan Hive Colony bisa dipakai. Workflow Kyumen memakai jalur webhook sendiri (`/webhook/kyumen/...`) dan credential sendiri, jadi tidak bentrok dengan Hive.

## Gambaran alur

```
Ruang Kerja Kyumen ──► Edge Function agent-chat (Supabase ACHPHORIA)
                          │  header x-hive-secret
                          ▼
        n8n "Kyumen - Agent Task Worker"  (POST /webhook/kyumen/agent-task)
                          │  baca persona di hc_agent_prompts, panggil Claude
                          ▼
                  jawaban kembali ke chat / papan rencana

Approval disetujui ──► agent-chat ──► n8n "Kyumen - Approval Resume" ──► Task Worker
Tiap 5 menit: n8n "Kyumen - Routine Tick" ──► agent-chat {action: routines}
```

## Langkah 1: ambil 2 nilai rahasia

Buka Supabase → project **ACHPHORIA** → **SQL Editor**, jalankan:

```sql
select public.hive_webhook_secret();
```

Salin hasilnya (teks acak panjang). Ini nilai untuk credential **Kyumen Webhook Secret**.

Lalu buka **Project Settings → API Keys** dan salin **service_role** key (bagian *Legacy API keys*, tombol Reveal). Ini untuk credential **Supabase - ACHPHORIA**. Jangan pernah membagikan key ini.

## Langkah 2: buat 3 credential di n8n

Menu **Credentials → Add credential**. Nama harus persis seperti di bawah supaya workflow langsung mengenalinya.

| Nama credential | Tipe | Isi |
|---|---|---|
| `Supabase - ACHPHORIA` | **Supabase API** | Host: `https://ckoejqzownrujikefgwb.supabase.co` · Service Role Secret: service_role key dari langkah 1 |
| `Anthropic - Kyumen Agents` | **Anthropic** | API Key: API key Anthropic (boleh sama dengan Hive) |
| `Kyumen Webhook Secret` | **Header Auth** | Name: `x-hive-secret` · Value: hasil `hive_webhook_secret()` dari langkah 1 |

Jangan pakai credential Hive (`Supabase - General Table`, `Hive Webhook Secret`) untuk workflow Kyumen: itu menunjuk ke database Hive.

## Langkah 3: impor 3 workflow

Untuk tiap file: **Workflows → Add workflow → ⋯ (kanan atas) → Import from File**.

1. `kyumen-agent-task-worker.json` → **Kyumen - Agent Task Worker**
2. `kyumen-approval-resume.json` → **Kyumen - Approval Resume**
3. `kyumen-routine-tick.json` → **Kyumen - Routine Tick**

Setelah impor, buka tiap node yang ikon credential-nya merah/kuning, lalu pilih credential yang sesuai:

| Workflow | Node | Credential |
|---|---|---|
| Agent Task Worker | Webhook | Kyumen Webhook Secret |
| Agent Task Worker | Lookup Agent, Task Doing, Task Done, Log Activity, Create Approval, Log Approval, Task Todo, Log Error, Get Resume Approval | Supabase - ACHPHORIA |
| Agent Task Worker | Call Claude | Anthropic - Kyumen Agents |
| Approval Resume | Webhook, Call Task Worker | Kyumen Webhook Secret |
| Approval Resume | Get Approval, Log Resume, Check Resumed, Log Rejected | Supabase - ACHPHORIA |
| Routine Tick | Run Due Routines | Kyumen Webhook Secret |

Klik **Save** di tiap workflow.

## Langkah 4: cek alamat ngrok

Node **Call Task Worker** (workflow Approval Resume) memanggil:

```
https://sliceable-mousiness-exorcist.ngrok-free.dev/webhook/kyumen/agent-task
```

Kalau alamat ngrok n8n kamu sudah berbeda, ganti bagian domainnya di node itu, lalu perbarui juga di Supabase (SQL Editor):

```sql
select vault.update_secret((select id from vault.secrets where name = 'hive_n8n_url'), 'https://ALAMAT-NGROK-BARU');
```

## Langkah 5: aktifkan

Nyalakan toggle **Active** di ketiga workflow (sengaja nonaktif saat diimpor).

## Langkah 6: tes

1. Buka Kyumen → header **server**: tunggu ±2 menit atau klik **Cek ulang**, status harus **Online**.
2. Ruang Kerja → pilih **Mochi** → kirim "Halo Mochi, kenalkan dirimu." → harus dijawab.
3. Coba minta **Kaze** membuat iklan berbayar: harus muncul permintaan persetujuan di tab Persetujuan Ruang Tatami. Setujui → jawaban Kaze muncul di chat.

Kalau gagal, lihat **Executions** di n8n (error per node), atau kabari Claude untuk dicek dari log Supabase.
