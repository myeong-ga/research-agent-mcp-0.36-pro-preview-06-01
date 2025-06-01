## Learn Next.js
https://nextjs.org/learn?utm_source=next-site&utm_medium=homepage-cta&utm_campaign=home

## Learn AISDK
https://aie-feb-25.vercel.app/docs

## CHANGELOG
- MCP 지원
- Claude Opus 4 지원
- Claude Sonnet 4 지원
- Research Agent 전용 React Context 설계 / 적용
- gemini-2.5-flash-preview-05-20 지원 ( Google I/O 2025 에서 발표)
- Gemini "Thought summaries" 지원
- Google Gemini : Google Gen AI SDK for TypeScript , Gemini API 적용
- OpenAI "Reasoning summaries" 지원 
- OpenAI : OpenAI nodejs SDK , OpenAI Responses API 적용
- Anthropic "thinking enabled" 지원
- Anthropic SDK TypeScript , Anthropic Messages API 적용
- Anthropic web_search tool , citation 지원
- Google Gemini web_search tool , citation 지원
- OpenAi Intelligence Model web_search tool , citation 지원

## AI Model is now Thinking...
Research techniques enabling the model to consider multiple hypotheses before responding.
Claude 4, Gemini 2.5 pro 그리고 o3 , o4-mini Thinking 모델을 한자리에 놓고 멀티턴 Conversation 을 통해 검색의 폭을 넓히고 관점에 깊이있게 접근합니다.

### 다각적 관점 통합 및 탐색 공간 확장
- "Multi-LLM search synergy"는 단일 모델의 편향을 줄이고, 정보 탐색의 폭(breadth)과 깊이(depth)를 동시에 확보하는 데 기여합니다.
- 정형화된 검색 패턴을 벗어나, 각 LLM이 제시하는 "생각의 고리"를 따라가다 보면 사용자가 초기에 예상하지 못했던 유용한 정보나 새로운 연구 아이디어를 발견할 가능성이 커집니다. 
- 사용자는 어떤 키워드로 검색을 확장해야 할지에 대한 고민을 LLM에게 위임함으로써, 결과 분석 및 종합이라는 고차원적 사고에 더 집중할 수 있습니다.

## SDKs & API
### Model's Web Search Capabilities Comparision
- Google Gemini : Vercel AI SDK
- OpenAI : Vercel AI SDK , OpenAI Responses API
- Anthropic : Anthropic SDK TypeScript , Anthropic Messages API 
### Research Agent
- Google Gemini : Google Gen AI SDK for TypeScript , Gemini API
- OpenAI : OpenAI nodejs SDK , OpenAI Responses API
- Anthropic : Anthropic SDK TypeScript , Anthropic Messages API 

## Models 
Flagship Models

```typescript
import type { ProviderInfo } from "./types"

// 원론적 입장에서 생각하면 모델의 web search tool 의 사용은 thinking ( test time scaling ) 능력과 연관이 깊다.
// Thinking 모델 대상으로 profile / benchmark 진행되어야 한다.
// Gemini : 검색기반 Agent , OpenAI : Knowledge기반 Agent 로 posiiton

export const providers: ProviderInfo[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Google's multimodal AI that can understand and generate text, images, and code.",
    logoSrc: "/google-g-logo.png",
    isAvailable: false, // Will be determined by the context
    models: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", reasoningType: "Thinking" },
      { id: "gemini-2.5-flash-preview-05-20", name: "gemini-2.5-flash-preview-05-20", reasoningType: "Thinking" , isDefault: true,},
      {
        id: "gemini-2.5-pro-preview-05-06",
        name: "gemini-2.5-pro-preview-05-06",
        reasoningType: "Thinking",
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Creator of ChatGPT and GPT-4, offering powerful language models for various tasks.",
    logoSrc: "/openai-logo-inspired-abstract.png",
    isAvailable: false, // Will be determined by the context
    models: [
      { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", reasoningType: "Intelligence" },
      { id: "gpt-4.1", name: "GPT-4.1", reasoningType: "Intelligence", isDefault: true, },
      { id: "o3", name: "o3", reasoningType: "Thinking" ,},
      { id: "o4-mini", name: "o4-mini", reasoningType: "Thinking"},
    ],
  },
   {
    id: "anthropic",
    name: "Anthropic",
    description: "Creator of Claude, focused on AI safety and helpful, harmless, and honest AI assistants.",
    logoSrc: "/anthropic.jpeg",
    isAvailable: false, // Will be determined by the context
    models: [
      { id: "claude-3-5-sonnet-latest", name: "Claude Sonnet 3.5 v2",  reasoningType: "Intelligence" },
      { id: "claude-3-5-sonnet-20240620", name: "Claude Sonnet 3.5",  reasoningType: "Intelligence" },
      { id: "claude-3-7-sonnet-latest", name: "Claude Sonnet 3.7", reasoningType: "Thinking", },
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4",  reasoningType: "Thinking", isDefault: true, },
      { id: "claude-opus-4-20250514", name: "Claude Opus 4",  reasoningType: "Thinking" },
    ],
  },
]

```
## 📹 Demo

