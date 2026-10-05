import { Toaster } from "sonner"
import "./App.css"
import { RouterProvider } from "react-router"
import { router } from "./router"

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="bottom-right" />
    </>
  )
}

export default App
