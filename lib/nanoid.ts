// This is a simple implementation of nanoid for client-side use
// We're creating this helper to avoid adding a dependency

export function nanoid(size = 21): string {
    const urlAlphabet = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW"
    let id = ""
    let i = size
    while (i--) {
      id += urlAlphabet[(Math.random() * 64) | 0]
    }
    return id
  }
  