https://github.com/user-attachments/assets/80b5b476-9d8b-453b-ae1d-96b07634acd6


### Google Gemini 기반 검색 챗봇 개발 작업일지 (2024.04.23)

### 검색 기반 AI 모델 비교 프로젝트: 단일 프롬프트로 통합된 검색 경험

최근 출시된 Gemini 2.5 Flash의 새로운 기능들이 실제로 어떤 성능을 보여주는지 직접 테스트해보고 싶었습니다. 특히 검색 기반 AI 응답에서 어떤 차별점을 가져올 수 있는지 궁금했죠. 이론적인 벤치마크보다는 실제 사용 시나리오에서의 성능과 UX가 더 중요하다고 생각합니다.

## 프로젝트 접근 방식

Google과 OpenAI에서 제공하는 각각의 Native Web Search 도구를 활용하여 실험을 진행했습니다. AI SDK의 고수준 API를 통해 **단일 프롬프트로 웹 검색, 그라운딩, 그리고 검색어 추천까지** 모두 구현할 수 있었습니다. 이는 개발자 경험(DX)과 최종 사용자 경험(UX) 모두를 크게 향상시키는 접근법입니다.

```typescript
// Google의 Native Web Search 활용
const result = await streamText({
  model: google("gemini-2.5-flash-preview-04-17", {
    useSearchGrounding: true,  // 네이티브 웹 검색 활성화
  }),
  messages,
  system: GOOGLE_SEARCH_SUGGESTIONS_PROMPT,
  temperature: 0.4,
  maxTokens: 4000,
  // ...
});
```

이러한 통합 접근 방식은 복잡한 백엔드 로직을 숨기고 프론트엔드에서는 깔끔한 사용자 경험을 제공할 수 있게 해줍니다.

## 혁신적인 검색어 추천 메커니즘

이번 구현의 가장 흥미로운 부분은 검색어 추천 방식입니다. 기존의 접근법은 주로 입력 프롬프트를 기반으로 쿼리를 확장하는 방식이었습니다. 그러나 이 프로젝트에서는 **검색 결과로부터** 추천 검색어를 도출합니다.

이 방식의 장점은 사용자가 문제를 해결하는 과정에 더 가까운 추천을 제공한다는 점입니다. 사용자의 초기 질문에서 파생된 것이 아니라, 실제 검색 결과에서 발견된 관련 주제와 개념을 기반으로 하기 때문에 더 실용적인 탐색 경로를 제시합니다.

## OpenAI vs Google Gemini 비교

두 플랫폼 모두 네이티브 웹 검색 도구를 제공하지만, 구현 방식과 결과에는 차이가 있었습니다. OpenAI의 o3, o4-mini 모델은 AI SDK에서 제공하는 웹 검색 도구를 사용했지만, Google Gemini와 동일한 수준의 통합된 경험을 제공하지는 못했습니다.

