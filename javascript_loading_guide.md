# Javascript 및 라이브러리 로드 가이드

이 문서는 `$ is not defined`와 같은 라이브러리 참조 오류를 방지하고, 웹 애플리케이션의 안정적인 스크립트 실행을 위한 가이드를 제공합니다.

## 1. 주요 오류: `ReferenceError: $ is not defined`
### 원인
*   브라우저가 HTML을 위에서 아래로 읽는 과정에서, jQuery 라이브러리(`jquery.js`)를 로드하기 전에 jQuery를 사용하는 인라인 스크립트가 실행될 때 발생합니다.

## 2. 해결 및 방지 원칙

### 원칙 A: 라이브러리는 `<head>` 또는 실행 스크립트 이전에 배치
*   **방법 1 (안전함):** jQuery, Bootstrap 등 공통 라이브러리는 HTML의 `<head>` 섹션 내에 위치시킵니다.
    ```html
    <head>
      <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    </head>
    ```
*   **방법 2 (성능 최적화):** 라이브러리를 `</body>` 직전에 두되, 이를 사용하는 모든 커스텀 스크립트는 반드시 그 **뒤**에 배치해야 합니다.

### 원칙 B: `$(document).ready()`의 올바른 사용
*   `$(document).ready()`는 DOM이 완전히 준비된 후 실행되도록 보장하지만, **jQuery 라이브러리 자체가 로드되지 않은 상태에서는 이 함수조차 호출할 수 없습니다.** 따라서 라이브러리 로드가 최우선입니다.

### 원칙 C: `defer` 및 `async` 속성 이해
*   외부 스크립트 로드 시 `defer` 속성을 사용하면 HTML 파싱이 완료된 후 순서대로 실행되므로 관리가 용이합니다.

## 3. 프로젝트 적용 표준 구조 (추천)

```html
<!DOCTYPE html>
<html>
<head>
    <!-- 1. CSS 로드 -->
    <link rel="stylesheet" href="style.css">
    
    <!-- 2. 핵심 라이브러리 로드 (jQuery 등) -->
    <script src="jquery.min.js"></script>
</head>
<body>
    <!-- 콘텐츠 -->

    <!-- 3. 콘텐츠 의존성이 있는 스크립트 -->
    <script>
        $(document).ready(function() {
            // 이제 안전하게 $를 사용할 수 있습니다.
        });
    </script>
</body>
</html>
```

## 4. 체크리스트
- [ ] `$ (jQuery)`를 사용하기 전에 `jquery.js`가 로드되었는가?
- [ ] 외부 라이브러리 간의 의존성 순서가 맞는가? (예: Bootstrap 이전에 jQuery 로드)
- [ ] 브라우저 콘솔에 `Uncaught ReferenceError`가 없는가?

---
*이 가이드의 원칙은 모든 웹 프로젝트에서 기본적으로 준수되어야 합니다.*
