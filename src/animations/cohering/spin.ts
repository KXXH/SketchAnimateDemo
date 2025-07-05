import { eases, waapi, type EasingParam } from "animejs";
import svgMatrixToMatrixString, {
  createRotateMatrix,
  createTranslateMatrix,
  createScaleMatrix,
  svgTransformOriginMatrix,
  multiplyMatrices
} from "../../utils";

export function spin(targets: SVGGraphicsElement, opts?: {
  rotate?: number;
  x?: number;
  y?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  repeatCount?: number;
  ease?: EasingParam;
}) {
  const {
    rotate = 360,
    x = 0,
    y = 0,
    scale = 1,
    duration = 1000,
    delay = 0,
    repeatCount = 1,
    ease = eases.out(1),
  } = opts ?? {};

  let combinedMatrix = createRotateMatrix(rotate);
  combinedMatrix = multiplyMatrices(combinedMatrix, createTranslateMatrix(x, y));
  combinedMatrix = multiplyMatrices(combinedMatrix, createScaleMatrix(scale, scale));

  if (targets.parentElement) {
    targets.parentElement.style.overflow = 'hidden';
  }

  const loop = repeatCount === -1 ? true : (repeatCount === 1 ? false : repeatCount * 2 - 1);

  return waapi.animate(targets, {
    transform: svgMatrixToMatrixString(combinedMatrix),
    loop,
    alternate: repeatCount !== 1,
    duration: duration,
    delay: delay,
    ease
  });
}