# scxweb-gcp-infra-poc

POC สำหรับทดสอบ GCP infrastructure ของ `scx-scxweb-dev` ก่อน apply กับ services จริง (api/cms/web)

Deploy อยู่ที่: **https://cms-uat.scx.co.th** (ใช้ Cloud Run `scx-scxweb-dev-run-bkk-cms` เพราะ ingress restriction)

---

## Features ที่ทดสอบ

| Feature | Status | Path |
|---|---|---|
| Secret Manager | ✅ | `/` (แสดง `APP_VERSION`) |
| GCS Upload | ✅ | `/media/upload` |
| GCS List + CDN | ✅ | `/media` |
| GCS Delete | ✅ | `/media` (hover ที่รูป) |
| Cloud SQL (PSC) | ❌ | รอ VPC Direct Egress จาก networking team |
| Email Test | ✅ | `/email-test` |
| IP / Outbound | ✅ | `/ip-check` |
| Port Test | ✅ | `/port-test` |

---

## Google Cloud Storage (GCS)

### Architecture

Browser upload ไปที่ Cloud Run โดยตรง (server-side) — ไม่ใช้ Signed URL เพื่อหลีกเลี่ยงปัญหา CORS และความซับซ้อนของ IAM:

```
Browser → POST /api/upload (multipart/form-data)
                ↓
         Cloud Run (Next.js)
                ↓
         @google-cloud/storage
                ↓
         GCS Bucket (scx-scxweb-dev-gcs-bkk-001)
                ↓
         CDN (files-uat.scx.co.th)  ← อ่านไฟล์ผ่าน CDN
```

### Environment Variables

| Variable | Description | Default (fallback) |
|---|---|---|
| `GCS_BUCKET_NAME` | ชื่อ GCS bucket | `scx-scxweb-dev-gcs-bkk-001` |
| `GCP_PROJECT_ID` | GCP Project ID | `scx-scxweb-dev` |
| `CDN_DOMAIN` | Domain ของ CDN (ไม่มี `https://`) | `storage.googleapis.com/<bucket>` |

ใน Secret Manager (Cloud Run):
- `CDN_DOMAIN` → `files-uat.scx.co.th`

### IAM ที่ต้องการ

Cloud Run Service Account (`scx-scxweb-dev-run-bkk-cms@scx-scxweb-dev.iam.gserviceaccount.com`) ต้องมี role:

| Role | ใช้สำหรับ |
|---|---|
| `roles/storage.objectViewer` | List และอ่านไฟล์ |
| `roles/storage.objectCreator` | Upload ไฟล์ |
| `roles/storage.objectAdmin` | Delete ไฟล์ (รวม objectViewer + objectCreator) |

> ใช้ `roles/storage.objectAdmin` เพียง role เดียวก็เพียงพอสำหรับ POC

```bash
gcloud storage buckets add-iam-policy-binding gs://scx-scxweb-dev-gcs-bkk-001 \
  --member="serviceAccount:scx-scxweb-dev-run-bkk-cms@scx-scxweb-dev.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin" \
  --project=scx-scxweb-dev
```

### API Routes

#### `POST /api/upload`

รับไฟล์จาก browser (`multipart/form-data`) แล้ว upload ขึ้น GCS

**Request:**
```
Content-Type: multipart/form-data
Body: file=<binary>
```

**Response (200):**
```json
{ "url": "https://files-uat.scx.co.th/image.png" }
```

#### `DELETE /api/media/:filename`

ลบไฟล์ออกจาก GCS ตาม filename ที่ระบุใน URL path

**Response:** `204 No Content`

### Pages

- **`/media`** — แสดง gallery ของไฟล์ทั้งหมดใน bucket (Server Component, `force-dynamic`)
  - Hover ที่รูปเพื่อแสดงปุ่มลบ
  - URL ของรูปใช้ CDN domain จาก `CDN_DOMAIN` env
- **`/media/upload`** — form สำหรับ upload ไฟล์ (Client Component)

### Known Limitations (POC)

- ไม่มี file type validation (production ควร whitelist mime types)
- ไม่มี file size limit (Next.js default 4MB สำหรับ form data)
- ชื่อไฟล์ที่ซ้ำจะ overwrite ไฟล์เดิมใน bucket โดยไม่แจ้งเตือน
- ไม่มี auth/authn — ทุกคนที่เข้าถึง URL สามารถ upload/delete ได้

---

## Secret Manager

Cloud Run inject secrets เป็น environment variables ผ่าน `--update-secrets`:

| Secret Name | Env Var | ใช้สำหรับ |
|---|---|---|
| `APP_VERSION` | `APP_VERSION` | แสดงบน homepage เพื่อยืนยัน Secret Manager ทำงาน |
| `CDN_DOMAIN` | `CDN_DOMAIN` | Domain สำหรับ serve ไฟล์จาก GCS ผ่าน CDN |
| `DB_USER` | `DB_USER` | Cloud SQL (ยังไม่ใช้งานได้ — รอ PSC) |
| `DB_PASSWORD` | `DB_PASSWORD` | Cloud SQL |
| `DB_NAME` | `DB_NAME` | Cloud SQL |
| `CLOUD_SQL_CONNECTION_NAME` | `CLOUD_SQL_CONNECTION_NAME` | Cloud SQL |

Secret ทั้งหมดสร้างใน `scx-scxweb-dev` project แล้ว

---

## Local Development

```bash
cp env.example .env.local
# แก้ไข .env.local ใส่ค่าจริง

npm install
npm run dev
```

เปิด http://localhost:3000

**หมายเหตุ:** การรัน local จะใช้ Application Default Credentials (ADC) ของ `gcloud`:
```bash
gcloud auth application-default login
```

---

## Deploy

ดู `cloudbuild.yaml` — Cloud Build trigger ที่ branch `uat` จะ build และ deploy ไปยัง Cloud Run โดยอัตโนมัติ

Manual deploy (fallback กรณี Cloud Build ไม่พร้อม):
```bash
# Build
docker build --platform linux/amd64 -t asia-southeast3-docker.pkg.dev/scx-scxweb-dev/scx-scxweb-dev-ar-bkk-001/scx-scxweb-dev-run-bkk-poc:latest .

# Push (bypass proxy)
NO_PROXY="asia-southeast3-docker.pkg.dev" HTTPS_PROXY="" HTTP_PROXY="" \
  docker push asia-southeast3-docker.pkg.dev/scx-scxweb-dev/scx-scxweb-dev-ar-bkk-001/scx-scxweb-dev-run-bkk-poc:latest

# Deploy
gcloud run deploy scx-scxweb-dev-run-bkk-cms \
  --image=asia-southeast3-docker.pkg.dev/scx-scxweb-dev/scx-scxweb-dev-ar-bkk-001/scx-scxweb-dev-run-bkk-poc:latest \
  --region=asia-southeast3 \
  --port=3000 \
  --project=scx-scxweb-dev \
  --account=kergrit@jairak.digital
```
