'use client'

import { useEffect, useId, useRef } from 'react'

interface AppDialogProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: number | string
  height?: number | string
  maxWidth?: number | string
  labelledById?: string
}

export default function AppDialog({
  title,
  onClose,
  children,
  width = 540,
  height,
  maxWidth = '96vw',
  labelledById,
}: AppDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const onCloseRef = useRef(onClose)
  const generatedTitleId = useId()
  const titleId = labelledById ?? generatedTitleId

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    let closeTimer: number | null = null
    let openFrame: number | null = null

    function closeAfterTransition() {
      if (!dialog.open || dialog.classList.contains('is-closing')) return

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        dialog.close()
        return
      }

      dialog.classList.remove('is-open')
      dialog.classList.add('is-closing')
      const duration = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--modal-close-dur')
      ) || 150
      closeTimer = window.setTimeout(() => dialog.close(), duration)
    }

    if (!dialog.open) dialog.showModal()
    openFrame = requestAnimationFrame(() => {
      void dialog.offsetWidth
      dialog.classList.add('is-open')
    })

    function handleClose() {
      onCloseRef.current()
    }

    function handleCancel(event: Event) {
      event.preventDefault()
      closeAfterTransition()
    }

    function handleClick(event: MouseEvent) {
      const target = event.target as Element | null
      if (target?.closest('[data-dialog-close]')) {
        closeAfterTransition()
        return
      }
      if (event.target !== dialog) return

      const rect = dialog.getBoundingClientRect()
      const insideDialog =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width

      if (!insideDialog) closeAfterTransition()
    }

    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('cancel', handleCancel)
    dialog.addEventListener('click', handleClick)

    return () => {
      if (openFrame !== null) cancelAnimationFrame(openFrame)
      if (closeTimer !== null) window.clearTimeout(closeTimer)
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('cancel', handleCancel)
      dialog.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="ui-dialog t-modal"
      aria-labelledby={titleId}
      style={{
        width,
        height,
        maxWidth,
      }}
    >
      <span id={titleId} hidden>{title}</span>
      {children}
    </dialog>
  )
}
