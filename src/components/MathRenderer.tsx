"use client"

import { useEffect, useRef } from "react"

interface MathRendererProps {
  content: string
  className?: string
}

const MathRenderer = ({ content, className = "" }: MathRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const renderMath = async () => {
        if (!containerRef.current) return

        const katex = await import("katex")
        await import("katex/dist/katex.min.css")

        const container = containerRef.current
        container.innerHTML = content

        // Display math $$...$$
        const displayMathRegex = /\$\$(.*?)\$\$/gs
        container.innerHTML = container.innerHTML.replace(displayMathRegex, (match, math) => {
          try {
            return katex.default.renderToString(math.trim(), {
              displayMode: true,
              throwOnError: false,
            })
          } catch {
            return match
          }
        })

        // Inline math $...$
        const inlineMathRegex = /\$([^$]+)\$/g
        container.innerHTML = container.innerHTML.replace(inlineMathRegex, (match, math) => {
          try {
            return katex.default.renderToString(math.trim(), {
              displayMode: false,
              throwOnError: false,
            })
          } catch {
            return match
          }
        })

        // Inline math \(...\)
        const inlineParenRegex = /\\\((.*?)\\\)/gs
        container.innerHTML = container.innerHTML.replace(inlineParenRegex, (match, math) => {
          try {
            return katex.default.renderToString(math.trim(), {
              displayMode: false,
              throwOnError: false,
            })
          } catch {
            return match
          }
        })

        // Display math \[...\]
        const displayBracketRegex = /\\\[(.*?)\\\]/gs
        container.innerHTML = container.innerHTML.replace(displayBracketRegex, (match, math) => {
          try {
            return katex.default.renderToString(math.trim(), {
              displayMode: true,
              throwOnError: false,
            })
          } catch {
            return match
          }
        })
    }

    renderMath()
  }, [content])


  return <div ref={containerRef} className={`math-content ${className}`} style={{ lineHeight: "1.6" }} />
}

export default MathRenderer
