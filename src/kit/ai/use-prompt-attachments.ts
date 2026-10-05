import { useEffect, useRef, useState } from "react"

/** Something the person attached: a file, or a reference to a record. */
export type PromptAttachment =
  | { id: string; kind: "file"; file: File; url?: string }
  | { id: string; kind: "reference"; value: string; label: string }

export interface AttachmentLimits {
  /** Comma-separated types, as for an input's accept attribute. */
  accept: string
  maxFiles: number
  /** Bytes. */
  maxFileSize: number
}

function accepts(file: File, accept: string) {
  return accept.split(",").some((rule) => {
    const type = rule.trim()

    if (type.endsWith("/*")) return file.type.startsWith(type.slice(0, -1))

    return type.startsWith(".")
      ? file.name.toLowerCase().endsWith(type)
      : file.type === type
  })
}

/**
 * The composer's attachments. Files over the limits are refused with a
 * reason; images get preview URLs, released when they are removed or sent.
 */
export function usePromptAttachments(limits: AttachmentLimits) {
  const [items, setItems] = useState<PromptAttachment[]>([])
  const [error, setError] = useState("")
  const current = useRef(items)

  useEffect(() => {
    current.current = items
  }, [items])

  // Preview URLs still held when the composer goes away are released.
  useEffect(
    () => () => {
      for (const item of current.current)
        if (item.kind === "file" && item.url) URL.revokeObjectURL(item.url)
    },
    [],
  )

  function addFiles(files: Iterable<File>) {
    const incoming = [...files]
    const room = limits.maxFiles - items.length
    const typed = incoming.filter((file) => accepts(file, limits.accept))
    const sized = typed.filter((file) => file.size <= limits.maxFileSize)
    const added = sized.slice(0, Math.max(room, 0))
    const megabytes = Math.round(limits.maxFileSize / (1024 * 1024))

    setError(
      typed.length < incoming.length
        ? "That type of file can't be attached."
        : sized.length < typed.length
          ? `Files can be up to ${megabytes} MB.`
          : added.length < sized.length
            ? `You can attach up to ${limits.maxFiles} files.`
            : "",
    )

    setItems((list) => [
      ...list,
      ...added.map((file) => ({
        id: crypto.randomUUID(),
        kind: "file" as const,
        file,
        url: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      })),
    ])
  }

  function addReference(value: string, label: string) {
    setError("")
    setItems((list) =>
      list.some((item) => item.kind === "reference" && item.value === value)
        ? list
        : [
            ...list,
            { id: crypto.randomUUID(), kind: "reference", value, label },
          ],
    )
  }

  function release(list: PromptAttachment[]) {
    for (const item of list)
      if (item.kind === "file" && item.url) URL.revokeObjectURL(item.url)
  }

  function remove(id: string) {
    release(items.filter((item) => item.id === id))
    setItems((list) => list.filter((item) => item.id !== id))
    setError("")
  }

  function clear() {
    release(items)
    setItems([])
    setError("")
  }

  return { items, error, addFiles, addReference, remove, clear }
}

/** Reads a file as a data URL, the form chat file parts carry. */
export function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error("Unreadable file"))
    reader.readAsDataURL(file)
  })
}
