document.addEventListener("DOMContentLoaded", function () {
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
      if (clonedItem.classList.contains('project-card')) {
        clonedItem.classList.add('project-card--active')
      } else {
        // Если у самого элемента нет класса project-card, ищем внутри
        const projectCards = clonedItem.querySelectorAll('.project-card')
        projectCards.forEach(card => {
          card.classList.add('project-card--active')
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
})