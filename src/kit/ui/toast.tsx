import type { ReactNode } from "react"
import { Toast } from "@base-ui/react/toast"
import { CircleAlert, CircleCheck, X } from "lucide-react"

// Transient feedback on Base UI Toast (SYS-03). Wrap the app in
// ToastProvider once; call useToast().add({ title, description, type,
// actionProps }) anywhere below it. An action such as Undo keeps the toast
// until it times out; F6 moves focus into the toast region.

const icons = {
  success: CircleCheck,
  error: CircleAlert,
} as const

function ToastProvider({
  children,
  timeout = 6000,
}: {
  children: ReactNode
  timeout?: number
}) {
  return (
    <Toast.Provider timeout={timeout} limit={3}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="toast-viewport" data-slot="toast-viewport">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}

function ToastList() {
  const { toasts } = Toast.useToastManager()

  return toasts.map((toast) => {
    const Icon =
      toast.type === "success" || toast.type === "error"
        ? icons[toast.type]
        : undefined

    return (
      <Toast.Root
        key={toast.id}
        toast={toast}
        className="toast"
        data-slot="toast"
        data-type={toast.type}
      >
        <Toast.Content className="toast-content">
          {Icon && <Icon className="toast-icon" aria-hidden="true" />}
          <div className="toast-text">
            <Toast.Title className="toast-title" />
            <Toast.Description className="toast-description" />
          </div>
          <Toast.Action className="toast-action" />
          <Toast.Close className="toast-close" aria-label="Dismiss">
            <X aria-hidden="true" />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    )
  })
}

export { ToastProvider }
