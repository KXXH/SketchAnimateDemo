// explode.ts

export interface ExplodeOptions {
  /** 横向分割块数 */
  rows?: number
  /** 纵向分割块数 */
  cols?: number
  /** 动画持续时间，ms */
  duration?: number
  /** 动画完成后回调 */
  onComplete?: () => void
}

/**
 * shatter: 将指定 DOM 元素分割为碎片并播放爆炸解体效果
 * @param targets 目标 HTMLElement
 * @param options 配置项，包括 rows, cols, duration, onComplete
 */
export function shatter(
  targets: HTMLElement | null,
  options: ExplodeOptions = {},
): void {
  if (!targets)
    return

  const {
    rows = 8,
    cols = 8,
    duration = 1200,
    onComplete,
  } = options

  const rect = targets.getBoundingClientRect()
  const pieceWidth = rect.width / cols
  const pieceHeight = rect.height / rows
  const container = document.body
  const total = rows * cols
  let finished = 0

  // 使用 DocumentFragment 批量插入，提高性能
  const fragment = document.createDocumentFragment()

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const piece = document.createElement('div')
      Object.assign(piece.style, {
        position: 'absolute',
        overflow: 'hidden',
        width: `${pieceWidth}px`,
        height: `${pieceHeight}px`,
        left: `${rect.left + col * pieceWidth}px`,
        top: `${rect.top + row * pieceHeight}px`,
        pointerEvents: 'none',
      })

      // 克隆并裁剪
      const clone = targets.cloneNode(true) as HTMLElement
      Object.assign(clone.style, {
        position: 'absolute',
        marginLeft: `-${col * pieceWidth}px`,
        marginTop: `-${row * pieceHeight}px`,
        visibility: 'visible',
      })

      piece.appendChild(clone)
      fragment.appendChild(piece)

      // 随机方向与距离
      const angleRad = Math.random() * 2 * Math.PI
      const distance = 100 + Math.random() * 200
      const dx = Math.cos(angleRad) * distance
      const dy = Math.sin(angleRad) * distance
      const rotateDeg = (angleRad * 180) / Math.PI

      // Web Animations API
      piece.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rotateDeg}deg)`, opacity: 0 },
        ],
        { duration, easing: 'ease-out', fill: 'forwards' },
      ).onfinish = () => {
        piece.remove()
        if (++finished === total && onComplete)
          onComplete()
      }
    }
  }

  // 隐藏原始元素
  targets.style.visibility = 'hidden'
  container.appendChild(fragment)
}
