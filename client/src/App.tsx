import './App.scss'
import AppRoutes from './routes/AppRoutes'
import { Toaster } from "@/components/ui/toaster"
function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <>
     <AppRoutes />
     <Toaster/>
    </>
  )
}

export default App
