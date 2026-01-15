import fetch from "node-fetch"
import yauzl from "yauzl"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, ".env"), override: false })

// Store GTFS data inside the backend folder
const dataDir = path.resolve(__dirname, "gtfs_data/TransportForIreland")
const localZipPath = path.join(dataDir, "GTFS_Realtime.zip")
// /Users/briansmith/Documents/GTD/golf-3/backend/gtfs_data/TransportForIreland/GTFS_Realtime.zip

const masterZipPath =
  process.env.TRANSPORT_FOR_IRELAND_FILEPATH ||
  "https://www.transportforireland.ie/transitData/Data/GTFS_Realtime.zip"

getZipTimestamps()

export default async function getZipTimestamps() {
  try {
    await fs.promises.mkdir(dataDir, { recursive: true })

    const headResponse = await fetch(masterZipPath, { method: "HEAD" })
    if (!headResponse.ok) {
      throw new Error(`HEAD request failed with status ${headResponse.status}`)
    }

    const remoteLastModifiedHeader = headResponse.headers.get("last-modified")
    const remoteLastModified = remoteLastModifiedHeader
      ? new Date(remoteLastModifiedHeader)
      : null

    console.log("HTTP Last-Modified:", remoteLastModifiedHeader || "N/A")

    let isSameDate = false
    if (
      fs.existsSync(localZipPath) &&
      remoteLastModified instanceof Date &&
      !Number.isNaN(remoteLastModified.getTime())
    ) {
      const stat = await fs.promises.stat(localZipPath)
      const localSeconds = Math.floor(stat.mtime.getTime() / 1000)
      const remoteSeconds = Math.floor(remoteLastModified.getTime() / 1000)
      if (localSeconds === remoteSeconds) {
        isSameDate = true
      }
    }

    if (isSameDate) {
      console.log("Same Date")
      return
    }

    console.log("Downloading ZIP (newer or missing locally)...")
    const response = await fetch(masterZipPath)
    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`)
    }
    // arrayBuffer avoids deprecated response.buffer(); convert to Node Buffer for yauzl
    const buffer = Buffer.from(await response.arrayBuffer())

    await fs.promises.writeFile(localZipPath, buffer)
    if (remoteLastModified && !Number.isNaN(remoteLastModified.getTime())) {
      await fs.promises.utimes(localZipPath, new Date(), remoteLastModified)
    }

    console.log("Extracting ZIP...")
    await extractZipBuffer(buffer, dataDir)
    console.log("Extraction complete.")
  } catch (error) {
    console.error("Error:", error.message)
  }
}

function extractZipBuffer(buffer, targetDir) {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err)

      zipfile.readEntry()

      zipfile.on("entry", (entry) => {
        const destPath = path.join(targetDir, entry.fileName)

        if (/\/$/.test(entry.fileName)) {
          fs.mkdir(destPath, { recursive: true }, (mkErr) => {
            if (mkErr) return reject(mkErr)
            zipfile.readEntry()
          })
          return
        }

        fs.mkdir(path.dirname(destPath), { recursive: true }, (mkErr) => {
          if (mkErr) return reject(mkErr)

          zipfile.openReadStream(entry, (streamErr, readStream) => {
            if (streamErr) return reject(streamErr)

            const writeStream = fs.createWriteStream(destPath)
            readStream.pipe(writeStream)

            writeStream.on("finish", () => {
              zipfile.readEntry()
            })

            writeStream.on("error", reject)
            readStream.on("error", reject)
          })
        })
      })

      zipfile.on("end", resolve)
      zipfile.on("error", reject)
    })
  })
}
