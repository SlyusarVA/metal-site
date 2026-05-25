'use client'

import { useEffect, useRef } from 'react'

interface AppDialogProps {
  open?: boolean
  titleId: string
  labelledBy?: string
  width?: number | string
  height?: number | string
  maxHeight?: number | string
  onClose: () => void
  children: React.ReactNode
}

export default function AppDialog({
  open = true,
  titleId,
  labelledBy,
  width = 540,
  height,
  maxHeight = '80vh',
  onClose,
  children,
}: AppDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open) return

    if (!dialog.open) dialog.showModal()

    function handleClose() {
      onClose()
    }

    function handleClick(event: MouseEvent) {
      // Fallback for Safari and other browsers without closedby support.
      if ('closedBy' in HTMLDialogElement.prototype) return
      if (event.target !== dialog) return

      const rect = dialog.getBoundingClientRect()
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      )

      if (!isDialogContent) dialog.close()
    }

    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('click', handleClick)

    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('click', handleClick)
      if (dialog.open) dialog.close()
    }
  }, [open, onClose])

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby={labelledBy ?? titleId}
      className="ui-dialog"
      style={{
        width,
        height,
        maxHeight,
      }}
    >
      {children}
    </dialog>
  )
}
