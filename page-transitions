
  // Детальный отладчик для проблемы hover анимации
  window.hoverDebugger = {
    logs: [],
    states: new Map(),
    addLog: function (type, message, element = null, data = null) {
      const timestamp = new Date().toLocaleTimeString()
      const logEntry = {
        timestamp,
        type,
        message,
        element: element ? this.getElementInfo(element) : null,
        data,
        stack: new Error().stack.split("\n").slice(2, 5).join(" | "),
      }

      this.logs.push(logEntry)
      console.log(`%c[${type}] ${timestamp}`, this.getStyle(type), message, element || "", data || "")
    },

    getElementInfo: function (element) {
      if (!element) return null
      return {
        tagName: element.tagName,
        className: element.className,
        classes: Array.from(element.classList),
        hasHoverClass: element.classList.contains("barba-card-hover"),
        hasUnhoverClass: element.classList.contains("barba-card-unhover"),
        computedStyle: {
          transform: getComputedStyle(element).transform,
          transition: getComputedStyle(element).transition,
          opacity: getComputedStyle(element).opacity,
        },
      }
    },

    getStyle: function (type) {
      const styles = {
        HOVER_ADD: "color: #4CAF50; font-weight: bold;",
        HOVER_REMOVE: "color: #F44336; font-weight: bold;",
        TRANSITION: "color: #FF9800; font-weight: bold;",
        ERROR: "color: #F44336; font-weight: bold; background: yellow;",
        DEBUG: "color: #2196F3; font-weight: bold;",
        VISIBILITY_CHECK: "color: #9C27B0; font-weight: bold;",
      }
      return styles[type] || "color: #000;"
    },

    inspectElement: function (selector) {
      const element = document.querySelector(selector)
      if (!element) {
        this.addLog("ERROR", `Element not found: ${selector}`)
        return null
      }

      const info = this.getElementInfo(element)
      this.addLog("DEBUG", `Inspecting element: ${selector}`, element, info)
      return info
    },
  }

  // Глобальный объект для хранения всех данных
  window.barbaDebugger = {
    version: "1.0",
    transitions: [],
    currentTransition: null,
    cardStates: new Map(),
  }

  // Функция для проверки ширины экрана
  function isDesktop() {
    return window.innerWidth >= 992
  }

  // НОВАЯ ФУНКЦИЯ: Проверка видимости элемента в viewport
  function isElementInViewport(element) {
    if (!element) return false

    const rect = element.getBoundingClientRect()
    const windowHeight = window.innerHeight || document.documentElement.clientHeight
    const windowWidth = window.innerWidth || document.documentElement.clientWidth

    const isVisible =
      rect.top <= windowHeight * 0.9 && // Элемент в верхних 90% экрана
      rect.bottom >= windowHeight * 0.1 && // Элемент в нижних 90% экрана
      rect.left <= windowWidth &&
      rect.right >= 0

    window.hoverDebugger.addLog("VISIBILITY_CHECK", "Element viewport check", element, {
      top: rect.top,
      bottom: rect.bottom,
      windowHeight,
      isVisible,
      visibilityRatio: {
        top: (rect.top / windowHeight).toFixed(2),
        bottom: (rect.bottom / windowHeight).toFixed(2),
      },
    })

    return isVisible
  }

  // НОВАЯ ФУНКЦИЯ: Проверка необходимости FLIP анимации на основе видимости
  function shouldPerformFlipAnimation(productImgWrap, activeItem) {
    if (!productImgWrap || !activeItem) {
      window.hoverDebugger.addLog("VISIBILITY_CHECK", "Missing elements for FLIP check", null, {
        hasProductImgWrap: !!productImgWrap,
        hasActiveItem: !!activeItem,
      })
      return false
    }

    // Проверяем видимость картинки на странице продукта
    const isProductImageVisible = isElementInViewport(productImgWrap)

    window.hoverDebugger.addLog("VISIBILITY_CHECK", "FLIP animation decision", productImgWrap, {
      isProductImageVisible,
      productImageRect: productImgWrap.getBoundingClientRect(),
      recommendation: isProductImageVisible ? "PERFORM_FLIP" : "SKIP_FLIP_USE_SLIDE",
    })

    return isProductImageVisible
  }

  // Улучшенная функция для управления hover состоянием с синхронизацией FLIP
  function setCardHoverState(card, isHovered) {
    if (!card) {
      window.hoverDebugger.addLog("ERROR", "setCardHoverState called with null card", null, { isHovered })
      return
    }

    window.hoverDebugger.addLog("DEBUG", `setCardHoverState started`, card, {
      isHovered,
      currentClasses: Array.from(card.classList),
      hasHoverClass: card.classList.contains("barba-card-hover"),
      hasUnhoverClass: card.classList.contains("barba-card-unhover"),
    })

    // Очищаем оба класса перед установкой нового состояния
    card.classList.remove("barba-card-hover", "barba-card-unhover")

    // Принудительный reflow для сброса анимации
    void card.offsetHeight

    if (isHovered) {
      // Добавляем hover
      window.hoverDebugger.addLog("HOVER_ADD", "Adding barba-card-hover class", card)
      card.classList.add("barba-card-hover")
      window.barbaDebugger.cardStates.set(card, "hover")

      // Проверяем результат
      setTimeout(() => {
        const mask = card.querySelector(".project-card__mask")
        window.hoverDebugger.addLog("DEBUG", "After adding hover class", card, {
          hasHoverClass: card.classList.contains("barba-card-hover"),
          maskHeight: mask ? getComputedStyle(mask).height : "no mask",
        })
      }, 50)
    } else {
      // Добавляем unhover
      window.hoverDebugger.addLog("HOVER_REMOVE", "Adding barba-card-unhover class", card)
      card.classList.add("barba-card-unhover")
      window.barbaDebugger.cardStates.set(card, "unhover")

      // Проверяем результат
      setTimeout(() => {
        const mask = card.querySelector(".project-card__mask")
        window.hoverDebugger.addLog("DEBUG", "After adding unhover class", card, {
          hasUnhoverClass: card.classList.contains("barba-card-unhover"),
          maskHeight: mask ? getComputedStyle(mask).height : "no mask",
        })
      }, 50)
    }
  }

  // Улучшенная функция для очистки hover состояний
  function clearAllCardHoverStates() {
    window.hoverDebugger.addLog("DEBUG", "clearAllCardHoverStates started")

    const hoverCards = document.querySelectorAll(".barba-card-hover, .barba-card-unhover")
    window.hoverDebugger.addLog("DEBUG", `Found ${hoverCards.length} cards with hover/unhover classes`)

    hoverCards.forEach((card, index) => {
      window.hoverDebugger.addLog("DEBUG", `Processing card ${index + 1}`, card)

      // Принудительный reflow для каждого элемента
      void card.offsetHeight

      card.classList.remove("barba-card-hover", "barba-card-unhover")
      window.hoverDebugger.addLog("HOVER_REMOVE", `Removed hover/unhover from card ${index + 1}`, card)
    })

    window.barbaDebugger.cardStates.clear()
    window.hoverDebugger.addLog("DEBUG", "clearAllCardHoverStates completed")
  }

  // Функция для принудительной установки hover состояния без анимации (для FLIP)
  function setCardHoverStateForFlip(card, isHovered) {
    if (!card) return

    window.hoverDebugger.addLog("DEBUG", `setCardHoverStateForFlip called`, card, { isHovered })

    // Отключаем transition временно
    const originalTransition = card.style.transition
    card.style.transition = "none"

    // Устанавливаем состояние
    card.classList.remove("barba-card-hover", "barba-card-unhover")

    if (isHovered) {
      card.classList.add("barba-card-hover")
    } else {
      card.classList.add("barba-card-unhover")
    }

    // Принудительный reflow
    void card.offsetHeight

    // Восстанавливаем transition после reflow
    setTimeout(() => {
      card.style.transition = originalTransition
    }, 10)
  }

  // Функция для проверки CSS transition
  function checkCSSTransitions() {
    window.hoverDebugger.addLog("DEBUG", "Checking CSS transitions configuration")

    const styleSheets = document.styleSheets
    let transitionRules = []

    for (let sheet of styleSheets) {
      try {
        for (let rule of sheet.cssRules) {
          if (
            rule.selectorText &&
            (rule.selectorText.includes(".barba-card") ||
              rule.selectorText.includes(".barba-card-hover") ||
              rule.selectorText.includes(".barba-card-unhover"))
          ) {
            transitionRules.push({
              selector: rule.selectorText,
              cssText: rule.cssText,
              transition: rule.style.transition,
            })
          }
        }
      } catch (e) {
        // Игнорируем CORS ошибки
      }
    }

    window.hoverDebugger.addLog("DEBUG", "CSS transition rules found", null, { transitionRules })

    // Проверяем конкретный элемент
    const testCard = document.querySelector(".barba-card")
    if (testCard) {
      const computedStyle = getComputedStyle(testCard)
      window.hoverDebugger.addLog("DEBUG", "Computed styles for .barba-card", testCard, {
        transition: computedStyle.transition,
        transform: computedStyle.transform,
        willChange: computedStyle.willChange,
      })
    }
  }

  // Функция для нормализации текста
  function normalizeText(text) {
    if (!text) return ""
    return text
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }

  // Улучшенная функция поиска активной карточки
  function getActiveCard(productName) {
    let activeCard = null
    const cards = document.querySelectorAll(".barba-card")

    const normalizedProductName = normalizeText(productName)

    // Поиск по тексту
    cards.forEach((card) => {
      let itemName = card.querySelector(".item-name")?.textContent.trim()
      itemName = normalizeText(itemName)

      if (!itemName) {
        const textElements = card.querySelectorAll('h1, h2, h3, h4, h5, h6, .title, .name, [class*="title"], [class*="name"]')
        for (let el of textElements) {
          const text = el.textContent.trim()
          if (text) {
            itemName = normalizeText(text)
            break
          }
        }
      }

      if (itemName === normalizedProductName) {
        activeCard = card
      }
    })

    // Поиск по URL
    if (!activeCard) {
      const currentUrl = window.location.pathname
      const currentPath = currentUrl.split("?")[0]

      cards.forEach((card) => {
        const href = card.getAttribute("href")
        if (href) {
          const cardPath = href.split("?")[0]
          if (cardPath === currentPath) {
            activeCard = card
          }
        }
      })
    }

    return activeCard
  }

  // Функция для поиска всех overflow: hidden родителей
  function findOverflowHiddenParents(element) {
    const parents = []
    let current = element.parentElement

    while (current && current !== document.body) {
      const styles = window.getComputedStyle(current)
      if (styles.overflow === "hidden" || styles.overflowX === "hidden" || styles.overflowY === "hidden") {
        parents.push({
          element: current,
          originalOverflow: current.style.overflow,
          originalOverflowX: current.style.overflowX,
          originalOverflowY: current.style.overflowY,
        })
      }
      current = current.parentElement
    }

    return parents
  }

  // Функция для временного отключения overflow: hidden
  function disableOverflowHidden(parents) {
    parents.forEach((parent) => {
      parent.element.style.overflow = "visible"
      parent.element.style.overflowX = "visible"
      parent.element.style.overflowY = "visible"
    })
  }

  // Функция для восстановления overflow: hidden
  function restoreOverflowHidden(parents) {
    parents.forEach((parent) => {
      parent.element.style.overflow = parent.originalOverflow
      parent.element.style.overflowX = parent.originalOverflowX
      parent.element.style.overflowY = parent.originalOverflowY
    })
  }

  // НОВАЯ ФУНКЦИЯ: Получение корректного visual элемента с учетом перезагрузки страницы
  function getCorrectVisualElement(container, isProductPage = false) {
    if (!container) return null

    // Сначала ищем стандартный .visual элемент
    let visual = container.querySelector(".visual")

    // Если на странице продукта после перезагрузки, создаем корректный visual
    if (isProductPage && (!visual || visual.children.length === 0)) {
      window.hoverDebugger.addLog("DEBUG", "Creating corrected visual element for product page", container)

      // Ищем изображение продукта
      const productImg = container.querySelector("img")
      if (productImg) {
        // Создаем новый visual элемент с теми же стилями
        visual = document.createElement("div")
        visual.className = "visual"
        visual.style.width = "100%"
        visual.style.height = "100%"
        visual.style.position = "relative"

        // Клонируем изображение
        const clonedImg = productImg.cloneNode(true)
        clonedImg.style.width = "100%"
        clonedImg.style.height = "100%"
        clonedImg.style.objectFit = "cover"

        visual.appendChild(clonedImg)
        container.appendChild(visual)
      }
    }

    return visual
  }

  // Улучшенная FLIP функция с исправлением проблемы перезагрузки
  function performFlip(outgoing, incoming) {
    if (!outgoing || !incoming) {
      window.hoverDebugger.addLog("ERROR", "performFlip called with null elements", null, { outgoing, incoming })
      return
    }

    if (!isDesktop()) {
      const visualContainer = outgoing.querySelector(".visual")
      if (!visualContainer) {
        return
      }
      incoming.querySelector(".visual")?.remove()
      incoming.appendChild(visualContainer)
      return
    }

    flip(outgoing, incoming)
  }

  // Основная FLIP функция с исправленным позиционированием и учетом перезагрузки
  function flip(outgoing, incoming) {
    // Используем улучшенную функцию получения visual элементов
    const outgoingVisual = getCorrectVisualElement(outgoing, outgoing.classList.contains("barba-product__img-wrp"))
    const incomingVisual = getCorrectVisualElement(incoming, incoming.classList.contains("barba-product__img-wrp"))

    if (!outgoingVisual || !incomingVisual) {
      window.hoverDebugger.addLog("ERROR", "Missing visual elements for FLIP", null, {
        outgoingHasVisual: !!outgoingVisual,
        incomingHasVisual: !!incomingVisual,
      })
      return
    }

    window.hoverDebugger.addLog("DEBUG", "Starting FLIP animation", null, {
      outgoing: outgoing.classList.toString(),
      incoming: incoming.classList.toString(),
      outgoingVisualSize: outgoingVisual.getBoundingClientRect(),
      incomingVisualSize: incomingVisual.getBoundingClientRect(),
    })

    // Принудительно устанавливаем видимость и правильное позиционирование
    gsap.set([outgoingVisual, incomingVisual], {
      opacity: 1,
      visibility: "visible",
      clearProps: "all",
    })

    // Находим все родители с overflow: hidden
    const outgoingParents = findOverflowHiddenParents(outgoingVisual)
    const incomingParents = findOverflowHiddenParents(incomingVisual)
    const allParents = [...outgoingParents, ...incomingParents]

    // Временно отключаем overflow: hidden
    disableOverflowHidden(allParents)

    // Сохраняем оригинальные стили позиционирования
    const originalOutgoingStyle = {
      position: outgoingVisual.style.position,
      top: outgoingVisual.style.top,
      left: outgoingVisual.style.left,
      width: outgoingVisual.style.width,
      height: outgoingVisual.style.height,
      margin: outgoingVisual.style.margin,
    }

    const originalIncomingStyle = {
      position: incomingVisual.style.position,
      top: incomingVisual.style.top,
      left: incomingVisual.style.left,
      width: incomingVisual.style.width,
      height: incomingVisual.style.height,
      margin: incomingVisual.style.margin,
    }

    // Устанавливаем фиксированное позиционирование для точной анимации
    const outgoingRect = outgoingVisual.getBoundingClientRect()

    // Временно устанавливаем фиксированное позиционирование для outgoing элемента
    gsap.set(outgoingVisual, {
      position: "fixed",
      top: outgoingRect.top,
      left: outgoingRect.left,
      width: outgoingRect.width,
      height: outgoingRect.height,
      margin: 0,
      zIndex: 1000,
    })

    // Захватываем состояние ДО перемещения в DOM
    let state = Flip.getState(outgoingVisual, {
      props: "opacity,visibility,transform,width,height",
      simple: true,
    })

    // Удаляем контейнер из целевого элемента
    const existingIncomingVisual = incoming.querySelector(".visual")
    if (existingIncomingVisual) {
      existingIncomingVisual.remove()
    }

    // Восстанавливаем нормальное позиционирование перед перемещением
    gsap.set(outgoingVisual, {
      position: originalOutgoingStyle.position || "",
      top: originalOutgoingStyle.top || "",
      left: originalOutgoingStyle.left || "",
      width: originalOutgoingStyle.width || "",
      height: originalOutgoingStyle.height || "",
      margin: originalOutgoingStyle.margin || "",
    })

    // Добавляем контейнер в целевой элемент
    incoming.appendChild(outgoingVisual)

    // Получаем настройки анимации
    const duration = getDuration()
    const ease = getEase()

    // Улучшенная FLIP анимация с правильным позиционированием
    Flip.from(state, {
      duration: duration,
      ease: ease,
      simple: true,
      absolute: true,
      onComplete: () => {
        // Восстанавливаем оригинальные стили
        gsap.set(outgoingVisual, {
          position: originalOutgoingStyle.position || "",
          top: originalOutgoingStyle.top || "",
          left: originalOutgoingStyle.left || "",
          width: originalOutgoingStyle.width || "",
          height: originalOutgoingStyle.height || "",
          margin: originalOutgoingStyle.margin || "",
          clearProps: "transform,opacity,visibility,zIndex",
        })

        // Восстанавливаем overflow: hidden
        restoreOverflowHidden(allParents)

        window.hoverDebugger.addLog("DEBUG", "FLIP animation completed", outgoingVisual)
      },
      onStart: () => {
        // Убеждаемся, что элемент видим в начале анимации
        gsap.set(outgoingVisual, {
          opacity: 1,
          visibility: "visible",
          force3D: true,
        })
      },
      onUpdate: () => {
        // Поддерживаем видимость во время анимации
        gsap.set(outgoingVisual, {
          opacity: 1,
          visibility: "visible",
        })
      },
    })
  }

  // Функция для получения длительности анимации
  function getDuration() {
    if (!isDesktop()) {
      return 0
    }

    const cssDuration = getComputedStyle(document.documentElement).getPropertyValue("--animation-duration-medium").trim()
    let duration

    if (cssDuration) {
      if (cssDuration.includes("ms")) {
        duration = parseFloat(cssDuration) / 1000
      } else if (cssDuration.includes("s")) {
        duration = parseFloat(cssDuration)
      } else {
        duration = parseFloat(cssDuration)
      }
    } else {
      duration = 0.6
    }

    return duration
  }

  // Функция для получения easing функции
  function getEase() {
    if (!isDesktop()) {
      return "none"
    }

    const cssEase = getComputedStyle(document.documentElement).getPropertyValue("--animation-timing-function").trim()
    let ease

    if (cssEase) {
      ease = mapCssEaseToGsap(cssEase)
    } else {
      ease = "power2.out"
    }

    return ease
  }

  // Функция для преобразования CSS easing в GSAP ease
  function mapCssEaseToGsap(cssEase) {
    const easeMap = {
      ease: "power1.inOut",
      "ease-in": "power1.in",
      "ease-out": "power1.out",
      "ease-in-out": "power1.inOut",
      linear: "none",
    }
    return easeMap[cssEase] || cssEase
  }

  // НОВАЯ ФУНКЦИЯ: Анимация исчезновения как у slide элементов (замена FLIP)
  function animateSlideLikeDisappearance(element) {
    if (!element) return null

    window.hoverDebugger.addLog("DEBUG", "Starting slide-like disappearance animation", element)

    const duration = getDuration()
    const ease = getEase()

    return gsap.to(element, {
      y: "2rem",
      opacity: 0,
      duration: duration,
      ease: ease,
    })
  }

  // Остальные функции анимации
  function animateSplitElements(container, direction = "enter") {
    if (!isDesktop()) return null

    const splitEls = container.querySelectorAll('[data-barba-animation="split"]')
    if (!splitEls.length) return null

    const duration = getDuration()
    const ease = getEase()

    let allLineInners = []

    splitEls.forEach((element) => {
      const existingLineInners = element.querySelectorAll(".line-inner")
      if (existingLineInners.length > 0) {
        allLineInners.push(...existingLineInners)
        return
      }

      const text = element.textContent.trim()
      element.innerHTML = text

      if (window.SplitType) {
        try {
          SplitType.revert(element)
          const split = new SplitType(element, {
            types: "lines",
            lineClass: "line-mask",
          })

          if (split.lines && split.lines.length > 0) {
            split.lines.forEach((line) => {
              const inner = document.createElement("span")
              inner.className = "line-inner"
              inner.textContent = line.textContent

              gsap.set(inner, {
                y: direction === "enter" ? "-120%" : "0%",
                rotateZ: direction === "enter" ? 2 : 0,
              })

              line.innerHTML = ""
              line.appendChild(inner)
              allLineInners.push(inner)
            })
          }
        } catch (error) {
          console.error("SplitType error:", error)
        }
      }
    })

    if (!allLineInners.length) return null

    const fromVars = {
      y: direction === "enter" ? "-120%" : "0%",
      rotateZ: direction === "enter" ? 2 : 0,
    }

    const toVars = {
      y: direction === "enter" ? "0%" : "-120%",
      rotateZ: direction === "enter" ? 0 : -2,
      duration: duration,
      ease: ease,
      stagger: 0.05,
    }

    try {
      if (direction === "leave") {
        return gsap.to(allLineInners, toVars)
      } else {
        gsap.set(allLineInners, fromVars)
        return gsap.to(allLineInners, toVars)
      }
    } catch (error) {
      console.error("Split animation error:", error)
      return null
    }
  }

  function animateSlideElements(container, direction = "enter") {
    if (!isDesktop()) return null

    const slideEls = container.querySelectorAll('[data-barba-animation="slide"]')
    if (!slideEls.length) return null

    const duration = getDuration()
    const ease = getEase()

    const fromVars = {
      y: direction === "enter" ? "2rem" : "0rem",
      opacity: direction === "enter" ? 0 : 1,
    }

    const toVars = {
      y: direction === "enter" ? "0rem" : "2rem",
      opacity: direction === "enter" ? 1 : 0,
      duration: duration,
      ease: ease,
      stagger: 0.1,
    }

    try {
      if (direction === "leave") {
        return gsap.to(slideEls, toVars)
      } else {
        gsap.set(slideEls, fromVars)
        return gsap.to(slideEls, toVars)
      }
    } catch (error) {
      console.error("Slide animation error:", error)
      return null
    }
  }

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ: Анимация fade-delay элементов с одновременным исчезновением
  function animateFadeDelayElements(container, direction = "enter") {
    if (!isDesktop()) return null

    const fadeDelayEls = container.querySelectorAll('[data-barba-animation="fade-delay"]')
    if (!fadeDelayEls.length) return null

    const duration = getDuration()
    const ease = getEase()

    // ИЗМЕНЕНИЕ: Убрана задержка для обратной анимации (leave)
    const delay = direction === "enter" ? duration / 2 : 0

    const fromVars = {
      opacity: direction === "enter" ? 0 : 1,
    }

    const toVars = {
      opacity: direction === "enter" ? 1 : 0,
      duration: duration,
      ease: ease,
      delay: delay,
      // ИЗМЕНЕНИЕ: Убран stagger для обратной анимации, чтобы элементы исчезали одновременно
      stagger: direction === "enter" ? 0.1 : 0,
    }

    window.hoverDebugger.addLog("DEBUG", `Fade-delay animation: ${direction}`, null, {
      elementCount: fadeDelayEls.length,
      duration,
      delay,
      stagger: toVars.stagger,
    })

    try {
      if (direction === "leave") {
        return gsap.to(fadeDelayEls, toVars)
      } else {
        gsap.set(fadeDelayEls, fromVars)
        return gsap.to(fadeDelayEls, toVars)
      }
    } catch (error) {
      console.error("Fade-delay animation error:", error)
      return null
    }
  }

  function animateFadeElements(container, direction = "enter", excludeFlipItems = []) {
    if (!isDesktop()) {
      const fadeEls = []
      container.querySelectorAll('[data-barba-animation="fade"]').forEach((el) => {
        const isExcluded = excludeFlipItems.some(
          (flipItem) => flipItem && el.closest(".barba-card") === flipItem && el.classList.contains("visual"),
        )
        if (!isExcluded) {
          fadeEls.push(el)
        }
      })

      fadeEls.forEach((el) => {
        el.style.opacity = direction === "enter" ? "1" : "0"
      })
      return null
    }

    const fadeEls = []
    container.querySelectorAll('[data-barba-animation="fade"]').forEach((el) => {
      const isExcluded = excludeFlipItems.some(
        (flipItem) => flipItem && el.closest(".barba-card") === flipItem && el.classList.contains("visual"),
      )
      if (!isExcluded) {
        fadeEls.push(el)
      }
    })

    if (!fadeEls.length) {
      return null
    }

    const duration = getDuration()
    const ease = getEase()

    const fromVars = {
      opacity: direction === "enter" ? 0 : 1,
    }

    const toVars = {
      opacity: direction === "enter" ? 1 : 0,
      duration: duration,
      ease: ease,
    }

    fadeEls.forEach((el) => gsap.set(el, { willChange: "opacity" }))

    try {
      if (direction === "leave") {
        return gsap.to(fadeEls, toVars)
      } else {
        gsap.set(fadeEls, fromVars)
        return gsap.to(fadeEls, toVars)
      }
    } catch (error) {
      console.error("Fade animation error:", error)
      return null
    }
  }

  // НОВАЯ ФУНКЦИЯ: Анимация для fade-title элементов
  function animateFadeTitleElements(container, direction = "enter") {
    if (!isDesktop()) {
      const fadeTitleEls = container.querySelectorAll('[data-barba-animation="fade-title"]')
      fadeTitleEls.forEach((el) => {
        el.style.opacity = direction === "enter" ? "1" : "0"
      })
      return null
    }

    const fadeTitleEls = container.querySelectorAll('[data-barba-animation="fade-title"]')
    if (!fadeTitleEls.length) {
      return null
    }

    const duration = getDuration()
    const ease = getEase()

    // Для fade-title особая логика: при обратной анимации (product → catalog) делаем задержку
    const delay = direction === "enter" ? duration : 0

    const fromVars = {
      opacity: direction === "enter" ? 0 : 1,
    }

    const toVars = {
      opacity: direction === "enter" ? 1 : 0,
      duration: duration,
      ease: ease,
      delay: delay,
    }

    fadeTitleEls.forEach((el) => gsap.set(el, { willChange: "opacity" }))

    try {
      if (direction === "leave") {
        return gsap.to(fadeTitleEls, toVars)
      } else {
        gsap.set(fadeTitleEls, fromVars)
        return gsap.to(fadeTitleEls, toVars)
      }
    } catch (error) {
      console.error("Fade-title animation error:", error)
      return null
    }
  }

  // Добавление скриптов начало ==============================================
  // [01] Обновление счетчика проектов
  function updateProjectsCount() {
    // Используем безопасный вызов - проверяем наличие hoverDebugger
    if (window.hoverDebugger && window.hoverDebugger.addLog) {
      window.hoverDebugger.addLog("DEBUG", "Updating projects count")
    }

    // Находим все элементы с атрибутом [project]
    const projectElements = document.querySelectorAll("[project]")

    // Получаем количество элементов
    const projectsCount = projectElements.length

    // Находим все элементы [projects-count]
    const countElements = document.querySelectorAll("[projects-count]")

    countElements.forEach((element) => {
      // Находим самый дочерний элемент
      let deepestChild = element
      while (deepestChild.lastElementChild) {
        deepestChild = deepestChild.lastElementChild
      }

      // Обновляем textContent, оборачивая в скобки
      if (deepestChild) {
        deepestChild.textContent = `(${projectsCount})`
      }
    })

    // Безопасное логирование
    if (window.hoverDebugger && window.hoverDebugger.addLog) {
      window.hoverDebugger.addLog("DEBUG", `Projects count updated: ${projectsCount} projects found`)
    }
  }

  // [02] Реорганиацзия каталога + Анмиация
  function reorganizeAndScrollProjectItems() {
    function reorganizeProjectItems() {
      const container = document.querySelector(".page-projects__items")
      if (!container) return

      // Восстанавливаем исходную структуру перед применением изменений
      const existingColumns = container.querySelectorAll(".page-projects__column")
      if (existingColumns.length > 0) {
        // Собираем все элементы из колонок
        const allItems = []
        existingColumns.forEach((column) => {
          const items = Array.from(column.children)
          allItems.push(...items)
          column.remove()
        })

        // Возвращаем элементы обратно в контейнер
        allItems.forEach((item) => {
          container.appendChild(item)
        })
      }

      // Проверяем ширину экрана
      if (window.innerWidth < 992) return

      const items = Array.from(container.children)
      if (items.length === 0) return

      // Создаем колонки
      const column1 = document.createElement("div")
      const column2 = document.createElement("div")

      column1.className = "page-projects__column page-projects__column--odd"
      column2.className = "page-projects__column page-projects__column--even"

      // Распределяем элементы (1,3,5... в первую колонку, 2,4,6... во вторую)
      items.forEach((item, index) => {
        const clonedItem = item.cloneNode(true)

        // Добавляем класс project-card--active для элементов с классом project-card
        if (clonedItem.classList.contains("project-card")) {
          clonedItem.classList.add("project-card--active")
        } else {
          // Если у самого элемента нет класса project-card, ищем внутри
          const projectCards = clonedItem.querySelectorAll(".project-card")
          projectCards.forEach((card) => {
            card.classList.add("project-card--active")
          })
        }

        if (index % 2 === 0) {
          column1.appendChild(clonedItem)
        } else {
          column2.appendChild(clonedItem)
        }
      })

      // Очищаем контейнер и добавляем колонки
      container.innerHTML = ""
      container.appendChild(column1)
      container.appendChild(column2)

      // Инициализируем скролл-эффект для правой колонки
      initScrollEffect(container, column2)
    }

    // [03] Анмиация скрола каталога
    function initScrollEffect(container, column) {
      if (!container || !column) return

      const maxOffsetPercent = 40 // 40% от высоты viewport
      const fixedPositionTop = 14 * 16 // 14rem в пикселях
      const fixedDuration = 300 // 300ms фиксации

      let lastScrollY = window.scrollY
      let currentOffset = 0
      let scrollVelocity = 0
      let lastScrollTime = performance.now()
      let animationFrame
      let isScrolling = false
      let scrollTimeout
      let containerScrollRange = { start: 0, end: 0 }
      let fixedStartTime = 0
      let isFixed = false
      let fixedTargetOffset = 0

      function calculateMaxOffset() {
        return (window.innerHeight * maxOffsetPercent) / 100
      }

      function calculateContainerScrollRange() {
        const containerRect = container.getBoundingClientRect()
        const viewportHeight = window.innerHeight

        // Диапазон скролла когда контейнер виден в viewport
        containerScrollRange.start = containerRect.top + window.scrollY - viewportHeight
        containerScrollRange.end = containerRect.bottom + window.scrollY

        return containerScrollRange
      }

      function getScrollProgress() {
        const scrollY = window.scrollY
        const range = containerScrollRange.end - containerScrollRange.start

        if (range <= 0) return 0

        // Прогресс скролла от 0 до 1 в пределах контейнера
        const progress = (scrollY - containerScrollRange.start) / range
        return Math.max(0, Math.min(1, progress))
      }

      function shouldApplyFixedPosition() {
        const columnRect = column.getBoundingClientRect()
        return columnRect.top <= fixedPositionTop
      }

      function handleScroll() {
        if (window.innerWidth < 992) {
          column.style.transform = "none"
          return
        }

        const currentTime = performance.now()
        const scrollY = window.scrollY
        const scrollDelta = scrollY - lastScrollY
        const timeDelta = currentTime - lastScrollTime

        // Сбрасываем таймер остановки скролла
        clearTimeout(scrollTimeout)
        isScrolling = true

        // Проверяем, нужно ли применять фиксированную позицию
        const shouldFix = shouldApplyFixedPosition()

        if (shouldFix && !isFixed) {
          // Начинаем фиксацию
          isFixed = true
          fixedStartTime = currentTime
          fixedTargetOffset = currentOffset
        } else if (!shouldFix && isFixed) {
          // Заканчиваем фиксацию
          isFixed = false
          fixedStartTime = 0
        }

        if (isFixed) {
          // В режиме фиксации - сохраняем текущее смещение
          const fixedTimeElapsed = currentTime - fixedStartTime

          if (fixedTimeElapsed < fixedDuration) {
            // В течение 300ms сохраняем фиксированную позицию
            currentOffset = fixedTargetOffset
          } else {
            // После 300ms начинаем плавное восстановление
            const restoreProgress = Math.min((fixedTimeElapsed - fixedDuration) / 500, 1) // 500ms на восстановление
            const targetOffset = scrollVelocity * (calculateMaxOffset() / 10) * getScrollProgress()
            currentOffset = fixedTargetOffset + (targetOffset - fixedTargetOffset) * restoreProgress
          }
        } else {
          // Обычный режим - рассчитываем смещение на основе скорости скролла
          scrollVelocity = timeDelta > 0 ? scrollDelta / timeDelta : 0

          // Ограничиваем максимальную скорость
          const maxVelocity = 2
          scrollVelocity = Math.max(Math.min(scrollVelocity, maxVelocity), -maxVelocity)

          // Получаем прогресс скролла в пределах контейнера
          const scrollProgress = getScrollProgress()

          // Вычисляем целевое смещение на основе скорости скролла и прогресса
          const maxOffset = calculateMaxOffset()
          const baseTargetOffset = scrollVelocity * (maxOffset / 10)

          // Корректируем целевое смещение в зависимости от прогресса скролла
          const progressFactor = 1 - Math.abs(scrollProgress - 0.5) * 2
          const targetOffset = baseTargetOffset * progressFactor

          // Плавное приближение к целевому смещению
          const smoothingFactor = 0.1
          currentOffset += (targetOffset - currentOffset) * smoothingFactor

          // Ограничиваем максимальное смещение
          currentOffset = Math.max(Math.min(currentOffset, maxOffset), -maxOffset)
        }

        // Применяем трансформацию
        column.style.transform = `translateY(${currentOffset}px)`

        lastScrollY = scrollY
        lastScrollTime = currentTime

        // Устанавливаем таймер для определения окончания скролла
        scrollTimeout = setTimeout(() => {
          isScrolling = false
        }, 100)
      }

      function smoothUpdate() {
        // Если не скроллим, плавно возвращаем к нулю с учетом прогресса
        if (!isScrolling && !isFixed) {
          const scrollProgress = getScrollProgress()
          const returnSpeed = 0.05

          // В начале и конце контейнера ускоряем возврат к нулю
          const progressReturnFactor = 1 + (1 - Math.abs(scrollProgress - 0.5) * 2)
          const adjustedReturnSpeed = returnSpeed * progressReturnFactor

          currentOffset += (0 - currentOffset) * adjustedReturnSpeed

          // Если смещение очень близко к нулю, устанавливаем точно 0
          if (Math.abs(currentOffset) < 0.1) {
            currentOffset = 0
          }

          // Применяем трансформацию
          column.style.transform = `translateY(${currentOffset}px)`

          // Также плавно уменьшаем скорость
          scrollVelocity *= 0.95
        }

        animationFrame = requestAnimationFrame(smoothUpdate)
      }

      // Оптимизированный обработчик скролла
      let ticking = false
      function optimizedScroll() {
        if (!ticking) {
          animationFrame = requestAnimationFrame(() => {
            handleScroll()
            ticking = false
          })
          ticking = true
        }
      }

      // Обработчик ресайза для пересчета
      function handleResize() {
        calculateContainerScrollRange()
        const maxOffset = calculateMaxOffset()
        if (Math.abs(currentOffset) > maxOffset) {
          currentOffset = currentOffset > 0 ? maxOffset : -maxOffset
          column.style.transform = `translateY(${currentOffset}px)`
        }
      }

      // Инициализация расчетов
      calculateContainerScrollRange()

      // Запускаем плавное обновление
      smoothUpdate()

      // Инициализация событий
      window.addEventListener("scroll", optimizedScroll)
      window.addEventListener("resize", handleResize)

      // Сохраняем ссылки для очистки
      if (!window._projectScrollEffects) {
        window._projectScrollEffects = new Map()
      }
      window._projectScrollEffects.set(column, {
        cleanup: () => {
          window.removeEventListener("scroll", optimizedScroll)
          window.removeEventListener("resize", handleResize)
          clearTimeout(scrollTimeout)
          if (animationFrame) {
            cancelAnimationFrame(animationFrame)
          }
        },
      })
    }

    // Очистка всех скролл-эффектов
    function cleanupAllScrollEffects() {
      if (window._projectScrollEffects) {
        window._projectScrollEffects.forEach(({ cleanup }) => {
          cleanup()
        })
        window._projectScrollEffects.clear()
      }
    }

    // Debounce функция для оптимизации
    function debounce(func, wait) {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }

    // Обработчики событий
    const debouncedReorganize = debounce(function () {
      cleanupAllScrollEffects()
      reorganizeProjectItems()
    }, 250)

    window.addEventListener("load", reorganizeProjectItems)
    window.addEventListener("resize", debouncedReorganize)

    // Очистка при уничтожении страницы
    window.addEventListener("beforeunload", cleanupAllScrollEffects)
  }
  // Добавление скриптов конец ==============================================

  // Настройка Barba хуков с улучшенным управлением hover
  function setupBarbaHooks() {
    barba.hooks.before((data) => {
      window.barbaDebugger.currentTransition = {
        id: Date.now(),
        startTime: new Date().toISOString(),
        from: data.current?.namespace,
        to: data.next?.namespace,
        trigger: data.trigger?.tagName || data.trigger,
        logs: [],
      }

      if (window.hoverDebugger && window.hoverDebugger.addLog) {
        window.hoverDebugger.addLog("DEBUG", "Barba transition started", null, {
          from: data.current?.namespace,
          to: data.next?.namespace,
        })
      }
    })

    barba.hooks.beforeLeave((data) => {
      if (isDesktop()) {
        data.current.container.style.willChange = "opacity"
      }
    })

    barba.hooks.beforeEnter((data) => {
      // Принудительно показываем визуальные элементы
      const visuals = data.next.container.querySelectorAll(".visual")
      visuals.forEach((visual) => {
        gsap.set(visual, {
          opacity: 1,
          visibility: "visible",
          display: "block",
        })
      })

      if (isDesktop()) {
        data.current.container.style.zIndex = "1"
        data.next.container.style.zIndex = "2"
      }
    })

    barba.hooks.afterEnter((data) => {
      // Инициализация сторонних скриптов на новой странице =====================================
      updateProjectsCount()
      reorganizeAndScrollProjectItems()
      // setTimeout(() => {}, 10)
    })

    barba.hooks.after((data) => {
      if (isDesktop()) {
        data.next.container.classList.remove("fixed")
      }

      // Восстанавливаем data-barba-animation для ВСЕХ visual контейнеров КРОМЕ страницы продукта
      document.querySelectorAll(".visual").forEach((visual) => {
        // Не добавляем атрибут анимации для visual на странице продукта
        if (!visual.closest(".barba-product__img-wrp") && !visual.hasAttribute("data-barba-animation")) {
          visual.setAttribute("data-barba-animation", "fade")
        }
      })

      document.querySelectorAll(".active-flip-item").forEach((item) => {
        item.classList.remove("active-flip-item")
      })

      // Очищаем все состояния hover после завершения перехода
      clearAllCardHoverStates()

      window.scrollTo(0, 0)

      if (window.barbaDebugger.currentTransition) {
        window.barbaDebugger.currentTransition.endTime = new Date().toISOString()
        window.barbaDebugger.currentTransition.duration = new Date() - new Date(window.barbaDebugger.currentTransition.startTime)
      }

      if (window.hoverDebugger && window.hoverDebugger.addLog) {
        window.hoverDebugger.addLog("DEBUG", "Barba transition completed")
      }
    })
  }

  // Инициализация при загрузке страницы
  function initializePage() {
    // Сначала инициализируем hoverDebugger если он еще не инициализирован
    if (!window.hoverDebugger || typeof window.hoverDebugger.addLog !== "function") {
      console.warn("hoverDebugger not properly initialized, skipping debug logs")
    } else {
      window.hoverDebugger.addLog("DEBUG", "Page loaded, initializing")
    }

    // Запускаем проверку CSS transitions
    setTimeout(() => {
      checkCSSTransitions()
    }, 1000)

    // Инициализация сторонних скриптов при первой загрузке =====================================
    updateProjectsCount()
    reorganizeAndScrollProjectItems()

    // Инициализируем Barba если это desktop
    if (isDesktop() && typeof barba !== "undefined") {
      setupBarbaHooks()

      barba.init({
        preventRunning: true,
        transitions: [
          {
            sync: false,
            from: { namespace: ["catalog"] },
            to: { namespace: ["product"] },
            leave(data) {
              const productName = data.next.container.querySelector(".item-name").textContent.trim()
              const activeItem = getActiveCard(productName)

              // Сохраняем состояние hover для активной карточки
              if (activeItem) {
                if (window.hoverDebugger && window.hoverDebugger.addLog) {
                  window.hoverDebugger.addLog("DEBUG", "Catalog → Product: Setting hover state", activeItem)
                }
                setCardHoverState(activeItem, true)
              }

              const fadeAnimation = animateFadeElements(data.current.container, "leave", [activeItem])
              const splitAnimation = animateSplitElements(data.current.container, "leave")
              const slideAnimation = animateSlideElements(data.current.container, "leave")
              const fadeDelayAnimation = animateFadeDelayElements(data.current.container, "leave")
              const fadeTitleAnimation = animateFadeTitleElements(data.current.container, "leave")

              const tl = gsap.timeline()

              if (fadeAnimation) tl.add(fadeAnimation, 0)
              if (splitAnimation) tl.add(splitAnimation, 0)
              if (slideAnimation) tl.add(slideAnimation, 0)
              if (fadeDelayAnimation) tl.add(fadeDelayAnimation, 0)
              if (fadeTitleAnimation) tl.add(fadeTitleAnimation, 0)

              return new Promise((resolve) => {
                tl.eventCallback("onComplete", () => {
                  resolve()
                })
              })
            },
            enter(data) {
              if (isDesktop()) {
                data.next.container.classList.add("fixed")
              }

              const productName = data.next.container.querySelector(".item-name").textContent.trim()
              const activeItem = getActiveCard(productName)

              if (activeItem) {
                activeItem.classList.add("active-flip-item")
                const productImgWrap = data.next.container.querySelector(".barba-product__img-wrp")

                if (productImgWrap) {
                  // Устанавливаем hover состояние перед FLIP анимацией
                  setCardHoverStateForFlip(activeItem, true)
                  performFlip(activeItem, productImgWrap)
                }
              }

              // НЕ добавляем атрибут data-barba-animation для visual на странице продукта
              const visualContainer = data.next.container.querySelector(".barba-product__img-wrp .visual")
              if (visualContainer && isDesktop() && visualContainer.hasAttribute("data-barba-animation")) {
                visualContainer.removeAttribute("data-barba-animation")
              }

              const fadeAnimation = animateFadeElements(data.next.container, "enter")
              const splitAnimation = animateSplitElements(data.next.container, "enter")
              const slideAnimation = animateSlideElements(data.next.container, "enter")
              const fadeDelayAnimation = animateFadeDelayElements(data.next.container, "enter")
              const fadeTitleAnimation = animateFadeTitleElements(data.next.container, "enter")

              const tl = gsap.timeline()

              if (fadeAnimation) tl.add(fadeAnimation, 0)
              if (splitAnimation) tl.add(splitAnimation, 0)
              if (slideAnimation) tl.add(slideAnimation, 0)
              if (fadeDelayAnimation) tl.add(fadeDelayAnimation, 0)
              if (fadeTitleAnimation) tl.add(fadeTitleAnimation, 0)

              return tl
            },
          },
          {
            sync: false,
            from: { namespace: ["product"] },
            to: { namespace: ["catalog"] },
            leave(data) {
              return new Promise((resolve) => {
                const fadeAnimation = animateFadeElements(data.current.container, "leave")
                const splitAnimation = animateSplitElements(data.current.container, "leave")
                const slideAnimation = animateSlideElements(data.current.container, "leave")
                const fadeDelayAnimation = animateFadeDelayElements(data.current.container, "leave")
                const fadeTitleAnimation = animateFadeTitleElements(data.current.container, "leave")

                const tl = gsap.timeline()

                if (fadeAnimation) tl.add(fadeAnimation, 0)
                if (splitAnimation) tl.add(splitAnimation, 0)
                if (slideAnimation) tl.add(slideAnimation, 0)
                if (fadeDelayAnimation) tl.add(fadeDelayAnimation, 0)
                if (fadeTitleAnimation) tl.add(fadeTitleAnimation, 0)

                tl.eventCallback("onComplete", () => {
                  resolve()
                })
              })
            },
            enter(data) {
              if (isDesktop()) {
                data.next.container.classList.add("fixed")
              }

              let productName = data.current.container.querySelector(".item-name")?.textContent.trim()
              productName = normalizeText(productName)

              if (!productName) {
                const altSelectors = [".product-name", ".project-title", "h1", ".title", '[class*="title"]', '[class*="name"]']

                for (let selector of altSelectors) {
                  const element = data.current.container.querySelector(selector)
                  if (element && element.textContent.trim()) {
                    productName = normalizeText(element.textContent.trim())
                    break
                  }
                }
              }

              if (productName) {
                const activeItem = getActiveCard(productName)

                if (activeItem) {
                  activeItem.classList.add("active-flip-item")
                  const productImgWrap = data.current.container.querySelector(".barba-product__img-wrp")
                  const visualWrap = activeItem.querySelector(".visual_wrap") || activeItem.querySelector(".visual")?.parentElement

                  if (productImgWrap && visualWrap) {
                    if (window.hoverDebugger && window.hoverDebugger.addLog) {
                      window.hoverDebugger.addLog("DEBUG", "Product → Catalog: Starting transition", activeItem)
                    }

                    // ПРОВЕРКА ВИДИМОСТИ: определяем, нужно ли выполнять FLIP анимацию
                    const shouldFlip = shouldPerformFlipAnimation(productImgWrap, activeItem)

                    if (shouldFlip) {
                      // Выполняем стандартную FLIP анимацию
                      if (window.hoverDebugger && window.hoverDebugger.addLog) {
                        window.hoverDebugger.addLog("DEBUG", "Product → Catalog: Performing FLIP animation", activeItem)
                      }

                      // Устанавливаем hover состояние для FLIP анимации
                      setCardHoverStateForFlip(activeItem, true)

                      performFlip(productImgWrap, visualWrap)

                      // Плановый переход от hover к unhover после FLIP анимации
                      const animationDuration = getDuration() * 1000
                      if (window.hoverDebugger && window.hoverDebugger.addLog) {
                        window.hoverDebugger.addLog(
                          "DEBUG",
                          `Product → Catalog: Will animate to unhover in ${animationDuration}ms`,
                          activeItem,
                        )
                      }

                      setTimeout(() => {
                        if (window.hoverDebugger && window.hoverDebugger.addLog) {
                          window.hoverDebugger.addLog("DEBUG", "Product → Catalog: Animating to unhover state after FLIP", activeItem)
                        }
                        setCardHoverState(activeItem, false)
                      }, animationDuration)
                    } else {
                      // Картинка вне зоны видимости - используем анимацию исчезновения как у slide элементов
                      if (window.hoverDebugger && window.hoverDebugger.addLog) {
                        window.hoverDebugger.addLog(
                          "DEBUG",
                          "Product → Catalog: Image not visible, using slide-like disappearance",
                          activeItem,
                        )
                      }

                      // Сразу устанавливаем unhover состояние
                      setCardHoverState(activeItem, false)

                      // Анимируем исчезновение картинки продукта как slide элемент
                      const slideDisappearance = animateSlideLikeDisappearance(productImgWrap)

                      // Добавляем небольшую задержку для плавности
                      const animationDuration = getDuration() * 1000
                      setTimeout(() => {
                        if (window.hoverDebugger && window.hoverDebugger.addLog) {
                          window.hoverDebugger.addLog("DEBUG", "Product → Catalog: Slide disappearance completed", activeItem)
                        }
                      }, animationDuration)
                    }
                  } else {
                    // Если FLIP не выполнился, сразу устанавливаем unhover
                    if (window.hoverDebugger && window.hoverDebugger.addLog) {
                      window.hoverDebugger.addLog("DEBUG", "Product → Catalog: FLIP failed, setting unhover immediately", activeItem)
                    }
                    setCardHoverState(activeItem, false)
                  }
                }
              }

              const fadeAnimation = animateFadeElements(data.next.container, "enter")
              const splitAnimation = animateSplitElements(data.next.container, "enter")
              const slideAnimation = animateSlideElements(data.next.container, "enter")
              const fadeDelayAnimation = animateFadeDelayElements(data.next.container, "enter")
              const fadeTitleAnimation = animateFadeTitleElements(data.next.container, "enter")

              const tl = gsap.timeline()

              if (fadeAnimation) tl.add(fadeAnimation, 0)
              if (splitAnimation) tl.add(splitAnimation, 0)
              if (slideAnimation) tl.add(slideAnimation, 0)
              if (fadeDelayAnimation) tl.add(fadeDelayAnimation, 0)
              if (fadeTitleAnimation) tl.add(fadeTitleAnimation, 0)

              return tl
            },
          },
        ],
      })
    }
  }

  // Обработчик изменения размера окна
  let resizeTimeout
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(function () {
      if (!isDesktop()) {
        document.querySelectorAll("[data-barba-animation]").forEach((el) => {
          el.style.opacity = "1"
          el.style.transform = ""
        })

        // Очищаем hover состояния на мобильных устройствах
        clearAllCardHoverStates()
      }
    }, 250)
  })

  // Инициализация при загрузке DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage)
  } else {
    initializePage()
  }

