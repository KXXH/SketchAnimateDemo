import type { EasingParam } from 'animejs'
import { eases, waapi } from 'animejs'
import { createScaleMatrix, svgTransformOriginMatrix } from '../../utils'

export function pulse(targets: SVGGraphicsElement, opts?: {
  sx?: number
  sy?: number
  duration?: number
  delay?: number
  repeatCount?: number
  ease?: EasingParam
}) {
  const {
    sx = 1.1,
    sy = 1.1,
    duration = 300,
    delay = 0,
    repeatCount = 3,
    ease = eases.out(2),
  } = opts ?? {}

  return waapi.animate(targets, {
    transform: svgTransformOriginMatrix(
      targets,
      createScaleMatrix(sx, sy),
      '50% 100%',
    ),
    loop: repeatCount * 2 - 1,
    alternate: true,
    duration,
    delay,
    ease,
  })
}
