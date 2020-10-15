import styled from 'styled-components';

export const Container = styled.div`
  margin: 20px;
  border: 5px solid #202020;
  min-height: 96vh;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  padding: 90px;
  color: #2d2d3a;
  box-sizing: border-box;

  h3 {
    font-size: 35px;
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
`;
