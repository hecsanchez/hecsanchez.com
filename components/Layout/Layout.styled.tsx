import styled from 'styled-components';

export const Container = styled.div`
  min-height: 96vh;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  color: #2d2d3a;
  box-sizing: border-box;
  padding: 90px 20px;

  @media screen and (min-width: 700px) {
    margin: 20px;
    border: 5px solid #202020;
    padding: 90px;
  }

  h3 {
    font-size: 35px;
  }

  h4 {
    font-size: 1.3em;
    text-transform: uppercase;
    font-family: 'Avenir Next LT W01 Bold';
    letter-spacing: 1px;
    display: block;
    margin-top: 2.5em;
  }

  a {
    text-decoration: none;

    &:hover h2 {
      border-bottom: 2px solid #2d2d3a;
    }
  }
  time,
  span {
    font-family: 'Avenir Next LT W01 Demi';
  }

  time {
    text-transform: uppercase;
  }
`;

export const Content = styled.div`
  max-width: 700px;
  width: 95%;
  margin: 0 auto;

  .content {
    img {
      width: 140%;
      margin-left: -20%;
    }
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;

  p {
    margin-top: 0;
    display: flex;
    align-items: center;

    span {
      margin-right: 5px;
    }
  }

  img {
    width: 50px;
  }
`;
