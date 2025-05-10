import { ReactElement, useSyncExternalStore } from 'react';
import styled from '@emotion/styled';
import BackgroundCircles from './Background';

const DeckContainer = styled.div`
  box-sizing: border-box;
`;

const Nav = styled.nav`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  bottom: 1rem;
  right: 1rem;
  gap: 1rem;
  background-color: #333;

  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    background-color: #333;
    cursor: pointer;
  }

  button:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

type DeckProps = { slides: ReactElement[] };

export const Deck = ({ slides }: DeckProps) => {
  const current = useSyncExternalStore(
    (cb) => {
      window.addEventListener('popstate', cb);
      return () => window.removeEventListener('popstate', cb);
    },
    () => Number(new URLSearchParams(window.location.search).get('slide') || 0),
  );

  const goToSlide = (n: number): void => {
    const params = new URLSearchParams(window.location.search);
    params.set('slide', String(n));
    window.history.pushState(null, '', `?${params.toString()}`);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <DeckContainer>
      <BackgroundCircles currentSlide={current} totalSlides={slides.length} />
      {slides[current]}
      <Nav>
        <button
          onClick={() => goToSlide(Math.max(current - 1, 0))}
          disabled={current === 0}
        >
          ← Prev
        </button>
        <span>
          {current + 1}/{slides.length}
        </span>
        <button
          onClick={() => goToSlide(Math.min(current + 1, slides.length - 1))}
          disabled={current === slides.length - 1}
        >
          Next →
        </button>
      </Nav>
    </DeckContainer>
  );
};
