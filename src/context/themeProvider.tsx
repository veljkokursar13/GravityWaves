//themeProvider is a hook to provide theme context to the app
import { createContext, useContext, ReactNode, useMemo } from 'react';

type Colors = {
  background: string;
  backgroundGradientStart: string;
  backgroundGradientEnd: string;
  text: string;
  primary: string;
  accent: string;
  surface: string;
  error: string;
};

type Theme = {
  colors: Colors;
  spacing: (multiplier?: number) => number;
  radius: {
    small: number;
    default: number;
    large: number;
  };
};

const defaultTheme: Theme = {
  colors: {
    background: 'transparent',
    backgroundGradientStart: '#000000',
    backgroundGradientEnd: '#434343',
    text: '#ffffff',
    primary: '#06b6d4',
    accent: '#f59e0b',
    surface: '#1a1a1a',
    error: '#ef4444',
  },
  spacing: (m = 1) => 8 * m,
  radius: {
    small: 4,
    default: 8,
    large: 16,
  },
};

const ThemeContext = createContext<Theme>(defaultTheme);



export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo(() => defaultTheme, []);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
