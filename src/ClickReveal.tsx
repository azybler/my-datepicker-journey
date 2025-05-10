import {
  useState,
  useEffect,
  Children,
  isValidElement,
  ReactElement,
  ReactNode,
} from 'react';
import styled from '@emotion/styled';

type Props = { children: ReactNode };
type ListElementProps = {
  children: ReactNode;
};

const RevealDiv = styled.div<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 300ms ease-in-out;
`;

const RevealLi = styled.li<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 300ms ease-in-out;
`;

const ClickReveal = ({ children }: Props) => {
  const raw = Children.toArray(children);
  const isList =
    raw.length === 1 &&
    isValidElement(raw[0]) &&
    typeof raw[0].type === 'string' &&
    ['ul', 'ol'].includes(raw[0].type as string);
  const items = isList
    ? Children.toArray(
        (raw[0] as ReactElement<ListElementProps>).props.children,
      ).filter((e) => e !== '\n')
    : raw;

  const [visibleCount, setVisibleCount] = useState(-1);
  useEffect(() => {
    const handle = () => setVisibleCount((c) => Math.min(c + 1, items.length));
    // Add the capture: true option to ensure this runs before React's event system
    document.addEventListener('click', handle);
    return () => document.removeEventListener('click', handle);
  }, [items.length]);

  return isList ? (
    <ul>
      {items.map((item, i) =>
        isValidElement(item) && item.type === 'li' ? (
          <RevealLi key={i} visible={i < visibleCount}>
            {(item as React.ReactElement<ListElementProps>).props.children}
          </RevealLi>
        ) : (
          <RevealDiv key={i} visible={i < visibleCount}>
            {item}
          </RevealDiv>
        ),
      )}
    </ul>
  ) : (
    <>
      {items.map((item, i) => (
        <RevealDiv key={i} visible={i < visibleCount}>
          {item}
        </RevealDiv>
      ))}
    </>
  );
};

export default ClickReveal;
