import './globals.css';

export const metadata = {
  title: 'APEX GP — MotoGP Race Intelligence',
  description: 'MotoGP race intelligence dashboard: weather, rider profiles, race history and transparent forecasts.',
  applicationName: 'APEX GP'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
