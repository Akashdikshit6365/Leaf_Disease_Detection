import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollEffects() {
  const [progress, setProgress] = useState(0)
  const { pathname } = useLocation()

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setProgress(maxScroll > 0 ? Math.min(1, scrollTop / maxScroll) : 0)
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  useEffect(() => {
    const selector = '.motion-reveal, .enterprise-shell, .panel-luxe, .surface-card, .surface-card-dark'
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )

    const observeNodes = (root = document) => {
      root.querySelectorAll(selector).forEach((node) => {
        if (!node.classList.contains('is-visible')) observer.observe(node)
      })
    }

    observeNodes()
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return
          if (node.matches(selector) && !node.classList.contains('is-visible')) observer.observe(node)
          observeNodes(node)
        })
      })
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutationObserver.disconnect()
      observer.disconnect()
    }
  }, [pathname])

  return (
    <>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
      <div className="mobile-ambient-sweep" aria-hidden="true" />
    </>
  )
}
