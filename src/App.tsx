import type { WAAPIAnimation } from 'animejs'
import type { ExampleD3BarChartHandle } from './components/ExampleD3BarChart'
import { useEffect, useRef } from 'react'
import { spin } from './animations/cohering/spin'
import { pulse } from './animations/emphasis/pulse'
import { shatter } from './animations/twist/shatter'
import ExampleD3BarChart from './components/ExampleD3BarChart'

function App() {
  const chartRef = useRef<ExampleD3BarChartHandle>(null)
  const spinAnimation = useRef<WAAPIAnimation | null>(null)
  const pulseAnimation = useRef<WAAPIAnimation | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      const svgElement = chartRef.current.getSvgElement()

      const currentRects = svgElement?.querySelectorAll('rect')
      // randomly pick one rect
      const rect = currentRects?.[Math.floor(Math.random() * currentRects.length)]

      if (svgElement) {
        spinAnimation.current = spin(svgElement, {
          rotate: 90,
          scale: 1.5,
          duration: 1000, // Add duration for clarity
        })
        spinAnimation.current.pause() // Pause the animation initially
      }
      if (rect) {
        pulseAnimation.current = pulse(rect, {
          duration: 300,
          repeatCount: 3,
        })
        pulseAnimation.current.pause() // Pause the animation initially
      }
    }
  }, [])

  const handleSpinClick = () => {
    spinAnimation.current?.play()
  }

  const handlePulseClick = () => {
    pulseAnimation.current?.play()
  }

  const handleShatterClick = () => {
    if (chartRef.current) {
      const svgElement = chartRef.current.getSvgElement()
      if (svgElement && svgElement.parentElement) {
        shatter(svgElement.parentElement, {
          duration: 1200,
          onComplete: () => {
            console.warn('Shatter animation complete!')
            // Optionally, re-render the chart or do something else after animation
          },
          rows: 16,
          cols: 16,
        })
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 text-white">
      <button
        className="mb-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        onClick={handleSpinClick}
      >
        播放 Spin 动画
      </button>
      <button
        className="mb-4 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        onClick={handlePulseClick}
      >
        播放 Pulse 动画
      </button>
      <button
        className="mb-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        onClick={handleShatterClick}
      >
        播放 Shatter 动画
      </button>
      <ExampleD3BarChart ref={chartRef} />
    </div>
  )
}

export default App
