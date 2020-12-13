import styled from 'styled-components';

interface TitleStyleProps {
  size?: 'md | lg';
  centered?: boolean;
}

export const Title = styled.h1<TitleStyleProps>`
  font-size: ${({ size }) => (size === 'lg' ? '40px' : '30px')};
  line-height: 1;
  text-align: ${({ centered }) => (centered ? 'center' : 'left')};
  margin-top: 0;
  margin-bottom: 16px;

  @media screen and (min-width: 700px) {
    font-size: ${({ size }) => (size === 'lg' ? '100px' : '68px')};
  }
`;

export const Subtitle = styled.h2`
  font-size: 25px;
  color: #2d2d3a;
  width: fit-content;
  border-bottom: 2px solid transparent;
  margin: 0.3em 0;
  transition: border-bottom 0.23s ease;

  @media screen and (min-width: 700px) {
    font-size: 35px;
  }
`;

export const Text = styled.div`
  p {
    font-size: 23px;
    line-height: 1.6;
    margin: 0 0 1.5em;

    @media screen and (min-width: 700px) {
      font-size: 23px;
    }

    img {
      box-shadow: 0 5px 25px #ebebeb;
    }
  }
  a {
    color: #fb8b23;
    cursor: pointer;

    &:hover {
      border-bottom: 2px solid #fb8b2350;
    }
  }
  li {
    font-size: 23px;
    line-height: 1.6;
    margin: 0 0 1.5em;
  }
`;

export const Caption = styled.span`
  font-family: 'Avenir Next LT W01 Demi';
  font-size: 16px;
  text-transform: uppercase;
  color: #21233260;
  letter-spacing: 1px;
  font-weight: 400;
`;
