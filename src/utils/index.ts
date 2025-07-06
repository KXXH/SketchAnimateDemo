/**
 * 定义一个 2x3 矩阵的类型。
 * 对应 SVG 的 matrix(a, b, c, d, e, f)
 */
type SVGMatrix = [number, number, number, number, number, number]

/**
 * 矩阵乘法函数 (2x3 矩阵)
 * @param m1 第一个矩阵 [a1, b1, c1, d1, e1, f1]
 * @param m2 第二个矩阵 [a2, b2, c2, d2, e2, f2]
 * @returns 乘积矩阵
 *
 * 矩阵乘法规则：
 * |a1 c1 e1|   |a2 c2 e2|   |(a1*a2+c1*b2) (a1*c2+c1*d2) (a1*e2+c1*f2+e1)|
 * |b1 d1 f1| x |b2 d2 f2| = |(b1*a2+d1*b2) (b1*c2+d1*d2) (b1*e2+d1*f2+f1)|
 * |0  0  1 |   |0  0  1 |   |0             0             1             |
 */
export function multiplyMatrices(m1: SVGMatrix, m2: SVGMatrix): SVGMatrix {
  return [
    m1[0] * m2[0] + m1[2] * m2[1], // a
    m1[1] * m2[0] + m1[3] * m2[1], // b
    m1[0] * m2[2] + m1[2] * m2[3], // c
    m1[1] * m2[2] + m1[3] * m2[3], // d
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4], // e
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5], // f
  ]
}

/**
 * 将 translate(tx, ty) 转换为 matrix
 * @param tx x 轴平移量
 * @param ty y 轴平移量
 * @returns matrix 形式
 */
export function createTranslateMatrix(tx: number, ty: number): SVGMatrix {
  return [1, 0, 0, 1, tx, ty]
}

/**
 * 将 scale(sx, sy) 转换为 matrix (sy 默认为 sx)
 * @param sx x 轴缩放因子
 * @param sy y 轴缩放因子 (可选，默认为 sx)
 * @returns matrix 形式
 */
export function createScaleMatrix(sx: number, sy: number = sx): SVGMatrix {
  return [sx, 0, 0, sy, 0, 0]
}

/**
 * 将 rotate(angle) 转换为 matrix
 * @param angle 旋转角度 (度)
 * @returns matrix 形式
 */
export function createRotateMatrix(angle: number): SVGMatrix {
  const rad = angle * Math.PI / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return [cos, sin, -sin, cos, 0, 0]
}

/**
 * 计算 SVG 元素基于 transform-origin 字符串的绝对坐标。
 * @param svgElement SVG 元素
 * @param originStr transform-origin 字符串 (e.g., "50% 50%", "100px 200px", "0 100%")
 * @returns {x: number, y: number} 绝对坐标对象
 */
function calculateSvgOriginAbsoluteCoords(svgElement: SVGGraphicsElement, originStr: string): { x: number, y: number } {
  const bbox = svgElement.getBBox()
  let originX = 0
  let originY = 0

  const parts = originStr.split(' ').map(s => s.trim())
  // 如果只给了一个值，Y轴也用这个值
  const xPart = parts[0]
  const yPart = parts.length > 1 ? parts[1] : xPart

  // 解析 X 坐标
  if (xPart.endsWith('%')) {
    originX = bbox.x + bbox.width * (Number.parseFloat(xPart) / 100)
  }
  else if (xPart.endsWith('px')) {
    originX = bbox.x + Number.parseFloat(xPart)
  }
  else { // 默认用户单位
    originX = bbox.x + Number.parseFloat(xPart)
  }

  // 解析 Y 坐标
  if (yPart.endsWith('%')) {
    originY = bbox.y + bbox.height * (Number.parseFloat(yPart) / 100)
  }
  else if (yPart.endsWith('px')) {
    originY = bbox.y + Number.parseFloat(yPart)
  }
  else { // 默认用户单位
    originY = bbox.y + Number.parseFloat(yPart)
  }

  return { x: originX, y: originY }
}

/**
 * 辅助函数，生成 SVG 元素的 transform 字符串，支持自定义 transform-origin 并以 matrix 形式返回。
 * @param svgElement 要操作的 SVG 元素。
 * @param transformMatrix 一个 SVGMatrix 数组，表示要应用的变换 (e.g., createScaleMatrix(1.5), createRotateMatrix(45)).
 *                         注意：这里期望传入一个已转换为 matrix 形式的变换。
 * @param originString transform-origin 字符串 (e.g., "50% 50%", "0% 100%", "100 200").
 * @returns 拼接好的 transform matrix 字符串，可直接用于 SVG 元素的 'transform' 属性。
 */
export function svgTransformOriginMatrix(
  svgElement: SVGGraphicsElement,
  transformMatrix: SVGMatrix, // 期望传入一个 SVGMatrix
  originString: string, // e.g., "50% 50%" or "0 100%" or "100 200"
): string {
  const { x: cx, y: cy } = calculateSvgOriginAbsoluteCoords(svgElement, originString)

  // 1. 平移到原点
  const translateToOrigin = createTranslateMatrix(-cx, -cy)
  // 2. 应用变换 (用户传入的 transformMatrix)
  // 3. 平移回来
  const translateBack = createTranslateMatrix(cx, cy)

  // 合并矩阵: M_final = M_translate_to_origin * M_transform * M_translate_back_from_origin
  // 注意矩阵乘法的顺序，从右到左应用
  // m = translateBack * (transformMatrix * translateToOrigin)
  const tempMatrix = multiplyMatrices(transformMatrix, translateToOrigin)
  // const tempMatrix = transformMatrix;
  const finalMatrix = multiplyMatrices(translateBack, tempMatrix)

  // 将矩阵转换为 SVG matrix() 字符串格式
  return `matrix(${finalMatrix.join(',')})`
}

export default function svgMatrixToMatrixString(svgMatrix: SVGMatrix): string {
  return `matrix(${svgMatrix.join(',')})`
}
/*
// 示例用法 (假设你在 HTML 中有 SVG 元素):
// HTML:
// <svg width="200" height="200" style="border: 1px solid black;">
//   <rect id="myRect" x="50" y="50" width="100" height="80" fill="lightblue" />
// </svg>
// <button onclick="applyTransformMatrix()">Scale Matrix</button>

// JavaScript:
// import { svgTransformOriginMatrix, createScaleMatrix, createRotateMatrix } from './utils/index.ts';
// function applyTransformMatrix() {
//   const rect = document.getElementById('myRect') as unknown as SVGGraphicsElement;
//   if (rect) {
//     // 缩放，以元素的底部中心为原点，并输出 matrix 形式
//     const scaleMatrix = createScaleMatrix(1.5); // 创建一个缩放矩阵
//     const newTransform = svgTransformOriginMatrix(rect, scaleMatrix, "50% 100%");
//     rect.setAttribute('transform', newTransform);

//     // 旋转 45 度，以元素的中心为原点，并输出 matrix 形式
//     // const rotateMatrix = createRotateMatrix(45);
//     // const newRotateTransform = svgTransformOriginMatrix(rect, rotateMatrix, "50% 50%");
//     // rect.setAttribute('transform', newRotateTransform);
//   }
// }
*/
