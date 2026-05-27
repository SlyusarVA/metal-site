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
  const generatedTitleId = useId()
  const titleId = labelledById ?? generatedTitleId

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (!dialog.open) dialog.showModal()

    function handleClose() {
      onClose()
    }

    function handleClick(event: MouseEvent) {
      if (!dialog || event.target !== dialog) return

      const rect = dialog.getBoundingClientRect()
      const insideDialog =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width

      if (!insideDialog) dialog.close()
    }

    dialog.addEventListener('close', handleClose)

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', handleClick)
    }

    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('click', handleClick)
      if (dialog.open) dialog.close()
    }
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      className="ui-dialog t-modal is-open"
      aria-labelledby={titleId}
      {...({ closedby: 'any' } as Record<string, string>)}
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
