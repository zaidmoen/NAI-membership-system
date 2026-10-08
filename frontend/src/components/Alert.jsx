import { AlertIcon } from './Icons'

export default function Alert({ children }) {
  return (
    <div className="alert" role="alert">
      <AlertIcon />
      <span>{children}</span>
    </div>
  )
}
