import { useCallback, useState } from 'react';
import Intro from './components/Intro/Intro';

const KEY = 'locus-intro-seen';
const seen = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export default function App() {
  const [showIntro, setShowIntro] = useState(() => !seen());
  const onComplete = useCallback(() => {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {}
    setShowIntro(false);
  }, []);

  return (
    <>
      {showIntro && <Intro onComplete={onComplete} />}
      {/* inert: keep focus out of the page while the intro covers it */}
      <main className="home" inert={showIntro}>
        <h1>Locus</h1>
        <p>Home page placeholder.</p>
        <button type="button" className="replay" onClick={() => setShowIntro(true)}>
          Replay intro
        </button>
      </main>
    </>
  );
}
