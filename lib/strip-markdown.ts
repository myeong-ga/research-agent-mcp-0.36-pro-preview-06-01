export function stripMarkdown(text: string): string {
  if (!text) return ""

  // 코드 블록 제거 (```code```)
  let result = text.replace(/```[\s\S]*?```/g, (match) => {
    const lines = match.split("\n")
    if (lines.length <= 2) return "[코드 블록]"

    // 첫 줄과 마지막 줄 제거 (``` 부분)
    return "[코드 블록: " + lines[0].replace(/```/, "").trim() + "]"
  })

  // 인라인 코드 제거 (`code`)
  result = result.replace(/`([^`]+)`/g, "$1")

  // 헤더 제거 (# Header)
  result = result.replace(/^#{1,6}\s+(.+)$/gm, "$1")

  // 볼드체 제거 (**bold**)
  result = result.replace(/\*\*([^*]+)\*\*/g, "$1")

  // 이탤릭체 제거 (*italic*)
  result = result.replace(/\*([^*]+)\*/g, "$1")

  // 링크 제거 ([text](url))
  result = result.replace(/\[([^\]]+)\]$$([^)]+)$$/g, "$1")

  // 이미지 제거 (![alt](url))
  result = result.replace(/!\[([^\]]+)\]$$([^)]+)$$/g, "[이미지: $1]")

  // 목록 기호 제거 (- item)
  result = result.replace(/^[*\-+]\s+(.+)$/gm, "$1")

  // 숫자 목록 제거 (1. item)
  result = result.replace(/^\d+\.\s+(.+)$/gm, "$1")

  // 인용구 제거 (> quote)
  result = result.replace(/^>\s+(.+)$/gm, "$1")

  // 수평선 제거 (---, ___, ***)
  result = result.replace(/^[-_*]{3,}$/gm, "")

  // 테이블 제거 (간단한 처리)
  result = result.replace(/\|.*\|/g, "[테이블]")

  // 여러 줄 바꿈 정리
  result = result.replace(/\n{3,}/g, "\n\n")

  return result
}
