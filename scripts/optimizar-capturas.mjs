import { readdir } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import sharp from 'sharp'

/**
 * Optimiza las capturas de /capturas y las deja en /public como WebP.
 * Uso: node scripts/optimizar-capturas.mjs
 * Editá el mapa `SALIDAS` cuando agregues o renombres una captura.
 */

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const ORIGEN = join(RAIZ, 'capturas')
const DESTINO = join(RAIZ, 'public')

// nombre de archivo en /capturas (sin importar mayúsculas)  ->  { out, width }
// Solo las que la landing referencia hoy. Agregá una fila si sumás otra captura.
// (proyecto-flechas.webp y app-ligavh-goleadores.webp se manejan a mano en /public)
const SALIDAS = [
  { match: /1788852482274|ligavh-admin|dashboard/i, out: 'proyecto-ligavh-admin.webp', width: 1600 },
  { match: /1788851754485|ligavh-web/i, out: 'proyecto-ligavh-web.webp', width: 1600 },
  { match: /045203|flechas-?web/i, out: 'flechas-web.webp', width: 1600 },
]

const archivos = await readdir(ORIGEN)
for (const archivo of archivos) {
  if (!/\.(png|jpe?g|webp)$/i.test(archivo)) continue
  const regla = SALIDAS.find((s) => s.match.test(archivo) || s.match.test(basename(archivo, extname(archivo))))
  if (!regla) {
    console.log(`· sin regla, salteo: ${archivo}`)
    continue
  }
  const destino = join(DESTINO, regla.out)
  await sharp(join(ORIGEN, archivo))
    .resize({ width: regla.width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(destino)
  console.log(`✓ ${archivo}  ->  public/${regla.out}  (${regla.width}px)`)
}
