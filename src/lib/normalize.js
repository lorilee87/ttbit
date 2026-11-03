// Minúsculas e sem acentos, para a busca achar "oracao" em "Oração".
export function normalize(s) {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}
