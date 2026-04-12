import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp } from 'antd'
import './index.css'
import App from './App.tsx'
import { StrictMode } from 'react'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AntdApp>
        <App />
      </AntdApp>
    </QueryClientProvider>
  </StrictMode>,
)
