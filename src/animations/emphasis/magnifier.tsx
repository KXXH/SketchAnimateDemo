import React, { useEffect, useId, useRef, useState } from 'react'

export function MagnifierElement() {
  return (
    <svg width="0" height="0">
      <defs>
        <radialGradient
          id="radial-normal"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="50%"
        >
          <stop offset="0%" stop-color="rgb(128,128,255)" />
          <stop offset="100%" stop-color="rgb(  0,  0,255)" />
        </radialGradient>

        <g id="rect-normal">
          <rect width="100%" height="100%" fill="url(#radial-normal)" />
        </g>

        <filter
          id="zoom-bg"
          filterUnits="userSpaceOnUse"
          primitiveUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="100%"
          height="100%"
        >
          <feImage xlinkHref="#rect-normal" result="map" />
          <feDisplacementMap
            in="BackgroundImage"
            in2="map"
            scale="60"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}

interface MagnifierProps {
  /** 圆形直径，单位 px */
  size?: number
  /** 位移强度，对应 feDisplacementMap 的 scale 属性 */
  scale?: number
  /** 固定定位（css top/left），单位 px */
  top?: number
  left?: number
}

interface MagnifierProps {
  /** 圆形直径，单位 px */
  size?: number
  /** 位移强度，对应 feDisplacementMap 的 scale 属性 */
  scale?: number
  /** 初始距离视口顶部的像素值 */
  initialTop?: number
  /** 初始距离视口左侧的像素值 */
  initialLeft?: number
}

const Magnifier: React.FC<MagnifierProps> = ({
  size = 150,
  scale = 60,
  initialTop = 100,
  initialLeft = 100,
}) => {
  // 生成唯一 ID 避免多个实例冲突
  const id = useId().replace(/:/g, '-')
  const gradientId = `radial-normal-${id}`
  const rectId = `rect-normal-${id}`
  const filterId = `zoom-filter-${id}`

  // 拖拽状态和位置
  const [position, setPosition] = useState({ top: initialTop, left: initialLeft })
  const [dragging, setDragging] = useState(false)
  const offsetRef = useRef({ x: 0, y: 0 })

  // 鼠标按下开始拖拽，记录偏移量
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(true)
    offsetRef.current = {
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    }
  }

  // 在拖拽期间监听鼠标移动和抬起
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setPosition({
          left: e.clientX - offsetRef.current.x,
          top: e.clientY - offsetRef.current.y,
        })
      }
    }
    const handleMouseUp = () => {
      if (dragging)
        setDragging(false)
    }
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging])

  return (
    <>
      {/* 隐藏 SVG 定义 */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <radialGradient id={gradientId} gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(128,128,255)" />
            <stop offset="100%" stopColor="rgb(0,0,255)" />
          </radialGradient>
          <g id={rectId}>
            <rect width="100%" height="100%" fill={`url(#${gradientId})`} />
          </g>
          <filter
            id={filterId}
            filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100%"
            height="100%"
          >
            <feImage xlinkHref={`#${rectId}`} result="map" />
            <feDisplacementMap
              in="BackgroundImage"
              in2="map"
              scale={scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* 可拖拽的圆形放大镜 */}
      <div
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          width: size,
          height: size,
          borderRadius: '50%',
          pointerEvents: 'auto',
          filter: `url(#${filterId})`,
          cursor: dragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      />
    </>
  )
}

export default Magnifier