```typescript
// OpenAI의 Native Web Search 활용
const result = await streamText({
  model: openai.responses("gpt-4o-mini"),
  messages,
  tools: {
    web_search_preview: openai.tools.webSearchPreview({  // 네이티브 웹 검색 도구
      searchContextSize: "high",
    }),
  },
  toolChoice: { type: "tool", toolName: "web_search_preview" },
  // ...
});
```

하지만 OpenAI의 Responses API를 더 깊이 활용하면 Google Gemini에서 구현한 것과 유사한 수준의 통합된 검색 경험을 제공할 수 있을 것이라 확신합니다. 특히 최신 Reasoning 모델의 기능을 활용한다면 더욱 그렇습니다.

## 기술적 도전과 해결책

프로젝트를 진행하면서 흥미로운 기술적 도전에 직면했습니다. 특히 단일 프롬프트로 여러 기능(웹 검색, 그라운딩, 검색어 추천)을 처리하는 과정에서 `SEARCH_TERMS_JSON` 블록을 적절히 처리하는 것이 중요했습니다.

처음에는 서버 측에서 응답을 버퍼링하여 특수 블록을 제거한 후 클라이언트에 전송하는 방식을 시도했지만, 이로 인해 실시간 응답성이 저하되었습니다. 결국 "스트리밍 후 정제" 패턴을 구현하여 실시간 응답성을 유지하면서도 깔끔한 최종 결과를 제공하는 방식으로 해결했습니다.

```typescript
// 스트리밍 후 정제 패턴 구현
onChunk: ({ chunk }) => {
  // 실시간 스트리밍을 위한 원본 텍스트 전송
  fullText += chunk.textDelta;
  dataStream.writeData({ type: "text-delta", text: chunk.textDelta });
},
onFinish: () => {
  // 정제된 텍스트 전송
  const cleanedText = removeSearchTermsJson(fullText);
  dataStream.writeData({ type: "cleaned-text", text: cleanedText });
}
```

## 다음 단계

이 프로젝트는 시작에 불과합니다. 다음 단계로는:

1. OpenAI Responses API를 더 깊이 활용한 동등한 통합 경험 구현
2. 다양한 검색 시나리오에서의 그라운딩 품질 비교
3. 검색 결과 기반 추천 알고리즘의 개선 및 최적화
4. 실제 사용자 피드백을 통한 UX 개선


## 오픈 소스로 공유

이 프로젝트의 모든 코드는 오픈 소스로 공유됩니다. 개발자 커뮤니티에서 이 실험 결과를 활용하고, 더 나은 검색 기반 AI 경험을 구축하는 데 도움이 되길 바랍니다.

단일 프롬프트로 웹 검색, 그라운딩, 검색어 추천까지 모두 처리할 수 있는 가능성은 AI 기반 검색 경험의 미래를 보여줍니다. 기술적 벤치마크보다 실제 사용자 가치를 창출하는 방향으로 이러한 모델을 활용하는 방법을 계속 모색해 나갈 것입니다.

---

코드와 데모는 GitHub에서 확인하실 수 있으며, 여러분의 피드백과 기여를 환영합니다!


### Google Gemini 기반 검색 챗봇 개발 작업일지 (2024.04.18)

안녕하세요! 오늘은 Google Gemini API를 활용한 검색 기반 챗봇의 개발 과정에서 중요한 기술적 개선을 이루었습니다. 특히 실시간 스트리밍 구현 방식을 크게 개선하여 사용자 경험과 개발자 경험 모두를 향상시켰습니다.

## 주요 개선사항

### 1. 스트리밍 구현 방식 개선

기존에는 Web Streams API를 직접 다루는 저수준 접근 방식을 사용했습니다:

```javascript
result.textStream.pipeTo(
  new WritableStream({
    write(chunk) {
      // 텍스트 청크 처리
    },
    close() {
      // 메타데이터 처리 및 소스 추출
    }
  })
)
```

이를 AI SDK의 고수준 API를 활용한 방식으로 전환했습니다:

