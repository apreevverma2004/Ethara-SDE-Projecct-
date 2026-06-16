import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const notify = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  return (
    <AppContext.Provider value={{ notification, notify }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
