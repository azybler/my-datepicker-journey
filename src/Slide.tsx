import { ReactNode } from 'react';
import styled from '@emotion/styled';

const SlideContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.primary};
  overflow: hidden;
`;

type SlideProps = {
  title?: string;
  children: ReactNode;
};

export const Slide = ({ children }: SlideProps) => (
  <SlideContainer className="slide">{children}</SlideContainer>
);