```javascript
// 텍스트 청크 처리
onChunk: ({ chunk }) => {
  if (chunk.type === "text-delta") {
    dataStream.writeData({ type: "text-delta", text: chunk.textDelta })
  }
},

// 메타데이터 처리
onFinish: ({ text, providerMetadata }) => {
  // 소스 추출 및 전송
  dataStream.writeData({ type: "sources", sources })
},

// 스트림 병합
result.mergeIntoDataStream(dataStream)
```

이 변경으로 코드가 더 선언적이고 의도가 명확해졌으며, 관심사 분리와 타입 안전성이 향상되었습니다.

### 2. 하이브리드 접근법 도입

텍스트 스트리밍과 소스 처리를 분리하는 하이브리드 접근법을 도입했습니다:

- 텍스트는 `onChunk`에서 실시간으로 스트리밍
- 소스는 `onFinish`에서 전체 응답 완료 후 처리


이 방식은 사용자에게 텍스트를 즉시 보여주면서도, 정확한 소스 정보를 제공하는 최적의 사용자 경험을 제공합니다.

### 3. 최신 Gemini 모델 적용

`gemini-2.0-flash-exp`에서 `gemini-2.5-flash-preview-04-17`로 모델을 업그레이드했습니다. 이를 통해:

- 더 정확하고 품질 높은 응답 생성
- 최대 토큰 수를 1024에서 10000으로 증가시켜 더 긴 응답 지원


### 4. 시스템 프롬프트 도입

시스템 프롬프트를 별도 파일로 분리하고, 현재 날짜와 시간을 포함하도록 구현했습니다:

```javascript
export const SYSTEM_PROMPT = `
You are a Google search-based chatbot. Always provide the most up-to-date information and cite sources.
Today is ${formatCurrentDateTime()}
`;
```

이를 통해 챗봇이 시간 인식을 갖추고, 일관된 응답 스타일을 유지할 수 있게 되었습니다.

### 5. 마크다운 렌더링 개선

어시스턴트 메시지에 마크다운 렌더링을 적용하여 가독성을 크게 향상시켰습니다:

- 코드 블록에 구문 강조 적용
- 테이블, 링크 등 다양한 마크다운 요소 지원
- GitHub Flavored Markdown(GFM) 지원


## 개발자 경험(DX) 개선

이번 변경으로 개발자 경험이 크게 향상되었습니다:

1. **코드 가독성**: 더 선언적이고 의도가 명확한 코드로 가독성 향상
2. **유지보수성**: 관심사 분리를 통해 코드 유지보수가 용이해짐
3. **타입 안전성**: AI SDK의 타입 시스템을 활용한 더 안전한 코드
4. **확장성**: 새로운 기능 추가가 더 쉬워짐


## 사용자 경험(UX) 개선

사용자 경험 측면에서도 여러 개선이 이루어졌습니다:

1. **더 빠른 응답**: 텍스트가 생성되는 즉시 사용자에게 표시
2. **정확한 소스 정보**: 완전한 메타데이터를 기반으로 한 신뢰할 수 있는 소스 제공
3. **가독성 향상**: 마크다운 렌더링을 통한 응답 가독성 개선
4. **시간 인식**: 현재 날짜와 시간을 인식하여 더 정확한 정보 제공


## 결론

오늘의 개선 작업을 통해 Google Gemini 기반 검색 챗봇의 품질이 크게 향상되었습니다. 특히 스트리밍 구현 방식의 개선은 코드 품질과 사용자 경험 모두에 긍정적인 영향을 미쳤습니다. AI SDK가 제공하는 고수준 API를 활용함으로써, 복잡한 스트리밍 로직보다 비즈니스 로직에 더 집중할 수 있게 되었습니다.

앞으로도 지속적인 개선을 통해 더 나은 챗봇 경험을 제공하겠습니다. 질문이나 피드백이 있으시면 언제든지 댓글로 남겨주세요!

#AI개발 #GoogleGemini #챗봇개발 #스트리밍API #개발일지
