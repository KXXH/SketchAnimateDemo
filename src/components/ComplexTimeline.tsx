import * as anime from 'animejs'
import React, { useEffect, useRef, useState } from 'react'

interface ComplexTimelineProps {
  className?: string
}

interface ITimeline {
  /** 开始时间 */
  start: number
  /** 结束时间 */
  end: number
}

function timelineToArray(timeline: anime.Timeline): ITimeline[] {
  // 表示时间线组合的头部节点
  const head = timeline._head as any
  let cur = head
  const array = []
  while (cur) {
    // array.push(cur)
    array.push({
      // duration: cur.duration,
      // offset: cur._offset,
      start: cur._offset + cur._delay,
      end: cur._offset + cur._delay + cur.duration,
      // cur,
    })
    cur = cur._next
  }
  return array
}

const ComplexTimeline: React.FC<ComplexTimelineProps> = ({ className = '' }) => {
  interface IRowTimeline extends ITimeline {
    /** y轴上的行号，从0开始 */
    row: number
  }

  // 函数：检测重叠并分配行
  const distributeTimelinesIntoRows = (timelines: ITimeline[]): IRowTimeline[] => {
    // 按开始时间排序时间线，这有助于简化重叠检测
    const sortedTimelines = [...timelines].sort((a, b) => a.start - b.start)

    // 存储每行的结束时间，用于判断当前行是否可以放置新的时间线
    const rows: { endTime: number, timelines: IRowTimeline[] }[] = []
    const assignedTimelines: IRowTimeline[] = []

    sortedTimelines.forEach((timeline) => {
      let assignedRow = -1
      // 尝试找到一个现有行来放置当前时间线
      for (let i = 0; i < rows.length; i++) {
        // 如果当前时间线的开始时间晚于或等于该行的结束时间，则可以放置在该行
        if (timeline.start >= rows[i].endTime) {
          assignedRow = i
          break
        }
      }

      // 如果没有找到合适的行，则创建新行
      if (assignedRow === -1) {
        assignedRow = rows.length
        rows.push({ endTime: 0, timelines: [] })
      }

      // 更新该行的结束时间
      rows[assignedRow].endTime = timeline.end
      // 将时间线分配到该行
      const timelineWithRow = { ...timeline, row: assignedRow }
      rows[assignedRow].timelines.push(timelineWithRow)
      assignedTimelines.push(timelineWithRow)
    })

    return assignedTimelines
  }
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<any>(null)
  const [visualTimeline, setVisualTimeline] = useState<
    Array<IRowTimeline & { left: string, width: string, color: string }>
  >([])
  const [isDragging, setIsDragging] = useState(false)
  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const [currentTimePosition, setCurrentTimePosition] = useState('0%')
  const [maxRow, setMaxRow] = useState(0) // 用于存储最大行数

  useEffect(() => {
    if (!containerRef.current || !timelineContainerRef.current)
      return

    // 创建复杂的时间线
    const timeline = anime.createTimeline({
      // easing: 'easeInOutQuad',
      duration: 800,
      loop: true,
      autoplay: true,
    })

    // 获取所有动画元素
    const elements = containerRef.current.querySelectorAll('.animate-item')

    timeline.add(elements, {
      x: 100,
      duration: 300,
      delay: anime.stagger(100),
    })

    timeline.add(elements, {
      y: 100,
      duration: 300,
      delay: anime.stagger(100),
    })

    timeline.add(elements, {
      rotate: 360,
      duration: 300,
      delay: anime.stagger(100),
    })

    timeline.add(elements, {
      scale: 1.5,
      duration: 300,
      delay: anime.stagger(100),
    })

    timeline.add(elements, {
      x: 0,
      y: 0,
      duration: 300,
      delay: 200,
      // delay: anime.stagger(100),
    })

    timeline.add(elements, {
      scale: 1,
      duration: 300,
      delay: -200,
      // delay: anime.stagger(100),
    })

    // timeline.add(elements, {
    //   opacity: 1,
    //   duration: 300,
    //   loop: 4,
    //   alternate: true,
    //   delay: anime.stagger(100),
    // })

    animationRef.current = timeline
    const rawTimeline = timelineToArray(timeline)
    const processedTimelines = distributeTimelinesIntoRows(rawTimeline)

    const totalDuration = processedTimelines.reduce((max, item) => Math.max(max, item.end), 0)
    const colors = [
      '#FF5733',
      '#33FF57',
      '#3357FF',
      '#FF33A1',
      '#A133FF',
      '#33FFF5',
      '#FF8F33',
      '#8FFF33',
    ]

    const visualData = processedTimelines.map((item, index) => {
      const left = (item.start / totalDuration) * 100
      const width = ((item.end - item.start) / totalDuration) * 100
      return {
        ...item,
        left: `${left}%`,
        width: `${width}%`,
        color: colors[index % colors.length],
      }
    })
    // 计算最大行数，用于设置时间轴容器的高度
    // const maxRow = processedTimelines.reduce((max, item) => Math.max(max, item.row), 0)
    // 根据实际行数调整时间轴容器的高度

    setVisualTimeline(visualData)
    const calculatedMaxRow = visualData.reduce((max, item) => Math.max(max, item.row), 0)
    setMaxRow(calculatedMaxRow)

    // 清理函数
    return () => {
      if (animationRef.current) {
        animationRef.current.pause()
        animationRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    let animationFrameId: number

    const animate = () => {
      if (animationRef.current && visualTimeline.length > 0) {
        const totalDuration = visualTimeline.reduce((max, item) => Math.max(max, item.end), 0)
        const currentTime = animationRef.current.currentTime
        const percentage = (currentTime / totalDuration) * 100
        setCurrentTimePosition(`${percentage}%`)
      }
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [visualTimeline]) // Add visualTimeline as a dependency

  useEffect(() => {
    const timelineContainer = timelineContainerRef.current
    if (!timelineContainer)
      return

    const handleSeek = (e: PointerEvent) => {
      if (!timelineContainer || !animationRef.current)
        return
      const rect = timelineContainer.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      const totalDuration = visualTimeline.reduce((max, item) => Math.max(max, item.end), 0)
      const seekTime = percentage * totalDuration
      animationRef.current.seek(seekTime)
    }

    const handlePointerDown = (e: PointerEvent) => {
      setIsDragging(true)
      if (animationRef.current) {
        animationRef.current.pause()
      }
      handleSeek(e)
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        handleSeek(e)
      }
    }

    const handlePointerUp = () => {
      setIsDragging(false)
      // Optionally, resume animation after drag ends
      // if (animationRef.current) {
      //   animationRef.current.play()
      // }
    }

    timelineContainer.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      timelineContainer.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, visualTimeline])

  const handlePlay = () => {
    if (animationRef.current) {
      animationRef.current.restart()
    }
  }

  const handlePause = () => {
    if (animationRef.current) {
      animationRef.current.pause()
    }
  }

  const handleReverse = () => {
    if (animationRef.current) {
      animationRef.current.reverse()
    }
  }

  const handleTimelinePointerDown = () => {
    animationRef.current.pause()
  }

  return (
    <div className={`flex flex-col items-center gap-8 p-8 ${className}`}>
      <div className="mb-4 flex gap-4">
        <button
          onClick={handlePlay}
          className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          播放
        </button>
        <button
          onClick={handlePause}
          className="rounded bg-yellow-500 px-4 py-2 text-white transition-colors hover:bg-yellow-600"
        >
          暂停
        </button>
        <button
          onClick={handleReverse}
          className="rounded bg-purple-500 px-4 py-2 text-white transition-colors hover:bg-purple-600"
        >
          反向
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative h-96 w-full flex items-center justify-center"
      >
        {[...Array.from({ length: 8 })].map((_, index) => (
          <div
            key={index}
            className="animate-item h-16 w-16 flex items-center justify-center rounded-lg text-lg text-white font-bold shadow-lg"
            style={{
              backgroundColor: `hsl(${index * 45}, 70%, 50%)`,
              // transform: 'translate(-50%, -50%)',
            }}
          >
            {index + 1}
          </div>
        ))}
      </div>

      <div className="text-center text-gray-600">
        <p className="text-sm">复杂时间线动画演示</p>
        <p className="mt-2 text-xs">包含进入、波浪、旋转、脉冲、分散、汇聚等多种效果</p>
      </div>

      <div
        ref={timelineContainerRef}
        className="relative w-full cursor-pointer border border-gray-300"
        style={{ height: `${(maxRow + 1) * 24 + 10}px` }} // 根据最大行数动态设置高度，每行高24px，加上10px的padding
      >
        {visualTimeline.map((item, index) => (
          <div
            key={index}
            className="absolute box-border h-6 border-rounded border-solid opacity-70"
            style={{
              left: item.left,
              width: item.width,
              backgroundColor: item.color,
              top: `${item.row * 24}px`, // 根据行号设置垂直位置
            }}
          >
          </div>
        ))}
        <div
          className="absolute bottom-0 top-0 z-10 w-0.5 bg-red-500"
          style={{ left: currentTimePosition, mixBlendMode: 'difference' }}
        >
        </div>
      </div>
    </div>
  )
}

export default ComplexTimeline
