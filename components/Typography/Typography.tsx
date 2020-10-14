import styled from 'styled-components';

interface TitleStyleProps {
  size?: 'md | lg';
}

export const Title = styled.h1<TitleStyleProps>`
  font-size: ${({ size }) => (size === 'lg' ? '100px' : '50px')};
  line-height: 1;
`;

export const Subtitle = styled.h2`
  size: 35px;
`;

export const Text = styled.div`
  size: 25px;
`;
