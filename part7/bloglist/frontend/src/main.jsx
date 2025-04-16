import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import { NotificationContextProvider } from './contexts/NotificationContext'
import { UserContextProvider } from './contexts/UserContext'

import CssBaseline from '@mui/material/CssBaseline'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Router>
      <UserContextProvider>
        <NotificationContextProvider>
          <CssBaseline />
          <App />
        </NotificationContextProvider>
      </UserContextProvider>
    </Router>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
)
