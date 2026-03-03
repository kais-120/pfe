// theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      100: "#f7caca",
      500: "#e53e3e",
    },
  },
  fonts: {
    heading: "Arial, sans-serif",
    body: "Roboto, sans-serif",
  },
});

export default theme;
