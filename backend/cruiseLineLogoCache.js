import path from "path"
import fs from "fs"
import https from "https"
import http from "http"
import crypto from "crypto"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOGO_DIR = path.join(__dirname, "../frontend/public/static/cruiselinelogos")

const ensureDirExists = () => {
  if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true })
}

// Derive a stable, filesystem-safe filename from a logo URL.
// Uses basename for readability plus a short hash to avoid collisions.
const getFilename = (logoUrl) => {
  try {
    const url = new URL(logoUrl)
    const basename = path.basename(url.pathname)
    const ext = path.extname(basename) || ".png"
    const stem = path.basename(basename, ext)
    const hash = crypto.createHash("md5").update(logoUrl).digest("hex").slice(0, 8)
    return `${stem}-${hash}${ext}`
  } catch {
    const hash = crypto.createHash("md5").update(logoUrl).digest("hex")
    return `${hash}.png`
  }
}

// Returns the web-accessible path for a logo URL (does not check if file exists).
export const getLocalLogoUrl = (logoUrl) => {
  if (!logoUrl) return null
  return `/static/cruiselinelogos/${getFilename(logoUrl)}`
}

const isLogoCached = (logoUrl) =>
  fs.existsSync(path.join(LOGO_DIR, getFilename(logoUrl)))

const REQUEST_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Referer": "https://www.cruisemapper.com/",
  "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
}

const downloadFile = (url, dest) =>
  new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http
    const file = fs.createWriteStream(dest)
    const cleanup = (err) => {
      file.close()
      fs.unlink(dest, () => {})
      reject(err)
    }
    const parsedUrl = new URL(url)
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: REQUEST_HEADERS,
    }
    protocol
      .get(options, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          file.close()
          fs.unlink(dest, () => {})
          downloadFile(response.headers.location, dest).then(resolve).catch(reject)
          return
        }
        if (response.statusCode !== 200) {
          cleanup(new Error(`HTTP ${response.statusCode} for ${url}`))
          return
        }
        response.pipe(file)
        file.on("finish", () => file.close(resolve))
        file.on("error", cleanup)
      })
      .on("error", cleanup)
  })

// Checks if a logo is already cached locally; downloads it if not.
// Returns the local web path on success, null on failure.
export const ensureLogoCached = async (logoUrl) => {
  if (!logoUrl) return null
  if (logoUrl.startsWith("/static/")) return logoUrl
  ensureDirExists()
  if (isLogoCached(logoUrl)) return getLocalLogoUrl(logoUrl)
  const filename = getFilename(logoUrl)
  const filepath = path.join(LOGO_DIR, filename)
  try {
    await downloadFile(logoUrl, filepath)
    return `/static/cruiselinelogos/${filename}`
  } catch (err) {
    console.warn(`Failed to download logo ${logoUrl}:`, err.message)
    return null
  }
}
