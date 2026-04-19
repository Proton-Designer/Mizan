import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentAccount, setCurrentAccount] = useState(null)
  const [demoUser, setDemoUser] = useState({
    name: 'Ayman',
    mosque: 'UT Austin MSA',
    streak: 23,
    totalDeployed: 1247,
    familiesHelped: 43
  })

  return (
    <AppContext.Provider value={{
      currentAccount,
      setCurrentAccount,
      demoUser,
      setDemoUser
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
