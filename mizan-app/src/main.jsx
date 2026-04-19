import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { PortfolioProvider } from './context/PortfolioContext'
import { NGOProvider } from './context/NGOContext'
import { BorrowerProvider } from './context/BorrowerContext'
import { CommunityProvider } from './context/CommunityContext'
import { NGOPartnerProvider } from './context/NGOContext_Partner'
import { ToastProvider } from './components/borrower/NotificationToast'
import { router } from './routes'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppProvider>
    <NGOProvider>
      <PortfolioProvider>
        <BorrowerProvider>
          <CommunityProvider>
            <NGOPartnerProvider>
              <ToastProvider>
                <RouterProvider router={router} />
              </ToastProvider>
            </NGOPartnerProvider>
          </CommunityProvider>
        </BorrowerProvider>
      </PortfolioProvider>
    </NGOProvider>
  </AppProvider>,
)
