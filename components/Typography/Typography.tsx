import styled from 'styled-components';

interface TitleStyleProps {
  size?: 'md | lg';
  centered?: boolean;
}

export const Title = styled.h1<TitleStyleProps>`
  font-size: ${({ size }) => (size === 'lg' ? '100px' : '70px')};
  line-height: 1;
  text-align: ${({ centered }) => (centered ? 'center' : 'left')};
  margin-top: 0;
  margin-bottom: 16px;
`;

export const Subtitle = styled.h2`
  font-size: 35px;
  color: #2d2d3a;
  width: fit-content;
  border-bottom: 2px solid transparent;
  margin: 0.3em 0;
  transition: all 0.23s ease;
`;

export const Text = styled.div`
  p {
    font-size: 25px;
    line-height: 1.4;
    margin-top: 0;
    margin-bottom: 1em;
  }
  a {
    color: #fb8b23;
    cursor: pointer;

    &:hover {
      border-bottom: 2px solid #fb8b2350;
    }
  }
`;

export const Caption = styled.span`
  font-family: 'Avenir Next LT W01 Demi';
  font-size: 16px;
  text-transform: uppercase;
  color: #ff9000;
  letter-spacing: 1px;
  font-weight: 400;
`;
